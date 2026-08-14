import 'package:cloud_firestore/cloud_firestore.dart';

enum CouponType {
  percentage,
  flat,
  freeDelivery,
}

class CouponModel {
  final String? id;
  final String code;
  final String title;
  final String description;

  final CouponType type;
  final double discountValue;
  final double minimumOrderAmount;
  final double maximumDiscountAmount;

  final bool active;
  final bool firstOrderOnly;
  final bool userSpecific;
  final List<String> eligibleUserIds;
  final List<String> eligibleCategories;
  final List<String> excludedProductIds;

  final int totalUsageLimit;
  final int perUserUsageLimit;
  final int usedCount;

  final DateTime validFrom;
  final DateTime validUntil;
  final DateTime createdAt;
  final DateTime updatedAt;

  final String bannerImage;
  final String terms;
  final int priority;

  CouponModel({
    this.id,
    required this.code,
    required this.title,
    required this.description,
    required this.type,
    required this.discountValue,
    this.minimumOrderAmount = 0,
    this.maximumDiscountAmount = 0,
    this.active = true,
    this.firstOrderOnly = false,
    this.userSpecific = false,
    this.eligibleUserIds = const <String>[],
    this.eligibleCategories = const <String>[],
    this.excludedProductIds = const <String>[],
    this.totalUsageLimit = 0,
    this.perUserUsageLimit = 1,
    this.usedCount = 0,
    DateTime? validFrom,
    DateTime? validUntil,
    DateTime? createdAt,
    DateTime? updatedAt,
    this.bannerImage = '',
    this.terms = '',
    this.priority = 0,
  })  : validFrom = validFrom ?? DateTime.now(),
        validUntil = validUntil ??
            DateTime.now().add(const Duration(days: 30)),
        createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  bool get isExpired =>
      DateTime.now().isAfter(validUntil);

  bool get isUpcoming =>
      DateTime.now().isBefore(validFrom);

  bool get hasReachedUsageLimit {
    if (totalUsageLimit <= 0) {
      return false;
    }

    return usedCount >= totalUsageLimit;
  }

  bool get isCurrentlyAvailable {
    return active &&
        !isExpired &&
        !isUpcoming &&
        !hasReachedUsageLimit;
  }

  String get normalizedCode =>
      code.trim().toUpperCase();

  String get typeLabel {
    switch (type) {
      case CouponType.percentage:
        return 'Percentage Discount';
      case CouponType.flat:
        return 'Flat Discount';
      case CouponType.freeDelivery:
        return 'Free Delivery';
    }
  }

  String get offerLabel {
    switch (type) {
      case CouponType.percentage:
        return '${discountValue.toStringAsFixed(0)}% OFF';
      case CouponType.flat:
        return '₹${discountValue.toStringAsFixed(0)} OFF';
      case CouponType.freeDelivery:
        return 'FREE DELIVERY';
    }
  }

  double calculateDiscount({
    required double orderAmount,
    double deliveryCharge = 0,
  }) {
    if (!isCurrentlyAvailable) {
      return 0;
    }

    if (orderAmount < minimumOrderAmount) {
      return 0;
    }

    double discount = 0;

    switch (type) {
      case CouponType.percentage:
        discount = orderAmount *
            (discountValue / 100);
        break;

      case CouponType.flat:
        discount = discountValue;
        break;

      case CouponType.freeDelivery:
        discount = deliveryCharge;
        break;
    }

    if (maximumDiscountAmount > 0 &&
        discount > maximumDiscountAmount) {
      discount = maximumDiscountAmount;
    }

    if (discount > orderAmount + deliveryCharge) {
      discount = orderAmount + deliveryCharge;
    }

    return discount < 0 ? 0 : discount;
  }

