import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/order_model.dart';
import '../../services/order_service.dart';
import '../home/home_screen.dart';
import 'order_details_screen.dart';
import 'track_order_screen.dart';

class OrderSuccessScreen extends StatefulWidget {
  final OrderModel? order;

  const OrderSuccessScreen({
    super.key,
    this.order,
  });

  @override
  State<OrderSuccessScreen> createState() => _OrderSuccessScreenState();
}

class _OrderSuccessScreenState extends State<OrderSuccessScreen> {
  final OrderService _orderService = OrderService();

  OrderModel? _order;
  bool _isLoading = true;
  String? _errorMessage;

  Timer? _refreshTimer;
  Timer? _countdownTimer;
  Duration _estimatedRemaining = Duration.zero;

  @override
  void initState() {
    super.initState();
    _order = widget.order;

    if (_order != null) {
      _isLoading = false;
      _updateEstimatedRemaining(_order!);
    } else {
      _loadLatestOrder();
    }

    _startAutoRefresh();
    _startCountdown();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _countdownTimer?.cancel();
    super.dispose();
  }

  void _startAutoRefresh() {
    _refreshTimer?.cancel();

    _refreshTimer = Timer.periodic(
      const Duration(seconds: 20),
          (_) {
        if (!mounted) return;
        _refreshCurrentOrder();
      },
    );
  }

  void _startCountdown() {
    _countdownTimer?.cancel();

    _countdownTimer = Timer.periodic(
      const Duration(seconds: 1),
          (_) {
        if (!mounted || _estimatedRemaining <= Duration.zero) {
          return;
        }

        setState(() {
          _estimatedRemaining -= const Duration(seconds: 1);
        });
      },
    );
  }

  Future<void> _refreshCurrentOrder() async {
    final OrderModel? currentOrder = _order;
    final String? orderId = currentOrder?.id;

    if (orderId == null || orderId.trim().isEmpty) {
      return;
    }

    try {
      final OrderModel? refreshed =
      await _orderService.getOrderById(orderId);

      if (!mounted || refreshed == null) {
        return;
      }

      setState(() {
        _order = refreshed;
        _updateEstimatedRemaining(refreshed);
      });
    } catch (_) {
      // Keep the current success screen visible when refresh fails.
    }
  }

  void _updateEstimatedRemaining(OrderModel order) {
    if (order.isDelivered || order.isCancelled) {
      _estimatedRemaining = Duration.zero;
      return;
    }

    final DateTime now = DateTime.now();
    final DateTime estimate =
        order.expectedDeliveryDate ??
            (order.hasPreOrderItems
                ? order.timestamp.add(const Duration(days: 1))
                : order.timestamp.add(const Duration(minutes: 45)));

    final Duration remaining = estimate.difference(now);

    _estimatedRemaining =
    remaining.isNegative ? Duration.zero : remaining;
  }

