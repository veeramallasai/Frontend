import 'package:cloud_firestore/cloud_firestore.dart';

Future<void> addAllVegetableProducts() async {
  final firestore = FirebaseFirestore.instance;
  final existingDocs = await firestore.collection('products').get();
  final existingNames = existingDocs.docs
      .map((doc) => doc.data()['name'] as String?)
      .where((name) => name != null)
      .toSet();

  final List<Map<String, dynamic>> products = [
    // --- Copy the entire list from my previous message (the JSON array) here ---
    // I'll paste the first few items for brevity, but you must replace with the full list.
    {
      "name": "Fresh Tomatoes",
      "image": "", // we'll leave empty; local file will be used
      "price": 18, "weight": "500 g", "discount": 28, "category": "Vegetables",
      "deliveryTime": "6 minutes",
      "highlights": {"product type": "Vegetable", "imported": "No", "good for": "Immunity", "dietary preference": "Veg"},
      "seller": "Farm Fresh Organics", "origin": "India", "shelf_life": "4 days",
      "organic": true, "rating": 4.5, "description": "Fresh and juicy tomatoes picked at peak ripeness.",
      "inStock": true, "bestSeller": true
    },
    // ... add all 50 items from my previous message (I'll provide a separate file if needed)
  ];

  final batch = firestore.batch();
  int added = 0;
  for (final product in products) {
    final name = product['name'] as String;
    if (!existingNames.contains(name)) {
      batch.set(firestore.collection('products').doc(), product);
      added++;
    }
  }
  if (added > 0) {
    await batch.commit();
  }
}