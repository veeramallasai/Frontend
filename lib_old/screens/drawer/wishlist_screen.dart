import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/wishlist_item.dart';
import '../../services/cart_service.dart';
import '../../services/wishlist_service.dart';
import '../cart/cart_screen.dart';
import '../home/home_screen.dart';
import '../product/product_details_screen.dart';

class WishlistScreen extends StatefulWidget {
  const WishlistScreen({super.key});

  @override
  State<WishlistScreen> createState() => _WishlistScreenState();
}

class _WishlistScreenState extends State<WishlistScreen> {
  final WishlistService _wishlistService = WishlistService();
  final CartService _cartService = CartService();

  late final VoidCallback _cartListener;

  String _searchQuery = '';
  String _selectedCategory = 'All';
  bool _isMovingAllToCart = false;
  bool _isClearingWishlist = false;

  User? get _user => FirebaseAuth.instance.currentUser;

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
    final User? user = _user;

    if (user == null) {
      return _buildLoggedOutScreen();
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: _buildAppBar(),
      body: StreamBuilder<List<WishlistItem>>(
        stream: _wishlistService.getUserWishlist(user.uid),
        builder: (
            BuildContext context,
            AsyncSnapshot<List<WishlistItem>> snapshot,
            ) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return _buildLoadingState();
          }

          if (snapshot.hasError) {
            return _buildErrorState();
          }

          final List<WishlistItem> allItems =
              snapshot.data ?? const <WishlistItem>[];

          if (allItems.isEmpty) {
            return _buildEmptyState();
          }

          final List<String> categories =
          _buildCategories(allItems);

          final List<WishlistItem> filteredItems =
          _applyFilters(allItems);

          return Column(
            children: <Widget>[
              _buildSummaryHeader(allItems),
              _buildSearchBar(),
              _buildCategoryFilters(categories),
              Expanded(
                child: filteredItems.isEmpty
                    ? _buildNoResultsState()
                    : _buildWishlistGrid(filteredItems),
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
        'My Wishlist',
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
        title: const Text('My Wishlist'),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(28),
          child: Column(
            children: <Widget>[
              Container(
                width: 128,
                height: 128,
                decoration: const BoxDecoration(
                  color: AppColors.lightMint,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.lock_outline_rounded,
                  size: 62,
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
                'Sign in to save products and access your wishlist on every device.',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _goHome,
                icon: const Icon(
                  Icons.home_rounded,
                ),
                label: const Text('Back to Home'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoadingState() {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 8,
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 0.61,
      ),
      itemBuilder: (_, __) {
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
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
              'Could not load wishlist',
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
                width: 138,
                height: 138,
                decoration: const BoxDecoration(
                  color: AppColors.lightMint,
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.favorite_border_rounded,
                  size: 70,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 22),
              Text(
                'Your wishlist is empty',
                style: GoogleFonts.lexend(
                  color: AppColors.darkText,
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Tap the heart icon on any product to save it here.',
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  fontSize: 14,
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _goHome,
                icon: const Icon(
                  Icons.shopping_basket_outlined,
                ),
                label: const Text('Browse Products'),
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
              'No matching products',
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 19,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              'Try another search or category.',
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 18),
            OutlinedButton(
              onPressed: () {
                setState(() {
                  _searchQuery = '';
                  _selectedCategory = 'All';
                });
              },
              child: const Text('Clear Filters'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSummaryHeader(List<WishlistItem> items) {
    final WishlistSummary summary =
    WishlistSummary.fromItems(items);

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
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: _summaryValue(
                  icon: Icons.favorite_rounded,
                  value: '${summary.totalItems}',
                  label: 'Saved',
                ),
              ),
              _summaryDivider(),
              Expanded(
                child: _summaryValue(
                  icon: Icons.bolt_rounded,
                  value: '${summary.quickItems}',
                  label: 'Quick',
                ),
              ),
              _summaryDivider(),
              Expanded(
                child: _summaryValue(
                  icon: Icons.agriculture_rounded,
                  value: '${summary.preOrderItems}',
                  label: 'Pre-order',
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Row(
            children: <Widget>[
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _isMovingAllToCart
                      ? null
                      : () => _moveAllToCart(items),
                  icon: const Icon(
                    Icons.shopping_cart_checkout_rounded,
                  ),
                  label: Text(
                    _isMovingAllToCart
                        ? 'ADDING...'
                        : 'Move All to Cart',
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.white,
                    foregroundColor: AppColors.primaryGreen,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              IconButton.filled(
                tooltip: 'Clear wishlist',
                onPressed: _isClearingWishlist
                    ? null
                    : () => _confirmClearWishlist(items),
                style: IconButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: AppColors.errorRed,
                ),
                icon: const Icon(
                  Icons.delete_sweep_outlined,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 14, 16, 0),
      child: TextField(
        onChanged: (String value) {
          setState(() {
            _searchQuery = value.trim().toLowerCase();
          });
        },
        decoration: InputDecoration(
          hintText: 'Search product, category or farm',
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

  Widget _buildCategoryFilters(List<String> categories) {
    return SizedBox(
      height: 58,
      child: ListView.separated(
        padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
        scrollDirection: Axis.horizontal,
        itemCount: categories.length,
        separatorBuilder: (_, __) =>
        const SizedBox(width: 8),
        itemBuilder: (
            BuildContext context,
            int index,
            ) {
          final String category = categories[index];
          final bool selected =
              _selectedCategory == category;

          return ChoiceChip(
            selected: selected,
            label: Text(category),
            onSelected: (_) {
              setState(() {
                _selectedCategory = category;
              });
            },
            selectedColor: AppColors.primaryGreen,
            backgroundColor: Colors.white,
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

  Widget _buildWishlistGrid(List<WishlistItem> items) {
    return LayoutBuilder(
      builder: (
          BuildContext context,
          BoxConstraints constraints,
          ) {
        final int columns = constraints.maxWidth >= 1100
            ? 5
            : constraints.maxWidth >= 850
            ? 4
            : constraints.maxWidth >= 600
            ? 3
            : 2;

        return RefreshIndicator(
          color: AppColors.primaryGreen,
          onRefresh: () async {
            await Future<void>.delayed(
              const Duration(milliseconds: 400),
            );

            if (mounted) {
              setState(() {});
            }
          },
          child: GridView.builder(
            padding: const EdgeInsets.fromLTRB(
              16,
              4,
              16,
              120,
            ),
            itemCount: items.length,
            gridDelegate:
            SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: columns,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio:
              constraints.maxWidth >= 600 ? 0.69 : 0.58,
            ),
            itemBuilder: (
                BuildContext context,
                int index,
                ) {
              final WishlistItem item = items[index];

              return FadeInUp(
                delay: Duration(
                  milliseconds: index.clamp(0, 8) * 45,
                ),
                child: _WishlistProductCard(
                  item: item,
                  quantity: _cartService.getQuantity(
                    item.name,
                    productId: item.productId,
                    teluguName: item.teluguName,
                  ),
                  onTap: () => _openProduct(item),
                  onRemoveWishlist: () =>
                      _removeFromWishlist(item),
                  onAdd: () => _addToCart(item),
                  onRemove: () => _removeFromCart(item),
                ),
              );
            },
          ),
        );
      },
    );
  }

  Future<void> _moveAllToCart(
      List<WishlistItem> items,
      ) async {
    if (items.isEmpty) {
      return;
    }

    setState(() {
      _isMovingAllToCart = true;
    });

    int addedCount = 0;

    try {
      for (final WishlistItem item in items) {
        if (!item.isAvailable) {
          continue;
        }

        _addToCart(
          item,
          showMessage: false,
        );
        addedCount++;
      }

      _showMessage(
        '$addedCount wishlist item${addedCount == 1 ? '' : 's'} added to cart.',
      );
    } finally {
      if (mounted) {
        setState(() {
          _isMovingAllToCart = false;
        });
      }
    }
  }

  Future<void> _confirmClearWishlist(
      List<WishlistItem> items,
      ) async {
    final User? user = _user;

    if (user == null || items.isEmpty) {
      return;
    }

    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (
          BuildContext dialogContext,
          ) {
        return AlertDialog(
          title: const Text('Clear Wishlist?'),
          content: const Text(
            'All saved products will be removed from your wishlist.',
          ),
          actions: <Widget>[
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext, false);
              },
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext, true);
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
      _isClearingWishlist = true;
    });

    try {
      await _wishlistService.clearWishlist(user.uid);
      _showMessage('Wishlist cleared.');
    } on WishlistServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    } catch (_) {
      _showMessage(
        'Unable to clear wishlist.',
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isClearingWishlist = false;
        });
      }
    }
  }

  Future<void> _removeFromWishlist(
      WishlistItem item,
      ) async {
    final String? id = item.id;

    if (id == null || id.trim().isEmpty) {
      return;
    }

    try {
      await _wishlistService.removeFromWishlist(id);

      _showMessage(
        '${item.displayName} removed from wishlist.',
      );
    } on WishlistServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    } catch (_) {
      _showMessage(
        'Unable to remove this product.',
        isError: true,
      );
    }
  }

  void _addToCart(
      WishlistItem item, {
        bool showMessage = true,
      }) {
    _cartService.addItem(
      item.name,
      LocalProductCatalog.imageFor(
        name: item.name,
        preferredImage: item.image,
      ),
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
      quickDeliveryMinutes: item.quickDeliveryMinutes,
      isPreOrder: item.isPreOrder,
      harvestDate: item.harvestDate,
      expectedDeliveryDate: item.expectedDeliveryDate,
      deliverySlot: item.deliverySlot,
    );

    if (showMessage) {
      _showMessage(
        '${item.displayName} added to cart.',
      );
    }
  }

  void _removeFromCart(WishlistItem item) {
    _cartService.removeOne(
      item.name,
      productId: item.productId,
      teluguName: item.teluguName,
    );
  }

  void _openProduct(WishlistItem item) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ProductDetailScreen(
          product: <String, dynamic>{
            'id': item.productId,
            'name': item.name,
            'teluguName': item.teluguName,
            'displayName': item.displayName,
            'image': item.image,
            'price': item.price,
            'mrp': item.effectiveMrp,
            'discount': item.discount,
            'weight': item.weight,
            'category': item.category,
            'categoryTelugu': item.categoryTelugu,
            'farmerId': item.farmerId,
            'farmerName': item.farmerName,
            'farmName': item.farmName,
            'organic': item.organic,
            'rating': item.rating,
            'isQuick': item.isQuick,
            'quickDeliveryMinutes':
            item.quickDeliveryMinutes,
            'preOrderAvailable': item.isPreOrder,
            'isAvailable': item.isAvailable,
            'harvestDate':
            item.harvestDate?.toIso8601String(),
            'expectedDeliveryDate':
            item.expectedDeliveryDate?.toIso8601String(),
            'deliverySlot': item.deliverySlot,
          },
        ),
      ),
    );
  }

  List<WishlistItem> _applyFilters(
      List<WishlistItem> items,
      ) {
    return items.where(
          (WishlistItem item) {
        final bool matchesCategory =
            _selectedCategory == 'All' ||
                item.category.trim().toLowerCase() ==
                    _selectedCategory.toLowerCase();

        if (!matchesCategory) {
          return false;
        }

        if (_searchQuery.isEmpty) {
          return true;
        }

        final String searchable = <String>[
          item.name,
          item.teluguName,
          item.category,
          item.categoryTelugu,
          item.farmerName,
          item.farmName,
        ].join(' ').toLowerCase();

        return searchable.contains(_searchQuery);
      },
    ).toList();
  }

  List<String> _buildCategories(
      List<WishlistItem> items,
      ) {
    final Set<String> categories = <String>{'All'};

    for (final WishlistItem item in items) {
      final String category = item.category.trim();

      if (category.isNotEmpty) {
        categories.add(category);
      }
    }

    return categories.toList();
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

  Widget _buildCartBar() {
    if (_cartService.totalItemCount <= 0) {
      return const SizedBox.shrink();
    }

    return SafeArea(
      child: Container(
        color: Colors.white,
        padding: const EdgeInsets.all(12),
        child: ElevatedButton.icon(
          onPressed: _openCart,
          icon: const Icon(
            Icons.shopping_bag_rounded,
          ),
          label: Text(
            '${_cartService.totalItemCount} items • '
                '₹${_cartService.totalAmount}   View Cart',
          ),
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(
              double.infinity,
              54,
            ),
          ),
        ),
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

class _WishlistProductCard extends StatelessWidget {
  final WishlistItem item;
  final int quantity;
  final VoidCallback onTap;
  final VoidCallback onRemoveWishlist;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  const _WishlistProductCard({
    required this.item,
    required this.quantity,
    required this.onTap,
    required this.onRemoveWishlist,
    required this.onAdd,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final String image = LocalProductCatalog.imageFor(
      name: item.name,
      preferredImage: item.image,
    );

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Container(
          padding: const EdgeInsets.all(10),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: const Color(0xFFE3EAE4),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                child: Stack(
                  children: <Widget>[
                    Positioned.fill(
                      child: Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.lightCream,
                          borderRadius: BorderRadius.circular(15),
                        ),
                        child: _buildImage(image),
                      ),
                    ),
                    Positioned(
                      right: 5,
                      top: 5,
                      child: IconButton.filled(
                        tooltip: 'Remove from wishlist',
                        onPressed: onRemoveWishlist,
                        style: IconButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: AppColors.errorRed,
                          minimumSize: const Size(34, 34),
                          padding: EdgeInsets.zero,
                        ),
                        icon: const Icon(
                          Icons.favorite_rounded,
                          size: 19,
                        ),
                      ),
                    ),
                    if (item.hasDiscount)
                      Positioned(
                        left: 5,
                        top: 5,
                        child: _badge(
                          item.discount > 0
                              ? '${item.discount.toStringAsFixed(0)}% OFF'
                              : 'SAVE ₹${item.savings}',
                          AppColors.errorRed,
                        ),
                      ),
                    if (item.isQuick)
                      Positioned(
                        left: 5,
                        bottom: 5,
                        child: _badge(
                          item.quickDeliveryText.toUpperCase(),
                          AppColors.goldAmber,
                        ),
                      ),
                    if (item.isPreOrder)
                      Positioned(
                        right: 5,
                        bottom: 5,
                        child: _badge(
                          'PRE-ORDER',
                          AppColors.primaryGreen,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(height: 8),
              Text(
                item.displayName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.notoSansTelugu(
                  color: AppColors.darkText,
                  fontSize: 11,
                  height: 1.3,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                item.weight.trim().isEmpty
                    ? item.farmerDisplayName
                    : item.weight,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  fontSize: 9.5,
                ),
              ),
              const SizedBox(height: 5),
              Row(
                children: <Widget>[
                  const Icon(
                    Icons.star_rounded,
                    color: AppColors.goldAmber,
                    size: 14,
                  ),
                  Text(
                    ' ${item.rating.toStringAsFixed(1)}',
                    style: GoogleFonts.lato(
                      color: AppColors.darkText,
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  if (item.organic) ...<Widget>[
                    const SizedBox(width: 7),
                    const Icon(
                      Icons.eco_rounded,
                      color: AppColors.primaryGreen,
                      size: 13,
                    ),
                    Text(
                      ' Organic',
                      style: GoogleFonts.lato(
                        color: AppColors.primaryGreen,
                        fontSize: 8.5,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 7),
              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: <Widget>[
                  Expanded(
                    child: Column(
                      crossAxisAlignment:
                      CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          '₹${item.price}',
                          style: GoogleFonts.lexend(
                            color: AppColors.primaryGreen,
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (item.hasDiscount)
                          Text(
                            '₹${item.effectiveMrp}',
                            style: GoogleFonts.lato(
                              color: Colors.grey.shade500,
                              fontSize: 9,
                              decoration:
                              TextDecoration.lineThrough,
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (!item.isAvailable)
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFEBEE),
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: Text(
                        'OUT',
                        style: GoogleFonts.lato(
                          color: AppColors.errorRed,
                          fontSize: 8,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                    )
                  else if (quantity == 0)
                    SizedBox(
                      height: 32,
                      child: OutlinedButton(
                        onPressed: onAdd,
                        child: const Text('ADD'),
                      ),
                    )
                  else
                    Container(
                      height: 32,
                      decoration: BoxDecoration(
                        color: AppColors.primaryGreen,
                        borderRadius: BorderRadius.circular(9),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: <Widget>[
                          IconButton(
                            onPressed: onRemove,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(
                              minWidth: 30,
                              minHeight: 30,
                            ),
                            icon: const Icon(
                              Icons.remove_rounded,
                              color: Colors.white,
                              size: 15,
                            ),
                          ),
                          Text(
                            '$quantity',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          IconButton(
                            onPressed: onAdd,
                            padding: EdgeInsets.zero,
                            constraints: const BoxConstraints(
                              minWidth: 30,
                              minHeight: 30,
                            ),
                            icon: const Icon(
                              Icons.add_rounded,
                              color: Colors.white,
                              size: 15,
                            ),
                          ),
                        ],
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
        size: 42,
      ),
    );
  }

  Widget _badge(
      String label,
      Color color,
      ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 6,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(7),
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
}