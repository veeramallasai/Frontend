import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/wishlist_item.dart';

class WishlistService {
  WishlistService({
    FirebaseFirestore? firestore,
  }) : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  static const String collectionName = 'wishlist';

  CollectionReference<Map<String, dynamic>> get _wishlist {
    return _db.collection(collectionName);
  }

  Stream<List<WishlistItem>> getUserWishlist(
      String userId, {
        int limit = 300,
      }) {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return Stream<List<WishlistItem>>.value(
        const <WishlistItem>[],
      );
    }

    return _wishlist
        .where('userId', isEqualTo: cleanUserId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<WishlistItem> items = snapshot.docs
            .map(
              (QueryDocumentSnapshot<Map<String, dynamic>> document) {
            return WishlistItem.fromMap(
              document.id,
              document.data(),
            );
          },
        )
            .toList();

        items.sort(
              (WishlistItem first, WishlistItem second) {
            return second.createdAt.compareTo(first.createdAt);
          },
        );

        return items.take(_safeLimit(limit)).toList();
      },
    ).handleError(
          (Object error) {
        throw WishlistServiceException(
          message: 'Unable to load wishlist.',
          code: 'watch-wishlist-failed',
          originalError: error,
        );
      },
    );
  }

  Stream<int> watchWishlistCount(String userId) {
    return getUserWishlist(userId).map(
          (List<WishlistItem> items) => items.length,
    );
  }

  Stream<bool> watchIsWishlisted({
    required String userId,
    required String productId,
    String productName = '',
  }) {
    final String cleanUserId = userId.trim();
    final String cleanProductId = productId.trim();
    final String cleanProductName = productName.trim();

    if (cleanUserId.isEmpty) {
      return Stream<bool>.value(false);
    }

    return getUserWishlist(cleanUserId).map(
          (List<WishlistItem> items) {
        return items.any(
              (WishlistItem item) {
            if (cleanProductId.isNotEmpty &&
                item.productId.trim() == cleanProductId) {
              return true;
            }

            return cleanProductName.isNotEmpty &&
                item.name.trim().toLowerCase() ==
                    cleanProductName.toLowerCase();
          },
        );
      },
    );
  }

  Future<String> addToWishlist(WishlistItem item) async {
    _validateItem(item);

    final WishlistItem? existing = await findWishlistItem(
      userId: item.userId,
      productId: item.productId,
      productName: item.name,
    );

    if (existing?.id != null) {
      return existing!.id!;
    }

    final DocumentReference<Map<String, dynamic>> reference =
    _wishlist.doc();

    final DateTime now = DateTime.now();

    final WishlistItem storedItem = item.copyWith(
      id: reference.id,
      createdAt: item.createdAt.millisecondsSinceEpoch == 0
          ? now
          : item.createdAt,
      updatedAt: now,
    );

    try {
      await reference.set(
        <String, dynamic>{
          ...storedItem.toMap(),
          'id': reference.id,
          'createdAt': FieldValue.serverTimestamp(),
          'updatedAt': FieldValue.serverTimestamp(),
        },
      );

      return reference.id;
    } on FirebaseException catch (error) {
      throw WishlistServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    } catch (error) {
      throw WishlistServiceException(
        message: 'Unable to add this product to wishlist.',
        code: 'add-wishlist-failed',
        originalError: error,
      );
    }
  }

  Future<bool> toggleWishlist(WishlistItem item) async {
    final WishlistItem? existing = await findWishlistItem(
      userId: item.userId,
      productId: item.productId,
      productName: item.name,
    );

    if (existing?.id != null) {
      await removeFromWishlist(existing!.id!);
      return false;
    }

    await addToWishlist(item);
    return true;
  }

  Future<void> removeFromWishlist(String id) async {
    final String cleanId = id.trim();

    if (cleanId.isEmpty) {
      return;
    }

    try {
      await _wishlist.doc(cleanId).delete();
    } on FirebaseException catch (error) {
      throw WishlistServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<void> removeByProduct({
    required String userId,
    required String productId,
    String productName = '',
  }) async {
    final WishlistItem? item = await findWishlistItem(
      userId: userId,
      productId: productId,
      productName: productName,
    );

    if (item?.id != null) {
      await removeFromWishlist(item!.id!);
    }
  }

  Future<void> clearWishlist(String userId) async {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return;
    }

    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _wishlist
          .where('userId', isEqualTo: cleanUserId)
          .get();

      if (snapshot.docs.isEmpty) {
        return;
      }

      WriteBatch batch = _db.batch();
      int operationCount = 0;

      for (final QueryDocumentSnapshot<Map<String, dynamic>> document
      in snapshot.docs) {
        batch.delete(document.reference);
        operationCount++;

        if (operationCount == 450) {
          await batch.commit();
          batch = _db.batch();
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        await batch.commit();
      }
    } on FirebaseException catch (error) {
      throw WishlistServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<WishlistItem?> findWishlistItem({
    required String userId,
    required String productId,
    String productName = '',
  }) async {
    final String cleanUserId = userId.trim();
    final String cleanProductId = productId.trim();
    final String cleanProductName = productName.trim();

    if (cleanUserId.isEmpty) {
      return null;
    }

    try {
      if (cleanProductId.isNotEmpty) {
        final QuerySnapshot<Map<String, dynamic>> snapshot =
        await _wishlist
            .where('userId', isEqualTo: cleanUserId)
            .where('productId', isEqualTo: cleanProductId)
            .limit(1)
            .get();

        if (snapshot.docs.isNotEmpty) {
          final QueryDocumentSnapshot<Map<String, dynamic>> document =
              snapshot.docs.first;

          return WishlistItem.fromMap(
            document.id,
            document.data(),
          );
        }
      }

      if (cleanProductName.isNotEmpty) {
        final QuerySnapshot<Map<String, dynamic>> snapshot =
        await _wishlist
            .where('userId', isEqualTo: cleanUserId)
            .where('name', isEqualTo: cleanProductName)
            .limit(1)
            .get();

        if (snapshot.docs.isNotEmpty) {
          final QueryDocumentSnapshot<Map<String, dynamic>> document =
              snapshot.docs.first;

          return WishlistItem.fromMap(
            document.id,
            document.data(),
          );
        }
      }

      return null;
    } on FirebaseException catch (error) {
      throw WishlistServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<bool> isWishlisted({
    required String userId,
    required String productId,
    String productName = '',
  }) async {
    final WishlistItem? item = await findWishlistItem(
      userId: userId,
      productId: productId,
      productName: productName,
    );

    return item != null;
  }

  Future<WishlistItem?> getWishlistItemById(String id) async {
    final String cleanId = id.trim();

    if (cleanId.isEmpty) {
      return null;
    }

    try {
      final DocumentSnapshot<Map<String, dynamic>> snapshot =
      await _wishlist.doc(cleanId).get();

      final Map<String, dynamic>? data = snapshot.data();

      if (!snapshot.exists || data == null) {
        return null;
      }

      return WishlistItem.fromMap(
        snapshot.id,
        data,
      );
    } on FirebaseException catch (error) {
      throw WishlistServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<List<WishlistItem>> getUserWishlistOnce(
      String userId, {
        int limit = 300,
      }) async {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return const <WishlistItem>[];
    }

    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await _wishlist
          .where('userId', isEqualTo: cleanUserId)
          .get();

      final List<WishlistItem> items = snapshot.docs
          .map(
            (QueryDocumentSnapshot<Map<String, dynamic>> document) {
          return WishlistItem.fromMap(
            document.id,
            document.data(),
          );
        },
      )
          .toList();

      items.sort(
            (WishlistItem first, WishlistItem second) {
          return second.createdAt.compareTo(first.createdAt);
        },
      );

      return items.take(_safeLimit(limit)).toList();
    } on FirebaseException catch (error) {
      throw WishlistServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<void> updateWishlistItem({
    required String id,
    required Map<String, dynamic> fields,
  }) async {
    final String cleanId = id.trim();

    if (cleanId.isEmpty || fields.isEmpty) {
      return;
    }

    final Map<String, dynamic> data =
    Map<String, dynamic>.from(fields);

    data['updatedAt'] = FieldValue.serverTimestamp();

    try {
      await _wishlist.doc(cleanId).set(
        data,
        SetOptions(merge: true),
      );
    } on FirebaseException catch (error) {
      throw WishlistServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<void> refreshWishlistItem(WishlistItem item) async {
    if (item.id == null || item.id!.trim().isEmpty) {
      await addToWishlist(item);
      return;
    }

    await updateWishlistItem(
      id: item.id!,
      fields: item.copyWith(
        updatedAt: DateTime.now(),
      ).toMap(),
    );
  }

  Stream<List<WishlistItem>> watchWishlistByCategory(
      String userId,
      String category, {
        int limit = 300,
      }) {
    final String normalizedCategory =
    category.trim().toLowerCase();

    return getUserWishlist(
      userId,
      limit: limit,
    ).map(
          (List<WishlistItem> items) {
        if (normalizedCategory.isEmpty ||
            normalizedCategory == 'all') {
          return items;
        }

        return items.where(
              (WishlistItem item) {
            return item.category.trim().toLowerCase() ==
                normalizedCategory;
          },
        ).toList();
      },
    );
  }

  Stream<List<WishlistItem>> searchWishlist(
      String userId,
      String query, {
        int limit = 300,
      }) {
    final String normalizedQuery = query.trim().toLowerCase();

    return getUserWishlist(
      userId,
      limit: limit,
    ).map(
          (List<WishlistItem> items) {
        if (normalizedQuery.isEmpty) {
          return items;
        }

        return items.where(
              (WishlistItem item) {
            final String searchable = <String>[
              item.name,
              item.teluguName,
              item.category,
              item.categoryTelugu,
              item.farmerName,
              item.farmName,
            ].join(' ').toLowerCase();

            return searchable.contains(normalizedQuery);
          },
        ).toList();
      },
    );
  }

  Future<WishlistSummary> getWishlistSummary(
      String userId,
      ) async {
    final List<WishlistItem> items =
    await getUserWishlistOnce(userId);

    return WishlistSummary.fromItems(items);
  }

  void _validateItem(WishlistItem item) {
    if (item.userId.trim().isEmpty) {
      throw const WishlistServiceException(
        message: 'User ID is required.',
        code: 'missing-user-id',
      );
    }

    if (item.name.trim().isEmpty) {
      throw const WishlistServiceException(
        message: 'Product name is required.',
        code: 'missing-product-name',
      );
    }

    if (item.price < 0) {
      throw const WishlistServiceException(
        message: 'Product price cannot be negative.',
        code: 'invalid-price',
      );
    }
  }

  int _safeLimit(int limit) {
    if (limit <= 0) {
      return 1;
    }

    if (limit > 500) {
      return 500;
    }

    return limit;
  }

  String _firebaseMessage(FirebaseException error) {
    switch (error.code) {
      case 'permission-denied':
        return 'Firestore permission denied. Check Firebase rules.';
      case 'unavailable':
        return 'Wishlist service is unavailable. Check your internet.';
      case 'not-found':
        return 'Wishlist item was not found.';
      case 'deadline-exceeded':
        return 'Wishlist request timed out. Please try again.';
      case 'cancelled':
        return 'Wishlist operation was cancelled.';
      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Unable to complete wishlist operation.';
    }
  }
}

class WishlistSummary {
  final int totalItems;
  final int availableItems;
  final int unavailableItems;
  final int quickItems;
  final int preOrderItems;
  final int organicItems;
  final int discountedItems;
  final int totalWishlistValue;
  final int totalSavings;

  const WishlistSummary({
    required this.totalItems,
    required this.availableItems,
    required this.unavailableItems,
    required this.quickItems,
    required this.preOrderItems,
    required this.organicItems,
    required this.discountedItems,
    required this.totalWishlistValue,
    required this.totalSavings,
  });

  factory WishlistSummary.fromItems(
      List<WishlistItem> items,
      ) {
    int availableItems = 0;
    int unavailableItems = 0;
    int quickItems = 0;
    int preOrderItems = 0;
    int organicItems = 0;
    int discountedItems = 0;
    int totalWishlistValue = 0;
    int totalSavings = 0;

    for (final WishlistItem item in items) {
      totalWishlistValue += item.price;
      totalSavings += item.savings;

      if (item.isAvailable) {
        availableItems++;
      } else {
        unavailableItems++;
      }

      if (item.isQuick) {
        quickItems++;
      }

      if (item.isPreOrder) {
        preOrderItems++;
      }

      if (item.organic) {
        organicItems++;
      }

      if (item.hasDiscount) {
        discountedItems++;
      }
    }

    return WishlistSummary(
      totalItems: items.length,
      availableItems: availableItems,
      unavailableItems: unavailableItems,
      quickItems: quickItems,
      preOrderItems: preOrderItems,
      organicItems: organicItems,
      discountedItems: discountedItems,
      totalWishlistValue: totalWishlistValue,
      totalSavings: totalSavings,
    );
  }
}

class WishlistServiceException implements Exception {
  final String message;
  final String code;
  final Object? originalError;

  const WishlistServiceException({
    required this.message,
    this.code = 'wishlist-service-error',
    this.originalError,
  });

  @override
  String toString() {
    return 'WishlistServiceException(code: $code, message: $message)';
  }
}