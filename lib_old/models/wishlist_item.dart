import 'package:cloud_firestore/cloud_firestore.dart';

class WishlistItem {
  final String? id;
  final String userId;

  // Product identity
  final String productId;
  final String name;
  final String teluguName;
  final String image;
  final String category;
  final String categoryTelugu;
  final String weight;

  // Pricing
  final int price;
  final int mrp;
  final double discount;

  // Farmer metadata
  final String farmerId;
  final String farmerName;
  final String farmName;

  // Product flags
  final bool organic;
  final double rating;
  final bool isQuick;
  final int quickDeliveryMinutes;
  final bool isPreOrder;
  final bool isAvailable;

  // Delivery metadata
  final DateTime? harvestDate;
  final DateTime? expectedDeliveryDate;
  final String deliverySlot;

  // Wishlist metadata
  final DateTime createdAt;
  final DateTime updatedAt;

  WishlistItem({
    this.id,
    required this.userId,
    required this.name,
    required this.image,
    required this.price,
    this.productId = '',
    this.teluguName = '',
    this.category = '',
    this.categoryTelugu = '',
    this.weight = '',
    this.mrp = 0,
    this.discount = 0,
    this.farmerId = '',
    this.farmerName = '',
    this.farmName = '',
    this.organic = true,
    this.rating = 0,
    this.isQuick = false,
    this.quickDeliveryMinutes = 0,
    this.isPreOrder = false,
    this.isAvailable = true,
    this.harvestDate,
    this.expectedDeliveryDate,
    this.deliverySlot = '',
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt =
      createdAt ?? DateTime.fromMillisecondsSinceEpoch(0),
        updatedAt =
            updatedAt ?? DateTime.fromMillisecondsSinceEpoch(0);

  String get displayName {
    if (teluguName.trim().isEmpty) {
      return name;
    }

    return '$name • $teluguName';
  }

  String get farmerDisplayName {
    if (farmName.trim().isNotEmpty) {
      return farmName.trim();
    }

    if (farmerName.trim().isNotEmpty) {
      return farmerName.trim();
    }

    return 'Farm To Home Growers';
  }

  int get effectiveMrp {
    if (mrp > 0) {
      return mrp;
    }

    if (discount > 0 && discount < 100) {
      return (price / (1 - (discount / 100))).round();
    }

    return price;
  }

  int get savings {
    final int value = effectiveMrp - price;
    return value < 0 ? 0 : value;
  }

  bool get hasDiscount {
    return effectiveMrp > price || discount > 0;
  }

  String get quickDeliveryText {
    if (!isQuick) {
      return '';
    }

    if (quickDeliveryMinutes > 0) {
      return '$quickDeliveryMinutes min';
    }

    return 'Quick';
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id ?? '',
      'userId': userId,
      'productId': productId,
      'name': name,
      'teluguName': teluguName,
      'displayName': displayName,
      'image': image,
      'category': category,
      'categoryTelugu': categoryTelugu,
      'weight': weight,
      'price': price,
      'mrp': effectiveMrp,
      'discount': discount,
      'farmerId': farmerId,
      'farmerName': farmerName,
      'farmName': farmName,
      'organic': organic,
      'rating': rating,
      'isQuick': isQuick,
      'quickDeliveryMinutes': quickDeliveryMinutes,
      'isPreOrder': isPreOrder,
      'isAvailable': isAvailable,
      'harvestDate': harvestDate == null
          ? null
          : Timestamp.fromDate(harvestDate!),
      'expectedDeliveryDate': expectedDeliveryDate == null
          ? null
          : Timestamp.fromDate(expectedDeliveryDate!),
      'deliverySlot': deliverySlot,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  factory WishlistItem.fromMap(
      String id,
      Map<String, dynamic> map,
      ) {
    return WishlistItem(
      id: id,
      userId: _stringValue(map['userId']),
      productId: _stringValue(
        map['productId'] ?? map['product_id'],
      ),
      name: _stringValue(
        map['name'],
        fallback: 'Farm Product',
      ),
      teluguName: _stringValue(map['teluguName']),
      image: _stringValue(
        map['image'] ?? map['imageUrl'],
      ),
      category: _stringValue(map['category']),
      categoryTelugu: _stringValue(
        map['categoryTelugu'],
      ),
      weight: _stringValue(map['weight']),
      price: _intValue(map['price']),
      mrp: _intValue(
        map['mrp'] ?? map['originalPrice'],
      ),
      discount: _doubleValue(
        map['discount'] ?? map['discountPercentage'],
      ),
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
      isPreOrder: _boolValue(
        map['isPreOrder'] ?? map['preOrder'],
      ),
      isAvailable: _boolValue(
        map['isAvailable'] ?? map['inStock'],
        fallback: true,
      ),
      harvestDate: _dateTimeValue(map['harvestDate']),
      expectedDeliveryDate: _dateTimeValue(
        map['expectedDeliveryDate'] ?? map['deliveryDate'],
      ),
      deliverySlot: _stringValue(
        map['deliverySlot'] ?? map['timeSlot'],
      ),
      createdAt: _dateTimeValue(map['createdAt']) ??
          DateTime.now(),
      updatedAt: _dateTimeValue(map['updatedAt']) ??
          DateTime.now(),
    );
  }

  WishlistItem copyWith({
    String? id,
    String? userId,
    String? productId,
    String? name,
    String? teluguName,
    String? image,
    String? category,
    String? categoryTelugu,
    String? weight,
    int? price,
    int? mrp,
    double? discount,
    String? farmerId,
    String? farmerName,
    String? farmName,
    bool? organic,
    double? rating,
    bool? isQuick,
    int? quickDeliveryMinutes,
    bool? isPreOrder,
    bool? isAvailable,
    DateTime? harvestDate,
    DateTime? expectedDeliveryDate,
    String? deliverySlot,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return WishlistItem(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      productId: productId ?? this.productId,
      name: name ?? this.name,
      teluguName: teluguName ?? this.teluguName,
      image: image ?? this.image,
      category: category ?? this.category,
      categoryTelugu:
      categoryTelugu ?? this.categoryTelugu,
      weight: weight ?? this.weight,
      price: price ?? this.price,
      mrp: mrp ?? this.mrp,
      discount: discount ?? this.discount,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      farmName: farmName ?? this.farmName,
      organic: organic ?? this.organic,
      rating: rating ?? this.rating,
      isQuick: isQuick ?? this.isQuick,
      quickDeliveryMinutes:
      quickDeliveryMinutes ?? this.quickDeliveryMinutes,
      isPreOrder: isPreOrder ?? this.isPreOrder,
      isAvailable: isAvailable ?? this.isAvailable,
      harvestDate: harvestDate ?? this.harvestDate,
      expectedDeliveryDate:
      expectedDeliveryDate ??
          this.expectedDeliveryDate,
      deliverySlot: deliverySlot ?? this.deliverySlot,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
    );
  }

  static String _stringValue(
      dynamic value, {
        String fallback = '',
      }) {
    if (value == null) {
      return fallback;
    }

    final String result = value.toString().trim();
    return result.isEmpty ? fallback : result;
  }

  static int _intValue(
      dynamic value, {
        int fallback = 0,
      }) {
    if (value is num) {
      return value.toInt();
    }

    if (value is String) {
      return int.tryParse(value.trim()) ?? fallback;
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
      final String normalized =
      value.trim().toLowerCase();

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

    if (value is num) {
      return DateTime.fromMillisecondsSinceEpoch(
        value.toInt(),
      );
    }

    try {
      final dynamic result = value.toDate();
      return result is DateTime ? result : null;
    } catch (_) {
      return null;
    }
  }
}
