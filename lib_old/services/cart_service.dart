import 'dart:async';

import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../models/product_model.dart';

enum CartDeliveryMode {
  quick,
  scheduled,
  preOrder,
}

class CartItem {
  final String productId;
  final String name;
  final String teluguName;
  final String image;
  final int price;
  final String weight;
  final String category;
  final String categoryTelugu;


  // Farmer metadata
  final String farmerId;
  final String farmerName;
  final String farmName;

  // Product and delivery metadata
  final bool organic;
  final double rating;
  final bool isQuick;
  final int quickDeliveryMinutes;
  final int minimumQuickQuantity;
  final double quickAvailableStock;
  final List<String> availableUnits;
  final List<String> availableDeliveryDays;
  final String normalDeliveryNote;
  final bool isPreOrder;
  final DateTime? harvestDate;
  final DateTime? expectedDeliveryDate;
  final String deliverySlot;

  final String quantityType;
  final bool isCustomQuantity;
  final double selectedQuantityValue;
  final String selectedQuantityUnit;
  final double approximateWeightPerUnitKg;

  int quantity;

  CartItem({
    this.productId = '',
    required this.name,
    this.teluguName = '',
    required this.image,
    required this.price,
    this.weight = '',
    this.category = '',
    this.categoryTelugu = '',
    this.farmerId = '',
    this.farmerName = '',
    this.farmName = '',
    this.organic = true,
    this.rating = 0,
    this.isQuick = false,
    this.quickDeliveryMinutes = 0,
    this.minimumQuickQuantity = 1,
    this.quickAvailableStock = 0,
    this.availableUnits = const <String>[],
    this.availableDeliveryDays = const <String>[],
    this.normalDeliveryNote = '',
    this.isPreOrder = false,
    this.harvestDate,
    this.expectedDeliveryDate,
    this.deliverySlot = '',
    this.quantityType = 'weight',
    this.isCustomQuantity = false,
    this.selectedQuantityValue = 0,
    this.selectedQuantityUnit = '',
    this.approximateWeightPerUnitKg = 1,
    this.quantity = 1,
  });

  String get displayName {
    final String english = name.trim();
    final String telugu = teluguName.trim();

    if (english.isEmpty && telugu.isEmpty) {
      return 'Unknown Product';
    }

    if (telugu.isEmpty) {
      return english;
    }

    if (english.isEmpty) {
      return telugu;
    }

    return '$english ($telugu)';
  }

  String get displayCategory {
    final String english = category.trim();
    final String telugu = categoryTelugu.trim();

    if (english.isEmpty && telugu.isEmpty) {
      return '';
    }

    if (telugu.isEmpty) {
      return english;
    }

    if (english.isEmpty) {
      return telugu;
    }

    return '$english ($telugu)';
  }

  int get itemTotal {
    return price * quantity;
  }

  double get selectedUnitWeightKg {
    final double parsed = _weightInKgFromLabel(weight);
    if (parsed > 0) return parsed;
    if (selectedQuantityValue > 0) {
      final String normalized = selectedQuantityUnit.trim().toLowerCase();
      if (normalized == 'kg') return selectedQuantityValue;
      if (normalized == 'g') return selectedQuantityValue / 1000;
      if (normalized == 'l' || normalized == 'litre' || normalized == 'liter') return selectedQuantityValue;
      if (normalized == 'ml') return selectedQuantityValue / 1000;
      return selectedQuantityValue * safeApproximateWeightPerUnitKg;
    }
    return safeApproximateWeightPerUnitKg;
  }

  double get safeApproximateWeightPerUnitKg =>
      approximateWeightPerUnitKg > 0 ? approximateWeightPerUnitKg : 1;

  double get totalWeightKg => selectedUnitWeightKg * quantity;

  String get farmerDisplayName {
    if (farmName.trim().isNotEmpty) {
      return farmName.trim();
    }

    if (farmerName.trim().isNotEmpty) {
      return farmerName.trim();
    }

    return 'Farm To Home Growers';
  }

