import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/farmer_model.dart';

class FarmerRemoteSource {
  FarmerRemoteSource({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<List<FarmerModel>> watchFarmers({int limit = 100}) async* {
    final List<FarmerModel> list = await getFarmers(limit: limit);
    yield list;
  }

  Future<List<FarmerModel>> getFarmers({int limit = 100}) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getFarmers(limit: limit);
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        List<dynamic> items = <dynamic>[];
        if (raw is List) {
          items = raw;
        } else if (raw is Map && raw['content'] is List) {
          items = raw['content'] as List;
        }
        if (items.isNotEmpty) {
          return items
              .whereType<Map<String, dynamic>>()
              .map((Map<String, dynamic> map) => FarmerModel.fromMap(map))
              .toList(growable: false);
        }
      }
    } catch (_) {}

    return <FarmerModel>[];
  }

  Stream<FarmerModel?> watchFarmer(String farmerId) async* {
    final FarmerModel? farmer = await getFarmer(farmerId);
    yield farmer;
  }

  Future<FarmerModel?> getFarmer(String farmerId) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getFarmer(farmerId);
      if (response.isSuccess && response.data is Map<String, dynamic>) {
        return FarmerModel.fromMap(response.data as Map<String, dynamic>);
      }
    } catch (_) {}

    final List<FarmerModel> all = await getFarmers();
    try {
      return all.firstWhere((FarmerModel f) => f.id == farmerId.trim());
    } catch (_) {
      return all.firstOrNull;
    }
  }

  Future<String> saveFarmer(FarmerModel farmer) async {
    return farmer.id;
  }
}
