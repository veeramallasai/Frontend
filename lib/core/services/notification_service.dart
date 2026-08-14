import 'package:firebase_messaging/firebase_messaging.dart';

class NotificationService {
  NotificationService({FirebaseMessaging? messaging})
      : _messaging = messaging ?? FirebaseMessaging.instance;

  final FirebaseMessaging _messaging;

  Stream<RemoteMessage> get foregroundMessages =>
      FirebaseMessaging.onMessage;

  Stream<RemoteMessage> get openedMessages =>
      FirebaseMessaging.onMessageOpenedApp;

  Stream<String> get tokenRefreshes => _messaging.onTokenRefresh;

  Future<NotificationSettings> requestPermission({
    bool sound = true,
    bool badge = true,
    bool alert = true,
  }) => _messaging.requestPermission(
        alert: alert,
        badge: badge,
        sound: sound,
        provisional: false,
      );

  Future<String?> getToken({String? vapidKey}) =>
      _messaging.getToken(vapidKey: vapidKey);

  Future<RemoteMessage?> getInitialMessage() =>
      _messaging.getInitialMessage();

  Future<void> subscribeToTopic(String topic) =>
      _messaging.subscribeToTopic(_cleanTopic(topic));

  Future<void> unsubscribeFromTopic(String topic) =>
      _messaging.unsubscribeFromTopic(_cleanTopic(topic));

  Future<void> deleteToken() => _messaging.deleteToken();

  String _cleanTopic(String value) {
    final String topic = value
        .trim()
        .toLowerCase()
        .replaceAll(RegExp(r'[^a-z0-9-_.~%]+'), '-');
    if (topic.isEmpty) {
      throw ArgumentError.value(value, 'topic', 'Topic cannot be empty.');
    }
    return topic;
  }
}
