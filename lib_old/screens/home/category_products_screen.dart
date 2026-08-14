import 'dart:async';

import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../services/cart_service.dart';
import '../product/product_details_screen.dart';

class CategoryProductsScreen extends StatefulWidget {
  final String category;
  final List<Map<String, dynamic>> products;

  const CategoryProductsScreen({
    super.key,
    required this.category,
    required this.products,
  });

  @override
  State<CategoryProductsScreen> createState() =>
      _CategoryProductsScreenState();
}

class _CategoryProductsScreenState extends State<CategoryProductsScreen> {
  final CartService _cartService = CartService();
  final TextEditingController _searchController = TextEditingController();
  final Set<String> _wishlist = <String>{};

  late final VoidCallback _cartListener;

  String _searchQuery = '';
  String _selectedSort = 'Recommended';
  String _selectedFilter = 'All';
  bool _isRefreshing = false;

  static const List<_FilterOption> _filters = <_FilterOption>[
    _FilterOption('All', Icons.grid_view_rounded),
    _FilterOption('Organic', Icons.eco_rounded),
    _FilterOption('Best Seller', Icons.local_fire_department_rounded),
    _FilterOption('Offers', Icons.local_offer_rounded),
    _FilterOption('Fast Delivery', Icons.bolt_rounded),
    _FilterOption('In Stock', Icons.inventory_2_rounded),
  ];

  static const List<_SortOption> _sortOptions = <_SortOption>[
    _SortOption('Recommended', Icons.auto_awesome_rounded),
    _SortOption('Price: Low to High', Icons.trending_up_rounded),
    _SortOption('Price: High to Low', Icons.trending_down_rounded),
    _SortOption('Rating', Icons.star_rounded),
    _SortOption('Discount', Icons.percent_rounded),
    _SortOption('Newest', Icons.new_releases_rounded),
  ];

  @override
  void initState() {
    super.initState();
    _cartListener = () {
      if (mounted) {
        setState(() {});
      }
    };
    _cartService.addListener(_cartListener);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _cartService.removeListener(_cartListener);
    super.dispose();
  }

  String _text(dynamic value, {String fallback = ''}) {
    final String result = value?.toString().trim() ?? '';
    return result.isEmpty ? fallback : result;
  }

  int _intValue(dynamic value, {int fallback = 0}) {
    if (value is num) return value.toInt();
    return int.tryParse(value?.toString() ?? '') ?? fallback;
  }

  double _doubleValue(dynamic value, {double fallback = 0}) {
    if (value is num) return value.toDouble();
    return double.tryParse(value?.toString() ?? '') ?? fallback;
  }

  bool _boolValue(dynamic value, {bool fallback = false}) {
    if (value is bool) return value;
    if (value is num) return value != 0;
    if (value is String) {
      final String normalized = value.toLowerCase().trim();
      if (normalized == 'true' || normalized == '1' || normalized == 'yes') {
        return true;
      }
      if (normalized == 'false' || normalized == '0' || normalized == 'no') {
        return false;
      }
    }
    return fallback;
  }

  int _priceOf(Map<String, dynamic> product) {
    return _intValue(product['price']);
  }

  int _discountOf(Map<String, dynamic> product) {
    return _intValue(product['discount']);
  }

  double _ratingOf(Map<String, dynamic> product) {
    return _doubleValue(product['rating'], fallback: 4.5);
  }

  String _productKey(Map<String, dynamic> product) {
    final String id = _text(product['id']);
    return id.isNotEmpty ? id : _text(product['name']).toLowerCase();
  }

  String _displayName(Map<String, dynamic> product) {
    final String name = _text(
      product['name'],
      fallback: 'Farm Fresh Product',
    );
    final String teluguName = _text(product['teluguName']);
    return teluguName.isEmpty ? name : '$name ($teluguName)';
  }

  String get _categoryTelugu {
    for (final Map<String, dynamic> product in widget.products) {
      final String value = _text(product['categoryTelugu']);
      if (value.isNotEmpty) return value;
    }
    return '';
  }

  String get _displayCategory {
    return _categoryTelugu.isEmpty
        ? widget.category
        : '${widget.category} ($_categoryTelugu)';
  }

