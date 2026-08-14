import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/coupon_model.dart';

class CouponService {
  CouponService({
    FirebaseFirestore? firestore,
  }) : _db = firestore ??
      FirebaseFirestore.instance;

  final FirebaseFirestore _db;

  static const String couponCollection =
      'coupons';
  static const String usageCollection =
      'coupon_usages';

  CollectionReference<Map<String, dynamic>>
  get _coupons {
    return _db.collection(couponCollection);
  }

  CollectionReference<Map<String, dynamic>>
  get _usages {
    return _db.collection(usageCollection);
  }

  Stream<List<CouponModel>>
  watchAvailableCoupons({
    required String userId,
    double orderAmount = 0,
    int previousOrderCount = 0,
  }) {
    return _coupons
        .where(
      'active',
      isEqualTo: true,
    )
        .snapshots()
        .asyncMap(
          (QuerySnapshot<Map<String, dynamic>>
      snapshot) async {
        final List<CouponModel> coupons =
        snapshot.docs
            .map(
              (
              QueryDocumentSnapshot<
                  Map<String, dynamic>>
              document,
              ) {
            return CouponModel.fromMap(
              document.id,
              document.data(),
            );
          },
        )
            .where(
              (CouponModel coupon) =>
          coupon.isCurrentlyAvailable,
        )
            .toList();

        coupons.sort(
              (
              CouponModel first,
              CouponModel second,
              ) {
            if (second.priority !=
                first.priority) {
              return second.priority.compareTo(
                first.priority,
              );
            }

            return second.discountValue
                .compareTo(
              first.discountValue,
            );
          },
        );

        return coupons;
      },
    );
  }

  Stream<List<CouponModel>>
  watchAllCoupons() {
    return _coupons.snapshots().map(
          (
          QuerySnapshot<Map<String, dynamic>>
          snapshot,
          ) {
        final List<CouponModel> coupons =
        snapshot.docs
            .map(
              (
              QueryDocumentSnapshot<
                  Map<String, dynamic>>
              document,
              ) {
            return CouponModel.fromMap(
              document.id,
              document.data(),
            );
          },
        )
            .toList();

        coupons.sort(
              (
              CouponModel first,
              CouponModel second,
              ) {
            if (second.priority !=
                first.priority) {
              return second.priority.compareTo(
                first.priority,
              );
            }

            return second.createdAt
                .compareTo(
              first.createdAt,
            );
          },
        );

        return coupons;
      },
    );
  }

