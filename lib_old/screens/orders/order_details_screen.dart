import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/order_model.dart';
import '../../services/cart_service.dart';
import '../../services/order_service.dart';
import '../cart/cart_screen.dart';
import '../home/home_screen.dart';

class OrderDetailsScreen extends StatefulWidget {
  final String orderId;
  final OrderModel? initialOrder;

  const OrderDetailsScreen({
    super.key,
    required this.orderId,
    this.initialOrder,
  });

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  final OrderService _orderService = OrderService();
  final CartService _cartService = CartService();

  late final VoidCallback _cartListener;

  bool _isCancelling = false;
  bool _isReordering = false;

  @override
  void initState() {
    super.initState();

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
    _cartService.removeListener(_cartListener);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: Text(
          'Order Details',
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

          return _buildOrderContent(order);
        },
      ),
      bottomNavigationBar: _buildCartBar(),
    );
  }

  Widget _buildOrderContent(OrderModel order) {
    return CustomScrollView(
      physics: const BouncingScrollPhysics(),
      slivers: <Widget>[
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildHeaderCard(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildTimelineCard(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildFarmerGroups(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildDeliveryCard(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildPaymentCard(order),
          ),
        ),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: _buildBillCard(order),
          ),
        ),
        if (order.customerNote.trim().isNotEmpty ||
            order.deliveryInstruction.trim().isNotEmpty)
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
              child: _buildInstructionsCard(order),
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
            padding: const EdgeInsets.fromLTRB(16, 18, 16, 130),
            child: _buildActions(order),
          ),
        ),
      ],
    );
  }

  Widget _buildHeaderCard(OrderModel order) {
    return _card(
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
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _formatDateTime(order.timestamp),
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade600,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              _statusChip(order),
            ],
          ),
          const SizedBox(height: 16),
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
          const SizedBox(height: 16),
          _detailRow(
            'Grand Total',
            '₹${order.totalAmount.toStringAsFixed(0)}',
            bold: true,
            valueColor: AppColors.primaryGreen,
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
            'Order Timeline',
          ),
          const SizedBox(height: 16),
          _TimelineView(order: order),
        ],
      ),
    );
  }

  Widget _buildFarmerGroups(OrderModel order) {
    final Map<String, List<Map<String, dynamic>>> groups =
        order.itemsGroupedByFarmer;

    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.agriculture_rounded,
            'Products by Farm',
          ),
          const SizedBox(height: 16),
          ...groups.entries.map<Widget>(
                (MapEntry<String, List<Map<String, dynamic>>> entry) {
              return Padding(
                padding: const EdgeInsets.only(bottom: 18),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.lightCream,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Row(
                        children: <Widget>[
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: AppColors.lightMint,
                              borderRadius: BorderRadius.circular(11),
                            ),
                            child: const Icon(
                              Icons.storefront_rounded,
                              color: AppColors.primaryGreen,
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              entry.key,
                              style: GoogleFonts.lexend(
                                color: AppColors.darkText,
                                fontSize: 13,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...entry.value.map<Widget>(_buildProductTile),
                  ],
                ),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildProductTile(Map<String, dynamic> item) {
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
      margin: const EdgeInsets.only(bottom: 11),
      padding: const EdgeInsets.all(11),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: const Color(0xFFE3EAE4),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 82,
            height: 82,
            padding: const EdgeInsets.all(7),
            decoration: BoxDecoration(
              color: AppColors.lightCream,
              borderRadius: BorderRadius.circular(13),
            ),
            child: _buildImage(image),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  name,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.notoSansTelugu(
                    color: AppColors.darkText,
                    fontSize: 13,
                    height: 1.35,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  _stringValue(
                    item['weight'],
                    fallback: 'Farm fresh',
                  ),
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 7),
                Wrap(
                  spacing: 6,
                  runSpacing: 6,
                  children: <Widget>[
                    if (isQuick)
                      _tinyBadge(
                        'QUICK',
                        AppColors.goldAmber,
                      ),
                    if (isPreOrder)
                      _tinyBadge(
                        'PRE-ORDER',
                        AppColors.primaryGreen,
                      ),
                    if (_boolValue(
                      item['organic'],
                      fallback: true,
                    ))
                      _tinyBadge(
                        'ORGANIC',
                        const Color(0xFF2E7D32),
                      ),
                  ],
                ),
                if (isPreOrder) ...<Widget>[
                  const SizedBox(height: 8),
                  if (_dateTimeValue(item['harvestDate']) != null)
                    Text(
                      'Harvest: ${_formatDate(_dateTimeValue(item['harvestDate'])!)}',
                      style: GoogleFonts.lato(
                        color: AppColors.darkText,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  if (_dateTimeValue(item['expectedDeliveryDate']) != null)
                    Text(
                      'Delivery: ${_formatDate(_dateTimeValue(item['expectedDeliveryDate'])!)}',
                      style: GoogleFonts.lato(
                        color: AppColors.darkText,
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  if (_stringValue(item['deliverySlot']).isNotEmpty)
                    Text(
                      'Slot: ${_stringValue(item['deliverySlot'])}',
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
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: <Widget>[
              Text(
                'Qty $quantity',
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 7),
              Text(
                '₹${(price * quantity).toStringAsFixed(0)}',
                style: GoogleFonts.lexend(
                  color: AppColors.primaryGreen,
                  fontSize: 15,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryCard(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.local_shipping_outlined,
            'Delivery Details',
          ),
          const SizedBox(height: 16),
          _infoBlock(
            Icons.location_on_outlined,
            'Delivery Address',
            order.address,
          ),
          if (order.timeSlot != null &&
              order.timeSlot!.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 11),
            _infoBlock(
              Icons.schedule_rounded,
              'Delivery Slot',
              order.timeSlot!,
            ),
          ],
          if (order.expectedDeliveryDate != null) ...<Widget>[
            const SizedBox(height: 11),
            _infoBlock(
              Icons.event_available_rounded,
              'Expected Delivery',
              _formatDate(order.expectedDeliveryDate!),
            ),
          ],
          if (order.deliveryInstruction.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 11),
            _infoBlock(
              Icons.delivery_dining_outlined,
              'Instruction',
              order.deliveryInstruction,
            ),
          ],
          const SizedBox(height: 11),
          _infoBlock(
            Icons.recycling_rounded,
            'Packing',
            order.ecoFriendlyPacking
                ? 'Eco-friendly packing requested'
                : 'Standard packing',
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentCard(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.account_balance_wallet_outlined,
            'Payment',
          ),
          const SizedBox(height: 16),
          _detailRow(
            'Method',
            order.paymentMethod,
          ),
          _detailRow(
            'Status',
            order.paymentStatusLabel,
            valueColor: order.isPaid
                ? AppColors.primaryGreen
                : AppColors.goldAmber,
          ),
          if (order.refundStatus.trim().isNotEmpty)
            _detailRow(
              'Refund',
              order.refundStatus,
            ),
          if (order.refundReference.trim().isNotEmpty)
            _detailRow(
              'Refund Reference',
              order.refundReference,
            ),
        ],
      ),
    );
  }

  Widget _buildBillCard(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.receipt_long_outlined,
            'Bill Details',
          ),
          const SizedBox(height: 16),
          _detailRow(
            'Item Total',
            '₹${order.subtotal.toStringAsFixed(0)}',
          ),
          _detailRow(
            'Delivery Fee',
            order.deliveryCharge == 0
                ? 'FREE'
                : '₹${order.deliveryCharge.toStringAsFixed(0)}',
            valueColor: order.deliveryCharge == 0
                ? AppColors.primaryGreen
                : null,
          ),
          _detailRow(
            'Handling Fee',
            '₹${order.handlingFee.toStringAsFixed(0)}',
          ),
          if (order.platformFee > 0)
            _detailRow(
              'Platform Fee',
              '₹${order.platformFee.toStringAsFixed(0)}',
            ),
          if (order.discountAmount > 0)
            _detailRow(
              'Discount',
              '-₹${order.discountAmount.toStringAsFixed(0)}',
              valueColor: AppColors.primaryGreen,
            ),
          if (order.promoCode != null &&
              order.promoCode!.trim().isNotEmpty)
            _detailRow(
              'Promo Code',
              order.promoCode!,
            ),
          const Divider(height: 24),
          _detailRow(
            'Grand Total',
            '₹${order.totalAmount.toStringAsFixed(0)}',
            bold: true,
            valueColor: AppColors.primaryGreen,
          ),
        ],
      ),
    );
  }

  Widget _buildInstructionsCard(OrderModel order) {
    return _card(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _sectionTitle(
            Icons.notes_rounded,
            'Instructions & Notes',
          ),
          const SizedBox(height: 16),
          if (order.deliveryInstruction.trim().isNotEmpty)
            _infoBlock(
              Icons.delivery_dining_outlined,
              'Delivery Instruction',
              order.deliveryInstruction,
            ),
          if (order.customerNote.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 11),
            _infoBlock(
              Icons.edit_note_rounded,
              'Customer Note',
              order.customerNote,
            ),
          ],
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
          _detailRow(
            'Name',
            order.deliveryPartnerName,
          ),
          if (order.deliveryPartnerPhone.trim().isNotEmpty)
            _detailRow(
              'Phone',
              order.deliveryPartnerPhone,
            ),
          if (order.deliveryVehicleNumber.trim().isNotEmpty)
            _detailRow(
              'Vehicle',
              order.deliveryVehicleNumber,
            ),
        ],
      ),
    );
  }

  Widget _buildActions(OrderModel order) {
    return Column(
      children: <Widget>[
        if (order.canTrack)
          SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: () {
                _showMessage(
                  'Track Order screen will be connected next.',
                );
              },
              icon: const Icon(
                Icons.location_searching_rounded,
              ),
              label: Text(
                'TRACK ORDER',
                style: GoogleFonts.lexend(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        if (order.canTrack)
          const SizedBox(height: 11),
        SizedBox(
          width: double.infinity,
          height: 50,
          child: OutlinedButton.icon(
            onPressed: _isReordering
                ? null
                : () => _reorder(order),
            icon: const Icon(
              Icons.refresh_rounded,
            ),
            label: Text(
              _isReordering
                  ? 'ADDING ITEMS...'
                  : 'REORDER ITEMS',
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
            child: TextButton.icon(
              onPressed: _isCancelling
                  ? null
                  : () => _cancelOrder(order),
              icon: const Icon(
                Icons.cancel_outlined,
                color: AppColors.errorRed,
              ),
              label: Text(
                _isCancelling
                    ? 'CANCELLING...'
                    : 'CANCEL ORDER',
                style: GoogleFonts.lexend(
                  color: AppColors.errorRed,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ),
        ],
      ],
    );
  }

  Future<void> _reorder(OrderModel order) async {
    setState(() {
      _isReordering = true;
    });

    try {
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
          harvestDate: _dateTimeValue(
            item['harvestDate'],
          ),
          expectedDeliveryDate: _dateTimeValue(
            item['expectedDeliveryDate'],
          ),
          deliverySlot: _stringValue(
            item['deliverySlot'],
          ),
        );
      }

      _showMessage('Order items added to cart.');
    } finally {
      if (mounted) {
        setState(() {
          _isReordering = false;
        });
      }
    }
  }

  Future<void> _cancelOrder(OrderModel order) async {
    if (order.id == null) {
      return;
    }

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
                    const SizedBox(height: 12),
                    ...reasons.map<Widget>(
                          (String reason) {
                        return RadioListTile<String>(
                          contentPadding: EdgeInsets.zero,
                          value: reason,
                          groupValue: selectedReason,
                          activeColor:
                          AppColors.primaryGreen,
                          title: Text(reason),
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

    if (confirmed != true) {
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

      _showMessage('Order cancelled successfully.');
    } on OrderServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    } catch (_) {
      _showMessage(
        'Unable to cancel order.',
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
            size: 14,
            color: AppColors.primaryGreen,
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

  Widget _infoBlock(
      IconData icon,
      String title,
      String value,
      ) {
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
          icon: const Icon(
            Icons.shopping_bag_rounded,
          ),
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
              'Could not load order details',
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
              Icons.receipt_long_outlined,
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
            const SizedBox(height: 8),
            Text(
              'This order may have been removed or is temporarily unavailable.',
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

  Widget _buildImage(String image) {
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
        size: 36,
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

  String _formatDateTime(DateTime date) {
    return '${_formatDate(date)} • '
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

  static DateTime? _dateTimeValue(dynamic value) {
    if (value is DateTime) {
      return value;
    }

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

class _TimelineView extends StatelessWidget {
  final OrderModel order;

  const _TimelineView({
    required this.order,
  });

  @override
  Widget build(BuildContext context) {
    final List<_TimelineStep> steps = <_TimelineStep>[
      _TimelineStep(
        label: 'Order Placed',
        subtitle: 'Your order was received.',
        icon: Icons.receipt_long_rounded,
        time: order.timestamp,
        completed: true,
      ),
      _TimelineStep(
        label: 'Confirmed',
        subtitle: 'The farm confirmed your order.',
        icon: Icons.verified_outlined,
        time: order.confirmedAt,
        completed: order.isConfirmed ||
            order.isPacked ||
            order.isShipped ||
            order.isOutForDelivery ||
            order.isDelivered,
      ),
      _TimelineStep(
        label: 'Packed',
        subtitle: 'Your products were packed.',
        icon: Icons.inventory_2_outlined,
        time: order.packedAt,
        completed: order.isPacked ||
            order.isShipped ||
            order.isOutForDelivery ||
            order.isDelivered,
      ),
      _TimelineStep(
        label: 'Out for Delivery',
        subtitle: 'Your order is on the way.',
        icon: Icons.local_shipping_outlined,
        time: order.outForDeliveryAt,
        completed:
        order.isOutForDelivery || order.isDelivered,
      ),
      _TimelineStep(
        label: 'Delivered',
        subtitle: 'Order delivered successfully.',
        icon: Icons.check_circle_outline_rounded,
        time: order.deliveredAt,
        completed: order.isDelivered,
      ),
    ];

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
                    ? 'This order was cancelled.'
                    : 'Cancelled: ${order.cancellationReason}',
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
      _TimelineStep step, {
        required bool isLast,
      }) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Column(
            children: <Widget>[
              Container(
                width: 34,
                height: 34,
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
                  size: 18,
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
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(
                bottom: isLast ? 0 : 20,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    step.label,
                    style: GoogleFonts.lexend(
                      color: step.completed
                          ? AppColors.darkText
                          : Colors.grey.shade500,
                      fontSize: 13,
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
                    const SizedBox(height: 4),
                    Text(
                      _formatTimelineDate(step.time!),
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

  String _formatTimelineDate(DateTime date) {
    return '${date.day.toString().padLeft(2, '0')}/'
        '${date.month.toString().padLeft(2, '0')}/'
        '${date.year} • '
        '${date.hour.toString().padLeft(2, '0')}:'
        '${date.minute.toString().padLeft(2, '0')}';
  }
}

class _TimelineStep {
  final String label;
  final String subtitle;
  final IconData icon;
  final DateTime? time;
  final bool completed;

  const _TimelineStep({
    required this.label,
    required this.subtitle,
    required this.icon,
    required this.time,
    required this.completed,
  });
}