import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../auth/login_screen.dart';
import '../drawer/about_screen.dart';
import '../drawer/help_screen.dart';
import '../drawer/notifications_screen.dart';
import '../drawer/settings_screen.dart';
import '../drawer/wishlist_screen.dart';
import '../orders/orders_screen.dart';
import 'address_management_screen.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() =>
      _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthService _authService = AuthService();

  bool _isSigningOut = false;
  bool _isEditingProfile = false;

  User? get _user => FirebaseAuth.instance.currentUser;

  String get _displayName {
    final String? name = _user?.displayName?.trim();

    if (name != null && name.isNotEmpty) {
      return name;
    }

    final String? emailName =
    _user?.email?.split('@').first.trim();

    if (emailName != null && emailName.isNotEmpty) {
      return emailName;
    }

    final String? phone = _user?.phoneNumber?.trim();

    if (phone != null && phone.isNotEmpty) {
      return 'Farm Member';
    }

    return 'Farm To Home Member';
  }

  String get _email {
    final String? value = _user?.email?.trim();

    if (value != null && value.isNotEmpty) {
      return value;
    }

    return 'Email not added';
  }

  String get _phone {
    final String? value = _user?.phoneNumber?.trim();

    if (value != null && value.isNotEmpty) {
      return value;
    }

    return 'Phone number not added';
  }

  String get _contact {
    if (_email != 'Email not added') {
      return _email;
    }

    if (_phone != 'Phone number not added') {
      return _phone;
    }

    return 'Your account is ready';
  }

  String get _initial {
    final String name = _displayName.trim();

    if (name.isEmpty) {
      return 'F';
    }

    return name[0].toUpperCase();
  }

  int get _rewardPoints {
    final String uid = _user?.uid ?? '';

    if (uid.isEmpty) {
      return 0;
    }

    return 120 + (uid.codeUnits.fold<int>(
      0,
          (int total, int value) => total + value,
    ) %
        380);
  }

  int get _orderCount {
    final String uid = _user?.uid ?? '';

    if (uid.isEmpty) {
      return 0;
    }

    return 2 +
        (uid.codeUnits.fold<int>(
          0,
              (int total, int value) => total + value,
        ) %
            18);
  }

  int get _wishlistCount {
    final String uid = _user?.uid ?? '';

    if (uid.isEmpty) {
      return 0;
    }

    return 3 +
        (uid.codeUnits.fold<int>(
          0,
              (int total, int value) => total + value,
        ) %
            12);
  }

  int get _addressCount {
    return 2;
  }

  String get _membershipLevel {
    if (_rewardPoints >= 400) {
      return 'Platinum Member';
    }

    if (_rewardPoints >= 250) {
      return 'Gold Member';
    }

    return 'Green Member';
  }

  Future<void> _signOut() async {
    final bool? shouldSignOut =
    await showDialog<bool>(
      context: context,
      builder: (
          BuildContext dialogContext,
          ) {
        return AlertDialog(
          title: Text(
            'Log out?',
            style: GoogleFonts.lexend(
              fontWeight: FontWeight.w700,
            ),
          ),
          content: Text(
            'You can sign in again anytime to continue shopping.',
            style: GoogleFonts.lato(),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                  false,
                );
              },
              child: const Text('Cancel'),
            ),
            FilledButton(
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.errorRed,
              ),
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                  true,
                );
              },
              child: const Text('Log out'),
            ),
          ],
        );
      },
    );

    if (shouldSignOut != true || !mounted) {
      return;
    }

    setState(() {
      _isSigningOut = true;
    });

    try {
      await _authService.signOut();

      if (!mounted) {
        return;
      }

      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute<void>(
          builder: (_) => const LoginScreen(),
        ),
            (Route<dynamic> route) => false,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSigningOut = false;
        });
      }
    }
  }

  Future<void> _editProfile() async {
    final User? user = _user;

    if (user == null || _isEditingProfile) {
      return;
    }

    final TextEditingController nameController =
    TextEditingController(
      text: _displayName,
    );

    final bool? shouldSave =
    await showDialog<bool>(
      context: context,
      builder: (
          BuildContext dialogContext,
          ) {
        return AlertDialog(
          title: Text(
            'Edit Profile',
            style: GoogleFonts.lexend(
              fontWeight: FontWeight.w800,
            ),
          ),
          content: TextField(
            controller: nameController,
            textCapitalization:
            TextCapitalization.words,
            decoration: const InputDecoration(
              labelText: 'Full name',
              prefixIcon:
              Icon(Icons.person_outline_rounded),
            ),
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                  false,
                );
              },
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                  true,
                );
              },
              child: const Text('Save'),
            ),
          ],
        );
      },
    );

    if (shouldSave != true) {
      nameController.dispose();
      return;
    }

    final String newName =
    nameController.text.trim();
    nameController.dispose();

    if (newName.isEmpty) {
      _showMessage(
        'Please enter a valid name.',
        isError: true,
      );
      return;
    }

    setState(() {
      _isEditingProfile = true;
    });

    try {
      await user.updateDisplayName(newName);
      await user.reload();

      if (!mounted) {
        return;
      }

      setState(() {});

      _showMessage(
        'Profile updated successfully.',
      );
    } on FirebaseAuthException catch (error) {
      _showMessage(
        error.message ??
            'Unable to update profile.',
        isError: true,
      );
    } catch (_) {
      _showMessage(
        'Unable to update profile.',
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isEditingProfile = false;
        });
      }
    }
  }

  Future<void> _copyProfileId() async {
    final String profileId =
        _user?.uid.trim() ?? '';

    if (profileId.isEmpty) {
      _showMessage(
        'Profile ID is unavailable.',
        isError: true,
      );
      return;
    }

    await Clipboard.setData(
      ClipboardData(text: profileId),
    );

    _showMessage('Profile ID copied.');
  }

  void _showMessage(
      String message, {
        bool isError = false,
      }) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: GoogleFonts.lato(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          backgroundColor: isError
              ? AppColors.errorRed
              : AppColors.primaryGreen,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(13),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Text(
          'My Profile',
          style: GoogleFonts.lexend(
            color: AppColors.darkText,
            fontWeight: FontWeight.w800,
          ),
        ),
        centerTitle: true,
        actions: <Widget>[
          IconButton(
            icon: const Icon(
              Icons.help_outline_rounded,
              color: AppColors.primaryGreen,
            ),
            tooltip: 'Need help?',
            onPressed: () {
              _open(const HelpScreen());
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primaryGreen,
        onRefresh: () async {
          await _user?.reload();

          if (mounted) {
            setState(() {});
          }
        },
        child: ListView(
          physics:
          const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.fromLTRB(
            18,
            14,
            18,
            36,
          ),
          children: <Widget>[
            FadeInDown(
              duration:
              const Duration(milliseconds: 400),
              child: _buildProfileCard(),
            ),
            const SizedBox(height: 16),
            FadeInUp(
              duration:
              const Duration(milliseconds: 430),
              child: _buildQuickStats(),
            ),
            const SizedBox(height: 24),
            _sectionTitle('Shopping'),
            const SizedBox(height: 10),
            _settingsGroup(
              <_ProfileAction>[
                _ProfileAction(
                  icon:
                  Icons.receipt_long_outlined,
                  title: 'My orders',
                  subtitle:
                  'Track and view your past orders',
                  badge: '$_orderCount',
                  onTap: () {
                    _open(const OrdersScreen());
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.favorite_border_rounded,
                  title: 'Wishlist',
                  subtitle:
                  'Your saved fresh picks',
                  badge: '$_wishlistCount',
                  onTap: () {
                    _open(const WishlistScreen());
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.location_on_outlined,
                  title: 'Saved addresses',
                  subtitle:
                  'Manage delivery locations',
                  badge: '$_addressCount',
                  onTap: () {
                    _open(
                      const AddressManagementScreen(),
                    );
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.notifications_none_rounded,
                  title: 'Notifications',
                  subtitle:
                  'Orders, offers and farmer updates',
                  onTap: () {
                    _open(
                      const NotificationsScreen(),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),
            _sectionTitle(
              'Wallet & Payments',
            ),
            const SizedBox(height: 10),
            _settingsGroup(
              <_ProfileAction>[
                _ProfileAction(
                  icon: Icons
                      .account_balance_wallet_outlined,
                  title: 'Farm Wallet',
                  subtitle:
                  'Balance, cashback and transactions',
                  badge: '₹0',
                  onTap: () {
                    _open(
                      const _ProfileFeatureScreen(
                        title: 'Farm Wallet',
                        icon: Icons
                            .account_balance_wallet_outlined,
                        description:
                        'Wallet balance, cashback, refunds and transaction history will be managed here.',
                      ),
                    );
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.payment_outlined,
                  title: 'Payment methods',
                  subtitle:
                  'Saved UPI, cards and payment preferences',
                  onTap: () {
                    _open(
                      const _ProfileFeatureScreen(
                        title:
                        'Payment Methods',
                        icon:
                        Icons.payment_outlined,
                        description:
                        'Add and manage UPI IDs, debit cards, credit cards and payment preferences.',
                      ),
                    );
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.card_giftcard_outlined,
                  title: 'Gift cards',
                  subtitle:
                  'Buy, claim and manage gift cards',
                  onTap: () {
                    _open(
                      const _ProfileFeatureScreen(
                        title: 'Gift Cards',
                        icon: Icons
                            .card_giftcard_outlined,
                        description:
                        'Gift card purchase, redemption and history will appear here.',
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),
            _sectionTitle('Rewards'),
            const SizedBox(height: 10),
            _buildRewardsCard(),
            const SizedBox(height: 12),
            _settingsGroup(
              <_ProfileAction>[
                _ProfileAction(
                  icon:
                  Icons.local_offer_outlined,
                  title: 'Coupons',
                  subtitle:
                  'Available offers and discounts',
                  badge: '3',
                  onTap: () {
                    _open(
                      const _ProfileFeatureScreen(
                        title: 'Coupons',
                        icon:
                        Icons.local_offer_outlined,
                        description:
                        'Available coupons, minimum order conditions and discount details will be shown here.',
                      ),
                    );
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.people_outline_rounded,
                  title: 'Invite friends',
                  subtitle:
                  'Earn rewards through referrals',
                  onTap: () {
                    _open(
                      const _ProfileFeatureScreen(
                        title: 'Invite Friends',
                        icon:
                        Icons.people_outline_rounded,
                        description:
                        'Share your referral link and earn Farm Rewards when friends place their first order.',
                      ),
                    );
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.agriculture_outlined,
                  title: 'Followed farmers',
                  subtitle:
                  'Farms you follow and support',
                  onTap: () {
                    _open(
                      const _ProfileFeatureScreen(
                        title:
                        'Followed Farmers',
                        icon:
                        Icons.agriculture_outlined,
                        description:
                        'Your followed farms, new harvest alerts and farmer recommendations will appear here.',
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),
            _sectionTitle(
              'Account & Preferences',
            ),
            const SizedBox(height: 10),
            _settingsGroup(
              <_ProfileAction>[
                _ProfileAction(
                  icon:
                  Icons.edit_outlined,
                  title: 'Edit profile',
                  subtitle:
                  'Update your name and account details',
                  onTap: _editProfile,
                ),
                _ProfileAction(
                  icon:
                  Icons.settings_outlined,
                  title: 'Settings',
                  subtitle:
                  'Theme, language and preferences',
                  onTap: () {
                    _open(
                      const SettingsScreen(),
                    );
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.privacy_tip_outlined,
                  title: 'Privacy & security',
                  subtitle:
                  'Permissions, account security and data',
                  onTap: () {
                    _open(
                      const _ProfileFeatureScreen(
                        title:
                        'Privacy & Security',
                        icon:
                        Icons.privacy_tip_outlined,
                        description:
                        'Manage permissions, account security, connected devices and personal data.',
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 24),
            _sectionTitle('About & Support'),
            const SizedBox(height: 10),
            _settingsGroup(
              <_ProfileAction>[
                _ProfileAction(
                  icon:
                  Icons.help_outline_rounded,
                  title: 'Help & support',
                  subtitle:
                  'FAQs and customer support',
                  onTap: () {
                    _open(const HelpScreen());
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.info_outline_rounded,
                  title: 'About us',
                  subtitle:
                  'Our story and mission',
                  onTap: () {
                    _open(const AboutScreen());
                  },
                ),
                _ProfileAction(
                  icon:
                  Icons.description_outlined,
                  title: 'GST details',
                  subtitle:
                  'Tax and invoice information',
                  onTap: () {
                    _open(
                      const _ProfileFeatureScreen(
                        title: 'GST Details',
                        icon:
                        Icons.description_outlined,
                        description:
                        'GST information, invoice preferences and business tax details will appear here.',
                      ),
                    );
                  },
                ),
              ],
            ),
            const SizedBox(height: 30),
            OutlinedButton.icon(
              onPressed:
              _isSigningOut ? null : _signOut,
              icon: _isSigningOut
                  ? const SizedBox(
                width: 18,
                height: 18,
                child:
                CircularProgressIndicator(
                  strokeWidth: 2,
                ),
              )
                  : const Icon(
                Icons.logout_rounded,
              ),
              label: Text(
                _isSigningOut
                    ? 'Logging out...'
                    : 'Log out',
                style: GoogleFonts.lato(
                  fontWeight: FontWeight.w700,
                ),
              ),
              style: OutlinedButton.styleFrom(
                minimumSize:
                const Size.fromHeight(52),
                foregroundColor:
                AppColors.errorRed,
                side: const BorderSide(
                  color: AppColors.errorRed,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius:
                  BorderRadius.circular(16),
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              'Farm To Home v1.0.0',
              textAlign: TextAlign.center,
              style: GoogleFonts.lato(
                color: Colors.grey.shade500,
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileCard() {
    final String? photoUrl =
    _user?.photoURL?.trim();

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(25),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x401B5E20),
            blurRadius: 20,
            offset: Offset(0, 9),
          ),
        ],
      ),
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              Stack(
                clipBehavior: Clip.none,
                children: <Widget>[
                  CircleAvatar(
                    radius: 38,
                    backgroundColor: Colors.white24,
                    foregroundImage:
                    photoUrl == null ||
                        photoUrl.isEmpty
                        ? null
                        : NetworkImage(photoUrl),
                    onForegroundImageError:
                        (_, __) {},
                    child: Text(
                      _initial,
                      style: GoogleFonts.lexend(
                        color: Colors.white,
                        fontSize: 29,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  Positioned(
                    right: -2,
                    bottom: -2,
                    child: Container(
                      width: 25,
                      height: 25,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                        border: Border.all(
                          color:
                          AppColors.primaryGreen,
                          width: 2,
                        ),
                      ),
                      child: const Icon(
                        Icons.verified_rounded,
                        color:
                        AppColors.primaryGreen,
                        size: 17,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      _displayName,
                      maxLines: 1,
                      overflow:
                      TextOverflow.ellipsis,
                      style: GoogleFonts.lexend(
                        color: Colors.white,
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      _contact,
                      maxLines: 1,
                      overflow:
                      TextOverflow.ellipsis,
                      style: GoogleFonts.lato(
                        color: Colors.white70,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 11),
                    Wrap(
                      spacing: 7,
                      runSpacing: 7,
                      children: <Widget>[
                        _profileBadge(
                          Icons.workspace_premium_rounded,
                          _membershipLevel,
                        ),
                        _profileBadge(
                          Icons.verified_user_outlined,
                          'Verified',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              IconButton.filled(
                tooltip: 'Edit profile',
                onPressed:
                _isEditingProfile
                    ? null
                    : _editProfile,
                style: IconButton.styleFrom(
                  backgroundColor:
                  Colors.white.withValues(
                    alpha: 0.18,
                  ),
                  foregroundColor: Colors.white,
                ),
                icon: _isEditingProfile
                    ? const SizedBox(
                  width: 18,
                  height: 18,
                  child:
                  CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
                    : const Icon(
                  Icons.edit_rounded,
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              color: Colors.white.withValues(
                alpha: 0.14,
              ),
              borderRadius: BorderRadius.circular(15),
            ),
            child: Row(
              children: <Widget>[
                const Icon(
                  Icons.badge_outlined,
                  color: Colors.white,
                  size: 21,
                ),
                const SizedBox(width: 9),
                Expanded(
                  child: Text(
                    'Profile ID: ${_shortProfileId()}',
                    maxLines: 1,
                    overflow:
                    TextOverflow.ellipsis,
                    style: GoogleFonts.lato(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                IconButton(
                  tooltip: 'Copy Profile ID',
                  onPressed: _copyProfileId,
                  icon: const Icon(
                    Icons.copy_rounded,
                    color: Colors.white,
                    size: 19,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickStats() {
    return LayoutBuilder(
      builder: (
          BuildContext context,
          BoxConstraints constraints,
          ) {
        final int columns =
        constraints.maxWidth >= 700 ? 4 : 2;

        return GridView.count(
          shrinkWrap: true,
          physics:
          const NeverScrollableScrollPhysics(),
          crossAxisCount: columns,
          crossAxisSpacing: 11,
          mainAxisSpacing: 11,
          childAspectRatio:
          constraints.maxWidth >= 700
              ? 1.55
              : 1.3,
          children: <Widget>[
            _statCard(
              Icons.receipt_long_outlined,
              '$_orderCount',
              'Orders',
            ),
            _statCard(
              Icons.favorite_border_rounded,
              '$_wishlistCount',
              'Wishlist',
            ),
            _statCard(
              Icons.location_on_outlined,
              '$_addressCount',
              'Addresses',
            ),
            _statCard(
              Icons.stars_rounded,
              '$_rewardPoints',
              'Reward Points',
            ),
          ],
        );
      },
    );
  }

  Widget _buildRewardsCard() {
    final double progress =
    (_rewardPoints / 500).clamp(0, 1);

    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            Color(0xFFFFF8E1),
            AppColors.lightMint,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFE1E9E2),
        ),
      ),
      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                width: 49,
                height: 49,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                  BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.stars_rounded,
                  color: AppColors.goldAmber,
                  size: 29,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      '$_rewardPoints Farm Rewards',
                      style: GoogleFonts.lexend(
                        color: AppColors.darkText,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      _membershipLevel,
                      style: GoogleFonts.lato(
                        color:
                        AppColors.primaryGreen,
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 9,
              backgroundColor: Colors.white,
              valueColor:
              const AlwaysStoppedAnimation<Color>(
                AppColors.primaryGreen,
              ),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${500 - _rewardPoints} more points to unlock the next membership benefit.',
            style: GoogleFonts.lato(
              color: Colors.grey.shade700,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }

  Widget _profileBadge(
      IconData icon,
      String label,
      ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: Colors.white.withValues(
          alpha: 0.16,
        ),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(
            icon,
            color: Colors.white,
            size: 14,
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.lato(
              color: Colors.white,
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _statCard(
      IconData icon,
      String value,
      String label,
      ) {
    return Container(
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: const Color(0xFFE2EAE3),
        ),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 12,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        mainAxisAlignment:
        MainAxisAlignment.center,
        children: <Widget>[
          Icon(
            icon,
            color: AppColors.primaryGreen,
            size: 25,
          ),
          const SizedBox(height: 7),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.lexend(
              color: AppColors.darkText,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.lato(
              color: Colors.grey.shade600,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.lexend(
        color: AppColors.darkText,
        fontSize: 17,
        fontWeight: FontWeight.w800,
      ),
    );
  }

  Widget _settingsGroup(
      List<_ProfileAction> actions,
      ) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(19),
        border: Border.all(
          color: const Color(0xFFE2EAE3),
        ),
      ),
      child: Column(
        children: <Widget>[
          for (int index = 0;
          index < actions.length;
          index++) ...<Widget>[
            _actionTile(actions[index]),
            if (index != actions.length - 1)
              const Padding(
                padding:
                EdgeInsets.only(left: 68),
                child: Divider(height: 1),
              ),
          ],
        ],
      ),
    );
  }

  Widget _actionTile(_ProfileAction action) {
    return ListTile(
      contentPadding:
      const EdgeInsets.symmetric(
        horizontal: 15,
        vertical: 5,
      ),
      leading: Container(
        width: 43,
        height: 43,
        decoration: BoxDecoration(
          color: AppColors.lightCream,
          borderRadius: BorderRadius.circular(13),
        ),
        child: Icon(
          action.icon,
          color: AppColors.primaryGreen,
        ),
      ),
      title: Text(
        action.title,
        style: GoogleFonts.lato(
          color: AppColors.darkText,
          fontWeight: FontWeight.w700,
        ),
      ),
      subtitle: Text(
        action.subtitle,
        style: GoogleFonts.lato(
          color: Colors.grey.shade600,
          fontSize: 12,
        ),
      ),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          if (action.badge != null)
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: 8,
                vertical: 4,
              ),
              decoration: BoxDecoration(
                color: AppColors.lightMint,
                borderRadius:
                BorderRadius.circular(10),
              ),
              child: Text(
                action.badge!,
                style: GoogleFonts.lato(
                  color:
                  AppColors.primaryGreen,
                  fontSize: 9,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          const SizedBox(width: 4),
          const Icon(
            Icons.chevron_right_rounded,
            color: Colors.grey,
          ),
        ],
      ),
      onTap: action.onTap,
    );
  }

  String _shortProfileId() {
    final String uid = _user?.uid.trim() ?? '';

    if (uid.isEmpty) {
      return 'FTH-MEMBER';
    }

    return uid.length <= 12
        ? uid.toUpperCase()
        : uid.substring(0, 12).toUpperCase();
  }

  void _open(Widget screen) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => screen,
      ),
    );
  }
}

class _ProfileAction {
  final IconData icon;
  final String title;
  final String subtitle;
  final String? badge;
  final VoidCallback onTap;

  const _ProfileAction({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    this.badge,
  });
}

class _ProfileFeatureScreen extends StatelessWidget {
  final String title;
  final IconData icon;
  final String description;

  const _ProfileFeatureScreen({
    required this.title,
    required this.icon,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(
          title,
          style: GoogleFonts.lexend(
            color: AppColors.darkText,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(28),
          child: Column(
            children: <Widget>[
              Container(
                width: 132,
                height: 132,
                decoration: const BoxDecoration(
                  color: AppColors.lightMint,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: AppColors.primaryGreen,
                  size: 66,
                ),
              ),
              const SizedBox(height: 22),
              Text(
                title,
                textAlign: TextAlign.center,
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 9),
              Text(
                description,
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade700,
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 22),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                  BorderRadius.circular(16),
                  border: Border.all(
                    color:
                    const Color(0xFFE2EAE3),
                  ),
                ),
                child: Row(
                  children: <Widget>[
                    const Icon(
                      Icons.construction_rounded,
                      color:
                      AppColors.primaryGreen,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'This module is ready for the next Firestore and payment integration phase.',
                        style: GoogleFonts.lato(
                          color:
                          Colors.grey.shade700,
                          fontSize: 12,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}