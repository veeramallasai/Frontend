import 'package:cloud_firestore/cloud_firestore.dart';

class ReviewModel {
  final String? id;
  final String productId;
  final String userId;
  final String userName;
  final String userPhoto;
  final double rating;
  final String title;
  final String review;
  final List<String> images;
  final bool verifiedPurchase;
  final int helpfulCount;
  final List<String> helpfulUserIds;
  final String sellerReply;
  final DateTime? sellerReplyAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  ReviewModel({
    this.id,
    required this.productId,
    required this.userId,
    required this.userName,
    this.userPhoto = '',
    required this.rating,
    this.title = '',
    required this.review,
    this.images = const <String>[],
    this.verifiedPurchase = false,
    this.helpfulCount = 0,
    this.helpfulUserIds = const <String>[],
    this.sellerReply = '',
    this.sellerReplyAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  })  : createdAt = createdAt ?? DateTime.now(),
        updatedAt = updatedAt ?? DateTime.now();

  bool isHelpfulBy(String userId) {
    return helpfulUserIds.contains(userId);
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id ?? '',
      'productId': productId,
      'userId': userId,
      'userName': userName,
      'userPhoto': userPhoto,
      'rating': rating,
      'title': title,
      'review': review,
      'images': images,
      'verifiedPurchase': verifiedPurchase,
      'helpfulCount': helpfulCount,
      'helpfulUserIds': helpfulUserIds,
      'sellerReply': sellerReply,
      'sellerReplyAt': sellerReplyAt == null
          ? null
          : Timestamp.fromDate(sellerReplyAt!),
      'createdAt': Timestamp.fromDate(createdAt),
      'updatedAt': Timestamp.fromDate(updatedAt),
    };
  }

  factory ReviewModel.fromMap(
      String id,
      Map<String, dynamic> map,
      ) {
    return ReviewModel(
      id: id,
      productId: _stringValue(map['productId']),
      userId: _stringValue(map['userId']),
      userName: _stringValue(
        map['userName'],
        fallback: 'Farm To Home Customer',
      ),
      userPhoto: _stringValue(map['userPhoto']),
      rating: _doubleValue(map['rating'], fallback: 5),
      title: _stringValue(map['title']),
      review: _stringValue(map['review']),
      images: _stringList(map['images']),
      verifiedPurchase: _boolValue(
        map['verifiedPurchase'],
      ),
      helpfulCount: _intValue(map['helpfulCount']),
      helpfulUserIds: _stringList(
        map['helpfulUserIds'],
      ),
      sellerReply: _stringValue(map['sellerReply']),
      sellerReplyAt: _dateValue(map['sellerReplyAt']),
      createdAt:
      _dateValue(map['createdAt']) ?? DateTime.now(),
      updatedAt:
      _dateValue(map['updatedAt']) ?? DateTime.now(),
    );
  }

  ReviewModel copyWith({
    String? id,
    String? productId,
    String? userId,
    String? userName,
    String? userPhoto,
    double? rating,
    String? title,
    String? review,
    List<String>? images,
    bool? verifiedPurchase,
    int? helpfulCount,
    List<String>? helpfulUserIds,
    String? sellerReply,
    DateTime? sellerReplyAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ReviewModel(
      id: id ?? this.id,
      productId: productId ?? this.productId,
      userId: userId ?? this.userId,
      userName: userName ?? this.userName,
      userPhoto: userPhoto ?? this.userPhoto,
      rating: rating ?? this.rating,
      title: title ?? this.title,
      review: review ?? this.review,
      images: images ?? this.images,
      verifiedPurchase:
      verifiedPurchase ?? this.verifiedPurchase,
      helpfulCount: helpfulCount ?? this.helpfulCount,
      helpfulUserIds:
      helpfulUserIds ?? this.helpfulUserIds,
      sellerReply: sellerReply ?? this.sellerReply,
      sellerReplyAt:
      sellerReplyAt ?? this.sellerReplyAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  static String _stringValue(
      dynamic value, {
        String fallback = '',
      }) {
    if (value == null) return fallback;
    final String result = value.toString().trim();
    return result.isEmpty ? fallback : result;
  }

  static int _intValue(
      dynamic value, {
        int fallback = 0,
      }) {
    if (value is num) return value.toInt();
    if (value is String) {
      return int.tryParse(value.trim()) ?? fallback;
    }
    return fallback;
  }

  static double _doubleValue(
      dynamic value, {
        double fallback = 0,
      }) {
    if (value is num) return value.toDouble();
    if (value is String) {
      return double.tryParse(value.trim()) ?? fallback;
    }
    return fallback;
  }

  static bool _boolValue(
      dynamic value, {
        bool fallback = false,
      }) {
    if (value is bool) return value;
    if (value is num) return value != 0;
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

  static List<String> _stringList(dynamic value) {
    if (value is! List) return const <String>[];
    return value
        .map((dynamic item) => item.toString().trim())
        .where((String item) => item.isNotEmpty)
        .toList();
  }

  static DateTime? _dateValue(dynamic value) {
    if (value == null) return null;
    if (value is Timestamp) return value.toDate();
    if (value is DateTime) return value;
    if (value is String) {
      return DateTime.tryParse(value.trim());
    }
    if (value is num) {
      return DateTime.fromMillisecondsSinceEpoch(
        value.toInt(),
      );
    }
    return null;
  }
}