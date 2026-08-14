import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/farmer_model.dart';

class FarmerRemoteSource {
  FarmerRemoteSource({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> get _farmers =>
      _firestore.collection('farmers');

  Stream<List<FarmerModel>> watchFarmers({int limit = 100}) {
    return _farmers.snapshots().map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<FarmerModel> farmers = snapshot.docs
            .map(FarmerModel.fromDocument)
            .toList(growable: true);
        return _sortAndLimit(farmers, limit);
      },
    );
  }

  Future<List<FarmerModel>> getFarmers({int limit = 100}) async {
    final QuerySnapshot<Map<String, dynamic>> snapshot = await _farmers.get();
    final List<FarmerModel> farmers = snapshot.docs
        .map(FarmerModel.fromDocument)
        .toList(growable: true);
    return _sortAndLimit(farmers, limit);
  }

  Stream<FarmerModel?> watchFarmer(String farmerId) {
    final String id = farmerId.trim();
    if (id.isEmpty) return Stream<FarmerModel?>.value(null);

    return _farmers.doc(id).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> document) {
        if (!document.exists || document.data() == null) return null;
        return FarmerModel.fromDocument(document);
      },
    );
  }

  Future<FarmerModel?> getFarmer(String farmerId) async {
    final String id = farmerId.trim();
    if (id.isEmpty) return null;

    final DocumentSnapshot<Map<String, dynamic>> document =
    await _farmers.doc(id).get();
    if (!document.exists || document.data() == null) return null;
    return FarmerModel.fromDocument(document);
  }

  Future<String> saveFarmer(FarmerModel farmer) async {
    final DocumentReference<Map<String, dynamic>> reference =
    farmer.id.trim().isEmpty
        ? _farmers.doc()
        : _farmers.doc(farmer.id.trim());

    await reference.set(
      <String, dynamic>{
        ...farmer.toMap(),
        'id': reference.id,
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
    return reference.id;
  }

  List<FarmerModel> _sortAndLimit(
      List<FarmerModel> farmers,
      int limit,
      ) {
    farmers.sort((FarmerModel first, FarmerModel second) {
      if (first.isVerified != second.isVerified) {
        return first.isVerified ? -1 : 1;
      }
      final int ratingComparison = second.rating.compareTo(first.rating);
      if (ratingComparison != 0) return ratingComparison;
      return first.name.toLowerCase().compareTo(second.name.toLowerCase());
    });

    if (limit <= 0 || farmers.length <= limit) {
      return List<FarmerModel>.unmodifiable(farmers);
    }
    return List<FarmerModel>.unmodifiable(farmers.take(limit));
  }
}
