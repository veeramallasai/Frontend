class DeliverySlot {
  final String id;
  final String slotName;
  final String startTime;
  final String endTime;
  final int maxOrders;
  final int? availableOrders;
  final String status;

  DeliverySlot({
    required this.id,
    required this.slotName,
    required this.startTime,
    required this.endTime,
    required this.maxOrders,
    this.availableOrders,
    required this.status,
  });

  factory DeliverySlot.fromJson(Map<String, dynamic> json) {
    return DeliverySlot(
      id: json['id'] ?? '',
      slotName: json['slotName'] ?? '',
      startTime: json['startTime'] ?? '',
      endTime: json['endTime'] ?? '',
      maxOrders: json['maxOrders'] ?? 0,
      availableOrders: json['availableOrders'],
      status: json['status'] ?? 'ACTIVE',
    );
  }
}

class OrderDelivery {
  final String id;
  final String orderId;
  final String customerId;
  final String customerName;
  final String? shippingAddress;
  final String? deliveryPartnerId;
  final String? deliveryPartnerName;
  final String deliveryDate;
  final String deliverySlotId;
  final String deliverySlotName;
  final String? estimatedArrivalTime;
  final String deliveryStatus;
  final String? deliveredAt;

  OrderDelivery({
    required this.id,
    required this.orderId,
    required this.customerId,
    required this.customerName,
    this.shippingAddress,
    this.deliveryPartnerId,
    this.deliveryPartnerName,
    required this.deliveryDate,
    required this.deliverySlotId,
    required this.deliverySlotName,
    this.estimatedArrivalTime,
    required this.deliveryStatus,
    this.deliveredAt,
  });

  factory OrderDelivery.fromJson(Map<String, dynamic> json) {
    return OrderDelivery(
      id: json['id'] ?? '',
      orderId: json['orderId'] ?? '',
      customerId: json['customerId'] ?? '',
      customerName: json['customerName'] ?? '',
      shippingAddress: json['shippingAddress'],
      deliveryPartnerId: json['deliveryPartnerId'],
      deliveryPartnerName: json['deliveryPartnerName'],
      deliveryDate: json['deliveryDate'] ?? '',
      deliverySlotId: json['deliverySlotId'] ?? '',
      deliverySlotName: json['deliverySlotName'] ?? '',
      estimatedArrivalTime: json['estimatedArrivalTime'],
      deliveryStatus: json['deliveryStatus'] ?? 'PLACED',
      deliveredAt: json['deliveredAt'],
    );
  }
}
