import 'dart:async';

import 'package:flutter/foundation.dart';

import '../data/models/notification_model.dart';
import '../data/repositories/notification_repository.dart';

class NotificationProvider extends ChangeNotifier {
  NotificationProvider({NotificationRepository? repository})
      : _repository = repository ?? NotificationRepository();

  final NotificationRepository _repository;
  StreamSubscription<List<NotificationModel>>? _subscription;
  List<NotificationModel> _notifications = <NotificationModel>[];
  bool _isLoading = false;
  String? _errorMessage;
  bool _disposed = false;

  List<NotificationModel> get notifications =>
      List<NotificationModel>.unmodifiable(_notifications);
  int get unreadCount =>
      _notifications.where((NotificationModel item) => !item.isRead).length;
  bool get isLoading => _isLoading;
  String? get errorMessage => _errorMessage;

  void listen() {
    _subscription?.cancel();
    _isLoading = true;
    _notify();
    try {
      _subscription = _repository.watchNotifications().listen(
        (List<NotificationModel> values) {
          _notifications = values;
          _isLoading = false;
          _errorMessage = null;
          _notify();
        },
        onError: (Object error) {
          _isLoading = false;
          _errorMessage = error.toString();
          _notify();
        },
      );
    } catch (error) {
      _isLoading = false;
      _errorMessage = error.toString();
      _notify();
    }
  }

  Future<void> markAsRead(String id) => _repository.markAsRead(id);
  Future<void> markAllAsRead() => _repository.markAllAsRead();
  Future<void> delete(String id) => _repository.deleteNotification(id);

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  @override
  void dispose() {
    _disposed = true;
    _subscription?.cancel();
    super.dispose();
  }
}
