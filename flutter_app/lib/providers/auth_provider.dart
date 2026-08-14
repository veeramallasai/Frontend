import 'package:flutter/material.dart';
import '../constants/api_endpoints.dart';
import '../models/auth_models.dart';
import '../services/api_client.dart';
import '../services/secure_storage.dart';

class AuthProvider with ChangeNotifier {
  String? _token;
  UserProfile? _profile;
  bool _isLoading = false;

  String? get token => _token;
  UserProfile? get profile => _profile;
  bool get isLoading => _isLoading;
  bool get isAuth => _token != null && _token!.isNotEmpty;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  Future<bool> tryAutoLogin() async {
    final savedToken = await SecureStorage.getToken();
    if (savedToken != null && savedToken.isNotEmpty) {
      _token = savedToken;
      try {
        await fetchProfile();
        return true;
      } catch (_) {
        logout();
      }
    }
    return false;
  }

  Future<void> login(String email, String password) async {
    _setLoading(true);
    try {
      final data = await ApiClient.post(ApiEndpoints.login, {
        'email': email,
        'password': password,
      });
      _token = data['accessToken'];
      await SecureStorage.saveToken(_token!);
      await fetchProfile();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> register(String email, String password, String firstName, String lastName, String phone, String role) async {
    _setLoading(true);
    try {
      await ApiClient.post(ApiEndpoints.register, {
        'email': email,
        'password': password,
        'firstName': firstName,
        'lastName': lastName,
        'phone': phone,
        'role': role, // e.g., CUSTOMER
      });
    } finally {
      _setLoading(false);
    }
  }

  Future<void> generateOtp(String email) async {
    _setLoading(true);
    try {
      await ApiClient.post(ApiEndpoints.otpGenerate, {'email': email});
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> verifyOtp(String email, String otpCode) async {
    _setLoading(true);
    try {
      final success = await ApiClient.post(ApiEndpoints.otpVerify, {
        'email': email,
        'otpCode': otpCode,
      });
      return true;
    } finally {
      _setLoading(false);
    }
  }

  Future<void> fetchProfile() async {
    if (_token == null) return;
    final data = await ApiClient.get(ApiEndpoints.customerProfile, token: _token);
    _profile = UserProfile.fromJson(data);
    notifyListeners();
  }

  Future<void> forgotPassword(String email) async {
    _setLoading(true);
    try {
      await ApiClient.post(ApiEndpoints.forgotPassword, {'email': email});
    } finally {
      _setLoading(false);
    }
  }

  Future<void> resetPassword(String email, String otp, String newPassword) async {
    _setLoading(true);
    try {
      await ApiClient.post(ApiEndpoints.resetPassword, {
        'email': email,
        'otpCode': otp,
        'newPassword': newPassword,
      });
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _token = null;
    _profile = null;
    await SecureStorage.deleteToken();
    notifyListeners();
  }
}
