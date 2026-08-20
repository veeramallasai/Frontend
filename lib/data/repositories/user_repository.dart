import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/user_model.dart';

class UserRepository {
  UserRepository({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<UserModel?> watchCurrentUser() async* {
    final UserModel? user = await getCurrentUser();
    yield user;
  }

  Future<UserModel?> getCurrentUser() async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getProfile();
      if (response.isSuccess && response.data is Map<String, dynamic>) {
        return UserModel.fromMap(response.data as Map<String, dynamic>);
      }
    } catch (_) {}
    return null;
  }

  Future<void> saveProfile(UserModel profile) async {
    final ApiResponse<dynamic> response = await _apiService.updateProfile(profile.toMap());
    if (!response.isSuccess) {
      throw StateError(response.message.isNotEmpty ? response.message : 'Failed to save profile.');
    }
  }

  Future<void> updateShoppingMode(String mode) async {
    final String normalized = mode.trim().toLowerCase() == 'shop' ? 'shop' : 'home';
    await _apiService.updateProfile(<String, dynamic>{'shoppingMode': normalized});
  }
}
