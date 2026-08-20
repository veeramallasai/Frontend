import '../../core/utils/product_utils.dart';

class OrderItemModel {
  const OrderItemModel({
    this.cartItemId = '',
    required this.productId,
    String? name,
    String? productName,
    this.category = '',
    this.imageUrl = '',
    this.shoppingMode = 'home',
    this.unit = '1 unit',
    required this.unitPrice,
    this.mrp = 0,
    required this.quantity,
    this.inStock = true,
  }) : name = name ?? productName ?? 'Fresh Product';

  final String cartItemId;
  final String productId;
  final String name;
  final String category;
  final String imageUrl;
  final String shoppingMode;
  final String unit;
  final double unitPrice;
  final double mrp;
  final int quantity;
  final bool inStock;

  String get productName => name;
  double get lineTotal => unitPrice * quantity;
  double get lineMrp => (mrp > 0 ? mrp : unitPrice) * quantity;
  double get savings => lineMrp > lineTotal ? lineMrp - lineTotal : 0;
  bool get isShopOrder => shoppingMode == 'shop';
  bool get isHomeOrder => !isShopOrder;

  factory OrderItemModel.fromMap(Map<String, dynamic> map) {
    final double unitPrice = _toDouble(
      map['unitPrice'] ?? map['price'],
    );
    double mrp = _toDouble(map['mrp'], fallback: unitPrice);
    if (mrp < unitPrice) mrp = unitPrice;

    return OrderItemModel(
      cartItemId: _text(map['cartItemId'] ?? map['documentId']),
      productId: _text(map['productId']),
      name: ProductUtils.localizedName(
        _text(map['name'] ?? map['productName'], fallback: 'Fresh Product'),
      ),
      category: _text(map['category']),
      imageUrl: _text(map['imageUrl'] ?? map['image']),
      shoppingMode: _normalizeShoppingMode(map['shoppingMode']),
      unit: _text(map['unit'], fallback: '1 unit'),
      unitPrice: unitPrice,
      mrp: mrp,
      quantity: _positiveInt(map['quantity'], fallback: 1),
      inStock: _toBool(map['inStock'], fallback: true),
    );
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'cartItemId': cartItemId,
      'productId': productId,
      'name': name,
      'productName': name,
      'category': category,
      'imageUrl': imageUrl,
      'shoppingMode': shoppingMode,
      'unit': unit,
      'unitPrice': unitPrice,
      'mrp': mrp,
      'quantity': quantity,
      'inStock': inStock,
      'lineTotal': lineTotal,
    };
  }
}

String _text(dynamic value, {String fallback = ''}) {
  final String text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

double _toDouble(dynamic value, {double fallback = 0}) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? fallback;
}

int _positiveInt(dynamic value, {int fallback = 1}) {
  if (value is num && value > 0) return value.toInt();
  final int? parsed = int.tryParse(value?.toString() ?? '');
  return (parsed != null && parsed > 0) ? parsed : fallback;
}

bool _toBool(dynamic value, {bool fallback = true}) {
  if (value is bool) return value;
  if (value == null) return fallback;
  return value == 1 || value.toString().toLowerCase() == 'true';
}

String _normalizeShoppingMode(dynamic value) {
  final String text = _text(value).toLowerCase();
  return text == 'shop' ? 'shop' : 'home';
}
