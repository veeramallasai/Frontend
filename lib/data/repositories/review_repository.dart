import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/review_model.dart';

class ReviewRepository {
  ReviewRepository({FirebaseFirestore? firestore, FirebaseAuth? auth})
      : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  CollectionReference<Map<String, dynamic>> get _reviews =>
      _firestore.collection('reviews');

  Stream<List<ReviewModel>> watchProductReviews(String productId) {
    return _reviews.where('productId', isEqualTo: productId.trim()).snapshots().map(
      (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<ReviewModel> values = snapshot.docs
            .map(ReviewModel.fromDocument)
            .toList(growable: true)
          ..sort((ReviewModel a, ReviewModel b) =>
              (b.createdAt ?? DateTime(1970)).compareTo(a.createdAt ?? DateTime(1970)));
        return List<ReviewModel>.unmodifiable(values);
      },
    );
  }

  Future<String> saveReview(ReviewModel review) async {
    final String userId = _requireUserId();
    final DocumentReference<Map<String, dynamic>> ref = review.id.trim().isEmpty
        ? _reviews.doc()
        : _reviews.doc(review.id.trim());
    await ref.set(<String, dynamic>{
      ...review.copyWith(id: ref.id, userId: userId).toMap(),
      if (review.createdAt == null) 'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
    return ref.id;
  }

  Future<void> deleteReview(String reviewId) async {
    final String userId = _requireUserId();
    final DocumentReference<Map<String, dynamic>> ref = _reviews.doc(reviewId.trim());
    final DocumentSnapshot<Map<String, dynamic>> doc = await ref.get();
    if (!doc.exists) return;
    if ((doc.data()?['userId']?.toString() ?? '') != userId) {
      throw StateError('You can delete only your own review.');
    }
    await ref.delete();
  }

  String _requireUserId() {
    final String id = _auth.currentUser?.uid.trim() ?? '';
    if (id.isEmpty) throw StateError('Please login to continue.');
    return id;
  }
}
