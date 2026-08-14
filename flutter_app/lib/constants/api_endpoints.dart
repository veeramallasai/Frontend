import 'package:flutter/foundation.dart';

class ApiEndpoints {
  // Deployed backend on Railway
  static String get baseUrl => 'https://farmtohome-production-ca90.up.railway.app';

  // Auth Routes
  static const String login = '/api/v1/auth/login';
  static const String register = '/api/v1/auth/register';
  static const String otpGenerate = '/api/v1/auth/forgot-password';
  static const String otpVerify = '/api/v1/auth/verify-email';
  static const String forgotPassword = '/api/v1/auth/forgot-password';
  static const String resetPassword = '/api/v1/auth/reset-password';

  // Customer Profile
  static const String customerProfile = '/api/v1/auth/profile';

  // Product & Categories Routes
  static const String categories = '/api/v1/categories';
  static const String products = '/api/v1/products';

  // Cart Routes
  static const String cart = '/api/v1/cart';

  // Coupon Routes
  static const String coupons = '/api/v1/coupons';
  static const String couponsApply = '/api/v1/coupons/apply';

  // Delivery Slots
  static const String deliverySlots = '/api/v1/delivery-slots';
  static const String selectDeliverySlot = '/api/v1/orders/select-delivery-slot';
  static const String rescheduleDelivery = '/api/v1/orders/reschedule';
  static const String trackDelivery = '/api/v1/orders/tracking'; // appends /{orderId}

  // Orders
  static const String orders = '/api/v1/orders'; // POST /api/v1/orders, GET /api/v1/orders, GET /api/v1/orders/{id}
  static const String cancelOrder = '/api/v1/orders'; // appends /{id}/cancel
  static const String billSummary = '/api/v1/orders'; // appends /{id}/bill-summary
  static const String invoice = '/api/v1/orders';     // appends /{id}/invoice
}
