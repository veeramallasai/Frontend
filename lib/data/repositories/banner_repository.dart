import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/asset_paths.dart';
import '../models/banner_model.dart';

class BannerRepository {
  BannerRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  List<BannerModel> get localBanners => <BannerModel>[
        const BannerModel(
          id: 'fresh_vegetables',
          title: 'Fresh from local farms',
          subtitle: 'Handpicked vegetables delivered with care',
          imageUrl: AssetPaths.categoryVegetables,
          actionLabel: 'Shop now',
          route: '/category-products?category=vegetables',
        ),
        const BannerModel(
          id: 'seasonal_fruits',
          title: 'Seasonal favourites',
          subtitle: 'Naturally fresh fruits at honest prices',
          imageUrl: AssetPaths.categorySeasonal,
          actionLabel: 'Explore',
          route: '/category-products?category=seasonal',
          priority: 1,
        ),
      ];

  Stream<List<BannerModel>> watchBanners() async* {
    yield localBanners;
    try {
      await for (final QuerySnapshot<Map<String, dynamic>> snapshot
          in _firestore.collection('banners').snapshots()) {
        final List<BannerModel> values = snapshot.docs
            .map(BannerModel.fromDocument)
            .where((BannerModel banner) => banner.isVisible)
            .toList(growable: true)
          ..sort((BannerModel a, BannerModel b) => a.priority.compareTo(b.priority));
        if (values.isNotEmpty) yield List<BannerModel>.unmodifiable(values);
      }
    } catch (_) {
      yield localBanners;
    }
  }

  Future<List<BannerModel>> getBanners() async {
    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
          await _firestore.collection('banners').get();
      final List<BannerModel> values = snapshot.docs
          .map(BannerModel.fromDocument)
          .where((BannerModel banner) => banner.isVisible)
          .toList(growable: true)
        ..sort((BannerModel a, BannerModel b) => a.priority.compareTo(b.priority));
      return values.isEmpty ? localBanners : List<BannerModel>.unmodifiable(values);
    } catch (_) {
      return localBanners;
    }
  }
}
