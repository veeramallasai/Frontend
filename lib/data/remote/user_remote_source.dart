import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/user_model.dart';

class UserRemoteSource {
  UserRemoteSource({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;
  final Map<String, UserModel> _users = <String, UserModel>{};

  Stream<UserModel?> watchUser(String userId) async* {
    final UserModel? user = await getUser(userId);
    yield user;
  }

  Future<UserModel?> getUser(String userId) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getProfile();
      if (response.isSuccess && response.data is Map<String, dynamic>) {
        final UserModel remote = UserModel.fromMap(response.data as Map<String, dynamic>);
        _users[remote.uid] = remote;
        _users[userId.trim()] = remote;
        return remote;
      }
    } catch (_) {}
    return _users[userId.trim()];
  }

  Future<void> saveUser(UserModel user) async {
    _users[user.uid] = user;
    try {
      await _apiService.updateProfile(user.toMap());
    } catch (_) {}
  }

  Future<void> updateFields(
    String userId,
    Map<String, dynamic> fields,
  ) async {
    final UserModel? existing = _users[userId.trim()];
    if (existing != null) {
      final Map<String, dynamic> updatedMap = <String, dynamic>{
        ...existing.toMap(),
        ...fields,
      };
      _users[userId.trim()] = UserModel.fromMap(updatedMap);
    }
    try {
      await _apiService.updateProfile(fields);
    } catch (_) {}
  }

  Future<void> deactivate(String userId) => updateFields(
        userId,
        <String, dynamic>{'isActive': false},
      );
}
