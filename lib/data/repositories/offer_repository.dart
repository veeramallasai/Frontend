import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/offer_model.dart';

class OfferRepository {
  OfferRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  List<OfferModel> get localOffers => const <OfferModel>[
        OfferModel(
          id: 'fresh10',
          title: 'Fresh 10% Off',
          description: 'Save on your first farm-fresh basket',
          code: 'FRESH10',
          discountValue: 10,
          minimumOrder: 299,
          maximumDiscount: 100,
        ),
        OfferModel(
          id: 'farm50',
          title: '₹50 Farm Savings',
          description: 'Flat savings on orders above ₹499',
          code: 'FARM50',
          discountType: 'fixed',
          discountValue: 50,
          minimumOrder: 499,
        ),
      ];

  Stream<List<OfferModel>> watchOffers() async* {
    yield localOffers;
    try {
      await for (final QuerySnapshot<Map<String, dynamic>> snapshot
          in _firestore.collection('offers').snapshots()) {
        final List<OfferModel> values = snapshot.docs
            .map(OfferModel.fromDocument)
            .where((OfferModel offer) => offer.isAvailable)
            .toList(growable: false);
        if (values.isNotEmpty) yield List<OfferModel>.unmodifiable(values);
      }
    } catch (_) {
      yield localOffers;
    }
  }

  Future<List<OfferModel>> getOffers() async {
    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
          await _firestore.collection('offers').get();
      final List<OfferModel> values = snapshot.docs
          .map(OfferModel.fromDocument)
          .where((OfferModel offer) => offer.isAvailable)
          .toList(growable: false);
      return values.isEmpty ? localOffers : List<OfferModel>.unmodifiable(values);
    } catch (_) {
      return localOffers;
    }
  }
}