  CouponValidationResult validate({
    required String userId,
    required double orderAmount,
    int previousOrderCount = 0,
    int userUsageCount = 0,
    List<String> productIds =
    const <String>[],
    List<String> categories =
    const <String>[],
  }) {
    if (!active) {
      return const CouponValidationResult.invalid(
        'This coupon is currently inactive.',
      );
    }

    if (isUpcoming) {
      return CouponValidationResult.invalid(
        'This coupon becomes active on ${_formatDate(validFrom)}.',
      );
    }

    if (isExpired) {
      return const CouponValidationResult.invalid(
        'This coupon has expired.',
      );
    }

    if (hasReachedUsageLimit) {
      return const CouponValidationResult.invalid(
        'This coupon has reached its usage limit.',
      );
    }

    if (minimumOrderAmount > 0 &&
        orderAmount < minimumOrderAmount) {
      final double remaining =
          minimumOrderAmount - orderAmount;

      return CouponValidationResult.invalid(
        'Add ₹${remaining.toStringAsFixed(0)} more to use this coupon.',
      );
    }

    if (firstOrderOnly &&
        previousOrderCount > 0) {
      return const CouponValidationResult.invalid(
        'This coupon is valid only on the first order.',
      );
    }

    if (userSpecific &&
        !eligibleUserIds.contains(userId)) {
      return const CouponValidationResult.invalid(
        'This coupon is not available for this account.',
      );
    }

    if (perUserUsageLimit > 0 &&
        userUsageCount >= perUserUsageLimit) {
      return const CouponValidationResult.invalid(
        'You have already used this coupon.',
      );
    }

    if (eligibleCategories.isNotEmpty) {
      final bool hasEligibleCategory =
      categories.any(
            (String category) =>
            eligibleCategories
                .map((String item) =>
                item.trim().toLowerCase())
                .contains(
              category.trim().toLowerCase(),
            ),
      );

      if (!hasEligibleCategory) {
        return const CouponValidationResult.invalid(
          'This coupon is not valid for the selected products.',
        );
      }
    }

    if (excludedProductIds.isNotEmpty) {
      final bool allExcluded =
          productIds.isNotEmpty &&
              productIds.every(
                excludedProductIds.contains,
              );

      if (allExcluded) {
        return const CouponValidationResult.invalid(
          'This coupon cannot be used for the selected products.',
        );
      }
    }

    return const CouponValidationResult.valid();
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id ?? '',
      'code': normalizedCode,
      'title': title,
      'description': description,
      'type': type.name,
      'discountValue': discountValue,
      'minimumOrderAmount': minimumOrderAmount,
      'maximumDiscountAmount':
      maximumDiscountAmount,
      'active': active,
      'firstOrderOnly': firstOrderOnly,
      'userSpecific': userSpecific,
      'eligibleUserIds': eligibleUserIds,
      'eligibleCategories':
      eligibleCategories,
      'excludedProductIds':
      excludedProductIds,
      'totalUsageLimit': totalUsageLimit,
      'perUserUsageLimit':
      perUserUsageLimit,
      'usedCount': usedCount,
      'validFrom':
      Timestamp.fromDate(validFrom),
      'validUntil':
      Timestamp.fromDate(validUntil),
      'createdAt':
      Timestamp.fromDate(createdAt),
      'updatedAt':
      Timestamp.fromDate(updatedAt),
      'bannerImage': bannerImage,
      'terms': terms,
      'priority': priority,
    };
  }

  factory CouponModel.fromMap(
      String id,
      Map<String, dynamic> map,
      ) {
    return CouponModel(
      id: id,
      code: _stringValue(
        map['code'],
      ),
      title: _stringValue(
        map['title'],
        fallback: 'Farm To Home Offer',
      ),
      description: _stringValue(
        map['description'],
      ),
      type: _couponType(
        map['type'],
      ),
      discountValue: _doubleValue(
        map['discountValue'] ??
            map['discount'],
      ),
      minimumOrderAmount: _doubleValue(
        map['minimumOrderAmount'] ??
            map['minOrderAmount'],
      ),
      maximumDiscountAmount:
      _doubleValue(
        map['maximumDiscountAmount'] ??
            map['maxDiscountAmount'],
      ),
      active: _boolValue(
        map['active'],
        fallback: true,
      ),
      firstOrderOnly: _boolValue(
        map['firstOrderOnly'],
      ),
      userSpecific: _boolValue(
        map['userSpecific'],
      ),
      eligibleUserIds: _stringList(
        map['eligibleUserIds'],
      ),
      eligibleCategories: _stringList(
        map['eligibleCategories'],
      ),
      excludedProductIds: _stringList(
        map['excludedProductIds'],
      ),
      totalUsageLimit: _intValue(
        map['totalUsageLimit'],
      ),
      perUserUsageLimit: _intValue(
        map['perUserUsageLimit'],
        fallback: 1,
      ),
      usedCount: _intValue(
        map['usedCount'],
      ),
      validFrom: _dateValue(
        map['validFrom'],
      ) ??
          DateTime.now(),
      validUntil: _dateValue(
        map['validUntil'] ??
            map['expiryDate'],
      ) ??
          DateTime.now().add(
            const Duration(days: 30),
          ),
      createdAt: _dateValue(
        map['createdAt'],
      ) ??
          DateTime.now(),
      updatedAt: _dateValue(
        map['updatedAt'],
      ) ??
          DateTime.now(),
      bannerImage: _stringValue(
        map['bannerImage'] ??
            map['image'],
      ),
      terms: _stringValue(
        map['terms'],
      ),
      priority: _intValue(
        map['priority'],
      ),
    );
  }

  CouponModel copyWith({
    String? id,
    String? code,
    String? title,
    String? description,
    CouponType? type,
    double? discountValue,
    double? minimumOrderAmount,
    double? maximumDiscountAmount,
    bool? active,
    bool? firstOrderOnly,
    bool? userSpecific,
    List<String>? eligibleUserIds,
    List<String>? eligibleCategories,
    List<String>? excludedProductIds,
    int? totalUsageLimit,
    int? perUserUsageLimit,
    int? usedCount,
    DateTime? validFrom,
    DateTime? validUntil,
    DateTime? createdAt,
    DateTime? updatedAt,
    String? bannerImage,
    String? terms,
    int? priority,
  }) {
    return CouponModel(
      id: id ?? this.id,
      code: code ?? this.code,
      title: title ?? this.title,
      description:
      description ?? this.description,
      type: type ?? this.type,
      discountValue:
      discountValue ?? this.discountValue,
      minimumOrderAmount:
      minimumOrderAmount ??
          this.minimumOrderAmount,
      maximumDiscountAmount:
      maximumDiscountAmount ??
          this.maximumDiscountAmount,
      active: active ?? this.active,
      firstOrderOnly:
      firstOrderOnly ??
          this.firstOrderOnly,
      userSpecific:
      userSpecific ?? this.userSpecific,
      eligibleUserIds:
      eligibleUserIds ??
          this.eligibleUserIds,
      eligibleCategories:
      eligibleCategories ??
          this.eligibleCategories,
      excludedProductIds:
      excludedProductIds ??
          this.excludedProductIds,
      totalUsageLimit:
      totalUsageLimit ??
          this.totalUsageLimit,
      perUserUsageLimit:
      perUserUsageLimit ??
          this.perUserUsageLimit,
      usedCount:
      usedCount ?? this.usedCount,
      validFrom:
      validFrom ?? this.validFrom,
      validUntil:
      validUntil ?? this.validUntil,
      createdAt:
      createdAt ?? this.createdAt,
      updatedAt:
      updatedAt ?? this.updatedAt,
      bannerImage:
      bannerImage ?? this.bannerImage,
      terms: terms ?? this.terms,
      priority: priority ?? this.priority,
    );
  }

  static CouponType _couponType(
      dynamic value,
      ) {
    final String normalized =
        value?.toString().trim().toLowerCase() ??
            '';

    switch (normalized) {
      case 'percentage':
      case 'percent':
        return CouponType.percentage;

      case 'flat':
      case 'fixed':
        return CouponType.flat;

      case 'freedelivery':
      case 'free_delivery':
      case 'free delivery':
        return CouponType.freeDelivery;

      default:
        return CouponType.flat;
    }
  }

  static String _stringValue(
      dynamic value, {
        String fallback = '',
      }) {
    if (value == null) {
      return fallback;
    }

    final String result =
    value.toString().trim();

    return result.isEmpty
        ? fallback
        : result;
  }

  static double _doubleValue(
      dynamic value, {
        double fallback = 0,
      }) {
    if (value is num) {
      return value.toDouble();
    }

    if (value is String) {
      return double.tryParse(
        value.trim(),
      ) ??
          fallback;
    }

    return fallback;
  }

  static int _intValue(
      dynamic value, {
        int fallback = 0,
      }) {
    if (value is num) {
      return value.toInt();
    }

    if (value is String) {
      return int.tryParse(
        value.trim(),
      ) ??
          fallback;
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

      if (normalized == 'true' ||
          normalized == '1') {
        return true;
      }

      if (normalized == 'false' ||
          normalized == '0') {
        return false;
      }
    }

    return fallback;
  }

  static List<String> _stringList(
      dynamic value,
      ) {
    if (value is! List) {
      return const <String>[];
    }

    return value
        .map(
          (dynamic item) =>
          item.toString().trim(),
    )
        .where(
          (String item) => item.isNotEmpty,
    )
        .toList();
  }

  static DateTime? _dateValue(
      dynamic value,
      ) {
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
      return DateTime.tryParse(
        value.trim(),
      );
    }

    if (value is num) {
      return DateTime
          .fromMillisecondsSinceEpoch(
        value.toInt(),
      );
    }

    return null;
  }

  static String _formatDate(
      DateTime date,
      ) {
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year}';
  }
}

class CouponValidationResult {
  final bool isValid;
  final String message;

  const CouponValidationResult._({
    required this.isValid,
    required this.message,
  });

  const CouponValidationResult.valid()
      : this._(
    isValid: true,
    message: '',
  );

  const CouponValidationResult.invalid(
      String message,
      ) : this._(
    isValid: false,
    message: message,
  );
}