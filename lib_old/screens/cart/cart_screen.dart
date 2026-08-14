import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/farmer.dart';
import '../../models/product_model.dart';
import '../../services/cart_service.dart';
import '../../services/farmer_service.dart';
import '../farmer/farmer_profile_screen.dart';
import '../home/home_screen.dart';
import 'checkout_screen.dart';

enum _CartDeliveryMode {
  quick,
  scheduled,
  preOrder,
}

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final CartService _cartService = CartService();
  final FarmerService _farmerService = FarmerService.instance;
  late final VoidCallback _cartListener;

  String? _appliedCoupon;
  int _couponDiscount = 0;

  _CartDeliveryMode _selectedDeliveryMode =
      _CartDeliveryMode.scheduled;

  int get _subtotal => _cartService.totalAmount;
  int get _deliveryFee => _subtotal >= 499 ? 0 : 30;
  int get _handlingFee => _subtotal > 0 ? 5 : 0;
  int get _platformFee => _subtotal > 0 ? 3 : 0;
  int get _total =>
      (_subtotal + _deliveryFee + _handlingFee + _platformFee - _couponDiscount)
          .clamp(0, 999999);
  int get _amountForFreeDelivery => (499 - _subtotal).clamp(0, 499);

  @override
  void initState() {
    super.initState();
    _cartListener = () {
      if (!mounted) return;
      _revalidateCoupon();
      setState(() {});
    };
    _cartService.addListener(_cartListener);
  }

  @override
  void dispose() {
    _cartService.removeListener(_cartListener);
    super.dispose();
  }


  String get _selectedDeliveryModeValue {
    switch (_selectedDeliveryMode) {
      case _CartDeliveryMode.quick:
        return 'quick';
      case _CartDeliveryMode.preOrder:
        return 'pre_order';
      case _CartDeliveryMode.scheduled:
        return 'scheduled';
    }
  }

  String get _selectedDeliveryModeLabel {
    switch (_selectedDeliveryMode) {
      case _CartDeliveryMode.quick:
        return 'Quick Delivery';
      case _CartDeliveryMode.preOrder:
        return 'Advance Pre-Booking';
      case _CartDeliveryMode.scheduled:
        return 'Scheduled Delivery';
    }
  }

  Future<void> _selectDeliveryMode(
      _CartDeliveryMode mode,
      ) async {
    setState(() {
      _selectedDeliveryMode = mode;
    });
  }



  void _revalidateCoupon() {
    if (_appliedCoupon == null) return;

    if (_appliedCoupon == 'FARM50' && _subtotal < 399) {
      _appliedCoupon = null;
      _couponDiscount = 0;
    } else if (_appliedCoupon == 'FRESH20') {
      _couponDiscount = (_subtotal * 0.20).round().clamp(0, 100);
    }
  }

  void _removeEntireItem(CartItem item) {
    _cartService.removeItemCompletely(
      name: item.name,
      productId: item.productId,
      teluguName: item.teluguName,
      weight: item.weight,
    );
  }

  void _increaseItem(CartItem item) {
    if (item.isQuick &&
        item.quickAvailableStock > 0 &&
        item.quantity >= item.quickAvailableStock.floor()) {
      _showCartMessage(
        'Only ${item.quickAvailableStock.toStringAsFixed(0)} '
            '${item.weight} available for Quick Delivery.',
        isError: true,
      );
      return;
    }

    _cartService.addItem(
      item.name,
      item.image,
      item.price,
      productId: item.productId,
      teluguName: item.teluguName,
      weight: item.weight,
      category: item.category,
      categoryTelugu: item.categoryTelugu,
      farmerId: item.farmerId,
      farmerName: item.farmerName,
      farmName: item.farmName,
      organic: item.organic,
      rating: item.rating,
      isQuick: item.isQuick,
      quickDeliveryMinutes:
      item.quickDeliveryMinutes,
      minimumQuickQuantity:
      item.safeMinimumQuickQuantity,
      quickAvailableStock:
      item.quickAvailableStock,
      availableUnits: item.availableUnits,
      availableDeliveryDays:
      item.availableDeliveryDays,
      normalDeliveryNote:
      item.normalDeliveryNote,
      isPreOrder: item.isPreOrder,
      harvestDate: item.harvestDate,
      expectedDeliveryDate:
      item.expectedDeliveryDate,
      deliverySlot: item.deliverySlot,
    );
  }

  void _decreaseItem(CartItem item) {
    if (item.isQuick && item.isAtQuickMinimum) {
      _showCartMessage(
        'Quick Delivery requires minimum '
            '${item.safeMinimumQuickQuantity} × ${item.weight}. '
            'Swipe the item to remove it completely.',
        isError: true,
      );
      return;
    }

    _cartService.removeOne(
      item.name,
      productId: item.productId,
      teluguName: item.teluguName,
      weight: item.weight,
    );
  }

  void _showCartMessage(
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
              fontWeight: FontWeight.w700,
            ),
          ),
          backgroundColor: isError
              ? AppColors.errorRed
              : AppColors.primaryGreen,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(
              Radius.circular(13),
            ),
          ),
        ),
      );
  }

  Future<void> _openFarmerProfile(CartItem item) async {
    try {
      final Farmer farmer = await _farmerService.getFarmerById(
        item.farmerId,
      );

      if (!mounted) return;

      Navigator.of(context).push(
        MaterialPageRoute<void>(
          builder: (_) => FarmerProfileScreen(farmer: farmer),
        ),
      );
    } catch (_) {
      if (!mounted) return;

      ScaffoldMessenger.of(context)
        ..hideCurrentSnackBar()
        ..showSnackBar(
          SnackBar(
            content: Text(
              'Unable to load farm details right now.',
              style: GoogleFonts.lato(
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
            backgroundColor: AppColors.errorRed,
            behavior: SnackBarBehavior.floating,
            margin: const EdgeInsets.all(16),
          ),
        );
    }
  }

  Map<String, List<CartItem>> _groupItemsByFarmer(
      List<CartItem> items,
      ) {
    final Map<String, List<CartItem>> groups =
    <String, List<CartItem>>{};

    for (final CartItem item in items) {
      final String key = item.farmerDisplayName;
      groups.putIfAbsent(key, () => <CartItem>[]).add(item);
    }

    return groups;
  }

  Future<void> _showCouponSheet() async {
    final result = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (BuildContext bottomSheetContext) {
        return SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 4, 18, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Available coupons',
                  style: GoogleFonts.lexend(
                    fontSize: 21,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Choose the best offer for your basket.',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 18),
                _CouponTile(
                  code: 'FRESH20',
                  title: '20% OFF up to ₹100',
                  description: 'Valid on all fresh products.',
                  enabled: _subtotal > 0,
                  selected: _appliedCoupon == 'FRESH20',
                  onTap: () => Navigator.pop(bottomSheetContext, 'FRESH20'),
                ),
                const SizedBox(height: 12),
                _CouponTile(
                  code: 'FARM50',
                  title: 'Flat ₹50 OFF',
                  description: 'Minimum order value ₹399.',
                  enabled: _subtotal >= 399,
                  selected: _appliedCoupon == 'FARM50',
                  onTap: () => Navigator.pop(bottomSheetContext, 'FARM50'),
                ),
                if (_appliedCoupon != null) ...<Widget>[
                  const SizedBox(height: 14),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: OutlinedButton.icon(
                      onPressed: () => Navigator.pop(bottomSheetContext, 'REMOVE'),
                      icon: const Icon(Icons.close_rounded),
                      label: const Text('Remove coupon'),
                    ),
                  ),
                ],
              ],
            ),
          ),
        );
      },
    );

    if (!mounted || result == null) return;

    setState(() {
      if (result == 'REMOVE') {
        _appliedCoupon = null;
        _couponDiscount = 0;
      } else if (result == 'FRESH20') {
        _appliedCoupon = result;
        _couponDiscount = (_subtotal * 0.20).round().clamp(0, 100);
      } else if (result == 'FARM50' && _subtotal >= 399) {
        _appliedCoupon = result;
        _couponDiscount = 50;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<CartItem> items = _cartService.items;

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        title: Text(
          'My Cart',
          style: GoogleFonts.lexend(
            color: AppColors.darkText,
            fontWeight: FontWeight.w700,
          ),
        ),
        actions: <Widget>[
          if (items.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(right: 14),
              child: Center(
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.lightMint,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${_cartService.totalItemCount} item${_cartService.totalItemCount == 1 ? '' : 's'}',
                    style: GoogleFonts.lato(
                      color: AppColors.primaryGreen,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 260),
        child: items.isEmpty
            ? _buildEmptyCart()
            : _buildCart(items),
      ),
    );
  }

  Widget _buildEmptyCart() {
    return FadeIn(
      key: const ValueKey<String>('empty_cart'),
      child: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Container(
                width: 132,
                height: 132,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.lightCream,
                  boxShadow: <BoxShadow>[
                    BoxShadow(
                      color: AppColors.primaryGreen.withValues(alpha: 0.12),
                      blurRadius: 28,
                      offset: const Offset(0, 12),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.shopping_bag_outlined,
                  color: AppColors.primaryGreen,
                  size: 64,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Your cart is waiting',
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 23,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Add farm-fresh vegetables, fruits, dairy and grocery products to continue.',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 26),
              SizedBox(
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pushAndRemoveUntil(
                      MaterialPageRoute<void>(
                        builder: (_) => const HomeScreen(),
                      ),
                          (Route<dynamic> route) => false,
                    );
                  },
                  icon: const Icon(Icons.shopping_basket_outlined),
                  label: const Text('Start shopping'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCart(List<CartItem> items) {
    return Stack(
      key: const ValueKey<String>('filled_cart'),
      children: <Widget>[
        RefreshIndicator(
          color: AppColors.primaryGreen,
          onRefresh: () async {
            await Future<void>.delayed(const Duration(milliseconds: 450));
            if (mounted) setState(() {});
          },
          child: ListView(
            physics: const AlwaysScrollableScrollPhysics(
              parent: BouncingScrollPhysics(),
            ),
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 205),
            children: <Widget>[
              _buildQuickDeliveryCard(),
              const SizedBox(height: 14),
              _buildAddressCard(),
              const SizedBox(height: 14),
              _buildDeliveryProgress(),
              const SizedBox(height: 22),
              _sectionTitle(
                title: 'Your fresh picks',
                subtitle:
                '${_cartService.totalItemCount} products selected • Swipe to remove',
              ),
              const SizedBox(height: 12),
              ..._buildFarmerGroupedItems(items),
              const SizedBox(height: 8),
              _buildDeliveryMethodSection(),
              const SizedBox(height: 22),
              _buildCouponCard(),
              const SizedBox(height: 22),
              _buildYouMightAlsoLike(),
              const SizedBox(height: 22),
              _buildFreshnessPromise(),
              const SizedBox(height: 22),
              _buildBillPreview(),
              const SizedBox(height: 22),
              _buildFarmTrustStrip(),
            ],
          ),
        ),
        _buildCheckoutBar(),
      ],
    );
  }


  List<Widget> _buildFarmerGroupedItems(List<CartItem> items) {
    final Map<String, List<CartItem>> groups =
    _groupItemsByFarmer(items);

    final List<Widget> widgets = <Widget>[];
    int animationIndex = 0;

    for (final MapEntry<String, List<CartItem>> entry
    in groups.entries) {
      final List<CartItem> farmerItems = entry.value;
      final CartItem firstItem = farmerItems.first;

      widgets.add(
        _buildFarmerGroupHeader(
          farmName: entry.key,
          item: firstItem,
          productCount: farmerItems.fold<int>(
            0,
                (int total, CartItem item) => total + item.quantity,
          ),
        ),
      );

      widgets.add(const SizedBox(height: 10));

      for (final CartItem item in farmerItems) {
        final int delayIndex = animationIndex;
        animationIndex++;

        widgets.add(
          FadeInUp(
            duration: const Duration(milliseconds: 320),
            delay: Duration(
              milliseconds: delayIndex.clamp(0, 8) * 45,
            ),
            child: Dismissible(
              key: ValueKey<String>(
                'cart_${item.productId}_${item.name}_${item.weight}',
              ),
              direction: DismissDirection.endToStart,
              background: Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.only(right: 24),
                alignment: Alignment.centerRight,
                decoration: BoxDecoration(
                  color: Colors.red.shade400,
                  borderRadius: BorderRadius.circular(19),
                ),
                child: const Icon(
                  Icons.delete_outline_rounded,
                  color: Colors.white,
                  size: 28,
                ),
              ),
              onDismissed: (_) => _removeEntireItem(item),
              child: _CartItemCard(
                item: item,
                teluguName: item.teluguName.trim().isNotEmpty
                    ? item.teluguName
                    : _teluguNameFor(item.name),
                onAdd: () => _increaseItem(item),
                onRemove: () => _decreaseItem(item),
              ),
            ),
          ),
        );
      }

      widgets.add(const SizedBox(height: 10));
    }

    return widgets;
  }

  Widget _buildFarmerGroupHeader({
    required String farmName,
    required CartItem item,
    required int productCount,
  }) {
    final bool hasFarmerId = item.farmerId.trim().isNotEmpty;

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: hasFarmerId
            ? () => _openFarmerProfile(item)
            : null,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: const Color(0xFFE2EAE3),
            ),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 47,
                height: 47,
                decoration: BoxDecoration(
                  color: AppColors.lightMint,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: const Icon(
                  Icons.agriculture_rounded,
                  color: AppColors.primaryGreen,
                  size: 27,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            farmName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.lexend(
                              color: AppColors.darkText,
                              fontSize: 14,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        if (hasFarmerId)
                          const Icon(
                            Icons.verified_rounded,
                            color: AppColors.primaryGreen,
                            size: 18,
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '$productCount item${productCount == 1 ? '' : 's'} from this farm',
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade600,
                        fontSize: 11,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Wrap(
                      spacing: 7,
                      runSpacing: 5,
                      children: <Widget>[
                        if (item.isQuick)
                          _deliveryChip(
                            Icons.bolt_rounded,
                            item.quickDeliveryText.isEmpty
                                ? 'Quick delivery'
                                : '${item.quickDeliveryText} delivery',
                          ),
                        if (item.isPreOrder)
                          _deliveryChip(
                            Icons.event_available_rounded,
                            'Pre-order',
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              if (hasFarmerId) ...<Widget>[
                const SizedBox(width: 8),
                Column(
                  children: <Widget>[
                    Text(
                      'View farm',
                      style: GoogleFonts.lato(
                        color: AppColors.primaryGreen,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const Icon(
                      Icons.chevron_right_rounded,
                      color: AppColors.primaryGreen,
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _deliveryChip(
      IconData icon,
      String label,
      ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: AppColors.lightMint,
        borderRadius: BorderRadius.circular(15),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(
            icon,
            size: 13,
            color: AppColors.primaryGreen,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: GoogleFonts.lato(
              color: AppColors.primaryGreen,
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle({required String title, String? subtitle}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          title,
          style: GoogleFonts.lexend(
            color: AppColors.darkText,
            fontSize: 19,
            fontWeight: FontWeight.w700,
          ),
        ),
        if (subtitle != null) ...<Widget>[
          const SizedBox(height: 3),
          Text(
            subtitle,
            style: GoogleFonts.lato(
              color: Colors.grey.shade600,
              fontSize: 12,
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildQuickDeliveryCard() {
    final List<CartItem> quickItems = _cartService.items
        .where((CartItem item) => item.isQuick)
        .toList();
    final List<CartItem> preOrderItems = _cartService.items
        .where((CartItem item) => item.isPreOrder)
        .toList();
    final List<CartItem> scheduledItems = _cartService.items
        .where(
          (CartItem item) =>
      !item.isQuick && !item.isPreOrder,
    )
        .toList();

    final int longestQuickMinutes = quickItems.fold<int>(
      0,
          (int current, CartItem item) =>
      item.quickDeliveryMinutes > current
          ? item.quickDeliveryMinutes
          : current,
    );

    String title;
    String subtitle;
    String badge;
    IconData icon;

    if (quickItems.isNotEmpty &&
        preOrderItems.isEmpty &&
        scheduledItems.isEmpty) {
      title = 'Quick Delivery Basket';
      subtitle =
      '${quickItems.length} selected product types • '
          'Estimated within ${longestQuickMinutes > 0 ? longestQuickMinutes : 90} minutes';
      badge = 'QUICK';
      icon = Icons.bolt_rounded;
    } else if (preOrderItems.isNotEmpty &&
        quickItems.isEmpty &&
        scheduledItems.isEmpty) {
      title = 'Advance Booking Basket';
      subtitle =
      '${preOrderItems.length} pre-order product types • '
          'Delivery follows your selected date and time';
      badge = 'PRE-ORDER';
      icon = Icons.event_available_rounded;
    } else if (scheduledItems.isNotEmpty &&
        quickItems.isEmpty &&
        preOrderItems.isEmpty) {
      title = 'Scheduled Delivery Basket';
      subtitle =
      'Select your delivery day and time slot during checkout';
      badge = 'SCHEDULE';
      icon = Icons.calendar_month_outlined;
    } else {
      title = 'Mixed Delivery Basket';
      subtitle =
      '${quickItems.length} quick • '
          '${scheduledItems.length} scheduled • '
          '${preOrderItems.length} pre-order product types';
      badge = 'MIXED';
      icon = Icons.route_rounded;
    }

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: AppColors.primaryGreen
                .withValues(alpha: 0.22),
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: Colors.white
                  .withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 30,
            ),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  title,
                  style: GoogleFonts.lexend(
                    color: Colors.white,
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.lato(
                    color: Colors.white70,
                    fontSize: 11.5,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 9,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              badge,
              style: GoogleFonts.lexend(
                color: AppColors.primaryGreen,
                fontSize: 8.5,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressCard() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2EAE3)),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: AppColors.lightMint,
              borderRadius: BorderRadius.circular(13),
            ),
            child: const Icon(
              Icons.home_rounded,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Delivering to Home',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  'Add or confirm your delivery address at checkout',
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          const Icon(
            Icons.chevron_right_rounded,
            color: AppColors.primaryGreen,
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryProgress() {
    final double progress = (_subtotal / 499).clamp(0.0, 1.0);
    final bool isFree = _deliveryFee == 0;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isFree ? const Color(0xFFE8F5E9) : const Color(0xFFFFF8E1),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isFree ? const Color(0xFFC8E6C9) : const Color(0xFFFFE0A3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Icon(
                isFree
                    ? Icons.local_shipping_rounded
                    : Icons.shopping_bag_outlined,
                color: AppColors.primaryGreen,
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  isFree
                      ? 'You unlocked free delivery!'
                      : 'Add ₹$_amountForFreeDelivery for free delivery',
                  style: GoogleFonts.lato(
                    color: AppColors.darkText,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: LinearProgressIndicator(
              value: progress,
              minHeight: 7,
              color: AppColors.primaryGreen,
              backgroundColor: Colors.white,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryMethodSection() {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFFE1E9E2),
        ),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 16,
            offset: Offset(0, 7),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: AppColors.lightMint,
                  borderRadius: BorderRadius.circular(13),
                ),
                child: const Icon(
                  Icons.route_rounded,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Choose delivery method',
                      style: GoogleFonts.lexend(
                        color: AppColors.darkText,
                        fontSize: 16,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'One order uses one delivery method',
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade600,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          _deliveryModeTile(
            mode: _CartDeliveryMode.quick,
            icon: Icons.bolt_rounded,
            title: 'Quick Delivery',
            subtitle:
            'Eligible ready-stock products delivered in 45–90 minutes',
            badge: 'FAST',
            color: AppColors.primaryGreen,
            background: const Color(0xFFEAF7ED),
          ),
          const SizedBox(height: 10),
          _deliveryModeTile(
            mode: _CartDeliveryMode.scheduled,
            icon: Icons.calendar_month_outlined,
            title: 'Scheduled Delivery',
            subtitle:
            'Choose delivery date and time slot at checkout',
            badge: 'FLEXIBLE',
            color: const Color(0xFF1E88E5),
            background: const Color(0xFFEAF4FF),
          ),
          const SizedBox(height: 10),
          _deliveryModeTile(
            mode: _CartDeliveryMode.preOrder,
            icon: Icons.agriculture_rounded,
            title: 'Advance Pre-Booking',
            subtitle:
            'Reserve eligible future harvests for a required date',
            badge: 'BOOK AHEAD',
            color: const Color(0xFF6A45B8),
            background: const Color(0xFFF2ECFF),
          ),
        ],
      ),
    );
  }

  Widget _deliveryModeTile({
    required _CartDeliveryMode mode,
    required IconData icon,
    required String title,
    required String subtitle,
    required String badge,
    required Color color,
    required Color background,
  }) {
    final bool selected =
        _selectedDeliveryMode == mode;

    return Material(
      color: selected ? background : const Color(0xFFF9FBF9),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: () => _selectDeliveryMode(mode),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 220),
          padding: const EdgeInsets.all(13),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected
                  ? color
                  : const Color(0xFFE1E8E2),
              width: selected ? 1.6 : 1,
            ),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: selected
                      ? color
                      : background,
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Icon(
                  icon,
                  color: selected ? Colors.white : color,
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            title,
                            style: GoogleFonts.lexend(
                              color: AppColors.darkText,
                              fontSize: 13,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 7,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            badge,
                            style: GoogleFonts.lexend(
                              color: color,
                              fontSize: 7.5,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      subtitle,
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade700,
                        fontSize: 10.5,
                        height: 1.35,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              AnimatedContainer(
                duration: const Duration(milliseconds: 220),
                width: 24,
                height: 24,
                decoration: BoxDecoration(
                  color: selected ? color : Colors.white,
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: selected
                        ? color
                        : Colors.grey.shade400,
                  ),
                ),
                child: selected
                    ? const Icon(
                  Icons.check_rounded,
                  color: Colors.white,
                  size: 16,
                )
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCouponCard() {
    final bool applied = _appliedCoupon != null;

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: _showCouponSheet,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(15),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: applied
                  ? AppColors.primaryGreen
                  : const Color(0xFFE2EAE3),
            ),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 46,
                height: 46,
                decoration: BoxDecoration(
                  color: applied
                      ? AppColors.lightMint
                      : const Color(0xFFFFF8E1),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  applied
                      ? Icons.verified_rounded
                      : Icons.local_offer_outlined,
                  color: applied
                      ? AppColors.primaryGreen
                      : AppColors.goldAmber,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      applied ? '$_appliedCoupon applied' : 'Apply a coupon',
                      style: GoogleFonts.lexend(
                        color: AppColors.darkText,
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      applied
                          ? 'You saved ₹$_couponDiscount on this order.'
                          : 'View available offers and save more.',
                      style: GoogleFonts.lato(
                        color: applied
                            ? AppColors.primaryGreen
                            : Colors.grey.shade600,
                        fontSize: 11,
                        fontWeight:
                        applied ? FontWeight.w700 : FontWeight.w500,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.primaryGreen,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildYouMightAlsoLike() {
    final Set<String> cartNames = _cartService.items
        .map((CartItem item) => item.name.trim().toLowerCase())
        .toSet();

    final List<Map<String, dynamic>> suggestions = LocalProductCatalog.products
        .where(
          (Map<String, dynamic> product) => !cartNames.contains(
        (product['name']?.toString() ?? '').trim().toLowerCase(),
      ),
    )
        .take(8)
        .toList();

    if (suggestions.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        _sectionTitle(
          title: 'You might also like',
          subtitle: 'More fresh products for your basket',
        ),
        const SizedBox(height: 12),
        SizedBox(
          height: 232,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            itemCount: suggestions.length,
            separatorBuilder: (_, __) => const SizedBox(width: 12),
            itemBuilder: (BuildContext context, int index) {
              final Map<String, dynamic> product = suggestions[index];
              return _SuggestionCard(
                product: product,
                teluguName: _teluguNameFor(
                  product['name']?.toString() ?? '',
                ),
                onAdd: () {
                  final ProductModel model =
                  ProductModel.fromMap(product);

                  _cartService.addItem(
                    model.name,
                    model.image,
                    model.discountedPrice.round(),
                    productId: model.id,
                    teluguName: model.teluguName,
                    weight: model.safeDefaultUnit,
                    category: model.category,
                    categoryTelugu:
                    model.categoryTelugu,
                    farmerId: model.farmerId,
                    farmerName: model.farmerName
                        .trim()
                        .isNotEmpty
                        ? model.farmerName
                        : model.seller,
                    farmName: model.farmName,
                    organic: model.organic,
                    rating: model.rating,
                    isQuick: model.isQuickAvailable,
                    quickDeliveryMinutes:
                    model.quickDeliveryMinutes,
                    minimumQuickQuantity:
                    model.safeMinimumQuickQuantity.ceil(),
                    quickAvailableStock:
                    model.quickAvailableStock,
                    availableUnits:
                    model.safeAvailableUnits,
                    availableDeliveryDays:
                    model.availableDeliveryDays,
                    normalDeliveryNote:
                    model.normalDeliveryNote,
                    isPreOrder: false,
                    deliverySlot: '',
                  );
                },
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildFreshnessPromise() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            Color(0xFFF1F8E9),
            Color(0xFFE8F5E9),
          ],
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFCFE7D2),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(15),
            ),
            child: const Icon(
              Icons.agriculture_rounded,
              color: AppColors.primaryGreen,
              size: 28,
            ),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Direct farm sourcing',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  'Products are sourced from verified farmers and prepared '
                      'according to the delivery method selected for your order.',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 11,
                    height: 1.4,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildFarmTrustStrip() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(
        horizontal: 12,
        vertical: 18,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFFAFCF7),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFE8EEE3),
        ),
      ),
      child: const Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: _FarmTrustItem(
              icon: Icons.agriculture_outlined,
              iconColor: Color(0xFF2E7D32),
              iconBackground: Color(0xFFE8F5E9),
              title: 'Direct From\nFarmer',
              subtitle: 'No Middlemen',
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: _FarmTrustItem(
              icon: Icons.eco_outlined,
              iconColor: Color(0xFFF9A825),
              iconBackground: Color(0xFFFFF8E1),
              title: 'Fresh Farm\nProduce',
              subtitle: 'Carefully Prepared',
            ),
          ),
          SizedBox(width: 8),
          Expanded(
            child: _FarmTrustItem(
              icon: Icons.route_outlined,
              iconColor: Color(0xFF1E88E5),
              iconBackground: Color(0xFFE3F2FD),
              title: 'One Delivery\nMethod',
              subtitle: 'Chosen By You',
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildBillPreview() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE2EAE3)),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 14,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Icon(
                Icons.receipt_long_rounded,
                color: AppColors.primaryGreen,
              ),
              const SizedBox(width: 8),
              Text(
                'Bill details',
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _billRow('Item total', '₹$_subtotal'),
          const SizedBox(height: 10),
          _billRow(
            'Delivery fee',
            _deliveryFee == 0 ? 'FREE' : '₹$_deliveryFee',
            highlighted: _deliveryFee == 0,
          ),
          const SizedBox(height: 10),
          _billRow('Handling fee', '₹$_handlingFee'),
          const SizedBox(height: 10),
          _billRow('Platform fee', '₹$_platformFee'),
          if (_couponDiscount > 0) ...<Widget>[
            const SizedBox(height: 10),
            _billRow(
              'Coupon discount',
              '-₹$_couponDiscount',
              highlighted: true,
            ),
          ],
          const Divider(height: 24),
          _billRow('Grand total', '₹$_total', total: true),
          if (_couponDiscount > 0) ...<Widget>[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 9),
              decoration: BoxDecoration(
                color: AppColors.lightMint,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'You saved ₹$_couponDiscount on this order!',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: AppColors.primaryGreen,
                  fontWeight: FontWeight.w800,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _billRow(
      String label,
      String amount, {
        bool highlighted = false,
        bool total = false,
      }) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: <Widget>[
        Text(
          label,
          style: GoogleFonts.lato(
            color: total ? AppColors.darkText : Colors.grey.shade600,
            fontSize: total ? 15 : 14,
            fontWeight: total ? FontWeight.w700 : FontWeight.w500,
          ),
        ),
        Text(
          amount,
          style: GoogleFonts.lexend(
            color: highlighted ? AppColors.primaryGreen : AppColors.darkText,
            fontSize: total ? 18 : 14,
            fontWeight: total ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildCheckoutBar() {
    return Positioned(
      left: 0,
      right: 0,
      bottom: 0,
      child: Container(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: Color(0x1F000000),
              blurRadius: 18,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          top: false,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Row(
                children: <Widget>[
                  const Icon(
                    Icons.schedule_rounded,
                    size: 16,
                    color: AppColors.primaryGreen,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      _selectedDeliveryMode ==
                          _CartDeliveryMode.quick
                          ? 'Quick Delivery selected • 45–90 minute ETA'
                          : _selectedDeliveryMode ==
                          _CartDeliveryMode.preOrder
                          ? 'Advance Pre-Booking selected • choose required date at checkout'
                          : 'Scheduled Delivery selected • choose date and time at checkout',
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade700,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),
              Row(
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: <Widget>[
                        Text(
                          '₹$_total',
                          style: GoogleFonts.lexend(
                            color: AppColors.darkText,
                            fontSize: 20,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        Text(
                          _couponDiscount > 0
                              ? 'You saved ₹$_couponDiscount'
                              : 'Inclusive of all charges',
                          style: GoogleFonts.lato(
                            color: _couponDiscount > 0
                                ? AppColors.primaryGreen
                                : Colors.grey.shade600,
                            fontSize: 11,
                            fontWeight: _couponDiscount > 0
                                ? FontWeight.w700
                                : FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(
                    height: 52,
                    child: ElevatedButton(
                      onPressed: () {
                        Navigator.of(context).push(
                          MaterialPageRoute<void>(
                            builder: (_) => CheckoutScreen(
                              initialDeliveryMode:
                              _selectedDeliveryModeValue,
                            ),
                          ),
                        );
                      },
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(15),
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          Text(
                            'Proceed',
                            style: GoogleFonts.lato(
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(width: 7),
                          const Icon(Icons.arrow_forward_rounded, size: 19),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  String _teluguNameFor(String name) {
    const Map<String, String> teluguNames = <String, String>{
      'asparagus': 'ఆస్పరాగస్',
      'beetroot': 'బీట్‌రూట్',
      'bitter gourd': 'కాకరకాయ',
      'bottle gourd': 'సొరకాయ',
      'brinjal': 'వంకాయ',
      'broccoli': 'బ్రోకోలీ',
      'cabbage': 'క్యాబేజీ',
      'capsicum': 'క్యాప్సికమ్',
      'carrot': 'క్యారెట్',
      'cauliflower': 'కాలీఫ్లవర్',
      'celery': 'సెలరీ',
      'cluster beans': 'గోరుచిక్కుడు',
      'colocasia': 'చామదుంప',
      'coriander': 'కొత్తిమీర',
      'corn': 'మొక్కజొన్న',
      'cucumber': 'దోసకాయ',
      'curry leaves': 'కరివేపాకు',
      'drumstick': 'మునగకాయ',
      'french beans': 'ఫ్రెంచ్ బీన్స్',
      'green peas': 'పచ్చి బఠాణీలు',
      'lettuce': 'లెట్టూస్',
      'mint': 'పుదీనా',
      'mushroom': 'పుట్టగొడుగులు',
      'okra': 'బెండకాయ',
      'fresh onions': 'ఉల్లిపాయలు',
      'onion': 'ఉల్లిపాయ',
      'fresh potatoes': 'బంగాళాదుంపలు',
      'potato': 'బంగాళాదుంప',
      'pumpkin': 'గుమ్మడికాయ',
      'radish': 'ముల్లంగి',
      'raw banana': 'అరటికాయ',
      'ridge gourd': 'బీరకాయ',
      'snake gourd': 'పొట్లకాయ',
      'spinach': 'పాలకూర',
      'spring onion': 'ఉల్లికాడలు',
      'sweet potato': 'చిలగడదుంప',
      'fresh tomatoes': 'టమాటాలు',
      'tomato': 'టమాటా',
      'turnip': 'టర్నిప్',
      'yam': 'కందగడ్డ',
      'zucchini': 'జుక్కిని',
    };

    return teluguNames[name.trim().toLowerCase()] ?? '';
  }
}


class _FarmTrustItem extends StatelessWidget {
  const _FarmTrustItem({
    required this.icon,
    required this.iconColor,
    required this.iconBackground,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final Color iconColor;
  final Color iconBackground;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: iconBackground,
            shape: BoxShape.circle,
          ),
          child: Icon(icon, color: iconColor, size: 18),
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                title,
                maxLines: 2,
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 11,
                  height: 1.15,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                maxLines: 2,
                style: GoogleFonts.lato(
                  color: Colors.grey,
                  fontSize: 9.5,
                  height: 1.2,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _CartItemCard extends StatelessWidget {
  const _CartItemCard({
    required this.item,
    required this.teluguName,
    required this.onAdd,
    required this.onRemove,
  });

  final CartItem item;
  final String teluguName;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  String get displayName =>
      teluguName.isEmpty ? item.name : '${item.name} ($teluguName)';

  @override
  Widget build(BuildContext context) {
    final String image = LocalProductCatalog.imageFor(
      name: item.name,
      preferredImage: item.image,
    );

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(19),
        border: Border.all(color: const Color(0xFFE2EAE3)),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x08000000),
            blurRadius: 12,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: <Widget>[
          Stack(
            children: <Widget>[
              Container(
                width: 88,
                height: 88,
                decoration: BoxDecoration(
                  color: AppColors.lightCream,
                  borderRadius: BorderRadius.circular(15),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(15),
                  child: _buildImage(image),
                ),
              ),
              Positioned(
                top: 6,
                left: 6,
                child: Container(
                  padding:
                  const EdgeInsets.symmetric(horizontal: 6, vertical: 3),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen,
                    borderRadius: BorderRadius.circular(7),
                  ),
                  child: const Text(
                    'FRESH',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 7,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
              if (item.isQuick)
                Positioned(
                  right: 6,
                  top: 6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.goldAmber,
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: Text(
                      item.quickDeliveryText.isEmpty
                          ? 'QUICK'
                          : item.quickDeliveryText.toUpperCase(),
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 7,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              if (item.isPreOrder)
                Positioned(
                  right: 6,
                  bottom: 6,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen,
                      borderRadius: BorderRadius.circular(7),
                    ),
                    child: const Text(
                      'PRE-ORDER',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 7,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  displayName,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.notoSansTelugu(
                    color: AppColors.darkText,
                    fontWeight: FontWeight.w700,
                    fontSize: 14,
                    height: 1.35,
                  ),
                ),
                const SizedBox(height: 5),
                Row(
                  children: <Widget>[
                    const Icon(
                      Icons.eco_rounded,
                      color: AppColors.primaryGreen,
                      size: 14,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        <String>[
                          item.farmerDisplayName,
                          item.weight.trim().isEmpty
                              ? 'Farm fresh'
                              : item.weight,
                          item.organic ? 'Organic' : 'Quality checked',
                        ].join(' • '),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          fontSize: 10.5,
                        ),
                      ),
                    ),
                  ],
                ),
                if (item.isQuick) ...<Widget>[
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEAF7ED),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      'Quick: ${item.quickDeliveryText} • '
                          'Minimum ${item.safeMinimumQuickQuantity} × '
                          '${item.weight.isEmpty ? 'unit' : item.weight}',
                      style: GoogleFonts.lato(
                        color: AppColors.primaryGreen,
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
                if (item.isPreOrder) ...<Widget>[
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(9),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF8E1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        if (item.harvestDate != null)
                          Text(
                            'Harvest: ${_formatCartDate(item.harvestDate!)}',
                            style: GoogleFonts.lato(
                              color: AppColors.darkText,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        if (item.expectedDeliveryDate != null)
                          Text(
                            'Delivery: ${_formatCartDate(item.expectedDeliveryDate!)}',
                            style: GoogleFonts.lato(
                              color: AppColors.darkText,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        if (item.deliverySlot.trim().isNotEmpty)
                          Text(
                            'Slot: ${item.deliverySlot}',
                            style: GoogleFonts.lato(
                              color: AppColors.primaryGreen,
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                      ],
                    ),
                  ),
                ],
                const SizedBox(height: 10),
                Row(
                  children: <Widget>[
                    Container(
                      height: 34,
                      decoration: BoxDecoration(
                        color: AppColors.lightMint,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: AppColors.primaryGreen),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          _QuantityControl(
                            icon: Icons.remove_rounded,
                            onTap: onRemove,
                          ),
                          AnimatedSwitcher(
                            duration: const Duration(milliseconds: 180),
                            transitionBuilder: (Widget child, Animation<double> animation) {
                              return ScaleTransition(
                                scale: animation,
                                child: child,
                              );
                            },
                            child: SizedBox(
                              key: ValueKey<int>(item.quantity),
                              width: 32,
                              child: Text(
                                '${item.quantity}',
                                textAlign: TextAlign.center,
                                style: GoogleFonts.lexend(
                                  fontWeight: FontWeight.w700,
                                  color: AppColors.darkText,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ),
                          _QuantityControl(
                            icon: Icons.add_rounded,
                            onTap: onAdd,
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: <Widget>[
                        Text(
                          '₹${item.price * item.quantity}',
                          style: GoogleFonts.lexend(
                            color: AppColors.primaryGreen,
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                        Text(
                          '₹${item.price} each',
                          style: GoogleFonts.lato(
                            color: Colors.grey.shade500,
                            fontSize: 10,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  String _formatCartDate(DateTime date) {
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

  Widget _buildImage(String image) {
    if (image.startsWith('assets/')) {
      return Image.asset(
        image,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => _fallbackImage(),
      );
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      return Image.network(
        image,
        fit: BoxFit.cover,
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
        size: 38,
      ),
    );
  }
}

class _SuggestionCard extends StatelessWidget {
  const _SuggestionCard({
    required this.product,
    required this.teluguName,
    required this.onAdd,
  });

  final Map<String, dynamic> product;
  final String teluguName;
  final VoidCallback onAdd;

  @override
  Widget build(BuildContext context) {
    final String name = product['name']?.toString() ?? '';
    final String displayName =
    teluguName.isEmpty ? name : '$name ($teluguName)';
    final String preferredImage = product['image']?.toString() ?? '';
    final String image = LocalProductCatalog.imageFor(
      name: name,
      preferredImage: preferredImage,
    );
    final int price = (product['price'] as num?)?.toInt() ?? 0;
    final int discount = (product['discount'] as num?)?.toInt() ?? 0;

    return Container(
      width: 158,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: const Color(0xFFE2EAE3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Stack(
              fit: StackFit.expand,
              children: <Widget>[
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.lightCream,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(14),
                    child: _buildProductImage(image),
                  ),
                ),
                if (discount > 0)
                  Positioned(
                    top: 6,
                    left: 6,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 3,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.goldAmber,
                        borderRadius: BorderRadius.circular(7),
                      ),
                      child: Text(
                        '$discount% OFF',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 7,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    ),
                  ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          Text(
            displayName,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.notoSansTelugu(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.darkText,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            '500 g • Fresh',
            style: GoogleFonts.lato(
              color: Colors.grey.shade500,
              fontSize: 9.5,
            ),
          ),
          const SizedBox(height: 7),
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  '₹$price',
                  style: GoogleFonts.lexend(
                    color: AppColors.primaryGreen,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              SizedBox(
                height: 31,
                child: OutlinedButton(
                  onPressed: onAdd,
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 10),
                    foregroundColor: AppColors.primaryGreen,
                    side: const BorderSide(color: AppColors.primaryGreen),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(9),
                    ),
                  ),
                  child: Text(
                    'ADD',
                    style: GoogleFonts.lexend(
                      fontSize: 9,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProductImage(String image) {
    if (image.startsWith('assets/')) {
      return Image.asset(
        image,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => const Icon(
          Icons.eco_rounded,
          color: AppColors.primaryGreen,
        ),
      );
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      return Image.network(
        image,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => const Icon(
          Icons.eco_rounded,
          color: AppColors.primaryGreen,
        ),
      );
    }

    return const Icon(
      Icons.eco_rounded,
      color: AppColors.primaryGreen,
    );
  }
}

class _CouponTile extends StatelessWidget {
  const _CouponTile({
    required this.code,
    required this.title,
    required this.description,
    required this.enabled,
    required this.selected,
    required this.onTap,
  });

  final String code;
  final String title;
  final String description;
  final bool enabled;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Opacity(
      opacity: enabled ? 1 : 0.5,
      child: Material(
        color: selected ? AppColors.lightMint : Colors.white,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          onTap: enabled ? onTap : null,
          borderRadius: BorderRadius.circular(16),
          child: Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: selected
                    ? AppColors.primaryGreen
                    : const Color(0xFFE2EAE3),
              ),
            ),
            child: Row(
              children: <Widget>[
                Container(
                  padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    code,
                    style: GoogleFonts.lexend(
                      color: Colors.white,
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                    ),
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
                          color: AppColors.darkText,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        description,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ),
                ),
                Icon(
                  selected
                      ? Icons.check_circle_rounded
                      : Icons.chevron_right_rounded,
                  color: AppColors.primaryGreen,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _QuantityControl extends StatelessWidget {
  const _QuantityControl({
    required this.icon,
    required this.onTap,
  });

  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(9),
      child: SizedBox(
        width: 31,
        height: 32,
        child: Icon(
          icon,
          size: 17,
          color: AppColors.primaryGreen,
        ),
      ),
    );
  }
}