  List<Map<String, dynamic>> get _visibleProducts {
    final List<Map<String, dynamic>> products =
    List<Map<String, dynamic>>.from(widget.products);

    final String query = _searchQuery.toLowerCase().trim();
    if (query.isNotEmpty) {
      products.removeWhere((Map<String, dynamic> product) {
        final String searchable = <String>[
          _text(product['name']),
          _text(product['teluguName']),
          _text(product['farmerName']),
          _text(product['farmName']),
          _text(product['origin']),
          _text(product['description']),
        ].join(' ').toLowerCase();
        return !searchable.contains(query);
      });
    }

    products.removeWhere((Map<String, dynamic> product) {
      switch (_selectedFilter) {
        case 'Organic':
          return !_boolValue(product['organic']);
        case 'Best Seller':
          return !_boolValue(product['bestSeller']);
        case 'Offers':
          return _discountOf(product) <= 0;
        case 'Fast Delivery':
          final String time = _text(product['deliveryTime']).toLowerCase();
          final int minutes = _intValue(
            time.replaceAll(RegExp(r'[^0-9]'), ''),
            fallback: 999,
          );
          return !(time.contains('min') && minutes <= 30);
        case 'In Stock':
          return !_boolValue(product['inStock'], fallback: true);
        default:
          return false;
      }
    });

    switch (_selectedSort) {
      case 'Price: Low to High':
        products.sort(
              (Map<String, dynamic> a, Map<String, dynamic> b) =>
              _priceOf(a).compareTo(_priceOf(b)),
        );
        break;
      case 'Price: High to Low':
        products.sort(
              (Map<String, dynamic> a, Map<String, dynamic> b) =>
              _priceOf(b).compareTo(_priceOf(a)),
        );
        break;
      case 'Rating':
        products.sort(
              (Map<String, dynamic> a, Map<String, dynamic> b) =>
              _ratingOf(b).compareTo(_ratingOf(a)),
        );
        break;
      case 'Discount':
        products.sort(
              (Map<String, dynamic> a, Map<String, dynamic> b) =>
              _discountOf(b).compareTo(_discountOf(a)),
        );
        break;
      case 'Newest':
        products.sort((Map<String, dynamic> a, Map<String, dynamic> b) {
          final int aOrder = _intValue(a['newArrivalOrder']);
          final int bOrder = _intValue(b['newArrivalOrder']);
          return bOrder.compareTo(aOrder);
        });
        break;
      default:
        products.sort((Map<String, dynamic> a, Map<String, dynamic> b) {
          final int aScore =
              (_boolValue(a['bestSeller']) ? 100 : 0) +
                  (_boolValue(a['organic']) ? 30 : 0) +
                  _discountOf(a) +
                  (_ratingOf(a) * 10).round();
          final int bScore =
              (_boolValue(b['bestSeller']) ? 100 : 0) +
                  (_boolValue(b['organic']) ? 30 : 0) +
                  _discountOf(b) +
                  (_ratingOf(b) * 10).round();
          return bScore.compareTo(aScore);
        });
    }

    return products;
  }

