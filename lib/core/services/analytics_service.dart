import 'package:flutter/foundation.dart';

typedef AnalyticsEmitter = Future<void> Function(
  String event,
  Map<String, Object?> parameters,
);

class AnalyticsService {
  AnalyticsService({AnalyticsEmitter? emitter}) : _emitter = emitter;

  final AnalyticsEmitter? _emitter;

  Future<void> logEvent(
    String event, {
    Map<String, Object?> parameters = const <String, Object?>{},
  }) async {
    final String name = _normalize(event);
    if (name.isEmpty) return;
    if (kDebugMode) debugPrint('[Analytics] $name $parameters');
    await _emitter?.call(name, Map<String, Object?>.unmodifiable(parameters));
  }

  Future<void> logScreen(String screenName) => logEvent(
        'screen_view',
        parameters: <String, Object?>{'screen_name': screenName.trim()},
      );

  Future<void> logLogin(String method) => logEvent(
        'login',
        parameters: <String, Object?>{'method': method.trim()},
      );

  Future<void> logAddToCart({required String productId, required double value}) =>
      logEvent('add_to_cart', parameters: <String, Object?>{
        'product_id': productId,
        'value': value,
        'currency': 'INR',
      });

  Future<void> logPurchase({required String orderId, required double value}) =>
      logEvent('purchase', parameters: <String, Object?>{
        'order_id': orderId,
        'value': value,
        'currency': 'INR',
      });

  String _normalize(String value) => value
      .trim()
      .toLowerCase()
      .replaceAll(RegExp(r'[^a-z0-9_]+'), '_')
      .replaceAll(RegExp(r'^_+|_+$'), '');
}