  bool get hasDeliverySlot => deliverySlot.trim().isNotEmpty;

  bool get hasHarvestDate => harvestDate != null;

  bool get hasExpectedDeliveryDate => expectedDeliveryDate != null;

  String get quickDeliveryText {
    return isQuick ? 'Quick Delivery' : '';
  }

  int get safeMinimumQuickQuantity {
    if (!isQuick || minimumQuickQuantity < 1) {
      return 1;
    }

    return minimumQuickQuantity;
  }

  bool get isAtQuickMinimum {
    return isQuick &&
        quantity <= safeMinimumQuickQuantity;
  }

  bool get canDecreaseQuantity {
    if (!isQuick) {
      return quantity > 0;
    }

    return quantity > safeMinimumQuickQuantity;
  }

  String get deliveryModeLabel {
    if (isPreOrder) {
      return 'Pre-Order';
    }

    if (isQuick) {
      return 'Quick Delivery';
    }

    return 'Scheduled Delivery';
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'productId': productId,
      'name': name,
      'teluguName': teluguName,
      'displayName': displayName,
      'image': image,
      'price': price,
      'weight': weight,
      'category': category,
      'categoryTelugu': categoryTelugu,
      'farmerId': farmerId,
      'farmerName': farmerName,
      'farmName': farmName,
      'organic': organic,
      'rating': rating,
      'isQuick': isQuick,
      'quickDeliveryMinutes': quickDeliveryMinutes,
      'minimumQuickQuantity': safeMinimumQuickQuantity,
      'quickAvailableStock': quickAvailableStock,
      'availableUnits': availableUnits,
      'availableDeliveryDays': availableDeliveryDays,
      'normalDeliveryNote': normalDeliveryNote,
      'isPreOrder': isPreOrder,
      'harvestDate': harvestDate == null
          ? null
          : Timestamp.fromDate(harvestDate!),
      'expectedDeliveryDate': expectedDeliveryDate == null
          ? null
          : Timestamp.fromDate(expectedDeliveryDate!),
      'deliverySlot': deliverySlot,
      'quantityType': quantityType,
      'isCustomQuantity': isCustomQuantity,
      'selectedQuantityValue': selectedQuantityValue,
      'selectedQuantityUnit': selectedQuantityUnit,
      'approximateWeightPerUnitKg': safeApproximateWeightPerUnitKg,
      'calculatedWeightKg': totalWeightKg,
      'quantity': quantity,
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  factory CartItem.fromMap(Map<String, dynamic> map) {
    return CartItem(
      productId: _stringValue(map['productId'] ?? map['id']),
      name: _extractEnglishName(
        _stringValue(
          map['name'],
          fallback: 'Unknown Product',
        ),
      ),
      teluguName: _stringValue(map['teluguName']),
      image: _stringValue(map['image']),
      price: _intValue(map['price']),
      weight: _stringValue(map['weight']),
      category: _stringValue(map['category']),
      categoryTelugu: _stringValue(map['categoryTelugu']),
      farmerId: _stringValue(map['farmerId']),
      farmerName: _stringValue(map['farmerName']),
      farmName: _stringValue(
        map['farmName'] ?? map['seller'],
      ),
      organic: _boolValue(
        map['organic'],
        fallback: true,
      ),
      rating: _doubleValue(map['rating']),
      isQuick: _boolValue(map['isQuick']),
      quickDeliveryMinutes: _intValue(
        map['quickDeliveryMinutes'],
      ),
      minimumQuickQuantity: _intValue(
        map['minimumQuickQuantity'],
        fallback: 1,
      ),
      quickAvailableStock: _doubleValue(
        map['quickAvailableStock'],
      ),
      availableUnits: _stringListValue(
        map['availableUnits'],
      ),
      availableDeliveryDays: _stringListValue(
        map['availableDeliveryDays'],
      ),
      normalDeliveryNote: _stringValue(
        map['normalDeliveryNote'],
      ),
      isPreOrder: _boolValue(
        map['isPreOrder'] ?? map['preOrder'],
      ),
      harvestDate: _dateTimeValue(map['harvestDate']),
      expectedDeliveryDate: _dateTimeValue(
        map['expectedDeliveryDate'] ?? map['deliveryDate'],
      ),
      deliverySlot: _stringValue(
        map['deliverySlot'] ?? map['timeSlot'],
      ),
      quantity: _intValue(
        map['quantity'],
        fallback: 1,
      ),
    );
  }

  CartItem copyWith({
    String? productId,
    String? name,
    String? teluguName,
    String? image,
    int? price,
    String? weight,
    String? category,
    String? categoryTelugu,
    String? farmerId,
    String? farmerName,
    String? farmName,
    bool? organic,
    double? rating,
    bool? isQuick,
    int? quickDeliveryMinutes,
    int? minimumQuickQuantity,
    double? quickAvailableStock,
    List<String>? availableUnits,
    List<String>? availableDeliveryDays,
    String? normalDeliveryNote,
    bool? isPreOrder,
    DateTime? harvestDate,
    DateTime? expectedDeliveryDate,
    String? deliverySlot,
    String? quantityType,
    bool? isCustomQuantity,
    double? selectedQuantityValue,
    String? selectedQuantityUnit,
    double? approximateWeightPerUnitKg,
    int? quantity,
  }) {
    return CartItem(
      productId: productId ?? this.productId,
      name: name ?? this.name,
      teluguName: teluguName ?? this.teluguName,
      image: image ?? this.image,
      price: price ?? this.price,
      weight: weight ?? this.weight,
      category: category ?? this.category,
      categoryTelugu: categoryTelugu ?? this.categoryTelugu,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      farmName: farmName ?? this.farmName,
      organic: organic ?? this.organic,
      rating: rating ?? this.rating,
      isQuick: isQuick ?? this.isQuick,
      quickDeliveryMinutes:
      quickDeliveryMinutes ?? this.quickDeliveryMinutes,
      minimumQuickQuantity:
      minimumQuickQuantity ?? this.minimumQuickQuantity,
      quickAvailableStock:
      quickAvailableStock ?? this.quickAvailableStock,
      availableUnits:
      availableUnits ?? this.availableUnits,
      availableDeliveryDays:
      availableDeliveryDays ?? this.availableDeliveryDays,
      normalDeliveryNote:
      normalDeliveryNote ?? this.normalDeliveryNote,
      isPreOrder: isPreOrder ?? this.isPreOrder,
      harvestDate: harvestDate ?? this.harvestDate,
      expectedDeliveryDate:
      expectedDeliveryDate ?? this.expectedDeliveryDate,
      deliverySlot: deliverySlot ?? this.deliverySlot,
      quantityType: quantityType ?? this.quantityType,
      isCustomQuantity: isCustomQuantity ?? this.isCustomQuantity,
      selectedQuantityValue: selectedQuantityValue ?? this.selectedQuantityValue,
      selectedQuantityUnit: selectedQuantityUnit ?? this.selectedQuantityUnit,
      approximateWeightPerUnitKg:
      approximateWeightPerUnitKg ?? this.approximateWeightPerUnitKg,
      quantity: quantity ?? this.quantity,
    );
  }

  static double _weightInKgFromLabel(String label) {
    final String normalized = label.trim().toLowerCase();
    final RegExpMatch? match = RegExp(r'\d+(?:\.\d+)?').firstMatch(normalized);
    if (match == null) return 0;
    final double value = double.tryParse(match.group(0) ?? '') ?? 0;
    if (value <= 0) return 0;
    if (normalized.contains('kg')) return value;
    if (normalized.contains('ml')) return value / 1000;
    if (normalized.contains(' g') || normalized.endsWith('g')) return value / 1000;
    if (normalized.contains(' l') || normalized.endsWith('l') || normalized.contains('litre') || normalized.contains('liter')) return value;
    return 0;
  }

  static String _stringValue(
      dynamic value, {
        String fallback = '',
      }) {
    if (value == null) {
      return fallback;
    }

    final String result = value.toString().trim();

    if (result.isEmpty) {
      return fallback;
    }

    return result;
  }

  static int _intValue(
      dynamic value, {
        int fallback = 0,
      }) {
    if (value is num) {
      return value.round();
    }

    if (value is String) {
      return double.tryParse(value.trim())?.round() ?? fallback;
    }

    return fallback;
  }

  static double _doubleValue(
      dynamic value, {
        double fallback = 0,
      }) {
    if (value is num) {
      return value.toDouble();
    }

    if (value is String) {
      return double.tryParse(value.trim()) ?? fallback;
    }

    return fallback;
  }

  static bool _boolValue(
      dynamic value, {
        bool fallback = false,
      }) {
    if (value is bool) {
      return value;
    }

    if (value is num) {
      return value != 0;
    }

    if (value is String) {
      final String normalized = value.trim().toLowerCase();

      if (normalized == 'true' || normalized == '1') {
        return true;
      }

      if (normalized == 'false' || normalized == '0') {
        return false;
      }
    }

    return fallback;
  }

  static DateTime? _dateTimeValue(dynamic value) {
    if (value == null) {
      return null;
    }

    if (value is Timestamp) {
      return value.toDate();
    }

    if (value is DateTime) {
      return value;
    }

    if (value is String) {
      return DateTime.tryParse(value.trim());
    }

    try {
      final dynamic result = value.toDate();
      return result is DateTime ? result : null;
    } catch (_) {
      return null;
    }
  }

  static List<String> _stringListValue(dynamic value) {
    if (value is Iterable) {
      return value
          .map((dynamic item) => item.toString().trim())
          .where((String item) => item.isNotEmpty)
          .toList();
    }

    if (value is String && value.trim().isNotEmpty) {
      return value
          .split(',')
          .map((String item) => item.trim())
          .where((String item) => item.isNotEmpty)
          .toList();
    }

    return <String>[];
  }

  static String _extractEnglishName(String value) {
    final int openingBracket = value.lastIndexOf('(');
    final int closingBracket = value.lastIndexOf(')');

    if (openingBracket > 0 &&
        closingBracket == value.length - 1 &&
        closingBracket > openingBracket) {
      return value.substring(0, openingBracket).trim();
    }

    return value.trim();
  }
}

class CartService extends ChangeNotifier {
  CartService._internal();

