import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';

class AuthRemoteSource {
  AuthRemoteSource({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Future<ApiResponse<dynamic>> signInWithEmail({
    required String email,
    required String password,
  }) =>
      _apiService.login(
        identifier: email.trim().toLowerCase(),
        password: password,
      );

  Future<ApiResponse<dynamic>> registerWithEmail({
    required String email,
    required String password,
    required String firstName,
    String lastName = '',
    String phone = '',
  }) =>
      _apiService.register(<String, dynamic>{
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
        'email': email.trim().toLowerCase(),
        'phone': phone.trim(),
        'password': password,
        'role': 'CUSTOMER',
      });

  Future<ApiResponse<dynamic>> verifyEmailOtp({
    required String email,
    required String otpCode,
  }) =>
      _apiService.verifyEmailOtp(
        email: email.trim(),
        otpCode: otpCode.trim(),
      );

  Future<ApiResponse<dynamic>> sendPasswordReset(String email) =>
      _apiService.forgotPassword(email.trim().toLowerCase());

  Future<ApiResponse<dynamic>> getProfile() => _apiService.getProfile();
}
