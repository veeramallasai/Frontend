import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/product_model.dart';
import '../../services/cart_service.dart';
import '../../widgets/banner_slider.dart';
import '../../widgets/category_strip.dart';
import '../../widgets/floating_cart.dart';
import '../../widgets/home_mode_toggle.dart';
import '../../widgets/product_card.dart';
import '../../widgets/product_search_delegate.dart';
import '../../widgets/section_header.dart';
import '../cart/cart_screen.dart';
import '../orders/orders_screen.dart';
import '../product/product_details_screen.dart';
import '../profile/profile_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final CartService _cartService = CartService();

  late final List<Map<String, dynamic>> _rawProducts;
  late final List<ProductModel> _products;

  HomeShoppingMode _mode = HomeShoppingMode.forHome;
  String _selectedCategory = 'Vegetables';
  int _navigationIndex = 0;

  @override
  void initState() {
    super.initState();
    _rawProducts = LocalProductCatalog.products;
    _products = _rawProducts
        .map<ProductModel>(ProductModel.fromMap)
        .where((ProductModel product) => product.isAvailable)
        .toList(growable: false);
    _cartService.loadCart();
  }

  bool get _shopOwnerMode => _mode == HomeShoppingMode.shopOwner;

  String get _firstName {
    final User? user = FirebaseAuth.instance.currentUser;
    final String displayName = user?.displayName?.trim() ?? '';
    if (displayName.isNotEmpty) {
      return displayName.split(RegExp(r'\s+')).first;
    }

    final String email = user?.email?.trim() ?? '';
    if (email.contains('@')) {
      return email.split('@').first;
    }

    return 'Customer';
  }

  List<ProductModel> _productsForCategory(String category) {
    if (category == 'Seasonal') {
      final List<ProductModel> seasonal = _products.where(
            (ProductModel product) {
          final String collection = product.collection.toLowerCase();
          return collection.contains('season') ||
              product.bestSeller ||
              product.soldCount >= 300;
        },
      ).toList(growable: false);

      return seasonal.isEmpty
          ? _products.take(12).toList(growable: false)
          : seasonal;
    }

    return _products.where((ProductModel product) {
      return product.category.trim().toLowerCase() ==
          category.trim().toLowerCase();
    }).toList(growable: false);
  }

  List<ProductModel> get _selectedProducts =>
      _productsForCategory(_selectedCategory);

  List<ProductModel> get _recommendedProducts {
    final List<ProductModel> results = _products.where(
          (ProductModel product) =>
      product.bestSeller || product.rating >= 4.6,
    ).toList(growable: false);

    return (results.isEmpty ? _products : results)
        .take(10)
        .toList(growable: false);
  }

  List<ProductModel> get _offerProducts => _products
      .where((ProductModel product) => product.hasDiscount)
      .take(10)
      .toList(growable: false);

  List<CategoryStripItem> get _categories =>
      const <CategoryStripItem>[
        CategoryStripItem(
          name: 'Vegetables',
          image: 'assets/images/vegetables/tomato.png',
          icon: Icons.eco_rounded,
        ),
        CategoryStripItem(
          name: 'Fruits',
          image: 'assets/images/fruits/apple.png',
          icon: Icons.apple_rounded,
        ),
        CategoryStripItem(
          name: 'Dairy',
          image: 'assets/images/dairy/milk.png',
          icon: Icons.local_drink_rounded,
        ),
        CategoryStripItem(
          name: 'Seasonal',
          image: 'assets/images/fruits/mango.png',
          icon: Icons.wb_sunny_rounded,
        ),
      ];

  List<BannerSlideData> get _banners =>
      const <BannerSlideData>[
        BannerSlideData(
          title: 'Fresh Vegetables',
          subtitle: 'Hub-checked produce sourced from trusted farmers.',
          badge: 'FARM FRESH',
          image: 'assets/images/vegetables/tomato.png',
          colors: <Color>[
            Color(0xFF075E3B),
            Color(0xFF35A56F),
          ],
        ),
        BannerSlideData(
          title: 'Colourful Fruits',
          subtitle: 'Fresh, seasonal and everyday fruit favourites.',
          badge: 'FRUIT PICKS',
          image: 'assets/images/fruits/apple.png',
          colors: <Color>[
            Color(0xFFB42318),
            Color(0xFFF97066),
          ],
        ),
        BannerSlideData(
          title: 'Fresh Dairy',
          subtitle: 'Milk, curd, paneer and daily dairy essentials.',
          badge: 'DAIRY',
          image: 'assets/images/dairy/milk.png',
          colors: <Color>[
            Color(0xFF075985),
            Color(0xFF38BDF8),
          ],
        ),
        BannerSlideData(
          title: 'Seasonal Harvest',
          subtitle: 'The best produce chosen for the current season.',
          badge: 'SEASONAL',
          image: 'assets/images/fruits/mango.png',
          colors: <Color>[
            Color(0xFFB45309),
            Color(0xFFFBBF24),
          ],
        ),
        BannerSlideData(
          title: 'For Shop Owners',
          subtitle: 'Bulk units, custom quantities and wholesale pricing.',
          badge: 'WHOLESALE',
          image: 'assets/images/vegetables/onion.png',
          colors: <Color>[
            Color(0xFF6B2F18),
            Color(0xFFD97745),
          ],
        ),
        BannerSlideData(
          title: 'Direct From Farmers',
          subtitle: 'Transparent sourcing through our Hyderabad hub.',
          badge: 'TRUSTED SOURCE',
          image: 'assets/images/vegetables/cabbage.png',
          colors: <Color>[
            Color(0xFF365314),
            Color(0xFF84CC16),
          ],
        ),
      ];

  Future<void> _openSearch() async {
    final Map<String, dynamic>? result =
    await showSearch<Map<String, dynamic>?>(
      context: context,
      delegate: ProductSearchDelegate(_rawProducts),
    );

    if (result == null || !mounted) {
      return;
    }

    _openProduct(ProductModel.fromMap(result));
  }

  void _openProduct(ProductModel product) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ProductDetailScreen(product: product.toMap()),
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

  void _onNavigationSelected(int index) {
    if (index == 0) {
      setState(() => _navigationIndex = 0);
      return;
    }

    if (index == 2) {
      _openCart();
      return;
    }

    final Widget screen = index == 1
        ? const OrdersScreen()
        : const ProfileScreen();

    Navigator.of(context).push(
      MaterialPageRoute<void>(builder: (_) => screen),
    );
  }

  Widget _header() {
    return SliverToBoxAdapter(
      child: DecoratedBox(
        decoration: const BoxDecoration(color: Colors.white),
        child: SafeArea(
          bottom: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(18, 12, 18, 16),
            child: Column(
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
                        Icons.eco_rounded,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                    const SizedBox(width: 11),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          Text(
                            'Hello, $_firstName',
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.lexend(
                              color: AppColors.darkText,
                              fontSize: 17,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Row(
                            children: <Widget>[
                              const Icon(
                                Icons.location_on_rounded,
                                size: 15,
                                color: AppColors.primaryGreen,
                              ),
                              const SizedBox(width: 3),
                              Expanded(
                                child: Text(
                                  'Hyderabad Hub',
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.lato(
                                    color: Colors.grey.shade600,
                                    fontSize: 11.5,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      tooltip: 'Notifications',
                      onPressed: () {},
                      icon: const Icon(Icons.notifications_none_rounded),
                    ),
                    IconButton(
                      tooltip: 'Cart',
                      onPressed: _openCart,
                      icon: const Icon(Icons.shopping_cart_outlined),
                    ),
                  ],
                ),
                const SizedBox(height: 14),
                Material(
                  color: const Color(0xFFF3F6F3),
                  borderRadius: BorderRadius.circular(16),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: _openSearch,
                    child: SizedBox(
                      height: 52,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 15),
                        child: Row(
                          children: <Widget>[
                            const Icon(
                              Icons.search_rounded,
                              color: AppColors.primaryGreen,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                'Search vegetables, fruits, dairy...',
                                style: GoogleFonts.lato(
                                  color: Colors.grey.shade600,
                                  fontSize: 13.5,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                            const Icon(
                              Icons.mic_none_rounded,
                              color: AppColors.primaryGreen,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _horizontalProducts(List<ProductModel> products) {
    if (products.isEmpty) {
      return const SizedBox.shrink();
    }

    return SizedBox(
      height: 345,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 18),
        scrollDirection: Axis.horizontal,
        physics: const ClampingScrollPhysics(),
        itemCount: products.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (BuildContext context, int index) {
          final ProductModel product = products[index];
          return SizedBox(
            width: 184,
            child: ProductCard(
              product: product,
              cartService: _cartService,
              shopOwnerMode: _shopOwnerMode,
              onTap: () => _openProduct(product),
            ),
          );
        },
      ),
    );
  }

  Widget _selectedGrid() {
    final List<ProductModel> products = _selectedProducts;

    return SliverPadding(
      padding: const EdgeInsets.fromLTRB(18, 0, 18, 128),
      sliver: SliverGrid(
        delegate: SliverChildBuilderDelegate(
              (BuildContext context, int index) {
            final ProductModel product = products[index];
            return ProductCard(
              product: product,
              cartService: _cartService,
              shopOwnerMode: _shopOwnerMode,
              onTap: () => _openProduct(product),
            );
          },
          childCount: products.length,
          addAutomaticKeepAlives: false,
          addRepaintBoundaries: true,
        ),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
          childAspectRatio: 0.54,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<ProductModel> vegetables =
    _productsForCategory('Vegetables').take(8).toList(growable: false);
    final List<ProductModel> fruits =
    _productsForCategory('Fruits').take(8).toList(growable: false);
    final List<ProductModel> dairy =
    _productsForCategory('Dairy').take(8).toList(growable: false);
    final List<ProductModel> seasonal =
    _productsForCategory('Seasonal').take(8).toList(growable: false);

    return Scaffold(
      backgroundColor: const Color(0xFFF7F9F7),
      body: Stack(
        children: <Widget>[
          CustomScrollView(
            physics: const ClampingScrollPhysics(),
            cacheExtent: 800,
            slivers: <Widget>[
              _header(),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.only(top: 14),
                  child: HomeModeToggle(
                    value: _mode,
                    onChanged: (HomeShoppingMode value) {
                      if (value == _mode) return;
                      setState(() => _mode = value);
                    },
                  ),
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 18)),
              SliverToBoxAdapter(child: BannerSlider(banners: _banners)),
              const SliverToBoxAdapter(child: SizedBox(height: 24)),
              const SliverToBoxAdapter(
                child: SectionHeader(
                  title: 'Shop by category',
                  subtitle: 'Fresh products available at our hub',
                ),
              ),
              SliverToBoxAdapter(
                child: CategoryStrip(
                  items: _categories,
                  selectedCategory: _selectedCategory,
                  onSelected: (String value) {
                    setState(() => _selectedCategory = value);
                  },
                ),
              ),
              const SliverToBoxAdapter(child: SizedBox(height: 20)),
              const SliverToBoxAdapter(
                child: SectionHeader(
                  title: 'Recommended for you',
                  subtitle: 'Popular fresh picks from the hub',
                ),
              ),
              SliverToBoxAdapter(
                child: _horizontalProducts(_recommendedProducts),
              ),
              if (_offerProducts.isNotEmpty) ...<Widget>[
                const SliverToBoxAdapter(child: SizedBox(height: 22)),
                const SliverToBoxAdapter(
                  child: SectionHeader(
                    title: 'Today’s offers',
                    subtitle: 'Fresh products at better prices',
                  ),
                ),
                SliverToBoxAdapter(
                  child: _horizontalProducts(_offerProducts),
                ),
              ],
              const SliverToBoxAdapter(child: SizedBox(height: 22)),
              const SliverToBoxAdapter(
                child: SectionHeader(
                  title: 'Fresh vegetables',
                  subtitle: 'Everyday vegetables from trusted growers',
                ),
              ),
              SliverToBoxAdapter(child: _horizontalProducts(vegetables)),
              const SliverToBoxAdapter(child: SizedBox(height: 22)),
              const SliverToBoxAdapter(
                child: SectionHeader(
                  title: 'Fresh fruits',
                  subtitle: 'Seasonal and everyday fruit favourites',
                ),
              ),
              SliverToBoxAdapter(child: _horizontalProducts(fruits)),
              const SliverToBoxAdapter(child: SizedBox(height: 22)),
              const SliverToBoxAdapter(
                child: SectionHeader(
                  title: 'Dairy essentials',
                  subtitle: 'Fresh dairy products for every day',
                ),
              ),
              SliverToBoxAdapter(child: _horizontalProducts(dairy)),
              const SliverToBoxAdapter(child: SizedBox(height: 22)),
              const SliverToBoxAdapter(
                child: SectionHeader(
                  title: 'Seasonal picks',
                  subtitle: 'Fresh produce selected for this season',
                ),
              ),
              SliverToBoxAdapter(child: _horizontalProducts(seasonal)),
              const SliverToBoxAdapter(child: SizedBox(height: 26)),
              SliverToBoxAdapter(
                child: SectionHeader(
                  title: _selectedCategory,
                  subtitle: _shopOwnerMode
                      ? 'Bulk quantities and wholesale pricing'
                      : 'Retail quantities for your home',
                ),
              ),
              _selectedGrid(),
            ],
          ),
          Align(
            alignment: Alignment.bottomCenter,
            child: FloatingCartBar(
              cartService: _cartService,
              onTap: _openCart,
            ),
          ),
        ],
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _navigationIndex,
        onDestinationSelected: _onNavigationSelected,
        destinations: const <NavigationDestination>[
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.receipt_long_outlined),
            selectedIcon: Icon(Icons.receipt_long_rounded),
            label: 'Orders',
          ),
          NavigationDestination(
            icon: Icon(Icons.shopping_cart_outlined),
            selectedIcon: Icon(Icons.shopping_cart_rounded),
            label: 'Cart',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}
