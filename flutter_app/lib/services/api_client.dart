import 'dart:convert';
import 'package:http/http.dart' as http;
import '../constants/api_endpoints.dart';
import 'secure_storage.dart';

class ApiException implements Exception {
  final String message;
  final int statusCode;

  ApiException(this.message, this.statusCode);

  @override
  String toString() => message;
}

class ApiClient {
  static final http.Client _client = http.Client();

  static Future<Map<String, String>> _headers({String? token}) async {
    final activeToken = token ?? await SecureStorage.getToken();
    final headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    if (activeToken != null && activeToken.isNotEmpty) {
      headers['Authorization'] = 'Bearer $activeToken';
    }
    return headers;
  }

  static dynamic _processResponse(http.Response response) {
    final statusCode = response.statusCode;
    final body = utf8.decode(response.bodyBytes);
    
    Map<String, dynamic> jsonResponse;
    try {
      jsonResponse = json.decode(body);
    } catch (_) {
      throw ApiException('Invalid response format from server', statusCode);
    }

    if (statusCode == 401) {
      SecureStorage.deleteToken();
      throw ApiException('Session expired. Please log in again.', 401);
    }

    if (statusCode >= 200 && statusCode < 300) {
      return jsonResponse['data'];
    } else {
      String errMsg = jsonResponse['message'] ?? 'Server error ($statusCode)';
      if (jsonResponse['data'] is Map) {
        final errors = jsonResponse['data'] as Map;
        final errorDetails = errors.entries.map((e) => '${e.key}: ${e.value}').join(', ');
        if (errorDetails.isNotEmpty) {
          errMsg = '$errMsg: $errorDetails';
        }
      }
      throw ApiException(errMsg, statusCode);
    }
  }

  static Future<dynamic> get(String endpoint, {String? token}) async {
    try {
      final uri = Uri.parse('${ApiEndpoints.baseUrl}$endpoint');
      final headers = await _headers(token: token);
      final response = await _client.get(uri, headers: headers);
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Internet connection error or server offline', 500);
    }
  }

  static Future<String> getRaw(String endpoint, {String? token}) async {
    try {
      final uri = Uri.parse('${ApiEndpoints.baseUrl}$endpoint');
      final headers = await _headers(token: token);
      final response = await _client.get(uri, headers: headers);
      if (response.statusCode == 401) {
        SecureStorage.deleteToken();
        throw ApiException('Session expired. Please log in again.', 401);
      }
      if (response.statusCode >= 200 && response.statusCode < 300) {
        return utf8.decode(response.bodyBytes);
      } else {
        throw ApiException('Failed to download invoice (${response.statusCode})', response.statusCode);
      }
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Internet connection error or server offline', 500);
    }
  }

  static Future<dynamic> post(String endpoint, Map<String, dynamic> body, {String? token}) async {
    try {
      final uri = Uri.parse('${ApiEndpoints.baseUrl}$endpoint');
      final headers = await _headers(token: token);
      final response = await _client.post(uri, headers: headers, body: json.encode(body));
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Internet connection error or server offline', 500);
    }
  }

  static Future<dynamic> put(String endpoint, Map<String, dynamic> body, {String? token}) async {
    try {
      final uri = Uri.parse('${ApiEndpoints.baseUrl}$endpoint');
      final headers = await _headers(token: token);
      final response = await _client.put(uri, headers: headers, body: json.encode(body));
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Internet connection error or server offline', 500);
    }
  }

  static Future<dynamic> patch(String endpoint, Map<String, dynamic> body, {String? token}) async {
    try {
      final uri = Uri.parse('${ApiEndpoints.baseUrl}$endpoint');
      final headers = await _headers(token: token);
      final response = await _client.patch(uri, headers: headers, body: json.encode(body));
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Internet connection error or server offline', 500);
    }
  }

  static Future<dynamic> delete(String endpoint, {String? token}) async {
    try {
      final uri = Uri.parse('${ApiEndpoints.baseUrl}$endpoint');
      final headers = await _headers(token: token);
      final response = await _client.delete(uri, headers: headers);
      return _processResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Internet connection error or server offline', 500);
    }
  }
}
