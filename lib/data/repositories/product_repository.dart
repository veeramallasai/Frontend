import '../local/local_product_catalog.dart';
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
    return _watchMergedProducts(
      category: category,
      shoppingMode: shoppingMode,
      limit: limit,
    );
  }

  Stream<List<ProductModel>> _watchMergedProducts({
    required String category,
    required String shoppingMode,
    required int limit,
  }) async* {
    final List<ProductModel> local = LocalProductCatalog.products(
      category: category,
      shoppingMode: shoppingMode,
      limit: limit,
    );
    yield local;

    try {
      await for (final List<ProductModel> remote in _remoteSource.watchProducts(
        category: category,
        shoppingMode: shoppingMode,
        limit: limit,
      )) {
        yield _merge(local, remote, limit);
      }
    } catch (_) {
      yield local;
    }
  }

  Future<List<ProductModel>> getProducts({
    String category = '',
    String shoppingMode = '',
    int limit = 100,
  }) async {
    final List<ProductModel> local = LocalProductCatalog.products(
      category: category,
      shoppingMode: shoppingMode,
      limit: limit,
    );
    try {
      final List<ProductModel> remote = await _remoteSource.getProducts(
        category: category,
        shoppingMode: shoppingMode,
        limit: limit,
      );
      return _merge(local, remote, limit);
    } catch (_) {
      return local;
    }
  }

  Stream<ProductModel?> watchProduct(String productId) async* {
    final ProductModel? local = LocalProductCatalog.find(productId);
    if (local != null) yield local;
    try {
      await for (final ProductModel? remote
          in _remoteSource.watchProduct(productId)) {
        if (remote != null || local == null) yield remote;
      }
    } catch (_) {
      if (local == null) yield null;
    }
  }

  Future<ProductModel?> getProduct(String productId) async {
    final ProductModel? local = LocalProductCatalog.find(productId);
    if (local != null) return local;
    try {
      final ProductModel? remote = await _remoteSource.getProduct(productId);
      if (remote != null) return remote;
    } catch (_) {
      // The bundled catalog keeps product details available offline.
    }
    return null;
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

  List<ProductModel> _merge(
    List<ProductModel> local,
    List<ProductModel> remote,
    int limit,
  ) {
    final Map<String, ProductModel> values = <String, ProductModel>{
      for (final ProductModel product in local) product.id: product,
      for (final ProductModel product in remote) product.id: product,
    };
    final List<ProductModel> result = values.values.toList(growable: false);
    if (limit > 0 && result.length > limit) {
      return List<ProductModel>.unmodifiable(result.take(limit));
    }
    return List<ProductModel>.unmodifiable(result);
  }
}
