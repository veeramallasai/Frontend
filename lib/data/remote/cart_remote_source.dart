import 'dart:async';

import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/cart_item_model.dart';
import '../models/cart_model.dart';

class CartRemoteSource {
  CartRemoteSource({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;
  static final Map<String, CartModel> _carts = <String, CartModel>{};
  static final StreamController<CartModel> _cartStreamController =
      StreamController<CartModel>.broadcast();

  Stream<CartModel> watchCart(String userId) async* {
    final String key = userId.trim().isEmpty ? 'guest' : userId.trim();
    final CartModel cart = await getCart(key);
    yield cart;
    yield* _cartStreamController.stream.where(
      (CartModel c) => c.userId == key || key == 'guest' || c.userId == 'guest',
    );
  }

  CartModel getCartSync(String userId) {
    final String key = userId.trim().isEmpty ? 'guest' : userId.trim();
    return _carts[key] ?? CartModel.empty(key);
  }

  Future<CartModel> getCart(String userId) async {
    final String key = userId.trim().isEmpty ? 'guest' : userId.trim();
    try {
      if (key != 'guest') {
        final ApiResponse<dynamic> response = await _apiService.getCart();
        if (response.isSuccess && response.data != null) {
          final dynamic data = response.data;
          if (data is Map<String, dynamic>) {
            final CartModel remoteCart = CartModel.fromMap(data, documentId: key);
            if (remoteCart.items.isNotEmpty || (_carts[key]?.items.isEmpty ?? true)) {
              _notify(key, remoteCart);
              return remoteCart;
            }
          } else if (data is List) {
            final List<CartItemModel> items = data
                .whereType<Map>()
                .map((Map item) => CartItemModel.fromMap(
                      item.map((dynamic k, dynamic v) => MapEntry(k.toString(), v)),
                    ))
                .toList();
            final CartModel remoteCart = CartModel(userId: key, shoppingMode: 'home', items: items);
            _notify(key, remoteCart);
            return remoteCart;
          }
        }
      }
    } catch (_) {
      // Fallback to local in-memory cart state
    }
    return getCartSync(key);
  }

  void _notify(String userId, CartModel cart) {
    final String key = userId.trim().isEmpty ? 'guest' : userId.trim();
    _carts[key] = cart;
    if (!_cartStreamController.isClosed) {
      _cartStreamController.add(cart);
    }
  }

  Future<void> addItem(String userId, CartItemModel item) async {
    final String key = userId.trim().isEmpty ? 'guest' : userId.trim();
    final CartModel cart = getCartSync(key);
    final List<CartItemModel> items = List<CartItemModel>.from(cart.items);
    final int index = items.indexWhere((CartItemModel value) => value.id == item.id || value.productId == item.productId);

    if (index >= 0) {
      final CartItemModel current = items[index];
      items[index] = current.copyWith(
        quantity: current.quantity + item.quantity,
        unitPrice: item.unitPrice,
        mrp: item.mrp,
        imageUrl: item.imageUrl,
      );
    } else {
      items.add(item);
    }

    final CartModel updatedCart = cart.copyWith(items: items);
    _notify(key, updatedCart);

    try {
      if (key != 'guest') {
        final ApiResponse<dynamic> res = await _apiService.addCartItem(
          <String, dynamic>{
            'productId': item.productId,
            'quantity': item.quantity,
          },
        );
        if (res.isSuccess) {
          await getCart(key);
        }
      }
    } catch (_) {}
  }

  Future<void> updateQuantity({
    required String userId,
    required String itemId,
    required int quantity,
  }) async {
    final String key = userId.trim().isEmpty ? 'guest' : userId.trim();
    final CartModel cart = getCartSync(key);
    final List<CartItemModel> items = quantity <= 0
        ? cart.items.where((CartItemModel item) => item.id != itemId && item.productId != itemId).toList()
        : cart.items.map((CartItemModel item) {
            return (item.id == itemId || item.productId == itemId) ? item.copyWith(quantity: quantity) : item;
          }).toList();
    final CartModel updatedCart = cart.copyWith(items: items);
    _notify(key, updatedCart);

    try {
      if (key != 'guest') {
        if (quantity <= 0) {
          await _apiService.removeCartItem(itemId);
        } else {
          await _apiService.updateCartQuantity(itemId: itemId, quantity: quantity);
        }
        await getCart(key);
      }
    } catch (_) {}
  }

  Future<void> removeItem(String userId, String itemId) async {
    await updateQuantity(userId: userId, itemId: itemId, quantity: 0);
  }

  Future<void> applyCoupon({
    required String userId,
    required String couponCode,
    required double discount,
  }) async {
    final String key = userId.trim().isEmpty ? 'guest' : userId.trim();
    final CartModel cart = getCartSync(key);
    final CartModel updatedCart = cart.copyWith(couponCode: couponCode, discount: discount);
    _notify(key, updatedCart);
  }

  Future<void> clearCart(String userId) async {
    final String key = userId.trim().isEmpty ? 'guest' : userId.trim();
    final CartModel emptyCart = CartModel.empty(key);
    _notify(key, emptyCart);
    try {
      if (key != 'guest') {
        await _apiService.clearCart();
        await getCart(key);
      }
    } catch (_) {}
  }
}

