import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/offer_model.dart';

class OfferRepository {
  OfferRepository({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<List<OfferModel>> watchOffers() async* {
    final List<OfferModel> offers = await getOffers();
    yield offers;
  }

  Future<List<OfferModel>> getOffers() async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getCoupons();
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
              .map((Map<String, dynamic> map) => OfferModel.fromMap(map))
              .toList(growable: false);
        }
      }
    } catch (_) {}

    return <OfferModel>[];
  }
}
