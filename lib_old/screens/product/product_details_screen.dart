import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../data/local_product_catalog.dart';
import '../../models/farmer.dart';
import '../../models/preorder_model.dart';
import '../../models/product_model.dart';
import '../../models/review_model.dart';
import '../../models/wishlist_item.dart';
import '../../services/cart_service.dart';
import '../../services/farmer_service.dart';
import '../../services/firestore_service.dart';
import '../../services/preorder_service.dart';
import '../../services/review_service.dart';
import '../../services/wishlist_service.dart';
import '../cart/cart_screen.dart';
import '../farmer/farmer_profile_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final Map<String, dynamic> product;

  const ProductDetailScreen({
    super.key,
    required this.product,
  });

  @override
  State<ProductDetailScreen> createState() {
    return _ProductDetailScreenState();
  }
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  final CartService _cartService = CartService();
  final WishlistService _wishlistService = WishlistService();
  final FarmerService _farmerService = FarmerService.instance;
  final FirestoreService _firestoreService = FirestoreService.instance;
  final PreOrderService _preOrderService = PreOrderService.instance;
  final ReviewService _reviewService = ReviewService();

  late final VoidCallback _cartListener;
  late final ProductModel _productModel;

  Farmer? _farmer;
  bool _isFavorite = false;
  bool _isUpdatingWishlist = false;
  int _localQuantity = 0;
  late String _selectedUnit;

  String get _productId {
    return _stringValue(widget.product['id']);
  }

  String get _farmerId {
    return _stringValue(
      widget.product['farmerId'],
      fallback: _productModel.farmerId,
    );
  }

  bool get _canPreOrder {
    return _productModel.canPreOrder;
  }

  DateTime? get _harvestDate {
    return _productModel.activeHarvestDate;
  }

  DateTime? get _expectedDeliveryDate {
    return _productModel.expectedDeliveryDate;
  }

  List<String> get _deliverySlots {
    if (_productModel.availableDeliverySlots.isNotEmpty) {
      return _productModel.availableDeliverySlots;
    }

    return const <String>[
      '8:00 AM - 10:00 AM',
      '10:00 AM - 12:00 PM',
      '4:00 PM - 6:00 PM',
      '6:00 PM - 8:00 PM',
    ];
  }

  String get _englishName {
    return _stringValue(
      widget.product['name'],
      fallback: 'Farm Fresh Product',
    );
  }

  String get _teluguName {
    return _stringValue(widget.product['teluguName']);
  }

  String get _displayName {
    if (_teluguName.isEmpty) {
      return _englishName;
    }

    return '$_englishName ($_teluguName)';
  }

  String get _category {
    return _stringValue(
      widget.product['category'],
      fallback: 'Vegetables',
    );
  }

  String get _categoryTelugu {
    return _stringValue(
      widget.product['categoryTelugu'],
      fallback: 'కూరగాయలు',
    );
  }

  String get _displayCategory {
    if (_categoryTelugu.isEmpty) {
      return _category;
    }

    return '$_category ($_categoryTelugu)';
  }

  String get _image {
    return LocalProductCatalog.imageFor(
      name: _englishName,
      preferredImage: _stringValue(widget.product['image']),
    );
  }

  String get _weight => _selectedUnit;

  List<String> get _availableUnits =>
      _productModel.safeAvailableUnits;

  int get _minimumQuickCartQuantity {
    if (!_productModel.isQuickAvailable) {
      return 1;
    }

    final int minimum =
    _productModel.safeMinimumQuickQuantity.ceil();

    return minimum < 1 ? 1 : minimum;
  }

  bool get _requiresQuickMinimum {
    return _productModel.isQuickAvailable &&
        _localQuantity < _minimumQuickCartQuantity;
  }

  String get _seller {
    return _stringValue(
      widget.product['seller'] ?? widget.product['farmerName'],
      fallback: 'Ramesh Naidu',
    );
  }

  String get _farmName {
    return _stringValue(
      widget.product['farmName'],
      fallback: 'Green Valley Organic Farm',
    );
  }

  String get _farmerLocation {
    return _stringValue(
      widget.product['farmerLocation'] ?? widget.product['village'],
      fallback: _origin,
    );
  }

  String get _farmerExperience {
    return _stringValue(
      widget.product['farmerExperience'] ?? widget.product['experience'],
      fallback: '12+ years',
    );
  }

  String get _farmerImage {
    return _stringValue(widget.product['farmerImage']);
  }

  int get _stockCount {
    return _intValue(widget.product['stock'], fallback: _isInStock ? 24 : 0);
  }

  String get _origin {
    return _stringValue(
      widget.product['origin'],
      fallback: 'India',
    );
  }

  String get _shelfLife {
    return _stringValue(
      widget.product['shelf_life'] ??
          widget.product['shelfLife'],
      fallback: '3 days',
    );
  }

  String get _deliveryTime {
    return _stringValue(
      widget.product['deliveryTime'],
      fallback: '30 min',
    );
  }

  String get _description {
    return _stringValue(
      widget.product['description'],
      fallback:
      'Fresh and carefully selected $_displayName sourced directly from trusted local farmers.',
    );
  }

  int get _price {
    return _productModel
        .discountedPriceForUnit(_selectedUnit)
        .round();
  }

  double get _rating {
    return _doubleValue(
      widget.product['rating'],
      fallback: 4.5,
    );
  }

  double get _discount {
    return _doubleValue(widget.product['discount']);
  }

  bool get _isOrganic {
    return _boolValue(
      widget.product['organic'],
      fallback: true,
    );
  }

  bool get _isInStock {
    return _boolValue(
      widget.product['inStock'],
      fallback: true,
    );
  }

  bool get _isBestSeller {
    return _boolValue(widget.product['bestSeller']);
  }

  int get _originalPrice {
    return _productModel
        .mrpForUnit(_selectedUnit)
        .round();
  }

  int get _savedAmount {
    return _productModel
        .savingsForUnit(_selectedUnit)
        .round();
  }

  int get _cartTotal {
    return _price * _localQuantity;
  }

  @override
  void initState() {
    super.initState();

    _productModel = ProductModel.fromMap(widget.product);
    _selectedUnit = _productModel.safeDefaultUnit;
    _loadFarmer();
    _loadWishlistState();

    _cartListener = () {
      if (!mounted) {
        return;
      }

      setState(() {
        _localQuantity = _cartService.getQuantity(
          _englishName,
          productId: _productId,
          teluguName: _teluguName,
          weight: _selectedUnit,
        );
      });
    };

    _localQuantity = _cartService.getQuantity(
      _englishName,
      productId: _productId,
      teluguName: _teluguName,
      weight: _selectedUnit,
    );

    _cartService.addListener(_cartListener);
  }


  Future<void> _loadWishlistState() async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) return;

    try {
      final bool value = await _wishlistService.isWishlisted(
        userId: user.uid,
        productId: _productId,
        productName: _englishName,
      );

      if (!mounted) return;

      setState(() {
        _isFavorite = value;
      });
    } catch (_) {
      // Wishlist icon safely remains in its current state.
    }
  }

  Future<void> _loadFarmer() async {
    try {
      final Farmer farmer = await _farmerService.getFarmerById(
        _farmerId,
      );

      if (mounted) {
        setState(() {
          _farmer = farmer;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _farmer = _productModel.farmer;
        });
      }
    }
  }

  @override
  void dispose() {
    _cartService.removeListener(_cartListener);
    super.dispose();
  }

  void _addOne() {
    if (!_isInStock) {
      _showMessage(
        'This product is currently out of stock.',
        isError: true,
      );
      return;
    }

    _cartService.addItem(
      _englishName,
      _image,
      _price,
      productId: _productId,
      teluguName: _teluguName,
      weight: _selectedUnit,
      category: _category,
      categoryTelugu: _categoryTelugu,
      farmerId: _farmerId,
      farmerName: _seller,
      farmName: _farmName,
      organic: _isOrganic,
      rating: _rating,

      // These fields describe eligibility only.
      // The customer selects one delivery mode later in Checkout.
      isQuick: _productModel.isQuickAvailable,
      quickDeliveryMinutes:
      _productModel.quickDeliveryMinutes,
      minimumQuickQuantity:
      _minimumQuickCartQuantity,
      quickAvailableStock:
      _productModel.quickAvailableStock,
      availableUnits:
      _productModel.safeAvailableUnits,
      availableDeliveryDays:
      _productModel.availableDeliveryDays,
      normalDeliveryNote:
      _productModel.normalDeliveryNote,
      isPreOrder: _canPreOrder,
      harvestDate: _harvestDate,
      expectedDeliveryDate:
      _expectedDeliveryDate,
      deliverySlot: '',
    );

    _showMessage(
      '$_displayName • $_selectedUnit added to cart.',
    );
  }

  void _removeOne() {
    if (_localQuantity <= 0) {
      return;
    }

    _cartService.removeOne(
      _englishName,
      productId: _productId,
      teluguName: _teluguName,
      weight: _selectedUnit,
    );
  }

  Future<void> _toggleFavorite() async {
    if (_isUpdatingWishlist) {
      return;
    }

    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      _showMessage(
        'Please sign in to save products to your wishlist.',
        isError: true,
      );
      return;
    }

    setState(() {
      _isUpdatingWishlist = true;
      _isFavorite = !_isFavorite;
    });

    try {
      if (_isFavorite) {
        final WishlistItem item = WishlistItem(
          userId: user.uid,
          productId: _productId,
          name: _englishName,
          teluguName: _teluguName,
          image: _image,
          category: _category,
          categoryTelugu: _categoryTelugu,
          weight: _weight,
          price: _price,
          mrp: _originalPrice,
          discount: _discount,
          farmerId: _farmerId,
          farmerName: _seller,
          farmName: _farmName,
          organic: _isOrganic,
          rating: _rating,
          isQuick: _productModel.isQuick,
          quickDeliveryMinutes:
          _productModel.quickDeliveryMinutes,
          isPreOrder: _canPreOrder,
          isAvailable: _isInStock,
          harvestDate: _harvestDate,
          expectedDeliveryDate: _expectedDeliveryDate,
          deliverySlot:
          _deliverySlots.isEmpty ? '' : _deliverySlots.first,
        );

        await _wishlistService.addToWishlist(item);

        _showMessage(
          '$_displayName added to your wishlist.',
        );
      } else {
        await _wishlistService.removeByProduct(
          userId: user.uid,
          productId: _productId,
          productName: _englishName,
        );

        _showMessage(
          '$_displayName removed from your wishlist.',
        );
      }
    } catch (error) {
      if (!mounted) {
        return;
      }

      setState(() {
        _isFavorite = !_isFavorite;
      });

      _showMessage(
        'Unable to update wishlist. Please try again.',
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isUpdatingWishlist = false;
        });
      }
    }
  }

  void _openFarmerProfile() {
    final Farmer farmer =
        _farmer ?? _productModel.farmer;

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
            FarmerProfileScreen(farmer: farmer),
      ),
    );
  }

  void _openCart() {
    Navigator.push(
      context,
      MaterialPageRoute<void>(
        builder: (_) => const CartScreen(),
      ),
    );
  }

  void _handleMainButton() {
    if (!_isInStock) {
      return;
    }

    if (_localQuantity == 0) {
      _addOne();

      if (!_productModel.isQuickAvailable) {
        _showMessage(
          '$_displayName added to cart.',
        );
      }

      return;
    }

    _openCart();
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
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final Map<String, dynamic> highlights =
    _highlightsFromProduct();

    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: <Widget>[
          _buildAppBar(),
          SliverToBoxAdapter(
            child: FadeInUp(
              duration: const Duration(milliseconds: 450),
              child: Padding(
                padding: const EdgeInsets.fromLTRB(
                  16,
                  18,
                  16,
                  130,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    _buildProductOverview(),
                    const SizedBox(height: 18),
                    _buildQuantityAndCartSection(),
                    const SizedBox(height: 18),
                    _buildDeliveryBenefits(),
                    const SizedBox(height: 18),
                    _buildFarmerSection(),
                    const SizedBox(height: 18),
                    _buildMoreFromFarmerSection(),
                    const SizedBox(height: 18),
                    _buildSimilarSameFarmerSection(),
                    const SizedBox(height: 18),
                    _buildSimilarFarmsSection(),
                    const SizedBox(height: 18),
                    _buildProductsFromSimilarFarmsSection(),
                    const SizedBox(height: 18),
                    _buildFrequentlyBoughtTogetherSection(),
                    const SizedBox(height: 18),
                    _buildReviewsSection(),
                    const SizedBox(height: 18),
                    _buildFreshnessSection(),
                    const SizedBox(height: 18),
                    _buildNutritionSection(),
                    const SizedBox(height: 18),
                    _buildDescriptionSection(),
                    const SizedBox(height: 18),
                    if (highlights.isNotEmpty)
                      _buildHighlightsSection(highlights),
                    if (highlights.isNotEmpty)
                      const SizedBox(height: 18),
                    _buildProductInformation(),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
      bottomNavigationBar: _buildBottomCartBar(),
    );
  }

  SliverAppBar _buildAppBar() {
    return SliverAppBar(
      pinned: true,
      backgroundColor: Colors.white,
      surfaceTintColor: Colors.white,
      elevation: 0,
      leading: Padding(
        padding: const EdgeInsets.all(8),
        child: Material(
          color: AppColors.lightCream,
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: () {
              Navigator.pop(context);
            },
            child: const Icon(
              Icons.arrow_back_ios_new_rounded,
              color: AppColors.darkText,
              size: 19,
            ),
          ),
        ),
      ),
      title: Text(
        _displayName,
        maxLines: 1,
        overflow: TextOverflow.ellipsis,
        style: GoogleFonts.lexend(
          fontSize: 17,
          fontWeight: FontWeight.w700,
          color: AppColors.darkText,
        ),
      ),
      centerTitle: true,
      actions: <Widget>[
        Padding(
          padding: const EdgeInsets.only(right: 8),
          child: Material(
            color: AppColors.lightCream,
            shape: const CircleBorder(),
            child: InkWell(
              customBorder: const CircleBorder(),
              onTap: _isUpdatingWishlist
                  ? null
                  : _toggleFavorite,
              child: SizedBox(
                width: 42,
                height: 42,
                child: _isUpdatingWishlist
                    ? const Padding(
                  padding: EdgeInsets.all(11),
                  child: CircularProgressIndicator(
                    strokeWidth: 2.2,
                    color: AppColors.primaryGreen,
                  ),
                )
                    : Icon(
                  _isFavorite
                      ? Icons.favorite_rounded
                      : Icons.favorite_border_rounded,
                  color: _isFavorite
                      ? AppColors.errorRed
                      : AppColors.darkText,
                  size: 21,
                ),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildProductOverview() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: LayoutBuilder(
        builder: (
            BuildContext context,
            BoxConstraints constraints,
            ) {
          final bool useVerticalLayout =
              constraints.maxWidth < 390;

          if (useVerticalLayout) {
            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                _buildProductImage(),
                const SizedBox(height: 18),
                _buildProductDetails(),
              ],
            );
          }

          return Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Expanded(
                flex: 5,
                child: _buildProductImage(),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 6,
                child: _buildProductDetails(),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildProductImage() {
    return Stack(
      children: <Widget>[
        Container(
          width: double.infinity,
          height: 210,
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: AppColors.lightCream,
            borderRadius: BorderRadius.circular(20),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(16),
            child: _productImageWidget(),
          ),
        ),
        if (_discount > 0 && _isInStock)
          Positioned(
            top: 12,
            left: 12,
            child: _badge(
              '${_discount.round()}% OFF',
              AppColors.goldAmber,
            ),
          ),
        if (_isBestSeller && _isInStock)
          Positioned(
            top: 12,
            right: 12,
            child: _badge(
              'BEST SELLER',
              AppColors.primaryGreen,
            ),
          ),
        if (!_isInStock)
          Positioned.fill(
            child: Container(
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.55),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                'OUT OF STOCK',
                style: GoogleFonts.lexend(
                  color: Colors.white,
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ),
      ],
    );
  }

  Widget _productImageWidget() {
    if (_image.startsWith('assets/')) {
      return Image.asset(
        _image,
        fit: BoxFit.contain,
        errorBuilder: (
            BuildContext context,
            Object error,
            StackTrace? stackTrace,
            ) {
          return _imageFallback();
        },
      );
    }

    if (_image.startsWith('http://') ||
        _image.startsWith('https://')) {
      return Image.network(
        _image,
        fit: BoxFit.contain,
        loadingBuilder: (
            BuildContext context,
            Widget child,
            ImageChunkEvent? loadingProgress,
            ) {
          if (loadingProgress == null) {
            return child;
          }

          return const Center(
            child: CircularProgressIndicator(
              color: AppColors.primaryGreen,
              strokeWidth: 2.5,
            ),
          );
        },
        errorBuilder: (
            BuildContext context,
            Object error,
            StackTrace? stackTrace,
            ) {
          return _imageFallback();
        },
      );
    }

    return _imageFallback();
  }

  Widget _buildProductDetails() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Text(
          _displayName,
          style: GoogleFonts.notoSansTelugu(
            fontSize: 22,
            fontWeight: FontWeight.w700,
            color: AppColors.darkText,
            height: 1.35,
          ),
        ),
        const SizedBox(height: 7),
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 10,
            vertical: 6,
          ),
          decoration: BoxDecoration(
            color: AppColors.lightMint,
            borderRadius: BorderRadius.circular(9),
          ),
          child: Text(
            _displayCategory,
            style: GoogleFonts.notoSansTelugu(
              fontSize: 12,
              fontWeight: FontWeight.w600,
              color: AppColors.primaryGreen,
            ),
          ),
        ),
        const SizedBox(height: 10),
        Row(
          children: <Widget>[
            Icon(
              Icons.scale_outlined,
              size: 17,
              color: Colors.grey.shade600,
            ),
            const SizedBox(width: 6),
            Text(
              'Net Qty: $_weight',
              style: GoogleFonts.lato(
                fontSize: 13,
                color: Colors.grey.shade700,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
        if (_isOrganic) ...<Widget>[
          const SizedBox(height: 9),
          Row(
            children: <Widget>[
              const Icon(
                Icons.eco_rounded,
                color: AppColors.primaryGreen,
                size: 18,
              ),
              const SizedBox(width: 5),
              Text(
                'Organic Farm Produce',
                style: GoogleFonts.lato(
                  color: AppColors.primaryGreen,
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ],
          ),
        ],
        const SizedBox(height: 10),
        Row(
          children: <Widget>[
            const Icon(
              Icons.star_rounded,
              color: AppColors.goldAmber,
              size: 20,
            ),
            const SizedBox(width: 4),
            Text(
              _rating.toStringAsFixed(1),
              style: GoogleFonts.lexend(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppColors.darkText,
              ),
            ),
            const SizedBox(width: 5),
            Text(
              '(120 reviews)',
              style: GoogleFonts.lato(
                color: Colors.grey.shade500,
                fontSize: 11,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Wrap(
          crossAxisAlignment: WrapCrossAlignment.center,
          spacing: 8,
          runSpacing: 5,
          children: <Widget>[
            Text(
              '₹$_price',
              style: GoogleFonts.lexend(
                fontSize: 26,
                fontWeight: FontWeight.w800,
                color: AppColors.primaryGreen,
              ),
            ),
            if (_originalPrice > _price)
              Text(
                '₹$_originalPrice',
                style: GoogleFonts.lato(
                  fontSize: 13,
                  color: Colors.grey.shade400,
                  decoration: TextDecoration.lineThrough,
                ),
              ),
            if (_savedAmount > 0)
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 8,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: AppColors.lightMint,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Save ₹$_savedAmount',
                  style: GoogleFonts.lato(
                    fontSize: 11,
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          'Inclusive of all taxes',
          style: GoogleFonts.lato(
            fontSize: 10,
            color: Colors.grey.shade500,
          ),
        ),
      ],
    );
  }

  Widget _buildQuantityAndCartSection() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Choose quantity / unit',
            style: GoogleFonts.lexend(
              color: AppColors.darkText,
              fontSize: 15,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: _availableUnits.map(
                  (String unitOption) {
                final bool selected =
                    unitOption == _selectedUnit;

                return ChoiceChip(
                  selected: selected,
                  showCheckmark: false,
                  label: Text(unitOption),
                  selectedColor:
                  AppColors.primaryGreen,
                  backgroundColor:
                  AppColors.lightCream,
                  side: BorderSide(
                    color: selected
                        ? AppColors.primaryGreen
                        : const Color(0xFFE0E9E1),
                  ),
                  labelStyle: GoogleFonts.lato(
                    color: selected
                        ? Colors.white
                        : AppColors.darkText,
                    fontWeight: FontWeight.w700,
                  ),
                  onSelected: (_) {
                    setState(() {
                      _selectedUnit = unitOption;
                      _localQuantity =
                          _cartService.getQuantity(
                            _englishName,
                            productId: _productId,
                            teluguName: _teluguName,
                            weight: unitOption,
                          );
                    });
                  },
                );
              },
            ).toList(),
          ),
          const SizedBox(height: 14),
          _buildAvailabilitySummary(),
          const SizedBox(height: 14),
          Row(
            children: <Widget>[
              Container(
                height: 48,
                decoration: BoxDecoration(
                  color: AppColors.lightCream,
                  borderRadius:
                  BorderRadius.circular(14),
                  border: Border.all(
                    color: const Color(0xFFE0E9E1),
                  ),
                ),
                child: Row(
                  children: <Widget>[
                    _quantityButton(
                      icon: Icons.remove_rounded,
                      onTap: _localQuantity > 0 &&
                          _isInStock
                          ? _removeOne
                          : null,
                    ),
                    SizedBox(
                      width: 46,
                      child: Text(
                        '$_localQuantity',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lexend(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: AppColors.darkText,
                        ),
                      ),
                    ),
                    _quantityButton(
                      icon: Icons.add_rounded,
                      onTap: _isInStock
                          ? _addOne
                          : null,
                      filled: true,
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: ElevatedButton(
                  onPressed:
                  _isInStock ? _handleMainButton : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor:
                    AppColors.primaryGreen,
                    disabledBackgroundColor:
                    Colors.grey.shade300,
                    foregroundColor: Colors.white,
                    disabledForegroundColor:
                    Colors.grey.shade700,
                    minimumSize:
                    const Size(double.infinity, 50),
                    elevation: 0,
                    shape: RoundedRectangleBorder(
                      borderRadius:
                      BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    !_isInStock
                        ? 'OUT OF STOCK'
                        : _localQuantity > 0
                        ? 'GO TO CART  ₹$_cartTotal'
                        : 'ADD TO CART',
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.lexend(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
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

  Widget _buildQuickOrderRuleCard() {
    final bool available =
        _productModel.isQuickAvailable;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: available
            ? const Color(0xFFEAF7ED)
            : const Color(0xFFFFEBEE),
        borderRadius: BorderRadius.circular(13),
        border: Border.all(
          color: available
              ? AppColors.primaryGreen
              .withValues(alpha: 0.25)
              : AppColors.errorRed
              .withValues(alpha: 0.25),
        ),
      ),
      child: Row(
        crossAxisAlignment:
        CrossAxisAlignment.start,
        children: <Widget>[
          Icon(
            available
                ? Icons.bolt_rounded
                : Icons.timer_off_outlined,
            color: available
                ? AppColors.primaryGreen
                : AppColors.errorRed,
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  available
                      ? 'Quick Delivery • '
                      '${_productModel.quickDeliveryMinutes} min'
                      : 'Quick Delivery Unavailable',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  available
                      ? '${_productModel.quickMinimumText}. '
                      '${_productModel.quickStockText}. '
                      'This order is prepared immediately without '
                      'a multi-day schedule.'
                      : _productModel.quickStockText,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 11,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildScheduledOrderRuleCard() {
    final String days =
    _productModel.availableDeliveryDays.isEmpty
        ? 'Select the delivery day and time slot '
        'during checkout.'
        : _productModel.availableDeliveryDays
        .join(', ');

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8E1),
        borderRadius: BorderRadius.circular(13),
      ),
      child: Row(
        crossAxisAlignment:
        CrossAxisAlignment.start,
        children: <Widget>[
          const Icon(
            Icons.calendar_month_outlined,
            color: AppColors.goldAmber,
          ),
          const SizedBox(width: 9),
          Expanded(
            child: Text(
              'Scheduled delivery: $days',
              style: GoogleFonts.lato(
                color: AppColors.darkText,
                fontSize: 11.5,
                height: 1.4,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAvailabilitySummary() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(13),
      decoration: BoxDecoration(
        color: const Color(0xFFF7FAF7),
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: const Color(0xFFDDE8DF),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Delivery availability',
            style: GoogleFonts.lexend(
              color: AppColors.darkText,
              fontSize: 12,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 9),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              if (_productModel.isQuickAvailable)
                _availabilityChip(
                  icon: Icons.bolt_rounded,
                  label:
                  'Quick eligible • ${_productModel.quickDeliveryMinutes} min',
                  background: const Color(0xFFEAF7ED),
                  foreground: AppColors.primaryGreen,
                ),
              _availabilityChip(
                icon: Icons.calendar_month_outlined,
                label: 'Scheduled eligible',
                background: const Color(0xFFFFF8E1),
                foreground: const Color(0xFF9A6700),
              ),
              if (_canPreOrder)
                _availabilityChip(
                  icon: Icons.event_available_rounded,
                  label: 'Advance pre-booking eligible',
                  background: const Color(0xFFF2ECFF),
                  foreground: const Color(0xFF6A45B8),
                ),
            ],
          ),
          const SizedBox(height: 9),
          Text(
            'Add products normally. Choose one delivery method for the '
                'complete order during checkout.',
            style: GoogleFonts.lato(
              color: Colors.grey.shade700,
              fontSize: 10.5,
              height: 1.4,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _availabilityChip({
    required IconData icon,
    required String label,
    required Color background,
    required Color foreground,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 9,
        vertical: 7,
      ),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: <Widget>[
          Icon(icon, size: 15, color: foreground),
          const SizedBox(width: 5),
          Text(
            label,
            style: GoogleFonts.lato(
              color: foreground,
              fontSize: 10,
              fontWeight: FontWeight.w800,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryBenefits() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.lightMint,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.shopping_bag_outlined,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Order this product your way',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  'Select the unit and quantity now. At checkout, choose one '
                      'delivery method for the full order: Quick, Scheduled, or '
                      'Advance Pre-Order, based on product eligibility.',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 11.5,
                    height: 1.45,
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

  Widget _buildFarmerSection() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: _cardDecoration(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              _buildFarmerAvatar(),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Expanded(
                          child: Text(
                            _seller,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.lexend(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: AppColors.darkText,
                            ),
                          ),
                        ),
                        const Icon(
                          Icons.verified_rounded,
                          color: AppColors.primaryGreen,
                          size: 21,
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      _farmName,
                      style: GoogleFonts.lato(
                        color: AppColors.primaryGreen,
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 5),
                    Row(
                      children: <Widget>[
                        Icon(
                          Icons.location_on_outlined,
                          size: 15,
                          color: Colors.grey.shade600,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            _farmerLocation,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.lato(
                              color: Colors.grey.shade600,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: <Widget>[
              Expanded(
                child: _farmerStat(
                  Icons.workspace_premium_outlined,
                  _farmerExperience,
                  'Experience',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _farmerStat(
                  Icons.star_rounded,
                  _rating.toStringAsFixed(1),
                  'Farmer rating',
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _farmerStat(
                  Icons.eco_outlined,
                  _isOrganic ? 'Organic' : 'Natural',
                  'Growing method',
                ),
              ),
            ],
          ),
          const SizedBox(height: 15),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.lightMint,
              borderRadius: BorderRadius.circular(13),
            ),
            child: Row(
              children: <Widget>[
                const Icon(
                  Icons.handshake_outlined,
                  color: AppColors.primaryGreen,
                  size: 20,
                ),
                const SizedBox(width: 9),
                Expanded(
                  child: Text(
                    'Directly sourced from the farmer with transparent pricing.',
                    style: GoogleFonts.lato(
                      color: AppColors.darkText,
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 13),
          Row(
            children: <Widget>[
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: _openFarmerProfile,
                  icon: const Icon(
                    Icons.person_search_outlined,
                  ),
                  label: const Text(
                    'VIEW FARMER DETAILS',
                  ),
                ),
              ),
              const SizedBox(width: 9),
              IconButton.filledTonal(
                tooltip: 'Farm location',
                onPressed: () {
                  _showMessage(
                    _productModel.farmerFullLocation,
                  );
                },
                icon: const Icon(
                  Icons.map_outlined,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFarmerAvatar() {
    if (_farmerImage.startsWith('assets/')) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Image.asset(
          _farmerImage,
          width: 68,
          height: 68,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _farmerAvatarFallback(),
        ),
      );
    }

    if (_farmerImage.startsWith('http://') ||
        _farmerImage.startsWith('https://')) {
      return ClipRRect(
        borderRadius: BorderRadius.circular(18),
        child: Image.network(
          _farmerImage,
          width: 68,
          height: 68,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _farmerAvatarFallback(),
        ),
      );
    }

    return _farmerAvatarFallback();
  }

  Widget _farmerAvatarFallback() {
    return Container(
      width: 68,
      height: 68,
      decoration: BoxDecoration(
        color: AppColors.lightMint,
        borderRadius: BorderRadius.circular(18),
      ),
      child: const Icon(
        Icons.person_rounded,
        color: AppColors.primaryGreen,
        size: 37,
      ),
    );
  }

  Widget _farmerStat(IconData icon, String value, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 11),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(13),
      ),
      child: Column(
        children: <Widget>[
          Icon(icon, color: AppColors.primaryGreen, size: 20),
          const SizedBox(height: 5),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.lexend(
              fontSize: 11,
              fontWeight: FontWeight.w700,
              color: AppColors.darkText,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.lato(
              fontSize: 9,
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildPreOrderSection() {
    return _sectionCard(
      title: 'Pre-Order Next Harvest',
      icon: Icons.event_available_rounded,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: <Color>[
                  Color(0xFFFFF7DF),
                  Color(0xFFEAF6EA),
                ],
              ),
              borderRadius: BorderRadius.circular(15),
              border: Border.all(
                color: AppColors.goldAmber.withValues(alpha: 0.35),
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  _productModel.preOrderNote.trim().isEmpty
                      ? 'Reserve this product before harvest. The farmer will keep your quantity aside and deliver it in the selected slot.'
                      : _productModel.preOrderNote,
                  style: GoogleFonts.lato(
                    color: AppColors.darkText,
                    fontSize: 13,
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 13),
                if (_harvestDate != null)
                  _preOrderDateRow(
                    icon: Icons.agriculture_rounded,
                    label: 'Harvest date',
                    value: _formatDate(_harvestDate!),
                  ),
                if (_expectedDeliveryDate != null)
                  _preOrderDateRow(
                    icon: Icons.local_shipping_outlined,
                    label: 'Expected delivery',
                    value: _formatDate(_expectedDeliveryDate!),
                  ),
                _preOrderDateRow(
                  icon: Icons.inventory_2_outlined,
                  label: 'Availability',
                  value: _productModel.preOrderAvailabilityText,
                ),
              ],
            ),
          ),
          const SizedBox(height: 13),
          SizedBox(
            width: double.infinity,
            height: 49,
            child: ElevatedButton.icon(
              onPressed: _openPreOrderSheet,
              icon: const Icon(Icons.calendar_month_rounded),
              label: Text(
                'PRE-ORDER NOW',
                style: GoogleFonts.lexend(
                  fontWeight: FontWeight.w700,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                elevation: 0,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _preOrderDateRow({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 9),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(
            icon,
            size: 18,
            color: AppColors.primaryGreen,
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 112,
            child: Text(
              label,
              style: GoogleFonts.lato(
                color: Colors.grey.shade700,
                fontSize: 12,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.lato(
                color: AppColors.darkText,
                fontSize: 12,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMoreFromFarmerSection() {
    return StreamBuilder<List<ProductModel>>(
      stream: _farmerService.watchProductsByFarmer(
        _farmerId,
        excludeProductId: _productId,
        limit: 12,
      ),
      builder: (
          BuildContext context,
          AsyncSnapshot<List<ProductModel>> snapshot,
          ) {
        return _buildRelatedProductsSection(
          title: 'More From This Farmer',
          subtitle: 'Other fresh products supplied by the same farmer',
          icon: Icons.storefront_rounded,
          products: snapshot.data ?? const <ProductModel>[],
        );
      },
    );
  }

  Widget _buildSimilarSameFarmerSection() {
    return StreamBuilder<List<ProductModel>>(
      stream: _farmerService.watchSimilarProductsFromSameFarmer(
        _productModel,
        limit: 10,
      ),
      builder: (
          BuildContext context,
          AsyncSnapshot<List<ProductModel>> snapshot,
          ) {
        return _buildRelatedProductsSection(
          title: 'Similar Products From This Farmer',
          subtitle: 'Closely related varieties from the same farm',
          icon: Icons.compare_arrows_rounded,
          products: snapshot.data ?? const <ProductModel>[],
        );
      },
    );
  }

  Widget _buildSimilarFarmsSection() {
    final Farmer farmer = _farmer ?? _productModel.farmer;

    return StreamBuilder<List<Farmer>>(
      stream: _farmerService.watchSimilarFarms(
        farmer,
        limit: 8,
      ),
      builder: (
          BuildContext context,
          AsyncSnapshot<List<Farmer>> snapshot,
          ) {
        final List<Farmer> farms = snapshot.data ?? const <Farmer>[];

        if (farms.isEmpty) {
          return const SizedBox.shrink();
        }

        return _sectionCard(
          title: 'Similar Farms',
          icon: Icons.landscape_rounded,
          child: SizedBox(
            height: 178,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: farms.length,
              separatorBuilder: (_, __) => const SizedBox(width: 11),
              itemBuilder: (BuildContext context, int index) {
                final Farmer item = farms[index];

                return Container(
                  width: 240,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.lightCream,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: const Color(0xFFE1E9E2),
                    ),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: AppColors.lightMint,
                            child: Text(
                              item.name.isEmpty
                                  ? 'F'
                                  : item.name[0].toUpperCase(),
                              style: GoogleFonts.lexend(
                                color: AppColors.primaryGreen,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                              CrossAxisAlignment.start,
                              children: <Widget>[
                                Row(
                                  children: <Widget>[
                                    Expanded(
                                      child: Text(
                                        item.farmName,
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: GoogleFonts.lexend(
                                          fontSize: 12,
                                          fontWeight: FontWeight.w700,
                                          color: AppColors.darkText,
                                        ),
                                      ),
                                    ),
                                    if (item.verified)
                                      const Icon(
                                        Icons.verified_rounded,
                                        color: AppColors.primaryGreen,
                                        size: 17,
                                      ),
                                  ],
                                ),
                                Text(
                                  item.location,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                  style: GoogleFonts.lato(
                                    fontSize: 10,
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        item.cropsGrown.take(4).join(' • '),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: GoogleFonts.lato(
                          fontSize: 11,
                          color: Colors.grey.shade700,
                          height: 1.35,
                        ),
                      ),
                      const Spacer(),
                      Row(
                        children: <Widget>[
                          const Icon(
                            Icons.star_rounded,
                            color: AppColors.goldAmber,
                            size: 16,
                          ),
                          Text(
                            ' ${item.displayRating}',
                            style: GoogleFonts.lato(
                              fontSize: 10,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const Spacer(),
                          if (item.organicCertified)
                            Text(
                              'Organic',
                              style: GoogleFonts.lato(
                                color: AppColors.primaryGreen,
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                              ),
                            ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        );
      },
    );
  }

  Widget _buildProductsFromSimilarFarmsSection() {
    final Farmer farmer = _farmer ?? _productModel.farmer;

    return StreamBuilder<List<ProductModel>>(
      stream: _farmerService.watchProductsFromSimilarFarms(
        farmer,
        excludeProductId: _productId,
        productLimit: 12,
      ),
      builder: (
          BuildContext context,
          AsyncSnapshot<List<ProductModel>> snapshot,
          ) {
        return _buildRelatedProductsSection(
          title: 'Products From Similar Farms',
          subtitle: 'Fresh alternatives from farms like this one',
          icon: Icons.agriculture_rounded,
          products: snapshot.data ?? const <ProductModel>[],
        );
      },
    );
  }

  Widget _buildFrequentlyBoughtTogetherSection() {
    return StreamBuilder<List<ProductModel>>(
      stream: _firestoreService.watchProductsByCollection(
        _productModel.collection,
      ),
      builder: (
          BuildContext context,
          AsyncSnapshot<List<ProductModel>> snapshot,
          ) {
        final List<ProductModel> products =
        (snapshot.data ?? const <ProductModel>[])
            .where((ProductModel item) => item.id != _productId)
            .take(6)
            .toList();

        if (products.isEmpty) {
          return const SizedBox.shrink();
        }

        return _sectionCard(
          title: 'Frequently Bought Together',
          icon: Icons.add_shopping_cart_rounded,
          child: Column(
            children: <Widget>[
              SizedBox(
                height: 235,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: products.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (BuildContext context, int index) {
                    final ProductModel item = products[index];

                    return _relatedProductCard(item);
                  },
                ),
              ),
              const SizedBox(height: 13),
              SizedBox(
                width: double.infinity,
                height: 46,
                child: OutlinedButton.icon(
                  onPressed: () {
                    for (final ProductModel item in products.take(3)) {
                      _cartService.addItem(
                        item.name,
                        LocalProductCatalog.imageFor(
                          name: item.name,
                          preferredImage: item.image,
                        ),
                        item.discountedPrice.round(),
                        productId: item.id,
                        teluguName: item.teluguName,
                        weight: item.weight,
                        category: item.category,
                        categoryTelugu: item.categoryTelugu,
                        farmerId: item.farmerId,
                        farmerName: _seller,
                        farmName: _farmName,
                        organic: item.organic,
                        rating: item.rating,
                        isQuick: item.isQuick,
                        quickDeliveryMinutes:
                        item.quickDeliveryMinutes,
                        isPreOrder: item.canPreOrder,
                        harvestDate: item.activeHarvestDate,
                        expectedDeliveryDate:
                        item.expectedDeliveryDate,
                        deliverySlot:
                        item.availableDeliverySlots.isEmpty
                            ? ''
                            : item.availableDeliverySlots.first,
                      );
                    }

                    _showMessage(
                      'Popular farm basket items added to cart.',
                    );
                  },
                  icon: const Icon(Icons.shopping_basket_rounded),
                  label: Text(
                    'ADD POPULAR COMBO',
                    style: GoogleFonts.lexend(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.primaryGreen,
                    side: const BorderSide(
                      color: AppColors.primaryGreen,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(13),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRelatedProductsSection({
    required String title,
    required String subtitle,
    required IconData icon,
    required List<ProductModel> products,
  }) {
    if (products.isEmpty) {
      return const SizedBox.shrink();
    }

    return _sectionCard(
      title: title,
      icon: icon,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            subtitle,
            style: GoogleFonts.lato(
              color: Colors.grey.shade600,
              fontSize: 12,
              height: 1.35,
            ),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 235,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              itemCount: products.length,
              separatorBuilder: (_, __) => const SizedBox(width: 10),
              itemBuilder: (
                  BuildContext context,
                  int index,
                  ) {
                return _relatedProductCard(products[index]);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _relatedProductCard(ProductModel product) {
    final String image = LocalProductCatalog.imageFor(
      name: product.name,
      preferredImage: product.image,
    );

    final int quantity = _cartService.getQuantity(
      product.name,
      productId: product.id,
      teluguName: product.teluguName,
    );

    void addRelatedProduct() {
      _cartService.addItem(
        product.name,
        image,
        product.discountedPrice.round(),
        productId: product.id,
        teluguName: product.teluguName,
        weight: product.weight,
        category: product.category,
        categoryTelugu: product.categoryTelugu,
        farmerId: product.farmerId,
        farmerName: _seller,
        farmName: _farmName,
        organic: product.organic,
        rating: product.rating,
        isQuick: product.isQuick,
        quickDeliveryMinutes:
        product.quickDeliveryMinutes,
        isPreOrder: product.canPreOrder,
        harvestDate: product.activeHarvestDate,
        expectedDeliveryDate:
        product.expectedDeliveryDate,
        deliverySlot:
        product.availableDeliverySlots.isEmpty
            ? ''
            : product.availableDeliverySlots.first,
      );

      _showMessage(
        '${product.formattedDisplayName} added to cart.',
      );
    }

    void removeRelatedProduct() {
      _cartService.removeOne(
        product.name,
        productId: product.id,
        teluguName: product.teluguName,
      );
    }

    return Container(
      width: 160,
      padding: const EdgeInsets.all(10),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: const Color(0xFFE1E9E2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: InkWell(
              borderRadius: BorderRadius.circular(12),
              onTap: () {
                Navigator.of(context).push(
                  MaterialPageRoute<void>(
                    builder: (_) => ProductDetailScreen(
                      product: product.toMap(),
                    ),
                  ),
                );
              },
              child: Stack(
                children: <Widget>[
                  Positioned.fill(
                    child: Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: image.startsWith('http')
                          ? Image.network(
                        image,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) =>
                        const Icon(
                          Icons.eco_rounded,
                          color: AppColors.primaryGreen,
                          size: 42,
                        ),
                      )
                          : Image.asset(
                        image,
                        fit: BoxFit.contain,
                        errorBuilder: (_, __, ___) =>
                        const Icon(
                          Icons.eco_rounded,
                          color: AppColors.primaryGreen,
                          size: 42,
                        ),
                      ),
                    ),
                  ),
                  if (product.isQuick)
                    Positioned(
                      left: 5,
                      bottom: 5,
                      child: _badge(
                        product.quickDeliveryText.isEmpty
                            ? 'QUICK'
                            : product.quickDeliveryText
                            .toUpperCase(),
                        AppColors.goldAmber,
                      ),
                    ),
                  if (product.canPreOrder)
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
          ),
          const SizedBox(height: 7),
          Text(
            product.formattedDisplayName,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.notoSansTelugu(
              color: AppColors.darkText,
              fontSize: 10.5,
              fontWeight: FontWeight.w700,
              height: 1.25,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            product.weight,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.lato(
              color: Colors.grey.shade600,
              fontSize: 9,
            ),
          ),
          const SizedBox(height: 6),
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  '₹${product.discountedPrice.toStringAsFixed(0)}',
                  style: GoogleFonts.lexend(
                    color: AppColors.primaryGreen,
                    fontSize: 13,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              if (!product.isAvailable)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 7,
                    vertical: 5,
                  ),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFEBEE),
                    borderRadius: BorderRadius.circular(8),
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
                  height: 31,
                  child: OutlinedButton(
                    onPressed: addRelatedProduct,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                      ),
                    ),
                    child: const Text('ADD'),
                  ),
                )
              else
                Container(
                  height: 31,
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      InkWell(
                        onTap: removeRelatedProduct,
                        child: const SizedBox(
                          width: 27,
                          height: 31,
                          child: Icon(
                            Icons.remove_rounded,
                            color: Colors.white,
                            size: 15,
                          ),
                        ),
                      ),
                      Text(
                        '$quantity',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 11,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      InkWell(
                        onTap: addRelatedProduct,
                        child: const SizedBox(
                          width: 27,
                          height: 31,
                          child: Icon(
                            Icons.add_rounded,
                            color: Colors.white,
                            size: 15,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    );
  }

  Future<void> _openPreOrderSheet() async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      _showMessage(
        'Please sign in before placing a pre-order.',
        isError: true,
      );
      return;
    }

    int quantity = _productModel.safeMinimumPreOrderQuantity;
    DateTime deliveryDate = _expectedDeliveryDate ??
        (_harvestDate ?? DateTime.now()).add(
          const Duration(days: 1),
        );
    String selectedSlot = _deliverySlots.first;
    bool isSaving = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(
          top: Radius.circular(28),
        ),
      ),
      builder: (BuildContext sheetContext) {
        return StatefulBuilder(
          builder: (
              BuildContext context,
              StateSetter setSheetState,
              ) {
            final double total =
                _productModel.discountedPrice * quantity;

            return SafeArea(
              child: Padding(
                padding: EdgeInsets.fromLTRB(
                  20,
                  4,
                  20,
                  20 + MediaQuery.viewInsetsOf(context).bottom,
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      'Pre-Order $_displayName',
                      style: GoogleFonts.notoSansTelugu(
                        color: AppColors.darkText,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 16),
                    Row(
                      children: <Widget>[
                        Text(
                          'Quantity ($_selectedUnit)',
                          style: GoogleFonts.lato(
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                        const Spacer(),
                        IconButton(
                          onPressed: quantity >
                              _productModel
                                  .safeMinimumPreOrderQuantity
                              ? () {
                            setSheetState(() {
                              quantity--;
                            });
                          }
                              : null,
                          icon: const Icon(
                            Icons.remove_circle_outline_rounded,
                          ),
                        ),
                        Text(
                          '$quantity',
                          style: GoogleFonts.lexend(
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        IconButton(
                          onPressed: quantity <
                              _productModel
                                  .remainingPreOrderQuantity
                              ? () {
                            setSheetState(() {
                              quantity++;
                            });
                          }
                              : null,
                          icon: const Icon(
                            Icons.add_circle_outline_rounded,
                          ),
                        ),
                      ],
                    ),
                    ListTile(
                      contentPadding: EdgeInsets.zero,
                      leading: const Icon(
                        Icons.calendar_month_rounded,
                        color: AppColors.primaryGreen,
                      ),
                      title: const Text('Expected delivery date'),
                      subtitle: Text(_formatDate(deliveryDate)),
                      trailing: const Icon(
                        Icons.chevron_right_rounded,
                      ),
                      onTap: () async {
                        final DateTime? picked =
                        await showDatePicker(
                          context: context,
                          initialDate: deliveryDate,
                          firstDate: deliveryDate,
                          lastDate: deliveryDate.add(
                            const Duration(days: 30),
                          ),
                        );

                        if (picked != null) {
                          setSheetState(() {
                            deliveryDate = picked;
                          });
                        }
                      },
                    ),
                    DropdownButtonFormField<String>(
                      value: selectedSlot,
                      decoration: const InputDecoration(
                        labelText: 'Delivery slot',
                        prefixIcon: Icon(
                          Icons.schedule_rounded,
                        ),
                      ),
                      items: _deliverySlots
                          .map(
                            (String slot) =>
                            DropdownMenuItem<String>(
                              value: slot,
                              child: Text(slot),
                            ),
                      )
                          .toList(),
                      onChanged: (String? value) {
                        if (value != null) {
                          setSheetState(() {
                            selectedSlot = value;
                          });
                        }
                      },
                    ),
                    const SizedBox(height: 18),
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        onPressed: isSaving
                            ? null
                            : () async {
                          setSheetState(() {
                            isSaving = true;
                          });

                          try {
                            final Farmer farmer = _farmer ??
                                _productModel.farmer;

                            await _preOrderService.createPreOrder(
                              PreOrderModel(
                                userId: user.uid,
                                productId: _productId,
                                productName: _englishName,
                                productTeluguName: _teluguName,
                                productImage: _image,
                                category: _category,
                                categoryTelugu: _categoryTelugu,
                                weight: _weight,
                                farmerId: _farmerId,
                                farmerName: farmer.name,
                                farmName: farmer.farmName,
                                quantity: quantity,
                                unitPrice:
                                _productModel.discountedPrice,
                                totalPrice: total,
                                harvestDate: _harvestDate,
                                expectedDeliveryDate: deliveryDate,
                                deliverySlot: selectedSlot,
                                deliveryType: 'Pre-Order',
                                paymentMethod: 'Cash on Delivery',
                                paymentStatus: 'pending',
                                status: 'pending',
                                createdAt: DateTime.now(),
                                updatedAt: DateTime.now(),
                              ),
                            );

                            if (!mounted) {
                              return;
                            }

                            Navigator.pop(sheetContext);

                            _showMessage(
                              'Pre-order confirmed for ${_formatDate(deliveryDate)}.',
                            );
                          } on PreOrderServiceException catch (error) {
                            setSheetState(() {
                              isSaving = false;
                            });

                            _showMessage(
                              error.message,
                              isError: true,
                            );
                          } catch (_) {
                            setSheetState(() {
                              isSaving = false;
                            });

                            _showMessage(
                              'Unable to place pre-order. Please try again.',
                              isError: true,
                            );
                          }
                        },
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryGreen,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14),
                          ),
                        ),
                        child: Text(
                          isSaving
                              ? 'CONFIRMING...'
                              : 'CONFIRM PRE-ORDER • ₹${total.toStringAsFixed(0)}',
                          style: GoogleFonts.lexend(
                            fontWeight: FontWeight.w700,
                          ),
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
        '${months[date.month - 1]} '
        '${date.year}';
  }


  Widget _buildReviewsSection() {
    return StreamBuilder<List<ReviewModel>>(
      stream: _reviewService.watchProductReviews(
        _productId,
      ),
      builder: (
          BuildContext context,
          AsyncSnapshot<List<ReviewModel>> snapshot,
          ) {
        final List<ReviewModel> reviews =
            snapshot.data ?? const <ReviewModel>[];
        final ReviewSummary summary =
        _reviewService.summarize(reviews);

        return _sectionCard(
          title: 'Ratings & Reviews',
          icon: Icons.reviews_outlined,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              _buildRatingSummary(summary),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _openWriteReviewDialog,
                  icon: const Icon(
                    Icons.rate_review_outlined,
                  ),
                  label: Text(
                    'WRITE A REVIEW',
                    style: GoogleFonts.lexend(
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              if (snapshot.connectionState ==
                  ConnectionState.waiting &&
                  reviews.isEmpty)
                const Center(
                  child: CircularProgressIndicator(
                    color: AppColors.primaryGreen,
                  ),
                )
              else if (reviews.isEmpty)
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.lightCream,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Text(
                    'No customer reviews yet. Be the first to review this product.',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.lato(
                      color: Colors.grey.shade700,
                      height: 1.4,
                    ),
                  ),
                )
              else
                ...reviews.take(8).map<Widget>(
                      (ReviewModel review) =>
                      _buildReviewCard(review),
                ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildRatingSummary(ReviewSummary summary) {
    final double displayRating =
    summary.totalReviews == 0
        ? _rating
        : summary.averageRating;

    return LayoutBuilder(
      builder: (
          BuildContext context,
          BoxConstraints constraints,
          ) {
        final bool vertical = constraints.maxWidth < 380;

        final Widget overview = Column(
          children: <Widget>[
            Text(
              displayRating.toStringAsFixed(1),
              style: GoogleFonts.lexend(
                color: AppColors.primaryGreen,
                fontSize: 42,
                fontWeight: FontWeight.w800,
              ),
            ),
            _starRow(displayRating, size: 19),
            const SizedBox(height: 4),
            Text(
              '${summary.totalReviews} customer review${summary.totalReviews == 1 ? '' : 's'}',
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 11,
              ),
            ),
          ],
        );

        final Widget bars = Column(
          children: <Widget>[
            for (int star = 5; star >= 1; star--)
              _ratingDistributionRow(
                star,
                summary.percentageFor(star),
                summary.ratingCounts[star] ?? 0,
              ),
          ],
        );

        if (vertical) {
          return Column(
            children: <Widget>[
              overview,
              const SizedBox(height: 16),
              bars,
            ],
          );
        }

        return Row(
          children: <Widget>[
            SizedBox(
              width: 120,
              child: overview,
            ),
            const SizedBox(width: 18),
            Expanded(child: bars),
          ],
        );
      },
    );
  }

  Widget _ratingDistributionRow(
      int star,
      double percentage,
      int count,
      ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        children: <Widget>[
          SizedBox(
            width: 25,
            child: Text(
              '$star',
              style: GoogleFonts.lato(
                fontSize: 11,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
          const Icon(
            Icons.star_rounded,
            color: AppColors.goldAmber,
            size: 14,
          ),
          const SizedBox(width: 7),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: percentage,
                minHeight: 8,
                backgroundColor: Colors.grey.shade200,
                valueColor:
                const AlwaysStoppedAnimation<Color>(
                  AppColors.primaryGreen,
                ),
              ),
            ),
          ),
          const SizedBox(width: 8),
          SizedBox(
            width: 28,
            child: Text(
              '$count',
              textAlign: TextAlign.right,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 10,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard(ReviewModel review) {
    final User? user = FirebaseAuth.instance.currentUser;
    final bool mine = user?.uid == review.userId;
    final bool helpful =
        user != null && review.isHelpfulBy(user.uid);

    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: AppColors.lightCream,
        borderRadius: BorderRadius.circular(15),
        border: Border.all(
          color: const Color(0xFFE1E9E2),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              CircleAvatar(
                radius: 20,
                backgroundColor: AppColors.lightMint,
                child: Text(
                  review.userName.isEmpty
                      ? 'U'
                      : review.userName[0].toUpperCase(),
                  style: GoogleFonts.lexend(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      review.userName,
                      style: GoogleFonts.lato(
                        color: AppColors.darkText,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Row(
                      children: <Widget>[
                        _starRow(review.rating, size: 14),
                        if (review.verifiedPurchase) ...<Widget>[
                          const SizedBox(width: 7),
                          Text(
                            'Verified Purchase',
                            style: GoogleFonts.lato(
                              color: AppColors.primaryGreen,
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ],
                ),
              ),
              if (mine)
                PopupMenuButton<String>(
                  onSelected: (String value) {
                    if (value == 'edit') {
                      _openWriteReviewDialog(
                        existingReview: review,
                      );
                    } else if (value == 'delete') {
                      _deleteReview(review);
                    }
                  },
                  itemBuilder: (_) =>
                  const <PopupMenuEntry<String>>[
                    PopupMenuItem<String>(
                      value: 'edit',
                      child: Text('Edit Review'),
                    ),
                    PopupMenuItem<String>(
                      value: 'delete',
                      child: Text('Delete Review'),
                    ),
                  ],
                ),
            ],
          ),
          if (review.title.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 10),
            Text(
              review.title,
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 13,
                fontWeight: FontWeight.w800,
              ),
            ),
          ],
          const SizedBox(height: 7),
          Text(
            review.review,
            style: GoogleFonts.lato(
              color: Colors.grey.shade700,
              fontSize: 12,
              height: 1.45,
            ),
          ),
          if (review.images.isNotEmpty) ...<Widget>[
            const SizedBox(height: 10),
            SizedBox(
              height: 86,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                itemCount: review.images.length,
                separatorBuilder: (_, __) =>
                const SizedBox(width: 8),
                itemBuilder: (_, int index) {
                  final String image = review.images[index];

                  return ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(
                      width: 86,
                      child: image.startsWith('http')
                          ? Image.network(
                        image,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            _imageFallback(),
                      )
                          : Image.asset(
                        image,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) =>
                            _imageFallback(),
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
          if (review.sellerReply.trim().isNotEmpty) ...<Widget>[
            const SizedBox(height: 11),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(11),
              ),
              child: Text(
                'Seller reply: ${review.sellerReply}',
                style: GoogleFonts.lato(
                  color: AppColors.darkText,
                  fontSize: 11,
                  height: 1.4,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            children: <Widget>[
              TextButton.icon(
                onPressed: user == null
                    ? () {
                  _showMessage(
                    'Please sign in to mark reviews helpful.',
                    isError: true,
                  );
                }
                    : () => _toggleHelpful(review),
                icon: Icon(
                  helpful
                      ? Icons.thumb_up_rounded
                      : Icons.thumb_up_outlined,
                  size: 17,
                ),
                label: Text(
                  'Helpful (${review.helpfulCount})',
                ),
              ),
              const Spacer(),
              Text(
                _formatDate(review.createdAt),
                style: GoogleFonts.lato(
                  color: Colors.grey.shade500,
                  fontSize: 9,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _starRow(
      double rating, {
        double size = 17,
      }) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List<Widget>.generate(
        5,
            (int index) {
          final double position = index + 1;

          return Icon(
            rating >= position
                ? Icons.star_rounded
                : rating >= position - 0.5
                ? Icons.star_half_rounded
                : Icons.star_border_rounded,
            color: AppColors.goldAmber,
            size: size,
          );
        },
      ),
    );
  }

  Future<void> _openWriteReviewDialog({
    ReviewModel? existingReview,
  }) async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      _showMessage(
        'Please sign in to write a review.',
        isError: true,
      );
      return;
    }

    double rating = existingReview?.rating ?? 5;
    final TextEditingController titleController =
    TextEditingController(
      text: existingReview?.title ?? '',
    );
    final TextEditingController reviewController =
    TextEditingController(
      text: existingReview?.review ?? '',
    );
    bool saving = false;

    await showDialog<void>(
      context: context,
      builder: (BuildContext dialogContext) {
        return StatefulBuilder(
          builder: (
              BuildContext context,
              StateSetter setDialogState,
              ) {
            return AlertDialog(
              title: Text(
                existingReview == null
                    ? 'Write a Review'
                    : 'Edit Review',
                style: GoogleFonts.lexend(
                  fontWeight: FontWeight.w800,
                ),
              ),
              content: SingleChildScrollView(
                child: SizedBox(
                  width: 460,
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text(
                        _displayName,
                        textAlign: TextAlign.center,
                        style: GoogleFonts.notoSansTelugu(
                          color: AppColors.darkText,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Row(
                        mainAxisAlignment:
                        MainAxisAlignment.center,
                        children: List<Widget>.generate(
                          5,
                              (int index) {
                            return IconButton(
                              onPressed: () {
                                setDialogState(() {
                                  rating = index + 1.0;
                                });
                              },
                              icon: Icon(
                                index < rating
                                    ? Icons.star_rounded
                                    : Icons.star_border_rounded,
                                color: AppColors.goldAmber,
                                size: 32,
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: titleController,
                        textCapitalization:
                        TextCapitalization.sentences,
                        decoration: const InputDecoration(
                          labelText: 'Review title (optional)',
                          prefixIcon:
                          Icon(Icons.title_rounded),
                        ),
                      ),
                      const SizedBox(height: 12),
                      TextField(
                        controller: reviewController,
                        minLines: 4,
                        maxLines: 7,
                        textCapitalization:
                        TextCapitalization.sentences,
                        decoration: const InputDecoration(
                          labelText: 'Tell us about the product',
                          alignLabelWithHint: true,
                          prefixIcon:
                          Icon(Icons.rate_review_outlined),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(11),
                        decoration: BoxDecoration(
                          color: AppColors.lightCream,
                          borderRadius: BorderRadius.circular(11),
                        ),
                        child: Text(
                          'Review image upload structure is supported through the images field. Firebase Storage integration can be added in the image-upload module.',
                          style: GoogleFonts.lato(
                            color: Colors.grey.shade700,
                            fontSize: 10,
                            height: 1.35,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              actions: <Widget>[
                TextButton(
                  onPressed: saving
                      ? null
                      : () {
                    Navigator.pop(dialogContext);
                  },
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: saving
                      ? null
                      : () async {
                    final String text =
                    reviewController.text.trim();

                    if (text.length < 5) {
                      _showMessage(
                        'Please enter at least 5 characters.',
                        isError: true,
                      );
                      return;
                    }

                    setDialogState(() {
                      saving = true;
                    });

                    try {
                      await _reviewService.saveReview(
                        ReviewModel(
                          id: existingReview?.id,
                          productId: _productId,
                          userId: user.uid,
                          userName:
                          user.displayName?.trim().isNotEmpty ==
                              true
                              ? user.displayName!.trim()
                              : 'Farm To Home Customer',
                          userPhoto:
                          user.photoURL ?? '',
                          rating: rating,
                          title:
                          titleController.text.trim(),
                          review: text,
                          images:
                          existingReview?.images ??
                              const <String>[],
                          verifiedPurchase:
                          existingReview
                              ?.verifiedPurchase ??
                              false,
                          helpfulCount:
                          existingReview
                              ?.helpfulCount ??
                              0,
                          helpfulUserIds:
                          existingReview
                              ?.helpfulUserIds ??
                              const <String>[],
                          createdAt:
                          existingReview?.createdAt,
                        ),
                      );

                      if (!mounted) return;

                      Navigator.pop(dialogContext);
                      _showMessage(
                        existingReview == null
                            ? 'Review submitted successfully.'
                            : 'Review updated successfully.',
                      );
                    } on ReviewServiceException catch (error) {
                      setDialogState(() {
                        saving = false;
                      });
                      _showMessage(
                        error.message,
                        isError: true,
                      );
                    } catch (_) {
                      setDialogState(() {
                        saving = false;
                      });
                      _showMessage(
                        'Unable to save review.',
                        isError: true,
                      );
                    }
                  },
                  child: Text(
                    saving ? 'SAVING...' : 'SUBMIT',
                  ),
                ),
              ],
            );
          },
        );
      },
    );

    titleController.dispose();
    reviewController.dispose();
  }

  Future<void> _toggleHelpful(
      ReviewModel review,
      ) async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) return;

    try {
      await _reviewService.toggleHelpful(
        review: review,
        userId: user.uid,
      );
    } on ReviewServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    }
  }

  Future<void> _deleteReview(
      ReviewModel review,
      ) async {
    final User? user = FirebaseAuth.instance.currentUser;
    final String? reviewId = review.id;

    if (user == null || reviewId == null) return;

    final bool? confirmed = await showDialog<bool>(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          title: const Text('Delete Review?'),
          content: const Text(
            'This review will be permanently removed.',
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
                'Delete',
                style: TextStyle(
                  color: AppColors.errorRed,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (confirmed != true) return;

    try {
      await _reviewService.deleteReview(
        reviewId: reviewId,
        userId: user.uid,
      );

      _showMessage('Review deleted.');
    } on ReviewServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    }
  }

  Widget _buildFreshnessSection() {
    final String stockText = !_isInStock
        ? 'Currently unavailable'
        : _stockCount <= 12
        ? 'Only $_stockCount left — selling fast'
        : 'In stock and ready to deliver';

    return _sectionCard(
      title: 'Freshness & Availability',
      icon: Icons.inventory_2_outlined,
      child: Column(
        children: <Widget>[
          _premiumInfoTile(
            icon: _isInStock
                ? Icons.check_circle_outline_rounded
                : Icons.cancel_outlined,
            title: _isInStock ? 'Available now' : 'Out of stock',
            subtitle: stockText,
          ),
          const SizedBox(height: 10),
          _premiumInfoTile(
            icon: Icons.schedule_rounded,
            title: 'Estimated delivery',
            subtitle: 'Delivered within $_deliveryTime',
          ),
          const SizedBox(height: 10),
          _premiumInfoTile(
            icon: Icons.verified_outlined,
            title: 'Freshness guarantee',
            subtitle: 'Quality checked before packing and dispatch.',
          ),
        ],
      ),
    );
  }

  Widget _buildNutritionSection() {
    final Map<String, dynamic> nutrition = _nutritionFromProduct();
    final List<MapEntry<String, String>> entries =
    nutrition.entries
        .where((MapEntry<String, dynamic> entry) =>
    _stringValue(entry.value).isNotEmpty)
        .take(6)
        .map((MapEntry<String, dynamic> entry) =>
        MapEntry<String, String>(entry.key, _stringValue(entry.value)))
        .toList();

    final List<MapEntry<String, String>> values = entries.isNotEmpty
        ? entries
        : <MapEntry<String, String>>[
      const MapEntry<String, String>('Calories', 'Low'),
      const MapEntry<String, String>('Fiber', 'Natural source'),
      const MapEntry<String, String>('Vitamins', 'Rich'),
      const MapEntry<String, String>('Additives', 'None'),
    ];

    return _sectionCard(
      title: 'Nutrition & Benefits',
      icon: Icons.health_and_safety_outlined,
      child: Wrap(
        spacing: 10,
        runSpacing: 10,
        children: values.map((MapEntry<String, String> entry) {
          return Container(
            width: (MediaQuery.sizeOf(context).width - 74) / 2,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.lightCream,
              borderRadius: BorderRadius.circular(13),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  entry.key,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 11,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  entry.value,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _premiumInfoTile({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: <Widget>[
        Container(
          width: 39,
          height: 39,
          decoration: BoxDecoration(
            color: AppColors.lightMint,
            borderRadius: BorderRadius.circular(11),
          ),
          child: Icon(icon, color: AppColors.primaryGreen, size: 21),
        ),
        const SizedBox(width: 11),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                title,
                style: GoogleFonts.lato(
                  color: AppColors.darkText,
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: GoogleFonts.lato(
                  color: Colors.grey.shade600,
                  fontSize: 12,
                  height: 1.35,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDescriptionSection() {
    return _sectionCard(
      title: 'Product Description',
      icon: Icons.description_outlined,
      child: Text(
        _description,
        style: GoogleFonts.lato(
          color: Colors.grey.shade700,
          fontSize: 14,
          height: 1.6,
        ),
      ),
    );
  }

  Widget _buildHighlightsSection(
      Map<String, dynamic> highlights,
      ) {
    return _sectionCard(
      title: 'Product Highlights',
      icon: Icons.auto_awesome_outlined,
      child: Column(
        children: <Widget>[
          _highlightRow(
            'Product Type',
            _highlightValue(
              highlights,
              <String>[
                'product type',
                'productType',
                'type',
              ],
            ),
          ),
          _highlightRow(
            'Imported',
            _highlightValue(
              highlights,
              <String>[
                'imported',
              ],
            ),
          ),
          _highlightRow(
            'Good For',
            _highlightValue(
              highlights,
              <String>[
                'good for',
                'goodFor',
              ],
            ),
          ),
          _highlightRow(
            'Dietary Preference',
            _highlightValue(
              highlights,
              <String>[
                'dietary preference',
                'dietaryPreference',
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProductInformation() {
    return _sectionCard(
      title: 'Product Information',
      icon: Icons.info_outline_rounded,
      child: Column(
        children: <Widget>[
          _informationRow(
            Icons.category_outlined,
            'Category',
            _displayCategory,
            useTeluguFont: true,
          ),
          _informationRow(
            Icons.scale_outlined,
            'Net Quantity',
            _weight,
          ),
          _informationRow(
            Icons.storefront_outlined,
            'Seller',
            _seller,
          ),
          _informationRow(
            Icons.location_on_outlined,
            'Origin',
            _origin,
          ),
          _informationRow(
            Icons.event_available_outlined,
            'Shelf Life',
            _shelfLife,
          ),
          _informationRow(
            Icons.support_agent_rounded,
            'Customer Care',
            'support@farmtohome.com',
          ),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.lightCream,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'Product images are for representational purposes only. The actual product may vary slightly based on freshness and availability.',
              style: GoogleFonts.lato(
                fontSize: 12,
                height: 1.45,
                color: Colors.grey.shade700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBottomCartBar() {
    if (_cartService.totalItemCount <= 0) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: EdgeInsets.fromLTRB(
        16,
        11,
        16,
        MediaQuery.of(context).padding.bottom + 11,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Material(
        color: AppColors.primaryGreen,
        borderRadius: BorderRadius.circular(16),
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: _openCart,
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 13,
            ),
            child: Row(
              children: <Widget>[
                const Icon(
                  Icons.shopping_bag_rounded,
                  color: Colors.white,
                ),
                const SizedBox(width: 11),
                Expanded(
                  child: Column(
                    crossAxisAlignment:
                    CrossAxisAlignment.start,
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Text(
                        '${_cartService.totalItemCount} item${_cartService.totalItemCount == 1 ? '' : 's'} in cart',
                        style: GoogleFonts.lato(
                          color: Colors.white70,
                          fontSize: 11,
                        ),
                      ),
                      Text(
                        '₹${_cartService.totalAmount}',
                        style: GoogleFonts.lexend(
                          color: Colors.white,
                          fontSize: 16,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  'View Cart',
                  style: GoogleFonts.lato(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(width: 5),
                const Icon(
                  Icons.arrow_forward_ios_rounded,
                  color: Colors.white,
                  size: 15,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _sectionCard({
    required String title,
    required IconData icon,
    required Widget child,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: _cardDecoration(),
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
                child: Icon(
                  icon,
                  size: 21,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(width: 10),
              Text(
                title,
                style: GoogleFonts.lexend(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppColors.darkText,
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

  Widget _quantityButton({
    required IconData icon,
    required VoidCallback? onTap,
    bool filled = false,
  }) {
    return Material(
      color: filled && onTap != null
          ? AppColors.primaryGreen
          : Colors.transparent,
      borderRadius: BorderRadius.circular(13),
      child: InkWell(
        borderRadius: BorderRadius.circular(13),
        onTap: onTap,
        child: SizedBox(
          width: 42,
          height: 46,
          child: Icon(
            icon,
            size: 20,
            color: onTap == null
                ? Colors.grey.shade400
                : filled
                ? Colors.white
                : AppColors.primaryGreen,
          ),
        ),
      ),
    );
  }

  Widget _benefitItem({
    required IconData icon,
    required String title,
    required String subtitle,
  }) {
    return Column(
      children: <Widget>[
        Icon(
          icon,
          color: AppColors.primaryGreen,
          size: 25,
        ),
        const SizedBox(height: 6),
        Text(
          title,
          textAlign: TextAlign.center,
          style: GoogleFonts.lato(
            fontSize: 11,
            fontWeight: FontWeight.w700,
            color: AppColors.darkText,
          ),
        ),
        const SizedBox(height: 2),
        Text(
          subtitle,
          textAlign: TextAlign.center,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
          style: GoogleFonts.lato(
            fontSize: 9,
            color: Colors.grey.shade500,
          ),
        ),
      ],
    );
  }

  Widget _highlightRow(
      String label,
      String value,
      ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          SizedBox(
            width: 125,
            child: Text(
              label,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 13,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: GoogleFonts.lato(
                fontWeight: FontWeight.w700,
                color: AppColors.darkText,
                fontSize: 13,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _informationRow(
      IconData icon,
      String label,
      String value, {
        bool useTeluguFont = false,
      }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 13),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Icon(
            icon,
            size: 19,
            color: AppColors.primaryGreen,
          ),
          const SizedBox(width: 10),
          SizedBox(
            width: 105,
            child: Text(
              label,
              style: GoogleFonts.lato(
                fontSize: 13,
                color: Colors.grey.shade600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: useTeluguFont
                  ? GoogleFonts.notoSansTelugu(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: AppColors.darkText,
              )
                  : GoogleFonts.lato(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppColors.darkText,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _badge(
      String label,
      Color color,
      ) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 5,
      ),
      decoration: BoxDecoration(
        color: color,
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        label,
        style: GoogleFonts.lato(
          color: Colors.white,
          fontSize: 9,
          fontWeight: FontWeight.w800,
        ),
      ),
    );
  }

  Widget _imageFallback() {
    return Container(
      color: AppColors.lightCream,
      alignment: Alignment.center,
      child: const Icon(
        Icons.eco_rounded,
        color: AppColors.primaryGreen,
        size: 62,
      ),
    );
  }

  BoxDecoration _cardDecoration() {
    return BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(20),
      border: Border.all(
        color: const Color(0xFFE3EAE4),
      ),
      boxShadow: const <BoxShadow>[
        BoxShadow(
          color: Color(0x0D000000),
          blurRadius: 14,
          offset: Offset(0, 5),
        ),
      ],
    );
  }

  Map<String, dynamic> _nutritionFromProduct() {
    final dynamic nutrition =
        widget.product['nutritionInfo'] ?? widget.product['nutrition'];

    if (nutrition is Map<String, dynamic>) {
      return nutrition;
    }

    if (nutrition is Map) {
      return nutrition.map<String, dynamic>(
            (dynamic key, dynamic value) =>
            MapEntry<String, dynamic>(key.toString(), value),
      );
    }

    return <String, dynamic>{};
  }

  Map<String, dynamic> _highlightsFromProduct() {
    final dynamic highlights = widget.product['highlights'];

    if (highlights is Map<String, dynamic>) {
      return highlights;
    }

    if (highlights is Map) {
      return highlights.map<String, dynamic>(
            (dynamic key, dynamic value) {
          return MapEntry<String, dynamic>(
            key.toString(),
            value,
          );
        },
      );
    }

    return <String, dynamic>{};
  }

  String _highlightValue(
      Map<String, dynamic> highlights,
      List<String> possibleKeys,
      ) {
    for (final String key in possibleKeys) {
      final String value = _stringValue(highlights[key]);

      if (value.isNotEmpty) {
        return value;
      }
    }

    return 'Not specified';
  }

  static String _stringValue(
      dynamic value, {
        String fallback = '',
      }) {
    if (value == null) {
      return fallback;
    }

    final String result = value.toString().trim();

    if (result.isEmpty) {
      return fallback;
    }

    return result;
  }

  static int _intValue(
      dynamic value, {
        int fallback = 0,
      }) {
    if (value is num) {
      return value.round();
    }

    if (value is String) {
      return double.tryParse(value.trim())?.round() ??
          fallback;
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
      return double.tryParse(value.trim()) ??
          fallback;
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
      final String normalized =
      value.trim().toLowerCase();

      if (normalized == 'true' ||
          normalized == '1') {
        return true;
      }

      if (normalized == 'false' ||
          normalized == '0') {
        return false;
      }
    }

    return fallback;
  }
}