  static final CartService _instance = CartService._internal();

  factory CartService() {
    return _instance;
  }

  final FirebaseFirestore _db = FirebaseFirestore.instance;

  final List<CartItem> _items = <CartItem>[];

  StreamSubscription<QuerySnapshot<Map<String, dynamic>>>?
  _cartSubscription;

  bool _isCartLoaded = false;
  String? _loadedUserId;

  List<CartItem> get items {
    return List<CartItem>.unmodifiable(_items);
  }

  bool get isCartLoaded {
    return _isCartLoaded;
  }

  bool get isEmpty {
    return _items.isEmpty;
  }

  bool get isNotEmpty {
    return _items.isNotEmpty;
  }

  int get totalItemCount {
    return _items.fold<int>(
      0,
          (int total, CartItem item) {
        return total + item.quantity;
      },
    );
  }

  int get quickItemCount {
    return _items
        .where((CartItem item) => item.isQuick)
        .fold<int>(0, (int total, CartItem item) {
      return total + item.quantity;
    });
  }

  int get preOrderItemCount {
    return _items
        .where((CartItem item) => item.isPreOrder)
        .fold<int>(0, (int total, CartItem item) {
      return total + item.quantity;
    });
  }

  Map<String, List<CartItem>> get itemsGroupedByFarmer {
    final Map<String, List<CartItem>> groups =
    <String, List<CartItem>>{};

    for (final CartItem item in _items) {
      final String key = item.farmerDisplayName;
      groups.putIfAbsent(key, () => <CartItem>[]).add(item);
    }

    return groups;
  }

