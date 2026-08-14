import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/review_model.dart';

class ReviewService {
  ReviewService({
    FirebaseFirestore? firestore,
  }) : _db = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  CollectionReference<Map<String, dynamic>> get _reviews {
    return _db.collection('reviews');
  }

  Stream<List<ReviewModel>> watchProductReviews(
      String productId, {
        int limit = 100,
      }) {
    final String cleanProductId = productId.trim();

    if (cleanProductId.isEmpty) {
      return Stream<List<ReviewModel>>.value(
        const <ReviewModel>[],
      );
    }

    return _reviews
        .where('productId', isEqualTo: cleanProductId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<ReviewModel> reviews = snapshot.docs
            .map(
              (
              QueryDocumentSnapshot<Map<String, dynamic>>
              document,
              ) {
            return ReviewModel.fromMap(
              document.id,
              document.data(),
            );
          },
        )
            .toList();

        reviews.sort(
              (ReviewModel first, ReviewModel second) {
            return second.createdAt.compareTo(
              first.createdAt,
            );
          },
        );

        return reviews.take(limit.clamp(1, 300)).toList();
      },
    );
  }

  Future<String> saveReview(ReviewModel review) async {
    _validate(review);

    final QuerySnapshot<Map<String, dynamic>> existing =
    await _reviews
        .where('productId', isEqualTo: review.productId)
        .where('userId', isEqualTo: review.userId)
        .limit(1)
        .get();

    final DateTime now = DateTime.now();

    try {
      if (existing.docs.isNotEmpty) {
        final DocumentReference<Map<String, dynamic>> reference =
            existing.docs.first.reference;

        await reference.set(
          <String, dynamic>{
            ...review.copyWith(
              id: reference.id,
              createdAt: ReviewModel.fromMap(
                existing.docs.first.id,
                existing.docs.first.data(),
              ).createdAt,
              updatedAt: now,
            ).toMap(),
            'updatedAt': FieldValue.serverTimestamp(),
          },
          SetOptions(merge: true),
        );

        return reference.id;
      }

      final DocumentReference<Map<String, dynamic>> reference =
      _reviews.doc();

      await reference.set(
        <String, dynamic>{
          ...review.copyWith(
            id: reference.id,
            createdAt: now,
            updatedAt: now,
          ).toMap(),
          'id': reference.id,
          'createdAt': FieldValue.serverTimestamp(),
          'updatedAt': FieldValue.serverTimestamp(),
        },
      );

      return reference.id;
    } on FirebaseException catch (error) {
      throw ReviewServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<void> deleteReview({
    required String reviewId,
    required String userId,
  }) async {
    final String cleanReviewId = reviewId.trim();

    if (cleanReviewId.isEmpty) return;

    final DocumentReference<Map<String, dynamic>> reference =
    _reviews.doc(cleanReviewId);

    try {
      await _db.runTransaction(
            (Transaction transaction) async {
          final DocumentSnapshot<Map<String, dynamic>> snapshot =
          await transaction.get(reference);

          final Map<String, dynamic>? data = snapshot.data();

          if (!snapshot.exists || data == null) {
            return;
          }

          if ((data['userId'] ?? '').toString() != userId) {
            throw const ReviewServiceException(
              message: 'You can delete only your own review.',
              code: 'not-review-owner',
            );
          }

          transaction.delete(reference);
        },
      );
    } on ReviewServiceException {
      rethrow;
    } on FirebaseException catch (error) {
      throw ReviewServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<void> toggleHelpful({
    required ReviewModel review,
    required String userId,
  }) async {
    final String? reviewId = review.id;

    if (reviewId == null || reviewId.trim().isEmpty) {
      return;
    }

    final DocumentReference<Map<String, dynamic>> reference =
    _reviews.doc(reviewId);

    try {
      await _db.runTransaction(
            (Transaction transaction) async {
          final DocumentSnapshot<Map<String, dynamic>> snapshot =
          await transaction.get(reference);

          final Map<String, dynamic>? data = snapshot.data();

          if (!snapshot.exists || data == null) {
            return;
          }

          final ReviewModel current = ReviewModel.fromMap(
            snapshot.id,
            data,
          );

          final List<String> users =
          List<String>.from(current.helpfulUserIds);

          if (users.contains(userId)) {
            users.remove(userId);
          } else {
            users.add(userId);
          }

          transaction.set(
            reference,
            <String, dynamic>{
              'helpfulUserIds': users,
              'helpfulCount': users.length,
              'updatedAt': FieldValue.serverTimestamp(),
            },
            SetOptions(merge: true),
          );
        },
      );
    } on FirebaseException catch (error) {
      throw ReviewServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  ReviewSummary summarize(List<ReviewModel> reviews) {
    return ReviewSummary.fromReviews(reviews);
  }

  void _validate(ReviewModel review) {
    if (review.productId.trim().isEmpty) {
      throw const ReviewServiceException(
        message: 'Product ID is required.',
        code: 'missing-product-id',
      );
    }

    if (review.userId.trim().isEmpty) {
      throw const ReviewServiceException(
        message: 'Please sign in to write a review.',
        code: 'missing-user-id',
      );
    }

    if (review.rating < 1 || review.rating > 5) {
      throw const ReviewServiceException(
        message: 'Select a rating between 1 and 5.',
        code: 'invalid-rating',
      );
    }

    if (review.review.trim().length < 5) {
      throw const ReviewServiceException(
        message: 'Review must contain at least 5 characters.',
        code: 'review-too-short',
      );
    }
  }

  String _firebaseMessage(FirebaseException error) {
    switch (error.code) {
      case 'permission-denied':
        return 'Firestore permission denied. Check review rules.';
      case 'unavailable':
        return 'Review service is unavailable. Check your internet.';
      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Unable to complete review operation.';
    }
  }
}

class ReviewSummary {
  final int totalReviews;
  final double averageRating;
  final Map<int, int> ratingCounts;

  const ReviewSummary({
    required this.totalReviews,
    required this.averageRating,
    required this.ratingCounts,
  });

  factory ReviewSummary.fromReviews(
      List<ReviewModel> reviews,
      ) {
    final Map<int, int> counts = <int, int>{
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    double total = 0;

    for (final ReviewModel review in reviews) {
      final int rounded =
      review.rating.round().clamp(1, 5);
      counts[rounded] = (counts[rounded] ?? 0) + 1;
      total += review.rating;
    }

    return ReviewSummary(
      totalReviews: reviews.length,
      averageRating:
      reviews.isEmpty ? 0 : total / reviews.length,
      ratingCounts: counts,
    );
  }

  double percentageFor(int star) {
    if (totalReviews == 0) return 0;
    return (ratingCounts[star] ?? 0) / totalReviews;
  }
}

class ReviewServiceException implements Exception {
  final String message;
  final String code;
  final Object? originalError;

  const ReviewServiceException({
    required this.message,
    this.code = 'review-service-error',
    this.originalError,
  });

  @override
  String toString() {
    return 'ReviewServiceException(code: $code, message: $message)';
  }
}