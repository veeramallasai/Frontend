import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../models/coupon_model.dart';
import '../../services/coupon_service.dart';

class CouponsScreen extends StatefulWidget {
  final double orderAmount;
  final double deliveryCharge;
  final int previousOrderCount;
  final List<String> productIds;
  final List<String> categories;
  final bool selectionMode;

  const CouponsScreen({
    super.key,
    this.orderAmount = 0,
    this.deliveryCharge = 0,
    this.previousOrderCount = 0,
    this.productIds =
    const <String>[],
    this.categories =
    const <String>[],
    this.selectionMode = false,
  });

  @override
  State<CouponsScreen> createState() =>
      _CouponsScreenState();
}

class _CouponsScreenState
    extends State<CouponsScreen> {
  final CouponService _couponService =
  CouponService();

  final TextEditingController
  _codeController =
  TextEditingController();

  String _selectedFilter = 'Available';
  String _searchQuery = '';
  bool _isApplyingCode = false;

  User? get _user =>
      FirebaseAuth.instance.currentUser;

  static const List<String> _filters =
  <String>[
    'Available',
    'All',
    'Expired',
    'Upcoming',
  ];

  @override
  void dispose() {
    _codeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final User? user = _user;

    if (user == null) {
      return _buildLoggedOutScreen();
    }

    return Scaffold(
      backgroundColor:
      const Color(0xFFF6F8F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Text(
          widget.selectionMode
              ? 'Apply Coupon'
              : 'Coupons & Offers',
          style: GoogleFonts.lexend(
            color: AppColors.darkText,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
      body:
      StreamBuilder<List<CouponModel>>(
        stream:
        _couponService.watchAllCoupons(),
        builder: (
            BuildContext context,
            AsyncSnapshot<List<CouponModel>>
            snapshot,
            ) {
          if (snapshot.connectionState ==
              ConnectionState.waiting) {
            return const Center(
              child: CircularProgressIndicator(
                color: AppColors.primaryGreen,
              ),
            );
          }

          if (snapshot.hasError) {
            return _buildErrorState();
          }

          final List<CouponModel> coupons =
              snapshot.data ??
                  const <CouponModel>[];

          final List<CouponModel> filtered =
          _applyFilters(coupons);

          return Column(
            children: <Widget>[
              _buildHeroCard(coupons),
              _buildManualCodeBox(user.uid),
              _buildSearchBox(),
              _buildFilterChips(),
              Expanded(
                child: filtered.isEmpty
                    ? _buildEmptyState()
                    : _buildCouponList(
                  filtered,
                  user.uid,
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildLoggedOutScreen() {
    return Scaffold(
      backgroundColor:
      const Color(0xFFF6F8F6),
      appBar: AppBar(
        title:
        const Text('Coupons & Offers'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment:
            MainAxisAlignment.center,
            children: <Widget>[
              const Icon(
                Icons.lock_outline_rounded,
                size: 78,
                color:
                AppColors.primaryGreen,
              ),
              const SizedBox(height: 18),
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
                'Sign in to view and apply exclusive Farm To Home coupons.',
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

  Widget _buildHeroCard(
      List<CouponModel> coupons,
      ) {
    final int available = coupons
        .where(
          (CouponModel coupon) =>
      coupon.isCurrentlyAvailable,
    )
        .length;

    return Container(
      margin:
      const EdgeInsets.fromLTRB(
        16,
        14,
        16,
        0,
      ),
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
        ),
        borderRadius:
        BorderRadius.circular(22),
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
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color:
              Colors.white.withValues(
                alpha: 0.18,
              ),
              borderRadius:
              BorderRadius.circular(17),
            ),
            child: const Icon(
              Icons.local_offer_rounded,
              color: Colors.white,
              size: 31,
            ),
          ),
          const SizedBox(width: 13),
          Expanded(
            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  '$available offers available',
                  style: GoogleFonts.lexend(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight:
                    FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Apply the best coupon and save more on fresh farm products.',
                  style: GoogleFonts.lato(
                    color: Colors.white70,
                    fontSize: 12,
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

  Widget _buildManualCodeBox(
      String userId,
      ) {
    return Container(
      margin:
      const EdgeInsets.fromLTRB(
        16,
        14,
        16,
        0,
      ),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius:
        BorderRadius.circular(18),
        border: Border.all(
          color:
          const Color(0xFFE2EAE3),
        ),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: TextField(
              controller: _codeController,
              textCapitalization:
              TextCapitalization.characters,
              decoration:
              const InputDecoration(
                hintText:
                'Enter coupon code',
                prefixIcon:
                Icon(Icons.sell_outlined),
              ),
            ),
          ),
          const SizedBox(width: 10),
          ElevatedButton(
            onPressed: _isApplyingCode
                ? null
                : () =>
                _applyManualCode(userId),
            child: Text(
              _isApplyingCode
                  ? 'CHECKING...'
                  : 'APPLY',
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBox() {
    return Padding(
      padding:
      const EdgeInsets.fromLTRB(
        16,
        14,
        16,
        0,
      ),
      child: TextField(
        onChanged: (String value) {
          setState(() {
            _searchQuery =
                value.trim().toLowerCase();
          });
        },
        decoration: InputDecoration(
          hintText:
          'Search coupon code or offer',
          prefixIcon: const Icon(
            Icons.search_rounded,
            color:
            AppColors.primaryGreen,
          ),
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius:
            BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          enabledBorder:
          OutlineInputBorder(
            borderRadius:
            BorderRadius.circular(16),
            borderSide: const BorderSide(
              color:
              Color(0xFFE2EAE3),
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
        const EdgeInsets.fromLTRB(
          16,
          12,
          16,
          8,
        ),
        scrollDirection:
        Axis.horizontal,
        itemCount: _filters.length,
        separatorBuilder: (_, __) =>
        const SizedBox(width: 8),
        itemBuilder: (
            BuildContext context,
            int index,
            ) {
          final String filter =
          _filters[index];

          final bool selected =
              _selectedFilter == filter;

          return ChoiceChip(
            selected: selected,
            label: Text(filter),
            showCheckmark: false,
            selectedColor:
            AppColors.primaryGreen,
            backgroundColor: Colors.white,
            side: BorderSide(
              color: selected
                  ? AppColors.primaryGreen
                  : const Color(
                0xFFE2EAE3,
              ),
            ),
            labelStyle: GoogleFonts.lato(
              color: selected
                  ? Colors.white
                  : AppColors.darkText,
              fontWeight:
              FontWeight.w700,
            ),
            onSelected: (_) {
              setState(() {
                _selectedFilter =
                    filter;
              });
            },
          );
        },
      ),
    );
  }

  Widget _buildCouponList(
      List<CouponModel> coupons,
      String userId,
      ) {
    return RefreshIndicator(
      color: AppColors.primaryGreen,
      onRefresh: () async {
        await Future<void>.delayed(
          const Duration(
            milliseconds: 450,
          ),
        );

        if (mounted) {
          setState(() {});
        }
      },
      child: ListView.builder(
        padding:
        const EdgeInsets.fromLTRB(
          16,
          4,
          16,
          30,
        ),
        itemCount: coupons.length,
        itemBuilder: (
            BuildContext context,
            int index,
            ) {
          return _buildCouponCard(
            coupons[index],
            userId,
          );
        },
      ),
    );
  }

  Widget _buildCouponCard(
      CouponModel coupon,
      String userId,
      ) {
    final bool available =
        coupon.isCurrentlyAvailable;

    return Container(
      margin:
      const EdgeInsets.only(
        bottom: 13,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius:
        BorderRadius.circular(20),
        border: Border.all(
          color: available
              ? const Color(
            0xFFCFE1D2,
          )
              : const Color(
            0xFFE2E7E3,
          ),
        ),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0D000000),
            blurRadius: 13,
            offset: Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: <Widget>[
          Container(
            padding:
            const EdgeInsets.all(15),
            child: Row(
              crossAxisAlignment:
              CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  width: 62,
                  height: 62,
                  decoration: BoxDecoration(
                    color: available
                        ? AppColors.lightMint
                        : Colors.grey.shade200,
                    borderRadius:
                    BorderRadius.circular(16),
                  ),
                  child: Icon(
                    _couponIcon(coupon.type),
                    color: available
                        ? AppColors.primaryGreen
                        : Colors.grey.shade500,
                    size: 31,
                  ),
                ),
                const SizedBox(width: 13),
                Expanded(
                  child: Column(
                    crossAxisAlignment:
                    CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Expanded(
                            child: Text(
                              coupon.title,
                              maxLines: 2,
                              overflow:
                              TextOverflow.ellipsis,
                              style:
                              GoogleFonts.lexend(
                                color:
                                AppColors.darkText,
                                fontSize: 15,
                                fontWeight:
                                FontWeight.w800,
                              ),
                            ),
                          ),
                          const SizedBox(width: 8),
                          _availabilityChip(
                            coupon,
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        coupon.description,
                        maxLines: 3,
                        overflow:
                        TextOverflow.ellipsis,
                        style: GoogleFonts.lato(
                          color:
                          Colors.grey.shade700,
                          fontSize: 12,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 9),
                      Wrap(
                        spacing: 7,
                        runSpacing: 7,
                        children: <Widget>[
                          _infoChip(
                            coupon.offerLabel,
                          ),
                          if (coupon
                              .minimumOrderAmount >
                              0)
                            _infoChip(
                              'Min ₹${coupon.minimumOrderAmount.toStringAsFixed(0)}',
                            ),
                          if (coupon
                              .firstOrderOnly)
                            _infoChip(
                              'First order',
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding:
            const EdgeInsets.fromLTRB(
              15,
              11,
              15,
              11,
            ),
            decoration: const BoxDecoration(
              color: AppColors.lightCream,
              borderRadius:
              BorderRadius.vertical(
                bottom:
                Radius.circular(20),
              ),
            ),
            child: Row(
              children: <Widget>[
                Expanded(
                  child: InkWell(
                    borderRadius:
                    BorderRadius.circular(10),
                    onTap: () =>
                        _copyCode(coupon),
                    child: Container(
                      padding:
                      const EdgeInsets
                          .symmetric(
                        horizontal: 11,
                        vertical: 9,
                      ),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius:
                        BorderRadius.circular(
                          10,
                        ),
                        border: Border.all(
                          color:
                          AppColors.primaryGreen,
                          style:
                          BorderStyle.solid,
                        ),
                      ),
                      child: Row(
                        mainAxisAlignment:
                        MainAxisAlignment.center,
                        children: <Widget>[
                          Flexible(
                            child: Text(
                              coupon
                                  .normalizedCode,
                              maxLines: 1,
                              overflow:
                              TextOverflow.ellipsis,
                              style:
                              GoogleFonts.lexend(
                                color: AppColors
                                    .primaryGreen,
                                fontSize: 12,
                                fontWeight:
                                FontWeight.w800,
                              ),
                            ),
                          ),
                          const SizedBox(width: 7),
                          const Icon(
                            Icons.copy_rounded,
                            color: AppColors
                                .primaryGreen,
                            size: 16,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  onPressed: available
                      ? () => _applyCoupon(
                    coupon,
                    userId,
                  )
                      : null,
                  child: Text(
                    widget.selectionMode
                        ? 'APPLY'
                        : 'USE NOW',
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _availabilityChip(
      CouponModel coupon,
      ) {
    String label = 'AVAILABLE';
    Color background =
    const Color(0xFFE8F5E9);
    Color foreground =
        AppColors.primaryGreen;

    if (coupon.isExpired) {
      label = 'EXPIRED';
      background =
      const Color(0xFFFFEBEE);
      foreground = AppColors.errorRed;
    } else if (coupon.isUpcoming) {
      label = 'UPCOMING';
      background =
      const Color(0xFFFFF8E1);
      foreground = AppColors.goldAmber;
    } else if (!coupon.active) {
      label = 'INACTIVE';
      background =
          Colors.grey.shade200;
      foreground =
          Colors.grey.shade600;
    }

    return Container(
      padding:
      const EdgeInsets.symmetric(
        horizontal: 7,
        vertical: 4,
      ),
      decoration: BoxDecoration(
        color: background,
        borderRadius:
        BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: GoogleFonts.lato(
          color: foreground,
          fontSize: 8,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _infoChip(String label) {
    return Container(
      padding:
      const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: const Color(0xFFF2F7F2),
        borderRadius:
        BorderRadius.circular(10),
      ),
      child: Text(
        label,
        style: GoogleFonts.lato(
          color: AppColors.darkText,
          fontSize: 9,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding:
        const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment:
          MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.local_offer_outlined,
              size: 76,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 17),
            Text(
              'No coupons found',
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              'Try another search or coupon filter.',
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

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding:
        const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment:
          MainAxisAlignment.center,
          children: <Widget>[
            const Icon(
              Icons.error_outline_rounded,
              size: 72,
              color: AppColors.errorRed,
            ),
            const SizedBox(height: 16),
            Text(
              'Unable to load coupons',
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              'Please check your internet and try again.',
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

  Future<void> _applyManualCode(
      String userId,
      ) async {
    final String code =
    _codeController.text.trim();

    if (code.isEmpty) {
      _showMessage(
        'Enter a coupon code.',
        isError: true,
      );
      return;
    }

    setState(() {
      _isApplyingCode = true;
    });

    try {
      final AppliedCouponResult result =
      await _couponService.applyCoupon(
        code: code,
        userId: userId,
        orderAmount: widget.orderAmount,
        deliveryCharge:
        widget.deliveryCharge,
        previousOrderCount:
        widget.previousOrderCount,
        productIds: widget.productIds,
        categories: widget.categories,
      );

      if (!result.isValid ||
          result.coupon == null) {
        _showMessage(
          result.message,
          isError: true,
        );
        return;
      }

      _handleAppliedResult(result);
    } on CouponServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isApplyingCode = false;
        });
      }
    }
  }

  Future<void> _applyCoupon(
      CouponModel coupon,
      String userId,
      ) async {
    final AppliedCouponResult result =
    await _couponService.applyCoupon(
      code: coupon.normalizedCode,
      userId: userId,
      orderAmount: widget.orderAmount,
      deliveryCharge:
      widget.deliveryCharge,
      previousOrderCount:
      widget.previousOrderCount,
      productIds: widget.productIds,
      categories: widget.categories,
    );

    if (!result.isValid ||
        result.coupon == null) {
      _showMessage(
        result.message,
        isError: true,
      );
      return;
    }

    _handleAppliedResult(result);
  }

  void _handleAppliedResult(
      AppliedCouponResult result,
      ) {
    if (widget.selectionMode) {
      Navigator.of(context).pop(result);
      return;
    }

    _showMessage(
      '${result.message} You save ₹${result.discountAmount.toStringAsFixed(0)}.',
    );
  }

  Future<void> _copyCode(
      CouponModel coupon,
      ) async {
    await Clipboard.setData(
      ClipboardData(
        text: coupon.normalizedCode,
      ),
    );

    _showMessage(
      '${coupon.normalizedCode} copied.',
    );
  }

  List<CouponModel> _applyFilters(
      List<CouponModel> coupons,
      ) {
    return coupons.where(
          (CouponModel coupon) {
        bool matchesFilter = true;

        switch (_selectedFilter) {
          case 'Available':
            matchesFilter =
                coupon.isCurrentlyAvailable;
            break;

          case 'Expired':
            matchesFilter =
                coupon.isExpired;
            break;

          case 'Upcoming':
            matchesFilter =
                coupon.isUpcoming;
            break;

          case 'All':
          default:
            matchesFilter = true;
        }

        if (!matchesFilter) {
          return false;
        }

        if (_searchQuery.isEmpty) {
          return true;
        }

        final String searchable =
        <String>[
          coupon.code,
          coupon.title,
          coupon.description,
          coupon.typeLabel,
        ].join(' ').toLowerCase();

        return searchable.contains(
          _searchQuery,
        );
      },
    ).toList();
  }

  IconData _couponIcon(
      CouponType type,
      ) {
    switch (type) {
      case CouponType.percentage:
        return Icons.percent_rounded;

      case CouponType.flat:
        return Icons.currency_rupee_rounded;

      case CouponType.freeDelivery:
        return Icons.local_shipping_rounded;
    }
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
          behavior:
          SnackBarBehavior.floating,
          margin:
          const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius:
            BorderRadius.circular(13),
          ),
        ),
      );
  }
}