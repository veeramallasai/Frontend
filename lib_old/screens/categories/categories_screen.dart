import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../home/category_products_screen.dart';

class CategoriesScreen extends StatefulWidget {
  const CategoriesScreen({super.key});

  @override
  State<CategoriesScreen> createState() => _CategoriesScreenState();
}

class _CategoriesScreenState extends State<CategoriesScreen> {
  final TextEditingController _searchController = TextEditingController();

  String _searchQuery = '';

  static const List<_CategoryInfo> _categories = <_CategoryInfo>[
    _CategoryInfo(
      label: 'Vegetables',
      teluguLabel: 'కూరగాయలు',
      category: 'Vegetables',
      fallbackAsset: 'assets/images/vegetables/tomato.png',
      icon: Icons.eco_rounded,
      description: 'Fresh farm-picked vegetables',
      accent: Color(0xFFE8F5E9),
    ),
    _CategoryInfo(
      label: 'Fruits',
      teluguLabel: 'పండ్లు',
      category: 'Fruits',
      fallbackAsset: 'assets/images/fruits/apple.png',
      icon: Icons.apple_rounded,
      description: 'Juicy and naturally sweet fruits',
      accent: Color(0xFFFFF3E0),
    ),
    _CategoryInfo(
      label: 'Dairy',
      teluguLabel: 'పాల ఉత్పత్తులు',
      category: 'Dairy',
      fallbackAsset: 'assets/images/dairy/milk.png',
      icon: Icons.water_drop_rounded,
      description: 'Pure milk and dairy essentials',
      accent: Color(0xFFE3F2FD),
    ),
    _CategoryInfo(
      label: 'Seasonal',
      teluguLabel: 'సీజనల్',
      category: 'Seasonal',
      fallbackAsset: 'assets/images/seasonal/seasonal.png',
      icon: Icons.wb_sunny_rounded,
      description: 'Best produce of the season',
      accent: Color(0xFFFFF8E1),
    ),
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  String _text(dynamic value, {String fallback = ''}) {
    final String result = value?.toString().trim() ?? '';
    return result.isEmpty ? fallback : result;
  }

  bool _sameCategory(dynamic value, String category) {
    return _text(value).toLowerCase() == category.toLowerCase();
  }

  List<Map<String, dynamic>> _productsForCategory(String category) {
    return LocalProductCatalog.products.where((Map<String, dynamic> product) {
      return _sameCategory(product['category'], category);
    }).toList();
  }

  String _categoryImage(_CategoryInfo category) {
    final List<Map<String, dynamic>> products =
    _productsForCategory(category.category);

    for (final Map<String, dynamic> product in products) {
      final String image = _text(product['image']);
      if (image.isNotEmpty) {
        return image;
      }
    }

    return category.fallbackAsset;
  }

  List<_CategoryInfo> get _visibleCategories {
    final String query = _searchQuery.trim().toLowerCase();

    if (query.isEmpty) {
      return _categories;
    }

    return _categories.where((_CategoryInfo category) {
      return category.label.toLowerCase().contains(query) ||
          category.teluguLabel.toLowerCase().contains(query) ||
          category.description.toLowerCase().contains(query);
    }).toList();
  }

  void _openCategory(_CategoryInfo category) {
    final List<Map<String, dynamic>> products =
    _productsForCategory(category.category);

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => CategoryProductsScreen(
          category: category.category,
          products: products,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<_CategoryInfo> categories = _visibleCategories;
    final double width = MediaQuery.sizeOf(context).width;

    final int crossAxisCount = width >= 1100
        ? 5
        : width >= 800
        ? 4
        : width >= 600
        ? 3
        : 2;

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          tooltip: 'Back',
          onPressed: () => Navigator.maybePop(context),
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
            color: AppColors.darkText,
          ),
        ),
        title: Text(
          'All Categories',
          style: GoogleFonts.lexend(
            fontWeight: FontWeight.w700,
            color: AppColors.darkText,
            fontSize: 19,
          ),
        ),
      ),
      body: RefreshIndicator(
        color: AppColors.primaryGreen,
        onRefresh: () async {
          await Future<void>.delayed(const Duration(milliseconds: 450));
          if (mounted) {
            setState(() {});
          }
        },
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(
            parent: BouncingScrollPhysics(),
          ),
          slivers: <Widget>[
            SliverToBoxAdapter(
              child: _buildHeroBanner(),
            ),
            SliverToBoxAdapter(
              child: _buildSearchBar(),
            ),
            SliverToBoxAdapter(
              child: _buildSectionHeader(categories.length),
            ),
            if (categories.isEmpty)
              SliverFillRemaining(
                hasScrollBody: false,
                child: _buildEmptyState(),
              )
            else
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 14, 16, 28),
                sliver: SliverGrid(
                  gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: crossAxisCount,
                    mainAxisSpacing: 14,
                    crossAxisSpacing: 14,
                    childAspectRatio: width >= 600 ? 0.92 : 0.78,
                  ),
                  delegate: SliverChildBuilderDelegate(
                        (BuildContext context, int index) {
                      final _CategoryInfo category = categories[index];

                      return _CategoryCard(
                        category: category,
                        imagePath: _categoryImage(category),
                        productCount:
                        _productsForCategory(category.category).length,
                        onTap: () => _openCategory(category),
                      );
                    },
                    childCount: categories.length,
                  ),
                ),
              ),
            SliverToBoxAdapter(
              child: _buildTrustStrip(),
            ),
            const SliverToBoxAdapter(
              child: SizedBox(height: 24),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeroBanner() {
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      padding: const EdgeInsets.all(20),
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
            color: AppColors.primaryGreen.withOpacity(0.22),
            blurRadius: 22,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 10,
                    vertical: 6,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.16),
                    borderRadius: BorderRadius.circular(30),
                  ),
                  child: Text(
                    'FARM FRESH',
                    style: GoogleFonts.lexend(
                      color: Colors.white,
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 0.8,
                    ),
                  ),
                ),
                const SizedBox(height: 13),
                Text(
                  'Shop Fresh Categories',
                  style: GoogleFonts.lexend(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.w800,
                    height: 1.2,
                  ),
                ),
                const SizedBox(height: 7),
                Text(
                  'Vegetables, fruits and dairy directly from trusted farms.',
                  style: GoogleFonts.lato(
                    color: Colors.white.withOpacity(0.88),
                    fontSize: 13,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Container(
            width: 92,
            height: 92,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.17),
              shape: BoxShape.circle,
            ),
            child: const Icon(
              Icons.shopping_basket_rounded,
              color: Colors.white,
              size: 48,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchBar() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: TextField(
        controller: _searchController,
        onChanged: (String value) {
          setState(() => _searchQuery = value);
        },
        textInputAction: TextInputAction.search,
        decoration: InputDecoration(
          hintText: 'Search vegetables, fruits, dairy...',
          hintStyle: GoogleFonts.lato(
            color: Colors.grey.shade500,
            fontSize: 14,
          ),
          prefixIcon: const Icon(
            Icons.search_rounded,
            color: AppColors.primaryGreen,
          ),
          suffixIcon: _searchQuery.isEmpty
              ? null
              : IconButton(
            tooltip: 'Clear',
            onPressed: () {
              _searchController.clear();
              setState(() => _searchQuery = '');
            },
            icon: const Icon(Icons.close_rounded),
          ),
          filled: true,
          fillColor: Colors.white,
          contentPadding: const EdgeInsets.symmetric(vertical: 16),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(color: Color(0xFFE2EAE3)),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(color: Color(0xFFE2EAE3)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(17),
            borderSide: const BorderSide(
              color: AppColors.primaryGreen,
              width: 1.5,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionHeader(int count) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 22, 16, 0),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Explore Categories',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '$count categories available',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 10,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: AppColors.lightMint,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              'Fresh Daily',
              style: GoogleFonts.lato(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w700,
                fontSize: 11,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Container(
              width: 96,
              height: 96,
              decoration: const BoxDecoration(
                color: AppColors.lightMint,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.search_off_rounded,
                color: AppColors.primaryGreen,
                size: 48,
              ),
            ),
            const SizedBox(height: 18),
            Text(
              'No category found',
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 20,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 7),
            Text(
              'Try searching with another category name.',
              textAlign: TextAlign.center,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTrustStrip() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE2EAE3)),
      ),
      child: const Row(
        children: <Widget>[
          Expanded(
            child: _TrustItem(
              icon: Icons.bolt_rounded,
              title: 'Fast Delivery',
              subtitle: 'Under 60 mins',
            ),
          ),
          _VerticalDivider(),
          Expanded(
            child: _TrustItem(
              icon: Icons.verified_user_rounded,
              title: 'Farm Quality',
              subtitle: 'Fresh & verified',
            ),
          ),
          _VerticalDivider(),
          Expanded(
            child: _TrustItem(
              icon: Icons.handshake_rounded,
              title: 'Fair Price',
              subtitle: 'Supports farmers',
            ),
          ),
        ],
      ),
    );
  }
}

class _CategoryCard extends StatelessWidget {
  const _CategoryCard({
    required this.category,
    required this.imagePath,
    required this.productCount,
    required this.onTap,
  });

  final _CategoryInfo category;
  final String imagePath;
  final int productCount;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(22),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(22),
        child: Ink(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(22),
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
              Expanded(
                child: Stack(
                  fit: StackFit.expand,
                  children: <Widget>[
                    Container(
                      margin: const EdgeInsets.all(9),
                      decoration: BoxDecoration(
                        color: category.accent,
                        borderRadius: BorderRadius.circular(17),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(17),
                        child: _buildImage(),
                      ),
                    ),
                    Positioned(
                      top: 15,
                      right: 15,
                      child: Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.95),
                          shape: BoxShape.circle,
                          boxShadow: const <BoxShadow>[
                            BoxShadow(
                              color: Color(0x12000000),
                              blurRadius: 8,
                              offset: Offset(0, 3),
                            ),
                          ],
                        ),
                        child: Icon(
                          category.icon,
                          color: AppColors.primaryGreen,
                          size: 19,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(12, 8, 12, 13),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      '${category.label} (${category.teluguLabel})',
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.notoSansTelugu(
                        color: AppColors.darkText,
                        fontSize: 14,
                        height: 1.25,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      category.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade600,
                        fontSize: 11,
                        height: 1.35,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: <Widget>[
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 5,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.lightMint,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            '$productCount items',
                            style: GoogleFonts.lato(
                              color: AppColors.primaryGreen,
                              fontWeight: FontWeight.w700,
                              fontSize: 10,
                            ),
                          ),
                        ),
                        const Spacer(),
                        const Icon(
                          Icons.arrow_forward_rounded,
                          color: AppColors.primaryGreen,
                          size: 20,
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

  Widget _buildImage() {
    if (imagePath.startsWith('assets/')) {
      return Image.asset(
        imagePath,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }

    if (imagePath.startsWith('http://') ||
        imagePath.startsWith('https://')) {
      return Image.network(
        imagePath,
        fit: BoxFit.cover,
        errorBuilder: (_, __, ___) => _fallback(),
      );
    }

    return _fallback();
  }

  Widget _fallback() {
    return Center(
      child: Icon(
        category.icon,
        color: AppColors.primaryGreen,
        size: 58,
      ),
    );
  }
}

class _TrustItem extends StatelessWidget {
  const _TrustItem({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        Container(
          width: 42,
          height: 42,
          decoration: const BoxDecoration(
            color: AppColors.lightMint,
            shape: BoxShape.circle,
          ),
          child: Icon(
            icon,
            color: AppColors.primaryGreen,
            size: 22,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          title,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.lexend(
            color: AppColors.darkText,
            fontSize: 10,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.lato(
            color: Colors.grey,
            fontSize: 9,
          ),
        ),
      ],
    );
  }
}

class _VerticalDivider extends StatelessWidget {
  const _VerticalDivider();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 1,
      height: 68,
      margin: const EdgeInsets.symmetric(horizontal: 7),
      color: const Color(0xFFE5EBE6),
    );
  }
}

class _CategoryInfo {
  const _CategoryInfo({
    required this.label,
    required this.teluguLabel,
    required this.category,
    required this.fallbackAsset,
    required this.icon,
    required this.description,
    required this.accent,
  });

  final String label;
  final String teluguLabel;
  final String category;
  final String fallbackAsset;
  final IconData icon;
  final String description;
  final Color accent;
}
