import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/preorder_model.dart';

class PreOrderService {
  PreOrderService._();

  static final PreOrderService instance = PreOrderService._();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final FirebaseAuth _auth = FirebaseAuth.instance;

  static const String preOrdersCollection = 'preorders';
  static const String productsCollection = 'products';

  CollectionReference<Map<String, dynamic>> get _preOrdersReference {
    return _firestore.collection(preOrdersCollection);
  }

  CollectionReference<Map<String, dynamic>> get _productsReference {
    return _firestore.collection(productsCollection);
  }

  /// Creates a new customer pre-order.
  ///
  /// The product's pre-order booked quantity is incremented in the same
  /// transaction to reduce overbooking risk.
  Future<String> createPreOrder(
      PreOrderModel preOrder, {
        bool validateAuthenticatedUser = true,
      }) async {
    final User? user = _auth.currentUser;

    if (validateAuthenticatedUser && user == null) {
      throw const PreOrderServiceException(
        message: 'Please login before placing a pre-order.',
        code: 'unauthenticated',
      );
    }

    final String userId = user?.uid ?? preOrder.userId.trim();

    if (userId.isEmpty) {
      throw const PreOrderServiceException(
        message: 'Customer user ID is required.',
        code: 'missing-user-id',
      );
    }

    _validatePreOrder(preOrder);

    final DocumentReference<Map<String, dynamic>> preOrderReference =
    _preOrdersReference.doc();

    final DateTime now = DateTime.now();

    final PreOrderModel normalizedPreOrder = preOrder.copyWith(
      id: preOrderReference.id,
      userId: userId,
      status: preOrder.status.trim().isEmpty
          ? 'pending'
          : preOrder.status.trim(),
      paymentStatus: preOrder.paymentStatus.trim().isEmpty
          ? 'pending'
          : preOrder.paymentStatus.trim(),
      createdAt: preOrder.createdAt,
      updatedAt: now,
      totalPrice: preOrder.effectiveTotalPrice,
    );

    final DocumentReference<Map<String, dynamic>> productReference =
    _productsReference.doc(normalizedPreOrder.productId);

    try {
      await _firestore.runTransaction(
            (Transaction transaction) async {
          final DocumentSnapshot<Map<String, dynamic>> productSnapshot =
          await transaction.get(productReference);

          if (productSnapshot.exists && productSnapshot.data() != null) {
            final Map<String, dynamic> productData =
            productSnapshot.data()!;

            final bool preOrderAvailable =
                productData['preOrderAvailable'] == true;

            if (!preOrderAvailable) {
              throw const PreOrderServiceException(
                message: 'Pre-order is not available for this product.',
                code: 'preorder-unavailable',
              );
            }

            final int maximumQuantity =
            _positiveIntValue(
              productData['maximumPreOrderQuantity'],
              fallback: 10,
            );

            final int minimumQuantity =
            _positiveIntValue(
              productData['minimumPreOrderQuantity'],
              fallback: 1,
            );

            final int bookedQuantity =
            _intValue(
              productData['preOrderBookedQuantity'],
            );

            final int remainingQuantity =
                maximumQuantity - bookedQuantity;

            if (normalizedPreOrder.quantity < minimumQuantity) {
              throw PreOrderServiceException(
                message:
                'Minimum pre-order quantity is $minimumQuantity.',
                code: 'minimum-quantity-not-met',
              );
            }

            if (normalizedPreOrder.quantity > remainingQuantity) {
              throw PreOrderServiceException(
                message:
                'Only $remainingQuantity pre-order slots are available.',
                code: 'insufficient-preorder-capacity',
              );
            }

            transaction.set(
              productReference,
              <String, dynamic>{
                'preOrderBookedQuantity':
                bookedQuantity + normalizedPreOrder.quantity,
                'updatedAt': FieldValue.serverTimestamp(),
              },
              SetOptions(merge: true),
            );
          }

          transaction.set(
            preOrderReference,
            <String, dynamic>{
              ...normalizedPreOrder.toMap(),
              'createdAt': FieldValue.serverTimestamp(),
              'updatedAt': FieldValue.serverTimestamp(),
            },
          );
        },
      );

      return preOrderReference.id;
    } on PreOrderServiceException {
      rethrow;
    } on FirebaseException catch (error) {
      throw PreOrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    } catch (error) {
      throw PreOrderServiceException(
        message: 'Unable to place pre-order. Please try again.',
        code: 'create-failed',
        originalError: error,
      );
    }
  }

