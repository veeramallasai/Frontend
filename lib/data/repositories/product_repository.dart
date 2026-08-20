import '../models/product_model.dart';
import '../remote/product_remote_source.dart';

class ProductRepository {
  ProductRepository({ProductRemoteSource? remoteSource})
      : _remoteSource = remoteSource ?? ProductRemoteSource();

  final ProductRemoteSource _remoteSource;

  Stream<List<ProductModel>> watchProducts({
    String category = '',
    String shoppingMode = '',
    int limit = 100,
  }) {
    return _remoteSource.watchProducts(
      category: category,
      shoppingMode: shoppingMode,
      limit: limit,
    );
  }

  Future<List<ProductModel>> getProducts({
    String category = '',
    String shoppingMode = '',
    int limit = 100,
  }) async {
    return _remoteSource.getProducts(
      category: category,
      shoppingMode: shoppingMode,
      limit: limit,
    );
  }

  Stream<ProductModel?> watchProduct(String productId) async* {
    yield* _remoteSource.watchProduct(productId);
  }

  Future<ProductModel?> getProduct(String productId) async {
    return _remoteSource.getProduct(productId);
  }

  Future<List<ProductModel>> searchProducts(
    String query, {
    String category = '',
    String shoppingMode = '',
    int limit = 100,
  }) async {
    final List<ProductModel> products = await getProducts(
      category: category,
      shoppingMode: shoppingMode,
      limit: limit,
    );
    final String normalizedQuery = query.trim().toLowerCase();
    if (normalizedQuery.isEmpty) return products;

    return products.where((ProductModel product) {
      return product.name.toLowerCase().contains(normalizedQuery) ||
          product.category.toLowerCase().contains(normalizedQuery) ||
          product.description.toLowerCase().contains(normalizedQuery);
    }).toList(growable: false);
  }

  Future<List<ProductModel>> getRelatedProducts(
    ProductModel product, {
    int limit = 10,
  }) async {
    final List<ProductModel> values = await getProducts(
      category: product.category,
      shoppingMode: product.shoppingMode,
      limit: limit + 1,
    );
    return values
        .where((ProductModel item) => item.id != product.id)
        .take(limit)
        .toList(growable: false);
  }

  Future<String> saveProduct(ProductModel product) {
    return _remoteSource.saveProduct(product);
  }

  Future<void> updateStock({
    required String productId,
    required int stockQuantity,
  }) {
    return _remoteSource.updateStock(
      productId: productId,
      stockQuantity: stockQuantity,
    );
  }
}
