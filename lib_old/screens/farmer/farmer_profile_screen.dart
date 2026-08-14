import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/farmer.dart';
import '../../models/product_model.dart';
import '../../services/cart_service.dart';
import '../../services/farmer_service.dart';
import '../cart/cart_screen.dart';
import '../product/product_details_screen.dart';

class FarmerProfileScreen extends StatefulWidget {
  final Farmer farmer;

  const FarmerProfileScreen({
    super.key,
    required this.farmer,
  });

  @override
  State<FarmerProfileScreen> createState() => _FarmerProfileScreenState();
}

class _FarmerProfileScreenState extends State<FarmerProfileScreen> {
  final FarmerService _farmerService = FarmerService.instance;
  final CartService _cartService = CartService();
  late final VoidCallback _cartListener;

  bool _isFollowing = false;
  bool _isFavorite = false;
  int _selectedGalleryIndex = 0;

  Farmer get farmer => widget.farmer;

  @override
  void initState() {
    super.initState();
    _cartListener = () {
      if (mounted) setState(() {});
    };
    _cartService.addListener(_cartListener);
    _cartService.loadCart();
  }

  @override
  void dispose() {
    _cartService.removeListener(_cartListener);
    super.dispose();
  }

  void _openProduct(ProductModel product) {
    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => ProductDetailScreen(product: product.toMap()),
      ),
    );
  }

  void _add(ProductModel product) {
    _cartService.addItem(
      product.name,
      LocalProductCatalog.imageFor(
        name: product.name,
        preferredImage: product.image,
      ),
      product.discountedPrice.round(),
      productId: product.id,
      teluguName: product.teluguName,
      weight: product.weight,
      category: product.category,
      categoryTelugu: product.categoryTelugu,
      farmerId: product.farmerId,
      farmerName: farmer.name,
      farmName: farmer.farmName,
      organic: product.organic,
      rating: product.rating,
      isQuick: product.isQuick,
      quickDeliveryMinutes: product.quickDeliveryMinutes,
      isPreOrder: product.canPreOrder,
      harvestDate: product.activeHarvestDate,
      expectedDeliveryDate: product.expectedDeliveryDate,
      deliverySlot: product.availableDeliverySlots.isNotEmpty
          ? product.availableDeliverySlots.first
          : '',
    );

    _showMessage(
      '${product.formattedDisplayName} added to cart.',
    );
  }

  void _remove(ProductModel product) {
    _cartService.removeOne(
      product.name,
      productId: product.id,
      teluguName: product.teluguName,
    );
  }


  void _toggleFollow() {
    setState(() {
      _isFollowing = !_isFollowing;
    });

    _showMessage(
      _isFollowing
          ? 'You are now following ${farmer.farmName}.'
          : 'You unfollowed ${farmer.farmName}.',
    );
  }

  void _toggleFavorite() {
    setState(() {
      _isFavorite = !_isFavorite;
    });

    _showMessage(
      _isFavorite
          ? '${farmer.farmName} added to favorites.'
          : '${farmer.farmName} removed from favorites.',
    );
  }

  Future<void> _shareFarm() async {
    final String text =
        '${farmer.farmName} • ${farmer.location} • '
        '${farmer.displayRating} rating • '
        '${farmer.cropsGrown.take(5).join(', ')}';

    await Clipboard.setData(
      ClipboardData(text: text),
    );

    _showMessage('Farm summary copied. You can share it anywhere.');
  }

  void _contactFarmer() {
    _showMessage(
      'Farmer contact action is ready. Phone/WhatsApp can be connected when contact fields are added.',
    );
  }

  void _openGallery(int initialIndex) {
    final List<String> images = farmer.farmImages;

    if (images.isEmpty) {
      return;
    }

    showDialog<void>(
      context: context,
      barrierColor: Colors.black87,
      builder: (BuildContext dialogContext) {
        final PageController controller = PageController(
          initialPage: initialIndex,
        );

        return StatefulBuilder(
          builder: (
              BuildContext context,
              StateSetter setDialogState,
              ) {
            return Dialog(
              insetPadding: EdgeInsets.zero,
              backgroundColor: Colors.black,
              child: Stack(
                children: <Widget>[
                  PageView.builder(
                    controller: controller,
                    itemCount: images.length,
                    onPageChanged: (int index) {
                      setDialogState(() {
                        _selectedGalleryIndex = index;
                      });
                    },
                    itemBuilder: (_, int index) {
                      return InteractiveViewer(
                        minScale: 0.8,
                        maxScale: 4,
                        child: Center(
                          child: _buildAnyImage(
                            images[index],
                            fit: BoxFit.contain,
                          ),
                        ),
                      );
                    },
                  ),
                  Positioned(
                    top: 24,
                    right: 16,
                    child: IconButton.filled(
                      onPressed: () {
                        Navigator.pop(dialogContext);
                      },
                      style: IconButton.styleFrom(
                        backgroundColor: Colors.white24,
                      ),
                      icon: const Icon(
                        Icons.close_rounded,
                        color: Colors.white,
                      ),
                    ),
                  ),
                  Positioned(
                    left: 0,
                    right: 0,
                    bottom: 24,
                    child: Center(
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 7,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.black54,
                          borderRadius: BorderRadius.circular(18),
                        ),
                        child: Text(
                          '${_selectedGalleryIndex + 1} / ${images.length}',
                          style: GoogleFonts.lato(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }


  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      appBar: AppBar(
        title: Text(
          farmer.farmName,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.lexend(fontWeight: FontWeight.w800),
        ),
        actions: [
          IconButton(
            tooltip: _isFavorite ? 'Remove favorite' : 'Favorite farm',
            onPressed: _toggleFavorite,
            icon: Icon(
              _isFavorite
                  ? Icons.favorite_rounded
                  : Icons.favorite_border_rounded,
              color: _isFavorite
                  ? AppColors.errorRed
                  : AppColors.darkText,
            ),
          ),
          IconButton(
            tooltip: 'Share farm',
            onPressed: _shareFarm,
            icon: const Icon(
              Icons.share_outlined,
              color: AppColors.darkText,
            ),
          ),
          IconButton(
            onPressed: () => Navigator.of(context).push(
              MaterialPageRoute<void>(builder: (_) => const CartScreen()),
            ),
            icon: Badge(
              isLabelVisible: _cartService.totalItemCount > 0,
              label: Text('${_cartService.totalItemCount}'),
              child: const Icon(Icons.shopping_bag_outlined),
            ),
          ),
        ],
      ),
      body: CustomScrollView(
        slivers: [
          SliverToBoxAdapter(child: _cover()),
          SliverToBoxAdapter(child: _overview()),
          SliverToBoxAdapter(child: _actionPanel()),
          SliverToBoxAdapter(child: _about()),
          SliverToBoxAdapter(child: _farmFacts()),
          SliverToBoxAdapter(child: _crops()),
          SliverToBoxAdapter(child: _gallery()),
          SliverToBoxAdapter(child: _products()),
          SliverToBoxAdapter(child: _reviews()),
          SliverToBoxAdapter(child: _similarFarms()),
          const SliverToBoxAdapter(child: SizedBox(height: 120)),
        ],
      ),
      bottomNavigationBar: _cartBar(),
    );
  }

  Widget _cover() {
    final String image =
    farmer.farmImages.isNotEmpty ? farmer.farmImages.first : '';

    return Container(
      height: 270,
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        gradient: const LinearGradient(
          colors: <Color>[
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
        ),
      ),
      clipBehavior: Clip.antiAlias,
      child: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          image.isEmpty
              ? _coverFallback()
              : _buildAnyImage(
            image,
            fit: BoxFit.cover,
          ),
          const DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: <Color>[
                  Colors.transparent,
                  Color(0xB3000000),
                ],
              ),
            ),
          ),
          Positioned(
            left: 18,
            right: 18,
            bottom: 18,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: <Widget>[
                    if (farmer.verified)
                      _overlayBadge(
                        Icons.verified_rounded,
                        'Verified Farm',
                      ),
                    if (farmer.organicCertified)
                      _overlayBadge(
                        Icons.eco_rounded,
                        'Organic',
                      ),
                    _overlayBadge(
                      Icons.star_rounded,
                      farmer.displayRating,
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Text(
                  farmer.farmName,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.lexend(
                    color: Colors.white,
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  farmer.location,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.lato(
                    color: Colors.white.withValues(alpha: 0.9),
                    fontSize: 13,
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

  Widget _coverFallback() {
    return const Center(
      child: Icon(
        Icons.agriculture_rounded,
        size: 86,
        color: Colors.white,
      ),
    );
  }

  Widget _overview() {
    return _card(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 34,
                backgroundColor: AppColors.lightMint,
                child: Text(
                  farmer.name.isEmpty ? 'F' : farmer.name[0].toUpperCase(),
                  style: GoogleFonts.lexend(
                    color: AppColors.primaryGreen,
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            farmer.farmName,
                            style: GoogleFonts.lexend(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        if (farmer.verified)
                          const Icon(
                            Icons.verified_rounded,
                            color: AppColors.primaryGreen,
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      farmer.name,
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade700,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Text(
                      farmer.location,
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
          const SizedBox(height: 16),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _chip(Icons.star_rounded, farmer.displayRating),
              _chip(Icons.history_rounded, farmer.experienceText),
              if (farmer.organicCertified)
                _chip(Icons.eco_rounded, 'Organic'),
              _chip(Icons.local_shipping_outlined,
                  '${farmer.deliveryRadiusKm.toStringAsFixed(0)} km'),
            ],
          ),
        ],
      ),
    );
  }


  Widget _actionPanel() {
    return _section(
      title: 'Connect With Farm',
      icon: Icons.handshake_outlined,
      child: Column(
        children: <Widget>[
          Row(
            children: <Widget>[
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: _toggleFollow,
                  icon: Icon(
                    _isFollowing
                        ? Icons.check_rounded
                        : Icons.add_rounded,
                  ),
                  label: Text(
                    _isFollowing ? 'Following' : 'Follow Farm',
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _contactFarmer,
                  icon: const Icon(Icons.call_outlined),
                  label: const Text('Contact'),
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _shareFarm,
                  icon: const Icon(Icons.share_outlined),
                  label: const Text('Share Farm'),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _toggleFavorite,
                  icon: Icon(
                    _isFavorite
                        ? Icons.favorite_rounded
                        : Icons.favorite_border_rounded,
                  ),
                  label: Text(
                    _isFavorite ? 'Favorited' : 'Favorite',
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _farmFacts() {
    return _section(
      title: 'Farm Information',
      icon: Icons.info_outline_rounded,
      child: LayoutBuilder(
        builder: (
            BuildContext context,
            BoxConstraints constraints,
            ) {
          final bool wide = constraints.maxWidth >= 700;

          final List<Widget> facts = <Widget>[
            _factCard(
              Icons.landscape_outlined,
              'Farm Size',
              farmer.farmSize,
            ),
            _factCard(
              Icons.history_rounded,
              'Experience',
              farmer.experienceText,
            ),
            _factCard(
              Icons.local_shipping_outlined,
              'Delivery Radius',
              '${farmer.deliveryRadiusKm.toStringAsFixed(0)} km',
            ),
            _factCard(
              Icons.workspace_premium_outlined,
              'Certification',
              farmer.certification,
            ),
          ];

          return GridView.count(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisCount: wide ? 4 : 2,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: wide ? 1.5 : 1.25,
            children: facts,
          );
        },
      ),
    );
  }

  Widget _gallery() {
    final List<String> images = farmer.farmImages;

    if (images.isEmpty) {
      return const SizedBox.shrink();
    }

    return _section(
      title: 'Farm Gallery',
      icon: Icons.photo_library_outlined,
      child: SizedBox(
        height: 190,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: images.length,
          separatorBuilder: (_, __) =>
          const SizedBox(width: 11),
          itemBuilder: (
              BuildContext context,
              int index,
              ) {
            return InkWell(
              borderRadius: BorderRadius.circular(16),
              onTap: () => _openGallery(index),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(16),
                child: SizedBox(
                  width: 270,
                  child: Stack(
                    fit: StackFit.expand,
                    children: <Widget>[
                      _buildAnyImage(
                        images[index],
                        fit: BoxFit.cover,
                      ),
                      const Positioned(
                        right: 10,
                        top: 10,
                        child: CircleAvatar(
                          radius: 17,
                          backgroundColor: Colors.black54,
                          child: Icon(
                            Icons.zoom_in_rounded,
                            color: Colors.white,
                            size: 18,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _reviews() {
    return _section(
      title: 'Ratings & Reviews',
      icon: Icons.reviews_outlined,
      child: Column(
        children: <Widget>[
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: <Widget>[
              Column(
                children: <Widget>[
                  Text(
                    farmer.displayRating,
                    style: GoogleFonts.lexend(
                      color: AppColors.primaryGreen,
                      fontSize: 38,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const Row(
                    children: <Widget>[
                      Icon(
                        Icons.star_rounded,
                        color: AppColors.goldAmber,
                        size: 18,
                      ),
                      Icon(
                        Icons.star_rounded,
                        color: AppColors.goldAmber,
                        size: 18,
                      ),
                      Icon(
                        Icons.star_rounded,
                        color: AppColors.goldAmber,
                        size: 18,
                      ),
                      Icon(
                        Icons.star_rounded,
                        color: AppColors.goldAmber,
                        size: 18,
                      ),
                      Icon(
                        Icons.star_half_rounded,
                        color: AppColors.goldAmber,
                        size: 18,
                      ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${farmer.totalReviews} reviews',
                    style: GoogleFonts.lato(
                      color: Colors.grey.shade600,
                      fontSize: 11,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  children: <Widget>[
                    _ratingBar('5', 0.78),
                    _ratingBar('4', 0.15),
                    _ratingBar('3', 0.05),
                    _ratingBar('2', 0.015),
                    _ratingBar('1', 0.005),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          _reviewCard(
            name: 'Verified Customer',
            review:
            'Fresh products, clean packing and reliable farm quality.',
            rating: 5,
          ),
          const SizedBox(height: 10),
          _reviewCard(
            name: 'Farm To Home Customer',
            review:
            'Good quality produce and clear information about the farm.',
            rating: 4,
          ),
        ],
      ),
    );
  }

  Widget _about() {
    return _section(
      title: 'About the Farm',
      icon: Icons.info_outline_rounded,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            farmer.about,
            style: GoogleFonts.lato(
              height: 1.55,
              color: Colors.grey.shade700,
            ),
          ),
          const SizedBox(height: 14),
          _info('Village', farmer.village),
          _info('District', farmer.district),
          _info('State', farmer.state),
          _info('Farm size', farmer.farmSize),
          _info('Certification', farmer.certification),
        ],
      ),
    );
  }

  Widget _crops() {
    return _section(
      title: 'Crops & Varieties',
      icon: Icons.eco_outlined,
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: farmer.cropsGrown.map((crop) {
          return Container(
            padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 8),
            decoration: BoxDecoration(
              color: AppColors.lightMint,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              crop,
              style: GoogleFonts.lato(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w700,
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _products() {
    return StreamBuilder<List<ProductModel>>(
      stream: _farmerService.watchProductsByFarmer(
        farmer.id,
        limit: 100,
      ),
      builder: (context, snapshot) {
        final products = snapshot.data ?? const <ProductModel>[];

        return _section(
          title: 'Products From This Farm',
          icon: Icons.storefront_rounded,
          child: products.isEmpty
              ? Text(
            'No products available right now.',
            style: GoogleFonts.lato(color: Colors.grey.shade600),
          )
              : LayoutBuilder(
            builder: (context, constraints) {
              final columns = constraints.maxWidth >= 1000
                  ? 5
                  : constraints.maxWidth >= 720
                  ? 4
                  : 2;

              return GridView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: products.length,
                gridDelegate:
                SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: columns,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio:
                  constraints.maxWidth >= 720 ? .72 : .64,
                ),
                itemBuilder: (_, index) {
                  final product = products[index];
                  return _FarmProductCard(
                    product: product,
                    quantity: _cartService.getQuantity(
                      product.name,
                      productId: product.id,
                      teluguName: product.teluguName,
                    ),
                    onTap: () => _openProduct(product),
                    onAdd: () => _add(product),
                    onRemove: () => _remove(product),
                  );
                },
              );
            },
          ),
        );
      },
    );
  }

  Widget _similarFarms() {
    return StreamBuilder<List<Farmer>>(
      stream: _farmerService.watchSimilarFarms(farmer, limit: 10),
      builder: (context, snapshot) {
        final farms = snapshot.data ?? const <Farmer>[];

        if (farms.isEmpty) return const SizedBox.shrink();

        return _section(
          title: 'Similar Farms',
          icon: Icons.compare_arrows_rounded,
          child: SizedBox(
            height: 180,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: farms.length,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, index) {
                final item = farms[index];
                return InkWell(
                  borderRadius: BorderRadius.circular(16),
                  onTap: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute<void>(
                        builder: (_) => FarmerProfileScreen(farmer: item),
                      ),
                    );
                  },
                  child: Container(
                    width: 250,
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: AppColors.lightCream,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: const Color(0xFFE1E9E2)),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            CircleAvatar(
                              backgroundColor: AppColors.lightMint,
                              child: Text(
                                item.name.isEmpty
                                    ? 'F'
                                    : item.name[0].toUpperCase(),
                                style: const TextStyle(
                                  color: AppColors.primaryGreen,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                item.farmName,
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                                style: GoogleFonts.lexend(
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                            if (item.verified)
                              const Icon(
                                Icons.verified_rounded,
                                color: AppColors.primaryGreen,
                                size: 18,
                              ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        Text(
                          item.cropsGrown.take(4).join(' • '),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.lato(
                            color: Colors.grey.shade700,
                            fontSize: 11,
                          ),
                        ),
                        const Spacer(),
                        Row(
                          children: [
                            const Icon(
                              Icons.star_rounded,
                              color: AppColors.goldAmber,
                              size: 16,
                            ),
                            Text(' ${item.displayRating}'),
                            const Spacer(),
                            Text(
                              'View farm',
                              style: GoogleFonts.lato(
                                color: AppColors.primaryGreen,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }

  Widget _cartBar() {
    if (_cartService.totalItemCount <= 0) {
      return const SizedBox.shrink();
    }

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: ElevatedButton(
          onPressed: () => Navigator.of(context).push(
            MaterialPageRoute<void>(builder: (_) => const CartScreen()),
          ),
          style: ElevatedButton.styleFrom(
            minimumSize: const Size(double.infinity, 54),
          ),
          child: Text(
            '${_cartService.totalItemCount} items • ₹${_cartService.totalAmount}   View Cart',
          ),
        ),
      ),
    );
  }


  Widget _overlayBadge(
      IconData icon,
      String label,
      ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 6,
      ),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.46),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(
            icon,
            color: Colors.white,
            size: 14,
          ),
          const SizedBox(width: 5),
          Text(
            label,
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

  Widget _factCard(
      IconData icon,
      String label,
      String value,
      ) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: const Color(0xFFE1E9E2),
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: <Widget>[
          Icon(
            icon,
            color: AppColors.primaryGreen,
            size: 24,
          ),
          const SizedBox(height: 7),
          Text(
            value.trim().isEmpty ? 'Not specified' : value,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
            style: GoogleFonts.lexend(
              color: AppColors.darkText,
              fontSize: 11,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            label,
            textAlign: TextAlign.center,
            style: GoogleFonts.lato(
              color: Colors.grey.shade600,
              fontSize: 9,
            ),
          ),
        ],
      ),
    );
  }

  Widget _ratingBar(
      String label,
      double value,
      ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 5),
      child: Row(
        children: <Widget>[
          Text(
            label,
            style: GoogleFonts.lato(
              color: AppColors.darkText,
              fontSize: 10,
              fontWeight: FontWeight.w700,
            ),
          ),
          const SizedBox(width: 5),
          const Icon(
            Icons.star_rounded,
            color: AppColors.goldAmber,
            size: 13,
          ),
          const SizedBox(width: 7),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: value,
                minHeight: 7,
                backgroundColor: Colors.grey.shade200,
                valueColor: const AlwaysStoppedAnimation<Color>(
                  AppColors.primaryGreen,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _reviewCard({
    required String name,
    required String review,
    required int rating,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.lightMint,
                child: Text(
                  name[0],
                  style: GoogleFonts.lexend(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      name,
                      style: GoogleFonts.lato(
                        color: AppColors.darkText,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    Text(
                      'Verified purchase',
                      style: GoogleFonts.lato(
                        color: AppColors.primaryGreen,
                        fontSize: 9,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 7,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '$rating ★',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 9),
          Text(
            review,
            style: GoogleFonts.lato(
              color: Colors.grey.shade700,
              fontSize: 12,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAnyImage(
      String image, {
        BoxFit fit = BoxFit.cover,
      }) {
    if (image.startsWith('http://') ||
        image.startsWith('https://')) {
      return Image.network(
        image,
        fit: fit,
        errorBuilder: (_, __, ___) =>
            _coverFallback(),
      );
    }

    if (image.startsWith('assets/')) {
      return Image.asset(
        image,
        fit: fit,
        errorBuilder: (_, __, ___) =>
            _coverFallback(),
      );
    }

    return _coverFallback();
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

  Widget _section({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return _card(
      margin: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 39,
                height: 39,
                decoration: BoxDecoration(
                  color: AppColors.lightMint,
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(icon, color: AppColors.primaryGreen),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.lexend(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          child,
        ],
      ),
    );
  }

  Widget _card({
    required EdgeInsets margin,
    required Widget child,
  }) {
    return Container(
      margin: margin,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(21),
        border: Border.all(color: const Color(0xFFE3EAE4)),
      ),
      child: child,
    );
  }

  Widget _chip(IconData icon, String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
      decoration: BoxDecoration(
        color: AppColors.lightMint,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 15, color: AppColors.primaryGreen),
          const SizedBox(width: 5),
          Text(
            text,
            style: GoogleFonts.lato(
              color: AppColors.primaryGreen,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _info(String label, String value) {
    if (value.trim().isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: GoogleFonts.lato(color: Colors.grey.shade600),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.lato(fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

class _FarmProductCard extends StatelessWidget {
  final ProductModel product;
  final int quantity;
  final VoidCallback onTap;
  final VoidCallback onAdd;
  final VoidCallback onRemove;

  const _FarmProductCard({
    required this.product,
    required this.quantity,
    required this.onTap,
    required this.onAdd,
    required this.onRemove,
  });

  @override
  Widget build(BuildContext context) {
    final image = LocalProductCatalog.imageFor(
      name: product.name,
      preferredImage: product.image,
    );

    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(17),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(17),
        child: Padding(
          padding: const EdgeInsets.all(10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: AppColors.lightCream,
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: Stack(
                    fit: StackFit.expand,
                    children: <Widget>[
                      image.startsWith('http')
                          ? Image.network(
                        image,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) =>
                        const Icon(Icons.eco_rounded),
                      )
                          : Image.asset(
                        image,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) =>
                        const Icon(Icons.eco_rounded),
                      ),
                      if (product.isQuick)
                        Positioned(
                          left: 4,
                          bottom: 4,
                          child: _ProductBadge(
                            label: product.quickDeliveryText.isEmpty
                                ? 'QUICK'
                                : product.quickDeliveryText.toUpperCase(),
                            color: AppColors.goldAmber,
                          ),
                        ),
                      if (product.canPreOrder)
                        const Positioned(
                          right: 4,
                          bottom: 4,
                          child: _ProductBadge(
                            label: 'PRE-ORDER',
                            color: AppColors.primaryGreen,
                          ),
                        ),
                      if (product.discount > 0)
                        Positioned(
                          left: 4,
                          top: 4,
                          child: _ProductBadge(
                            label:
                            '${product.discount.toStringAsFixed(0)}% OFF',
                            color: AppColors.errorRed,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 7),
              Text(
                product.formattedDisplayName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.notoSansTelugu(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                product.weight,
                style: GoogleFonts.lato(
                  fontSize: 10,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 7),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Text(
                          '₹${product.discountedPrice.toStringAsFixed(0)}',
                          style: GoogleFonts.lexend(
                            color: AppColors.primaryGreen,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (product.discount > 0)
                          Text(
                            '₹${product.price.toStringAsFixed(0)}',
                            style: GoogleFonts.lato(
                              color: Colors.grey.shade500,
                              fontSize: 9,
                              decoration: TextDecoration.lineThrough,
                            ),
                          ),
                      ],
                    ),
                  ),
                  quantity == 0
                      ? SizedBox(
                    height: 32,
                    child: OutlinedButton(
                      onPressed:
                      product.isAvailable ? onAdd : null,
                      child: const Text('ADD'),
                    ),
                  )
                      : Container(
                    height: 32,
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen,
                      borderRadius: BorderRadius.circular(9),
                    ),
                    child: Row(
                      children: [
                        IconButton(
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(
                            minWidth: 30,
                            minHeight: 30,
                          ),
                          onPressed: onRemove,
                          icon: const Icon(
                            Icons.remove,
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
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(
                            minWidth: 30,
                            minHeight: 30,
                          ),
                          onPressed: onAdd,
                          icon: const Icon(
                            Icons.add,
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
}


class _ProductBadge extends StatelessWidget {
  final String label;
  final Color color;

  const _ProductBadge({
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
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
