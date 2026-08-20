import 'order_item_model.dart';

class OrderModel {
  OrderModel({
    required this.id,
    this.orderNumber = '',
    required this.userId,
    this.shoppingMode = 'home',
    this.status = 'placed',
    this.paymentStatus = 'pending',
    this.paymentMethod = 'cash_on_delivery',
    required List<OrderItemModel> items,
    int? itemCount,
    required this.subtotal,
    double? mrpTotal,
    double? productSavings,
    this.couponCode = '',
    double? couponDiscount,
    double? discount,
    this.deliveryFee = 0,
    double? totalAmount,
    this.addressId = '',
    Map<String, dynamic>? address,
    Map<String, dynamic>? shippingAddress,
    this.deliveryMethod = 'quick',
    this.deliveryDate,
    this.deliverySlot = 'Earliest available',
    List<OrderStatusHistoryEntry>? statusHistory,
    this.paymentId = '',
    this.transactionId = '',
    this.notes = '',
    bool? isPaid,
    this.createdAt,
    this.updatedAt,
  })  : items = List<OrderItemModel>.unmodifiable(items),
        itemCount = itemCount ?? items.fold<int>(0, (int sum, OrderItemModel i) => sum + i.quantity),
        mrpTotal = mrpTotal ?? items.fold<double>(0, (double sum, OrderItemModel i) => sum + i.lineMrp),
        productSavings = productSavings ?? items.fold<double>(0, (double sum, OrderItemModel i) => sum + i.savings),
        couponDiscount = discount ?? couponDiscount ?? 0,
        totalAmount = totalAmount ?? (subtotal - (discount ?? couponDiscount ?? 0) + deliveryFee).clamp(0, double.infinity).toDouble(),
        address = Map<String, dynamic>.unmodifiable(shippingAddress ?? address ?? <String, dynamic>{}),
        statusHistory = List<OrderStatusHistoryEntry>.unmodifiable(statusHistory ?? <OrderStatusHistoryEntry>[]);

  final String id;
  final String orderNumber;
  final String userId;
  final String shoppingMode;
  final String status;
  final String paymentStatus;
  final String paymentMethod;
  final String paymentId;
  final String transactionId;
  final String notes;

  final List<OrderItemModel> items;
  final int itemCount;

  final double subtotal;
  final double mrpTotal;
  final double productSavings;
  final String couponCode;
  final double couponDiscount;
  final double deliveryFee;
  final double totalAmount;

  final String addressId;
  final Map<String, dynamic> address;
  Map<String, dynamic> get shippingAddress => address;
  double get discount => couponDiscount;

  final String deliveryMethod;
  final String? deliveryDate;
  final String deliverySlot;

  final DateTime? createdAt;
  final DateTime? updatedAt;
  final List<OrderStatusHistoryEntry> statusHistory;

  bool get isHomeOrder => shoppingMode != 'shop';
  bool get isShopOrder => shoppingMode == 'shop';
  bool get isCashOnDelivery => paymentMethod == 'cash_on_delivery';
  bool get isPaid => paymentStatus == 'paid' || paymentStatus == 'paid_test';
  bool get isPlaced => status == 'placed';
  bool get isConfirmed => status == 'confirmed';
  bool get isProcessing => status == 'processing' || status == 'packed';
  bool get isShipped => status == 'shipped' || status == 'out_for_delivery';
  bool get isDelivered => status == 'delivered';
  bool get isCancelled => status == 'cancelled';
  bool get isFailed => status == 'failed';
  bool get canTrack => !isCancelled && !isFailed;
  bool get canCancel => status == 'placed' || status == 'confirmed';
  bool get canReorder => isDelivered || isCancelled || isFailed;

  int get calculatedItemCount => items.fold<int>(0, (int sum, OrderItemModel item) => sum + item.quantity);
  double get totalSavings => productSavings + couponDiscount;

  String get shortOrderId {
    final String ref = orderNumber.isNotEmpty ? orderNumber : id;
    if (ref.length <= 8) return ref;
    return ref.substring(ref.length - 8);
  }

