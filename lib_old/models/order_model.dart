import 'package:cloud_firestore/cloud_firestore.dart';

class OrderModel {
  final String? id;
  final String userId;
  final List<Map<String, dynamic>> items;

  // Amounts
  final double subtotal;
  final double deliveryCharge;
  final double handlingFee;
  final double platformFee;
  final double discountAmount;
  final double totalAmount;
  final String? promoCode;

  // Delivery
  final String address;
  final String paymentMethod;
  final String paymentStatus;
  final String? timeSlot;
  final String deliveryInstruction;
  final bool ecoFriendlyPacking;
  final String customerNote;

  // Order status
  final String status;
  final String cancellationReason;
  final String refundStatus;
  final String refundReference;

  // Delivery partner
  final String deliveryPartnerId;
  final String deliveryPartnerName;
  final String deliveryPartnerPhone;
  final String deliveryVehicleNumber;

  // Timeline
  final DateTime timestamp;
  final DateTime? confirmedAt;
  final DateTime? packedAt;
  final DateTime? shippedAt;
  final DateTime? outForDeliveryAt;
  final DateTime? deliveredAt;
  final DateTime? cancelledAt;
  final DateTime? expectedDeliveryDate;

  const OrderModel({
    this.id,
    required this.userId,
    required this.items,
    this.subtotal = 0,
    this.deliveryCharge = 0,
    this.handlingFee = 0,
    this.platformFee = 0,
    this.discountAmount = 0,
    required this.totalAmount,
    this.promoCode,
    required this.address,
    required this.paymentMethod,
    this.paymentStatus = 'pending',
    this.timeSlot,
    this.deliveryInstruction = '',
    this.ecoFriendlyPacking = true,
    this.customerNote = '',
    required this.timestamp,
    this.status = 'placed',
    this.cancellationReason = '',
    this.refundStatus = '',
    this.refundReference = '',
    this.deliveryPartnerId = '',
    this.deliveryPartnerName = '',
    this.deliveryPartnerPhone = '',
    this.deliveryVehicleNumber = '',
    this.confirmedAt,
    this.packedAt,
    this.shippedAt,
    this.outForDeliveryAt,
    this.deliveredAt,
    this.cancelledAt,
    this.expectedDeliveryDate,
  });

  String get normalizedStatus {
    return status.trim().toLowerCase().replaceAll(' ', '_');
  }

  String get normalizedPaymentStatus {
    return paymentStatus.trim().toLowerCase().replaceAll(' ', '_');
  }

  bool get isPlaced => normalizedStatus == 'placed';

  bool get isConfirmed => normalizedStatus == 'confirmed';

  bool get isPacked => normalizedStatus == 'packed';

  bool get isShipped => normalizedStatus == 'shipped';

  bool get isOutForDelivery {
    return normalizedStatus == 'out_for_delivery' ||
        normalizedStatus == 'on_the_way';
  }

  bool get isDelivered => normalizedStatus == 'delivered';

  bool get isCancelled => normalizedStatus == 'cancelled';

  bool get isActive => !isDelivered && !isCancelled;

  bool get isPaid => normalizedPaymentStatus == 'paid';

  bool get isPaymentPending => normalizedPaymentStatus == 'pending';

  bool get hasQuickItems {
    return items.any(
          (Map<String, dynamic> item) => _boolValue(item['isQuick']),
    );
  }

  bool get hasPreOrderItems {
    return items.any(
          (Map<String, dynamic> item) => _boolValue(item['isPreOrder']),
    );
  }

  int get totalItemCount {
    return items.fold<int>(
      0,
          (int total, Map<String, dynamic> item) {
        return total + _intValue(item['quantity'], fallback: 1);
      },
    );
  }

  int get quickItemCount {
    return items.fold<int>(
      0,
          (int total, Map<String, dynamic> item) {
        if (!_boolValue(item['isQuick'])) {
          return total;
        }

        return total + _intValue(item['quantity'], fallback: 1);
      },
    );
  }

  int get preOrderItemCount {
    return items.fold<int>(
      0,
          (int total, Map<String, dynamic> item) {
        if (!_boolValue(item['isPreOrder'])) {
          return total;
        }

        return total + _intValue(item['quantity'], fallback: 1);
      },
    );
  }

