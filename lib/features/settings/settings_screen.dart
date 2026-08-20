import 'package:flutter/material.dart';

import '../../app/app_routes.dart';
import '../../core/theme/app_colors.dart';
import 'widgets/language_selector.dart';
import 'widgets/notification_toggle.dart';
import 'widgets/theme_selector.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _orderUpdates = true;
  bool _offers = true;
  String _language = 'English';
  String _theme = 'fresh';

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 10, 16, 32),
        children: <Widget>[
          const _SettingsHero(),
          const SizedBox(height: 20),
          const _SectionTitle('Notifications'),
          _SettingsCard(
            children: <Widget>[
              NotificationToggle(
                icon: Icons.notifications_active_rounded,
                title: 'Order updates',
                subtitle: 'Packing, delivery and payment status',
                value: _orderUpdates,
                onChanged: (bool value) => setState(() => _orderUpdates = value),
              ),
              const Divider(height: 1),
              NotificationToggle(
                icon: Icons.local_offer_rounded,
                title: 'Offers & fresh deals',
                subtitle: 'Seasonal arrivals and member savings',
                value: _offers,
                onChanged: (bool value) => setState(() => _offers = value),
              ),
            ],
          ),
          const SizedBox(height: 18),
          const _SectionTitle('App accent'),
          _SettingsCard(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.all(16),
                child: ThemeSelector(
                  selectedTheme: _theme,
                  onSelected: (String theme) => setState(() => _theme = theme),
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          const _SectionTitle('Language'),
          _SettingsCard(
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.all(16),
                child: LanguageSelector(
                  selectedLanguage: _language,
                  onSelected: (String lang) => setState(() => _language = lang),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          OutlinedButton.icon(
            onPressed: () => Navigator.pushNamed(context, AppRoutes.support),
            icon: const Icon(Icons.help_outline_rounded),
            label: const Text('NEED HELP WITH YOUR ACCOUNT?'),
            style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(52)),
          ),
        ],
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);
  final String title;

  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.only(left: 4, bottom: 8),
        child: Text(
          title.toUpperCase(),
          style: const TextStyle(
            color: AppColors.textSecondary,
            fontSize: 10,
            letterSpacing: 1.1,
            fontWeight: FontWeight.w900,
          ),
        ),
      );
}

class _SettingsCard extends StatelessWidget {
  const _SettingsCard({required this.children});
  final List<Widget> children;

  @override
  Widget build(BuildContext context) => Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: AppColors.border),
        ),
        child: Column(children: children),
      );
}

class _SettingsHero extends StatelessWidget {
  const _SettingsHero();

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.primaryDark,
          borderRadius: BorderRadius.circular(24),
        ),
        child: const Row(
          children: <Widget>[
            Icon(Icons.tune_rounded, color: Colors.white, size: 36),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'App Preferences',
                    style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.w900),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Customize notification alerts, language and appearance.',
                    style: TextStyle(color: Colors.white70, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
