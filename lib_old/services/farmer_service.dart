import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';

import '../data/local_product_catalog.dart';
import '../models/farmer.dart';
import '../models/product_model.dart';

class FarmerService {
  FarmerService._();

  static final FarmerService instance = FarmerService._();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;

  static const String farmersCollection = 'farmers';
  static const String productsCollection = 'products';

  CollectionReference<Map<String, dynamic>> get _farmersReference {
    return _firestore.collection(farmersCollection);
  }

  CollectionReference<Map<String, dynamic>> get _productsReference {
    return _firestore.collection(productsCollection);
  }

  /// Returns all farmers in real time.
  ///
  /// When Firestore has no farmer documents, the local [sampleFarmers]
  /// list is returned so the customer app never appears empty.
  Stream<List<Farmer>> watchFarmers() {
    return _farmersReference.snapshots().map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        if (snapshot.docs.isEmpty) {
          return List<Farmer>.unmodifiable(sampleFarmers);
        }

        final List<Farmer> farmers = snapshot.docs
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return Farmer.fromMap(
              document.data(),
              documentId: document.id,
            );
          },
        )
            .toList();

        farmers.sort(_compareFarmers);

        return farmers;
      },
    ).handleError(
          (Object error) {
        return List<Farmer>.unmodifiable(sampleFarmers);
      },
    );
  }

  /// Returns all farmers once.
  Future<List<Farmer>> getFarmers() async {
    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _farmersReference.get();

      if (snapshot.docs.isEmpty) {
        return List<Farmer>.unmodifiable(sampleFarmers);
      }

      final List<Farmer> farmers = snapshot.docs
          .map(
            (QueryDocumentSnapshot<Map<String, dynamic>> document) {
          return Farmer.fromMap(
            document.data(),
            documentId: document.id,
          );
        },
      )
          .toList();

      farmers.sort(_compareFarmers);

      return farmers;
    } catch (_) {
      return List<Farmer>.unmodifiable(sampleFarmers);
    }
  }

  /// Returns one farmer in real time.
  Stream<Farmer> watchFarmerById(String farmerId) {
    final String cleanFarmerId = farmerId.trim();

    if (cleanFarmerId.isEmpty) {
      return Stream<Farmer>.value(
        farmerById(cleanFarmerId),
      );
    }

    return _farmersReference.doc(cleanFarmerId).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> snapshot) {
        final Map<String, dynamic>? data = snapshot.data();

        if (!snapshot.exists || data == null) {
          return farmerById(cleanFarmerId);
        }

        return Farmer.fromMap(
          data,
          documentId: snapshot.id,
        );
      },
    ).handleError(
          (Object error) {
        return farmerById(cleanFarmerId);
      },
    );
  }

  /// Returns one farmer once.
  Future<Farmer> getFarmerById(String farmerId) async {
    final String cleanFarmerId = farmerId.trim();

    if (cleanFarmerId.isEmpty) {
      return farmerById(cleanFarmerId);
    }

    try {
      final DocumentSnapshot<Map<String, dynamic>> snapshot =
      await _farmersReference.doc(cleanFarmerId).get();

      final Map<String, dynamic>? data = snapshot.data();

      if (!snapshot.exists || data == null) {
        return farmerById(cleanFarmerId);
      }

      return Farmer.fromMap(
        data,
        documentId: snapshot.id,
      );
    } catch (_) {
      return farmerById(cleanFarmerId);
    }
  }

  /// Returns verified farmers, highest rated first.
  Stream<List<Farmer>> watchVerifiedFarmers({
    int limit = 20,
  }) {
    return watchFarmers().map(
          (List<Farmer> farmers) {
        final List<Farmer> result = farmers
            .where((Farmer farmer) => farmer.verified)
            .toList();

        result.sort(_compareFarmers);

        return result.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Returns organic-certified farmers, highest rated first.
  Stream<List<Farmer>> watchOrganicFarmers({
    int limit = 20,
  }) {
    return watchFarmers().map(
          (List<Farmer> farmers) {
        final List<Farmer> result = farmers
            .where((Farmer farmer) => farmer.organicCertified)
            .toList();

        result.sort(_compareFarmers);

        return result.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Returns farmers suitable for the Home Screen featured section.
  ///
  /// Verified and organic farms are preferred. Rating and reviews are used
  /// as secondary ordering factors.
  Stream<List<Farmer>> watchFeaturedFarmers({
    int limit = 10,
  }) {
    return watchFarmers().map(
          (List<Farmer> farmers) {
        final List<Farmer> result = List<Farmer>.from(farmers);

        result.sort(
              (Farmer first, Farmer second) {
            final int firstScore = _featuredScore(first);
            final int secondScore = _featuredScore(second);

            if (secondScore != firstScore) {
              return secondScore.compareTo(firstScore);
            }

            return _compareFarmers(first, second);
          },
        );

        return result.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Searches farmers using farmer name, farm name, location, crop,
  /// certification, and description.
  Stream<List<Farmer>> searchFarmers(
      String query, {
        int limit = 30,
      }) {
    final String normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.isEmpty) {
      return watchFarmers().map(
            (List<Farmer> farmers) =>
            farmers.take(_safeLimit(limit)).toList(),
      );
    }

    return watchFarmers().map(
          (List<Farmer> farmers) {
        final List<Farmer> result = farmers.where(
              (Farmer farmer) {
            final String searchableText = <String>[
              farmer.name,
              farmer.farmName,
              farmer.village,
              farmer.district,
              farmer.state,
              farmer.certification,
              farmer.about,
              farmer.cropsGrown.join(' '),
            ].join(' ').toLowerCase();

            return searchableText.contains(normalizedQuery);
          },
        ).toList();

        result.sort(_compareFarmers);

        return result.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Products grown or supplied by the same farmer.
  ///
  /// Use this for the Product Details section:
  /// "More from this farmer".
  Stream<List<ProductModel>> watchProductsByFarmer(
      String farmerId, {
        String excludeProductId = '',
        int limit = 12,
      }) {
    final String cleanFarmerId = farmerId.trim();
    final String cleanExcludedId = excludeProductId.trim();

    if (cleanFarmerId.isEmpty) {
      return Stream<List<ProductModel>>.value(
        const <ProductModel>[],
      );
    }

    return _productsReference
        .where('farmerId', isEqualTo: cleanFarmerId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        if (snapshot.docs.isEmpty) {
          return _localProductsByFarmer(
            cleanFarmerId,
            excludeProductId: cleanExcludedId,
            limit: limit,
          );
        }

        final List<ProductModel> products = snapshot.docs
            .where(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return cleanExcludedId.isEmpty ||
                document.id != cleanExcludedId;
          },
        )
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return ProductModel.fromMap(
              document.data(),
              documentId: document.id,
            );
          },
        )
            .where((ProductModel product) {
          return cleanExcludedId.isEmpty ||
              product.id != cleanExcludedId;
        })
            .toList();

        products.sort(_compareProducts);

        return products.take(_safeLimit(limit)).toList();
      },
    ).handleError(
          (Object error) {
        return _localProductsByFarmer(
          cleanFarmerId,
          excludeProductId: cleanExcludedId,
          limit: limit,
        );
      },
    );
  }

  /// Same-farmer products similar to the current product.
  ///
  /// Matching priority:
  /// 1. Same farmer
  /// 2. Same category
  /// 3. Same collection
  /// 4. Organic / quick / best-seller relevance
  ///
  /// Use this for:
  /// "Similar products from this farmer".
  Stream<List<ProductModel>> watchSimilarProductsFromSameFarmer(
      ProductModel currentProduct, {
        int limit = 10,
      }) {
    return watchProductsByFarmer(
      currentProduct.farmerId,
      excludeProductId: currentProduct.id,
      limit: 50,
    ).map(
          (List<ProductModel> products) {
        final List<ProductModel> result =
        List<ProductModel>.from(products);

        result.sort(
              (ProductModel first, ProductModel second) {
            final int firstScore =
            _sameFarmerProductSimilarityScore(
              currentProduct,
              first,
            );
            final int secondScore =
            _sameFarmerProductSimilarityScore(
              currentProduct,
              second,
            );

            if (secondScore != firstScore) {
              return secondScore.compareTo(firstScore);
            }

            return _compareProducts(first, second);
          },
        );

        return result.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Similar farms for a farmer.
  ///
  /// Similarity is calculated using:
  /// - same district
  /// - same state
  /// - crop overlap
  /// - organic certification
  /// - verification
  /// - rating proximity
  /// - delivery radius proximity
  Stream<List<Farmer>> watchSimilarFarms(
      Farmer currentFarmer, {
        int limit = 8,
      }) {
    return watchFarmers().map(
          (List<Farmer> farmers) {
        final List<Farmer> result = farmers
            .where(
              (Farmer farmer) => farmer.id != currentFarmer.id,
        )
            .toList();

        result.sort(
              (Farmer first, Farmer second) {
            final int firstScore = _farmSimilarityScore(
              currentFarmer,
              first,
            );
            final int secondScore = _farmSimilarityScore(
              currentFarmer,
              second,
            );

            if (secondScore != firstScore) {
              return secondScore.compareTo(firstScore);
            }

            return _compareFarmers(first, second);
          },
        );

        return result.take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Similar farms when only the farmerId is available.
  Stream<List<Farmer>> watchSimilarFarmsByFarmerId(
      String farmerId, {
        int limit = 8,
      }) {
    return watchFarmerById(farmerId).asyncExpand(
          (Farmer farmer) {
        return watchSimilarFarms(
          farmer,
          limit: limit,
        );
      },
    );
  }

  /// Products from farms similar to the current farmer.
  ///
  /// Use this section after "Similar Farms" when required.
  Stream<List<ProductModel>> watchProductsFromSimilarFarms(
      Farmer currentFarmer, {
        String excludeProductId = '',
        int farmLimit = 5,
        int productLimit = 12,
      }) {
    return watchSimilarFarms(
      currentFarmer,
      limit: farmLimit,
    ).asyncMap(
          (List<Farmer> similarFarmers) async {
        if (similarFarmers.isEmpty) {
          return const <ProductModel>[];
        }

        final Set<String> farmerIds = similarFarmers
            .map((Farmer farmer) => farmer.id)
            .where((String id) => id.trim().isNotEmpty)
            .toSet();

        final List<ProductModel> allProducts =
        await _loadAllProductsOnce();

        final List<ProductModel> result = allProducts.where(
              (ProductModel product) {
            final bool fromSimilarFarm =
            farmerIds.contains(product.farmerId);

            final bool notCurrentProduct =
                excludeProductId.trim().isEmpty ||
                    product.id != excludeProductId.trim();

            return fromSimilarFarm && notCurrentProduct;
          },
        ).toList();

        result.sort(_compareProducts);

        return result.take(_safeLimit(productLimit)).toList();
      },
    );
  }

  /// Products matching a crop name within a farmer's catalog.
  Stream<List<ProductModel>> watchFarmerProductsByCrop(
      String farmerId,
      String cropName, {
        int limit = 12,
      }) {
    final String normalizedCrop = cropName.trim().toLowerCase();

    return watchProductsByFarmer(
      farmerId,
      limit: 100,
    ).map(
          (List<ProductModel> products) {
        if (normalizedCrop.isEmpty) {
          return products.take(_safeLimit(limit)).toList();
        }

        return products.where(
              (ProductModel product) {
            final String searchableText = <String>[
              product.name,
              product.teluguName,
              product.category,
              product.categoryTelugu,
              product.collection,
            ].join(' ').toLowerCase();

            return searchableText.contains(normalizedCrop);
          },
        ).take(_safeLimit(limit)).toList();
      },
    );
  }

  /// Saves or updates one farmer.
  Future<void> saveFarmer(Farmer farmer) async {
    final String farmerId = farmer.id.trim().isNotEmpty
        ? farmer.id.trim()
        : _createFarmerId(farmer.farmName);

    final Map<String, dynamic> data = farmer.copyWith(
      id: farmerId,
    ).toMap();

    data['updatedAt'] = FieldValue.serverTimestamp();

    await _farmersReference.doc(farmerId).set(
      data,
      SetOptions(merge: true),
    );
  }

  /// Updates selected farmer fields.
  Future<void> updateFarmerFields({
    required String farmerId,
    required Map<String, dynamic> fields,
  }) async {
    final String cleanFarmerId = farmerId.trim();

    if (cleanFarmerId.isEmpty || fields.isEmpty) {
      return;
    }

    final Map<String, dynamic> data =
    Map<String, dynamic>.from(fields);

    data['updatedAt'] = FieldValue.serverTimestamp();

    await _farmersReference.doc(cleanFarmerId).set(
      data,
      SetOptions(merge: true),
    );
  }

  /// Seeds the sample farmers only when Firestore has no farmers.
  Future<void> seedFarmersIfRequired() async {
    final QuerySnapshot<Map<String, dynamic>> snapshot =
    await _farmersReference.limit(1).get();

    if (snapshot.docs.isEmpty) {
      await syncSampleFarmersToFirestore();
    }
  }

  /// Uploads local sample farmers to Firestore using merge mode.
  Future<void> syncSampleFarmersToFirestore() async {
    if (sampleFarmers.isEmpty) {
      return;
    }

    WriteBatch batch = _firestore.batch();
    int operationCount = 0;

    for (final Farmer farmer in sampleFarmers) {
      final DocumentReference<Map<String, dynamic>> reference =
      _farmersReference.doc(farmer.id);

      batch.set(
        reference,
        <String, dynamic>{
          ...farmer.toMap(),
          'updatedAt': FieldValue.serverTimestamp(),
        },
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
  }

  /// Deletes one farmer document.
  Future<void> deleteFarmer(String farmerId) async {
    final String cleanFarmerId = farmerId.trim();

    if (cleanFarmerId.isEmpty) {
      return;
    }

    await _farmersReference.doc(cleanFarmerId).delete();
  }

  List<ProductModel> _localProductsByFarmer(
      String farmerId, {
        required String excludeProductId,
        required int limit,
      }) {
    final List<ProductModel> products =
    LocalProductCatalog.products
        .map(
          (Map<String, dynamic> product) {
        return ProductModel.fromMap(product);
      },
    )
        .where(
          (ProductModel product) {
        final bool sameFarmer =
            product.farmerId == farmerId;

        final bool notExcluded =
            excludeProductId.isEmpty ||
                product.id != excludeProductId;

        return sameFarmer && notExcluded;
      },
    )
        .toList();

    products.sort(_compareProducts);

    return products.take(_safeLimit(limit)).toList();
  }

  Future<List<ProductModel>> _loadAllProductsOnce() async {
    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _productsReference.get();

      if (snapshot.docs.isNotEmpty) {
        final List<ProductModel> products = snapshot.docs
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return ProductModel.fromMap(
              document.data(),
              documentId: document.id,
            );
          },
        )
            .toList();

        products.sort(_compareProducts);

        return products;
      }
    } catch (_) {
      // Local fallback below.
    }

    final List<ProductModel> localProducts =
    LocalProductCatalog.products
        .map(
          (Map<String, dynamic> product) {
        return ProductModel.fromMap(product);
      },
    )
        .toList();

    localProducts.sort(_compareProducts);

    return localProducts;
  }

  int _farmSimilarityScore(
      Farmer currentFarmer,
      Farmer candidate,
      ) {
    int score = 0;

    if (_sameText(
      currentFarmer.district,
      candidate.district,
    )) {
      score += 35;
    }

    if (_sameText(
      currentFarmer.state,
      candidate.state,
    )) {
      score += 20;
    }

    if (_sameText(
      currentFarmer.village,
      candidate.village,
    )) {
      score += 15;
    }

    final int cropOverlap = _cropOverlapCount(
      currentFarmer.cropsGrown,
      candidate.cropsGrown,
    );

    score += cropOverlap * 12;

    if (currentFarmer.organicCertified ==
        candidate.organicCertified) {
      score += 10;
    }

    if (currentFarmer.verified == candidate.verified) {
      score += 6;
    }

    final double ratingDifference =
    (currentFarmer.rating - candidate.rating).abs();

    if (ratingDifference <= 0.2) {
      score += 12;
    } else if (ratingDifference <= 0.5) {
      score += 7;
    } else if (ratingDifference <= 1) {
      score += 3;
    }

    final double radiusDifference =
    (currentFarmer.deliveryRadiusKm -
        candidate.deliveryRadiusKm)
        .abs();

    if (radiusDifference <= 10) {
      score += 8;
    } else if (radiusDifference <= 25) {
      score += 4;
    }

    return score;
  }

  int _sameFarmerProductSimilarityScore(
      ProductModel currentProduct,
      ProductModel candidate,
      ) {
    int score = 0;

    if (_sameText(
      currentProduct.category,
      candidate.category,
    )) {
      score += 40;
    }

    if (_sameText(
      currentProduct.collection,
      candidate.collection,
    )) {
      score += 30;
    }

    if (currentProduct.organic == candidate.organic) {
      score += 8;
    }

    if (currentProduct.isQuick == candidate.isQuick) {
      score += 6;
    }

    if (candidate.bestSeller) {
      score += 8;
    }

    if (candidate.canPreOrder) {
      score += 5;
    }

    final double ratingDifference =
    (currentProduct.rating - candidate.rating).abs();

    if (ratingDifference <= 0.3) {
      score += 8;
    } else if (ratingDifference <= 0.7) {
      score += 4;
    }

    return score;
  }

  int _featuredScore(Farmer farmer) {
    int score = 0;

    if (farmer.verified) score += 40;
    if (farmer.organicCertified) score += 30;

    score += (farmer.rating * 10).round();

    if (farmer.totalReviews > 0) {
      score += farmer.totalReviews.clamp(0, 2000) ~/ 100;
    }

    if (farmer.experienceYears > 0) {
      score += farmer.experienceYears.clamp(0, 30);
    }

    return score;
  }

  int _compareFarmers(
      Farmer first,
      Farmer second,
      ) {
    if (second.verified != first.verified) {
      return second.verified ? 1 : -1;
    }

    if (second.organicCertified != first.organicCertified) {
      return second.organicCertified ? 1 : -1;
    }

    final int ratingComparison =
    second.rating.compareTo(first.rating);

    if (ratingComparison != 0) {
      return ratingComparison;
    }

    final int reviewComparison =
    second.totalReviews.compareTo(first.totalReviews);

    if (reviewComparison != 0) {
      return reviewComparison;
    }

    return first.farmName
        .toLowerCase()
        .compareTo(second.farmName.toLowerCase());
  }

  int _compareProducts(
      ProductModel first,
      ProductModel second,
      ) {
    if (second.bestSeller != first.bestSeller) {
      return second.bestSeller ? 1 : -1;
    }

    if (second.isAvailable != first.isAvailable) {
      return second.isAvailable ? 1 : -1;
    }

    final int ratingComparison =
    second.rating.compareTo(first.rating);

    if (ratingComparison != 0) {
      return ratingComparison;
    }

    final int soldComparison =
    second.soldCount.compareTo(first.soldCount);

    if (soldComparison != 0) {
      return soldComparison;
    }

    return first.name
        .toLowerCase()
        .compareTo(second.name.toLowerCase());
  }

  int _cropOverlapCount(
      List<String> firstCrops,
      List<String> secondCrops,
      ) {
    final Set<String> first = firstCrops
        .map((String crop) => crop.trim().toLowerCase())
        .where((String crop) => crop.isNotEmpty)
        .toSet();

    final Set<String> second = secondCrops
        .map((String crop) => crop.trim().toLowerCase())
        .where((String crop) => crop.isNotEmpty)
        .toSet();

    return first.intersection(second).length;
  }

  bool _sameText(
      String first,
      String second,
      ) {
    final String normalizedFirst =
    first.trim().toLowerCase();
    final String normalizedSecond =
    second.trim().toLowerCase();

    return normalizedFirst.isNotEmpty &&
        normalizedSecond.isNotEmpty &&
        normalizedFirst == normalizedSecond;
  }

  int _safeLimit(int limit) {
    if (limit <= 0) return 1;
    if (limit > 100) return 100;
    return limit;
  }

  String _createFarmerId(String farmName) {
    final String normalized = farmName
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '_')
        .replaceAll(RegExp(r'^_+|_+$'), '');

    if (normalized.isNotEmpty) {
      return 'farmer_$normalized';
    }

    return 'farmer_${DateTime.now().microsecondsSinceEpoch}';
  }
}