import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  bool _orderUpdates = true;
  bool _offers = true;

  @override
  void initState() {
    super.initState();
    _loadPreferences();
  }

  Future<void> _loadPreferences() async {
    final User? user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    final DocumentSnapshot<Map<String, dynamic>> snapshot =
        await FirebaseFirestore.instance.collection('users').doc(user.uid).get();
    final Map<String, dynamic> data = snapshot.data() ?? <String, dynamic>{};
    if (!mounted) return;
    setState(() {
      _orderUpdates = data['orderNotifications'] != false;
      _offers = data['offerNotifications'] != false;
    });
  }

  Future<void> _savePreference(String key, bool value) async {
    final User? user = FirebaseAuth.instance.currentUser;
    if (user == null) return;
    await FirebaseFirestore.instance.collection('users').doc(user.uid).set(
      <String, dynamic>{key: value, 'updatedAt': FieldValue.serverTimestamp()},
      SetOptions(merge: true),
    );
  }

  Stream<QuerySnapshot<Map<String, dynamic>>> _notifications() {
    final String uid = FirebaseAuth.instance.currentUser?.uid ?? '';
    if (uid.isEmpty) return const Stream<QuerySnapshot<Map<String, dynamic>>>.empty();
    return FirebaseFirestore.instance
        .collection('notifications')
        .where('userId', isEqualTo: uid)
        .limit(50)
        .snapshots();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Notifications')),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 30),
          children: <Widget>[
            _PreferencesCard(
              orderUpdates: _orderUpdates,
              offers: _offers,
              onOrderChanged: (bool value) {
                setState(() => _orderUpdates = value);
                _savePreference('orderNotifications', value);
              },
              onOffersChanged: (bool value) {
                setState(() => _offers = value);
                _savePreference('offerNotifications', value);
              },
            ),
            const SizedBox(height: 22),
            const Text(
              'RECENT UPDATES',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 9,
                letterSpacing: 1.1,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 10),
            StreamBuilder<QuerySnapshot<Map<String, dynamic>>>(
              stream: _notifications(),
              builder: (
                BuildContext context,
                AsyncSnapshot<QuerySnapshot<Map<String, dynamic>>> snapshot,
              ) {
                final List<QueryDocumentSnapshot<Map<String, dynamic>>> documents =
                    List<QueryDocumentSnapshot<Map<String, dynamic>>>.from(
                  snapshot.data?.docs ?? <QueryDocumentSnapshot<Map<String, dynamic>>>[],
                );
                documents.sort((a, b) {
                  int epoch(dynamic value) {
                    if (value is Timestamp) return value.millisecondsSinceEpoch;
                    if (value is DateTime) return value.millisecondsSinceEpoch;
                    return DateTime.tryParse(value?.toString() ?? '')
                            ?.millisecondsSinceEpoch ??
                        0;
                  }
                  return epoch(b.data()['createdAt']).compareTo(
                    epoch(a.data()['createdAt']),
                  );
                });
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Padding(
                    padding: EdgeInsets.all(28),
                    child: Center(child: CircularProgressIndicator()),
                  );
                }
                if (documents.isEmpty) return const _EmptyNotifications();
                return Column(
                  children: documents
                      .map(
                        (QueryDocumentSnapshot<Map<String, dynamic>> document) =>
                            _NotificationTile(document: document),
                      )
                      .toList(growable: false),
                );
              },
            ),
          ],
        ),
      );
}

class _PreferencesCard extends StatelessWidget {
  const _PreferencesCard({
    required this.orderUpdates,
    required this.offers,
    required this.onOrderChanged,
    required this.onOffersChanged,
  });
  final bool orderUpdates;
  final bool offers;
  final ValueChanged<bool> onOrderChanged;
  final ValueChanged<bool> onOffersChanged;

  @override
  Widget build(BuildContext context) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.border),
        ),
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(22),
          child: Column(
          children: <Widget>[
            SwitchListTile(
              value: orderUpdates,
              onChanged: onOrderChanged,
              secondary: const Icon(Icons.local_shipping_rounded, color: AppColors.primary),
              title: const Text('Order updates', style: TextStyle(fontWeight: FontWeight.w900)),
              subtitle: const Text('Packing, payment and delivery alerts'),
            ),
            const Divider(height: 1),
            SwitchListTile(
              value: offers,
              onChanged: onOffersChanged,
              secondary: const Icon(Icons.local_offer_rounded, color: AppColors.primary),
              title: const Text('Fresh deals', style: TextStyle(fontWeight: FontWeight.w900)),
              subtitle: const Text('Seasonal arrivals and member savings'),
            ),
          ],
        ),
      ),
    );
}

class _NotificationTile extends StatelessWidget {
  const _NotificationTile({required this.document});
  final QueryDocumentSnapshot<Map<String, dynamic>> document;

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> data = document.data();
    final bool read = data['isRead'] == true;
    final String title = (data['title'] ?? 'Farm To Home update').toString();
    final String message = (data['message'] ?? '').toString();
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: read ? Colors.white : const Color(0xFFEAF7EF),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: read ? AppColors.border : const Color(0xFFBDE3CC)),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(18),
        child: ListTile(
        onTap: () => document.reference.set(
          <String, dynamic>{'isRead': true, 'readAt': FieldValue.serverTimestamp()},
          SetOptions(merge: true),
        ),
        leading: Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: read ? const Color(0xFFF2F5F3) : Colors.white,
            borderRadius: BorderRadius.circular(13),
          ),
          child: const Icon(Icons.notifications_rounded, color: AppColors.primary),
        ),
        title: Text(title, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w900)),
        subtitle: Text(
          message,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: const TextStyle(fontSize: 9, height: 1.4),
        ),
        trailing: read
            ? null
            : const Icon(Icons.circle, color: AppColors.primary, size: 8),
      ),
    ),
    );
  }
}

class _EmptyNotifications extends StatelessWidget {
  const _EmptyNotifications();
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(vertical: 42, horizontal: 20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.border),
        ),
        child: const Column(
          children: <Widget>[
            Icon(Icons.notifications_none_rounded, color: AppColors.primary, size: 48),
            SizedBox(height: 12),
            Text('You are all caught up', style: TextStyle(fontWeight: FontWeight.w900)),
            SizedBox(height: 4),
            Text(
              'Order and offer updates will appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(color: AppColors.textSecondary, fontSize: 10),
            ),
          ],
        ),
      );
}