  int get totalAmount {
    return _items.fold<int>(
      0,
          (int total, CartItem item) {
        return total + item.itemTotal;
      },
    );
  }

  double get totalCalculatedWeightKg => _items.fold<double>(
    0,
        (double total, CartItem item) => total + item.totalWeightKg,
  );

  CartDeliveryMode get automaticDeliveryMode {
    final double weight = totalCalculatedWeightKg;
    if (weight <= 20) return CartDeliveryMode.quick;
    if (weight <= 150) return CartDeliveryMode.scheduled;
    return CartDeliveryMode.preOrder;
  }

  String get automaticDeliveryModeValue {
    switch (automaticDeliveryMode) {
      case CartDeliveryMode.quick: return 'quick';
      case CartDeliveryMode.scheduled: return 'scheduled';
      case CartDeliveryMode.preOrder: return 'pre_order';
    }
  }

  String get automaticDeliveryModeLabel {
    switch (automaticDeliveryMode) {
      case CartDeliveryMode.quick: return 'Quick Delivery';
      case CartDeliveryMode.scheduled: return 'Scheduled Delivery';
      case CartDeliveryMode.preOrder: return 'Advance Pre-Order';
    }
  }

  String get automaticDeliveryReason {
    final double weight = totalCalculatedWeightKg;
    if (weight <= 20) return 'Cart weight is within the 20 kg Quick Delivery limit.';
    if (weight <= 150) return 'Cart weight exceeded 20 kg, so Scheduled Delivery is selected.';
    return 'Cart weight exceeded 150 kg, so Advance Pre-Order is selected.';
  }

