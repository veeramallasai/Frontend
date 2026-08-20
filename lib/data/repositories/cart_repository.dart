import '../models/cart_item_model.dart';
import '../models/cart_model.dart';
import '../models/product_model.dart';
import '../remote/cart_remote_source.dart';
import 'session_repository.dart';

class CartRepository {
  CartRepository({CartRemoteSource? remoteSource})
      : _remoteSource = remoteSource ?? CartRemoteSource();

  final CartRemoteSource _remoteSource;
  String _explicitUserId = '';

  String get activeUserId {
    final session = SessionRepository().currentSession;
    if (session.userId.trim().isNotEmpty) return session.userId.trim();
    if (session.email.trim().isNotEmpty) return session.email.trim();
    return _explicitUserId.isNotEmpty ? _explicitUserId : 'guest';
  }

  void setUserId(String userId) {
    if (userId.trim().isNotEmpty) {
      _explicitUserId = userId.trim();
    }
  }

  Stream<CartModel> watchCart() {
    return _remoteSource.watchCart(activeUserId);
  }

  Future<CartModel> getCart() {
    return _remoteSource.getCart(activeUserId);
  }

  Future<void> addProduct(
    ProductModel product, {
    int quantity = 1,
    String? unit,
    String? shoppingMode,
  }) {
    final CartItemModel item = CartItemModel.fromProduct(
      product,
      quantity: quantity,
      unit: unit,
      shoppingMode: shoppingMode,
    );
    return _remoteSource.addItem(activeUserId, item);
  }

  Future<void> updateQuantity(String itemId, int quantity) {
    return _remoteSource.updateQuantity(
      userId: activeUserId,
      itemId: itemId,
      quantity: quantity,
    );
  }

  Future<void> removeItem(String itemId) {
    return _remoteSource.removeItem(activeUserId, itemId);
  }

  Future<void> applyCoupon(String couponCode, double discount) {
    return _remoteSource.applyCoupon(
      userId: activeUserId,
      couponCode: couponCode,
      discount: discount,
    );
  }

  Future<void> clearCart() {
    return _remoteSource.clearCart(activeUserId);
  }
}

