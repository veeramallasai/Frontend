import '../remote/auth_remote_source.dart';
import '../../core/network/api_response.dart';
import 'session_repository.dart';

class AuthRepository {
  AuthRepository({AuthRemoteSource? remoteSource})
      : _remoteSource = remoteSource ?? AuthRemoteSource();

  final AuthRemoteSource _remoteSource;

  Future<ApiResponse<dynamic>> signInWithEmail({
    required String email,
    required String password,
  }) async {
    final ApiResponse<dynamic> response = await _remoteSource.signInWithEmail(
      email: email,
      password: password,
    );

    if (response.isSuccess && response.data != null) {
      final Map<String, dynamic> data =
          response.data is Map ? Map<String, dynamic>.from(response.data as Map) : <String, dynamic>{};
      final String userEmail = data['email']?.toString() ?? email;
      final String token = data['token']?.toString() ?? data['accessToken']?.toString() ?? '';
      SessionRepository.setSession(
        userId: userEmail,
        email: userEmail,
        token: token,
      );
    }
    return response;
  }

  Future<ApiResponse<dynamic>> registerWithEmail({
    required String email,
    required String password,
    required String firstName,
    String lastName = '',
    String phoneNumber = '',
  }) async {
    return _remoteSource.registerWithEmail(
      email: email,
      password: password,
      firstName: firstName,
      lastName: lastName,
      phone: phoneNumber,
    );
  }

  Future<ApiResponse<dynamic>> verifyEmailOtp({
    required String email,
    required String otpCode,
  }) async {
    final ApiResponse<dynamic> response = await _remoteSource.verifyEmailOtp(
      email: email,
      otpCode: otpCode,
    );
    if (response.isSuccess) {
      final Map<String, dynamic> data =
          response.data is Map ? Map<String, dynamic>.from(response.data as Map) : <String, dynamic>{};
      final String token = data['token']?.toString() ?? data['accessToken']?.toString() ?? '';
      SessionRepository.setSession(
        userId: email,
        email: email,
        token: token,
      );
    }
    return response;
  }

  Future<ApiResponse<dynamic>> sendPasswordReset(String email) =>
      _remoteSource.sendPasswordReset(email);

  Future<void> signOut() async {
    await SessionRepository().endSession();
  }
}
