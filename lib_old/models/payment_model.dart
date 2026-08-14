import 'package:cloud_firestore/cloud_firestore.dart';

enum PaymentMethodType {
  upi,
  googlePay,
  phonePe,
  paytm,
  creditCard,
  debitCard,
  netBanking,
  cashOnDelivery,
  farmWallet,
}

enum PaymentStatus {
  pending,
  processing,
  success,
  failed,
  cancelled,
  refunded,
}

class PaymentModel {
  final String? id;
  final String userId;
  final String orderId;
  final PaymentMethodType method;
  final PaymentStatus status;
  final double subtotal;
  final double discount;
  final double deliveryCharge;
  final double platformFee;
  final double walletAmount;
  final double totalAmount;
  final String couponCode;
  final String transactionId;
  final String gateway;
  final String failureReason;
  final Map<String, dynamic> gatewayResponse;
  final Map<String, dynamic> metadata;
  final DateTime createdAt;
  final DateTime updatedAt;
  final DateTime? completedAt;

  PaymentModel({
    this.id,
    required this.userId,
    required this.orderId,
    required this.method,
    this.status = PaymentStatus.pending,
    required this.subtotal,
    this.discount = 0,
    this.deliveryCharge = 0,
    this.platformFee = 0,
    this.walletAmount = 0,
    required this.totalAmount,
    this.couponCode = '',
    this.transactionId = '',
    this.gateway = 'internal',
    this.failureReason = '',
    this.gatewayResponse = const <String, dynamic>{},
    this.metadata = const <String, dynamic>{},
    DateTime? createdAt,
    DateTime? updatedAt,
    this.completedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  bool get isSuccessful => status == PaymentStatus.success;
  bool get isPending =>
      status == PaymentStatus.pending ||
          status == PaymentStatus.processing;
  bool get isFailed =>
      status == PaymentStatus.failed ||
          status == PaymentStatus.cancelled;

  String get methodLabel {
    switch (method) {
      case PaymentMethodType.upi:
        return 'UPI';
      case PaymentMethodType.googlePay:
        return 'Google Pay';
      case PaymentMethodType.phonePe:
        return 'PhonePe';
      case PaymentMethodType.paytm:
        return 'Paytm';
      case PaymentMethodType.creditCard:
        return 'Credit Card';
      case PaymentMethodType.debitCard:
        return 'Debit Card';
      case PaymentMethodType.netBanking:
        return 'Net Banking';
      case PaymentMethodType.cashOnDelivery:
        return 'Cash on Delivery';
      case PaymentMethodType.farmWallet:
        return 'Farm Wallet';
    }
  }

  String get statusLabel {
    switch (status) {
      case PaymentStatus.pending:
        return 'Pending';
      case PaymentStatus.processing:
        return 'Processing';
      case PaymentStatus.success:
        return 'Successful';
      case PaymentStatus.failed:
        return 'Failed';
      case PaymentStatus.cancelled:
        return 'Cancelled';
      case PaymentStatus.refunded:
        return 'Refunded';
    }
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id ?? '',
      'userId': userId,
      'orderId': orderId,
      'method': method.name,
      'status': status.name,
      'subtotal': subtotal,
      'discount': discount,
      'deliveryCharge': deliveryCharge,
      'platformFee': platformFee,
      'walletAmount': walletAmount,
      'totalAmount': totalAmount,
      'couponCode': couponCode,
      'transactionId': transactionId,
      'gateway': gateway,
      'failureReason': failureReason,
      'gatewayResponse': gatewayResponse,
      'metadata': metadata,
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
      'completedAt':
      completedAt == null ? null : Timestamp.fromDate(completedAt!),
    };
  }

  factory PaymentModel.fromMap(
      String id,
      Map<String, dynamic> map,
      ) {
    return PaymentModel(
      id: id,
      userId: _stringValue(map['userId']),
      orderId: _stringValue(map['orderId']),
      method: _paymentMethod(map['method']),
      status: _paymentStatus(map['status']),
      subtotal: _doubleValue(map['subtotal']),
      discount: _doubleValue(map['discount']),
      deliveryCharge: _doubleValue(map['deliveryCharge']),
      platformFee: _doubleValue(map['platformFee']),
      walletAmount: _doubleValue(map['walletAmount']),
      totalAmount: _doubleValue(map['totalAmount']),
      couponCode: _stringValue(map['couponCode']),
      transactionId: _stringValue(map['transactionId']),
      gateway: _stringValue(map['gateway'], fallback: 'internal'),
      failureReason: _stringValue(map['failureReason']),
      gatewayResponse: _mapValue(map['gatewayResponse']),
      metadata: _mapValue(map['metadata']),
      createdAt: _dateValue(map['createdAt']) ?? DateTime.now(),
      updatedAt: _dateValue(map['updatedAt']) ?? DateTime.now(),
      completedAt: _dateValue(map['completedAt']),
    );
  }

  PaymentModel copyWith({
    String? id,
    String? userId,
    String? orderId,
    PaymentMethodType? method,
    PaymentStatus? status,
    double? subtotal,
    double? discount,
    double? deliveryCharge,
    double? platformFee,
    double? walletAmount,
    double? totalAmount,
    String? couponCode,
    String? transactionId,
    String? gateway,
    String? failureReason,
    Map<String, dynamic>? gatewayResponse,
    Map<String, dynamic>? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
    DateTime? completedAt,
  }) {
    return PaymentModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      orderId: orderId ?? this.orderId,
      method: method ?? this.method,
      status: status ?? this.status,
      subtotal: subtotal ?? this.subtotal,
      discount: discount ?? this.discount,
      deliveryCharge: deliveryCharge ?? this.deliveryCharge,
      platformFee: platformFee ?? this.platformFee,
      walletAmount: walletAmount ?? this.walletAmount,
      totalAmount: totalAmount ?? this.totalAmount,
      couponCode: couponCode ?? this.couponCode,
      transactionId: transactionId ?? this.transactionId,
      gateway: gateway ?? this.gateway,
      failureReason: failureReason ?? this.failureReason,
      gatewayResponse: gatewayResponse ?? this.gatewayResponse,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? DateTime.now(),
      completedAt: completedAt ?? this.completedAt,
    );
  }

