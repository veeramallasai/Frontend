import 'package:flutter/material.dart';
import '../constants/api_endpoints.dart';
import '../models/billing_models.dart';
import '../models/order_models.dart';
import '../services/api_client.dart';

class OrderProvider with ChangeNotifier {
  final String _token;
  List<OrderDetails> _orders = [];
  bool _isLoading = false;
  OrderDetails? _activeOrderDetails;
  BillSummary? _activeBillSummary;

  OrderProvider(this._token);

  List<OrderDetails> get orders => _orders;
  bool get isLoading => _isLoading;
  OrderDetails? get activeOrderDetails => _activeOrderDetails;
  BillSummary? get activeBillSummary => _activeBillSummary;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  Future<void> fetchOrders() async {
    if (_token.isEmpty) return;
    _setLoading(true);
    try {
      final data = await ApiClient.get(ApiEndpoints.orders, token: _token);
      final List<dynamic> content = data['content'] ?? [];
      _orders = content.map((json) => OrderDetails.fromJson(json)).toList();
    } finally {
      _setLoading(false);
    }
  }

  Future<OrderDetails> fetchOrderDetails(String orderId) async {
    if (_token.isEmpty) throw Exception('Authentication required');
    _setLoading(true);
    try {
      final data = await ApiClient.get('${ApiEndpoints.orders}/$orderId', token: _token);
      _activeOrderDetails = OrderDetails.fromJson(data);
      notifyListeners();
      return _activeOrderDetails!;
    } finally {
      _setLoading(false);
    }
  }

  Future<OrderDetails> placeOrder(String shippingAddressId, List<Map<String, dynamic>> items, String? couponCode) async {
    if (_token.isEmpty) throw Exception('Authentication required');
    _setLoading(true);
    try {
      final data = await ApiClient.post(
        ApiEndpoints.orders,
        {
          'shippingAddressId': shippingAddressId,
          'items': items,
          'couponCode': couponCode,
        },
        token: _token,
      );
      final newOrder = OrderDetails.fromJson(data);
      await fetchOrders();
      return newOrder;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> cancelOrder(String orderId) async {
    if (_token.isEmpty) return;
    _setLoading(true);
    try {
      await ApiClient.patch('${ApiEndpoints.cancelOrder}/$orderId/cancel', {}, token: _token);
      await fetchOrders();
      if (_activeOrderDetails?.id == orderId) {
        await fetchOrderDetails(orderId);
      }
    } finally {
      _setLoading(false);
    }
  }

  Future<BillSummary> fetchBillSummary(String orderId) async {
    if (_token.isEmpty) throw Exception('Authentication required');
    _setLoading(true);
    try {
      final data = await ApiClient.get('${ApiEndpoints.billSummary}/$orderId/bill-summary', token: _token);
      _activeBillSummary = BillSummary.fromJson(data);
      notifyListeners();
      return _activeBillSummary!;
    } finally {
      _setLoading(false);
    }
  }

  Future<String> downloadInvoiceText(String orderId) async {
    if (_token.isEmpty) throw Exception('Authentication required');
    _setLoading(true);
    try {
      final response = await ApiClient.getRaw('${ApiEndpoints.invoice}/$orderId/invoice', token: _token);
      return response;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> processPayment(String orderId, String method, String transactionRef) async {
    if (_token.isEmpty) throw Exception('Authentication required');
    _setLoading(true);
    try {
      await ApiClient.post(
        '/api/v1/payments',
        {
          'orderId': orderId,
          'method': method,
          'transactionRef': transactionRef,
        },
        token: _token,
      );
    } finally {
      _setLoading(false);
    }
  }
}
