import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/banner_model.dart';

class BannerRepository {
  BannerRepository({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<List<BannerModel>> watchBanners() async* {
    final List<BannerModel> banners = await getBanners();
    yield banners;
  }

  Future<List<BannerModel>> getBanners() async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getBanners();
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
              .map((Map<String, dynamic> map) => BannerModel.fromMap(map))
              .toList(growable: false);
        }
      }
    } catch (_) {}

    return <BannerModel>[];
  }
}
