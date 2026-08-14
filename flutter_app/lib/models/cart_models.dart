import 'product_models.dart';

class CartItem {
  final String id;
  final Product product;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  CartItem({
    required this.id,
    required this.product,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final unitPrice = (json['unitPrice'] as num?)?.toDouble() ?? 0.0;
    
    Product productObj;
    if (json['product'] != null && json['product'] is Map) {
      productObj = Product.fromJson(json['product']);
    } else {
      productObj = Product(
        id: json['productId']?.toString() ?? '',
        name: json['productName'] ?? '',
        description: '',
        price: unitPrice,
        discountPrice: null,
        quantity: json['quantity'] ?? 0,
        weight: 0.0,
        unit: 'PCS',
        categoryId: '',
        categoryName: '',
        organic: false,
        available: true,
      );
    }

    return CartItem(
      id: json['id']?.toString() ?? '',
      product: productObj,
      quantity: json['quantity'] ?? 0,
      unitPrice: unitPrice,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class Cart {
  final List<CartItem> items;
  final double totalAmount;

  Cart({required this.items, required this.totalAmount});

  factory Cart.fromJson(Map<String, dynamic> json) {
    var itemsList = (json['items'] as List?)
            ?.map((e) => CartItem.fromJson(e))
            .toList() ??
        [];
    return Cart(
      items: itemsList,
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
