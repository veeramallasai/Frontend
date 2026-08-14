import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/order_model.dart';

class OrderRemoteSource {
  OrderRemoteSource({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> get _orders {
    return _firestore.collection('orders');
  }

  Stream<List<OrderModel>> watchUserOrders(
      String userId, {
        int limit = 50,
      }) {
    final String normalizedUserId = userId.trim();

    if (normalizedUserId.isEmpty) {
      return Stream<List<OrderModel>>.value(<OrderModel>[]);
    }

    return _orders
        .where('userId', isEqualTo: normalizedUserId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<OrderModel> orders = snapshot.docs
            .map(OrderModel.fromDocument)
            .toList(growable: true);

        return _sortAndLimit(orders, limit);
      },
    );
  }

  Future<List<OrderModel>> getUserOrders(
      String userId, {
        int limit = 50,
      }) async {
    final String normalizedUserId = userId.trim();

    if (normalizedUserId.isEmpty) {
      return <OrderModel>[];
    }

    final QuerySnapshot<Map<String, dynamic>> snapshot = await _orders
        .where('userId', isEqualTo: normalizedUserId)
        .get();

    final List<OrderModel> orders = snapshot.docs
        .map(OrderModel.fromDocument)
        .toList(growable: true);

    return _sortAndLimit(orders, limit);
  }

  Stream<OrderModel?> watchOrder(String orderId) {
    final String normalizedOrderId = orderId.trim();

    if (normalizedOrderId.isEmpty) {
      return Stream<OrderModel?>.value(null);
    }

    return _orders.doc(normalizedOrderId).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> document) {
        if (!document.exists || document.data() == null) {
          return null;
        }

        return OrderModel.fromDocument(document);
      },
    );
  }

  Future<OrderModel?> getOrder(String orderId) async {
    final String normalizedOrderId = orderId.trim();

    if (normalizedOrderId.isEmpty) {
      return null;
    }

    final DocumentSnapshot<Map<String, dynamic>> document =
    await _orders.doc(normalizedOrderId).get();

    if (!document.exists || document.data() == null) {
      return null;
    }

    return OrderModel.fromDocument(document);
  }

  Future<String> createOrder(OrderModel order) async {
    final DocumentReference<Map<String, dynamic>> reference =
    order.id.trim().isEmpty ? _orders.doc() : _orders.doc(order.id.trim());

    final Map<String, dynamic> data = <String, dynamic>{
      ...order.toMap(),
      'id': reference.id,
      'orderId': reference.id,
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    };

    if (order.statusHistory.isEmpty) {
      data['statusHistory'] = <Map<String, dynamic>>[
        <String, dynamic>{
          'status': order.status,
          'time': Timestamp.now(),
        },
      ];
    }

    await reference.set(data);
    return reference.id;
  }

  Future<void> updateOrder(OrderModel order) async {
    final String orderId = order.id.trim();

    if (orderId.isEmpty) {
      throw ArgumentError.value(
        order.id,
        'order.id',
        'Order ID cannot be empty.',
      );
    }

    await _orders.doc(orderId).set(
      <String, dynamic>{
        ...order.toMap(),
        'id': orderId,
        'orderId': orderId,
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  Future<void> updateOrderStatus({
    required String orderId,
    required String status,
    String note = '',
  }) async {
    final String normalizedOrderId = orderId.trim();
    final String normalizedStatus = status.trim().toLowerCase();

    if (normalizedOrderId.isEmpty) {
      throw ArgumentError.value(
        orderId,
        'orderId',
        'Order ID cannot be empty.',
      );
    }

    if (normalizedStatus.isEmpty) {
      throw ArgumentError.value(
        status,
        'status',
        'Order status cannot be empty.',
      );
    }

    final DocumentReference<Map<String, dynamic>> reference =
    _orders.doc(normalizedOrderId);

    await _firestore.runTransaction<void>(
          (Transaction transaction) async {
        final DocumentSnapshot<Map<String, dynamic>> snapshot =
        await transaction.get(reference);

        if (!snapshot.exists) {
          throw StateError('Order not found.');
        }

        final Map<String, dynamic> historyEntry = <String, dynamic>{
          'status': normalizedStatus,
          'time': Timestamp.now(),
          if (note.trim().isNotEmpty) 'note': note.trim(),
        };

        transaction.update(
          reference,
          <String, dynamic>{
            'status': normalizedStatus,
            'updatedAt': FieldValue.serverTimestamp(),
            'statusHistory': FieldValue.arrayUnion(
              <Map<String, dynamic>>[historyEntry],
            ),
          },
        );
      },
    );
  }

  Future<void> cancelOrder({
    required String orderId,
    required String userId,
    String reason = '',
  }) async {
    final String normalizedOrderId = orderId.trim();
    final String normalizedUserId = userId.trim();

    if (normalizedOrderId.isEmpty || normalizedUserId.isEmpty) {
      throw ArgumentError('Order ID and user ID are required.');
    }

    final DocumentReference<Map<String, dynamic>> reference =
    _orders.doc(normalizedOrderId);

    await _firestore.runTransaction<void>(
          (Transaction transaction) async {
        final DocumentSnapshot<Map<String, dynamic>> snapshot =
        await transaction.get(reference);

        if (!snapshot.exists || snapshot.data() == null) {
          throw StateError('Order not found.');
        }

        final Map<String, dynamic> data = snapshot.data()!;
        final String ownerId = _text(data['userId']);
        final String currentStatus = _text(
          data['status'],
          fallback: 'placed',
        ).toLowerCase();

        if (ownerId != normalizedUserId) {
          throw StateError('You cannot cancel this order.');
        }

        const Set<String> cancellableStatuses = <String>{
          'placed',
          'confirmed',
          'processing',
        };

        if (!cancellableStatuses.contains(currentStatus)) {
          throw StateError('This order can no longer be cancelled.');
        }

        final Map<String, dynamic> historyEntry = <String, dynamic>{
          'status': 'cancelled',
          'time': Timestamp.now(),
          if (reason.trim().isNotEmpty) 'reason': reason.trim(),
        };

        transaction.update(
          reference,
          <String, dynamic>{
            'status': 'cancelled',
            'cancellationReason': reason.trim(),
            'cancelledAt': FieldValue.serverTimestamp(),
            'updatedAt': FieldValue.serverTimestamp(),
            'statusHistory': FieldValue.arrayUnion(
              <Map<String, dynamic>>[historyEntry],
            ),
          },
        );
      },
    );
  }

  Future<void> updatePaymentStatus({
    required String orderId,
    required String paymentStatus,
    String paymentId = '',
    String transactionId = '',
  }) async {
    final String normalizedOrderId = orderId.trim();
    final String normalizedPaymentStatus =
    paymentStatus.trim().toLowerCase();

    if (normalizedOrderId.isEmpty || normalizedPaymentStatus.isEmpty) {
      throw ArgumentError('Order ID and payment status are required.');
    }

    await _orders.doc(normalizedOrderId).update(
      <String, dynamic>{
        'paymentStatus': normalizedPaymentStatus,
        if (paymentId.trim().isNotEmpty) 'paymentId': paymentId.trim(),
        if (transactionId.trim().isNotEmpty)
          'transactionId': transactionId.trim(),
        'updatedAt': FieldValue.serverTimestamp(),
      },
    );
  }

  List<OrderModel> _sortAndLimit(
      List<OrderModel> orders,
      int limit,
      ) {
    orders.sort(
          (OrderModel first, OrderModel second) {
        final DateTime firstDate =
            first.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
        final DateTime secondDate =
            second.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);

        return secondDate.compareTo(firstDate);
      },
    );

    if (limit <= 0 || orders.length <= limit) {
      return List<OrderModel>.unmodifiable(orders);
    }

    return List<OrderModel>.unmodifiable(orders.take(limit));
  }
}

String _text(dynamic value, {String fallback = ''}) {
  if (value == null) {
    return fallback;
  }

  final String text = value.toString().trim();
  return text.isEmpty ? fallback : text;
}
