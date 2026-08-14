import 'package:cloud_firestore/cloud_firestore.dart';

class PreOrderModel {
  final String id;
  final String userId;

  // Product information
  final String productId;
  final String productName;
  final String productTeluguName;
  final String productImage;
  final String category;
  final String categoryTelugu;
  final String weight;

  // Farmer information
  final String farmerId;
  final String farmerName;
  final String farmName;

  // Pricing and quantity
  final int quantity;
  final double unitPrice;
  final double totalPrice;

  // Harvest and delivery
  final DateTime? harvestDate;
  final DateTime expectedDeliveryDate;
  final String deliverySlot;
  final String deliveryAddress;
  final String deliveryType;

  // Payment
  final String paymentMethod;
  final String paymentStatus;

  // Pre-order status
  final String status;
  final String cancellationReason;

  // Additional notes
  final String customerNote;
  final String farmerNote;

  // Metadata
  final DateTime createdAt;
  final DateTime updatedAt;

  const PreOrderModel({
    this.id = '',
    required this.userId,
    required this.productId,
    required this.productName,
    this.productTeluguName = '',
    this.productImage = '',
    this.category = '',
    this.categoryTelugu = '',
    this.weight = '',
    required this.farmerId,
    this.farmerName = '',
    this.farmName = '',
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    this.harvestDate,
    required this.expectedDeliveryDate,
    required this.deliverySlot,
    this.deliveryAddress = '',
    this.deliveryType = 'Scheduled',
    this.paymentMethod = 'Cash on Delivery',
    this.paymentStatus = 'pending',
    this.status = 'pending',
    this.cancellationReason = '',
    this.customerNote = '',
    this.farmerNote = '',
    required this.createdAt,
    required this.updatedAt,
  });

