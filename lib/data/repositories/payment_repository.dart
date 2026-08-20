import '../models/payment_model.dart';
import '../remote/payment_remote_source.dart';

class PaymentRepository {
  PaymentRepository({PaymentRemoteSource? remoteSource})
      : _remoteSource = remoteSource ?? PaymentRemoteSource();

  final PaymentRemoteSource _remoteSource;
  String _activeUserId = 'guest';

  void setUserId(String userId) {
    if (userId.trim().isNotEmpty) {
      _activeUserId = userId.trim();
    }
  }

  String? get currentUserId => _activeUserId;

  Stream<List<PaymentModel>> watchCurrentUserPayments({int limit = 50}) {
    return _remoteSource.watchUserPayments(_activeUserId, limit: limit);
  }

  Future<List<PaymentModel>> getCurrentUserPayments({int limit = 50}) {
    return _remoteSource.getUserPayments(_activeUserId, limit: limit);
  }

  Stream<PaymentModel?> watchPayment(String paymentId) {
    return _remoteSource.watchPayment(paymentId);
  }

  Future<PaymentModel?> getPayment(String paymentId) {
    return _remoteSource.getPayment(paymentId);
  }

  Future<PaymentModel?> getPaymentForOrder(String orderId) {
    return _remoteSource.getPaymentForOrder(orderId);
  }

  Future<String> createPayment(PaymentModel payment) {
    return _remoteSource.createPayment(payment.copyWith(userId: _activeUserId));
  }

  Future<void> updatePaymentStatus({
    required String paymentId,
    required String status,
    String transactionId = '',
  }) {
    return _remoteSource.updatePaymentStatus(
      paymentId: paymentId,
      status: status,
      transactionId: transactionId,
    );
  }
}