  void _add(Map<String, dynamic> product) {
    final String name = _text(product['name']);
    if (name.isEmpty) return;

    _cartService.addItem(
      name,
      _text(product['image']),
      _priceOf(product),
    );

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          duration: const Duration(milliseconds: 900),
          margin: const EdgeInsets.fromLTRB(16, 0, 16, 16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          content: Text('$name added to cart'),
        ),
      );
  }

  void _remove(Map<String, dynamic> product) {
    final String name = _text(product['name']);
    if (name.isEmpty) return;
    _cartService.removeOne(name);
  }

  void _toggleWishlist(Map<String, dynamic> product) {
    final String key = _productKey(product);
    setState(() {
      if (!_wishlist.add(key)) {
        _wishlist.remove(key);
      }
    });
  }

  void _openProduct(Map<String, dynamic> product) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ProductDetailScreen(product: product),
      ),
    );
  }

  Future<void> _refreshProducts() async {
    if (_isRefreshing) return;
    setState(() => _isRefreshing = true);
    await Future<void>.delayed(const Duration(milliseconds: 700));
    if (!mounted) return;
    setState(() => _isRefreshing = false);
  }

  void _clearSearch() {
    _searchController.clear();
    setState(() => _searchQuery = '');
    FocusScope.of(context).unfocus();
  }

  Future<void> _showSortSheet() async {
    await showModalBottomSheet<void>(
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
            padding: const EdgeInsets.fromLTRB(20, 2, 20, 24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: AppColors.lightMint,
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: const Icon(
                        Icons.swap_vert_rounded,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            'Sort products',
                            style: GoogleFonts.lexend(
                              fontSize: 21,
                              fontWeight: FontWeight.w700,
                              color: AppColors.darkText,
                            ),
                          ),
                          Text(
                            'Choose how products should appear',
                            style: GoogleFonts.lato(
                              color: Colors.grey.shade600,
                              fontSize: 12,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 18),
                ..._sortOptions.map((_SortOption option) {
                  final bool selected = option.label == _selectedSort;
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 8),
                    child: Material(
                      color: selected ? AppColors.lightCream : Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () {
                          setState(() => _selectedSort = option.label);
                          Navigator.pop(bottomSheetContext);
                        },
                        child: Padding(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          child: Row(
                            children: <Widget>[
                              Icon(
                                option.icon,
                                color: selected
                                    ? AppColors.primaryGreen
                                    : Colors.grey.shade600,
                                size: 21,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  option.label,
                                  style: GoogleFonts.lato(
                                    color: AppColors.darkText,
                                    fontWeight: selected
                                        ? FontWeight.w800
                                        : FontWeight.w600,
                                  ),
                                ),
                              ),
                              if (selected)
                                const Icon(
                                  Icons.check_circle_rounded,
                                  color: AppColors.primaryGreen,
                                ),
                            ],
                          ),
                        ),
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Map<String, dynamic>> products = _visibleProducts;
    final double width = MediaQuery.sizeOf(context).width;
    final int crossAxisCount = width >= 1200
        ? 5
        : width >= 900
        ? 4
        : width >= 620
        ? 3
        : 2;

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: <Widget>[
            Text(
              _displayCategory,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.notoSansTelugu(
                fontWeight: FontWeight.w800,
                color: AppColors.darkText,
                fontSize: 17,
              ),
            ),
            Text(
              '${products.length} of ${widget.products.length} products',
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 11,
              ),
            ),
          ],
        ),
        actions: <Widget>[
          Stack(
            clipBehavior: Clip.none,
            children: <Widget>[
              IconButton(
                tooltip: 'Cart items',
                onPressed: () {
                  ScaffoldMessenger.of(context)
                    ..hideCurrentSnackBar()
                    ..showSnackBar(
                      SnackBar(
                        behavior: SnackBarBehavior.floating,
                        content: Text(
                          '${_cartService.totalItemCount} item(s) in your cart',
                        ),
                      ),
                    );
                },
                icon: const Icon(Icons.shopping_bag_outlined),
              ),
              if (_cartService.totalItemCount > 0)
                Positioned(
                  top: 5,
                  right: 4,
                  child: Container(
                    constraints: const BoxConstraints(minWidth: 18),
                    height: 18,
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    alignment: Alignment.center,
                    decoration: const BoxDecoration(
                      color: AppColors.primaryGreen,
                      shape: BoxShape.circle,
                    ),
                    child: Text(
                      '${_cartService.totalItemCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 5),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.primaryGreen,
        onRefresh: _refreshProducts,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          slivers: <Widget>[
            SliverToBoxAdapter(child: _buildPremiumHeader()),
            SliverToBoxAdapter(child: _buildSearchBar()),
            SliverToBoxAdapter(child: _buildFilterStrip()),
            SliverToBoxAdapter(child: _buildResultsToolbar(products.length)),
            if (_isRefreshing)
              const SliverToBoxAdapter(
                child: LinearProgressIndicator(
                  minHeight: 2,
                  color: AppColors.primaryGreen,
                  backgroundColor: AppColors.lightMint,
                ),
              ),
            if (products.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _buildEmptyState(),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(14, 10, 14, 120),
                sliver: SliverGrid(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    mainAxisSpacing: 12,
                    crossAxisSpacing: 12,
                    childAspectRatio: width >= 620 ? 0.68 : 0.57,
                  ),
                  delegate: SliverChildBuilderDelegate(
                        (BuildContext context, int index) {
                      final Map<String, dynamic> product = products[index];
                      final String name = _text(product['name']);
                      final int quantity = _cartService.getQuantity(name);
                      final bool wished = _wishlist.contains(
                        _productKey(product),
                      );

                      return FadeInUp(
                        duration: const Duration(milliseconds: 320),
                        delay: Duration(
                          milliseconds: index.clamp(0, 10) * 30,
                        ),
                        child: _PremiumProductCard(
                          product: product,
                          displayName: _displayName(product),
                          price: _priceOf(product),
                          discount: _discountOf(product),
                          rating: _ratingOf(product),
                          quantity: quantity,
                          inStock: _boolValue(
                            product['inStock'],
                            fallback: true,
                          ),
                          wished: wished,
                          onTap: () => _openProduct(product),
                          onAdd: () => _add(product),
                          onRemove: () => _remove(product),
                          onWishlist: () => _toggleWishlist(product),
                        ),
                      );
                    },
                    childCount: products.length,
                  ),
                ),
              ),
          ],
        ),
      ),
      bottomNavigationBar: _cartService.totalItemCount > 0
          ? _buildCartSummaryBar()
          : null,
    );
  }

  Widget _buildPremiumHeader() {
    final int organicCount = widget.products
        .where(
          (Map<String, dynamic> product) => _boolValue(product['organic']),
    )
        .length;
    final int offerCount = widget.products
        .where((Map<String, dynamic> product) => _discountOf(product) > 0)
        .length;

    return FadeInDown(
      duration: const Duration(milliseconds: 350),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: <Color>[
              AppColors.primaryGreen,
              AppColors.accentGreen,
            ],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(26),
          boxShadow: <BoxShadow>[
            BoxShadow(
              color: AppColors.primaryGreen.withOpacity(0.23),
              blurRadius: 22,
              offset: const Offset(0, 10),
            ),
          ],
        ),
        child: Stack(
          children: <Widget>[
            Positioned(
              right: -12,
              top: -18,
              child: Icon(
                Icons.eco_rounded,
                size: 105,
                color: Colors.white.withOpacity(0.08),
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Row(
                  children: <Widget>[
                    Container(
                      width: 58,
                      height: 58,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.17),
                        borderRadius: BorderRadius.circular(18),
                      ),
                      child: const Icon(
                        Icons.shopping_basket_rounded,
                        color: Colors.white,
                        size: 31,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            _displayCategory,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.notoSansTelugu(
                              color: Colors.white,
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              height: 1.3,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${widget.products.length} farm-fresh products',
                            style: GoogleFonts.lato(
                              color: Colors.white70,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: <Widget>[
                    _HeaderBadge(
                      icon: Icons.eco_rounded,
                      text: '$organicCount organic',
                    ),
                    _HeaderBadge(
                      icon: Icons.local_offer_rounded,
                      text: '$offerCount offers',
                    ),
                    const _HeaderBadge(
                      icon: Icons.bolt_rounded,
                      text: 'Fast delivery',
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: TextField(
        controller: _searchController,
        onChanged: (String value) => setState(() => _searchQuery = value),
        textInputAction: TextInputAction.search,
        decoration: InputDecoration(
          hintText: 'Search ${widget.category}, farmer or farm',
          hintStyle: GoogleFonts.lato(color: Colors.grey.shade500),
          prefixIcon: const Icon(
            Icons.search_rounded,
            color: AppColors.primaryGreen,
          ),
          suffixIcon: _searchQuery.isNotEmpty
              ? IconButton(
            tooltip: 'Clear search',
            onPressed: _clearSearch,
            icon: const Icon(Icons.close_rounded),
          )
              : const Icon(
            Icons.mic_none_rounded,
            color: AppColors.primaryGreen,
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(color: Color(0xFFE1E9E2)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(color: Color(0xFFE1E9E2)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(
              color: AppColors.primaryGreen,
              width: 1.6,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFilterStrip() {
    return SizedBox(
      height: 64,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: _filters.length,
        separatorBuilder: (_, __) => const SizedBox(width: 9),
        itemBuilder: (BuildContext context, int index) {
          final _FilterOption option = _filters[index];
          final bool selected = _selectedFilter == option.label;
          return ChoiceChip(
            selected: selected,
            showCheckmark: false,
            avatar: Icon(
              option.icon,
              size: 16,
              color: selected ? Colors.white : AppColors.primaryGreen,
            ),
            label: Text(
              option.label,
              style: GoogleFonts.lato(
                color: selected ? Colors.white : AppColors.darkText,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
            selectedColor: AppColors.primaryGreen,
            backgroundColor: Colors.white,
            side: BorderSide(
              color: selected
                  ? AppColors.primaryGreen
                  : const Color(0xFFDCE6DD),
            ),
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(14),
            ),
            onSelected: (_) {
              setState(() => _selectedFilter = option.label);
            },
          );
        },
      ),
    );
  }

  Widget _buildResultsToolbar(int count) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 6, 16, 4),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  '$count products',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                Text(
                  _selectedFilter == 'All'
                      ? 'Freshly selected for you'
                      : 'Filtered by $_selectedFilter',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
          OutlinedButton.icon(
            onPressed: _showSortSheet,
            icon: const Icon(Icons.swap_vert_rounded, size: 18),
            label: Text(
              _selectedSort == 'Recommended' ? 'Sort' : _selectedSort,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.lato(fontWeight: FontWeight.w700),
            ),
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.primaryGreen,
              side: const BorderSide(color: AppColors.primaryGreen),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(13),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: FadeIn(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              Container(
                width: 112,
                height: 112,
                decoration: BoxDecoration(
                  color: AppColors.lightCream,
                  shape: BoxShape.circle,
                  boxShadow: <BoxShadow>[
                    BoxShadow(
                      color: AppColors.primaryGreen.withOpacity(0.10),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: const Icon(
                  Icons.search_off_rounded,
                  size: 54,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'No products found',
                style: GoogleFonts.lexend(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: AppColors.darkText,
                ),
              ),
              const SizedBox(height: 7),
              Text(
                'Try another name or clear the selected filter.',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  height: 1.5,
                ),
              ),
              const SizedBox(height: 18),
              OutlinedButton.icon(
                onPressed: () {
                  _clearSearch();
                  setState(() => _selectedFilter = 'All');
                },
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Reset filters'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCartSummaryBar() {
    return Container(
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
        child: Row(
          children: <Widget>[
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: AppColors.lightMint,
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Icon(
                Icons.shopping_bag_rounded,
                color: AppColors.primaryGreen,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    '${_cartService.totalItemCount} item${_cartService.totalItemCount == 1 ? '' : 's'} in cart',
                    style: GoogleFonts.lexend(
                      color: AppColors.darkText,
                      fontSize: 14,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Text(
                    'Cart total ₹${_cartService.totalAmount}',
                    style: GoogleFonts.lato(
                      color: Colors.grey.shade600,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
            ),
            FilledButton.icon(
              onPressed: () {
                Navigator.of(context).maybePop();
              },
              icon: const Icon(Icons.arrow_forward_rounded, size: 18),
              label: const Text('Continue'),
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PremiumProductCard extends StatelessWidget {
  final Map<String, dynamic> product;
  final String displayName;
  final int price;
  final int discount;
  final double rating;
  final int quantity;
  final bool inStock;
  final bool wished;
  final VoidCallback onTap;
  final VoidCallback onAdd;
  final VoidCallback onRemove;
  final VoidCallback onWishlist;

  const _PremiumProductCard({
    required this.product,
    required this.displayName,
    required this.price,
    required this.discount,
    required this.rating,
    required this.quantity,
    required this.inStock,
    required this.wished,
    required this.onTap,
    required this.onAdd,
    required this.onRemove,
    required this.onWishlist,
  });

  String _text(dynamic value, {String fallback = ''}) {
    final String result = value?.toString().trim() ?? '';
    return result.isEmpty ? fallback : result;
  }

  bool _boolValue(dynamic value, {bool fallback = false}) {
    if (value is bool) return value;
    if (value is num) return value != 0;
    if (value is String) {
      final String normalized = value.toLowerCase().trim();
      return normalized == 'true' || normalized == '1' || normalized == 'yes';
    }
    return fallback;
  }

  @override
  Widget build(BuildContext context) {
    final String image = _text(product['image']);
    final String weight = _text(product['weight'], fallback: '500 g');
    final String deliveryTime =
    _text(product['deliveryTime'], fallback: '30 min');
    final String farmerName = _text(product['farmerName']);
    final String farmName = _text(product['farmName']);
    final String origin = _text(product['origin']);
    final bool organic = _boolValue(product['organic']);
    final bool bestSeller = _boolValue(product['bestSeller']);
    final int mrp = discount > 0 && discount < 100
        ? (price / (1 - discount / 100)).round()
        : (price * 1.15).round();
    final int saved = (mrp - price).clamp(0, 999999);

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(21),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(21),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(21),
            border: Border.all(color: const Color(0xFFE2EAE3)),
            boxShadow: const <BoxShadow>[
              BoxShadow(
                color: Color(0x0B000000),
                blurRadius: 14,
                offset: Offset(0, 6),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                flex: 12,
                child: Stack(
                  fit: StackFit.expand,
                  children: <Widget>[
                    Container(
                      margin: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.lightCream,
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(16),
                        child: _productImage(image),
                      ),
                    ),
                    Positioned(
                      top: 12,
                      right: 12,
                      child: Material(
                        color: Colors.white.withOpacity(0.94),
                        shape: const CircleBorder(),
                        child: InkWell(
                          onTap: onWishlist,
                          customBorder: const CircleBorder(),
                          child: Padding(
                            padding: const EdgeInsets.all(7),
                            child: Icon(
                              wished
                                  ? Icons.favorite_rounded
                                  : Icons.favorite_border_rounded,
                              size: 18,
                              color: wished
                                  ? Colors.redAccent
                                  : AppColors.darkText,
                            ),
                          ),
                        ),
                      ),
                    ),
                    if (discount > 0 && inStock)
                      Positioned(
                        top: 13,
                        left: 13,
                        child: _badge('$discount% OFF', AppColors.goldAmber),
                      ),
                    if (bestSeller && inStock)
                      Positioned(
                        left: 13,
                        bottom: 13,
                        child: _badge('BEST SELLER', AppColors.primaryGreen),
                      ),
                    if (!inStock)
                      Positioned.fill(
                        child: Container(
                          margin: const EdgeInsets.all(8),
                          alignment: Alignment.center,
                          decoration: BoxDecoration(
                            color: Colors.black54,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: const Text(
                            'OUT OF STOCK',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
              Expanded(
                flex: 15,
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(11, 4, 11, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          if (organic)
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 6,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.lightMint,
                                borderRadius: BorderRadius.circular(7),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: <Widget>[
                                  const Icon(
                                    Icons.eco_rounded,
                                    color: AppColors.primaryGreen,
                                    size: 11,
                                  ),
                                  const SizedBox(width: 3),
                                  Text(
                                    'Organic',
                                    style: GoogleFonts.lato(
                                      color: AppColors.primaryGreen,
                                      fontSize: 8,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          if (organic) const SizedBox(width: 5),
                          Expanded(
                            child: Text(
                              weight,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.lato(
                                color: Colors.grey.shade500,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 5),
                      Text(
                        displayName,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.notoSansTelugu(
                          color: AppColors.darkText,
                          fontSize: 12.5,
                          fontWeight: FontWeight.w800,
                          height: 1.35,
                        ),
                      ),
                      const SizedBox(height: 5),
                      if (farmerName.isNotEmpty || farmName.isNotEmpty)
                        Row(
                          children: <Widget>[
                            const Icon(
                              Icons.agriculture_rounded,
                              color: AppColors.primaryGreen,
                              size: 13,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                farmerName.isNotEmpty ? farmerName : farmName,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.lato(
                                  color: Colors.grey.shade600,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ],
                        ),
                      if (origin.isNotEmpty) ...<Widget>[
                        const SizedBox(height: 3),
                        Row(
                          children: <Widget>[
                            const Icon(
                              Icons.location_on_outlined,
                              color: AppColors.primaryGreen,
                              size: 12,
                            ),
                            const SizedBox(width: 3),
                            Expanded(
                              child: Text(
                                origin,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.lato(
                                  color: Colors.grey.shade500,
                                  fontSize: 9,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 6),
                      Row(
                        children: <Widget>[
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 5,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF8E1),
                              borderRadius: BorderRadius.circular(7),
                            ),
                            child: Row(
                              children: <Widget>[
                                const Icon(
                                  Icons.star_rounded,
                                  color: AppColors.goldAmber,
                                  size: 13,
                                ),
                                Text(
                                  rating.toStringAsFixed(1),
                                  style: GoogleFonts.lato(
                                    color: AppColors.darkText,
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const Spacer(),
                          const Icon(
                            Icons.bolt_rounded,
                            color: AppColors.primaryGreen,
                            size: 14,
                          ),
                          Flexible(
                            child: Text(
                              deliveryTime,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: GoogleFonts.lato(
                                color: Colors.grey.shade600,
                                fontSize: 9.5,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const Spacer(),
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: <Widget>[
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: <Widget>[
                                Text(
                                  '₹$price',
                                  style: GoogleFonts.lexend(
                                    color: AppColors.primaryGreen,
                                    fontSize: 15.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                Row(
                                  children: <Widget>[
                                    if (mrp > price)
                                      Text(
                                        '₹$mrp',
                                        style: GoogleFonts.lato(
                                          color: Colors.grey.shade400,
                                          fontSize: 9.5,
                                          decoration:
                                          TextDecoration.lineThrough,
                                        ),
                                      ),
                                    if (saved > 0) ...<Widget>[
                                      const SizedBox(width: 4),
                                      Flexible(
                                        child: Text(
                                          'Save ₹$saved',
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                          style: GoogleFonts.lato(
                                            color: AppColors.primaryGreen,
                                            fontSize: 8.5,
                                            fontWeight: FontWeight.w700,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ),
                          ),
                          if (!inStock)
                            const SizedBox.shrink()
                          else if (quantity == 0)
                            SizedBox(
                              height: 34,
                              child: OutlinedButton(
                                onPressed: onAdd,
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                  ),
                                  foregroundColor: AppColors.primaryGreen,
                                  side: const BorderSide(
                                    color: AppColors.primaryGreen,
                                  ),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                child: Text(
                                  'ADD',
                                  style: GoogleFonts.lexend(
                                    fontSize: 10.5,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            )
                          else
                            Container(
                              height: 34,
                              decoration: BoxDecoration(
                                color: AppColors.lightMint,
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(
                                  color: AppColors.primaryGreen,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: <Widget>[
                                  _quantityButton(
                                    Icons.remove_rounded,
                                    onRemove,
                                  ),
                                  SizedBox(
                                    width: 27,
                                    child: Text(
                                      '$quantity',
                                      textAlign: TextAlign.center,
                                      style: GoogleFonts.lexend(
                                        fontSize: 11,
                                        fontWeight: FontWeight.w800,
                                      ),
                                    ),
                                  ),
                                  _quantityButton(Icons.add_rounded, onAdd),
                                ],
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _productImage(String image) {
    if (image.startsWith('assets/')) {
      return Image.asset(
        image,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }

    if (image.startsWith('http://') || image.startsWith('https://')) {
      return Image.network(
        image,
        fit: BoxFit.contain,
        loadingBuilder: (
            BuildContext context,
            Widget child,
            ImageChunkEvent? progress,
            ) {
          if (progress == null) return child;
          return const Center(
            child: SizedBox(
              width: 24,
              height: 24,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                color: AppColors.primaryGreen,
              ),
            ),
          );
        },
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }

    return _fallback();
  }

  Widget _quantityButton(IconData icon, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(9),
      child: SizedBox(
        width: 30,
        height: 32,
        child: Icon(icon, size: 17, color: AppColors.primaryGreen),
      ),
    );
  }

  Widget _badge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(7),
      ),
      child: Text(
        text,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 7.5,
          fontWeight: FontWeight.w900,
          letterSpacing: 0.2,
        ),
      ),
    );
  }

  Widget _fallback() {
    return const Center(
      child: Icon(
        Icons.eco_rounded,
        color: AppColors.primaryGreen,
        size: 42,
      ),
    );
  }
}

class _HeaderBadge extends StatelessWidget {
  final IconData icon;
  final String text;

  const _HeaderBadge({required this.icon, required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.16),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.18)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, color: Colors.white, size: 14),
          const SizedBox(width: 5),
          Text(
            text,
            style: GoogleFonts.lato(
              color: Colors.white,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}

class _FilterOption {
  final String label;
  final IconData icon;

  const _FilterOption(this.label, this.icon);
}

class _SortOption {
  final String label;
  final IconData icon;

  const _SortOption(this.label, this.icon);
}
