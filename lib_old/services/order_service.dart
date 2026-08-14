import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/order_model.dart';

class OrderService {
  OrderService({
    FirebaseFirestore? firestore,
  }) : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  static const String ordersCollection = 'orders';

  CollectionReference<Map<String, dynamic>> get _ordersReference {
    return _db.collection(ordersCollection);
  }

  /// Creates a new order and returns the generated Firestore document ID.
  ///
  /// Existing checkout code that uses:
  ///
  /// await orderService.saveOrder(order);
  ///
  /// remains fully compatible because the returned String can be ignored.
  Future<String> saveOrder(OrderModel order) async {
    _validateOrder(order);

    final DocumentReference<Map<String, dynamic>> reference =
    _ordersReference.doc();

    final Map<String, dynamic> data = <String, dynamic>{
      ...order.copyWith(id: reference.id).toMap(),
      'id': reference.id,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
      'notificationSent': false,
      'smsSent': false,
      'pushSent': false,
      'emailSent': false,
    };

    try {
      await reference.set(data);
      return reference.id;
    } on FirebaseException catch (error) {
      throw OrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    } catch (error) {
      throw OrderServiceException(
        message: 'Unable to place the order. Please try again.',
        code: 'save-order-failed',
        originalError: error,
      );
    }
  }

  /// Creates an order using an explicit document ID.
  Future<void> saveOrderWithId(
      String orderId,
      OrderModel order,
      ) async {
    final String cleanOrderId = orderId.trim();

    if (cleanOrderId.isEmpty) {
      throw const OrderServiceException(
        message: 'Order ID is required.',
        code: 'missing-order-id',
      );
    }

    _validateOrder(order);

    try {
      await _ordersReference.doc(cleanOrderId).set(
        <String, dynamic>{
          ...order.copyWith(id: cleanOrderId).toMap(),
          'id': cleanOrderId,
          'updatedAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    } on FirebaseException catch (error) {
      throw OrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Real-time user orders.
  ///
  /// No orderBy is used, so a composite Firestore index is not required.
  /// Results are sorted client-side from newest to oldest.
  Stream<List<OrderModel>> getUserOrders(
      String userId, {
        int limit = 200,
      }) {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return Stream<List<OrderModel>>.value(
        const <OrderModel>[],
      );
    }

    return _ordersReference
        .where('userId', isEqualTo: cleanUserId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<OrderModel> orders = snapshot.docs
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return OrderModel.fromMap(
              document.id,
              document.data(),
            );
          },
        )
            .toList();

        orders.sort(
              (OrderModel first, OrderModel second) {
            return second.timestamp.compareTo(first.timestamp);
          },
        );

        return orders.take(_safeLimit(limit)).toList();
      },
    ).handleError(
          (Object error) {
        throw OrderServiceException(
          message: 'Unable to load your orders.',
          code: 'watch-user-orders-failed',
          originalError: error,
        );
      },
    );
  }

  /// Alias for codebases that prefer watch-style naming.
  Stream<List<OrderModel>> watchUserOrders(
      String userId, {
        int limit = 200,
      }) {
    return getUserOrders(
      userId,
      limit: limit,
    );
  }

  /// Real-time active orders for one customer.
  Stream<List<OrderModel>> watchActiveUserOrders(
      String userId, {
        int limit = 200,
      }) {
    return getUserOrders(
      userId,
      limit: limit,
    ).map(
          (List<OrderModel> orders) {
        return orders
            .where((OrderModel order) => order.isActive)
            .toList();
      },
    );
  }

  /// Real-time completed orders for one customer.
  Stream<List<OrderModel>> watchCompletedUserOrders(
      String userId, {
        int limit = 200,
      }) {
    return getUserOrders(
      userId,
      limit: limit,
    ).map(
          (List<OrderModel> orders) {
        return orders
            .where(
              (OrderModel order) =>
          order.isDelivered || order.isCancelled,
        )
            .toList();
      },
    );
  }