  String get statusLabel {
    switch (status.toLowerCase()) {
      case 'placed': return 'Order Placed';
      case 'confirmed': return 'Confirmed';
      case 'processing': return 'Processing';
      case 'packed': return 'Packed';
      case 'shipped': return 'Shipped';
      case 'out_for_delivery': return 'Out for Delivery';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'failed': return 'Failed';
      default: return status.isEmpty ? 'Placed' : '${status[0].toUpperCase()}${status.substring(1)}';
    }
  }

  String get deliveryMethodLabel {
    switch (deliveryMethod.toLowerCase()) {
      case 'quick': return 'Quick Delivery';
      case 'scheduled': return 'Scheduled Delivery';
      case 'preorder': case 'pre_order': return 'Pre-order Delivery';
      default: return deliveryMethod.isEmpty ? 'Quick Delivery' : deliveryMethod;
    }
  }

  String get paymentMethodLabel {
    switch (paymentMethod.toLowerCase()) {
      case 'cash_on_delivery': case 'cod': return 'Cash on Delivery';
      case 'upi': return 'UPI Payment';
      case 'card': return 'Credit/Debit Card';
      case 'online': return 'Online Payment';
      case 'net_banking': return 'Net Banking';
      default: return paymentMethod.isEmpty ? 'Cash on Delivery' : paymentMethod;
    }
  }

  String get paymentStatusLabel {
    switch (paymentStatus.toLowerCase()) {
      case 'paid': case 'paid_test': return 'Paid';
      case 'pending': return isCashOnDelivery ? 'Pay on Delivery' : 'Pending';
      case 'failed': return 'Failed';
      case 'refunded': return 'Refunded';
      default: return paymentStatus.isEmpty ? 'Pending' : paymentStatus;
    }
  }

