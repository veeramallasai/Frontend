import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/asset_paths.dart';
import '../models/product_model.dart';

class ProductRemoteSource {
  ProductRemoteSource({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> get _products =>
      _firestore.collection('products');

  Stream<List<ProductModel>> watchProducts({
    String category = '',
    String shoppingMode = '',
    int limit = 100,
  }) {
    return _products.snapshots().map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<ProductModel> products = snapshot.docs
            .map(_productFromDocument)
            .where(
              (ProductModel product) => _matchesFilters(
            product,
            category: category,
            shoppingMode: shoppingMode,
          ),
        )
            .toList(growable: true);
        return _sortAndLimit(products, limit);
      },
    );
  }

  Future<List<ProductModel>> getProducts({
    String category = '',
    String shoppingMode = '',
    int limit = 100,
  }) async {
    final QuerySnapshot<Map<String, dynamic>> snapshot = await _products.get();
    final List<ProductModel> products = snapshot.docs
        .map(_productFromDocument)
        .where(
          (ProductModel product) => _matchesFilters(
        product,
        category: category,
        shoppingMode: shoppingMode,
      ),
    )
        .toList(growable: true);
    return _sortAndLimit(products, limit);
  }

  Stream<ProductModel?> watchProduct(String productId) {
    final String id = productId.trim();
    if (id.isEmpty) return Stream<ProductModel?>.value(null);

    return _products.doc(id).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> document) {
        if (!document.exists || document.data() == null) return null;
        return _productFromDocument(document);
      },
    );
  }

  Future<ProductModel?> getProduct(String productId) async {
    final String id = productId.trim();
    if (id.isEmpty) return null;

    final DocumentSnapshot<Map<String, dynamic>> document =
    await _products.doc(id).get();
    if (!document.exists || document.data() == null) return null;
    return _productFromDocument(document);
  }

  Future<String> saveProduct(ProductModel product) async {
    final DocumentReference<Map<String, dynamic>> reference =
    product.id.trim().isEmpty
        ? _products.doc()
        : _products.doc(product.id.trim());

    await reference.set(
      <String, dynamic>{
        ...product.toMap(),
        'id': reference.id,
        if (product.createdAt == null) 'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
    return reference.id;
  }

  Future<void> updateStock({
    required String productId,
    required int stockQuantity,
  }) async {
    final String id = productId.trim();
    if (id.isEmpty) throw ArgumentError('Product ID is required.');

    final int safeStock = stockQuantity < 0 ? 0 : stockQuantity;
    await _products.doc(id).update(<String, dynamic>{
      'stockQuantity': safeStock,
      'inStock': safeStock > 0,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  ProductModel _productFromDocument(
      DocumentSnapshot<Map<String, dynamic>> document,
      ) {
    final Map<String, dynamic> data =
    Map<String, dynamic>.from(document.data() ?? <String, dynamic>{});
    final String currentImage =
    (data['imageUrl'] ?? data['image'] ?? '').toString().trim();

    if (currentImage.isEmpty) {
      final String name = (data['name'] ?? '').toString();
      final String category = (data['category'] ?? '').toString();
      data['imageUrl'] = _assetImageFor(name) ??
          _assetImageFor(document.id) ??
          AssetPaths.categoryImage(category) ??
          '';
    }

    return ProductModel.fromMap(data, documentId: document.id);
  }

  bool _matchesFilters(
      ProductModel product, {
        required String category,
        required String shoppingMode,
      }) {
    final String categoryFilter = _normalize(category);
    final String modeFilter = _normalize(shoppingMode);
    final bool categoryMatches = categoryFilter.isEmpty ||
        _normalize(product.category) == categoryFilter;
    final bool modeMatches = modeFilter.isEmpty ||
        _normalize(product.shoppingMode) == modeFilter;
    return categoryMatches && modeMatches;
  }

  List<ProductModel> _sortAndLimit(
      List<ProductModel> products,
      int limit,
      ) {
    products.sort((ProductModel first, ProductModel second) {
      if (first.inStock != second.inStock) return first.inStock ? -1 : 1;
      final DateTime firstDate =
          first.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      final DateTime secondDate =
          second.createdAt ?? DateTime.fromMillisecondsSinceEpoch(0);
      final int dateComparison = secondDate.compareTo(firstDate);
      return dateComparison != 0
          ? dateComparison
          : first.name.toLowerCase().compareTo(second.name.toLowerCase());
    });

    if (limit <= 0 || products.length <= limit) {
      return List<ProductModel>.unmodifiable(products);
    }
    return List<ProductModel>.unmodifiable(products.take(limit));
  }

  String _normalize(String value) {
    return value.trim().toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '_');
  }

  String? _assetImageFor(String value) {
    final String? directImage = AssetPaths.productImage(value);
    if (directImage != null) return directImage;

    final String normalized = _normalize(value);
    if (normalized.isEmpty) return null;
    for (final MapEntry<String, String> item
    in AssetPaths.allProductImages.entries) {
      final String key = item.key;
      if (normalized == key ||
          normalized.startsWith('${key}_') ||
          normalized.endsWith('_$key') ||
          normalized.contains('_${key}_')) {
        return item.value;
      }
    }
    return null;
  }
}