  Map<String, List<Map<String, dynamic>>> get itemsGroupedByFarmer {
    final Map<String, List<Map<String, dynamic>>> groups =
    <String, List<Map<String, dynamic>>>{};

    for (final Map<String, dynamic> item in items) {
      final String farmName = _stringValue(
        item['farmName'] ?? item['seller'],
        fallback: 'Farm To Home Growers',
      );

      groups
          .putIfAbsent(
        farmName,
            () => <Map<String, dynamic>>[],
      )
          .add(item);
    }

    return groups;
  }

  String get statusLabel {
    switch (normalizedStatus) {
      case 'placed':
        return 'Order Placed';
      case 'confirmed':
        return 'Confirmed';
      case 'packed':
        return 'Packed';
      case 'shipped':
        return 'Shipped';
      case 'out_for_delivery':
      case 'on_the_way':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.trim().isEmpty ? 'Order Placed' : status;
    }
  }

  String get paymentStatusLabel {
    switch (normalizedPaymentStatus) {
      case 'paid':
        return 'Paid';
      case 'failed':
        return 'Payment Failed';
      case 'refunded':
        return 'Refunded';
      case 'pending':
      default:
        return 'Payment Pending';
    }
  }

  bool get canCancel {
    return isPlaced || isConfirmed;
  }

  bool get canTrack {
    return isConfirmed ||
        isPacked ||
        isShipped ||
        isOutForDelivery;
  }

