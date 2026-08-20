import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/category_model.dart';

class CategoryRepository {
  CategoryRepository({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<List<CategoryModel>> watchCategories() async* {
    final List<CategoryModel> categories = await getCategories();
    yield categories;
  }

  Future<List<CategoryModel>> getCategories() async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getCategories();
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        List<dynamic> items = <dynamic>[];
        if (raw is List) {
          items = raw;
        } else if (raw is Map && raw['content'] is List) {
          items = raw['content'] as List;
        }

        if (items.isNotEmpty) {
          final List<CategoryModel> remote = items
              .whereType<Map<String, dynamic>>()
              .map((Map<String, dynamic> map) => CategoryModel.fromMap(map))
              .toList(growable: true);
          return List<CategoryModel>.unmodifiable(remote);
        }
      }
    } catch (_) {}

    return <CategoryModel>[];
  }
}
