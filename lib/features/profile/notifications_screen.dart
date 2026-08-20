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
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Notifications')),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 30),
          children: <Widget>[
            _PreferencesCard(
              orderUpdates: _orderUpdates,
              offers: _offers,
              onOrderChanged: (bool value) => setState(() => _orderUpdates = value),
              onOffersChanged: (bool value) => setState(() => _offers = value),
            ),
            const SizedBox(height: 22),
            const Text(
              'RECENT UPDATES',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 10,
                letterSpacing: 1.1,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 10),
            const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text('No new notifications', style: TextStyle(color: AppColors.textSecondary)),
              ),
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
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(
          children: <Widget>[
            SwitchListTile(
              value: orderUpdates,
              title: const Text('Order Status Updates', style: TextStyle(fontWeight: FontWeight.w700)),
              subtitle: const Text('Get real-time delivery and dispatch alerts'),
              onChanged: onOrderChanged,
            ),
            const Divider(),
            SwitchListTile(
              value: offers,
              title: const Text('Promotions & Discounts', style: TextStyle(fontWeight: FontWeight.w700)),
              subtitle: const Text('Receive notifications for special harvest sales'),
              onChanged: onOffersChanged,
            ),
          ],
        ),
      );
}
