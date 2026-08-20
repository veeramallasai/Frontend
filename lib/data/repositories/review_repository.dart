import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/review_model.dart';

class ReviewRepository {
  ReviewRepository({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<List<ReviewModel>> watchProductReviews(String productId) async* {
    final List<ReviewModel> list = await getProductReviews(productId);
    yield List<ReviewModel>.unmodifiable(list);
  }

  Future<List<ReviewModel>> getProductReviews(String productId) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getReviews(productId);
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
              .map((Map<String, dynamic> map) => ReviewModel.fromMap(map))
              .toList(growable: false);
        }
      }
    } catch (_) {}

    return <ReviewModel>[];
  }

  Future<String> saveReview(ReviewModel review) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.createReview(review.toMap());
      if (response.isSuccess && response.data is Map<String, dynamic>) {
        final Map<String, dynamic> map = response.data as Map<String, dynamic>;
        if (map['id'] != null) return map['id'].toString();
      }
    } catch (_) {}
    return review.id;
  }

  Future<void> deleteReview(String reviewId) async {}
}
