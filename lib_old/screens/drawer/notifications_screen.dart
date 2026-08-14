import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../models/notification_model.dart';
import '../../services/notification_service.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() =>
      _NotificationsScreenState();
}

class _NotificationsScreenState
    extends State<NotificationsScreen> {
  final NotificationService _notificationService =
  NotificationService();

  String _searchQuery = '';
  String _selectedFilter = 'All';

  bool _isMarkingAllRead = false;
  bool _isClearingAll = false;

  User? get _user => FirebaseAuth.instance.currentUser;

  static const List<String> _filters = <String>[
    'All',
    'Orders',
    'Offers',
    'Farmers',
    'Wishlist',
    'General',
  ];

  @override
  Widget build(BuildContext context) {
    final User? user = _user;

    if (user == null) {
      return _buildLoggedOutScreen();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: _buildAppBar(user),
      body: StreamBuilder<List<NotificationModel>>(
        stream: _notificationService.getUserNotifications(
          user.uid,
        ),
        builder: (
            BuildContext context,
            AsyncSnapshot<List<NotificationModel>> snapshot,
            ) {
          if (snapshot.connectionState ==
              ConnectionState.waiting) {
            return _buildLoadingState();
          }

          if (snapshot.hasError) {
            return _buildErrorState();
          }

          final List<NotificationModel> notifications =
              snapshot.data ??
                  const <NotificationModel>[];

          if (notifications.isEmpty) {
            return _buildEmptyState();
          }

          final List<NotificationModel> filtered =
          _applyFilters(notifications);

          final int unreadCount = notifications
              .where(
                (NotificationModel item) =>
            item.isUnread,
          )
              .length;

          return Column(
            children: <Widget>[
              _buildSummaryHeader(
                totalCount: notifications.length,
                unreadCount: unreadCount,
              ),
              _buildSearchBox(),
              _buildFilterChips(),
              Expanded(
                child: filtered.isEmpty
                    ? _buildNoResultsState()
                    : _buildGroupedList(filtered),
              ),
            ],
          );
        },
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(User user) {
    return AppBar(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      elevation: 0,
      title: Text(
        'Notifications',
        style: GoogleFonts.lexend(
          color: AppColors.darkText,
          fontWeight: FontWeight.w800,
        ),
      ),
      actions: <Widget>[
        PopupMenuButton<String>(
          tooltip: 'Notification actions',
          onSelected: (String value) {
            if (value == 'mark_all_read') {
              _markAllAsRead(user.uid);
            } else if (value == 'clear_all') {
              _confirmClearAll(user.uid);
            }
          },
          itemBuilder: (_) =>
          const <PopupMenuEntry<String>>[
            PopupMenuItem<String>(
              value: 'mark_all_read',
              child: Row(
                children: <Widget>[
                  Icon(
                    Icons.done_all_rounded,
                    color: AppColors.primaryGreen,
                  ),
                  SizedBox(width: 10),
                  Text('Mark all as read'),
                ],
              ),
            ),
            PopupMenuItem<String>(
              value: 'clear_all',
              child: Row(
                children: <Widget>[
                  Icon(
                    Icons.delete_sweep_outlined,
                    color: AppColors.errorRed,
                  ),
                  SizedBox(width: 10),
                  Text('Clear all'),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  Widget _buildLoggedOutScreen() {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: AppBar(
        title: const Text('Notifications'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(28),
          child: Column(
            children: <Widget>[
              Container(
                width: 130,
                height: 130,
                decoration: const BoxDecoration(
                  color: AppColors.lightMint,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.lock_outline_rounded,
                  size: 64,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 22),
              Text(
                'Please sign in',
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Sign in to receive order, delivery, offer and farmer updates.',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                  height: 1.45,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 7,
      itemBuilder: (_, __) {
        return Container(
          height: 118,
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: const Color(0xFFE3EAE4),
            ),
          ),
          child: const Center(
            child: CircularProgressIndicator(
              color: AppColors.primaryGreen,
            ),
          ),
        );
      },
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.cloud_off_outlined,
              size: 82,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 18),
            Text(
              'Could not load notifications',
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Please check your internet connection and try again.',
              textAlign: TextAlign.center,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                height: 1.45,
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton.icon(
              onPressed: () => setState(() {}),
              icon: const Icon(Icons.refresh_rounded),
              label: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: FadeIn(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(30),
          child: Column(
            children: <Widget>[
              Container(
                width: 140,
                height: 140,
                decoration: const BoxDecoration(
                  color: AppColors.lightMint,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.notifications_none_rounded,
                  size: 72,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 22),
              Text(
                'No notifications yet',
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Order updates, offers and farmer alerts will appear here.',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                  height: 1.45,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNoResultsState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.search_off_rounded,
              size: 72,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'No matching notifications',
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 19,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              'Try another search or notification type.',
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 18),
            OutlinedButton(
              onPressed: () {
                setState(() {
                  _searchQuery = '';
                  _selectedFilter = 'All';
                });
              },
              child: const Text('Clear Filters'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryHeader({
    required int totalCount,
    required int unreadCount,
  }) {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x261B5E20),
            blurRadius: 18,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: _summaryValue(
              icon: Icons.notifications_rounded,
              value: '$totalCount',
              label: 'Total',
            ),
          ),
          _summaryDivider(),
          Expanded(
            child: _summaryValue(
              icon:
              Icons.mark_email_unread_outlined,
              value: '$unreadCount',
              label: 'Unread',
            ),
          ),
          _summaryDivider(),
          Expanded(
            child: _summaryValue(
              icon: Icons.done_all_rounded,
              value: '${totalCount - unreadCount}',
              label: 'Read',
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryValue({
    required IconData icon,
    required String value,
    required String label,
  }) {
    return Column(
      children: <Widget>[
        Icon(
          icon,
          color: Colors.white,
          size: 22,
        ),
        const SizedBox(height: 5),
        Text(
          value,
          style: GoogleFonts.lexend(
            color: Colors.white,
            fontSize: 19,
            fontWeight: FontWeight.w800,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.lato(
            color: Colors.white70,
            fontSize: 10,
          ),
        ),
      ],
    );
  }

  Widget _summaryDivider() {
    return Container(
      width: 1,
      height: 52,
      color: Colors.white24,
    );
  }

  Widget _buildSearchBox() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: TextField(
        onChanged: (String value) {
          setState(() {
            _searchQuery =
                value.trim().toLowerCase();
          });
        },
        decoration: InputDecoration(
          hintText:
          'Search notifications, orders or offers',
          prefixIcon: const Icon(
            Icons.search_rounded,
            color: AppColors.primaryGreen,
          ),
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: const BorderSide(
              color: Color(0xFFE3EAE4),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterChips() {
    return SizedBox(
      height: 60,
      child: ListView.separated(
        padding:
        const EdgeInsets.fromLTRB(16, 12, 16, 8),
        scrollDirection: Axis.horizontal,
        itemCount: _filters.length,
        separatorBuilder: (_, __) =>
        const SizedBox(width: 8),
        itemBuilder: (
            BuildContext context,
            int index,
            ) {
          final String filter = _filters[index];
          final bool selected =
              _selectedFilter == filter;

          return ChoiceChip(
            selected: selected,
            label: Text(filter),
            onSelected: (_) {
              setState(() {
                _selectedFilter = filter;
              });
            },
            selectedColor:
            AppColors.primaryGreen,
            backgroundColor: Colors.white,
            showCheckmark: false,
            labelStyle: GoogleFonts.lato(
              color: selected
                  ? Colors.white
                  : AppColors.darkText,
              fontWeight: FontWeight.w700,
            ),
            side: BorderSide(
              color: selected
                  ? AppColors.primaryGreen
                  : const Color(0xFFE3EAE4),
            ),
          );
        },
      ),
    );
  }

  Widget _buildGroupedList(
      List<NotificationModel> notifications,
      ) {
    final Map<String, List<NotificationModel>>
    grouped = _groupNotifications(notifications);

    final List<MapEntry<String,
        List<NotificationModel>>>
    entries = grouped.entries.toList();

    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: () async {
        await Future<void>.delayed(
          const Duration(milliseconds: 450),
        );

        if (mounted) {
          setState(() {});
        }
      },
      child: ListView.builder(
        padding:
        const EdgeInsets.fromLTRB(16, 4, 16, 30),
        itemCount: entries.length,
        itemBuilder: (
            BuildContext context,
            int groupIndex,
            ) {
          final MapEntry<String,
              List<NotificationModel>>
          entry = entries[groupIndex];

          return Column(
            crossAxisAlignment:
            CrossAxisAlignment.start,
            children: <Widget>[
              Padding(
                padding:
                const EdgeInsets.fromLTRB(
                  4,
                  14,
                  4,
                  10,
                ),
                child: Text(
                  entry.key,
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              ...entry.value.asMap().entries.map<Widget>(
                    (
                    MapEntry<int,
                        NotificationModel>
                    itemEntry,
                    ) {
                  return FadeInUp(
                    delay: Duration(
                      milliseconds:
                      itemEntry.key.clamp(0, 8) *
                          45,
                    ),
                    child: _buildNotificationCard(
                      itemEntry.value,
                    ),
                  );
                },
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildNotificationCard(
      NotificationModel notification,
      ) {
    return Dismissible(
      key: ValueKey<String>(
        notification.id ??
            '${notification.userId}_${notification.timestamp.millisecondsSinceEpoch}',
      ),
      direction: DismissDirection.endToStart,
      confirmDismiss: (_) async {
        return _confirmDelete(notification);
      },
      background: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding:
        const EdgeInsets.symmetric(horizontal: 22),
        alignment: Alignment.centerRight,
        decoration: BoxDecoration(
          color: AppColors.errorRed,
          borderRadius: BorderRadius.circular(18),
        ),
        child: const Icon(
          Icons.delete_outline_rounded,
          color: Colors.white,
          size: 28,
        ),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(18),
        onTap: () =>
            _handleNotificationTap(notification),
        child: AnimatedContainer(
          duration:
          const Duration(milliseconds: 220),
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: notification.isUnread
                ? AppColors.lightMint
                : Colors.white,
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: notification.isUnread
                  ? const Color(0xFFBED8C2)
                  : const Color(0xFFE3EAE4),
            ),
            boxShadow: const <BoxShadow>[
              BoxShadow(
                color: Color(0x0D000000),
                blurRadius: 13,
                offset: Offset(0, 5),
              ),
            ],
          ),
          child: Row(
            crossAxisAlignment:
            CrossAxisAlignment.start,
            children: <Widget>[
              _buildTypeAvatar(notification),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      crossAxisAlignment:
                      CrossAxisAlignment.start,
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            notification.title,
                            maxLines: 2,
                            overflow:
                            TextOverflow.ellipsis,
                            style: GoogleFonts.lexend(
                              color:
                              AppColors.darkText,
                              fontSize: 13,
                              fontWeight:
                              notification.isUnread
                                  ? FontWeight.w800
                                  : FontWeight.w700,
                            ),
                          ),
                        ),
                        if (notification.isUnread)
                          Container(
                            width: 9,
                            height: 9,
                            margin:
                            const EdgeInsets.only(
                              left: 8,
                              top: 4,
                            ),
                            decoration:
                            const BoxDecoration(
                              color:
                              AppColors.primaryGreen,
                              shape: BoxShape.circle,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 5),
                    Text(
                      notification.body,
                      maxLines: 3,
                      overflow:
                      TextOverflow.ellipsis,
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade700,
                        fontSize: 12,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 9),
                    Row(
                      children: <Widget>[
                        _typeChip(notification),
                        const Spacer(),
                        Text(
                          _relativeTime(
                            notification.timestamp,
                          ),
                          style: GoogleFonts.lato(
                            color:
                            Colors.grey.shade500,
                            fontSize: 9.5,
                            fontWeight:
                            FontWeight.w600,
                          ),
                        ),
                      ],
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

  Widget _buildTypeAvatar(
      NotificationModel notification,
      ) {
    final _NotificationVisual visual =
    _visualFor(notification.normalizedType);

    if (notification.image.trim().isNotEmpty) {
      final String image = notification.image.trim();

      return ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: SizedBox(
          width: 56,
          height: 56,
          child: image.startsWith('http')
              ? Image.network(
            image,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) =>
                _fallbackTypeIcon(visual),
          )
              : Image.asset(
            image,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) =>
                _fallbackTypeIcon(visual),
          ),
        ),
      );
    }

    return _fallbackTypeIcon(visual);
  }

  Widget _fallbackTypeIcon(
      _NotificationVisual visual,
      ) {
    return Container(
      width: 56,
      height: 56,
      decoration: BoxDecoration(
        color: visual.background,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Icon(
        visual.icon,
        color: visual.foreground,
        size: 28,
      ),
    );
  }

  Widget _typeChip(
      NotificationModel notification,
      ) {
    final _NotificationVisual visual =
    _visualFor(notification.normalizedType);

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: visual.background,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(
        _displayType(notification.normalizedType),
        style: GoogleFonts.lato(
          color: visual.foreground,
          fontSize: 8.5,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Future<void> _handleNotificationTap(
      NotificationModel notification,
      ) async {
    final String? id = notification.id;

    if (notification.isUnread &&
        id != null &&
        id.trim().isNotEmpty) {
      try {
        await _notificationService.markAsRead(id);
      } on NotificationServiceException catch (error) {
        _showMessage(
          error.message,
          isError: true,
        );
      }
    }

    if (!mounted) {
      return;
    }

    final String type = notification.normalizedType;

    if (type.startsWith('order') ||
        notification.orderId.trim().isNotEmpty) {
      _showMessage(
        'Order navigation is ready. Connect this notification to TrackOrderScreen using orderId: ${notification.orderId}.',
      );
      return;
    }

    if (type.startsWith('wishlist') ||
        notification.productId.trim().isNotEmpty) {
      _showMessage(
        'Product navigation is ready for productId: ${notification.productId}.',
      );
      return;
    }

    if (type.startsWith('farmer') ||
        notification.farmerId.trim().isNotEmpty) {
      _showMessage(
        'Farmer profile navigation is ready for farmerId: ${notification.farmerId}.',
      );
      return;
    }

    if (notification.route.trim().isNotEmpty) {
      _showMessage(
        'Route ready: ${notification.route}',
      );
    }
  }

  Future<bool> _confirmDelete(
      NotificationModel notification,
      ) async {
    final String? id = notification.id;

    if (id == null || id.trim().isEmpty) {
      return false;
    }

    final bool? confirmed =
    await showDialog<bool>(
      context: context,
      builder: (
          BuildContext dialogContext,
          ) {
        return AlertDialog(
          title: const Text(
            'Delete Notification?',
          ),
          content: const Text(
            'This notification will be permanently removed.',
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
            TextButton(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                  true,
                );
              },
              child: const Text(
                'Delete',
                style: TextStyle(
                  color: AppColors.errorRed,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (confirmed != true) {
      return false;
    }

    try {
      await _notificationService
          .deleteNotification(id);

      _showMessage('Notification deleted.');
      return true;
    } on NotificationServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
      return false;
    }
  }

  Future<void> _markAllAsRead(
      String userId,
      ) async {
    if (_isMarkingAllRead) {
      return;
    }

    setState(() {
      _isMarkingAllRead = true;
    });

    try {
      await _notificationService
          .markAllAsRead(userId);

      _showMessage(
        'All notifications marked as read.',
      );
    } on NotificationServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isMarkingAllRead = false;
        });
      }
    }
  }

  Future<void> _confirmClearAll(
      String userId,
      ) async {
    if (_isClearingAll) {
      return;
    }

    final bool? confirmed =
    await showDialog<bool>(
      context: context,
      builder: (
          BuildContext dialogContext,
          ) {
        return AlertDialog(
          title: const Text(
            'Clear All Notifications?',
          ),
          content: const Text(
            'All notifications will be permanently deleted.',
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
            TextButton(
              onPressed: () {
                Navigator.pop(
                  dialogContext,
                  true,
                );
              },
              child: const Text(
                'Clear All',
                style: TextStyle(
                  color: AppColors.errorRed,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (confirmed != true) {
      return;
    }

    setState(() {
      _isClearingAll = true;
    });

    try {
      await _notificationService
          .clearNotifications(userId);

      _showMessage('All notifications cleared.');
    } on NotificationServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isClearingAll = false;
        });
      }
    }
  }

  List<NotificationModel> _applyFilters(
      List<NotificationModel> notifications,
      ) {
    return notifications.where(
          (NotificationModel notification) {
        final bool matchesType =
        _matchesFilter(notification);

        if (!matchesType) {
          return false;
        }

        if (_searchQuery.isEmpty) {
          return true;
        }

        final String searchable = <String>[
          notification.title,
          notification.body,
          notification.type,
          notification.orderId,
          notification.productId,
          notification.farmerId,
        ].join(' ').toLowerCase();

        return searchable.contains(_searchQuery);
      },
    ).toList();
  }

  bool _matchesFilter(
      NotificationModel notification,
      ) {
    if (_selectedFilter == 'All') {
      return true;
    }

    final String type =
        notification.normalizedType;

    switch (_selectedFilter) {
      case 'Orders':
        return type.startsWith('order') ||
            notification.orderId.trim().isNotEmpty;
      case 'Offers':
        return type == 'offer' ||
            type == 'coupon' ||
            type == 'flash_sale' ||
            type == 'discount';
      case 'Farmers':
        return type.startsWith('farmer') ||
            type == 'harvest' ||
            notification.farmerId.trim().isNotEmpty;
      case 'Wishlist':
        return type.startsWith('wishlist') ||
            type == 'price_drop' ||
            type == 'back_in_stock';
      case 'General':
        return type == 'general' ||
            type == 'system';
      default:
        return true;
    }
  }

  Map<String, List<NotificationModel>>
  _groupNotifications(
      List<NotificationModel> notifications,
      ) {
    final Map<String, List<NotificationModel>>
    grouped =
    <String, List<NotificationModel>>{
      'Today': <NotificationModel>[],
      'Yesterday': <NotificationModel>[],
      'Earlier': <NotificationModel>[],
    };

    final DateTime now = DateTime.now();
    final DateTime today =
    DateTime(now.year, now.month, now.day);
    final DateTime yesterday =
    today.subtract(const Duration(days: 1));

    for (final NotificationModel item
    in notifications) {
      final DateTime date = DateTime(
        item.timestamp.year,
        item.timestamp.month,
        item.timestamp.day,
      );

      if (date == today) {
        grouped['Today']!.add(item);
      } else if (date == yesterday) {
        grouped['Yesterday']!.add(item);
      } else {
        grouped['Earlier']!.add(item);
      }
    }

    grouped.removeWhere(
          (
          String key,
          List<NotificationModel> value,
          ) =>
      value.isEmpty,
    );

    return grouped;
  }

  _NotificationVisual _visualFor(
      String type,
      ) {
    if (type.startsWith('order')) {
      if (type.contains('delivered')) {
        return const _NotificationVisual(
          icon: Icons.check_circle_rounded,
          foreground: AppColors.primaryGreen,
          background: Color(0xFFE8F5E9),
        );
      }

      if (type.contains('out_for_delivery') ||
          type.contains('shipped')) {
        return const _NotificationVisual(
          icon: Icons.local_shipping_rounded,
          foreground: AppColors.goldAmber,
          background: Color(0xFFFFF8E1),
        );
      }

      return const _NotificationVisual(
        icon: Icons.receipt_long_rounded,
        foreground: AppColors.primaryGreen,
        background: AppColors.lightMint,
      );
    }

    if (type == 'offer' ||
        type == 'coupon' ||
        type == 'discount' ||
        type == 'flash_sale') {
      return const _NotificationVisual(
        icon: Icons.local_offer_rounded,
        foreground: Color(0xFFD84315),
        background: Color(0xFFFBE9E7),
      );
    }

    if (type.startsWith('farmer') ||
        type == 'harvest') {
      return const _NotificationVisual(
        icon: Icons.agriculture_rounded,
        foreground: AppColors.primaryGreen,
        background: AppColors.lightMint,
      );
    }

    if (type.startsWith('wishlist') ||
        type == 'price_drop' ||
        type == 'back_in_stock') {
      return const _NotificationVisual(
        icon: Icons.favorite_rounded,
        foreground: AppColors.errorRed,
        background: Color(0xFFFFEBEE),
      );
    }

    return const _NotificationVisual(
      icon: Icons.notifications_rounded,
      foreground: AppColors.primaryGreen,
      background: AppColors.lightMint,
    );
  }

  String _displayType(String type) {
    if (type.startsWith('order')) {
      return 'ORDER';
    }

    if (type == 'offer' ||
        type == 'coupon' ||
        type == 'discount' ||
        type == 'flash_sale') {
      return 'OFFER';
    }

    if (type.startsWith('farmer') ||
        type == 'harvest') {
      return 'FARMER';
    }

    if (type.startsWith('wishlist') ||
        type == 'price_drop' ||
        type == 'back_in_stock') {
      return 'WISHLIST';
    }

    return 'GENERAL';
  }

  String _relativeTime(DateTime date) {
    final Duration difference =
    DateTime.now().difference(date);

    if (difference.isNegative) {
      return 'Just now';
    }

    if (difference.inSeconds < 60) {
      return 'Just now';
    }

    if (difference.inMinutes < 60) {
      return '${difference.inMinutes} min ago';
    }

    if (difference.inHours < 24) {
      return '${difference.inHours} hr ago';
    }

    if (difference.inDays == 1) {
      return 'Yesterday';
    }

    if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    }

    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year}';
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
}

class _NotificationVisual {
  final IconData icon;
  final Color foreground;
  final Color background;

  const _NotificationVisual({
    required this.icon,
    required this.foreground,
    required this.background,
  });
}