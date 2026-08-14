import 'package:cloud_firestore/cloud_firestore.dart';

import '../data/local_product_catalog.dart';
import '../models/product_model.dart';

class FirestoreService {
  FirestoreService._();

  static final FirestoreService instance = FirestoreService._();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static const String productsCollection = 'products';

  CollectionReference<Map<String, dynamic>> get _productsReference {
    return _firestore.collection(productsCollection);
  }

  /// Uploads all local vegetable products to Firestore.
  ///
  /// Existing documents are updated without deleting additional fields.
  Future<void> syncLocalProductsToFirestore() async {
    try {
      final List<Map<String, dynamic>> localProducts =
          LocalProductCatalog.products;

      if (localProducts.isEmpty) {
        return;
      }

      WriteBatch batch = _firestore.batch();
      int operationCount = 0;

      for (final Map<String, dynamic> localProduct in localProducts) {
        final Map<String, dynamic> productData =
        Map<String, dynamic>.from(localProduct);

        final String productName =
            productData['name']?.toString().trim() ?? '';

        if (productName.isEmpty) {
          continue;
        }

        final String productId = _createProductId(productName);

        productData['id'] = productId;
        productData['image'] = LocalProductCatalog.imageFor(
          name: productName,
          preferredImage: productData['image']?.toString(),
        );

        productData['teluguName'] =
        productData['teluguName']?.toString().trim().isNotEmpty == true
            ? productData['teluguName'].toString().trim()
            : LocalProductCatalog.teluguNameFor(productName);

        productData['updatedAt'] = FieldValue.serverTimestamp();

        final DocumentReference<Map<String, dynamic>> documentReference =
        _productsReference.doc(productId);

        batch.set(
          documentReference,
          productData,
          SetOptions(merge: true),
        );

        operationCount++;

        if (operationCount == 450) {
          await batch.commit();
          batch = _firestore.batch();
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        await batch.commit();
      }
    } on FirebaseException catch (error) {
      throw FirestoreServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
      );
    } catch (error) {
      throw FirestoreServiceException(
        message: 'Products Firebaseకి upload చేయడంలో సమస్య వచ్చింది.',
        originalError: error,
      );
    }
  }