  Future<void> loadCart() async {
    final User? user = FirebaseAuth.instance.currentUser;

    await _cartSubscription?.cancel();
    _cartSubscription = null;

    // Never show another session/user's old in-memory cart.
    _items.clear();
    _isCartLoaded = false;
    notifyListeners();

    if (user == null) {
      _loadedUserId = null;
      _isCartLoaded = true;
      notifyListeners();
      return;
    }

    _loadedUserId = user.uid;

    final CollectionReference<Map<String, dynamic>> cartReference =
    _db
        .collection('users')
        .doc(user.uid)
        .collection('cart');

    _cartSubscription = cartReference.snapshots().listen(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        // Ignore a late snapshot from a previous authenticated user.
        if (FirebaseAuth.instance.currentUser?.uid !=
            _loadedUserId) {
          return;
        }

        _items
          ..clear()
          ..addAll(
            snapshot.docs.map<CartItem>(
                  (
                  QueryDocumentSnapshot<Map<String, dynamic>>
                  document,
                  ) {
                return CartItem.fromMap(document.data());
              },
            ),
          );

        _isCartLoaded = true;
        notifyListeners();
      },
      onError: (Object error) {
        debugPrint('Cart load failed: $error');
        _isCartLoaded = true;
        notifyListeners();
      },
    );
  }

  /// Call immediately after a successful login when every login
  /// must begin with an empty cart.
  Future<void> resetCartForNewLogin() async {
    final User? user = FirebaseAuth.instance.currentUser;

    await _cartSubscription?.cancel();
    _cartSubscription = null;

    _items.clear();
    _loadedUserId = user?.uid;
    _isCartLoaded = true;
    notifyListeners();

    if (user == null) {
      return;
    }

    await _deleteRemoteCart(user.uid);
    await loadCart();
  }

  /// Clears only local session data during logout.
  /// The next login flow can call resetCartForNewLogin().
  Future<void> clearLocalCartOnLogout() async {
    await _cartSubscription?.cancel();
    _cartSubscription = null;

    _items.clear();
    _loadedUserId = null;
    _isCartLoaded = true;
    notifyListeners();
  }