  Future<CouponModel?> findCouponByCode(
      String code,
      ) async {
    final String normalized =
    code.trim().toUpperCase();

    if (normalized.isEmpty) {
      return null;
    }

    try {
      final QuerySnapshot<Map<String, dynamic>>
      snapshot = await _coupons
          .where(
        'code',
        isEqualTo: normalized,
      )
          .limit(1)
          .get();

      if (snapshot.docs.isEmpty) {
        return null;
      }

      final QueryDocumentSnapshot<
          Map<String, dynamic>>
      document = snapshot.docs.first;

      return CouponModel.fromMap(
        document.id,
        document.data(),
      );
    } on FirebaseException catch (error) {
      throw CouponServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<AppliedCouponResult> applyCoupon({
    required String code,
    required String userId,
    required double orderAmount,
    double deliveryCharge = 0,
    int previousOrderCount = 0,
    List<String> productIds =
    const <String>[],
    List<String> categories =
    const <String>[],
  }) async {
    final CouponModel? coupon =
    await findCouponByCode(code);

    if (coupon == null) {
      return const AppliedCouponResult.invalid(
        'Coupon code not found.',
      );
    }

    final int userUsageCount =
    await getUserUsageCount(
      userId: userId,
      couponId: coupon.id ?? '',
    );

    final CouponValidationResult validation =
    coupon.validate(
      userId: userId,
      orderAmount: orderAmount,
      previousOrderCount:
      previousOrderCount,
      userUsageCount: userUsageCount,
      productIds: productIds,
      categories: categories,
    );

    if (!validation.isValid) {
      return AppliedCouponResult.invalid(
        validation.message,
      );
    }

    final double discount =
    coupon.calculateDiscount(
      orderAmount: orderAmount,
      deliveryCharge: deliveryCharge,
    );

    if (discount <= 0) {
      return const AppliedCouponResult.invalid(
        'This coupon does not provide a discount for the current order.',
      );
    }

    return AppliedCouponResult.valid(
      coupon: coupon,
      discountAmount: discount,
      message:
      '${coupon.normalizedCode} applied successfully.',
    );
  }

  Future<int> getUserUsageCount({
    required String userId,
    required String couponId,
  }) async {
    if (userId.trim().isEmpty ||
        couponId.trim().isEmpty) {
      return 0;
    }

    final QuerySnapshot<Map<String, dynamic>>
    snapshot = await _usages
        .where(
      'userId',
      isEqualTo: userId,
    )
        .where(
      'couponId',
      isEqualTo: couponId,
    )
        .get();

    return snapshot.docs.length;
  }

  Future<void> recordCouponUsage({
    required CouponModel coupon,
    required String userId,
    required String orderId,
    required double discountAmount,
  }) async {
    final String? couponId = coupon.id;

    if (couponId == null ||
        couponId.trim().isEmpty) {
      throw const CouponServiceException(
        message:
        'Coupon ID is required to record usage.',
        code: 'missing-coupon-id',
      );
    }

    final DocumentReference<Map<String, dynamic>>
    usageReference = _usages.doc();

    final DocumentReference<Map<String, dynamic>>
    couponReference =
    _coupons.doc(couponId);

    try {
      await _db.runTransaction(
            (Transaction transaction) async {
          final DocumentSnapshot<
              Map<String, dynamic>>
          snapshot = await transaction.get(
            couponReference,
          );

          if (!snapshot.exists) {
            throw const CouponServiceException(
              message:
              'Coupon no longer exists.',
              code: 'coupon-not-found',
            );
          }

          final CouponModel current =
          CouponModel.fromMap(
            snapshot.id,
            snapshot.data() ??
                <String, dynamic>{},
          );

          if (!current.isCurrentlyAvailable) {
            throw const CouponServiceException(
              message:
              'Coupon is no longer available.',
              code:
              'coupon-not-available',
            );
          }

          transaction.set(
            usageReference,
            <String, dynamic>{
              'id': usageReference.id,
              'couponId': couponId,
              'couponCode':
              coupon.normalizedCode,
              'userId': userId,
              'orderId': orderId,
              'discountAmount':
              discountAmount,
              'usedAt':
              FieldValue.serverTimestamp(),
            },
          );

          transaction.set(
            couponReference,
            <String, dynamic>{
              'usedCount':
              FieldValue.increment(1),
              'updatedAt':
              FieldValue.serverTimestamp(),
            },
            SetOptions(merge: true),
          );
        },
      );
    } on CouponServiceException {
      rethrow;
    } on FirebaseException catch (error) {
      throw CouponServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<String> createCoupon(
      CouponModel coupon,
      ) async {
    _validateCoupon(coupon);

    final DocumentReference<Map<String, dynamic>>
    reference = _coupons.doc();

    await reference.set(
      <String, dynamic>{
        ...coupon.copyWith(
          id: reference.id,
        ).toMap(),
        'id': reference.id,
        'code': coupon.normalizedCode,
        'createdAt':
        FieldValue.serverTimestamp(),
        'updatedAt':
        FieldValue.serverTimestamp(),
      },
    );

    return reference.id;
  }

  Future<void> updateCoupon(
      CouponModel coupon,
      ) async {
    final String? id = coupon.id;

    if (id == null ||
        id.trim().isEmpty) {
      throw const CouponServiceException(
        message:
        'Coupon ID is required.',
        code: 'missing-coupon-id',
      );
    }

    _validateCoupon(coupon);

    await _coupons.doc(id).set(
      <String, dynamic>{
        ...coupon.toMap(),
        'updatedAt':
        FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  Future<void> deleteCoupon(
      String id,
      ) async {
    final String cleanId = id.trim();

    if (cleanId.isEmpty) {
      return;
    }

    await _coupons.doc(cleanId).delete();
  }

  void _validateCoupon(
      CouponModel coupon,
      ) {
    if (coupon.normalizedCode.isEmpty) {
      throw const CouponServiceException(
        message:
        'Coupon code is required.',
        code: 'missing-code',
      );
    }

    if (coupon.title.trim().isEmpty) {
      throw const CouponServiceException(
        message:
        'Coupon title is required.',
        code: 'missing-title',
      );
    }

    if (coupon.type !=
        CouponType.freeDelivery &&
        coupon.discountValue <= 0) {
      throw const CouponServiceException(
        message:
        'Discount value must be greater than zero.',
        code:
        'invalid-discount-value',
      );
    }

    if (coupon.validUntil
        .isBefore(coupon.validFrom)) {
      throw const CouponServiceException(
        message:
        'Coupon expiry must be after the start date.',
        code: 'invalid-date-range',
      );
    }
  }

  String _firebaseMessage(
      FirebaseException error,
      ) {
    switch (error.code) {
      case 'permission-denied':
        return 'Firestore permission denied. Check coupon rules.';

      case 'unavailable':
        return 'Coupon service is unavailable. Check your internet.';

      case 'deadline-exceeded':
        return 'Coupon request timed out. Please try again.';

      default:
        return error.message
            ?.trim()
            .isNotEmpty ==
            true
            ? error.message!.trim()
            : 'Unable to complete coupon operation.';
    }
  }
}

class AppliedCouponResult {
  final bool isValid;
  final CouponModel? coupon;
  final double discountAmount;
  final String message;

  const AppliedCouponResult._({
    required this.isValid,
    required this.coupon,
    required this.discountAmount,
    required this.message,
  });

  const AppliedCouponResult.valid({
    required CouponModel coupon,
    required double discountAmount,
    required String message,
  }) : this._(
    isValid: true,
    coupon: coupon,
    discountAmount:
    discountAmount,
    message: message,
  );

  const AppliedCouponResult.invalid(
      String message,
      ) : this._(
    isValid: false,
    coupon: null,
    discountAmount: 0,
    message: message,
  );
}

class CouponServiceException
    implements Exception {
  final String message;
  final String code;
  final Object? originalError;

  const CouponServiceException({
    required this.message,
    this.code = 'coupon-service-error',
    this.originalError,
  });

  @override
  String toString() {
    return 'CouponServiceException(code: $code, message: $message)';
  }
}