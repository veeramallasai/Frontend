import 'dart:async';

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/order_model.dart';
import '../../services/order_service.dart';
import 'order_details_screen.dart';

class TrackOrderScreen extends StatefulWidget {
  final String orderId;
  final OrderModel? initialOrder;

  const TrackOrderScreen({
    super.key,
    required this.orderId,
    this.initialOrder,
  });

  @override
  State<TrackOrderScreen> createState() => _TrackOrderScreenState();
}

class _TrackOrderScreenState extends State<TrackOrderScreen> {
  final OrderService _orderService = OrderService();

  Timer? _etaTimer;
  int _remainingEtaMinutes = 0;

  @override
  void initState() {
    super.initState();
    _startEtaTicker();
  }

  @override
  void dispose() {
    _etaTimer?.cancel();
    super.dispose();
  }

  void _startEtaTicker() {
    _etaTimer?.cancel();

    _etaTimer = Timer.periodic(
      const Duration(minutes: 1),
          (_) {
        if (!mounted || _remainingEtaMinutes <= 0) {
          return;
        }

        setState(() {
          _remainingEtaMinutes--;
        });
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: Text(
          'Track Order',
          style: GoogleFonts.lexend(
            color: AppColors.darkText,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
      body: StreamBuilder<OrderModel?>(
        stream: _orderService.watchOrderById(widget.orderId),
        initialData: widget.initialOrder,
        builder: (
            BuildContext context,
            AsyncSnapshot<OrderModel?> snapshot,
            ) {
          if (snapshot.connectionState == ConnectionState.waiting &&
              snapshot.data == null) {
            return const Center(
              child: CircularProgressIndicator(
                color: AppColors.primaryGreen,
              ),
            );
          }

          if (snapshot.hasError) {
            return _buildErrorState();
          }

          final OrderModel? order = snapshot.data;

          if (order == null) {
            return _buildNotFoundState();
          }

          _syncEta(order);

          return _buildContent(order);
        },
      ),
    );
  }

  void _syncEta(OrderModel order) {
    int eta = 0;

    if (order.isOutForDelivery) {
      eta = 20;
    } else if (order.isShipped) {
      eta = 45;
    } else if (order.isPacked) {
      eta = 75;
    }

    if (_remainingEtaMinutes == 0 && eta > 0) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted || _remainingEtaMinutes != 0) {
          return;
        }

        setState(() {
          _remainingEtaMinutes = eta;
        });
      });
    }
  }

  Widget _buildContent(OrderModel order) {
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: <Widget>[
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildHeroCard(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildMapReadyCard(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildTimelineCard(order),
          ),
        ),
        if (order.deliveryPartnerName.trim().isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: _buildDeliveryPartnerCard(order),
            ),
          ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildDeliveryPlan(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildProducts(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildAddressCard(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 28),
            child: _buildActions(order),
          ),
        ),
      ],
    );
  }

  Widget _buildHeroCard(OrderModel order) {
    final String title;
    final String subtitle;
    final IconData icon;

    if (order.isDelivered) {
      title = 'Order Delivered';
      subtitle = 'Your fresh farm products were delivered successfully.';
      icon = Icons.check_circle_rounded;
    } else if (order.isOutForDelivery) {
      title = 'Your order is on the way';
      subtitle = _remainingEtaMinutes > 0
          ? 'Estimated arrival in $_remainingEtaMinutes minutes.'
          : 'Delivery partner is heading to your address.';
      icon = Icons.delivery_dining_rounded;
    } else if (order.isShipped) {
      title = 'Order shipped';
      subtitle = 'Your farm products are moving towards the delivery hub.';
      icon = Icons.local_shipping_rounded;
    } else if (order.isPacked) {
      title = 'Order packed';
      subtitle = 'Your products are packed and ready for dispatch.';
      icon = Icons.inventory_2_rounded;
    } else if (order.isConfirmed) {
      title = 'Order confirmed';
      subtitle = 'The farms have confirmed and started preparing your items.';
      icon = Icons.verified_rounded;
    } else if (order.isCancelled) {
      title = 'Order cancelled';
      subtitle = order.cancellationReason.trim().isEmpty
          ? 'This order has been cancelled.'
          : order.cancellationReason;
      icon = Icons.cancel_rounded;
    } else {
      title = 'Order placed';
      subtitle = 'Your order has been received and is awaiting confirmation.';
      icon = Icons.receipt_long_rounded;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: order.isCancelled
              ? const <Color>[
            Color(0xFFC62828),
            Color(0xFFEF5350),
          ]
              : const <Color>[
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
        ),
        borderRadius: BorderRadius.circular(24),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x261B5E20),
            blurRadius: 20,
            offset: Offset(0, 9),
          ),
        ],
      ),
      child: Column(
        children: <Widget>[
          Container(
            width: 74,
            height: 74,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.18),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 40,
            ),
          ),
          const SizedBox(height: 15),
          Text(
            title,
            textAlign: TextAlign.center,
            style: GoogleFonts.lexend(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            subtitle,
            textAlign: TextAlign.center,
            style: GoogleFonts.lato(
              color: Colors.white.withValues(alpha: 0.9),
              fontSize: 13,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 7,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
            ),
            child: Text(
              'ORDER #${_shortOrderId(order.id)}',
              style: GoogleFonts.lexend(
                color: order.isCancelled
                    ? AppColors.errorRed
                    : AppColors.primaryGreen,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMapReadyCard(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.map_outlined,
            'Live Delivery Map',
          ),
          const SizedBox(height: 15),
          Container(
            width: double.infinity,
            height: 220,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF3EC),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: const Color(0xFFD6E4D8),
              ),
            ),
            child: Stack(
              children: <Widget>[
                Positioned.fill(
                  child: CustomPaint(
                    painter: _RoutePainter(
                      active: order.isShipped ||
                          order.isOutForDelivery ||
                          order.isDelivered,
                    ),
                  ),
                ),
                const Positioned(
                  left: 30,
                  bottom: 28,
                  child: _MapPin(
                    icon: Icons.agriculture_rounded,
                    label: 'Farm',
                  ),
                ),
                Positioned(
                  right: 28,
                  top: 28,
                  child: _MapPin(
                    icon: order.isDelivered
                        ? Icons.home_rounded
                        : Icons.location_on_rounded,
                    label: order.isDelivered
                        ? 'Delivered'
                        : 'Your address',
                  ),
                ),
                if (order.isOutForDelivery)
                  const Positioned(
                    left: 145,
                    top: 92,
                    child: CircleAvatar(
                      radius: 23,
                      backgroundColor: AppColors.primaryGreen,
                      child: Icon(
                        Icons.delivery_dining_rounded,
                        color: Colors.white,
                      ),
                    ),
                  ),
                Positioned(
                  left: 12,
                  right: 12,
                  bottom: 12,
                  child: Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.94),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      order.isOutForDelivery
                          ? 'Live location structure is ready. Connect Google Maps later for real GPS tracking.'
                          : 'Map will activate when the delivery partner starts the trip.',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade700,
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                      ),
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

  Widget _buildTimelineCard(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.timeline_rounded,
            'Live Order Timeline',
          ),
          const SizedBox(height: 18),
          _TrackingTimeline(order: order),
        ],
      ),
    );
  }

  Widget _buildDeliveryPartnerCard(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.delivery_dining_rounded,
            'Delivery Partner',
          ),
          const SizedBox(height: 16),
          Row(
            children: <Widget>[
              CircleAvatar(
                radius: 31,
                backgroundColor: AppColors.lightMint,
                child: Text(
                  order.deliveryPartnerName.isEmpty
                      ? 'D'
                      : order.deliveryPartnerName[0].toUpperCase(),
                  style: GoogleFonts.lexend(
                    color: AppColors.primaryGreen,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      order.deliveryPartnerName,
                      style: GoogleFonts.lexend(
                        color: AppColors.darkText,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    if (order.deliveryVehicleNumber.trim().isNotEmpty)
                      Text(
                        order.deliveryVehicleNumber,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          fontSize: 12,
                        ),
                      ),
                    if (_remainingEtaMinutes > 0)
                      Text(
                        'ETA: $_remainingEtaMinutes minutes',
                        style: GoogleFonts.lato(
                          color: AppColors.primaryGreen,
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                  ],
                ),
              ),
              if (order.deliveryPartnerPhone.trim().isNotEmpty)
                IconButton.filled(
                  onPressed: () {
                    _showMessage(
                      'Call ${order.deliveryPartnerPhone}',
                    );
                  },
                  style: IconButton.styleFrom(
                    backgroundColor: AppColors.primaryGreen,
                  ),
                  icon: const Icon(
                    Icons.call_rounded,
                    color: Colors.white,
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryPlan(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.event_available_rounded,
            'Delivery Plan',
          ),
          const SizedBox(height: 16),
          if (order.hasQuickItems)
            _deliveryPlanTile(
              Icons.bolt_rounded,
              'Quick Delivery',
              '${order.quickItemCount} item${order.quickItemCount == 1 ? '' : 's'} prepared immediately',
            ),
          if (order.hasQuickItems && order.hasPreOrderItems)
            const SizedBox(height: 11),
          if (order.hasPreOrderItems)
            _deliveryPlanTile(
              Icons.agriculture_rounded,
              'Harvest Delivery',
              '${order.preOrderItemCount} pre-order item${order.preOrderItemCount == 1 ? '' : 's'} reserved with farmers',
            ),
          if (order.timeSlot != null &&
              order.timeSlot!.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 13),
            _infoRow(
              Icons.schedule_rounded,
              'Delivery slot',
              order.timeSlot!,
            ),
          ],
          if (order.expectedDeliveryDate != null)
            _infoRow(
              Icons.calendar_month_rounded,
              'Expected date',
              _formatDate(order.expectedDeliveryDate!),
            ),
        ],
      ),
    );
  }

  Widget _buildProducts(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.shopping_basket_rounded,
            'Order Items',
          ),
          const SizedBox(height: 15),
          SizedBox(
            height: 210,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: order.items.length,
              separatorBuilder: (_, __) =>
              const SizedBox(width: 11),
              itemBuilder: (
                  BuildContext context,
                  int index,
                  ) {
                return _productCard(order.items[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _productCard(Map<String, dynamic> item) {
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
    final bool quick = _boolValue(item['isQuick']);
    final bool preOrder = _boolValue(item['isPreOrder']);

    return Container(
      width: 156,
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
                    child: _buildImage(image),
                  ),
                ),
                if (quick)
                  Positioned(
                    left: 5,
                    bottom: 5,
                    child: _tinyBadge(
                      'QUICK',
                      AppColors.goldAmber,
                    ),
                  ),
                if (preOrder)
                  Positioned(
                    right: 5,
                    bottom: 5,
                    child: _tinyBadge(
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
              color: AppColors.darkText,
              fontSize: 11,
              fontWeight: FontWeight.w700,
              height: 1.3,
            ),
          ),
          const SizedBox(height: 5),
          Text(
            'Qty: $quantity',
            style: GoogleFonts.lato(
              color: Colors.grey.shade600,
              fontSize: 10,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressCard(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.location_on_outlined,
            'Delivery Address',
          ),
          const SizedBox(height: 15),
          _infoRow(
            Icons.home_outlined,
            'Address',
            order.address,
          ),
          if (order.deliveryInstruction.trim().isNotEmpty)
            _infoRow(
              Icons.delivery_dining_outlined,
              'Instruction',
              order.deliveryInstruction,
            ),
          _infoRow(
            Icons.recycling_rounded,
            'Packing',
            order.ecoFriendlyPacking
                ? 'Eco-friendly packing'
                : 'Standard packing',
          ),
        ],
      ),
    );
  }

  Widget _buildActions(OrderModel order) {
    return Column(
      children: <Widget>[
        SizedBox(
          width: double.infinity,
          height: 52,
          child: ElevatedButton.icon(
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => OrderDetailsScreen(
                    orderId: widget.orderId,
                    initialOrder: order,
                  ),
                ),
              );
            },
            icon: const Icon(Icons.receipt_long_rounded),
            label: Text(
              'VIEW ORDER DETAILS',
              style: GoogleFonts.lexend(
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ),
        if (order.canCancel) ...<Widget>[
          const SizedBox(height: 11),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              onPressed: () => _cancelOrder(order),
              icon: const Icon(
                Icons.cancel_outlined,
                color: AppColors.errorRed,
              ),
              label: Text(
                'CANCEL ORDER',
                style: GoogleFonts.lexend(
                  color: AppColors.errorRed,
                  fontWeight: FontWeight.w800,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: const BorderSide(
                  color: AppColors.errorRed,
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Future<void> _cancelOrder(OrderModel order) async {
    if (order.id == null) {
      return;
    }

    final bool? confirmed =
    await showDialog<bool>(
      context: context,
      builder: (
          BuildContext dialogContext,
          ) {
        return AlertDialog(
          title: const Text('Cancel Order?'),
          content: const Text(
            'This action cannot be undone after confirmation.',
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext, false);
              },
              child: const Text('Keep Order'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext, true);
              },
              child: const Text(
                'Cancel Order',
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

    try {
      await _orderService.cancelOrder(
        orderId: order.id!,
        reason: 'Cancelled from tracking screen',
      );

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
    }
  }

  Widget _deliveryPlanTile(
      IconData icon,
      String title,
      String subtitle,
      ) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.lightMint,
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(
              icon,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 11,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _infoRow(
      IconData icon,
      String label,
      String value,
      ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 11),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(
            icon,
            color: AppColors.primaryGreen,
            size: 20,
          ),
          const SizedBox(width: 9),
          SizedBox(
            width: 100,
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
              style: GoogleFonts.lato(
                color: AppColors.darkText,
                fontSize: 12,
                height: 1.4,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(
      IconData icon,
      String title,
      ) {
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
              color: AppColors.darkText,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
      ],
    );
  }

  Widget _tinyBadge(
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
          color: const Color(0xFFE3EAE4),
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

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.cloud_off_outlined,
              size: 80,
              color: Colors.grey.shade400,
            ),
            const SizedBox(height: 18),
            Text(
              'Could not track this order',
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
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildNotFoundState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.location_off_outlined,
              size: 80,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 18),
            Text(
              'Order not found',
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
        ),
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
        size: 38,
      ),
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
}

class _TrackingTimeline extends StatelessWidget {
  final OrderModel order;

  const _TrackingTimeline({
    required this.order,
  });

  @override
  Widget build(BuildContext context) {
    if (order.isCancelled) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: const Color(0xFFFFEBEE),
          borderRadius: BorderRadius.circular(14),
        ),
        child: Row(
          children: <Widget>[
            const Icon(
              Icons.cancel_rounded,
              color: AppColors.errorRed,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                order.cancellationReason.trim().isEmpty
                    ? 'Order cancelled'
                    : order.cancellationReason,
                style: GoogleFonts.lato(
                  color: AppColors.errorRed,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        ),
      );
    }

    final List<_TrackStep> steps = <_TrackStep>[
      _TrackStep(
        'Order Placed',
        'We received your order.',
        Icons.receipt_long_rounded,
        order.timestamp,
        true,
      ),
      _TrackStep(
        'Confirmed',
        'Farmers confirmed the items.',
        Icons.verified_rounded,
        order.confirmedAt,
        order.isConfirmed ||
            order.isPacked ||
            order.isShipped ||
            order.isOutForDelivery ||
            order.isDelivered,
      ),
      _TrackStep(
        'Packed',
        'Items packed at the farm.',
        Icons.inventory_2_rounded,
        order.packedAt,
        order.isPacked ||
            order.isShipped ||
            order.isOutForDelivery ||
            order.isDelivered,
      ),
      _TrackStep(
        'Shipped',
        'Order moved to delivery.',
        Icons.local_shipping_rounded,
        order.shippedAt,
        order.isShipped ||
            order.isOutForDelivery ||
            order.isDelivered,
      ),
      _TrackStep(
        'Out for Delivery',
        'Delivery partner is on the way.',
        Icons.delivery_dining_rounded,
        order.outForDeliveryAt,
        order.isOutForDelivery || order.isDelivered,
      ),
      _TrackStep(
        'Delivered',
        'Delivered successfully.',
        Icons.check_circle_rounded,
        order.deliveredAt,
        order.isDelivered,
      ),
    ];

    return Column(
      children: <Widget>[
        for (int index = 0;
        index < steps.length;
        index++)
          _timelineTile(
            steps[index],
            isLast: index == steps.length - 1,
          ),
      ],
    );
  }

  Widget _timelineTile(
      _TrackStep step, {
        required bool isLast,
      }) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Column(
            children: <Widget>[
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: step.completed
                      ? AppColors.primaryGreen
                      : Colors.grey.shade300,
                ),
                child: Icon(
                  step.completed
                      ? Icons.check_rounded
                      : step.icon,
                  color: Colors.white,
                  size: 20,
                ),
              ),
              if (!isLast)
                Expanded(
                  child: Container(
                    width: 3,
                    color: step.completed
                        ? AppColors.primaryGreen
                        : Colors.grey.shade300,
                  ),
                ),
            ],
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                bottom: isLast ? 0 : 22,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    step.title,
                    style: GoogleFonts.lexend(
                      color: step.completed
                          ? AppColors.darkText
                          : Colors.grey.shade500,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    step.subtitle,
                    style: GoogleFonts.lato(
                      color: Colors.grey.shade600,
                      fontSize: 11,
                    ),
                  ),
                  if (step.time != null) ...<Widget>[
                    const SizedBox(height: 5),
                    Text(
                      _formatTime(step.time!),
                      style: GoogleFonts.lato(
                        color: AppColors.primaryGreen,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year} • '
        '${date.hour.toString().padLeft(2, '0')}:'
        '${date.minute.toString().padLeft(2, '0')}';
  }
}

class _TrackStep {
  final String title;
  final String subtitle;
  final IconData icon;
  final DateTime? time;
  final bool completed;

  const _TrackStep(
      this.title,
      this.subtitle,
      this.icon,
      this.time,
      this.completed,
      );
}

class _MapPin extends StatelessWidget {
  final IconData icon;
  final String label;

  const _MapPin({
    required this.icon,
    required this.label,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        CircleAvatar(
          radius: 22,
          backgroundColor: Colors.white,
          child: Icon(
            icon,
            color: AppColors.primaryGreen,
          ),
        ),
        const SizedBox(height: 4),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 7,
            vertical: 3,
          ),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            label,
            style: GoogleFonts.lato(
              fontSize: 8,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}

class _RoutePainter extends CustomPainter {
  final bool active;

  const _RoutePainter({
    required this.active,
  });

  @override
  void paint(
      Canvas canvas,
      Size size,
      ) {
    final Paint backgroundPaint = Paint()
      ..color = const Color(0xFFD8E5DA)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke;

    final Paint activePaint = Paint()
      ..color = active
          ? AppColors.primaryGreen
          : const Color(0xFFB7C9BA)
      ..strokeWidth = 4
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final Path path = Path()
      ..moveTo(58, size.height - 58)
      ..cubicTo(
        size.width * 0.35,
        size.height * 0.70,
        size.width * 0.55,
        size.height * 0.35,
        size.width - 58,
        58,
      );

    canvas.drawPath(path, backgroundPaint);
    canvas.drawPath(path, activePaint);
  }

  @override
  bool shouldRepaint(
      covariant _RoutePainter oldDelegate,
      ) {
    return oldDelegate.active != active;
  }
}