  void addProduct(ProductModel product) {
    final int productPrice = product.discountedPrice.round();

    final int existingIndex = _findProductIndex(
      productId: product.id,
      name: product.name,
      teluguName: product.teluguName,
      weight: product.safeDefaultUnit,
    );

    if (existingIndex >= 0) {
      _items[existingIndex].quantity++;
    } else {
      _items.add(
        CartItem(
          productId: product.id,
          name: product.name,
          teluguName: product.teluguName,
          image: product.image,
          price: productPrice,
          weight: product.safeDefaultUnit,
          category: product.category,
          categoryTelugu: product.categoryTelugu,
          farmerId: product.farmerId,
          farmerName: product.farmer.name,
          farmName: product.farmer.farmName,
          organic: product.organic,
          rating: product.rating,
          isQuick: product.isQuickAvailable,
          quickDeliveryMinutes: product.quickDeliveryMinutes,
          minimumQuickQuantity:
          product.safeMinimumQuickQuantity.ceil(),
          quickAvailableStock: product.quickAvailableStock,
          availableUnits: product.safeAvailableUnits,
          availableDeliveryDays:
          product.availableDeliveryDays,
          normalDeliveryNote:
          product.normalDeliveryNote,
          isPreOrder: product.canPreOrder,
          harvestDate: product.activeHarvestDate,
          expectedDeliveryDate: product.expectedDeliveryDate,
          deliverySlot: product.availableDeliverySlots.isNotEmpty
              ? product.availableDeliverySlots.first
              : '',
          quantityType: product.quantityType,
          isCustomQuantity: false,
          selectedQuantityValue: 0,
          selectedQuantityUnit: '',
          approximateWeightPerUnitKg: product.safeApproximateWeightPerUnitKg,
          quantity: 1,
        ),
      );
    }

    notifyListeners();
    unawaited(_updateFirestore());
  }

  void addItem(
      String name,
      String image,
      int price, {
        String productId = '',
        String teluguName = '',
        String weight = '',
        String category = '',
        String categoryTelugu = '',
        String farmerId = '',
        String farmerName = '',
        String farmName = '',
        bool organic = true,
        double rating = 0,
        bool isQuick = false,
        int quickDeliveryMinutes = 0,
        int minimumQuickQuantity = 1,
        double quickAvailableStock = 0,
        List<String> availableUnits = const <String>[],
        List<String> availableDeliveryDays = const <String>[],
        String normalDeliveryNote = '',
        bool isPreOrder = false,
        DateTime? harvestDate,
        DateTime? expectedDeliveryDate,
        String deliverySlot = '',
        String quantityType = 'weight',
        bool isCustomQuantity = false,
        double selectedQuantityValue = 0,
        String selectedQuantityUnit = '',
        double approximateWeightPerUnitKg = 1,
      }) {
    final int existingIndex = _findProductIndex(
      productId: productId,
      name: name,
      teluguName: teluguName,
      weight: weight,
    );

    if (existingIndex >= 0) {
      _items[existingIndex].quantity++;
    } else {
      _items.add(
        CartItem(
          productId: productId,
          name: name,
          teluguName: teluguName,
          image: image,
          price: price,
          weight: weight,
          category: category,
          categoryTelugu: categoryTelugu,
          farmerId: farmerId,
          farmerName: farmerName,
          farmName: farmName,
          organic: organic,
          rating: rating,
          isQuick: isQuick,
          quickDeliveryMinutes: quickDeliveryMinutes,
          minimumQuickQuantity:
          minimumQuickQuantity < 1 ? 1 : minimumQuickQuantity,
          quickAvailableStock: quickAvailableStock,
          availableUnits: availableUnits,
          availableDeliveryDays: availableDeliveryDays,
          normalDeliveryNote: normalDeliveryNote,
          isPreOrder: isPreOrder,
          harvestDate: harvestDate,
          expectedDeliveryDate: expectedDeliveryDate,
          deliverySlot: deliverySlot,
          quantityType: quantityType,
          isCustomQuantity: isCustomQuantity,
          selectedQuantityValue: selectedQuantityValue,
          selectedQuantityUnit: selectedQuantityUnit,
          approximateWeightPerUnitKg:
          approximateWeightPerUnitKg,
          quantity: 1,
        ),
      );
    }

    notifyListeners();
    unawaited(_updateFirestore());
  }

