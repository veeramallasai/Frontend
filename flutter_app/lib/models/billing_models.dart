class BillSummary {
  final String id;
  final String orderId;
  final double subtotal;
  final double productDiscount;
  final double couponDiscount;
  final double deliveryCharge;
  final double platformFee;
  final double packagingCharge;
  final double gst;
  final double totalSavings;
  final double finalAmount;
  final String? createdAt;

  BillSummary({
    required this.id,
    required this.orderId,
    required this.subtotal,
    required this.productDiscount,
    required this.couponDiscount,
    required this.deliveryCharge,
    required this.platformFee,
    required this.packagingCharge,
    required this.gst,
    required this.totalSavings,
    required this.finalAmount,
    this.createdAt,
  });

  factory BillSummary.fromJson(Map<String, dynamic> json) {
    return BillSummary(
      id: json['id'] ?? '',
      orderId: json['orderId'] ?? '',
      subtotal: (json['subtotal'] as num?)?.toDouble() ?? 0.0,
      productDiscount: (json['productDiscount'] as num?)?.toDouble() ?? 0.0,
      couponDiscount: (json['couponDiscount'] as num?)?.toDouble() ?? 0.0,
      deliveryCharge: (json['deliveryCharge'] as num?)?.toDouble() ?? 0.0,
      platformFee: (json['platformFee'] as num?)?.toDouble() ?? 0.0,
      packagingCharge: (json['packagingCharge'] as num?)?.toDouble() ?? 0.0,
      gst: (json['gst'] as num?)?.toDouble() ?? 0.0,
      totalSavings: (json['totalSavings'] as num?)?.toDouble() ?? 0.0,
      finalAmount: (json['finalAmount'] as num?)?.toDouble() ?? 0.0,
      createdAt: json['createdAt'],
    );
  }
}

class BillingSettings {
  final String id;
  final double gstPercentage;
  final double deliveryCharge;
  final double freeDeliveryThreshold;
  final double platformFee;
  final double packagingCharge;

  BillingSettings({
    required this.id,
    required this.gstPercentage,
    required this.deliveryCharge,
    required this.freeDeliveryThreshold,
    required this.platformFee,
    required this.packagingCharge,
  });

  factory BillingSettings.fromJson(Map<String, dynamic> json) {
    return BillingSettings(
      id: json['id'] ?? '',
      gstPercentage: (json['gstPercentage'] as num?)?.toDouble() ?? 0.0,
      deliveryCharge: (json['deliveryCharge'] as num?)?.toDouble() ?? 0.0,
      freeDeliveryThreshold: (json['freeDeliveryThreshold'] as num?)?.toDouble() ?? 0.0,
      platformFee: (json['platformFee'] as num?)?.toDouble() ?? 0.0,
      packagingCharge: (json['packagingCharge'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
