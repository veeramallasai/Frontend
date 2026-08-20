import 'package:flutter/material.dart';

import '../../app/app_routes.dart';
import '../../core/theme/app_colors.dart';
import '../../data/models/order_model.dart';
import '../../data/repositories/order_repository.dart';
import '../../data/repositories/session_repository.dart';
import 'widgets/logout_button.dart';
import 'widgets/order_summary_card.dart';
import 'widgets/profile_header.dart';
import 'widgets/profile_menu_item.dart';
import 'widgets/profile_shopping_mode_card.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  bool _savingMode = false;
  bool _loggingOut = false;
  String _shoppingMode = 'home';
  final OrderRepository _orders = OrderRepository();

  Future<void> _logout() async {
    setState(() => _loggingOut = true);
    await SessionRepository().endSession();
    if (!mounted) return;
    Navigator.pushNamedAndRemoveUntil(
      context,
      AppRoutes.login,
      (Route<dynamic> route) => false,
    );
  }

  Future<void> _changeShoppingMode(String mode) async {
    if (_savingMode) return;
    setState(() {
      _savingMode = true;
      _shoppingMode = mode == 'shop' ? 'shop' : 'home';
    });
    _message(mode == 'shop' ? 'Shop Owner mode selected.' : 'Home Shopping mode selected.');
    setState(() => _savingMode = false);
  }

  Widget _orderOverview() {
    return StreamBuilder<List<OrderModel>>(
      stream: _orders.watchCurrentUserOrders(limit: 50),
      builder: (BuildContext context, AsyncSnapshot<List<OrderModel>> snapshot) {
        final List<OrderModel> orders = snapshot.data ?? <OrderModel>[];
        final int active = orders.where((OrderModel order) {
          return !order.isDelivered && !order.isCancelled && !order.isFailed;
        }).length;
        final double savings = orders.fold<double>(
          0,
          (double value, OrderModel order) => value + order.totalSavings,
        );
        return OrderSummaryCard(
          totalOrders: orders.length,
          activeOrders: active,
          totalSavings: savings,
          onTap: () => Navigator.pushNamed(context, AppRoutes.orders),
        );
      },
    );
  }

  void _message(String value, {bool error = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(value),
          behavior: SnackBarBehavior.floating,
          backgroundColor: error ? AppColors.error : const Color(0xFF073D24),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final session = SessionRepository().currentSession;
    final String email = session.email;
    final String displayName = email.isNotEmpty ? email.split('@').first : 'Fresh Shopper';
    final String phone = session.phoneNumber;

    return Scaffold(
      backgroundColor: const Color(0xFFF4F7F5),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              ProfileHeader(
                name: displayName,
                email: email,
                phone: phone,
                photoUrl: '',
                shoppingMode: _shoppingMode,
                isProfileComplete: true,
                onEdit: () => Navigator.pushNamed(context, AppRoutes.editProfile),
              ),
              const SizedBox(height: 14),
              ProfileShoppingModeCard(
                shoppingMode: _shoppingMode,
                updating: _savingMode,
                onSelectHome: () => _changeShoppingMode('home'),
                onSelectShop: () => _changeShoppingMode('shop'),
              ),
              const SizedBox(height: 14),
              _orderOverview(),
              const SizedBox(height: 14),
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.border),
                ),
                child: Column(
                  children: <Widget>[
                    ProfileMenuItem(
                      icon: Icons.location_on_outlined,
                      title: 'Saved Delivery Addresses',
                      subtitle: 'Manage home & business addresses',
                      onTap: () => Navigator.pushNamed(context, AppRoutes.savedAddresses),
                    ),
                    const Divider(height: 1),
                    ProfileMenuItem(
                      icon: Icons.notifications_none_rounded,
                      title: 'Notification Preferences',
                      subtitle: 'Order status alerts & WhatsApp updates',
                      onTap: () => Navigator.pushNamed(context, AppRoutes.notifications),
                    ),
                    const Divider(height: 1),
                    ProfileMenuItem(
                      icon: Icons.security_rounded,
                      title: 'Privacy & Security',
                      subtitle: 'Account verification & data protection',
                      onTap: () => Navigator.pushNamed(context, AppRoutes.privacy),
                    ),
                    const Divider(height: 1),
                    ProfileMenuItem(
                      icon: Icons.support_agent_rounded,
                      title: 'Help & Support',
                      subtitle: 'Order help, FAQs & direct contact',
                      onTap: () => Navigator.pushNamed(context, AppRoutes.support),
                    ),
                    const Divider(height: 1),
                    ProfileMenuItem(
                      icon: Icons.description_outlined,
                      title: 'Terms of Service',
                      subtitle: 'Delivery terms, refund & wholesale rules',
                      onTap: () => Navigator.pushNamed(context, AppRoutes.terms),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              LogoutButton(
                loading: _loggingOut,
                onLogout: _logout,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