  void updateCustomQuantity({
    required String name,
    String productId = '',
    String teluguName = '',
    String previousWeight = '',
    required double value,
    required String unit,
    required int calculatedPrice,
    required String displayWeight,
    String quantityType = 'weight',
    double approximateWeightPerUnitKg = 1,
  }) {
    final int existingIndex = _findProductIndex(
      productId: productId,
      name: name,
      teluguName: teluguName,
      weight: previousWeight,
    );
    if (existingIndex < 0) return;
    final CartItem current = _items[existingIndex];
    _items[existingIndex] = current.copyWith(
      price: calculatedPrice,
      weight: displayWeight,
      quantityType: quantityType,
      isCustomQuantity: true,
      selectedQuantityValue: value,
      selectedQuantityUnit: unit,
      approximateWeightPerUnitKg: approximateWeightPerUnitKg,
    );
    notifyListeners();
    unawaited(_updateFirestore());
  }

  void removeProduct(ProductModel product) {
    removeOne(
      product.name,
      productId: product.id,
      teluguName: product.teluguName,
      weight: product.safeDefaultUnit,
    );
  }

  void removeOne(
      String name, {
        String productId = '',
        String teluguName = '',
        String weight = '',
      }) {
    final int existingIndex = _findProductIndex(
      productId: productId,
      name: name,
      teluguName: teluguName,
      weight: weight,
    );

    if (existingIndex < 0) {
      return;
    }

    final CartItem item = _items[existingIndex];

    if (item.quantity <= 1) {
      _items.removeAt(existingIndex);
    } else {
      item.quantity -= 1;
    }

    notifyListeners();
    unawaited(_updateFirestore());
  }

  void removeItemCompletely({
    required String name,
    String productId = '',
    String teluguName = '',
    String weight = '',
  }) {
    final int existingIndex = _findProductIndex(
      productId: productId,
      name: name,
      teluguName: teluguName,
      weight: weight,
    );

    if (existingIndex < 0) {
      return;
    }

    _items.removeAt(existingIndex);

    notifyListeners();
    unawaited(_updateFirestore());
  }

  int getProductQuantity(ProductModel product) {
    return getQuantity(
      product.name,
      productId: product.id,
      teluguName: product.teluguName,
      weight: product.safeDefaultUnit,
    );
  }

  int getQuantity(
      String name, {
        String productId = '',
        String teluguName = '',
        String weight = '',
      }) {
    final int existingIndex = _findProductIndex(
      productId: productId,
      name: name,
      teluguName: teluguName,
      weight: weight,
    );

    if (existingIndex < 0) {
      return 0;
    }

    return _items[existingIndex].quantity;
  }

  bool containsProduct(ProductModel product) {
    return _findProductIndex(
      productId: product.id,
      name: product.name,
      teluguName: product.teluguName,
      weight: product.safeDefaultUnit,
    ) >=
        0;
  }

  Future<void> clearCart() async {
    final User? user = FirebaseAuth.instance.currentUser;

    _items.clear();
    notifyListeners();

    if (user == null) {
      return;
    }

    await _deleteRemoteCart(user.uid);
  }

  /// Call only after the order has been saved successfully.
  /// This clears Home, Product Details and Cart quantities together
  /// because all screens listen to this same CartService singleton.
  Future<void> clearCartAfterSuccessfulOrder() async {
    await clearCart();
  }

