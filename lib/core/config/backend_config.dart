import 'environment_config.dart';

class BackendConfig {
  BackendConfig._();

  static const String defaultRailwayUrl =
      'https://farmtohome-production-ca90.up.railway.app';

  static const String _overrideBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: defaultRailwayUrl,
  );

  static String get baseUrl {
    final String configured = _overrideBaseUrl.trim().isNotEmpty
        ? _overrideBaseUrl.trim()
        : defaultRailwayUrl;
    return _withoutTrailingSlash(configured);
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
