import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/order_model.dart';
import '../../services/cart_service.dart';
import '../../services/order_service.dart';
import '../cart/cart_screen.dart';
import '../home/home_screen.dart';
import 'order_details_screen.dart';
import 'track_order_screen.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen>
    with SingleTickerProviderStateMixin {
  final OrderService _orderService = OrderService();
  final CartService _cartService = CartService();

  late final TabController _tabController;
  late final VoidCallback _cartListener;

  String _searchQuery = '';
  bool _isCancelling = false;

  User? get _user => FirebaseAuth.instance.currentUser;

  @override
  void initState() {
    super.initState();

    _tabController = TabController(
      length: 3,
      vsync: this,
    );

    _cartListener = () {
      if (mounted) {
        setState(() {});
      }
    };

    _cartService.addListener(_cartListener);
    _cartService.loadCart();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _cartService.removeListener(_cartListener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final User? user = _user;

    if (user == null) {
      return _buildLoggedOutScreen();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: _buildAppBar(),
      body: StreamBuilder<List<OrderModel>>(
        stream: _orderService.getUserOrders(user.uid),
        builder: (
            BuildContext context,
            AsyncSnapshot<List<OrderModel>> snapshot,
            ) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildLoadingState();
          }

          if (snapshot.hasError) {
            return _buildErrorState();
          }

          final List<OrderModel> allOrders =
              snapshot.data ?? const <OrderModel>[];

          if (allOrders.isEmpty) {
            return _buildEmptyState();
          }

          final List<OrderModel> searchedOrders =
          _applySearch(allOrders);

          return Column(
            children: <Widget>[
              _buildSummaryStrip(allOrders),
              _buildSearchBox(),
              _buildTabs(),
              Expanded(
                child: TabBarView(
                  controller: _tabController,
                  children: <Widget>[
                    _buildOrdersList(
                      searchedOrders
                          .where(
                            (OrderModel order) => order.isActive,
                      )
                          .toList(),
                      emptyMessage: 'No active orders',
                      emptySubtitle:
                      'Placed and ongoing orders will appear here.',
                    ),
                    _buildOrdersList(
                      searchedOrders
                          .where(
                            (OrderModel order) => order.isDelivered,
                      )
                          .toList(),
                      emptyMessage: 'No completed orders',
                      emptySubtitle:
                      'Delivered orders will appear here.',
                    ),
                    _buildOrdersList(
                      searchedOrders
                          .where(
                            (OrderModel order) => order.isCancelled,
                      )
                          .toList(),
                      emptyMessage: 'No cancelled orders',
                      emptySubtitle:
                      'Cancelled orders will appear here.',
                    ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
      bottomNavigationBar: _buildCartBar(),
    );
  }

  PreferredSizeWidget _buildAppBar() {
    return AppBar(
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      elevation: 0,
      title: Text(
        'My Orders',
        style: GoogleFonts.lexend(
          color: AppColors.darkText,
          fontWeight: FontWeight.w800,
        ),
      ),
      actions: <Widget>[
        IconButton(
          tooltip: 'Cart',
          onPressed: _openCart,
          icon: Badge(
            isLabelVisible: _cartService.totalItemCount > 0,
            label: Text('${_cartService.totalItemCount}'),
            child: const Icon(
              Icons.shopping_bag_outlined,
              color: AppColors.darkText,
            ),
          ),
        ),
        const SizedBox(width: 6),
      ],
    );
  }

  Widget _buildLoggedOutScreen() {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: AppBar(
        title: const Text('My Orders'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Container(
                width: 120,
                height: 120,
                decoration: const BoxDecoration(
                  color: AppColors.lightMint,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.lock_outline_rounded,
                  size: 58,
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
                'Sign in to view your active, completed and cancelled orders.',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
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
      itemCount: 4,
      itemBuilder: (_, __) {
        return Container(
          height: 290,
          margin: const EdgeInsets.only(bottom: 14),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
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
              size: 84,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 18),
            Text(
              'Could not load orders',
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
                width: 132,
                height: 132,
                decoration: const BoxDecoration(
                  color: AppColors.lightMint,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.receipt_long_outlined,
                  size: 66,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 22),
              Text(
                'No orders yet',
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 23,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Your fresh farm orders will appear here.',
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _goHome,
                icon: const Icon(Icons.shopping_basket_outlined),
                label: const Text('Start Shopping'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSummaryStrip(List<OrderModel> orders) {
    final int active =
        orders.where((OrderModel order) => order.isActive).length;
    final int delivered =
        orders.where((OrderModel order) => order.isDelivered).length;
    final int cancelled =
        orders.where((OrderModel order) => order.isCancelled).length;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
        ),
        borderRadius: BorderRadius.circular(21),
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
            child: _summaryItem(
              value: '$active',
              label: 'Active',
              icon: Icons.local_shipping_outlined,
            ),
          ),
          _summaryDivider(),
          Expanded(
            child: _summaryItem(
              value: '$delivered',
              label: 'Delivered',
              icon: Icons.check_circle_outline_rounded,
            ),
          ),
          _summaryDivider(),
          Expanded(
            child: _summaryItem(
              value: '$cancelled',
              label: 'Cancelled',
              icon: Icons.cancel_outlined,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBox() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: TextField(
        onChanged: (String value) {
          setState(() {
            _searchQuery = value.trim().toLowerCase();
          });
        },
        decoration: InputDecoration(
          hintText: 'Search order ID, product or farm',
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

  Widget _buildTabs() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 14, 16, 10),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: const Color(0xFFE3EAE4),
        ),
      ),
      child: TabBar(
        controller: _tabController,
        dividerColor: Colors.transparent,
        indicator: BoxDecoration(
          color: AppColors.primaryGreen,
          borderRadius: BorderRadius.circular(11),
        ),
        labelColor: Colors.white,
        unselectedLabelColor: Colors.grey.shade600,
        labelStyle: GoogleFonts.lato(
          fontSize: 12,
          fontWeight: FontWeight.w800,
        ),
        tabs: const <Widget>[
          Tab(text: 'Active'),
          Tab(text: 'Completed'),
          Tab(text: 'Cancelled'),
        ],
      ),
    );
  }

  Widget _buildOrdersList(
      List<OrderModel> orders, {
        required String emptyMessage,
        required String emptySubtitle,
      }) {
    if (orders.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Icon(
                Icons.inventory_2_outlined,
                size: 70,
                color: Colors.grey.shade300,
              ),
              const SizedBox(height: 16),
              Text(
                emptyMessage,
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                emptySubtitle,
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ),
      );
    }

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
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 120),
        itemCount: orders.length,
        itemBuilder: (
            BuildContext context,
            int index,
            ) {
          final OrderModel order = orders[index];

          return FadeInUp(
            delay: Duration(
              milliseconds: index.clamp(0, 8) * 55,
            ),
            child: _buildOrderCard(order),
          );
        },
      ),
    );
  }

  Widget _buildOrderCard(OrderModel order) {
    final List<Map<String, dynamic>> previewItems =
    order.items.take(6).toList();

    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFFE3EAE4),
        ),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 15,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'ORDER #${_shortOrderId(order.id)}',
                      style: GoogleFonts.lexend(
                        color: AppColors.darkText,
                        fontSize: 14,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDateTime(order.timestamp),
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade600,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              _statusChip(order),
            ],
          ),
          const SizedBox(height: 14),
          _buildFarmPreview(order),
          const SizedBox(height: 14),
          SizedBox(
            height: 96,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: previewItems.length,
              separatorBuilder: (_, __) =>
              const SizedBox(width: 9),
              itemBuilder: (
                  BuildContext context,
                  int index,
                  ) {
                return _productPreview(previewItems[index]);
              },
            ),
          ),
          const SizedBox(height: 13),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              _metaChip(
                Icons.shopping_basket_outlined,
                '${order.totalItemCount} items',
              ),
              if (order.hasQuickItems)
                _metaChip(
                  Icons.bolt_rounded,
                  '${order.quickItemCount} quick',
                ),
              if (order.hasPreOrderItems)
                _metaChip(
                  Icons.agriculture_rounded,
                  '${order.preOrderItemCount} pre-order',
                ),
              _metaChip(
                Icons.account_balance_wallet_outlined,
                order.paymentStatusLabel,
              ),
            ],
          ),
          const SizedBox(height: 14),
          _AnimatedOrderTracker(
            status: order.normalizedStatus,
          ),
          const SizedBox(height: 14),
          if (order.timeSlot != null &&
              order.timeSlot!.trim().isNotEmpty)
            _informationRow(
              Icons.schedule_rounded,
              'Delivery slot',
              order.timeSlot!,
            ),
          _informationRow(
            Icons.location_on_outlined,
            'Delivering to',
            order.address,
          ),
          const Divider(height: 24),
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  '₹${order.totalAmount.toStringAsFixed(0)}',
                  style: GoogleFonts.lexend(
                    color: AppColors.primaryGreen,
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              if (order.canCancel)
                TextButton(
                  onPressed: _isCancelling
                      ? null
                      : () => _showCancelOrderSheet(order),
                  child: Text(
                    'Cancel',
                    style: GoogleFonts.lato(
                      color: AppColors.errorRed,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              const SizedBox(width: 5),
              OutlinedButton(
                onPressed: () => _openOrderDetails(order),
                child: const Text('Details'),
              ),
              const SizedBox(width: 8),
              ElevatedButton(
                onPressed: order.canTrack
                    ? () => _openTrackOrder(order)
                    : () => _reorder(order),
                child: Text(
                  order.canTrack ? 'Track' : 'Reorder',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFarmPreview(OrderModel order) {
    final List<String> farms =
    order.itemsGroupedByFarmer.keys.take(3).toList();

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: AppColors.lightMint,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(
              Icons.agriculture_rounded,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Text(
              farms.isEmpty
                  ? 'Farm To Home Growers'
                  : farms.join(' • '),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.lato(
                color: AppColors.darkText,
                fontSize: 12,
                height: 1.35,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _productPreview(Map<String, dynamic> item) {
    final String name = _stringValue(
      item['name'],
      fallback: 'Farm Product',
    );
    final String displayName = _stringValue(
      item['displayName'],
      fallback: name,
    );
    final String image = LocalProductCatalog.imageFor(
      name: name,
      preferredImage: _stringValue(item['image']),
    );
    final int quantity = _intValue(
      item['quantity'],
      fallback: 1,
    );

    return Container(
      width: 96,
      padding: const EdgeInsets.all(7),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFE3EAE4),
        ),
      ),
      child: Column(
        children: <Widget>[
          Expanded(
            child: _buildImage(image),
          ),
          const SizedBox(height: 4),
          Text(
            displayName,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.lato(
              color: AppColors.darkText,
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
          Text(
            'Qty $quantity',
            style: GoogleFonts.lato(
              color: Colors.grey.shade600,
              fontSize: 8,
            ),
          ),
        ],
      ),
    );
  }

  Widget _statusChip(OrderModel order) {
    Color background;
    Color foreground;

    if (order.isDelivered) {
      background = AppColors.primaryGreen;
      foreground = Colors.white;
    } else if (order.isCancelled) {
      background = const Color(0xFFFFEBEE);
      foreground = AppColors.errorRed;
    } else if (order.isOutForDelivery || order.isShipped) {
      background = const Color(0xFFFFF8E1);
      foreground = AppColors.goldAmber;
    } else {
      background = AppColors.lightMint;
      foreground = AppColors.primaryGreen;
    }

    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 10,
        vertical: 7,
      ),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        order.statusLabel.toUpperCase(),
        style: GoogleFonts.lato(
          color: foreground,
          fontSize: 9,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _metaChip(
      IconData icon,
      String label,
      ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: AppColors.lightMint,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(
            icon,
            color: AppColors.primaryGreen,
            size: 14,
          ),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.lato(
              color: AppColors.primaryGreen,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _informationRow(
      IconData icon,
      String label,
      String value,
      ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(
            icon,
            color: AppColors.primaryGreen,
            size: 18,
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 90,
            child: Text(
              label,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 11,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.lato(
                color: AppColors.darkText,
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _summaryItem({
    required String value,
    required String label,
    required IconData icon,
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
            fontSize: 18,
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

  Widget _buildCartBar() {
    if (_cartService.totalItemCount <= 0) {
      return const SizedBox.shrink();
    }

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.all(12),
        color: Colors.white,
        child: ElevatedButton.icon(
          onPressed: _openCart,
          icon: const Icon(Icons.shopping_bag_rounded),
          label: Text(
            '${_cartService.totalItemCount} items • ₹${_cartService.totalAmount}   View Cart',
          ),
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 54),
          ),
        ),
      ),
    );
  }

  List<OrderModel> _applySearch(
      List<OrderModel> orders,
      ) {
    if (_searchQuery.isEmpty) {
      return orders;
    }

    return orders.where(
          (OrderModel order) {
        final String products = order.items
            .map(
              (Map<String, dynamic> item) =>
              _stringValue(item['name']),
        )
            .join(' ');

        final String farms =
        order.itemsGroupedByFarmer.keys.join(' ');

        final String searchable = <String>[
          order.id ?? '',
          products,
          farms,
          order.address,
          order.statusLabel,
        ].join(' ').toLowerCase();

        return searchable.contains(_searchQuery);
      },
    ).toList();
  }

  Future<void> _showCancelOrderSheet(
      OrderModel order,
      ) async {
    const List<String> reasons = <String>[
      'Ordered by mistake',
      'Need to change delivery address',
      'Need to change products',
      'Delivery time is not suitable',
      'Found a better alternative',
      'Other reason',
    ];

    String selectedReason = reasons.first;

    final bool? confirmed =
    await showModalBottomSheet<bool>(
      context: context,
      showDragHandle: true,
      backgroundColor: Colors.white,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(26),
        ),
      ),
      builder: (
          BuildContext sheetContext,
          ) {
        return StatefulBuilder(
          builder: (
              BuildContext context,
              StateSetter setSheetState,
              ) {
            return SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  20,
                  8,
                  20,
                  24,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Cancel Order',
                      style: GoogleFonts.lexend(
                        color: AppColors.darkText,
                        fontSize: 21,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Select a reason for cancellation.',
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade600,
                      ),
                    ),
                    const SizedBox(height: 14),
                    ...reasons.map<Widget>(
                          (String reason) {
                        return RadioListTile<String>(
                          contentPadding: EdgeInsets.zero,
                          value: reason,
                          groupValue: selectedReason,
                          activeColor:
                          AppColors.primaryGreen,
                          title: Text(
                            reason,
                            style: GoogleFonts.lato(
                              fontWeight:
                              FontWeight.w600,
                            ),
                          ),
                          onChanged: (String? value) {
                            if (value != null) {
                              setSheetState(() {
                                selectedReason = value;
                              });
                            }
                          },
                        );
                      },
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: () {
                          Navigator.pop(
                            sheetContext,
                            true,
                          );
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor:
                          AppColors.errorRed,
                          foregroundColor: Colors.white,
                        ),
                        child: const Text(
                          'CONFIRM CANCELLATION',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );

    if (confirmed != true || order.id == null) {
      return;
    }

    setState(() {
      _isCancelling = true;
    });

    try {
      await _orderService.cancelOrder(
        orderId: order.id!,
        reason: selectedReason,
      );

      if (!mounted) return;

      _showMessage('Order cancelled successfully.');
    } on OrderServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    } catch (_) {
      _showMessage(
        'Unable to cancel this order.',
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isCancelling = false;
        });
      }
    }
  }

  Future<void> _reorder(OrderModel order) async {
    for (final Map<String, dynamic> item in order.items) {
      _cartService.addItem(
        _stringValue(item['name']),
        _stringValue(item['image']),
        _doubleValue(item['price']).round(),
        productId: _stringValue(item['productId']),
        teluguName: _stringValue(item['teluguName']),
        weight: _stringValue(item['weight']),
        category: _stringValue(item['category']),
        categoryTelugu:
        _stringValue(item['categoryTelugu']),
        farmerId: _stringValue(item['farmerId']),
        farmerName: _stringValue(item['farmerName']),
        farmName: _stringValue(item['farmName']),
        organic: _boolValue(
          item['organic'],
          fallback: true,
        ),
        rating: _doubleValue(item['rating']),
        isQuick: _boolValue(item['isQuick']),
        quickDeliveryMinutes: _intValue(
          item['quickDeliveryMinutes'],
        ),
        isPreOrder: _boolValue(item['isPreOrder']),
        harvestDate: _dateTimeValue(item['harvestDate']),
        expectedDeliveryDate:
        _dateTimeValue(item['expectedDeliveryDate']),
        deliverySlot: _stringValue(
          item['deliverySlot'],
        ),
      );
    }

    _showMessage('Order items added to cart.');
  }


  void _openOrderDetails(OrderModel order) {
    final String? orderId = order.id;

    if (orderId == null || orderId.trim().isEmpty) {
      _showMessage(
        'Order ID is unavailable.',
        isError: true,
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => OrderDetailsScreen(
          orderId: orderId,
          initialOrder: order,
        ),
      ),
    );
  }

  void _openTrackOrder(OrderModel order) {
    final String? orderId = order.id;

    if (orderId == null || orderId.trim().isEmpty) {
      _showMessage(
        'Order ID is unavailable.',
        isError: true,
      );
      return;
    }

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => TrackOrderScreen(
          orderId: orderId,
          initialOrder: order,
        ),
      ),
    );
  }

  void _showOrderDetails(OrderModel order) {
    showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(26),
        ),
      ),
      builder: (
          BuildContext context,
          ) {
        return SafeArea(
          child: DraggableScrollableSheet(
            expand: false,
            initialChildSize: 0.78,
            minChildSize: 0.5,
            maxChildSize: 0.95,
            builder: (
                BuildContext context,
                ScrollController controller,
                ) {
              return ListView(
                controller: controller,
                padding: const EdgeInsets.fromLTRB(
                  20,
                  4,
                  20,
                  24,
                ),
                children: <Widget>[
                  Text(
                    'Order Details',
                    style: GoogleFonts.lexend(
                      color: AppColors.darkText,
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 15),
                  _detailTile(
                    'Order ID',
                    '#${_shortOrderId(order.id)}',
                  ),
                  _detailTile(
                    'Status',
                    order.statusLabel,
                  ),
                  _detailTile(
                    'Payment',
                    '${order.paymentMethod} • ${order.paymentStatusLabel}',
                  ),
                  _detailTile(
                    'Address',
                    order.address,
                  ),
                  if (order.timeSlot != null)
                    _detailTile(
                      'Delivery slot',
                      order.timeSlot!,
                    ),
                  _detailTile(
                    'Total',
                    '₹${order.totalAmount.toStringAsFixed(0)}',
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'Products',
                    style: GoogleFonts.lexend(
                      color: AppColors.darkText,
                      fontSize: 17,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  ...order.items.map<Widget>(
                        (Map<String, dynamic> item) {
                      return ListTile(
                        contentPadding: EdgeInsets.zero,
                        leading: SizedBox(
                          width: 52,
                          height: 52,
                          child: _buildImage(
                            LocalProductCatalog.imageFor(
                              name: _stringValue(
                                item['name'],
                              ),
                              preferredImage:
                              _stringValue(
                                item['image'],
                              ),
                            ),
                          ),
                        ),
                        title: Text(
                          _stringValue(
                            item['displayName'] ??
                                item['name'],
                          ),
                          style: GoogleFonts.notoSansTelugu(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        subtitle: Text(
                          'Qty ${_intValue(item['quantity'], fallback: 1)}',
                        ),
                        trailing: Text(
                          '₹${(_doubleValue(item['price']) * _intValue(item['quantity'], fallback: 1)).toStringAsFixed(0)}',
                          style: GoogleFonts.lexend(
                            color: AppColors.primaryGreen,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      );
                    },
                  ),
                ],
              );
            },
          ),
        );
      },
    );
  }

  void _showTrackOrder(OrderModel order) {
    showModalBottomSheet<void>(
      context: context,
      showDragHandle: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(26),
        ),
      ),
      builder: (
          BuildContext context,
          ) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(
              20,
              4,
              20,
              24,
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Text(
                  'Track Order',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 20),
                _AnimatedOrderTracker(
                  status: order.normalizedStatus,
                ),
                const SizedBox(height: 18),
                Text(
                  order.isOutForDelivery
                      ? 'Your order is on the way.'
                      : order.isShipped
                      ? 'Your order has been shipped.'
                      : order.isPacked
                      ? 'Your farm items are packed.'
                      : 'Your order is being prepared.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _detailTile(
      String label,
      String value,
      ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 11),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 105,
            child: Text(
              label,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.lato(
                color: AppColors.darkText,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImage(String image) {
    if (image.startsWith('assets/')) {
      return Image.asset(
        image,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) =>
            _fallbackImage(),
      );
    }

    if (image.startsWith('http://') ||
        image.startsWith('https://')) {
      return Image.network(
        image,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) =>
            _fallbackImage(),
      );
    }

    return _fallbackImage();
  }

  Widget _fallbackImage() {
    return const Center(
      child: Icon(
        Icons.eco_rounded,
        color: AppColors.primaryGreen,
        size: 34,
      ),
    );
  }

  void _openCart() {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const CartScreen(),
      ),
    );
  }

  void _goHome() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute<void>(
        builder: (_) => const HomeScreen(),
      ),
          (Route<dynamic> route) => false,
    );
  }

  void _showMessage(
      String message, {
        bool isError = false,
      }) {
    if (!mounted) return;

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
        ),
      );
  }

  String _shortOrderId(String? id) {
    final String value = id?.trim() ?? '';

    if (value.isEmpty) {
      return 'FTH';
    }

    return value.length <= 10
        ? value.toUpperCase()
        : value.substring(0, 10).toUpperCase();
  }

  String _formatDateTime(DateTime date) {
    const List<String> months = <String>[
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return '${date.day.toString().padLeft(2, '0')} '
        '${months[date.month - 1]} ${date.year} • '
        '${_formatHour(date.hour)}:'
        '${date.minute.toString().padLeft(2, '0')} '
        '${date.hour >= 12 ? 'PM' : 'AM'}';
  }

  String _formatHour(int hour) {
    final int converted = hour % 12;
    return (converted == 0 ? 12 : converted).toString();
  }

  static String _stringValue(
      dynamic value, {
        String fallback = '',
      }) {
    if (value == null) return fallback;

    final String result = value.toString().trim();

    return result.isEmpty ? fallback : result;
  }

  static int _intValue(
      dynamic value, {
        int fallback = 0,
      }) {
    if (value is num) return value.toInt();

    if (value is String) {
      return int.tryParse(value.trim()) ?? fallback;
    }

    return fallback;
  }

  static double _doubleValue(
      dynamic value, {
        double fallback = 0,
      }) {
    if (value is num) return value.toDouble();

    if (value is String) {
      return double.tryParse(value.trim()) ?? fallback;
    }

    return fallback;
  }

  static bool _boolValue(
      dynamic value, {
        bool fallback = false,
      }) {
    if (value is bool) return value;
    if (value is num) return value != 0;

    if (value is String) {
      final String normalized =
      value.trim().toLowerCase();

      if (normalized == 'true' || normalized == '1') {
        return true;
      }

      if (normalized == 'false' || normalized == '0') {
        return false;
      }
    }

    return fallback;
  }

  static DateTime? _dateTimeValue(dynamic value) {
    if (value is DateTime) return value;

    if (value is String) {
      return DateTime.tryParse(value.trim());
    }

    try {
      final dynamic result = value?.toDate();

      return result is DateTime ? result : null;
    } catch (_) {
      return null;
    }
  }
}

class _AnimatedOrderTracker extends StatefulWidget {
  final String status;

  const _AnimatedOrderTracker({
    required this.status,
  });

  @override
  State<_AnimatedOrderTracker> createState() =>
      _AnimatedOrderTrackerState();
}

class _AnimatedOrderTrackerState
    extends State<_AnimatedOrderTracker>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _animation;

  int get currentStep {
    switch (widget.status) {
      case 'placed':
        return 1;
      case 'confirmed':
      case 'processing':
        return 2;
      case 'packed':
      case 'shipped':
        return 3;
      case 'out_for_delivery':
      case 'on_the_way':
        return 4;
      case 'delivered':
        return 5;
      case 'cancelled':
        return 1;
      default:
        return 1;
    }
  }

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: Duration(
        milliseconds: 320 * currentStep,
      ),
    );

    _animation = CurvedAnimation(
      parent: _controller,
      curve: Curves.easeInOut,
    );

    _controller.forward();
  }

  @override
  void didUpdateWidget(
      covariant _AnimatedOrderTracker oldWidget,
      ) {
    super.didUpdateWidget(oldWidget);

    if (oldWidget.status != widget.status) {
      _controller
        ..reset()
        ..forward();
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.status == 'cancelled') {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFFFFEBEE),
          borderRadius: BorderRadius.circular(13),
        ),
        child: Row(
          children: <Widget>[
            const Icon(
              Icons.cancel_rounded,
              color: AppColors.errorRed,
            ),
            const SizedBox(width: 9),
            Text(
              'This order was cancelled',
              style: GoogleFonts.lato(
                color: AppColors.errorRed,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
      );
    }

    const List<String> labels = <String>[
      'Placed',
      'Confirmed',
      'Packed',
      'On Way',
      'Delivered',
    ];

    return AnimatedBuilder(
      animation: _animation,
      builder: (
          BuildContext context,
          Widget? child,
          ) {
        return Column(
          children: <Widget>[
            Row(
              children: <Widget>[
                for (int index = 0;
                index < labels.length;
                index++) ...<Widget>[
                  _stepCircle(index + 1),
                  if (index != labels.length - 1)
                    Expanded(
                      child: _divider(index + 1),
                    ),
                ],
              ],
            ),
            const SizedBox(height: 6),
            Row(
              mainAxisAlignment:
              MainAxisAlignment.spaceBetween,
              children: labels.asMap().entries.map<Widget>(
                    (MapEntry<int, String> entry) {
                  return SizedBox(
                    width: 52,
                    child: Text(
                      entry.value,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.lato(
                        fontSize: 8.5,
                        color: entry.key + 1 <= currentStep
                            ? AppColors.primaryGreen
                            : Colors.grey.shade400,
                        fontWeight:
                        entry.key + 1 <= currentStep
                            ? FontWeight.w700
                            : FontWeight.w500,
                      ),
                    ),
                  );
                },
              ).toList(),
            ),
          ],
        );
      },
    );
  }

  Widget _stepCircle(int step) {
    final bool active = step <= currentStep;
    final bool current = step == currentStep;

    return Container(
      width: 27,
      height: 27,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: active
            ? AppColors.primaryGreen
            : Colors.grey.shade300,
        boxShadow: current
            ? const <BoxShadow>[
          BoxShadow(
            color: Color(0x661B5E20),
            blurRadius: 8,
          ),
        ]
            : null,
      ),
      child: active
          ? const Icon(
        Icons.check_rounded,
        color: Colors.white,
        size: 16,
      )
          : Center(
        child: Text(
          '$step',
          style: const TextStyle(
            color: Colors.white,
            fontSize: 11,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }

  Widget _divider(int step) {
    final bool filled = step < currentStep;

    return Container(
      height: 3,
      color: filled
          ? AppColors.primaryGreen
          : Colors.grey.shade300,
    );
  }
}