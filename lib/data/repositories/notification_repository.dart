import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/notification_model.dart';

class NotificationRepository {
  NotificationRepository({FirebaseFirestore? firestore, FirebaseAuth? auth})
      : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  CollectionReference<Map<String, dynamic>> _notifications(String userId) =>
      _firestore.collection('users').doc(userId).collection('notifications');

  Stream<List<NotificationModel>> watchNotifications({int limit = 50}) {
    final String userId = _requireUserId();
    return _notifications(userId).limit(limit).snapshots().map(
      (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<NotificationModel> values = snapshot.docs
            .map(NotificationModel.fromDocument)
            .toList(growable: true)
          ..sort((NotificationModel a, NotificationModel b) =>
              (b.createdAt ?? DateTime(1970)).compareTo(a.createdAt ?? DateTime(1970)));
        return List<NotificationModel>.unmodifiable(values);
      },
    );
  }

  Stream<int> watchUnreadCount() => watchNotifications().map(
      (List<NotificationModel> values) => values.where((NotificationModel n) => !n.isRead).length);

  Future<void> markAsRead(String notificationId) async {
    await _notifications(_requireUserId()).doc(notificationId.trim()).set(
      <String, dynamic>{'isRead': true},
      SetOptions(merge: true),
    );
  }

  Future<void> markAllAsRead() async {
    final String userId = _requireUserId();
    final QuerySnapshot<Map<String, dynamic>> snapshot = await _notifications(userId).get();
    final WriteBatch batch = _firestore.batch();
    for (final QueryDocumentSnapshot<Map<String, dynamic>> doc in snapshot.docs) {
      batch.set(doc.reference, <String, dynamic>{'isRead': true}, SetOptions(merge: true));
    }
    await batch.commit();
  }

  Future<void> deleteNotification(String notificationId) =>
      _notifications(_requireUserId()).doc(notificationId.trim()).delete();

  String _requireUserId() {
    final String id = _auth.currentUser?.uid.trim() ?? '';
    if (id.isEmpty) throw StateError('Please login to continue.');
    return id;
  }
}