  Future<void> _deleteRemoteCart(String userId) async {
    final CollectionReference<Map<String, dynamic>> cartReference =
    _db
        .collection('users')
        .doc(userId)
        .collection('cart');

    try {
      final QuerySnapshot<Map<String, dynamic>> snapshot =
      await cartReference.get();

      if (snapshot.docs.isEmpty) {
        return;
      }

      final WriteBatch batch = _db.batch();

      for (final QueryDocumentSnapshot<Map<String, dynamic>>
      document in snapshot.docs) {
        batch.delete(document.reference);
      }

      await batch.commit();
    } catch (error) {
      debugPrint('Cart clear failed: $error');
      rethrow;
    }
  }

  int _findProductIndex({
    required String productId,
    required String name,
    required String teluguName,
    String weight = '',
  }) {
    final String normalizedId = productId.trim();
    final String normalizedName =
    name.trim().toLowerCase();
    final String normalizedTeluguName =
    teluguName.trim();
    final String normalizedWeight =
    weight.trim().toLowerCase();

    bool matchesWeight(CartItem item) {
      if (normalizedWeight.isEmpty) {
        return true;
      }

      return item.weight
          .trim()
          .toLowerCase() ==
          normalizedWeight;
    }

    if (normalizedId.isNotEmpty) {
      final int idIndex =
      _items.indexWhere(
            (CartItem item) {
          return item.productId.trim() ==
              normalizedId &&
              matchesWeight(item);
        },
      );

      if (idIndex >= 0) {
        return idIndex;
      }
    }

    return _items.indexWhere(
          (CartItem item) {
        final bool sameEnglishName =
            item.name
                .trim()
                .toLowerCase() ==
                normalizedName;

        final bool sameTeluguName =
            normalizedTeluguName.isNotEmpty &&
                item.teluguName.trim() ==
                    normalizedTeluguName;

        return (sameEnglishName ||
            sameTeluguName) &&
            matchesWeight(item);
      },
    );
  }

  Future<void> _updateFirestore() async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      return;
    }

    if (_loadedUserId != null &&
        _loadedUserId != user.uid) {
      return;
    }

    _loadedUserId = user.uid;

    final CollectionReference<Map<String, dynamic>> cartReference =
    _db
        .collection('users')
        .doc(user.uid)
        .collection('cart');

    try {
      final QuerySnapshot<Map<String, dynamic>> oldCartSnapshot =
      await cartReference.get();

      final WriteBatch batch = _db.batch();

      for (final QueryDocumentSnapshot<Map<String, dynamic>> document
      in oldCartSnapshot.docs) {
        batch.delete(document.reference);
      }

      for (int index = 0; index < _items.length; index++) {
        final CartItem item = _items[index];

        final String documentId =
        item.productId.trim().isNotEmpty
            ? _safeDocumentId(
          '${item.productId}_${item.weight}',
        )
            : 'cart_item_$index';

        batch.set(
          cartReference.doc(documentId),
          item.toMap(),
        );
      }

      await batch.commit();
    } catch (error) {
      debugPrint('Cart Firestore update failed: $error');
    }
  }

  double parseWeightToKg({
    required double value,
    required String unit,
    double approximateWeightPerUnitKg = 1,
  }) {
    final String normalized = unit.trim().toLowerCase();
    if (normalized == 'kg') return value;
    if (normalized == 'g') return value / 1000;
    if (normalized == 'l' || normalized == 'litre' || normalized == 'liter') return value;
    if (normalized == 'ml') return value / 1000;
    final double safeApproximation = approximateWeightPerUnitKg > 0 ? approximateWeightPerUnitKg : 1;
    return value * safeApproximation;
  }

  String _safeDocumentId(String value) {
    return value
        .trim()
        .replaceAll('/', '_')
        .replaceAll('\\', '_')
        .replaceAll('#', '_')
        .replaceAll('?', '_');
  }

  @override
  void dispose() {
    _cartSubscription?.cancel();
    super.dispose();
  }
}
