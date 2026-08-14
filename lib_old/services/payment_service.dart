import 'dart:math';

import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/payment_model.dart';

class PaymentService {
  PaymentService({FirebaseFirestore? firestore})
      : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  static const String collectionName = 'payments';

  CollectionReference<Map<String, dynamic>> get _payments =>
      _db.collection(collectionName);

  Stream<List<PaymentModel>> watchUserPayments(String userId) {
    final String cleanUserId = userId.trim();
    if (cleanUserId.isEmpty) {
      return Stream<List<PaymentModel>>.value(
        const <PaymentModel>[],
      );
    }

    return _payments
        .where('userId', isEqualTo: cleanUserId)
        .snapshots()
        .map((snapshot) {
      final payments = snapshot.docs
          .map((doc) => PaymentModel.fromMap(doc.id, doc.data()))
          .toList();
      payments.sort((a, b) => b.createdAt.compareTo(a.createdAt));
      return payments;
    });
  }

  Stream<PaymentModel?> watchPayment(String paymentId) {
    final String cleanId = paymentId.trim();
    if (cleanId.isEmpty) {
      return Stream<PaymentModel?>.value(null);
    }

    return _payments.doc(cleanId).snapshots().map((snapshot) {
      final data = snapshot.data();
      if (!snapshot.exists || data == null) return null;
      return PaymentModel.fromMap(snapshot.id, data);
    });
  }

  Future<PaymentModel> createPayment(PaymentModel payment) async {
    _validate(payment);

    final reference = _payments.doc();
    final stored = payment.copyWith(
      id: reference.id,
      transactionId: payment.transactionId.isEmpty
          ? _generateTransactionId()
          : payment.transactionId,
      status: PaymentStatus.pending,
      updatedAt: DateTime.now(),
    );

    try {
      await reference.set(<String, dynamic>{
        ...stored.toMap(),
        'id': reference.id,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
      return stored;
    } on FirebaseException catch (error) {
      throw PaymentServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<PaymentResult> processPayment(PaymentModel payment) async {
    final created = await createPayment(payment);

    try {
      await updateStatus(
        paymentId: created.id!,
        status: PaymentStatus.processing,
      );

      await Future<void>.delayed(
        const Duration(milliseconds: 900),
      );

      final success = created.copyWith(
        status: PaymentStatus.success,
        completedAt: DateTime.now(),
        gateway: created.method == PaymentMethodType.cashOnDelivery
            ? 'cash_on_delivery'
            : (created.gateway == 'internal'
            ? 'mock_gateway'
            : created.gateway),
        gatewayResponse: <String, dynamic>{
          'message': 'Payment processed successfully',
          'mode': created.method.name,
        },
      );

      await completePayment(success);
      return PaymentResult.success(success);
    } catch (error) {
      await updateStatus(
        paymentId: created.id!,
        status: PaymentStatus.failed,
        failureReason: 'Payment processing failed.',
      );
      return const PaymentResult.failure(
        'Payment processing failed.',
      );
    }
  }

  Future<void> completePayment(PaymentModel payment) async {
    final String? id = payment.id;
    if (id == null || id.trim().isEmpty) {
      throw const PaymentServiceException(
        message: 'Payment ID is required.',
        code: 'missing-payment-id',
      );
    }

    await _payments.doc(id).set(<String, dynamic>{
      ...payment.toMap(),
      'status': PaymentStatus.success.name,
      'completedAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<void> updateStatus({
    required String paymentId,
    required PaymentStatus status,
    String failureReason = '',
  }) async {
    final String cleanId = paymentId.trim();
    if (cleanId.isEmpty) return;

    await _payments.doc(cleanId).set(<String, dynamic>{
      'status': status.name,
      'failureReason': failureReason,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  Future<PaymentModel?> getPayment(String paymentId) async {
    final String cleanId = paymentId.trim();
    if (cleanId.isEmpty) return null;

    final snapshot = await _payments.doc(cleanId).get();
    final data = snapshot.data();
    if (!snapshot.exists || data == null) return null;
    return PaymentModel.fromMap(snapshot.id, data);
  }

  Future<List<PaymentModel>> getOrderPayments(String orderId) async {
    final snapshot = await _payments
        .where('orderId', isEqualTo: orderId.trim())
        .get();

    final payments = snapshot.docs
        .map((doc) => PaymentModel.fromMap(doc.id, doc.data()))
        .toList();
    payments.sort((a, b) => b.createdAt.compareTo(a.createdAt));
    return payments;
  }

  Future<void> refundPayment({
    required String paymentId,
    String reason = '',
  }) async {
    final String cleanId = paymentId.trim();
    if (cleanId.isEmpty) {
      throw const PaymentServiceException(
        message: 'Payment ID is required.',
        code: 'missing-payment-id',
      );
    }

    await _payments.doc(cleanId).set(<String, dynamic>{
      'status': PaymentStatus.refunded.name,
      'refundReason': reason,
      'refundedAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  void _validate(PaymentModel payment) {
    if (payment.userId.trim().isEmpty) {
      throw const PaymentServiceException(
        message: 'User ID is required.',
        code: 'missing-user-id',
      );
    }
    if (payment.orderId.trim().isEmpty) {
      throw const PaymentServiceException(
        message: 'Order ID is required.',
        code: 'missing-order-id',
      );
    }
    if (payment.totalAmount < 0) {
      throw const PaymentServiceException(
        message: 'Payment amount cannot be negative.',
        code: 'invalid-amount',
      );
    }
  }

  String _generateTransactionId() {
    final int random = Random().nextInt(999999);
    final int millis = DateTime.now().millisecondsSinceEpoch;
    return 'FTH$millis${random.toString().padLeft(6, '0')}';
  }

  String _firebaseMessage(FirebaseException error) {
    switch (error.code) {
      case 'permission-denied':
        return 'Firestore permission denied. Check payment rules.';
      case 'unavailable':
        return 'Payment service is unavailable. Check your internet.';
      case 'deadline-exceeded':
        return 'Payment request timed out. Please try again.';
      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Unable to complete payment operation.';
    }
  }
}

class PaymentResult {
  final bool isSuccessful;
  final PaymentModel? payment;
  final String message;

  const PaymentResult._({
    required this.isSuccessful,
    required this.payment,
    required this.message,
  });

  const PaymentResult.success(PaymentModel payment)
      : this._(
    isSuccessful: true,
    payment: payment,
    message: 'Payment completed successfully.',
  );

  const PaymentResult.failure(String message)
      : this._(
    isSuccessful: false,
    payment: null,
    message: message,
  );
}

class PaymentServiceException implements Exception {
  final String message;
  final String code;
  final Object? originalError;

  const PaymentServiceException({
    required this.message,
    this.code = 'payment-service-error',
    this.originalError,
  });

  @override
  String toString() {
    return 'PaymentServiceException(code: $code, message: $message)';
  }
}