  static PaymentMethodType _paymentMethod(dynamic value) {
    final String normalized =
        value?.toString().trim().toLowerCase() ?? '';
    for (final PaymentMethodType item in PaymentMethodType.values) {
      if (item.name.toLowerCase() == normalized) return item;
    }
    return PaymentMethodType.cashOnDelivery;
  }

  static PaymentStatus _paymentStatus(dynamic value) {
    final String normalized =
        value?.toString().trim().toLowerCase() ?? '';
    for (final PaymentStatus item in PaymentStatus.values) {
      if (item.name.toLowerCase() == normalized) return item;
    }
    return PaymentStatus.pending;
  }

  static String _stringValue(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    final String result = value.toString().trim();
    return result.isEmpty ? fallback : result;
  }

  static double _doubleValue(dynamic value) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value.trim()) ?? 0;
    return 0;
  }

  static DateTime? _dateValue(dynamic value) {
    if (value == null) return null;
    if (value is Timestamp) return value.toDate();
    if (value is DateTime) return value;
    if (value is String) return DateTime.tryParse(value.trim());
    if (value is num) {
      return DateTime.fromMillisecondsSinceEpoch(value.toInt());
    }
    return null;
  }

  static Map<String, dynamic> _mapValue(dynamic value) {
    if (value is Map<String, dynamic>) {
      return Map<String, dynamic>.from(value);
    }
    if (value is Map) {
      return value.map(
            (dynamic key, dynamic item) =>
            MapEntry<String, dynamic>(key.toString(), item),
      );
    }
    return const <String, dynamic>{};
  }
}