  /// Real-time stream of all pre-orders for one customer.
  Stream<List<PreOrderModel>> watchUserPreOrders(
      String userId, {
        int limit = 100,
      }) {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return Stream<List<PreOrderModel>>.value(
        const <PreOrderModel>[],
      );
    }

    return _preOrdersReference
        .where('userId', isEqualTo: cleanUserId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<PreOrderModel> preOrders = snapshot.docs
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return PreOrderModel.fromMap(
              document.data(),
              documentId: document.id,
            );
          },
        )
            .toList();

        preOrders.sort(
              (PreOrderModel first, PreOrderModel second) {
            return second.createdAt.compareTo(first.createdAt);
          },
        );

        return preOrders.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Real-time stream for the currently logged-in customer.
  Stream<List<PreOrderModel>> watchCurrentUserPreOrders({
    int limit = 100,
  }) {
    final User? user = _auth.currentUser;

    if (user == null) {
      return Stream<List<PreOrderModel>>.value(
        const <PreOrderModel>[],
      );
    }

    return watchUserPreOrders(
      user.uid,
      limit: limit,
    );
  }

  /// Real-time active pre-orders for one customer.
  Stream<List<PreOrderModel>> watchActiveUserPreOrders(
      String userId, {
        int limit = 100,
      }) {
    return watchUserPreOrders(
      userId,
      limit: limit,
    ).map(
          (List<PreOrderModel> preOrders) {
        return preOrders
            .where((PreOrderModel preOrder) => preOrder.isActive)
            .toList();
      },
    );
  }

  /// Real-time completed pre-orders for one customer.
  Stream<List<PreOrderModel>> watchCompletedUserPreOrders(
      String userId, {
        int limit = 100,
      }) {
    return watchUserPreOrders(
      userId,
      limit: limit,
    ).map(
          (List<PreOrderModel> preOrders) {
        return preOrders
            .where((PreOrderModel preOrder) => preOrder.isCompleted)
            .toList();
      },
    );
  }

  /// Real-time pre-orders assigned to one farmer.
  Stream<List<PreOrderModel>> watchFarmerPreOrders(
      String farmerId, {
        int limit = 100,
      }) {
    final String cleanFarmerId = farmerId.trim();

    if (cleanFarmerId.isEmpty) {
      return Stream<List<PreOrderModel>>.value(
        const <PreOrderModel>[],
      );
    }

    return _preOrdersReference
        .where('farmerId', isEqualTo: cleanFarmerId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<PreOrderModel> preOrders = snapshot.docs
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return PreOrderModel.fromMap(
              document.data(),
              documentId: document.id,
            );
          },
        )
            .toList();

        preOrders.sort(
              (PreOrderModel first, PreOrderModel second) {
            return first.expectedDeliveryDate.compareTo(
              second.expectedDeliveryDate,
            );
          },
        );

        return preOrders.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Real-time active pre-orders for one farmer.
  Stream<List<PreOrderModel>> watchActiveFarmerPreOrders(
      String farmerId, {
        int limit = 100,
      }) {
    return watchFarmerPreOrders(
      farmerId,
      limit: limit,
    ).map(
          (List<PreOrderModel> preOrders) {
        return preOrders
            .where((PreOrderModel preOrder) => preOrder.isActive)
            .toList();
      },
    );
  }

  /// Real-time pre-orders for a product.
  Stream<List<PreOrderModel>> watchProductPreOrders(
      String productId, {
        int limit = 100,
      }) {
    final String cleanProductId = productId.trim();

    if (cleanProductId.isEmpty) {
      return Stream<List<PreOrderModel>>.value(
        const <PreOrderModel>[],
      );
    }

    return _preOrdersReference
        .where('productId', isEqualTo: cleanProductId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<PreOrderModel> preOrders = snapshot.docs
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return PreOrderModel.fromMap(
              document.data(),
              documentId: document.id,
            );
          },
        )
            .toList();

        preOrders.sort(
              (PreOrderModel first, PreOrderModel second) {
            return second.createdAt.compareTo(first.createdAt);
          },
        );

        return preOrders.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Returns one pre-order in real time.
  Stream<PreOrderModel?> watchPreOrderById(String preOrderId) {
    final String cleanPreOrderId = preOrderId.trim();

    if (cleanPreOrderId.isEmpty) {
      return Stream<PreOrderModel?>.value(null);
    }

    return _preOrdersReference.doc(cleanPreOrderId).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> snapshot) {
        if (!snapshot.exists || snapshot.data() == null) {
          return null;
        }

        return PreOrderModel.fromMap(
          snapshot.data()!,
          documentId: snapshot.id,
        );
      },
    );
  }

  /// Returns one pre-order once.
  Future<PreOrderModel?> getPreOrderById(String preOrderId) async {
    final String cleanPreOrderId = preOrderId.trim();

    if (cleanPreOrderId.isEmpty) {
      return null;
    }

    try {
      final DocumentSnapshot<Map<String, dynamic>> snapshot =
      await _preOrdersReference.doc(cleanPreOrderId).get();

      if (!snapshot.exists || snapshot.data() == null) {
        return null;
      }

      return PreOrderModel.fromMap(
        snapshot.data()!,
        documentId: snapshot.id,
      );
    } on FirebaseException catch (error) {
      throw PreOrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Updates only selected fields of a pre-order.
  Future<void> updatePreOrderFields({
    required String preOrderId,
    required Map<String, dynamic> fields,
  }) async {
    final String cleanPreOrderId = preOrderId.trim();

    if (cleanPreOrderId.isEmpty) {
      throw const PreOrderServiceException(
        message: 'Pre-order ID is required.',
        code: 'missing-preorder-id',
      );
    }

    if (fields.isEmpty) {
      return;
    }

    final Map<String, dynamic> data =
    Map<String, dynamic>.from(fields);

    data['updatedAt'] = FieldValue.serverTimestamp();

    try {
      await _preOrdersReference.doc(cleanPreOrderId).set(
        data,
        SetOptions(merge: true),
      );
    } on FirebaseException catch (error) {
      throw PreOrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Updates one pre-order status.
  Future<void> updateStatus({
    required String preOrderId,
    required String status,
    String farmerNote = '',
  }) async {
    final String cleanStatus =
    status.trim().toLowerCase().replaceAll(' ', '_');

    if (cleanStatus.isEmpty) {
      throw const PreOrderServiceException(
        message: 'Pre-order status is required.',
        code: 'missing-status',
      );
    }

    final Map<String, dynamic> fields = <String, dynamic>{
      'status': cleanStatus,
    };

    if (farmerNote.trim().isNotEmpty) {
      fields['farmerNote'] = farmerNote.trim();
    }

    await updatePreOrderFields(
      preOrderId: preOrderId,
      fields: fields,
    );
  }

  Future<void> markConfirmed(
      String preOrderId, {
        String farmerNote = '',
      }) async {
    await updateStatus(
      preOrderId: preOrderId,
      status: 'confirmed',
      farmerNote: farmerNote,
    );
  }

  Future<void> markHarvestReady(
      String preOrderId, {
        String farmerNote = '',
      }) async {
    await updateStatus(
      preOrderId: preOrderId,
      status: 'harvest_ready',
      farmerNote: farmerNote,
    );
  }

  Future<void> markPacked(
      String preOrderId, {
        String farmerNote = '',
      }) async {
    await updateStatus(
      preOrderId: preOrderId,
      status: 'packed',
      farmerNote: farmerNote,
    );
  }

  Future<void> markOutForDelivery(
      String preOrderId, {
        String farmerNote = '',
      }) async {
    await updateStatus(
      preOrderId: preOrderId,
      status: 'out_for_delivery',
      farmerNote: farmerNote,
    );
  }

  Future<void> markDelivered(
      String preOrderId, {
        String farmerNote = '',
      }) async {
    await updateStatus(
      preOrderId: preOrderId,
      status: 'delivered',
      farmerNote: farmerNote,
    );
  }

  /// Cancels a pre-order and returns reserved quantity to the product.
  Future<void> cancelPreOrder({
    required String preOrderId,
    required String reason,
  }) async {
    final String cleanPreOrderId = preOrderId.trim();
    final String cleanReason = reason.trim();

    if (cleanPreOrderId.isEmpty) {
      throw const PreOrderServiceException(
        message: 'Pre-order ID is required.',
        code: 'missing-preorder-id',
      );
    }

    if (cleanReason.isEmpty) {
      throw const PreOrderServiceException(
        message: 'Cancellation reason is required.',
        code: 'missing-cancellation-reason',
      );
    }

    final DocumentReference<Map<String, dynamic>> preOrderReference =
    _preOrdersReference.doc(cleanPreOrderId);

    try {
      await _firestore.runTransaction(
            (Transaction transaction) async {
          final DocumentSnapshot<Map<String, dynamic>> preOrderSnapshot =
          await transaction.get(preOrderReference);

          if (!preOrderSnapshot.exists ||
              preOrderSnapshot.data() == null) {
            throw const PreOrderServiceException(
              message: 'Pre-order was not found.',
              code: 'preorder-not-found',
            );
          }

          final PreOrderModel preOrder = PreOrderModel.fromMap(
            preOrderSnapshot.data()!,
            documentId: preOrderSnapshot.id,
          );

          if (!preOrder.canBeCancelled) {
            throw const PreOrderServiceException(
              message:
              'This pre-order can no longer be cancelled.',
              code: 'cancellation-not-allowed',
            );
          }

          final DocumentReference<Map<String, dynamic>> productReference =
          _productsReference.doc(preOrder.productId);

          final DocumentSnapshot<Map<String, dynamic>> productSnapshot =
          await transaction.get(productReference);

          if (productSnapshot.exists && productSnapshot.data() != null) {
            final Map<String, dynamic> productData =
            productSnapshot.data()!;

            final int currentBookedQuantity =
            _intValue(
              productData['preOrderBookedQuantity'],
            );

            final int updatedBookedQuantity =
            (currentBookedQuantity - preOrder.quantity)
                .clamp(0, 999999);

            transaction.set(
              productReference,
              <String, dynamic>{
                'preOrderBookedQuantity': updatedBookedQuantity,
                'updatedAt': FieldValue.serverTimestamp(),
              },
              SetOptions(merge: true),
            );
          }

          transaction.set(
            preOrderReference,
            <String, dynamic>{
              'status': 'cancelled',
              'cancellationReason': cleanReason,
              'updatedAt': FieldValue.serverTimestamp(),
            },
            SetOptions(merge: true),
          );
        },
      );
    } on PreOrderServiceException {
      rethrow;
    } on FirebaseException catch (error) {
      throw PreOrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Updates customer delivery date, slot, and optional address.
  Future<void> updateDelivery({
    required String preOrderId,
    required DateTime expectedDeliveryDate,
    required String deliverySlot,
    String? deliveryAddress,
  }) async {
    if (deliverySlot.trim().isEmpty) {
      throw const PreOrderServiceException(
        message: 'Delivery slot is required.',
        code: 'missing-delivery-slot',
      );
    }

    final Map<String, dynamic> fields = <String, dynamic>{
      'expectedDeliveryDate':
      Timestamp.fromDate(expectedDeliveryDate),
      'deliverySlot': deliverySlot.trim(),
    };

    if (deliveryAddress != null &&
        deliveryAddress.trim().isNotEmpty) {
      fields['deliveryAddress'] =
          deliveryAddress.trim();
    }

    await updatePreOrderFields(
      preOrderId: preOrderId,
      fields: fields,
    );
  }

  /// Updates harvest date and optional farmer note.
  Future<void> updateHarvest({
    required String preOrderId,
    required DateTime harvestDate,
    String farmerNote = '',
  }) async {
    final Map<String, dynamic> fields = <String, dynamic>{
      'harvestDate': Timestamp.fromDate(harvestDate),
    };

    if (farmerNote.trim().isNotEmpty) {
      fields['farmerNote'] = farmerNote.trim();
    }

    await updatePreOrderFields(
      preOrderId: preOrderId,
      fields: fields,
    );
  }

  /// Updates payment method and payment status.
  Future<void> updatePayment({
    required String preOrderId,
    required String paymentMethod,
    required String paymentStatus,
  }) async {
    await updatePreOrderFields(
      preOrderId: preOrderId,
      fields: <String, dynamic>{
        'paymentMethod': paymentMethod.trim(),
        'paymentStatus':
        paymentStatus.trim().toLowerCase(),
      },
    );
  }

  Future<void> markPaid(String preOrderId) async {
    await updatePreOrderFields(
      preOrderId: preOrderId,
      fields: <String, dynamic>{
        'paymentStatus': 'paid',
      },
    );
  }

  /// Updates customer note.
  Future<void> updateCustomerNote({
    required String preOrderId,
    required String note,
  }) async {
    await updatePreOrderFields(
      preOrderId: preOrderId,
      fields: <String, dynamic>{
        'customerNote': note.trim(),
      },
    );
  }

  /// Returns customer pre-orders once.
  Future<List<PreOrderModel>> getUserPreOrders(
      String userId, {
        int limit = 100,
      }) async {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return const <PreOrderModel>[];
    }

    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _preOrdersReference
          .where('userId', isEqualTo: cleanUserId)
          .get();

      final List<PreOrderModel> preOrders = snapshot.docs
          .map(
            (QueryDocumentSnapshot<Map<String, dynamic>> document) {
          return PreOrderModel.fromMap(
            document.data(),
            documentId: document.id,
          );
        },
      )
          .toList();

      preOrders.sort(
            (PreOrderModel first, PreOrderModel second) {
          return second.createdAt.compareTo(first.createdAt);
        },
      );

      return preOrders.take(_safeLimit(limit)).toList();
    } on FirebaseException catch (error) {
      throw PreOrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Returns farmer pre-orders once.
  Future<List<PreOrderModel>> getFarmerPreOrders(
      String farmerId, {
        int limit = 100,
      }) async {
    final String cleanFarmerId = farmerId.trim();

    if (cleanFarmerId.isEmpty) {
      return const <PreOrderModel>[];
    }

    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _preOrdersReference
          .where('farmerId', isEqualTo: cleanFarmerId)
          .get();

      final List<PreOrderModel> preOrders = snapshot.docs
          .map(
            (QueryDocumentSnapshot<Map<String, dynamic>> document) {
          return PreOrderModel.fromMap(
            document.data(),
            documentId: document.id,
          );
        },
      )
          .toList();

      preOrders.sort(
            (PreOrderModel first, PreOrderModel second) {
          return first.expectedDeliveryDate.compareTo(
            second.expectedDeliveryDate,
          );
        },
      );

      return preOrders.take(_safeLimit(limit)).toList();
    } on FirebaseException catch (error) {
      throw PreOrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Returns customer pre-order totals for dashboard use.
  Future<PreOrderSummary> getUserPreOrderSummary(
      String userId,
      ) async {
    final List<PreOrderModel> preOrders =
    await getUserPreOrders(userId);

    return PreOrderSummary.fromPreOrders(preOrders);
  }

  /// Returns farmer pre-order totals for farmer dashboard use.
  Future<PreOrderSummary> getFarmerPreOrderSummary(
      String farmerId,
      ) async {
    final List<PreOrderModel> preOrders =
    await getFarmerPreOrders(farmerId);

    return PreOrderSummary.fromPreOrders(preOrders);
  }

  void _validatePreOrder(PreOrderModel preOrder) {
    if (preOrder.productId.trim().isEmpty) {
      throw const PreOrderServiceException(
        message: 'Product ID is required.',
        code: 'missing-product-id',
      );
    }

    if (preOrder.productName.trim().isEmpty) {
      throw const PreOrderServiceException(
        message: 'Product name is required.',
        code: 'missing-product-name',
      );
    }

    if (preOrder.farmerId.trim().isEmpty) {
      throw const PreOrderServiceException(
        message: 'Farmer ID is required.',
        code: 'missing-farmer-id',
      );
    }

    if (preOrder.quantity <= 0) {
      throw const PreOrderServiceException(
        message: 'Quantity must be greater than zero.',
        code: 'invalid-quantity',
      );
    }

    if (preOrder.unitPrice < 0) {
      throw const PreOrderServiceException(
        message: 'Unit price cannot be negative.',
        code: 'invalid-unit-price',
      );
    }

    if (!preOrder.hasValidDeliveryDate) {
      throw const PreOrderServiceException(
        message: 'Expected delivery date is invalid.',
        code: 'invalid-delivery-date',
      );
    }

    if (!preOrder.hasValidDeliverySlot) {
      throw const PreOrderServiceException(
        message: 'Delivery slot is required.',
        code: 'missing-delivery-slot',
      );
    }
  }

  int _safeLimit(int limit) {
    if (limit <= 0) return 1;
    if (limit > 500) return 500;
    return limit;
  }

  static int _intValue(
      dynamic value, {
        int fallback = 0,
      }) {
    if (value is num) {
      return value.toInt();
    }

    if (value is String) {
      return int.tryParse(value.trim()) ?? fallback;
    }

    return fallback;
  }

  static int _positiveIntValue(
      dynamic value, {
        int fallback = 1,
      }) {
    final int result = _intValue(
      value,
      fallback: fallback,
    );

    return result > 0 ? result : fallback;
  }

  String _firebaseErrorMessage(FirebaseException error) {
    switch (error.code) {
      case 'permission-denied':
        return 'Firestore permission denied. Please check Firebase rules.';
      case 'unavailable':
        return 'Firebase is currently unavailable. Check your internet connection.';
      case 'not-found':
        return 'Requested pre-order was not found.';
      case 'already-exists':
        return 'This pre-order already exists.';
      case 'cancelled':
        return 'Pre-order operation was cancelled.';
      case 'deadline-exceeded':
        return 'Pre-order request timed out. Please try again.';
      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Unable to complete the pre-order operation.';
    }
  }
}

class PreOrderSummary {
  final int totalOrders;
  final int activeOrders;
  final int completedOrders;
  final int cancelledOrders;
  final int pendingOrders;
  final int confirmedOrders;
  final int harvestReadyOrders;
  final int outForDeliveryOrders;
  final int deliveredOrders;
  final double totalValue;
  final double activeValue;
  final double deliveredValue;

  const PreOrderSummary({
    required this.totalOrders,
    required this.activeOrders,
    required this.completedOrders,
    required this.cancelledOrders,
    required this.pendingOrders,
    required this.confirmedOrders,
    required this.harvestReadyOrders,
    required this.outForDeliveryOrders,
    required this.deliveredOrders,
    required this.totalValue,
    required this.activeValue,
    required this.deliveredValue,
  });

  factory PreOrderSummary.fromPreOrders(
      List<PreOrderModel> preOrders,
      ) {
    int activeOrders = 0;
    int completedOrders = 0;
    int cancelledOrders = 0;
    int pendingOrders = 0;
    int confirmedOrders = 0;
    int harvestReadyOrders = 0;
    int outForDeliveryOrders = 0;
    int deliveredOrders = 0;

    double totalValue = 0;
    double activeValue = 0;
    double deliveredValue = 0;

    for (final PreOrderModel preOrder in preOrders) {
      final double value = preOrder.effectiveTotalPrice;

      totalValue += value;

      if (preOrder.isActive) {
        activeOrders++;
        activeValue += value;
      }

      if (preOrder.isCompleted) {
        completedOrders++;
      }

      if (preOrder.isCancelled) {
        cancelledOrders++;
      }

      if (preOrder.isPending) {
        pendingOrders++;
      }

      if (preOrder.isConfirmed) {
        confirmedOrders++;
      }

      if (preOrder.isHarvestReady) {
        harvestReadyOrders++;
      }

      if (preOrder.isOutForDelivery) {
        outForDeliveryOrders++;
      }

      if (preOrder.isDelivered) {
        deliveredOrders++;
        deliveredValue += value;
      }
    }

    return PreOrderSummary(
      totalOrders: preOrders.length,
      activeOrders: activeOrders,
      completedOrders: completedOrders,
      cancelledOrders: cancelledOrders,
      pendingOrders: pendingOrders,
      confirmedOrders: confirmedOrders,
      harvestReadyOrders: harvestReadyOrders,
      outForDeliveryOrders: outForDeliveryOrders,
      deliveredOrders: deliveredOrders,
      totalValue: totalValue,
      activeValue: activeValue,
      deliveredValue: deliveredValue,
    );
  }
}

class PreOrderServiceException implements Exception {
  final String message;
  final String code;
  final Object? originalError;

  const PreOrderServiceException({
    required this.message,
    this.code = 'preorder-error',
    this.originalError,
  });

  @override
  String toString() {
    return 'PreOrderServiceException(code: $code, message: $message)';
  }
}