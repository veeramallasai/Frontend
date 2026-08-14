import 'package:cloud_firestore/cloud_firestore.dart';

class NotificationModel {
  final String? id;
  final String userId;

  final String title;
  final String body;
  final String type;
  final String image;

  final String orderId;
  final String productId;
  final String farmerId;
  final String route;
  final Map<String, dynamic> data;

  final bool read;
  final bool archived;
  final DateTime timestamp;
  final DateTime? readAt;
  final DateTime? expiresAt;

  NotificationModel({
    this.id,
    required this.userId,
    required this.title,
    required this.body,
    this.type = 'general',
    this.image = '',
    this.orderId = '',
    this.productId = '',
    this.farmerId = '',
    this.route = '',
    this.data = const <String, dynamic>{},
    this.read = false,
    this.archived = false,
    DateTime? timestamp,
    this.readAt,
    this.expiresAt,
  }) : timestamp = timestamp ?? DateTime.now();

  bool get isUnread => !read;

  bool get isExpired {
    final DateTime? value = expiresAt;
    return value != null && value.isBefore(DateTime.now());
  }

  String get normalizedType {
    final String value = type.trim().toLowerCase();

    if (value.isEmpty) {
      return 'general';
    }

    return value
        .replaceAll('-', '_')
        .replaceAll(' ', '_');
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id ?? '',
      'userId': userId,
      'title': title,
      'body': body,
      'type': normalizedType,
      'image': image,
      'orderId': orderId,
      'productId': productId,
      'farmerId': farmerId,
      'route': route,
      'data': data,
      'read': read,
      'archived': archived,
      'timestamp': Timestamp.fromDate(timestamp),
      'readAt': readAt == null
          ? null
          : Timestamp.fromDate(readAt!),
      'expiresAt': expiresAt == null
          ? null
          : Timestamp.fromDate(expiresAt!),
    };
  }

  factory NotificationModel.fromMap(
      String id,
      Map<String, dynamic> map,
      ) {
    return NotificationModel(
      id: id,
      userId: _stringValue(map['userId']),
      title: _stringValue(
        map['title'],
        fallback: 'Farm To Home',
      ),
      body: _stringValue(
        map['body'] ?? map['message'],
      ),
      type: _stringValue(
        map['type'],
        fallback: 'general',
      ),
      image: _stringValue(
        map['image'] ?? map['imageUrl'],
      ),
      orderId: _stringValue(map['orderId']),
      productId: _stringValue(map['productId']),
      farmerId: _stringValue(map['farmerId']),
      route: _stringValue(map['route']),
      data: _mapValue(map['data']),
      read: _boolValue(
        map['read'] ?? map['isRead'],
      ),
      archived: _boolValue(map['archived']),
      timestamp:
      _dateValue(map['timestamp'] ?? map['createdAt']) ??
          DateTime.now(),
      readAt: _dateValue(map['readAt']),
      expiresAt: _dateValue(map['expiresAt']),
    );
  }

  NotificationModel copyWith({
    String? id,
    String? userId,
    String? title,
    String? body,
    String? type,
    String? image,
    String? orderId,
    String? productId,
    String? farmerId,
    String? route,
    Map<String, dynamic>? data,
    bool? read,
    bool? archived,
    DateTime? timestamp,
    DateTime? readAt,
    DateTime? expiresAt,
  }) {
    return NotificationModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      title: title ?? this.title,
      body: body ?? this.body,
      type: type ?? this.type,
      image: image ?? this.image,
      orderId: orderId ?? this.orderId,
      productId: productId ?? this.productId,
      farmerId: farmerId ?? this.farmerId,
      route: route ?? this.route,
      data: data ?? this.data,
      read: read ?? this.read,
      archived: archived ?? this.archived,
      timestamp: timestamp ?? this.timestamp,
      readAt: readAt ?? this.readAt,
      expiresAt: expiresAt ?? this.expiresAt,
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

  static DateTime? _dateValue(dynamic value) {
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

    if (value is num) {
      return DateTime.fromMillisecondsSinceEpoch(
        value.toInt(),
      );
    }

    try {
      final dynamic result = value.toDate();
      return result is DateTime ? result : null;
    } catch (_) {
      return null;
    }
  }

  static Map<String, dynamic> _mapValue(dynamic value) {
    if (value is Map<String, dynamic>) {
      return Map<String, dynamic>.from(value);
    }

    if (value is Map) {
      return value.map(
            (dynamic key, dynamic item) =>
            MapEntry<String, dynamic>(
              key.toString(),
              item,
            ),
      );
    }

    return const <String, dynamic>{};
  }
}