  factory OrderModel.fromMap(
      Map<String, dynamic> map, {
        String documentId = '',
      }) {
    final List<OrderItemModel> items = _mapList(map['items'])
        .map(OrderItemModel.fromMap)
        .toList(growable: false);

    final List<OrderStatusHistoryEntry> history = _mapList(map['statusHistory'])
        .map(OrderStatusHistoryEntry.fromMap)
        .toList(growable: false);

    final double subtotal = _toDouble(map['subtotal']);

    return OrderModel(
      id: _text(documentId.isNotEmpty ? documentId : map['id'] ?? map['orderId']),
      orderNumber: _text(map['orderNumber']),
      userId: _text(map['userId']),
      shoppingMode: _normalizeShoppingMode(map['shoppingMode']),
      status: _text(map['status'], fallback: 'placed').toLowerCase(),
      paymentStatus: _text(map['paymentStatus'], fallback: 'pending').toLowerCase(),
      paymentMethod: _text(map['paymentMethod'], fallback: 'cash_on_delivery').toLowerCase(),
      items: items,
      subtotal: subtotal,
      mrpTotal: _toDouble(map['mrpTotal'], fallback: subtotal),
      productSavings: _toDouble(map['productSavings']),
      couponCode: _text(map['couponCode']),
      couponDiscount: _toDouble(map['couponDiscount'] ?? map['discount']),
      deliveryFee: _toDouble(map['deliveryFee']),
      totalAmount: _toDouble(map['totalAmount']),
      addressId: _text(map['addressId']),
      address: _map(map['address'] ?? map['shippingAddress']),
      deliveryMethod: _text(map['deliveryMethod'], fallback: 'quick'),
      deliveryDate: map['deliveryDate']?.toString(),
      deliverySlot: _text(map['deliverySlot'], fallback: 'Earliest available'),
      statusHistory: history,
      paymentId: _text(map['paymentId']),
      transactionId: _text(map['transactionId']),
      notes: _text(map['notes']),
      createdAt: _toDateTime(map['createdAt']),
      updatedAt: _toDateTime(map['updatedAt']),
    );
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id,
      'orderId': id,
      'orderNumber': orderNumber,
      'userId': userId,
      'shoppingMode': shoppingMode,
      'status': status,
      'paymentStatus': paymentStatus,
      'paymentMethod': paymentMethod,
      'paymentId': paymentId,
      'transactionId': transactionId,
      'items': items.map((OrderItemModel item) => item.toMap()).toList(),
      'itemCount': itemCount,
      'subtotal': subtotal,
      'mrpTotal': mrpTotal,
      'productSavings': productSavings,
      'couponCode': couponCode,
      'couponDiscount': couponDiscount,
      'deliveryFee': deliveryFee,
      'totalAmount': totalAmount,
      'addressId': addressId,
      'address': address,
      'shippingAddress': address,
      'deliveryMethod': deliveryMethod,
      'deliveryDate': deliveryDate,
      'deliverySlot': deliverySlot,
      'notes': notes,
      'statusHistory': statusHistory.map((OrderStatusHistoryEntry e) => e.toMap()).toList(),
      if (createdAt != null) 'createdAt': createdAt!.toIso8601String(),
      if (updatedAt != null) 'updatedAt': updatedAt!.toIso8601String(),
    };
  }

  OrderModel copyWith({
    String? id,
    String? orderNumber,
    String? userId,
    String? shoppingMode,
    String? status,
    String? paymentStatus,
    String? paymentMethod,
    String? paymentId,
    String? transactionId,
    List<OrderItemModel>? items,
    int? itemCount,
    double? subtotal,
    double? mrpTotal,
    double? productSavings,
    String? couponCode,
    double? couponDiscount,
    double? discount,
    double? deliveryFee,
    double? totalAmount,
    String? addressId,
    Map<String, dynamic>? address,
    String? deliveryMethod,
    String? deliveryDate,
    String? deliverySlot,
    List<OrderStatusHistoryEntry>? statusHistory,
    String? notes,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return OrderModel(
      id: id ?? this.id,
      orderNumber: orderNumber ?? this.orderNumber,
      userId: userId ?? this.userId,
      shoppingMode: shoppingMode ?? this.shoppingMode,
      status: status ?? this.status,
      paymentStatus: paymentStatus ?? this.paymentStatus,
      paymentMethod: paymentMethod ?? this.paymentMethod,
      paymentId: paymentId ?? this.paymentId,
      transactionId: transactionId ?? this.transactionId,
      items: items ?? this.items,
      itemCount: itemCount ?? this.itemCount,
      subtotal: subtotal ?? this.subtotal,
      mrpTotal: mrpTotal ?? this.mrpTotal,
      productSavings: productSavings ?? this.productSavings,
      couponCode: couponCode ?? this.couponCode,
      couponDiscount: discount ?? couponDiscount ?? this.couponDiscount,
      deliveryFee: deliveryFee ?? this.deliveryFee,
      totalAmount: totalAmount ?? this.totalAmount,
      addressId: addressId ?? this.addressId,
      address: address ?? this.address,
      deliveryMethod: deliveryMethod ?? this.deliveryMethod,
      deliveryDate: deliveryDate ?? this.deliveryDate,
      deliverySlot: deliverySlot ?? this.deliverySlot,
      statusHistory: statusHistory ?? this.statusHistory,
      notes: notes ?? this.notes,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

class OrderStatusHistoryEntry {
  const OrderStatusHistoryEntry({
    required this.status,
    this.time,
    this.note = '',
  });

  final String status;
  final DateTime? time;
  final String note;

  factory OrderStatusHistoryEntry.fromMap(Map<String, dynamic> map) {
    return OrderStatusHistoryEntry(
      status: _text(map['status']),
      time: _toDateTime(map['time'] ?? map['createdAt']),
      note: _text(map['note']),
    );
  }

  Map<String, dynamic> toMap() => <String, dynamic>{
    'status': status,
    if (time != null) 'time': time!.toIso8601String(),
    'note': note,
  };
}

String _text(dynamic value, {String fallback = ''}) {
  final String text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

double _toDouble(dynamic value, {double fallback = 0}) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? fallback;
}


List<Map<String, dynamic>> _mapList(dynamic value) {
  if (value is! Iterable) return <Map<String, dynamic>>[];
  return value
      .whereType<Map>()
      .map((Map item) => _map(item))
      .toList(growable: false);
}

Map<String, dynamic> _map(dynamic value) {
  if (value is! Map) return <String, dynamic>{};
  return value.map(
        (dynamic key, dynamic item) => MapEntry<String, dynamic>(key.toString(), item),
  );
}

DateTime? _toDateTime(dynamic value) {
  if (value is DateTime) return value;
  return DateTime.tryParse(value?.toString() ?? '');
}

String _normalizeShoppingMode(dynamic value) {
  final String text = _text(value).toLowerCase();
  return text == 'shop' ? 'shop' : 'home';
}
