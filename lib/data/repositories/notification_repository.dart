import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/notification_model.dart';

class NotificationRepository {
  NotificationRepository({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<List<NotificationModel>> watchNotifications({int limit = 50}) async* {
    final List<NotificationModel> list = await getNotifications();
    yield List<NotificationModel>.unmodifiable(list);
  }

  Future<List<NotificationModel>> getNotifications() async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getNotifications();
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        List<dynamic> items = <dynamic>[];
        if (raw is List) {
          items = raw;
        } else if (raw is Map && raw['content'] is List) {
          items = raw['content'] as List;
        }
        if (items.isNotEmpty) {
          return items
              .whereType<Map<String, dynamic>>()
              .map((Map<String, dynamic> map) => NotificationModel.fromMap(map))
              .toList(growable: false);
        }
      }
    } catch (_) {}

    return <NotificationModel>[];
  }

  Stream<int> watchUnreadCount() => watchNotifications().map(
      (List<NotificationModel> values) => values.where((NotificationModel n) => !n.isRead).length);

  Future<void> markAsRead(String notificationId) async {
    try {
      await _apiService.markNotificationAsRead(notificationId);
    } catch (_) {}
  }

  Future<void> markAllAsRead() async {
    try {
      await _apiService.markAllNotificationsAsRead();
    } catch (_) {}
  }

  Future<void> deleteNotification(String notificationId) async {
    try {
      await _apiService.deleteNotification(notificationId);
    } catch (_) {}
  }
}