  String get displayProductName {
    final String english = productName.trim();
    final String telugu = productTeluguName.trim();

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

  bool get isPending => normalizedStatus == 'pending';

  bool get isConfirmed => normalizedStatus == 'confirmed';

  bool get isHarvestReady =>
      normalizedStatus == 'harvest_ready' ||
          normalizedStatus == 'harvested';

  bool get isPacked => normalizedStatus == 'packed';

  bool get isOutForDelivery =>
      normalizedStatus == 'out_for_delivery' ||
          normalizedStatus == 'on_the_way';

  bool get isDelivered => normalizedStatus == 'delivered';

  bool get isCancelled => normalizedStatus == 'cancelled';

  bool get isCompleted => isDelivered || isCancelled;

  bool get isActive => !isCompleted;

  bool get isPaid => normalizedPaymentStatus == 'paid';

  bool get isPaymentPending =>
      normalizedPaymentStatus == 'pending';

  bool get isCashOnDelivery {
    final String normalized =
    paymentMethod.trim().toLowerCase();

    return normalized == 'cash on delivery' ||
        normalized == 'cod';
  }

  String get normalizedStatus {
    return status.trim().toLowerCase().replaceAll(' ', '_');
  }

  String get normalizedPaymentStatus {
    return paymentStatus.trim().toLowerCase();
  }

  String get formattedHarvestDate {
    if (harvestDate == null) {
      return 'Not available';
    }

    return _formatDate(harvestDate!);
  }

  String get formattedExpectedDeliveryDate {
    return _formatDate(expectedDeliveryDate);
  }

  String get formattedCreatedAt {
    return _formatDateTime(createdAt);
  }

  int get safeQuantity {
    return quantity < 1 ? 1 : quantity;
  }

  double get calculatedTotal {
    final double value = unitPrice * safeQuantity;
    return value < 0 ? 0 : value;
  }

  double get effectiveTotalPrice {
    return totalPrice > 0 ? totalPrice : calculatedTotal;
  }

  bool get hasValidDeliverySlot {
    return deliverySlot.trim().isNotEmpty;
  }

  bool get hasValidDeliveryDate {
    return expectedDeliveryDate.isAfter(
      DateTime(2000),
    );
  }

  bool get canBeCancelled {
    return isPending || isConfirmed;
  }

  bool get canChangeDeliverySlot {
    return isPending || isConfirmed;
  }

  bool get requiresFarmerAction {
    return isConfirmed ||
        normalizedStatus == 'awaiting_harvest';
  }

  String get statusLabel {
    switch (normalizedStatus) {
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'awaiting_harvest':
        return 'Awaiting Harvest';
      case 'harvest_ready':
      case 'harvested':
        return 'Harvest Ready';
      case 'packed':
        return 'Packed';
      case 'out_for_delivery':
      case 'on_the_way':
        return 'Out for Delivery';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.trim().isEmpty ? 'Pending' : status;
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

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id,
      'userId': userId,
      'productId': productId,
      'productName': productName,
      'productTeluguName': productTeluguName,
      'displayProductName': displayProductName,
      'productImage': productImage,
      'category': category,
      'categoryTelugu': categoryTelugu,
      'weight': weight,
      'farmerId': farmerId,
      'farmerName': farmerName,
      'farmName': farmName,
      'quantity': safeQuantity,
      'unitPrice': unitPrice,
      'totalPrice': effectiveTotalPrice,
      'harvestDate': harvestDate == null
          ? null
          : Timestamp.fromDate(harvestDate!),
      'expectedDeliveryDate':
      Timestamp.fromDate(expectedDeliveryDate),
      'deliverySlot': deliverySlot,
      'deliveryAddress': deliveryAddress,
      'deliveryType': deliveryType,
      'paymentMethod': paymentMethod,
      'paymentStatus': paymentStatus,
      'status': status,
      'cancellationReason': cancellationReason,
      'customerNote': customerNote,
      'farmerNote': farmerNote,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  factory PreOrderModel.fromMap(
      Map<String, dynamic> map, {
        String? documentId,
      }) {
    final DateTime now = DateTime.now();

    return PreOrderModel(
      id: _stringValue(
        map['id'],
        fallback: documentId ?? '',
      ),
      userId: _stringValue(map['userId']),
      productId: _stringValue(map['productId']),
      productName: _stringValue(
        map['productName'] ?? map['name'],
        fallback: 'Unknown Product',
      ),
      productTeluguName: _stringValue(
        map['productTeluguName'] ??
            map['teluguName'],
      ),
      productImage: _stringValue(
        map['productImage'] ?? map['image'],
      ),
      category: _stringValue(map['category']),
      categoryTelugu:
      _stringValue(map['categoryTelugu']),
      weight: _stringValue(map['weight']),
      farmerId: _stringValue(map['farmerId']),
      farmerName: _stringValue(map['farmerName']),
      farmName: _stringValue(
        map['farmName'] ?? map['seller'],
      ),
      quantity: _positiveIntValue(
        map['quantity'],
        fallback: 1,
      ),
      unitPrice: _doubleValue(
        map['unitPrice'] ?? map['price'],
      ),
      totalPrice: _doubleValue(
        map['totalPrice'] ?? map['totalAmount'],
      ),
      harvestDate: _dateTimeValue(
        map['harvestDate'],
      ),
      expectedDeliveryDate: _dateTimeValue(
        map['expectedDeliveryDate'] ??
            map['deliveryDate'],
      ) ??
          now,
      deliverySlot: _stringValue(
        map['deliverySlot'] ?? map['timeSlot'],
      ),
      deliveryAddress: _stringValue(
        map['deliveryAddress'] ?? map['address'],
      ),
      deliveryType: _stringValue(
        map['deliveryType'],
        fallback: 'Scheduled',
      ),
      paymentMethod: _stringValue(
        map['paymentMethod'],
        fallback: 'Cash on Delivery',
      ),
      paymentStatus: _stringValue(
        map['paymentStatus'],
        fallback: 'pending',
      ),
      status: _stringValue(
        map['status'],
        fallback: 'pending',
      ),
      cancellationReason:
      _stringValue(map['cancellationReason']),
      customerNote: _stringValue(
        map['customerNote'],
      ),
      farmerNote: _stringValue(
        map['farmerNote'],
      ),
      createdAt: _dateTimeValue(
        map['createdAt'] ?? map['timestamp'],
      ) ??
          now,
      updatedAt: _dateTimeValue(
        map['updatedAt'],
      ) ??
          now,
    );
  }

  PreOrderModel copyWith({
    String? id,
    String? userId,
    String? productId,
    String? productName,
    String? productTeluguName,
    String? productImage,
    String? category,
    String? categoryTelugu,
    String? weight,
    String? farmerId,
    String? farmerName,
    String? farmName,
    int? quantity,
    double? unitPrice,
    double? totalPrice,
    DateTime? harvestDate,
    DateTime? expectedDeliveryDate,
    String? deliverySlot,
    String? deliveryAddress,
    String? deliveryType,
    String? paymentMethod,
    String? paymentStatus,
    String? status,
    String? cancellationReason,
    String? customerNote,
    String? farmerNote,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return PreOrderModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      productId: productId ?? this.productId,
      productName: productName ?? this.productName,
      productTeluguName:
      productTeluguName ?? this.productTeluguName,
      productImage: productImage ?? this.productImage,
      category: category ?? this.category,
      categoryTelugu:
      categoryTelugu ?? this.categoryTelugu,
      weight: weight ?? this.weight,
      farmerId: farmerId ?? this.farmerId,
      farmerName: farmerName ?? this.farmerName,
      farmName: farmName ?? this.farmName,
      quantity: quantity ?? this.quantity,
      unitPrice: unitPrice ?? this.unitPrice,
      totalPrice: totalPrice ?? this.totalPrice,
      harvestDate: harvestDate ?? this.harvestDate,
      expectedDeliveryDate:
      expectedDeliveryDate ??
          this.expectedDeliveryDate,
      deliverySlot: deliverySlot ?? this.deliverySlot,
      deliveryAddress:
      deliveryAddress ?? this.deliveryAddress,
      deliveryType: deliveryType ?? this.deliveryType,
      paymentMethod:
      paymentMethod ?? this.paymentMethod,
      paymentStatus:
      paymentStatus ?? this.paymentStatus,
      status: status ?? this.status,
      cancellationReason:
      cancellationReason ??
          this.cancellationReason,
      customerNote:
      customerNote ?? this.customerNote,
      farmerNote: farmerNote ?? this.farmerNote,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  PreOrderModel markConfirmed() {
    return copyWith(
      status: 'confirmed',
      updatedAt: DateTime.now(),
    );
  }

  PreOrderModel markHarvestReady() {
    return copyWith(
      status: 'harvest_ready',
      updatedAt: DateTime.now(),
    );
  }

  PreOrderModel markPacked() {
    return copyWith(
      status: 'packed',
      updatedAt: DateTime.now(),
    );
  }

  PreOrderModel markOutForDelivery() {
    return copyWith(
      status: 'out_for_delivery',
      updatedAt: DateTime.now(),
    );
  }

  PreOrderModel markDelivered() {
    return copyWith(
      status: 'delivered',
      updatedAt: DateTime.now(),
    );
  }

  PreOrderModel markCancelled({
    required String reason,
  }) {
    return copyWith(
      status: 'cancelled',
      cancellationReason: reason.trim(),
      updatedAt: DateTime.now(),
    );
  }

  PreOrderModel markPaid() {
    return copyWith(
      paymentStatus: 'paid',
      updatedAt: DateTime.now(),
    );
  }

  PreOrderModel updateDelivery({
    required DateTime date,
    required String slot,
    String? address,
  }) {
    return copyWith(
      expectedDeliveryDate: date,
      deliverySlot: slot.trim(),
      deliveryAddress:
      address?.trim() ?? deliveryAddress,
      updatedAt: DateTime.now(),
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

  static int _positiveIntValue(
      dynamic value, {
        int fallback = 1,
      }) {
    final int result = _intValue(
      value,
      fallback: fallback,
    );

    return result > 0 ? result : fallback;
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

  static String _formatDate(DateTime date) {
    const List<String> months = <String>[
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return '${date.day.toString().padLeft(2, '0')} '
        '${months[date.month - 1]} '
        '${date.year}';
  }

  static String _formatDateTime(DateTime date) {
    final String hour = _formatHour(date.hour);
    final String minute =
    date.minute.toString().padLeft(2, '0');
    final String period =
    date.hour >= 12 ? 'PM' : 'AM';

    return '${_formatDate(date)}, '
        '$hour:$minute $period';
  }

  static String _formatHour(int hour) {
    final int converted = hour % 12;
    return (converted == 0 ? 12 : converted).toString();
  }
}