  Future<void> _loadLatestOrder() async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _errorMessage = 'Please sign in to view your order details.';
      });
      return;
    }

    try {
      final List<OrderModel> orders =
      await _orderService.getUserOrdersOnce(
        user.uid,
        limit: 1,
      );

      if (!mounted) return;

      setState(() {
        _order = orders.isEmpty ? null : orders.first;
        if (_order != null) {
          _updateEstimatedRemaining(_order!);
        }
        _isLoading = false;
        _errorMessage = orders.isEmpty
            ? 'Your order was placed, but its details are not available yet.'
            : null;
      });
    } catch (_) {
      if (!mounted) return;

      setState(() {
        _isLoading = false;
        _errorMessage =
        'Your order was placed successfully. Order details could not be loaded right now.';
      });
    }
  }

  void _goHome() {
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute<void>(
        builder: (_) => const HomeScreen(),
      ),
          (Route<dynamic> route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      body: SafeArea(
        child: _isLoading
            ? const Center(
          child: CircularProgressIndicator(
            color: AppColors.primaryGreen,
          ),
        )
            : _buildContent(),
      ),
    );
  }

  Widget _buildContent() {
    final OrderModel? order = _order;

    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: <Widget>[
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 28, 18, 12),
            child: Column(
              children: <Widget>[
                BounceInDown(
                  child: SizedBox(
                    width: 180,
                    height: 145,
                    child: Stack(
                      alignment: Alignment.center,
                      children: <Widget>[
                        const Positioned(
                          left: 8,
                          top: 18,
                          child: _ConfettiDot(
                            color: AppColors.goldAmber,
                            size: 12,
                          ),
                        ),
                        const Positioned(
                          right: 13,
                          top: 12,
                          child: _ConfettiDot(
                            color: AppColors.primaryGreen,
                            size: 10,
                          ),
                        ),
                        const Positioned(
                          left: 24,
                          bottom: 18,
                          child: _ConfettiDot(
                            color: Color(0xFFEF5350),
                            size: 8,
                          ),
                        ),
                        const Positioned(
                          right: 28,
                          bottom: 20,
                          child: _ConfettiDot(
                            color: Color(0xFF42A5F5),
                            size: 9,
                          ),
                        ),
                        Container(
                          width: 112,
                          height: 112,
                          decoration: BoxDecoration(
                            color: AppColors.lightMint,
                            shape: BoxShape.circle,
                            boxShadow: const <BoxShadow>[
                              BoxShadow(
                                color: Color(0x1F1B5E20),
                                blurRadius: 28,
                                offset: Offset(0, 12),
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.check_circle_rounded,
                            size: 78,
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 22),
                FadeInUp(
                  child: Text(
                    'Order Placed Successfully!',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.lexend(
                      fontSize: 25,
                      fontWeight: FontWeight.w800,
                      color: AppColors.darkText,
                    ),
                  ),
                ),
                const SizedBox(height: 8),
                FadeInUp(
                  delay: const Duration(milliseconds: 220),
                  child: Text(
                    order == null
                        ? 'Your fresh farm items are being prepared.'
                        : _successSubtitle(order),
                    textAlign: TextAlign.center,
                    style: GoogleFonts.lato(
                      fontSize: 14,
                      height: 1.45,
                      color: Colors.grey.shade600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (_errorMessage != null)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: 18,
                vertical: 8,
              ),
              child: _messageCard(_errorMessage!),
            ),
          ),
        if (order != null) ...<Widget>[
          SliverToBoxAdapter(
            child: FadeInUp(
              delay: const Duration(milliseconds: 300),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 10, 18, 0),
                child: _buildOrderSummary(order),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: FadeInUp(
              delay: const Duration(milliseconds: 380),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
                child: _buildDeliverySummary(order),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: FadeInUp(
              delay: const Duration(milliseconds: 460),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
                child: _buildItemsSection(order),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: FadeInUp(
              delay: const Duration(milliseconds: 540),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
                child: _buildAddressAndPayment(order),
              ),
            ),
          ),
        ],
        if (order != null)
          SliverToBoxAdapter(
            child: FadeInUp(
              delay: const Duration(milliseconds: 575),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
                child: _buildEstimatedDeliveryCard(order),
              ),
            ),
          ),
        if (order != null)
          SliverToBoxAdapter(
            child: FadeInUp(
              delay: const Duration(milliseconds: 590),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(18, 16, 18, 0),
                child: _buildRewardsAndRatingCard(order),
              ),
            ),
          ),
        SliverToBoxAdapter(
          child: ZoomIn(
            delay: const Duration(milliseconds: 600),
            child: Padding(
              padding: const EdgeInsets.fromLTRB(18, 22, 18, 28),
              child: _buildActions(order),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildOrderSummary(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionHeader(
            icon: Icons.receipt_long_rounded,
            title: 'Order Summary',
          ),
          const SizedBox(height: 16),
          _copyableOrderIdRow(order),
          _detailRow(
            'Status',
            order.statusLabel,
            valueColor: AppColors.primaryGreen,
          ),
          _detailRow(
            'Items',
            '${order.totalItemCount}',
          ),
          if (order.hasQuickItems)
            _detailRow(
              'Quick items',
              '${order.quickItemCount}',
            ),
          if (order.hasPreOrderItems)
            _detailRow(
              'Pre-order items',
              '${order.preOrderItemCount}',
            ),
          const Divider(height: 24),
          _detailRow(
            'Grand total',
            '₹${order.totalAmount.toStringAsFixed(0)}',
            bold: true,
            valueColor: AppColors.primaryGreen,
          ),
        ],
      ),
    );
  }

  Widget _buildDeliverySummary(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionHeader(
            icon: Icons.local_shipping_rounded,
            title: 'Delivery Plan',
          ),
          const SizedBox(height: 16),
          if (order.hasQuickItems)
            _deliveryTile(
              icon: Icons.bolt_rounded,
              title: 'Quick Delivery',
              subtitle:
              '${order.quickItemCount} item${order.quickItemCount == 1 ? '' : 's'} are being prepared immediately.',
              badge: 'FAST',
            ),
          if (order.hasQuickItems && order.hasPreOrderItems)
            const SizedBox(height: 12),
          if (order.hasPreOrderItems)
            _deliveryTile(
              icon: Icons.agriculture_rounded,
              title: 'Harvest Delivery',
              subtitle:
              '${order.preOrderItemCount} pre-order item${order.preOrderItemCount == 1 ? '' : 's'} will follow the selected harvest schedule.',
              badge: 'PRE-ORDER',
            ),
          if (order.timeSlot != null &&
              order.timeSlot!.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 14),
            _detailRow(
              'Delivery slot',
              order.timeSlot!,
            ),
          ],
          if (order.expectedDeliveryDate != null)
            _detailRow(
              'Expected date',
              _formatDate(order.expectedDeliveryDate!),
            ),
          if (order.deliveryInstruction.trim().isNotEmpty)
            _detailRow(
              'Instruction',
              order.deliveryInstruction,
            ),
          _detailRow(
            'Packing',
            order.ecoFriendlyPacking
                ? 'Eco-friendly packing'
                : 'Standard packing',
          ),
        ],
      ),
    );
  }

  Widget _buildItemsSection(OrderModel order) {
    final Map<String, List<Map<String, dynamic>>> groups =
        order.itemsGroupedByFarmer;

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionHeader(
            icon: Icons.shopping_basket_rounded,
            title: 'Your Farm Items',
          ),
          const SizedBox(height: 16),
          ...groups.entries.map<Widget>(
                (MapEntry<String, List<Map<String, dynamic>>> entry) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Container(
                          width: 38,
                          height: 38,
                          decoration: BoxDecoration(
                            color: AppColors.lightMint,
                            borderRadius: BorderRadius.circular(11),
                          ),
                          child: const Icon(
                            Icons.agriculture_rounded,
                            color: AppColors.primaryGreen,
                            size: 21,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            entry.key,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.lexend(
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                              color: AppColors.darkText,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      height: 220,
                      child: ListView.separated(
                        scrollDirection: Axis.horizontal,
                        itemCount: entry.value.length,
                        separatorBuilder: (_, __) =>
                        const SizedBox(width: 12),
                        itemBuilder: (
                            BuildContext context,
                            int index,
                            ) {
                          return _itemCard(entry.value[index]);
                        },
                      ),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _itemCard(Map<String, dynamic> item) {
    final String name = _stringValue(
      item['displayName'] ?? item['name'],
      fallback: 'Farm Product',
    );
    final String image = LocalProductCatalog.imageFor(
      name: _stringValue(item['name']),
      preferredImage: _stringValue(item['image']),
    );
    final int quantity = _intValue(
      item['quantity'],
      fallback: 1,
    );
    final double price = _doubleValue(item['price']);
    final bool isQuick = _boolValue(item['isQuick']);
    final bool isPreOrder = _boolValue(item['isPreOrder']);

    return Container(
      width: 158,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(17),
        border: Border.all(
          color: const Color(0xFFE2EAE3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Stack(
              children: <Widget>[
                Positioned.fill(
                  child: Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(13),
                    ),
                    child: _buildProductImage(image),
                  ),
                ),
                if (isQuick)
                  Positioned(
                    left: 6,
                    bottom: 6,
                    child: _smallStatusBadge(
                      'QUICK',
                      AppColors.goldAmber,
                    ),
                  ),
                if (isPreOrder)
                  Positioned(
                    right: 6,
                    bottom: 6,
                    child: _smallStatusBadge(
                      'PRE-ORDER',
                      AppColors.primaryGreen,
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            name,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.notoSansTelugu(
              fontSize: 11,
              height: 1.3,
              fontWeight: FontWeight.w700,
              color: AppColors.darkText,
            ),
          ),
          const SizedBox(height: 5),
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  'Qty: $quantity',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 10,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              Text(
                '₹${(price * quantity).toStringAsFixed(0)}',
                style: GoogleFonts.lexend(
                  color: AppColors.primaryGreen,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildAddressAndPayment(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionHeader(
            icon: Icons.location_on_rounded,
            title: 'Delivery & Payment',
          ),
          const SizedBox(height: 16),
          _infoBlock(
            icon: Icons.home_rounded,
            title: 'Delivering to',
            value: order.address,
          ),
          const SizedBox(height: 12),
          _infoBlock(
            icon: Icons.account_balance_wallet_rounded,
            title: 'Payment',
            value:
            '${order.paymentMethod} • ${order.paymentStatusLabel}',
          ),
          if (order.customerNote.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 12),
            _infoBlock(
              icon: Icons.notes_rounded,
              title: 'Order note',
              value: order.customerNote,
            ),
          ],
        ],
      ),
    );
  }


  Widget _buildActions(OrderModel? order) {
    final bool hasValidOrderId =
        order?.id != null && order!.id!.trim().isNotEmpty;

    return Column(
      children: <Widget>[
        if (order != null && hasValidOrderId) ...<Widget>[
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: () => _openTrackOrder(order),
              icon: const Icon(
                Icons.location_searching_rounded,
              ),
              label: Text(
                'TRACK ORDER',
                style: GoogleFonts.lexend(
                  fontWeight: FontWeight.w800,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
              ),
            ),
          ),
          const SizedBox(height: 11),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              onPressed: () => _openOrderDetails(order),
              icon: const Icon(
                Icons.receipt_long_rounded,
              ),
              label: Text(
                'VIEW ORDER DETAILS',
                style: GoogleFonts.lexend(
                  fontWeight: FontWeight.w800,
                ),
              ),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryGreen,
                side: const BorderSide(
                  color: AppColors.primaryGreen,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
              ),
            ),
          ),
          const SizedBox(height: 11),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _downloadInvoice(order),
                  icon: const Icon(
                    Icons.download_rounded,
                  ),
                  label: const Text('Invoice'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _shareOrder(order),
                  icon: const Icon(
                    Icons.share_rounded,
                  ),
                  label: const Text('Share'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 11),
        ],
        SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton.icon(
            onPressed: _goHome,
            icon: const Icon(Icons.home_rounded),
            label: Text(
              'CONTINUE SHOPPING',
              style: GoogleFonts.lexend(
                fontWeight: FontWeight.w800,
              ),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primaryGreen,
              side: const BorderSide(
                color: AppColors.primaryGreen,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(15),
              ),
            ),
          ),
        ),
      ],
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

  Future<void> _downloadInvoice(OrderModel order) async {
    _showMessage(
      'Invoice structure is ready. PDF generation will be connected in the invoice module.',
    );
  }

  Future<void> _shareOrder(OrderModel order) async {
    final String text =
        'Farm To Home Order #${_shortOrderId(order.id)} • '
        '${order.totalItemCount} items • '
        '₹${order.totalAmount.toStringAsFixed(0)} • '
        '${order.statusLabel}';

    await Clipboard.setData(
      ClipboardData(text: text),
    );

    _showMessage(
      'Order summary copied. You can paste it in any app.',
    );
  }

  Widget _copyableOrderIdRow(OrderModel order) {
    final String visibleId = '#${_shortOrderId(order.id)}';

    return Padding(
      padding: const EdgeInsets.only(bottom: 11),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Text(
              'Order ID',
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 13,
              ),
            ),
          ),
          Text(
            visibleId,
            style: GoogleFonts.lexend(
              color: AppColors.darkText,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: 6),
          InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () async {
              await Clipboard.setData(
                ClipboardData(
                  text: order.id ?? visibleId,
                ),
              );

              _showMessage('Order ID copied.');
            },
            child: const Padding(
              padding: EdgeInsets.all(5),
              child: Icon(
                Icons.copy_rounded,
                color: AppColors.primaryGreen,
                size: 18,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEstimatedDeliveryCard(OrderModel order) {
    final String countdown = _formatCountdown(
      _estimatedRemaining,
    );

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionHeader(
            icon: Icons.timer_outlined,
            title: 'Estimated Delivery',
          ),
          const SizedBox(height: 16),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(15),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: <Color>[
                  Color(0xFFFFF8E1),
                  AppColors.lightMint,
                ],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              children: <Widget>[
                Text(
                  order.isDelivered
                      ? 'Delivered successfully'
                      : order.isCancelled
                      ? 'Order cancelled'
                      : countdown,
                  style: GoogleFonts.lexend(
                    color: order.isCancelled
                        ? AppColors.errorRed
                        : AppColors.primaryGreen,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  order.isDelivered
                      ? 'Thank you for choosing fresh farm products.'
                      : order.hasPreOrderItems
                      ? 'Harvest and slot timings are considered in this estimate.'
                      : 'We will keep this status refreshed automatically.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 11,
                    height: 1.4,
                  ),
                ),
                if (order.timeSlot != null &&
                    order.timeSlot!.trim().isNotEmpty) ...<Widget>[
                  const SizedBox(height: 10),
                  _smallStatusBadge(
                    order.timeSlot!,
                    AppColors.primaryGreen,
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRewardsAndRatingCard(OrderModel order) {
    final int points = (order.totalAmount / 10).floor();

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionHeader(
            icon: Icons.workspace_premium_rounded,
            title: 'Rewards & Experience',
          ),
          const SizedBox(height: 15),
          Row(
            children: <Widget>[
              Container(
                width: 52,
                height: 52,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(15),
                ),
                child: const Icon(
                  Icons.stars_rounded,
                  color: AppColors.goldAmber,
                  size: 28,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'You earned $points Farm Rewards points on this order.',
                  style: GoogleFonts.lato(
                    color: AppColors.darkText,
                    fontSize: 13,
                    height: 1.4,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 13),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              color: AppColors.lightCream,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: <Widget>[
                const Icon(
                  Icons.star_outline_rounded,
                  color: AppColors.primaryGreen,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    order.isDelivered
                        ? 'Rate your products and delivery experience.'
                        : 'You can rate your experience after delivery.',
                    style: GoogleFonts.lato(
                      color: Colors.grey.shade700,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatCountdown(Duration duration) {
    if (duration <= Duration.zero) {
      return 'Delivery update coming soon';
    }

    final int days = duration.inDays;
    final int hours = duration.inHours.remainder(24);
    final int minutes = duration.inMinutes.remainder(60);
    final int seconds = duration.inSeconds.remainder(60);

    if (days > 0) {
      return '${days}d ${hours}h ${minutes}m';
    }

    return '${hours.toString().padLeft(2, '0')}:'
        '${minutes.toString().padLeft(2, '0')}:'
        '${seconds.toString().padLeft(2, '0')}';
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
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(13),
          ),
        ),
      );
  }

  Widget _deliveryTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required String badge,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: const Color(0xFFE2EAE3),
        ),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppColors.lightMint,
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              icon,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: GoogleFonts.lexend(
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                    color: AppColors.darkText,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.lato(
                    fontSize: 11,
                    height: 1.4,
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          _smallStatusBadge(
            badge,
            AppColors.primaryGreen,
          ),
        ],
      ),
    );
  }

  Widget _infoBlock({
    required IconData icon,
    required String title,
    required String value,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(
            icon,
            color: AppColors.primaryGreen,
            size: 22,
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  value,
                  style: GoogleFonts.lato(
                    color: AppColors.darkText,
                    fontSize: 13,
                    height: 1.4,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionHeader({
    required IconData icon,
    required String title,
  }) {
    return Row(
      children: <Widget>[
        Container(
          width: 39,
          height: 39,
          decoration: BoxDecoration(
            color: AppColors.lightMint,
            borderRadius: BorderRadius.circular(11),
          ),
          child: Icon(
            icon,
            color: AppColors.primaryGreen,
            size: 21,
          ),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Text(
            title,
            style: GoogleFonts.lexend(
              fontSize: 18,
              fontWeight: FontWeight.w800,
              color: AppColors.darkText,
            ),
          ),
        ),
      ],
    );
  }

  Widget _detailRow(
      String label,
      String value, {
        bool bold = false,
        Color? valueColor,
      }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 11),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: bold ? 14 : 13,
                fontWeight:
                bold ? FontWeight.w700 : FontWeight.w500,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: GoogleFonts.lexend(
                color: valueColor ?? AppColors.darkText,
                fontSize: bold ? 17 : 13,
                fontWeight:
                bold ? FontWeight.w800 : FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _smallStatusBadge(
      String label,
      Color color,
      ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 7,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 7,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _buildProductImage(String image) {
    if (image.startsWith('assets/')) {
      return Image.asset(
        image,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => _fallbackImage(),
      );
    }

    if (image.startsWith('http://') ||
        image.startsWith('https://')) {
      return Image.network(
        image,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => _fallbackImage(),
      );
    }

    return _fallbackImage();
  }

  Widget _fallbackImage() {
    return const Center(
      child: Icon(
        Icons.eco_rounded,
        color: AppColors.primaryGreen,
        size: 44,
      ),
    );
  }

  Widget _messageCard(String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8E1),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFFFE0A3),
        ),
      ),
      child: Text(
        message,
        textAlign: TextAlign.center,
        style: GoogleFonts.lato(
          color: AppColors.darkText,
          fontSize: 12,
          height: 1.4,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }

  Widget _card({
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFFE2EAE3),
        ),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 16,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: child,
    );
  }

  String _successSubtitle(OrderModel order) {
    if (order.hasPreOrderItems && order.hasQuickItems) {
      return 'Your quick items are being prepared and your pre-order items are reserved with the farmers.';
    }

    if (order.hasPreOrderItems) {
      return 'Your harvest products have been reserved successfully.';
    }

    return 'Your fresh farm items are being prepared for delivery.';
  }

  String _shortOrderId(String? id) {
    final String value = id?.trim() ?? '';

    if (value.isEmpty) {
      return 'FTH-${DateTime.now().millisecondsSinceEpoch.toString().substring(6)}';
    }

    if (value.length <= 12) {
      return value.toUpperCase();
    }

    return value.substring(0, 12).toUpperCase();
  }

  String _formatDate(DateTime date) {
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
        '${months[date.month - 1]} ${date.year}';
  }

  static String _stringValue(
      dynamic value, {
        String fallback = '',
      }) {
    if (value == null) {
      return fallback;
    }

    final String result = value.toString().trim();

    return result.isEmpty ? fallback : result;
  }

  static int _intValue(
      dynamic value, {
        int fallback = 0,
      }) {
    if (value is num) {
      return value.toInt();
    }

    if (value is String) {
      return int.tryParse(value.trim()) ?? fallback;
    }

    return fallback;
  }

  static double _doubleValue(
      dynamic value, {
        double fallback = 0,
      }) {
    if (value is num) {
      return value.toDouble();
    }

    if (value is String) {
      return double.tryParse(value.trim()) ?? fallback;
    }

    return fallback;
  }

  static bool _boolValue(
      dynamic value, {
        bool fallback = false,
      }) {
    if (value is bool) {
      return value;
    }

    if (value is num) {
      return value != 0;
    }

    if (value is String) {
      final String normalized = value.trim().toLowerCase();

      if (normalized == 'true' || normalized == '1') {
        return true;
      }

      if (normalized == 'false' || normalized == '0') {
        return false;
      }
    }

    return fallback;
  }
}

class _ConfettiDot extends StatefulWidget {
  final Color color;
  final double size;

  const _ConfettiDot({
    required this.color,
    required this.size,
  });

  @override
  State<_ConfettiDot> createState() => _ConfettiDotState();
}

class _ConfettiDotState extends State<_ConfettiDot>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    )..repeat(reverse: true);

    _scale = Tween<double>(
      begin: 0.65,
      end: 1.25,
    ).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Curves.easeInOut,
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ScaleTransition(
      scale: _scale,
      child: Container(
        width: widget.size,
        height: widget.size,
        decoration: BoxDecoration(
          color: widget.color,
          shape: BoxShape.circle,
        ),
      ),
    );
  }
}
