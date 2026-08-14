import '../network/api_client.dart';
import '../network/api_response.dart';

class CloudFunctionsService {
  CloudFunctionsService({ApiClient? client}) : _client = client ?? ApiClient();

  final ApiClient _client;

  Future<ApiResponse<dynamic>> call(
    String functionName, {
    Map<String, dynamic> data = const <String, dynamic>{},
  }) {
    final String name = functionName
        .trim()
        .replaceAll(RegExp(r'[^a-zA-Z0-9_-]+'), '');
    if (name.isEmpty) throw ArgumentError.value(functionName, 'functionName');
    return _client.post('/v1/functions/$name', body: <String, dynamic>{'data': data});
  }

  Future<ApiResponse<dynamic>> calculateDeliveryFee({
    required String pincode,
    required double subtotal,
    required String method,
  }) => call('calculateDeliveryFee', data: <String, dynamic>{
        'pincode': pincode,
        'subtotal': subtotal,
        'method': method,
      });

  Future<ApiResponse<dynamic>> sendOrderNotification(String orderId) =>
      call('sendOrderNotification', data: <String, dynamic>{'orderId': orderId});

  void dispose() => _client.dispose();
}
