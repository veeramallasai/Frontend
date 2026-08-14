import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';

/// Call this function **once** (e.g., from a temporary button) to update all
/// product images in Firestore from network URLs to local asset paths.
///
/// Make sure you have already downloaded the real images into
/// `assets/images/vegetables/` and declared that folder in `pubspec.yaml`.
Future<void> updateProductImagesToLocalAssets() async {
  final firestore = FirebaseFirestore.instance;

  // ---------------------------------------------------------------
  // 🔧 EDIT THIS MAP to match the EXACT product names you have in
  //    your Firestore `products` collection.
  // ---------------------------------------------------------------
  const Map<String, String> productImageMap = {
    'Fresh Tomatoes': 'assets/images/vegetables/tomato.png',
    'Potatoes': 'assets/images/vegetables/potato.png',
    'Onions': 'assets/images/vegetables/onion.png',
    'Carrots': 'assets/images/vegetables/carrot.png',
    'Cabbage': 'assets/images/vegetables/cabbage.png',
    'Cauliflower': 'assets/images/vegetables/cauliflower.png',
    'Brinjal': 'assets/images/vegetables/brinjal.png',
    'Capsicum': 'assets/images/vegetables/capsicum.png',
    'Cucumber': 'assets/images/vegetables/cucumber.png',
    'Spinach': 'assets/images/vegetables/spinach.png',
    'Okra': 'assets/images/vegetables/okra.png',
    'Bottle Gourd': 'assets/images/vegetables/bottle_gourd.png',
    'Bitter Gourd': 'assets/images/vegetables/bitter_gourd.png',
    'Ridge Gourd': 'assets/images/vegetables/ridge_gourd.png',
    'Snake Gourd': 'assets/images/vegetables/snake_gourd.png',
    'Pumpkin': 'assets/images/vegetables/pumpkin.png',
    'Radish': 'assets/images/vegetables/radish.png',
    'Beetroot': 'assets/images/vegetables/beetroot.png',
    'Sweet Potato': 'assets/images/vegetables/sweet_potato.png',
    'Green Peas': 'assets/images/vegetables/green_peas.png',
    'Corn': 'assets/images/vegetables/corn.png',
    'Broccoli': 'assets/images/vegetables/broccoli.png',
    'Lettuce': 'assets/images/vegetables/lettuce.png',
    'Celery': 'assets/images/vegetables/celery.png',
    'Asparagus': 'assets/images/vegetables/asparagus.png',
    'Zucchini': 'assets/images/vegetables/zucchini.png',
    'Mushroom': 'assets/images/vegetables/mushroom.png',
    'Ginger': 'assets/images/vegetables/ginger.png',
    'Garlic': 'assets/images/vegetables/garlic.png',
    'Spring Onion': 'assets/images/vegetables/spring_onion.png',
    'Coriander': 'assets/images/vegetables/coriander.png',
    'Mint': 'assets/images/vegetables/mint.png',
    'Curry Leaves': 'assets/images/vegetables/curry_leaves.png',
    'Drumstick': 'assets/images/vegetables/drumstick.png',
    'Cluster Beans': 'assets/images/vegetables/cluster_beans.png',
    'French Beans': 'assets/images/vegetables/french_beans.png',
    'Raw Banana': 'assets/images/vegetables/raw_banana.png',
    'Yam': 'assets/images/vegetables/yam.png',
    'Colocasia': 'assets/images/vegetables/colocasia.png',
    'Turnip': 'assets/images/vegetables/turnip.png',
    'Fenugreek': 'assets/images/vegetables/fenugreek.png',
    'Amaranth': 'assets/images/vegetables/amaranth.png',
    'Dill Leaves': 'assets/images/vegetables/dill_leaves.png',
    'Green Chilli': 'assets/images/vegetables/green_chilli.png',
    'Red Chilli': 'assets/images/vegetables/red_chilli.png',
    'Ivy Gourd': 'assets/images/vegetables/ivy_gourd.png',
    'Ash Gourd': 'assets/images/vegetables/ash_gourd.png',
    'Chow Chow': 'assets/images/vegetables/chow_chow.png',
    'Bamboo Shoot': 'assets/images/vegetables/bamboo_shoot.png',
    'Kale': 'assets/images/vegetables/kale.png',
    // Add other products (fruits, dairy…) here when needed
  };

  final batch = firestore.batch();
  final snapshot = await firestore.collection('products').get();

  for (final doc in snapshot.docs) {
    final name = doc.data()['name'] as String?;
    if (name != null && productImageMap.containsKey(name)) {
      final localPath = productImageMap[name]!;
      batch.update(doc.reference, {'image': localPath});
    }
  }

  await batch.commit();
  debugPrint('✅ All product images updated to local assets.');
}