  /// Real-time orders filtered by status.
  ///
  /// Status filtering is done client-side to avoid composite indexes.
  Stream<List<OrderModel>> watchUserOrdersByStatus(
      String userId,
      String status, {
        int limit = 200,
      }) {
    final String normalizedStatus =
    _normalizeStatus(status);

    return getUserOrders(
      userId,
      limit: limit,
    ).map(
          (List<OrderModel> orders) {
        return orders.where(
              (OrderModel order) {
            return order.normalizedStatus == normalizedStatus;
          },
        ).toList();
      },
    );
  }

  /// Real-time orders that contain products from one farmer.
  ///
  /// This reads all user-independent orders and filters item metadata
  /// client-side because farmerId is nested inside the items array.
  Stream<List<OrderModel>> watchFarmerOrders(
      String farmerId, {
        int limit = 200,
      }) {
    final String cleanFarmerId = farmerId.trim();

    if (cleanFarmerId.isEmpty) {
      return Stream<List<OrderModel>>.value(
        const <OrderModel>[],
      );
    }

    return _ordersReference.snapshots().map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<OrderModel> orders = snapshot.docs
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return OrderModel.fromMap(
              document.id,
              document.data(),
            );
          },
        )
            .where(
              (OrderModel order) => order.items.any(
                (Map<String, dynamic> item) {
              return item['farmerId']
                  ?.toString()
                  .trim() ==
                  cleanFarmerId;
            },
          ),
        )
            .toList();

        orders.sort(
              (OrderModel first, OrderModel second) {
            return second.timestamp.compareTo(first.timestamp);
          },
        );

        return orders.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Real-time active orders for one farmer.
  Stream<List<OrderModel>> watchActiveFarmerOrders(
      String farmerId, {
        int limit = 200,
      }) {
    return watchFarmerOrders(
      farmerId,
      limit: limit,
    ).map(
          (List<OrderModel> orders) {
        return orders
            .where((OrderModel order) => order.isActive)
            .toList();
      },
    );
  }

  /// Real-time orders within a date range for one user.
  Stream<List<OrderModel>> watchUserOrdersByDateRange(
      String userId, {
        required DateTime start,
        required DateTime end,
        int limit = 200,
      }) {
    return getUserOrders(
      userId,
      limit: limit,
    ).map(
          (List<OrderModel> orders) {
        return orders.where(
              (OrderModel order) {
            final DateTime date = order.timestamp;

            return !date.isBefore(start) &&
                !date.isAfter(end);
          },
        ).toList();
      },
    );
  }

  /// Returns one order in real time.
  Stream<OrderModel?> watchOrderById(String orderId) {
    final String cleanOrderId = orderId.trim();

    if (cleanOrderId.isEmpty) {
      return Stream<OrderModel?>.value(null);
    }

    return _ordersReference.doc(cleanOrderId).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> snapshot) {
        final Map<String, dynamic>? data = snapshot.data();

        if (!snapshot.exists || data == null) {
          return null;
        }

        return OrderModel.fromMap(
          snapshot.id,
          data,
        );
      },
    );
  }

  /// Returns one order once.
  Future<OrderModel?> getOrderById(String orderId) async {
    final String cleanOrderId = orderId.trim();

    if (cleanOrderId.isEmpty) {
      return null;
    }

    try {
      final DocumentSnapshot<Map<String, dynamic>> snapshot =
      await _ordersReference.doc(cleanOrderId).get();

      final Map<String, dynamic>? data = snapshot.data();

      if (!snapshot.exists || data == null) {
        return null;
      }

      return OrderModel.fromMap(
        snapshot.id,
        data,
      );
    } on FirebaseException catch (error) {
      throw OrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Returns user orders once.
  Future<List<OrderModel>> getUserOrdersOnce(
      String userId, {
        int limit = 200,
      }) async {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return const <OrderModel>[];
    }

    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _ordersReference
          .where('userId', isEqualTo: cleanUserId)
          .get();

      final List<OrderModel> orders = snapshot.docs
          .map(
            (QueryDocumentSnapshot<Map<String, dynamic>> document) {
          return OrderModel.fromMap(
            document.id,
            document.data(),
          );
        },
      )
          .toList();

      orders.sort(
            (OrderModel first, OrderModel second) {
          return second.timestamp.compareTo(first.timestamp);
        },
      );

      return orders.take(_safeLimit(limit)).toList();
    } on FirebaseException catch (error) {
      throw OrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Updates selected order fields.
  Future<void> updateOrderFields({
    required String orderId,
    required Map<String, dynamic> fields,
  }) async {
    final String cleanOrderId = orderId.trim();

    if (cleanOrderId.isEmpty) {
      throw const OrderServiceException(
        message: 'Order ID is required.',
        code: 'missing-order-id',
      );
    }

    if (fields.isEmpty) {
      return;
    }

    final Map<String, dynamic> data =
    Map<String, dynamic>.from(fields);

    data['updatedAt'] = FieldValue.serverTimestamp();

    try {
      await _ordersReference.doc(cleanOrderId).set(
        data,
        SetOptions(merge: true),
      );
    } on FirebaseException catch (error) {
      throw OrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Updates order status and automatically writes the matching
  /// timeline timestamp.
  Future<void> updateOrderStatus({
    required String orderId,
    required String status,
  }) async {
    final String normalizedStatus =
    _normalizeStatus(status);

    if (normalizedStatus.isEmpty) {
      throw const OrderServiceException(
        message: 'Order status is required.',
        code: 'missing-status',
      );
    }

    final Map<String, dynamic> fields = <String, dynamic>{
      'status': normalizedStatus,
    };

    final String? timelineField =
    _timelineFieldForStatus(normalizedStatus);

    if (timelineField != null) {
      fields[timelineField] =
          FieldValue.serverTimestamp();
    }

    await updateOrderFields(
      orderId: orderId,
      fields: fields,
    );
  }

  Future<void> markConfirmed(String orderId) async {
    await updateOrderStatus(
      orderId: orderId,
      status: 'confirmed',
    );
  }

  Future<void> markPacked(String orderId) async {
    await updateOrderStatus(
      orderId: orderId,
      status: 'packed',
    );
  }

  Future<void> markShipped(String orderId) async {
    await updateOrderStatus(
      orderId: orderId,
      status: 'shipped',
    );
  }

  Future<void> markOutForDelivery(
      String orderId, {
        String deliveryPartnerId = '',
        String deliveryPartnerName = '',
        String deliveryPartnerPhone = '',
        String vehicleNumber = '',
      }) async {
    final Map<String, dynamic> fields = <String, dynamic>{
      'status': 'out_for_delivery',
      'outForDeliveryAt': FieldValue.serverTimestamp(),
    };

    if (deliveryPartnerId.trim().isNotEmpty) {
      fields['deliveryPartnerId'] =
          deliveryPartnerId.trim();
    }

    if (deliveryPartnerName.trim().isNotEmpty) {
      fields['deliveryPartnerName'] =
          deliveryPartnerName.trim();
    }

    if (deliveryPartnerPhone.trim().isNotEmpty) {
      fields['deliveryPartnerPhone'] =
          deliveryPartnerPhone.trim();
    }

    if (vehicleNumber.trim().isNotEmpty) {
      fields['deliveryVehicleNumber'] =
          vehicleNumber.trim();
    }

    await updateOrderFields(
      orderId: orderId,
      fields: fields,
    );
  }

  Future<void> markDelivered(String orderId) async {
    final OrderModel? order =
    await getOrderById(orderId);

    final Map<String, dynamic> fields = <String, dynamic>{
      'status': 'delivered',
      'deliveredAt': FieldValue.serverTimestamp(),
    };

    if (order != null &&
        order.paymentMethod
            .toLowerCase()
            .contains('cash')) {
      fields['paymentStatus'] = 'paid';
    }

    await updateOrderFields(
      orderId: orderId,
      fields: fields,
    );
  }

  /// Cancels an order when it is still in a cancellable state.
  Future<void> cancelOrder({
    required String orderId,
    required String reason,
  }) async {
    final String cleanOrderId = orderId.trim();
    final String cleanReason = reason.trim();

    if (cleanOrderId.isEmpty) {
      throw const OrderServiceException(
        message: 'Order ID is required.',
        code: 'missing-order-id',
      );
    }

    if (cleanReason.isEmpty) {
      throw const OrderServiceException(
        message: 'Cancellation reason is required.',
        code: 'missing-cancellation-reason',
      );
    }

    final DocumentReference<Map<String, dynamic>> reference =
    _ordersReference.doc(cleanOrderId);

    try {
      await _db.runTransaction(
            (Transaction transaction) async {
          final DocumentSnapshot<Map<String, dynamic>> snapshot =
          await transaction.get(reference);

          final Map<String, dynamic>? data = snapshot.data();

          if (!snapshot.exists || data == null) {
            throw const OrderServiceException(
              message: 'Order was not found.',
              code: 'order-not-found',
            );
          }

          final OrderModel order = OrderModel.fromMap(
            snapshot.id,
            data,
          );

          if (!order.canCancel) {
            throw const OrderServiceException(
              message:
              'This order can no longer be cancelled.',
              code: 'cancellation-not-allowed',
            );
          }

          transaction.set(
            reference,
            <String, dynamic>{
              'status': 'cancelled',
              'cancellationReason': cleanReason,
              'cancelledAt': FieldValue.serverTimestamp(),
              'updatedAt': FieldValue.serverTimestamp(),
            },
            SetOptions(merge: true),
          );
        },
      );
    } on OrderServiceException {
      rethrow;
    } on FirebaseException catch (error) {
      throw OrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Updates payment state.
  Future<void> updatePaymentStatus({
    required String orderId,
    required String paymentStatus,
    String paymentReference = '',
  }) async {
    final String normalizedPaymentStatus =
    paymentStatus.trim().toLowerCase();

    if (normalizedPaymentStatus.isEmpty) {
      throw const OrderServiceException(
        message: 'Payment status is required.',
        code: 'missing-payment-status',
      );
    }

    final Map<String, dynamic> fields = <String, dynamic>{
      'paymentStatus': normalizedPaymentStatus,
    };

    if (paymentReference.trim().isNotEmpty) {
      fields['paymentReference'] =
          paymentReference.trim();
    }

    await updateOrderFields(
      orderId: orderId,
      fields: fields,
    );
  }

  Future<void> markPaymentPaid(
      String orderId, {
        String paymentReference = '',
      }) async {
    await updatePaymentStatus(
      orderId: orderId,
      paymentStatus: 'paid',
      paymentReference: paymentReference,
    );
  }

  Future<void> markPaymentFailed(
      String orderId, {
        String paymentReference = '',
      }) async {
    await updatePaymentStatus(
      orderId: orderId,
      paymentStatus: 'failed',
      paymentReference: paymentReference,
    );
  }

  /// Updates refund information.
  Future<void> updateRefund({
    required String orderId,
    required String refundStatus,
    String refundReference = '',
  }) async {
    final Map<String, dynamic> fields = <String, dynamic>{
      'refundStatus':
      refundStatus.trim().toLowerCase(),
    };

    if (refundReference.trim().isNotEmpty) {
      fields['refundReference'] =
          refundReference.trim();
    }

    if (refundStatus
        .trim()
        .toLowerCase()
        .contains('refund')) {
      fields['paymentStatus'] = 'refunded';
    }

    await updateOrderFields(
      orderId: orderId,
      fields: fields,
    );
  }

  /// Assigns or changes the delivery partner.
  Future<void> assignDeliveryPartner({
    required String orderId,
    required String partnerId,
    required String partnerName,
    required String partnerPhone,
    String vehicleNumber = '',
  }) async {
    await updateOrderFields(
      orderId: orderId,
      fields: <String, dynamic>{
        'deliveryPartnerId': partnerId.trim(),
        'deliveryPartnerName': partnerName.trim(),
        'deliveryPartnerPhone': partnerPhone.trim(),
        'deliveryVehicleNumber':
        vehicleNumber.trim(),
      },
    );
  }

  /// Updates live delivery tracking information.
  Future<void> updateDeliveryTracking({
    required String orderId,
    required double latitude,
    required double longitude,
    int? etaMinutes,
  }) async {
    final Map<String, dynamic> fields = <String, dynamic>{
      'deliveryCurrentLocation': GeoPoint(
        latitude,
        longitude,
      ),
      'deliveryLocationUpdatedAt':
      FieldValue.serverTimestamp(),
    };

    if (etaMinutes != null && etaMinutes >= 0) {
      fields['etaMinutes'] = etaMinutes;
    }

    await updateOrderFields(
      orderId: orderId,
      fields: fields,
    );
  }

  /// Updates customer delivery preferences.
  Future<void> updateDeliveryPreferences({
    required String orderId,
    String? timeSlot,
    String? deliveryInstruction,
    bool? ecoFriendlyPacking,
    String? customerNote,
  }) async {
    final Map<String, dynamic> fields =
    <String, dynamic>{};

    if (timeSlot != null) {
      fields['timeSlot'] = timeSlot.trim();
    }

    if (deliveryInstruction != null) {
      fields['deliveryInstruction'] =
          deliveryInstruction.trim();
    }

    if (ecoFriendlyPacking != null) {
      fields['ecoFriendlyPacking'] =
          ecoFriendlyPacking;
    }

    if (customerNote != null) {
      fields['customerNote'] =
          customerNote.trim();
    }

    await updateOrderFields(
      orderId: orderId,
      fields: fields,
    );
  }

  /// Deletes an order document.
  ///
  /// Use this only for admin/testing workflows.
  Future<void> deleteOrder(String orderId) async {
    final String cleanOrderId = orderId.trim();

    if (cleanOrderId.isEmpty) {
      return;
    }

    try {
      await _ordersReference.doc(cleanOrderId).delete();
    } on FirebaseException catch (error) {
      throw OrderServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  /// Returns summary information for a user's order dashboard.
  Future<OrderSummary> getUserOrderSummary(
      String userId,
      ) async {
    final List<OrderModel> orders =
    await getUserOrdersOnce(userId);

    return OrderSummary.fromOrders(orders);
  }

  void _validateOrder(OrderModel order) {
    if (order.userId.trim().isEmpty) {
      throw const OrderServiceException(
        message: 'Customer user ID is required.',
        code: 'missing-user-id',
      );
    }

    if (order.items.isEmpty) {
      throw const OrderServiceException(
        message: 'Order must contain at least one item.',
        code: 'empty-order-items',
      );
    }

    if (order.totalAmount < 0) {
      throw const OrderServiceException(
        message: 'Order total cannot be negative.',
        code: 'invalid-order-total',
      );
    }

    if (order.address.trim().isEmpty) {
      throw const OrderServiceException(
        message: 'Delivery address is required.',
        code: 'missing-address',
      );
    }

    if (order.paymentMethod.trim().isEmpty) {
      throw const OrderServiceException(
        message: 'Payment method is required.',
        code: 'missing-payment-method',
      );
    }
  }

  int _safeLimit(int limit) {
    if (limit <= 0) return 1;
    if (limit > 500) return 500;
    return limit;
  }

  String _normalizeStatus(String status) {
    return status
        .trim()
        .toLowerCase()
        .replaceAll(' ', '_');
  }

  String? _timelineFieldForStatus(String status) {
    switch (status) {
      case 'confirmed':
        return 'confirmedAt';
      case 'packed':
        return 'packedAt';
      case 'shipped':
        return 'shippedAt';
      case 'out_for_delivery':
      case 'on_the_way':
        return 'outForDeliveryAt';
      case 'delivered':
        return 'deliveredAt';
      case 'cancelled':
        return 'cancelledAt';
      default:
        return null;
    }
  }

  String _firebaseErrorMessage(FirebaseException error) {
    switch (error.code) {
      case 'permission-denied':
        return 'Firestore permission denied. Please check Firebase rules.';
      case 'unavailable':
        return 'Firebase is unavailable. Check your internet connection.';
      case 'not-found':
        return 'Requested order was not found.';
      case 'already-exists':
        return 'This order already exists.';
      case 'deadline-exceeded':
        return 'The order request timed out. Please try again.';
      case 'cancelled':
        return 'The order operation was cancelled.';
      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Unable to complete the order operation.';
    }
  }
}

class OrderSummary {
  final int totalOrders;
  final int activeOrders;
  final int deliveredOrders;
  final int cancelledOrders;
  final int placedOrders;
  final int confirmedOrders;
  final int packedOrders;
  final int shippedOrders;
  final int outForDeliveryOrders;
  final double totalValue;
  final double activeValue;
  final double deliveredValue;

  const OrderSummary({
    required this.totalOrders,
    required this.activeOrders,
    required this.deliveredOrders,
    required this.cancelledOrders,
    required this.placedOrders,
    required this.confirmedOrders,
    required this.packedOrders,
    required this.shippedOrders,
    required this.outForDeliveryOrders,
    required this.totalValue,
    required this.activeValue,
    required this.deliveredValue,
  });

  factory OrderSummary.fromOrders(
      List<OrderModel> orders,
      ) {
    int activeOrders = 0;
    int deliveredOrders = 0;
    int cancelledOrders = 0;
    int placedOrders = 0;
    int confirmedOrders = 0;
    int packedOrders = 0;
    int shippedOrders = 0;
    int outForDeliveryOrders = 0;

    double totalValue = 0;
    double activeValue = 0;
    double deliveredValue = 0;

    for (final OrderModel order in orders) {
      totalValue += order.totalAmount;

      if (order.isActive) {
        activeOrders++;
        activeValue += order.totalAmount;
      }

      if (order.isDelivered) {
        deliveredOrders++;
        deliveredValue += order.totalAmount;
      }

      if (order.isCancelled) {
        cancelledOrders++;
      }

      if (order.isPlaced) {
        placedOrders++;
      }

      if (order.isConfirmed) {
        confirmedOrders++;
      }

      if (order.isPacked) {
        packedOrders++;
      }

      if (order.isShipped) {
        shippedOrders++;
      }

      if (order.isOutForDelivery) {
        outForDeliveryOrders++;
      }
    }

    return OrderSummary(
      totalOrders: orders.length,
      activeOrders: activeOrders,
      deliveredOrders: deliveredOrders,
      cancelledOrders: cancelledOrders,
      placedOrders: placedOrders,
      confirmedOrders: confirmedOrders,
      packedOrders: packedOrders,
      shippedOrders: shippedOrders,
      outForDeliveryOrders:
      outForDeliveryOrders,
      totalValue: totalValue,
      activeValue: activeValue,
      deliveredValue: deliveredValue,
    );
  }
}

class OrderServiceException implements Exception {
  final String message;
  final String code;
  final Object? originalError;

  const OrderServiceException({
    required this.message,
    this.code = 'order-service-error',
    this.originalError,
  });

  @override
  String toString() {
    return 'OrderServiceException(code: $code, message: $message)';
  }
}