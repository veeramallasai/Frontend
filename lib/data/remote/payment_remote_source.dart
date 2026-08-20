import '../models/payment_model.dart';
import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';

class PaymentRemoteSource {
  PaymentRemoteSource({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  final List<PaymentModel> _payments = <PaymentModel>[];

  Stream<List<PaymentModel>> watchUserPayments(
    String userId, {
    int limit = 50,
  }) async* {
    yield getUserPaymentsSync(userId, limit: limit);
  }

  List<PaymentModel> getUserPaymentsSync(String userId, {int limit = 50}) {
    final List<PaymentModel> list = _payments.where((PaymentModel p) => p.userId == userId.trim()).toList();
    list.sort((PaymentModel a, PaymentModel b) => (b.createdAt ?? DateTime(1970)).compareTo(a.createdAt ?? DateTime(1970)));
    return list.take(limit).toList();
  }

  Future<List<PaymentModel>> getUserPayments(
    String userId, {
    int limit = 50,
  }) async {
    return getUserPaymentsSync(userId, limit: limit);
  }

  Stream<PaymentModel?> watchPayment(String paymentId) async* {
    yield getPaymentSync(paymentId);
  }

  PaymentModel? getPaymentSync(String paymentId) {
    try {
      return _payments.firstWhere((PaymentModel p) => p.id == paymentId.trim());
    } catch (_) {
      return null;
    }
  }

  Future<PaymentModel?> getPayment(String paymentId) async {
    return getPaymentSync(paymentId);
  }

  Future<PaymentModel?> getPaymentForOrder(String orderId) async {
    try {
      return _payments.firstWhere((PaymentModel p) => p.orderId == orderId.trim());
    } catch (_) {
      return null;
    }
  }

  Future<String> createPayment(PaymentModel payment) async {
    final ApiResponse<dynamic> response = await _apiService.createPayment(payment.toMap());
    if (!response.isSuccess || response.data is! Map) {
      throw StateError(response.message.isNotEmpty ? response.message : 'Unable to save payment.');
    }
    final Map<String, dynamic> data = Map<String, dynamic>.from(response.data as Map);
    final String id = (data['id'] ?? payment.id).toString();
    _payments.removeWhere((PaymentModel p) => p.id == id);
    _payments.add(payment.copyWith(id: id));
    return id;
  }

  Future<void> updatePaymentStatus({
    required String paymentId,
    required String status,
    String transactionId = '',
  }) async {
    final int index = _payments.indexWhere((PaymentModel p) => p.id == paymentId.trim());
    if (index >= 0) {
      _payments[index] = _payments[index].copyWith(
        status: status,
        transactionId: transactionId.isNotEmpty ? transactionId : _payments[index].transactionId,
      );
    }
  }
}
