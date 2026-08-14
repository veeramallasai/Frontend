class Category {
  final String id;
  final String name;
  final String description;
  final String? categoryImageUrl;

  Category({
    required this.id,
    required this.name,
    required this.description,
    this.categoryImageUrl,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      categoryImageUrl: json['categoryImageUrl'],
    );
  }
}

class Product {
  final String id;
  final String name;
  final String description;
  final double price;
  final double? discountPrice;
  final int quantity; // Stock quantity
  final double weight;
  final String unit;
  final String categoryId;
  final String categoryName;
  final bool organic;
  final bool available;

  Product({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    this.discountPrice,
    required this.quantity,
    required this.weight,
    required this.unit,
    required this.categoryId,
    required this.categoryName,
    required this.organic,
    required this.available,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['productName'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] as num?)?.toDouble() ?? 0.0,
      discountPrice: (json['discountPrice'] as num?)?.toDouble(),
      quantity: json['quantity'] ?? 0,
      weight: (json['weight'] as num?)?.toDouble() ?? 0.0,
      unit: json['unit'] ?? 'PCS',
      categoryId: json['category']?['id'] ?? '',
      categoryName: json['category']?['name'] ?? '',
      organic: json['organic'] ?? false,
      available: json['available'] ?? false,
    );
  }

  bool get hasDiscount => discountPrice != null && discountPrice! < price;
  double get activePrice => hasDiscount ? discountPrice! : price;
  double get savingPerUnit => hasDiscount ? (price - discountPrice!) : 0.0;
}
