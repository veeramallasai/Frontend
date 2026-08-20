import '../constants/api_endpoints.dart';
import '../network/api_client.dart';
import '../network/api_response.dart';

class BackendApiService {
  BackendApiService({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<ApiResponse<dynamic>> healthCheck() => _client.get(ApiEndpoints.health);

  Future<ApiResponse<dynamic>> login({
    required String identifier,
    required String password,
  }) {
    return _client.post(
      ApiEndpoints.login,
      body: <String, dynamic>{
        'email': identifier.trim(),
        'identifier': identifier.trim(),
        'password': password,
      },
    );
  }

  Future<ApiResponse<dynamic>> register(Map<String, dynamic> userData) {
    return _client.post(
      ApiEndpoints.register,
      body: userData,
    );
  }

  Future<ApiResponse<dynamic>> sendEmailOtp(String email) {
    return _client.post(
      ApiEndpoints.sendEmailOtp,
      body: <String, dynamic>{'email': email.trim()},
    );
  }

  Future<ApiResponse<dynamic>> verifyEmailOtp({
    required String email,
    required String otpCode,
  }) {
    return _client.post(
      ApiEndpoints.verifyEmailOtp,
      body: <String, dynamic>{
        'email': email.trim(),
        'otpCode': otpCode.trim(),
      },
    );
  }

  Future<ApiResponse<dynamic>> resendOtp(String email) {
    return _client.post(
      ApiEndpoints.resendOtp,
      body: <String, dynamic>{'email': email.trim()},
    );
  }

  Future<ApiResponse<dynamic>> forgotPassword(String email) {
    return _client.post(
      ApiEndpoints.forgotPassword,
      body: <String, dynamic>{'email': email.trim()},
    );
  }

  Future<ApiResponse<dynamic>> resetPassword({
    required String email,
    required String otpCode,
    required String newPassword,
  }) {
    return _client.post(
      ApiEndpoints.resetPassword,
      body: <String, dynamic>{
        'email': email.trim(),
        'otpCode': otpCode.trim(),
        'newPassword': newPassword,
      },
    );
  }

  Future<ApiResponse<dynamic>> getProfile() => _client.get(ApiEndpoints.profile);

  Future<ApiResponse<dynamic>> updateProfile(Map<String, dynamic> data) =>
      _client.patch(ApiEndpoints.profile, body: data);

  Future<ApiResponse<dynamic>> getProducts({
    String category = '',
    String shoppingMode = 'home',
    int limit = 100,
  }) {
    return _client.get(ApiEndpoints.products, queryParameters: <String, dynamic>{
      if (category.trim().isNotEmpty) 'category': category.trim().toLowerCase(),
      'shoppingMode': shoppingMode == 'shop' ? 'shop' : 'home',
      'limit': limit,
    });
  }

  Future<ApiResponse<dynamic>> createProduct(Map<String, dynamic> productData) {
    return _client.post(ApiEndpoints.products, body: productData);
  }

  Future<ApiResponse<dynamic>> updateProduct(String productId, Map<String, dynamic> productData) {
    return _client.put(ApiEndpoints.product(productId), body: productData);
  }

  Future<ApiResponse<dynamic>> getCategories() => _client.get(ApiEndpoints.categories);

  // Cart operations
  Future<ApiResponse<dynamic>> getCart([String? userId]) =>
      _client.get('${ApiEndpoints.cart}/summary');

  Future<ApiResponse<dynamic>> getCartItems() =>
      _client.get('${ApiEndpoints.cart}/items');

  Future<ApiResponse<dynamic>> addCartItem(dynamic userIdOrItem, [Map<String, dynamic>? item]) {
    String productId;
    int quantity;
    if (userIdOrItem is Map<String, dynamic>) {
      productId = userIdOrItem['productId']?.toString() ?? '';
      quantity = (userIdOrItem['quantity'] as num?)?.toInt() ?? 1;
    } else if (item != null) {
      productId = item['productId']?.toString() ?? '';
      quantity = (item['quantity'] as num?)?.toInt() ?? 1;
    } else {
      productId = userIdOrItem.toString();
      quantity = 1;
    }
    return _client.post(
      '${ApiEndpoints.cart}/items',
      body: <String, dynamic>{
        'productId': productId,
        'quantity': quantity,
      },
    );
  }

  Future<ApiResponse<dynamic>> updateCartQuantity({
    dynamic userId,
    required String itemId,
    required int quantity,
  }) =>
      _client.put(
        '${ApiEndpoints.cart}/items/$itemId',
        queryParameters: <String, dynamic>{'quantity': quantity},
      );

  Future<ApiResponse<dynamic>> removeCartItem(dynamic userIdOrItemId, [String? itemId]) {
    final String targetId = itemId ?? userIdOrItemId.toString();
    return _client.delete('${ApiEndpoints.cart}/items/$targetId');
  }

  Future<ApiResponse<dynamic>> clearCart([String? userId]) =>
      _client.delete(ApiEndpoints.cart);

  // Order operations
  Future<ApiResponse<dynamic>> createOrder(Map<String, dynamic> order) =>
      _client.post(ApiEndpoints.orders, body: order);

  Future<ApiResponse<dynamic>> getUserOrders({int page = 0, int size = 50}) =>
      _client.get(ApiEndpoints.orders, queryParameters: <String, dynamic>{
        'page': page,
        'size': size,
      });

  Future<ApiResponse<dynamic>> getOrder(String orderId) =>
      _client.get(ApiEndpoints.order(orderId));

  Future<ApiResponse<dynamic>> updateOrder(
    String orderId,
    Map<String, dynamic> changes,
  ) => _client.patch(ApiEndpoints.order(orderId), body: changes);

  Future<ApiResponse<dynamic>> cancelOrder(String orderId, {String? reason}) =>
      _client.patch(
        '${ApiEndpoints.order(orderId)}/cancel',
        body: <String, dynamic>{'reason': reason ?? ''},
      );

  // Address operations
  Future<ApiResponse<dynamic>> getAddresses() => _client.get(ApiEndpoints.addresses);

  Future<ApiResponse<dynamic>> createAddress(Map<String, dynamic> address) =>
      _client.post(ApiEndpoints.addresses, body: address);

  Future<ApiResponse<dynamic>> updateAddress(String id, Map<String, dynamic> address) =>
      _client.put('${ApiEndpoints.addresses}/$id', body: address);

  Future<ApiResponse<dynamic>> deleteAddress(String id) =>
      _client.delete('${ApiEndpoints.addresses}/$id');

  // Payment operations
  Future<ApiResponse<dynamic>> createPayment(Map<String, dynamic> payment) =>
      _client.post(ApiEndpoints.payments, body: payment);

    Future<ApiResponse<dynamic>> createSupportTicket(Map<String, dynamic> ticket) =>
      _client.post('${ApiEndpoints.apiVersion}/support/tickets', body: ticket);

  Future<ApiResponse<dynamic>> validateCoupon({
    required String code,
    required double subtotal,
  }) => _client.post(
        '${ApiEndpoints.checkout}/coupon',
        body: <String, dynamic>{'code': code.trim().toUpperCase(), 'subtotal': subtotal},
      );

  // Farmers
  Future<ApiResponse<dynamic>> getFarmers({int limit = 100}) =>
      _client.get('/${ApiEndpoints.apiVersion}/farmers', queryParameters: <String, dynamic>{'limit': limit});

  Future<ApiResponse<dynamic>> getFarmer(String farmerId) =>
      _client.get('/${ApiEndpoints.apiVersion}/farmers/$farmerId');

  // Delivery slots
  Future<ApiResponse<dynamic>> getDeliverySlots({String method = 'scheduled'}) =>
      _client.get(ApiEndpoints.deliverySlots, queryParameters: <String, dynamic>{'method': method});

  // Banners & Coupons
  Future<ApiResponse<dynamic>> getBanners() =>
      _client.get('/${ApiEndpoints.apiVersion}/banners');

  Future<ApiResponse<dynamic>> getCoupons() =>
      _client.get('/${ApiEndpoints.apiVersion}/coupons');

  // Reviews
  Future<ApiResponse<dynamic>> getReviews(String productId) =>
      _client.get('${ApiEndpoints.reviews}/product/$productId');

  Future<ApiResponse<dynamic>> createReview(Map<String, dynamic> data) =>
      _client.post(ApiEndpoints.reviews, body: data);

  // Notifications
  Future<ApiResponse<dynamic>> getNotifications() =>
      _client.get(ApiEndpoints.notifications);

  Future<ApiResponse<dynamic>> markNotificationAsRead(String id) =>
      _client.put('${ApiEndpoints.notifications}/$id/read');

  Future<ApiResponse<dynamic>> markAllNotificationsAsRead() =>
      _client.put('${ApiEndpoints.notifications}/read-all');

  Future<ApiResponse<dynamic>> deleteNotification(String id) =>
      _client.delete('${ApiEndpoints.notifications}/$id');

  void dispose() => _client.dispose();
}