  /// Uploads local products only when the Firestore products collection
  /// is completely empty.
  Future<void> seedProductsIfRequired() async {
    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _productsReference.limit(1).get();

      if (snapshot.docs.isEmpty) {
        await syncLocalProductsToFirestore();
      }
    } on FirebaseException catch (error) {
      throw FirestoreServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
      );
    } catch (error) {
      throw FirestoreServiceException(
        message: 'Product data initialize చేయడంలో సమస్య వచ్చింది.',
        originalError: error,
      );
    }
  }

  /// Real-time product stream from Firestore.
  ///
  /// Firestore is empty when local catalog products are returned so that
  /// the Home Screen never appears blank.
  Stream<List<ProductModel>> watchProducts() {
    return _productsReference.snapshots().map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        if (snapshot.docs.isEmpty) {
          return _localProductModels();
        }

        final List<ProductModel> products =
        snapshot.docs.map((QueryDocumentSnapshot<Map<String, dynamic>> doc) {
          final Map<String, dynamic> data =
          _prepareFirestoreProductData(doc.data());

          return ProductModel.fromMap(
            data,
            documentId: doc.id,
          );
        }).toList();

        products.sort(
              (ProductModel first, ProductModel second) =>
              first.name.toLowerCase().compareTo(
                second.name.toLowerCase(),
              ),
        );

        return products;
      },
    ).handleError(
          (Object error) {
        throw FirestoreServiceException(
          message: 'Firebase నుంచి products load చేయడంలో సమస్య వచ్చింది.',
          originalError: error,
        );
      },
    );
  }

  /// Returns all products once.
  Future<List<ProductModel>> getProducts() async {
    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _productsReference.get();

      if (snapshot.docs.isEmpty) {
        return _localProductModels();
      }

      final List<ProductModel> products =
      snapshot.docs.map((QueryDocumentSnapshot<Map<String, dynamic>> doc) {
        final Map<String, dynamic> data =
        _prepareFirestoreProductData(doc.data());

        return ProductModel.fromMap(
          data,
          documentId: doc.id,
        );
      }).toList();

      products.sort(
            (ProductModel first, ProductModel second) =>
            first.name.toLowerCase().compareTo(
              second.name.toLowerCase(),
            ),
      );

      return products;
    } on FirebaseException catch (error) {
      return _localProductModels();
    } catch (_) {
      return _localProductModels();
    }
  }

  /// Real-time products filtered by category.
  Stream<List<ProductModel>> watchProductsByCategory(String category) {
    final String normalizedCategory = category.trim().toLowerCase();

    return watchProducts().map(
          (List<ProductModel> products) {
        if (normalizedCategory.isEmpty ||
            normalizedCategory == 'all' ||
            normalizedCategory == 'అన్నీ') {
          return products;
        }

        return products.where((ProductModel product) {
          return product.category.trim().toLowerCase() ==
              normalizedCategory ||
              product.categoryTelugu.trim().toLowerCase() ==
                  normalizedCategory;
        }).toList();
      },
    );
  }

  /// Real-time products filtered by collection.
  Stream<List<ProductModel>> watchProductsByCollection(String collection) {
    final String normalizedCollection = collection.trim().toLowerCase();

    return watchProducts().map(
          (List<ProductModel> products) {
        if (normalizedCollection.isEmpty ||
            normalizedCollection == 'all') {
          return products;
        }

        return products.where((ProductModel product) {
          return product.collection.trim().toLowerCase() ==
              normalizedCollection;
        }).toList();
      },
    );
  }



  /// Alias used by Shop All mode. Keeps the original product stream intact.
  Stream<List<ProductModel>> watchAllProducts() {
    return watchProducts();
  }

  /// Real-time products eligible for Quick delivery.
  Stream<List<ProductModel>> watchQuickProducts() {
    return watchProducts().map(
          (List<ProductModel> products) {
        final List<ProductModel> quickProducts = products
            .where((ProductModel product) => product.isQuickAvailable)
            .toList();

        quickProducts.sort(
              (ProductModel first, ProductModel second) =>
              first.quickDeliveryMinutes.compareTo(
                second.quickDeliveryMinutes,
              ),
        );

        return quickProducts;
      },
    );
  }

  /// Real-time products that currently accept pre-orders.
  Stream<List<ProductModel>> watchPreOrderProducts() {
    return watchProducts().map(
          (List<ProductModel> products) {
        final List<ProductModel> preOrderProducts = products
            .where((ProductModel product) => product.canPreOrder)
            .toList();

        preOrderProducts.sort(
              (ProductModel first, ProductModel second) {
            final DateTime? firstDate = first.activeHarvestDate;
            final DateTime? secondDate = second.activeHarvestDate;

            if (firstDate == null && secondDate == null) return 0;
            if (firstDate == null) return 1;
            if (secondDate == null) return -1;
            return firstDate.compareTo(secondDate);
          },
        );

        return preOrderProducts;
      },
    );
  }

  /// Products from the same farmer, excluding the current product if required.
  Stream<List<ProductModel>> watchProductsByFarmer(
      String farmerId, {
        String excludeProductId = '',
        int limit = 10,
      }) {
    final String cleanFarmerId = farmerId.trim();
    final String cleanExcludedId = excludeProductId.trim();
    final int safeLimit = limit < 1 ? 1 : limit;

    if (cleanFarmerId.isEmpty) {
      return Stream<List<ProductModel>>.value(<ProductModel>[]);
    }

    return watchProducts().map(
          (List<ProductModel> products) {
        return products.where((ProductModel product) {
          final bool sameFarmer = product.farmerId.trim() == cleanFarmerId;
          final bool isExcluded = cleanExcludedId.isNotEmpty &&
              product.id.trim() == cleanExcludedId;
          return sameFarmer && !isExcluded;
        }).take(safeLimit).toList();
      },
    );
  }

  /// Products related by category or collection.
  Stream<List<ProductModel>> watchSimilarProducts(
      ProductModel currentProduct, {
        int limit = 10,
      }) {
    final int safeLimit = limit < 1 ? 1 : limit;
    final String category = currentProduct.category.trim().toLowerCase();
    final String collection = currentProduct.collection.trim().toLowerCase();

    return watchProducts().map(
          (List<ProductModel> products) {
        final List<ProductModel> similarProducts = products.where(
              (ProductModel product) {
            if (product.id == currentProduct.id) return false;

            final bool sameCategory =
                product.category.trim().toLowerCase() == category;
            final bool sameCollection = collection.isNotEmpty &&
                product.collection.trim().toLowerCase() == collection;

            return sameCategory || sameCollection;
          },
        ).toList();

        similarProducts.sort(
              (ProductModel first, ProductModel second) =>
              second.rating.compareTo(first.rating),
        );

        return similarProducts.take(safeLimit).toList();
      },
    );
  }

  /// Seasonal products used by the Shop All home section.
  Stream<List<ProductModel>> watchSeasonalProducts({int limit = 12}) {
    final int safeLimit = limit < 1 ? 1 : limit;

    return watchProducts().map(
          (List<ProductModel> products) {
        return products.where((ProductModel product) {
          final String category = product.category.trim().toLowerCase();
          final String collection = product.collection.trim().toLowerCase();

          return category == 'seasonal' ||
              collection.contains('season') ||
              collection.contains('harvest');
        }).take(safeLimit).toList();
      },
    );
  }

  /// Highest-rated available products.
  Stream<List<ProductModel>> watchTopRatedProducts({int limit = 12}) {
    final int safeLimit = limit < 1 ? 1 : limit;

    return watchProducts().map(
          (List<ProductModel> products) {
        final List<ProductModel> topRated = products
            .where((ProductModel product) => product.isAvailable)
            .toList();

        topRated.sort(
              (ProductModel first, ProductModel second) {
            final int ratingComparison = second.rating.compareTo(first.rating);
            if (ratingComparison != 0) return ratingComparison;
            return second.reviewCount.compareTo(first.reviewCount);
          },
        );

        return topRated.take(safeLimit).toList();
      },
    );
  }

  /// Best-seller products used as featured products.
  Stream<List<ProductModel>> watchFeaturedProducts({int limit = 12}) {
    final int safeLimit = limit < 1 ? 1 : limit;

    return watchProducts().map(
          (List<ProductModel> products) {
        final List<ProductModel> featured = products
            .where(
              (ProductModel product) =>
          product.bestSeller && product.isAvailable,
        )
            .toList();

        featured.sort(
              (ProductModel first, ProductModel second) =>
              second.soldCount.compareTo(first.soldCount),
        );

        return featured.take(safeLimit).toList();
      },
    );
  }

  /// Searches English/Telugu name, display name, category and collection.
  Stream<List<ProductModel>> searchProducts(
      String query, {
        bool quickOnly = false,
        int limit = 50,
      }) {
    final String cleanQuery = query.trim().toLowerCase();
    final int safeLimit = limit < 1 ? 1 : limit;

    return watchProducts().map(
          (List<ProductModel> products) {
        Iterable<ProductModel> result = products;

        if (quickOnly) {
          result = result.where(
                (ProductModel product) => product.isQuickAvailable,
          );
        }

        if (cleanQuery.isNotEmpty) {
          result = result.where((ProductModel product) {
            return product.name.toLowerCase().contains(cleanQuery) ||
                product.teluguName.toLowerCase().contains(cleanQuery) ||
                product.displayName.toLowerCase().contains(cleanQuery) ||
                product.category.toLowerCase().contains(cleanQuery) ||
                product.categoryTelugu.toLowerCase().contains(cleanQuery) ||
                product.collection.toLowerCase().contains(cleanQuery) ||
                product.seller.toLowerCase().contains(cleanQuery);
          });
        }

        return result.take(safeLimit).toList();
      },
    );
  }

  /// Enables pre-order for a product and stores harvest/delivery details.
  Future<void> enablePreOrder({
    required String productId,
    DateTime? preOrderStartDate,
    DateTime? preOrderEndDate,
    DateTime? harvestDate,
    DateTime? nextHarvestDate,
    DateTime? expectedDeliveryDate,
    List<String> availableDeliverySlots = const <String>[],
    int minimumPreOrderQuantity = 1,
    int maximumPreOrderQuantity = 10,
    int preOrderBookedQuantity = 0,
    String preOrderNote = '',
  }) async {
    final int safeMinimum = minimumPreOrderQuantity < 1
        ? 1
        : minimumPreOrderQuantity;
    final int safeMaximum = maximumPreOrderQuantity < safeMinimum
        ? safeMinimum
        : maximumPreOrderQuantity;
    final int safeBooked = preOrderBookedQuantity < 0
        ? 0
        : preOrderBookedQuantity;

    await updateProductFields(
      productId: productId,
      fields: <String, dynamic>{
        'preOrderAvailable': true,
        'preOrderStartDate': _timestampOrNull(preOrderStartDate),
        'preOrderEndDate': _timestampOrNull(preOrderEndDate),
        'harvestDate': _timestampOrNull(harvestDate),
        'nextHarvestDate': _timestampOrNull(nextHarvestDate),
        'expectedDeliveryDate': _timestampOrNull(expectedDeliveryDate),
        'availableDeliverySlots': _cleanStringList(availableDeliverySlots),
        'minimumPreOrderQuantity': safeMinimum,
        'maximumPreOrderQuantity': safeMaximum,
        'preOrderBookedQuantity': safeBooked,
        'preOrderNote': preOrderNote.trim(),
      },
    );
  }

  /// Disables pre-order without deleting previous harvest information.
  Future<void> disablePreOrder(String productId) async {
    await updateProductFields(
      productId: productId,
      fields: <String, dynamic>{
        'preOrderAvailable': false,
      },
    );
  }

  /// Updates harvest and expected delivery dates.
  Future<void> updateHarvest({
    required String productId,
    DateTime? harvestDate,
    DateTime? nextHarvestDate,
    DateTime? expectedDeliveryDate,
  }) async {
    await updateProductFields(
      productId: productId,
      fields: <String, dynamic>{
        'harvestDate': _timestampOrNull(harvestDate),
        'nextHarvestDate': _timestampOrNull(nextHarvestDate),
        'expectedDeliveryDate': _timestampOrNull(expectedDeliveryDate),
      },
    );
  }

  /// Updates selectable delivery slots for pre-order products.
  Future<void> updateDeliverySlots({
    required String productId,
    required List<String> availableDeliverySlots,
  }) async {
    await updateProductFields(
      productId: productId,
      fields: <String, dynamic>{
        'availableDeliverySlots': _cleanStringList(availableDeliverySlots),
      },
    );
  }

  /// Stores recently viewed products under the current user's document.
  Future<void> saveRecentlyViewedProduct({
    required String userId,
    required ProductModel product,
  }) async {
    final String cleanUserId = userId.trim();
    final String cleanProductId = product.id.trim();

    if (cleanUserId.isEmpty || cleanProductId.isEmpty) return;

    try {
      await _firestore
          .collection('users')
          .doc(cleanUserId)
          .collection('recentlyViewed')
          .doc(cleanProductId)
          .set(
        <String, dynamic>{
          'productId': cleanProductId,
          'viewedAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    } on FirebaseException catch (error) {
      throw FirestoreServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
      );
    }
  }

  /// Resolves recently viewed product references into ProductModel objects.
  Stream<List<ProductModel>> watchRecentlyViewedProducts(
      String userId, {
        int limit = 10,
      }) {
    final String cleanUserId = userId.trim();
    final int safeLimit = limit < 1 ? 1 : limit;

    if (cleanUserId.isEmpty) {
      return Stream<List<ProductModel>>.value(<ProductModel>[]);
    }

    final Stream<QuerySnapshot<Map<String, dynamic>>> viewedStream =
    _firestore
        .collection('users')
        .doc(cleanUserId)
        .collection('recentlyViewed')
        .orderBy('viewedAt', descending: true)
        .limit(safeLimit)
        .snapshots();

    return viewedStream.asyncMap(
          (QuerySnapshot<Map<String, dynamic>> snapshot) async {
        final List<ProductModel> result = <ProductModel>[];

        for (final QueryDocumentSnapshot<Map<String, dynamic>> document
        in snapshot.docs) {
          final String productId =
              document.data()['productId']?.toString().trim() ?? document.id;
          final ProductModel? product = await getProductById(productId);
          if (product != null) result.add(product);
        }

        return result;
      },
    );
  }

  /// Recommendations based on a category/collection preference.
  Stream<List<ProductModel>> watchRecommendedProducts({
    String preferredCategory = '',
    String preferredCollection = '',
    List<String> excludedProductIds = const <String>[],
    int limit = 12,
  }) {
    final String category = preferredCategory.trim().toLowerCase();
    final String collection = preferredCollection.trim().toLowerCase();
    final Set<String> excludedIds = excludedProductIds
        .map((String id) => id.trim())
        .where((String id) => id.isNotEmpty)
        .toSet();
    final int safeLimit = limit < 1 ? 1 : limit;

    return watchProducts().map(
          (List<ProductModel> products) {
        final List<ProductModel> recommendations = products.where(
              (ProductModel product) {
            if (!product.isAvailable || excludedIds.contains(product.id)) {
              return false;
            }

            if (category.isEmpty && collection.isEmpty) return true;

            return (category.isNotEmpty &&
                product.category.trim().toLowerCase() == category) ||
                (collection.isNotEmpty &&
                    product.collection.trim().toLowerCase() == collection);
          },
        ).toList();

        recommendations.sort(
              (ProductModel first, ProductModel second) {
            final int sellerComparison =
            second.soldCount.compareTo(first.soldCount);
            if (sellerComparison != 0) return sellerComparison;
            return second.rating.compareTo(first.rating);
          },
        );

        return recommendations.take(safeLimit).toList();
      },
    );
  }

  /// Returns a single product once.
  Future<ProductModel?> getProductById(String productId) async {
    final String cleanProductId = productId.trim();

    if (cleanProductId.isEmpty) {
      return null;
    }

    try {
      final DocumentSnapshot<Map<String, dynamic>> snapshot =
      await _productsReference.doc(cleanProductId).get();

      if (!snapshot.exists || snapshot.data() == null) {
        return _findLocalProductById(cleanProductId);
      }

      final Map<String, dynamic> data =
      _prepareFirestoreProductData(snapshot.data()!);

      return ProductModel.fromMap(
        data,
        documentId: snapshot.id,
      );
    } on FirebaseException {
      return _findLocalProductById(cleanProductId);
    } catch (_) {
      return _findLocalProductById(cleanProductId);
    }
  }

  /// Real-time stream for a single product.
  Stream<ProductModel?> watchProductById(String productId) {
    final String cleanProductId = productId.trim();

    if (cleanProductId.isEmpty) {
      return Stream<ProductModel?>.value(null);
    }

    return _productsReference.doc(cleanProductId).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> snapshot) {
        if (!snapshot.exists || snapshot.data() == null) {
          return _findLocalProductById(cleanProductId);
        }

        final Map<String, dynamic> data =
        _prepareFirestoreProductData(snapshot.data()!);

        return ProductModel.fromMap(
          data,
          documentId: snapshot.id,
        );
      },
    );
  }

  /// Adds or updates a product in Firestore.
  Future<void> saveProduct(ProductModel product) async {
    try {
      final String productId = product.id.trim().isNotEmpty
          ? product.id.trim()
          : _createProductId(product.name);

      final Map<String, dynamic> productData = product.copyWith(
        id: productId,
        image: LocalProductCatalog.imageFor(
          name: product.name,
          preferredImage: product.image,
        ),
        teluguName: product.teluguName.trim().isNotEmpty
            ? product.teluguName
            : LocalProductCatalog.teluguNameFor(product.name),
      ).toMap();

      productData['updatedAt'] = FieldValue.serverTimestamp();

      await _productsReference.doc(productId).set(
        productData,
        SetOptions(merge: true),
      );
    } on FirebaseException catch (error) {
      throw FirestoreServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
      );
    } catch (error) {
      throw FirestoreServiceException(
        message: 'Product save చేయడంలో సమస్య వచ్చింది.',
        originalError: error,
      );
    }
  }

  /// Updates only the required fields of a product.
  Future<void> updateProductFields({
    required String productId,
    required Map<String, dynamic> fields,
  }) async {
    final String cleanProductId = productId.trim();

    if (cleanProductId.isEmpty || fields.isEmpty) {
      return;
    }

    try {
      final Map<String, dynamic> updatedFields =
      Map<String, dynamic>.from(fields);

      updatedFields['updatedAt'] = FieldValue.serverTimestamp();

      await _productsReference.doc(cleanProductId).set(
        updatedFields,
        SetOptions(merge: true),
      );
    } on FirebaseException catch (error) {
      throw FirestoreServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
      );
    } catch (error) {
      throw FirestoreServiceException(
        message: 'Product update చేయడంలో సమస్య వచ్చింది.',
        originalError: error,
      );
    }
  }

  /// Updates product price dynamically.
  Future<void> updateProductPrice({
    required String productId,
    required double price,
  }) async {
    if (price < 0) {
      throw const FirestoreServiceException(
        message: 'Product price సరైన value కావాలి.',
      );
    }

    await updateProductFields(
      productId: productId,
      fields: <String, dynamic>{
        'price': price,
      },
    );
  }

  /// Updates stock status dynamically.
  Future<void> updateProductStock({
    required String productId,
    required bool inStock,
  }) async {
    await updateProductFields(
      productId: productId,
      fields: <String, dynamic>{
        'inStock': inStock,
      },
    );
  }

  /// Updates best seller status dynamically.
  Future<void> updateBestSellerStatus({
    required String productId,
    required bool bestSeller,
  }) async {
    await updateProductFields(
      productId: productId,
      fields: <String, dynamic>{
        'bestSeller': bestSeller,
      },
    );
  }

  /// Deletes a product from Firestore.
  Future<void> deleteProduct(String productId) async {
    final String cleanProductId = productId.trim();

    if (cleanProductId.isEmpty) {
      return;
    }

    try {
      await _productsReference.doc(cleanProductId).delete();
    } on FirebaseException catch (error) {
      throw FirestoreServiceException(
        message: _firebaseErrorMessage(error),
        code: error.code,
      );
    } catch (error) {
      throw FirestoreServiceException(
        message: 'Product delete చేయడంలో సమస్య వచ్చింది.',
        originalError: error,
      );
    }
  }

  List<ProductModel> _localProductModels() {
    final List<ProductModel> products =
    LocalProductCatalog.products.map((Map<String, dynamic> localProduct) {
      final Map<String, dynamic> productData =
      Map<String, dynamic>.from(localProduct);

      final String productName =
          productData['name']?.toString().trim() ?? '';

      final String productId = _createProductId(productName);

      productData['id'] = productId;
      productData['image'] = LocalProductCatalog.imageFor(
        name: productName,
        preferredImage: productData['image']?.toString(),
      );

      productData['teluguName'] =
      productData['teluguName']?.toString().trim().isNotEmpty == true
          ? productData['teluguName'].toString().trim()
          : LocalProductCatalog.teluguNameFor(productName);

      return ProductModel.fromMap(
        productData,
        documentId: productId,
      );
    }).toList();

    products.sort(
          (ProductModel first, ProductModel second) =>
          first.name.toLowerCase().compareTo(
            second.name.toLowerCase(),
          ),
    );

    return products;
  }

  ProductModel? _findLocalProductById(String productId) {
    final List<ProductModel> localProducts = _localProductModels();

    for (final ProductModel product in localProducts) {
      if (product.id == productId) {
        return product;
      }
    }

    return null;
  }

  Map<String, dynamic> _prepareFirestoreProductData(
      Map<String, dynamic> firestoreData,
      ) {
    final Map<String, dynamic> productData =
    Map<String, dynamic>.from(firestoreData);

    final String productName =
        productData['name']?.toString().trim() ?? '';

    productData['image'] = LocalProductCatalog.imageFor(
      name: productName,
      preferredImage: productData['image']?.toString(),
    );

    final String currentTeluguName =
        productData['teluguName']?.toString().trim() ?? '';

    if (currentTeluguName.isEmpty) {
      productData['teluguName'] =
          LocalProductCatalog.teluguNameFor(productName);
    }

    return productData;
  }



  Timestamp? _timestampOrNull(DateTime? value) {
    return value == null ? null : Timestamp.fromDate(value);
  }

  List<String> _cleanStringList(List<String> values) {
    return values
        .map((String value) => value.trim())
        .where((String value) => value.isNotEmpty)
        .toSet()
        .toList();
  }

  String _createProductId(String productName) {
    final String normalizedName =
    LocalProductCatalog.normalizedName(productName);

    if (normalizedName.isNotEmpty) {
      return 'veg_$normalizedName';
    }

    return 'veg_${DateTime.now().microsecondsSinceEpoch}';
  }

  String _firebaseErrorMessage(FirebaseException error) {
    switch (error.code) {
      case 'permission-denied':
        return 'Firestore permission denied. Firebase rules check చేయాలి.';

      case 'unavailable':
        return 'Firebase ప్రస్తుతం అందుబాటులో లేదు. Internet connection check చేయాలి.';

      case 'not-found':
        return 'Requested Firebase product కనబడలేదు.';

      case 'already-exists':
        return 'ఈ product ఇప్పటికే Firebaseలో ఉంది.';

      case 'cancelled':
        return 'Firebase operation cancel అయింది.';

      case 'deadline-exceeded':
        return 'Firebase response ఆలస్యం అయింది. మళ్లీ ప్రయత్నించాలి.';

      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Firebase operation complete కాలేదు.';
    }
  }
}

class FirestoreServiceException implements Exception {
  final String message;
  final String? code;
  final Object? originalError;

  const FirestoreServiceException({
    required this.message,
    this.code,
    this.originalError,
  });

  @override
  String toString() {
    return message;
  }
}