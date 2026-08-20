import '../models/cart_item_model.dart';
import '../models/cart_model.dart';
import '../models/order_item_model.dart';
import '../models/order_model.dart';
import '../remote/order_remote_source.dart';

class OrderRepository {
  OrderRepository({OrderRemoteSource? remoteSource})
      : _remoteSource = remoteSource ?? OrderRemoteSource();

  final OrderRemoteSource _remoteSource;
  String _activeUserId = 'guest';

  void setUserId(String userId) {
    if (userId.trim().isNotEmpty) {
      _activeUserId = userId.trim();
    }
  }

  String? get currentUserId => _activeUserId;
  bool get isSignedIn => _activeUserId != 'guest';

  Stream<List<OrderModel>> watchCurrentUserOrders({int limit = 50}) {
    return _remoteSource.watchUserOrders(_activeUserId, limit: limit);
  }

  Stream<List<OrderModel>> watchOrdersByStatus(String status, {int limit = 50}) {
    final String normalized = status.trim().toLowerCase();
    return watchCurrentUserOrders(limit: limit).map((List<OrderModel> orders) {
      if (normalized.isEmpty || normalized == 'all') return orders;
      return orders.where((OrderModel o) => o.status == normalized).toList();
    });
  }

  Future<List<OrderModel>> getCurrentUserOrders({int limit = 50}) {
    return _remoteSource.getUserOrders(_activeUserId, limit: limit);
  }

  Stream<OrderModel?> watchOrder(String orderId) {
    return _remoteSource.watchOrder(orderId);
  }

  Future<OrderModel?> getOrder(String orderId) {
    return _remoteSource.getOrder(orderId);
  }

  Future<String> createOrder(OrderModel order) {
    return _remoteSource.createOrder(order.copyWith(userId: _activeUserId));
  }

  Future<String> createOrderFromCart({
    required CartModel cart,
    required Map<String, dynamic> shippingAddress,
    required String paymentMethod,
    required String deliveryMethod,
    String? deliverySlot,
    String? notes,
  }) async {
    final List<OrderItemModel> items = cart.items.map((CartItemModel item) {
      return OrderItemModel(
        productId: item.productId,
        productName: item.name,
        unitPrice: item.unitPrice,
        mrp: item.mrp,
        quantity: item.quantity,
        unit: item.unit,
        imageUrl: item.imageUrl,
        shoppingMode: item.shoppingMode,
      );
    }).toList();

    final OrderModel order = OrderModel(
      id: '',
      userId: _activeUserId,
      items: items,
      subtotal: cart.subtotal,
      deliveryFee: cart.discount > 0 ? 0 : 35,
      discount: cart.discount,
      totalAmount: cart.totalAmount,
      status: 'placed',
      paymentMethod: paymentMethod,
      isPaid: paymentMethod.toLowerCase() == 'online',
      shippingAddress: shippingAddress,
      deliveryMethod: deliveryMethod,
      deliverySlot: deliverySlot ?? '',
      notes: notes ?? '',
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );

    return createOrder(order);
  }

  Future<void> cancelOrder({required String orderId, String? reason}) {
    return _remoteSource.cancelOrder(orderId, reason: reason);
  }

  Future<void> reorder(String orderId) async {
    final OrderModel? existing = await getOrder(orderId);
    if (existing != null) {
      await createOrder(existing.copyWith(id: '', status: 'placed', createdAt: DateTime.now()));
    }
  }
}
