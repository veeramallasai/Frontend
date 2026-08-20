import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/product_model.dart';

class ProductRemoteSource {
  ProductRemoteSource({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<List<ProductModel>> watchProducts({
    String category = '',
    String shoppingMode = '',
    int limit = 100,
  }) async* {
    final List<ProductModel> remoteList = await getProducts(
      category: category,
      shoppingMode: shoppingMode,
      limit: limit,
    );
    yield remoteList;
  }

  Future<List<ProductModel>> getProducts({
    String category = '',
    String shoppingMode = '',
    int limit = 100,
  }) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getProducts(
        category: category,
        shoppingMode: shoppingMode,
        limit: limit,
      );

      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        List<dynamic> items = <dynamic>[];
        if (raw is List) {
          items = raw;
        } else if (raw is Map && raw['content'] is List) {
          items = raw['content'] as List;
        } else if (raw is Map && raw['products'] is List) {
          items = raw['products'] as List;
        }

        if (items.isNotEmpty) {
          final List<ProductModel> remoteProducts = items
              .whereType<Map<String, dynamic>>()
              .map((Map<String, dynamic> map) => ProductModel.fromMap(map))
              .where((ProductModel p) => _matchesFilters(p, category: category, shoppingMode: shoppingMode))
              .toList(growable: true);

          if (remoteProducts.isNotEmpty) {
            return _sortAndLimit(remoteProducts, limit);
          }
        }
      }
    } catch (e) {
      // Return empty list on failure
    }

    return <ProductModel>[];
  }

  Stream<ProductModel?> watchProduct(String productId) async* {
    final ProductModel? product = await getProduct(productId);
    yield product;
  }

  Future<ProductModel?> getProduct(String productId) async {
    final List<ProductModel> all = await getProducts();
    try {
      return all.firstWhere((ProductModel p) => p.id == productId.trim());
    } catch (_) {
      return null;
    }
  }

  Future<String> saveProduct(ProductModel product) async {
    final Map<String, dynamic> body = <String, dynamic>{
      'name': product.name,
      'description': product.description,
      'price': product.price,
      'discountPrice': product.price,
      'originalPrice': product.mrp > 0 ? product.mrp : product.price,
      'quantity': product.stockQuantity > 0 ? product.stockQuantity : 50,
      'availableStock': product.stockQuantity > 0 ? product.stockQuantity : 50,
      'weight': 1.0,
      'unit': product.unit.trim().isNotEmpty ? product.unit.toUpperCase() : 'KG',
      'categoryName': product.category,
      'category': product.category,
      'subCategoryName': product.subCategory,
      'imageUrl': product.imageUrl,
      'image': product.imageUrl,
      'organic': false,
      'available': product.inStock,
    };

    if (product.id.isNotEmpty && !product.id.startsWith('temp_')) {
      final ApiResponse<dynamic> response = await _apiService.updateProduct(product.id, body);
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        if (raw is Map && raw['id'] != null) {
          return raw['id'].toString();
        }
      }
      return product.id;
    } else {
      final ApiResponse<dynamic> response = await _apiService.createProduct(body);
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        if (raw is Map && raw['id'] != null) {
          return raw['id'].toString();
        }
      }
      return product.id;
    }
  }

  Future<void> updateStock({
    required String productId,
    required int stockQuantity,
  }) async {}

  bool _matchesFilters(
    ProductModel product, {
    required String category,
    required String shoppingMode,
  }) {
    final String categoryFilter = _normalize(category);
    final String modeFilter = _normalize(shoppingMode);

    final bool categoryMatches = _isCategoryMatch(product.category, categoryFilter);
    final bool modeMatches = modeFilter.isEmpty ||
        _normalize(product.shoppingMode) == modeFilter ||
        product.shoppingMode.isEmpty;
    return categoryMatches && modeMatches;
  }

  bool _isCategoryMatch(String prodCat, String filterCat) {
    final String p = _normalize(prodCat);
    final String f = _normalize(filterCat);

    if (f.isEmpty || f == 'all') return true;
    if (p == f) return true;
    if (p.contains(f) || f.contains(p)) return true;

    if (f.contains('veg') && p.contains('veg')) return true;
    if (f.contains('fruit') && p.contains('fruit')) return true;
    if (f.contains('dairy') && p.contains('dairy')) return true;

    return false;
  }

  List<ProductModel> _sortAndLimit(List<ProductModel> products, int limit) {
    products.sort((ProductModel first, ProductModel second) {
      if (first.inStock != second.inStock) return first.inStock ? -1 : 1;
      return first.name.toLowerCase().compareTo(second.name.toLowerCase());
    });

    if (limit <= 0 || products.length <= limit) {
      return List<ProductModel>.unmodifiable(products);
    }
    return List<ProductModel>.unmodifiable(products.take(limit));
  }

  String _normalize(String value) {
    return value.trim().toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '_');
  }
}
