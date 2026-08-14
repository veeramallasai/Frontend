class OrderItemDetails {
  final String id;
  final String productId;
  final String productName;
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  OrderItemDetails({
    required this.id,
    required this.productId,
    required this.productName,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
  });

  factory OrderItemDetails.fromJson(Map<String, dynamic> json) {
    return OrderItemDetails(
      id: json['id']?.toString() ?? '',
      productId: (json['productId'] ?? json['product']?['id'])?.toString() ?? '',
      productName: json['productName'] ?? json['product']?['productName'] ?? json['product']?['name'] ?? '',
      quantity: json['quantity'] ?? 0,
      unitPrice: (json['unitPrice'] as num?)?.toDouble() ?? 0.0,
      totalPrice: (json['totalPrice'] as num?)?.toDouble() ?? 0.0,
    );
  }
}

class AddressDetails {
  final String id;
  final String street;
  final String city;
  final String state;
  final String pincode;

  AddressDetails({
    required this.id,
    required this.street,
    required this.city,
    required this.state,
    required this.pincode,
  });

  factory AddressDetails.fromJson(Map<String, dynamic> json) {
    return AddressDetails(
      id: json['id'] ?? '',
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
    );
  }
}

class OrderDetails {
  final String id;
  final String customerId;
  final double totalAmount;
  final double discountAmount;
  final String? couponCode;
  final String status;
  final String createdAt;
  final AddressDetails? shippingAddress;
  final List<OrderItemDetails> items;

  OrderDetails({
    required this.id,
    required this.customerId,
    required this.totalAmount,
    required this.discountAmount,
    this.couponCode,
    required this.status,
    required this.createdAt,
    this.shippingAddress,
    required this.items,
  });

  factory OrderDetails.fromJson(Map<String, dynamic> json) {
    var itemsList = (json['items'] as List?)
            ?.map((e) => OrderItemDetails.fromJson(e))
            .toList() ??
        [];

    AddressDetails? shippingAddr;
    if (json['shippingAddress'] != null) {
      shippingAddr = AddressDetails.fromJson(json['shippingAddress']);
    } else if (json['shippingAddressSummary'] != null) {
      shippingAddr = AddressDetails(
        id: json['shippingAddressId']?.toString() ?? '',
        street: json['shippingAddressSummary'] ?? '',
        city: '',
        state: '',
        pincode: '',
      );
    }

    return OrderDetails(
      id: json['id']?.toString() ?? '',
      customerId: (json['customerId'] ?? json['customer']?['id'])?.toString() ?? '',
      totalAmount: (json['totalAmount'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      couponCode: json['couponCode'],
      status: json['status']?.toString() ?? 'PLACED',
      createdAt: json['createdAt'] ?? '',
      shippingAddress: shippingAddr,
      items: itemsList,
    );
  }
}
