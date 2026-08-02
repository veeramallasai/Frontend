import 'package:flutter/material.dart';
import '../constants/api_endpoints.dart';
import '../models/cart_models.dart';
import '../services/api_client.dart';

class CartProvider with ChangeNotifier {
  final String _token;
  List<CartItem> _items = [];
  bool _isLoading = false;
  String? _appliedCouponCode;
  double _couponDiscountAmount = 0.0;

  CartProvider(this._token);

  List<CartItem> get items => _items;
  bool get isLoading => _isLoading;
  String? get appliedCouponCode => _appliedCouponCode;
  double get couponDiscountAmount => _couponDiscountAmount;

  double get subtotal => _items.fold(0.0, (sum, item) => sum + (item.product.price * item.quantity));
  
  double get productDiscount => _items.fold(0.0, (sum, item) {
    if (item.product.hasDiscount) {
      return sum + (item.product.savingPerUnit * item.quantity);
    }
    return sum;
  });

  double get finalAmount => subtotal - productDiscount - _couponDiscountAmount;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  Future<void> fetchCart() async {
    if (_token.isEmpty) return;
    _setLoading(true);
    try {
      final List<dynamic> data = await ApiClient.get(ApiEndpoints.cart + '/items', token: _token);
      _items = data.map((json) => CartItem.fromJson(json)).toList();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> addItemToCart(String productId, int quantity) async {
    if (_token.isEmpty) return;
    _setLoading(true);
    try {
      await ApiClient.post(ApiEndpoints.cart + '/items', {
        'productId': productId,
        'quantity': quantity,
      }, token: _token);
      await fetchCart();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> updateCartItem(String itemId, int quantity) async {
    if (_token.isEmpty) return;
    _setLoading(true);
    try {
      await ApiClient.put(ApiEndpoints.cart + '/items/$itemId?quantity=$quantity', {}, token: _token);
      await fetchCart();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> removeItemFromCart(String itemId) async {
    if (_token.isEmpty) return;
    _setLoading(true);
    try {
      await ApiClient.delete(ApiEndpoints.cart + '/items/$itemId', token: _token);
      await fetchCart();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> applyCoupon(String code) async {
    if (_token.isEmpty) return;
    _setLoading(true);
    try {
      final data = await ApiClient.post(ApiEndpoints.couponsApply, {
        'couponCode': code,
        'subtotal': subtotal - productDiscount,
      }, token: _token);
      _appliedCouponCode = code;
      _couponDiscountAmount = (data['discountAmount'] as num?)?.toDouble() ?? 0.0;
    } finally {
      _setLoading(false);
    }
  }

  void removeCoupon() {
    _appliedCouponCode = null;
    _couponDiscountAmount = 0.0;
    notifyListeners();
  }

  void clearCartLocal() {
    _items = [];
    _appliedCouponCode = null;
    _couponDiscountAmount = 0.0;
    notifyListeners();
  }
}
