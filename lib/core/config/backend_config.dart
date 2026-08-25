import 'dart:io';

import 'package:flutter/foundation.dart';

import 'environment_config.dart';

class BackendConfig {
  BackendConfig._();

  static const String defaultDeployedUrl =
      'https://farmtohome-backend-production.up.railway.app';
  static const String defaultLocalUrl = 'http://localhost:8082';

  static const String _overrideBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: '',
  );

  static String get localDevelopmentBaseUrl {
    if (kIsWeb) {
      return defaultLocalUrl;
    }
    if (Platform.isAndroid) {
      return 'http://10.0.2.2:8082';
    }
    if (Platform.isIOS) {
      return 'http://127.0.0.1:8082';
    }
    return defaultLocalUrl;
  }

  static String get baseUrl {
    if (_overrideBaseUrl.trim().isNotEmpty) {
      return withoutTrailingSlash(_overrideBaseUrl.trim());
    }

    if (kDebugMode && EnvironmentConfig.isDevelopment) {
      return localDevelopmentBaseUrl;
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

  static String withoutTrailingSlash(String value) =>
      value.endsWith('/') ? value.substring(0, value.length - 1) : value;
}
