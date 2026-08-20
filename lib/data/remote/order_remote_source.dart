import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/order_item_model.dart';
import '../models/order_model.dart';

class OrderRemoteSource {
  OrderRemoteSource({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;
  final List<OrderModel> _orders = <OrderModel>[];

  Stream<List<OrderModel>> watchUserOrders(
    String userId, {
    int limit = 50,
  }) async* {
    final List<OrderModel> orders = await getUserOrders(userId, limit: limit);
    yield orders;
  }

  List<OrderModel> getUserOrdersSync(String userId, {int limit = 50}) {
    final List<OrderModel> filtered = _orders
        .where((OrderModel o) => userId.trim().isEmpty || o.userId == userId.trim())
        .toList();
    filtered.sort((OrderModel a, OrderModel b) => (b.createdAt ?? DateTime(1970)).compareTo(a.createdAt ?? DateTime(1970)));
    return filtered.take(limit).toList();
  }

  Future<List<OrderModel>> getUserOrders(
    String userId, {
    int limit = 50,
  }) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getUserOrders(size: limit);
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        List<dynamic> items = <dynamic>[];
        if (raw is List) {
          items = raw;
        } else if (raw is Map && raw['content'] is List) {
          items = raw['content'] as List;
        }

        if (items.isNotEmpty) {
          final List<OrderModel> remoteOrders = items
              .whereType<Map<String, dynamic>>()
              .map((Map<String, dynamic> map) => OrderModel.fromMap(map))
              .toList(growable: true);

          for (final OrderModel ro in remoteOrders) {
            _orders.removeWhere((OrderModel local) => local.id == ro.id);
            _orders.add(ro);
          }

          remoteOrders.sort((OrderModel a, OrderModel b) => (b.createdAt ?? DateTime(1970)).compareTo(a.createdAt ?? DateTime(1970)));
          return remoteOrders.take(limit).toList();
        }
      }
    } catch (_) {}

    return <OrderModel>[];
  }

  Stream<OrderModel?> watchOrder(String orderId) async* {
    final OrderModel? order = await getOrder(orderId);
    yield order;
  }

  Future<OrderModel?> getOrder(String orderId) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getOrder(orderId);
      if (response.isSuccess && response.data is Map<String, dynamic>) {
        return OrderModel.fromMap(response.data as Map<String, dynamic>);
      }
    } catch (_) {}
    return null;
  }

  Future<String> createOrder(OrderModel order) async {
    final List<Map<String, dynamic>> orderItemsPayload = order.items
        .where((OrderItemModel item) => item.productId.trim().isNotEmpty)
        .map((OrderItemModel item) => <String, dynamic>{
              'productId': item.productId.trim(),
              'quantity': item.quantity > 0 ? item.quantity : 1,
            })
        .toList();

    String enumPaymentMethod = 'CASH_ON_DELIVERY';
    final String pm = order.paymentMethod.trim().toLowerCase();
    if (pm.contains('upi')) {
      enumPaymentMethod = 'UPI';
    } else if (pm.contains('card')) {
      enumPaymentMethod = 'CREDIT_CARD';
    } else if (pm.contains('net')) {
      enumPaymentMethod = 'NET_BANKING';
    } else if (pm.contains('wallet')) {
      enumPaymentMethod = 'WALLET';
    }

    final Map<String, dynamic> body = <String, dynamic>{
      if (order.addressId.trim().isNotEmpty && order.addressId.length > 20)
        'shippingAddressId': order.addressId.trim(),
      if (order.couponCode.trim().isNotEmpty)
        'couponCode': order.couponCode.trim(),
      'paymentMethod': enumPaymentMethod,
      'transactionRef': order.transactionId.trim().isNotEmpty ? order.transactionId.trim() : 'TXN_${DateTime.now().millisecondsSinceEpoch}',
      'items': orderItemsPayload,
    };

    try {
      final ApiResponse<dynamic> response = await _apiService.createOrder(body);
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        if (raw is Map && raw['id'] != null) {
          return raw['id'].toString();
        }
      }
    } catch (_) {}

    return order.id;
  }

  Future<void> updateOrderStatus({
    required String orderId,
    required String status,
  }) async {
    final int index = _orders.indexWhere((OrderModel o) => o.id == orderId.trim());
    if (index >= 0) {
      _orders[index] = _orders[index].copyWith(status: status);
    }
    try {
      await _apiService.updateOrder(orderId, <String, dynamic>{'status': status});
    } catch (_) {}
  }

  Future<void> cancelOrder(String orderId, {String? reason}) async {
    await updateOrderStatus(orderId: orderId, status: 'cancelled');
    try {
      await _apiService.cancelOrder(orderId, reason: reason);
    } catch (_) {}
  }
}