  DateTime? get latestStatusTime {
    if (isCancelled) return cancelledAt ?? timestamp;
    if (isDelivered) return deliveredAt ?? timestamp;
    if (isOutForDelivery) return outForDeliveryAt ?? timestamp;
    if (isShipped) return shippedAt ?? timestamp;
    if (isPacked) return packedAt ?? timestamp;
    if (isConfirmed) return confirmedAt ?? timestamp;
    return timestamp;
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id ?? '',
      'userId': userId,
      'items': items,
      'subtotal': subtotal,
      'deliveryCharge': deliveryCharge,
      'handlingFee': handlingFee,
      'platformFee': platformFee,
      'discountAmount': discountAmount,
      'totalAmount': totalAmount,
      'promoCode': promoCode ?? '',
      'address': address,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'timeSlot': timeSlot ?? '',
      'deliveryInstruction': deliveryInstruction,
      'ecoFriendlyPacking': ecoFriendlyPacking,
      'customerNote': customerNote,
      'status': status,
      'cancellationReason': cancellationReason,
      'refundStatus': refundStatus,
      'refundReference': refundReference,
      'deliveryPartnerId': deliveryPartnerId,
      'deliveryPartnerName': deliveryPartnerName,
      'deliveryPartnerPhone': deliveryPartnerPhone,
      'deliveryVehicleNumber': deliveryVehicleNumber,
      'timestamp': Timestamp.fromDate(timestamp),
      'confirmedAt':
      confirmedAt == null ? null : Timestamp.fromDate(confirmedAt!),
      'packedAt':
      packedAt == null ? null : Timestamp.fromDate(packedAt!),
      'shippedAt':
      shippedAt == null ? null : Timestamp.fromDate(shippedAt!),
      'outForDeliveryAt': outForDeliveryAt == null
          ? null
          : Timestamp.fromDate(outForDeliveryAt!),
      'deliveredAt':
      deliveredAt == null ? null : Timestamp.fromDate(deliveredAt!),
      'cancelledAt':
      cancelledAt == null ? null : Timestamp.fromDate(cancelledAt!),
      'expectedDeliveryDate': expectedDeliveryDate == null
          ? null
          : Timestamp.fromDate(expectedDeliveryDate!),
      'totalItemCount': totalItemCount,
      'quickItemCount': quickItemCount,
      'preOrderItemCount': preOrderItemCount,
      'hasQuickItems': hasQuickItems,
      'hasPreOrderItems': hasPreOrderItems,
    };
  }

  factory OrderModel.fromMap(
      String id,
      Map<String, dynamic> map,
      ) {
    final List<Map<String, dynamic>> parsedItems =
    _mapListValue(map['items']);

    final double parsedTotal = _doubleValue(
      map['totalAmount'] ?? map['total'],
    );

    return OrderModel(
      id: id,
      userId: _stringValue(map['userId']),
      items: parsedItems,
      subtotal: _doubleValue(
        map['subtotal'],
        fallback: _calculateItemsSubtotal(parsedItems),
      ),
      deliveryCharge: _doubleValue(
        map['deliveryCharge'] ?? map['deliveryFee'],
      ),
      handlingFee: _doubleValue(map['handlingFee']),
      platformFee: _doubleValue(map['platformFee']),
      discountAmount: _doubleValue(
        map['discountAmount'] ?? map['couponDiscount'],
      ),
      totalAmount: parsedTotal,
      promoCode: _nullableStringValue(map['promoCode']),
      address: _stringValue(map['address']),
      paymentMethod: _stringValue(
        map['paymentMethod'],
        fallback: 'Cash on Delivery',
      ),
      paymentStatus: _stringValue(
        map['paymentStatus'],
        fallback: 'pending',
      ),
      timeSlot: _nullableStringValue(
        map['timeSlot'] ?? map['deliverySlot'],
      ),
      deliveryInstruction: _stringValue(
        map['deliveryInstruction'],
      ),
      ecoFriendlyPacking: _boolValue(
        map['ecoFriendlyPacking'],
        fallback: true,
      ),
      customerNote: _stringValue(
        map['customerNote'] ?? map['orderNote'],
      ),
      timestamp: _dateTimeValue(
        map['timestamp'] ??
            map['createdAt'] ??
            map['orderDate'],
      ) ??
          DateTime.now(),
      status: _stringValue(
        map['status'],
        fallback: 'placed',
      ),
      cancellationReason: _stringValue(
        map['cancellationReason'],
      ),
      refundStatus: _stringValue(
        map['refundStatus'],
      ),
      refundReference: _stringValue(
        map['refundReference'],
      ),
      deliveryPartnerId: _stringValue(
        map['deliveryPartnerId'],
      ),
      deliveryPartnerName: _stringValue(
        map['deliveryPartnerName'],
      ),
      deliveryPartnerPhone: _stringValue(
        map['deliveryPartnerPhone'],
      ),
      deliveryVehicleNumber: _stringValue(
        map['deliveryVehicleNumber'],
      ),
      confirmedAt: _dateTimeValue(map['confirmedAt']),
      packedAt: _dateTimeValue(map['packedAt']),
      shippedAt: _dateTimeValue(map['shippedAt']),
      outForDeliveryAt:
      _dateTimeValue(map['outForDeliveryAt']),
      deliveredAt: _dateTimeValue(map['deliveredAt']),
      cancelledAt: _dateTimeValue(map['cancelledAt']),
      expectedDeliveryDate: _dateTimeValue(
        map['expectedDeliveryDate'],
      ),
    );
  }

  OrderModel copyWith({
    String? id,
    String? userId,
    List<Map<String, dynamic>>? items,
    double? subtotal,
    double? deliveryCharge,
    double? handlingFee,
    double? platformFee,
    double? discountAmount,
    double? totalAmount,
    String? promoCode,
    String? address,
    String? paymentMethod,
    String? paymentStatus,
    String? timeSlot,
    String? deliveryInstruction,
    bool? ecoFriendlyPacking,
    String? customerNote,
    DateTime? timestamp,
    String? status,
    String? cancellationReason,
    String? refundStatus,
    String? refundReference,
    String? deliveryPartnerId,
    String? deliveryPartnerName,
    String? deliveryPartnerPhone,
    String? deliveryVehicleNumber,
    DateTime? confirmedAt,
    DateTime? packedAt,
    DateTime? shippedAt,
    DateTime? outForDeliveryAt,
    DateTime? deliveredAt,
    DateTime? cancelledAt,
    DateTime? expectedDeliveryDate,
  }) {
    return OrderModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      items: items ?? this.items,
      subtotal: subtotal ?? this.subtotal,
      deliveryCharge:
      deliveryCharge ?? this.deliveryCharge,
      handlingFee: handlingFee ?? this.handlingFee,
      platformFee: platformFee ?? this.platformFee,
      discountAmount:
      discountAmount ?? this.discountAmount,
      totalAmount: totalAmount ?? this.totalAmount,
      promoCode: promoCode ?? this.promoCode,
      address: address ?? this.address,
      paymentMethod:
      paymentMethod ?? this.paymentMethod,
      paymentStatus:
      paymentStatus ?? this.paymentStatus,
      timeSlot: timeSlot ?? this.timeSlot,
      deliveryInstruction:
      deliveryInstruction ?? this.deliveryInstruction,
      ecoFriendlyPacking:
      ecoFriendlyPacking ?? this.ecoFriendlyPacking,
      customerNote: customerNote ?? this.customerNote,
      timestamp: timestamp ?? this.timestamp,
      status: status ?? this.status,
      cancellationReason:
      cancellationReason ?? this.cancellationReason,
      refundStatus: refundStatus ?? this.refundStatus,
      refundReference:
      refundReference ?? this.refundReference,
      deliveryPartnerId:
      deliveryPartnerId ?? this.deliveryPartnerId,
      deliveryPartnerName:
      deliveryPartnerName ?? this.deliveryPartnerName,
      deliveryPartnerPhone:
      deliveryPartnerPhone ?? this.deliveryPartnerPhone,
      deliveryVehicleNumber:
      deliveryVehicleNumber ?? this.deliveryVehicleNumber,
      confirmedAt: confirmedAt ?? this.confirmedAt,
      packedAt: packedAt ?? this.packedAt,
      shippedAt: shippedAt ?? this.shippedAt,
      outForDeliveryAt:
      outForDeliveryAt ?? this.outForDeliveryAt,
      deliveredAt: deliveredAt ?? this.deliveredAt,
      cancelledAt: cancelledAt ?? this.cancelledAt,
      expectedDeliveryDate:
      expectedDeliveryDate ??
          this.expectedDeliveryDate,
    );
  }

  OrderModel markConfirmed() {
    return copyWith(
      status: 'confirmed',
      confirmedAt: DateTime.now(),
    );
  }

  OrderModel markPacked() {
    return copyWith(
      status: 'packed',
      packedAt: DateTime.now(),
    );
  }

  OrderModel markShipped() {
    return copyWith(
      status: 'shipped',
      shippedAt: DateTime.now(),
    );
  }

  OrderModel markOutForDelivery() {
    return copyWith(
      status: 'out_for_delivery',
      outForDeliveryAt: DateTime.now(),
    );
  }

  OrderModel markDelivered() {
    return copyWith(
      status: 'delivered',
      deliveredAt: DateTime.now(),
      paymentStatus:
      paymentMethod.toLowerCase().contains('cash')
          ? 'paid'
          : paymentStatus,
    );
  }

  OrderModel markCancelled({
    required String reason,
  }) {
    return copyWith(
      status: 'cancelled',
      cancellationReason: reason.trim(),
      cancelledAt: DateTime.now(),
    );
  }

  static List<Map<String, dynamic>> _mapListValue(
      dynamic value,
      ) {
    if (value is! List) {
      return <Map<String, dynamic>>[];
    }

    return value
        .whereType<Map>()
        .map(
          (Map item) => Map<String, dynamic>.from(item),
    )
        .toList();
  }

  static double _calculateItemsSubtotal(
      List<Map<String, dynamic>> items,
      ) {
    return items.fold<double>(
      0,
          (
          double total,
          Map<String, dynamic> item,
          ) {
        final double price = _doubleValue(item['price']);
        final int quantity = _intValue(
          item['quantity'],
          fallback: 1,
        );

        return total + (price * quantity);
      },
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

  static String? _nullableStringValue(dynamic value) {
    if (value == null) {
      return null;
    }

    final String result = value.toString().trim();

    return result.isEmpty ? null : result;
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

    if (value is int) {
      return DateTime.fromMillisecondsSinceEpoch(value);
    }

    if (value is num) {
      return DateTime.fromMillisecondsSinceEpoch(
        value.toInt(),
      );
    }

    try {
      final dynamic result = value.toDate();

      if (result is DateTime) {
        return result;
      }
    } catch (_) {
      return null;
    }

    return null;
  }
}