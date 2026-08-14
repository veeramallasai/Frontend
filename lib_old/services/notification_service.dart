import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

import '../models/notification_model.dart';

class NotificationService {
  NotificationService._internal();

  static final NotificationService _instance =
  NotificationService._internal();

  factory NotificationService() => _instance;

  final FirebaseFirestore _db =
      FirebaseFirestore.instance;
  final FirebaseMessaging _fcm =
      FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin
  _localNotifications =
  FlutterLocalNotificationsPlugin();

  static const String collectionName = 'notifications';
  static const String tokenCollectionName = 'fcm_tokens';

  bool _initialized = false;

  CollectionReference<Map<String, dynamic>>
  get _notifications {
    return _db.collection(collectionName);
  }

  Future<void> initialize({
    String? userId,
  }) async {
    if (_initialized) {
      if (userId != null && userId.trim().isNotEmpty) {
        await saveFcmToken(userId);
      }
      return;
    }

    try {
      await _fcm.requestPermission(
        alert: true,
        announcement: false,
        badge: true,
        carPlay: false,
        criticalAlert: false,
        provisional: false,
        sound: true,
      );

      const AndroidInitializationSettings
      androidSettings =
      AndroidInitializationSettings(
        '@mipmap/ic_launcher',
      );

      const DarwinInitializationSettings
      iosSettings =
      DarwinInitializationSettings();

      const InitializationSettings initSettings =
      InitializationSettings(
        android: androidSettings,
        iOS: iosSettings,
      );

      await _localNotifications.initialize(
        initSettings,
      );

      const AndroidNotificationChannel channel =
      AndroidNotificationChannel(
        'high_importance_channel',
        'High Importance Notifications',
        description:
        'Farm To Home order, delivery and offer notifications.',
        importance: Importance.high,
      );

      await _localNotifications
          .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);

      FirebaseMessaging.onMessage.listen(
            (RemoteMessage message) async {
          await _showForegroundNotification(message);
        },
      );

      _fcm.onTokenRefresh.listen(
            (String token) async {
          if (userId != null &&
              userId.trim().isNotEmpty) {
            await _saveToken(
              userId: userId,
              token: token,
            );
          }
        },
      );

      if (userId != null && userId.trim().isNotEmpty) {
        await saveFcmToken(userId);
      }

      _initialized = true;
    } catch (error) {
      debugPrint(
        'Notification initialization error: $error',
      );
    }
  }

  Future<void> saveFcmToken(String userId) async {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return;
    }

    try {
      final String? token = await _fcm.getToken();

      if (token == null || token.trim().isEmpty) {
        return;
      }

      await _saveToken(
        userId: cleanUserId,
        token: token,
      );
    } catch (error) {
      debugPrint('FCM token save error: $error');
    }
  }

  Future<void> _saveToken({
    required String userId,
    required String token,
  }) async {
    await _db
        .collection(tokenCollectionName)
        .doc(userId)
        .set(
      <String, dynamic>{
        'userId': userId,
        'token': token,
        'platform': defaultTargetPlatform.name,
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  Future<String> saveNotification({
    required String userId,
    required String title,
    required String body,
    String type = 'general',
    String image = '',
    String orderId = '',
    String productId = '',
    String farmerId = '',
    String route = '',
    Map<String, dynamic> data =
    const <String, dynamic>{},
    DateTime? expiresAt,
  }) async {
    final NotificationModel notification =
    NotificationModel(
      userId: userId,
      title: title,
      body: body,
      type: type,
      image: image,
      orderId: orderId,
      productId: productId,
      farmerId: farmerId,
      route: route,
      data: data,
      read: false,
      timestamp: DateTime.now(),
      expiresAt: expiresAt,
    );

    return createNotification(notification);
  }

  Future<String> createNotification(
      NotificationModel notification,
      ) async {
    _validateNotification(notification);

    final DocumentReference<Map<String, dynamic>>
    reference = _notifications.doc();

    try {
      await reference.set(
        <String, dynamic>{
          ...notification.copyWith(
            id: reference.id,
          ).toMap(),
          'id': reference.id,
          'timestamp': FieldValue.serverTimestamp(),
        },
      );

      return reference.id;
    } on FirebaseException catch (error) {
      throw NotificationServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Stream<List<NotificationModel>>
  getUserNotifications(
      String userId, {
        int limit = 300,
        bool includeArchived = false,
      }) {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return Stream<List<NotificationModel>>.value(
        const <NotificationModel>[],
      );
    }

    return _notifications
        .where('userId', isEqualTo: cleanUserId)
        .snapshots()
        .map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<NotificationModel> items =
        snapshot.docs
            .map(
              (
              QueryDocumentSnapshot<
                  Map<String, dynamic>>
              document,
              ) {
            return NotificationModel.fromMap(
              document.id,
              document.data(),
            );
          },
        )
            .where(
              (NotificationModel item) {
            if (!includeArchived &&
                item.archived) {
              return false;
            }

            return !item.isExpired;
          },
        )
            .toList();

        items.sort(
              (
              NotificationModel first,
              NotificationModel second,
              ) {
            return second.timestamp.compareTo(
              first.timestamp,
            );
          },
        );

        return items
            .take(limit.clamp(1, 500))
            .toList();
      },
    );
  }

  Stream<int> unreadCount(String userId) {
    return getUserNotifications(userId).map(
          (List<NotificationModel> items) {
        return items
            .where(
              (NotificationModel item) =>
          item.isUnread,
        )
            .length;
      },
    );
  }

  Stream<List<NotificationModel>>
  watchNotificationsByType({
    required String userId,
    required String type,
  }) {
    final String normalizedType = type
        .trim()
        .toLowerCase()
        .replaceAll('-', '_')
        .replaceAll(' ', '_');

    return getUserNotifications(userId).map(
          (List<NotificationModel> items) {
        if (normalizedType.isEmpty ||
            normalizedType == 'all') {
          return items;
        }

        return items
            .where(
              (NotificationModel item) =>
          item.normalizedType ==
              normalizedType,
        )
            .toList();
      },
    );
  }

  Future<void> markAsRead(String id) async {
    final String cleanId = id.trim();

    if (cleanId.isEmpty) {
      return;
    }

    try {
      await _notifications.doc(cleanId).set(
        <String, dynamic>{
          'read': true,
          'readAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    } on FirebaseException catch (error) {
      throw NotificationServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<void> markAsUnread(String id) async {
    final String cleanId = id.trim();

    if (cleanId.isEmpty) {
      return;
    }

    await _notifications.doc(cleanId).set(
      <String, dynamic>{
        'read': false,
        'readAt': null,
      },
      SetOptions(merge: true),
    );
  }

  Future<void> markAllAsRead(String userId) async {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return;
    }

    try {
      final QuerySnapshot<Map<String, dynamic>>
      snapshot = await _notifications
          .where(
        'userId',
        isEqualTo: cleanUserId,
      )
          .where(
        'read',
        isEqualTo: false,
      )
          .get();

      if (snapshot.docs.isEmpty) {
        return;
      }

      WriteBatch batch = _db.batch();
      int operationCount = 0;

      for (final QueryDocumentSnapshot<
          Map<String, dynamic>>
      document in snapshot.docs) {
        batch.set(
          document.reference,
          <String, dynamic>{
            'read': true,
            'readAt':
            FieldValue.serverTimestamp(),
          },
          SetOptions(merge: true),
        );

        operationCount++;

        if (operationCount == 450) {
          await batch.commit();
          batch = _db.batch();
          operationCount = 0;
        }
      }

      if (operationCount > 0) {
        await batch.commit();
      }
    } on FirebaseException catch (error) {
      throw NotificationServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<void> deleteNotification(String id) async {
    final String cleanId = id.trim();

    if (cleanId.isEmpty) {
      return;
    }

    try {
      await _notifications.doc(cleanId).delete();
    } on FirebaseException catch (error) {
      throw NotificationServiceException(
        message: _firebaseMessage(error),
        code: error.code,
        originalError: error,
      );
    }
  }

  Future<void> archiveNotification(String id) async {
    final String cleanId = id.trim();

    if (cleanId.isEmpty) {
      return;
    }

    await _notifications.doc(cleanId).set(
      <String, dynamic>{
        'archived': true,
        'archivedAt':
        FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  Future<void> clearNotifications(
      String userId,
      ) async {
    final String cleanUserId = userId.trim();

    if (cleanUserId.isEmpty) {
      return;
    }

    final QuerySnapshot<Map<String, dynamic>> snapshot =
    await _notifications
        .where(
      'userId',
      isEqualTo: cleanUserId,
    )
        .get();

    if (snapshot.docs.isEmpty) {
      return;
    }

    WriteBatch batch = _db.batch();
    int operationCount = 0;

    for (final QueryDocumentSnapshot<
        Map<String, dynamic>>
    document in snapshot.docs) {
      batch.delete(document.reference);
      operationCount++;

      if (operationCount == 450) {
        await batch.commit();
        batch = _db.batch();
        operationCount = 0;
      }
    }

    if (operationCount > 0) {
      await batch.commit();
    }
  }

  Future<void> _showForegroundNotification(
      RemoteMessage message,
      ) async {
    final RemoteNotification? notification =
        message.notification;

    if (notification == null) {
      return;
    }

    const AndroidNotificationDetails
    androidDetails =
    AndroidNotificationDetails(
      'high_importance_channel',
      'High Importance Notifications',
      channelDescription:
      'Farm To Home order, delivery and offer notifications.',
      importance: Importance.high,
      priority: Priority.high,
      icon: '@mipmap/ic_launcher',
    );

    const DarwinNotificationDetails iosDetails =
    DarwinNotificationDetails();

    const NotificationDetails details =
    NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );

    await _localNotifications.show(
      notification.hashCode,
      notification.title ?? 'Farm To Home',
      notification.body ?? '',
      details,
      payload: message.data['route']?.toString(),
    );
  }

  void _validateNotification(
      NotificationModel notification,
      ) {
    if (notification.userId.trim().isEmpty) {
      throw const NotificationServiceException(
        message: 'User ID is required.',
        code: 'missing-user-id',
      );
    }

    if (notification.title.trim().isEmpty) {
      throw const NotificationServiceException(
        message: 'Notification title is required.',
        code: 'missing-title',
      );
    }

    if (notification.body.trim().isEmpty) {
      throw const NotificationServiceException(
        message: 'Notification body is required.',
        code: 'missing-body',
      );
    }
  }

  String _firebaseMessage(FirebaseException error) {
    switch (error.code) {
      case 'permission-denied':
        return 'Firestore permission denied. Check notification rules.';
      case 'unavailable':
        return 'Notification service is unavailable. Check your internet.';
      case 'deadline-exceeded':
        return 'Notification request timed out. Please try again.';
      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Unable to complete notification operation.';
    }
  }
}

class NotificationServiceException implements Exception {
  final String message;
  final String code;
  final Object? originalError;

  const NotificationServiceException({
    required this.message,
    this.code = 'notification-service-error',
    this.originalError,
  });

  @override
  String toString() {
    return 'NotificationServiceException(code: $code, message: $message)';
  }
}