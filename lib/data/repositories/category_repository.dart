import 'package:cloud_firestore/cloud_firestore.dart';

import '../../core/constants/asset_paths.dart';
import '../local/local_product_catalog.dart';
import '../models/category_model.dart';

class CategoryRepository {
  CategoryRepository({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  List<CategoryModel> get localCategories => <CategoryModel>[
        _local('vegetables', 'Vegetables', 0),
        _local('fruits', 'Fruits', 1),
        _local('dairy', 'Dairy', 2),
        _local('seasonal', 'Seasonal', 3),
      ];

  Stream<List<CategoryModel>> watchCategories() async* {
    yield localCategories;
    try {
      await for (final QuerySnapshot<Map<String, dynamic>> snapshot
          in _firestore.collection('categories').snapshots()) {
        final List<CategoryModel> remote = snapshot.docs
            .map(CategoryModel.fromDocument)
            .where((CategoryModel item) => item.isActive)
            .toList(growable: true)
          ..sort((CategoryModel a, CategoryModel b) => a.sortOrder.compareTo(b.sortOrder));
        if (remote.isNotEmpty) yield List<CategoryModel>.unmodifiable(remote);
      }
    } catch (_) {
      yield localCategories;
    }
  }

  Future<List<CategoryModel>> getCategories() async {
    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
          await _firestore.collection('categories').get();
      final List<CategoryModel> values = snapshot.docs
          .map(CategoryModel.fromDocument)
          .where((CategoryModel item) => item.isActive)
          .toList(growable: true)
        ..sort((CategoryModel a, CategoryModel b) => a.sortOrder.compareTo(b.sortOrder));
      return values.isEmpty ? localCategories : List<CategoryModel>.unmodifiable(values);
    } catch (_) {
      return localCategories;
    }
  }

  CategoryModel _local(String id, String name, int order) => CategoryModel(
        id: id,
        name: name,
        description: 'Fresh $name selected for you',
        imageUrl: AssetPaths.categoryImage(id) ?? '',
        productCount: LocalProductCatalog.products(category: id).length,
        sortOrder: order,
      );
}
