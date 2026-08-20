import 'package:flutter/foundation.dart';

class BackendConfig {
  BackendConfig._();

  static const String defaultDeployedUrl = 'https://farmtohome-production-ca90.up.railway.app';
  static const String defaultLocalUrl = 'http://localhost:8082';

  static const String _overrideBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  static String get baseUrl {
    if (_overrideBaseUrl.trim().isNotEmpty) {
      return _withoutTrailingSlash(_overrideBaseUrl.trim());
    }
    return defaultDeployedUrl;
  }

  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 30);
  static const int maximumRetries = 2;
  static const Duration retryDelay = Duration(milliseconds: 600);

  static Uri uri(String path, {Map<String, dynamic>? queryParameters}) {
    final String normalizedPath = path.startsWith('/') ? path : '/$path';
    final Map<String, String> query = <String, String>{};
    queryParameters?.forEach((String key, dynamic value) {
      if (value != null) query[key] = value.toString();
    });
    return Uri.parse('$baseUrl$normalizedPath').replace(
      queryParameters: query.isEmpty ? null : query,
    );
  }

  static String _withoutTrailingSlash(String value) =>
      value.endsWith('/') ? value.substring(0, value.length - 1) : value;
}
