import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/theme/app_theme.dart';
import '../models/product_model.dart';
import '../services/cart_service.dart';
import 'custom_quantity_dialog.dart';

class ProductCard extends StatefulWidget {
  const ProductCard({
    super.key,
    required this.product,
    required this.cartService,
    required this.shopOwnerMode,
    required this.onTap,
    this.onWishlist,
    this.isWishlisted = false,
  });

  final ProductModel product;
  final CartService cartService;
  final bool shopOwnerMode;
  final VoidCallback onTap;
  final VoidCallback? onWishlist;
  final bool isWishlisted;

  @override
  State<ProductCard> createState() => _ProductCardState();
}

class _ProductCardState extends State<ProductCard> {
  late String _selectedUnit;
  double? _customValue;
  String _customUnit = 'kg';
  int? _customPrice;

  @override
  void initState() {
    super.initState();
    _selectedUnit = _initialUnit();
    widget.cartService.addListener(_refresh);
  }

  @override
  void didUpdateWidget(covariant ProductCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.product.id != widget.product.id ||
        oldWidget.shopOwnerMode != widget.shopOwnerMode) {
      _selectedUnit = _initialUnit();
      _customValue = null;
      _customPrice = null;
    }
    if (oldWidget.cartService != widget.cartService) {
      oldWidget.cartService.removeListener(_refresh);
      widget.cartService.addListener(_refresh);
    }
  }

  @override
  void dispose() {
    widget.cartService.removeListener(_refresh);
    super.dispose();
  }

  void _refresh() {
    if (mounted) setState(() {});
  }

  String _initialUnit() {
    return widget.shopOwnerMode
        ? _bulkUnits.first
        : widget.product.safeDefaultUnit;
  }

  List<String> get _bulkUnits {
    switch (widget.product.quantityType.trim().toLowerCase()) {
      case 'bunch':
        return const <String>[
          '10 bunches', '20 bunches', '50 bunches',
          '100 bunches', 'Custom Bunches',
        ];
      case 'piece':
        return const <String>[
          '10 pieces', '20 pieces', '50 pieces',
          '100 pieces', 'Custom Pieces',
        ];
      case 'volume':
        return const <String>[
          '10 L', '20 L', '50 L', '100 L', 'Custom Litres',
        ];
      case 'count':
        return const <String>[
          '30 count', '60 count', '120 count',
          '300 count', 'Custom Count',
        ];
      default:
        return const <String>[
          '10 kg', '20 kg', '25 kg', '50 kg',
          '100 kg', 'Custom Weight',
        ];
    }
  }

  List<String> get _units => widget.shopOwnerMode
      ? _bulkUnits
      : widget.product.safeAvailableUnits;

  int get _price {
    if (_customPrice != null) return _customPrice!;
    final double value =
    widget.product.discountedPriceForUnit(_selectedUnit);
    return widget.shopOwnerMode
        ? (value * 0.90).round()
        : value.round();
  }

  int get _mrp {
    if (_customPrice != null) return (_customPrice! / 0.90).round();
    return widget.product.mrpForUnit(_selectedUnit).round();
  }

  int get _quantity => widget.cartService.getQuantity(
    widget.product.name,
    productId: widget.product.id,
    teluguName: widget.product.teluguName,
    weight: _selectedUnit,
  );

  int get _discountPercent {
    if (_mrp <= _price || _mrp <= 0) return 0;
    return (((_mrp - _price) / _mrp) * 100).round();
  }

  Future<void> _chooseUnit() async {
    final String? selected = await showModalBottomSheet<String>(
      context: context,
      useSafeArea: true,
      showDragHandle: true,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (BuildContext sheetContext) {
        return FractionallySizedBox(
          heightFactor: 0.78,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 4, 20, 14),
                child: Text(
                  widget.shopOwnerMode
                      ? 'Choose bulk quantity'
                      : 'Choose quantity',
                  style: GoogleFonts.lexend(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: AppColors.darkText,
                  ),
                ),
              ),
              Expanded(
                child: ListView.separated(
                  padding: const EdgeInsets.fromLTRB(18, 0, 18, 24),
                  itemCount: _units.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (BuildContext context, int index) {
                    final String unit = _units[index];
                    final bool custom =
                    unit.toLowerCase().startsWith('custom');
                    final bool selectedUnit = unit == _selectedUnit;

                    return Material(
                      color: selectedUnit
                          ? AppColors.lightMint
                          : const Color(0xFFF7FAF7),
                      borderRadius: BorderRadius.circular(16),
                      child: InkWell(
                        borderRadius: BorderRadius.circular(16),
                        onTap: () => Navigator.pop(sheetContext, unit),
                        child: Container(
                          constraints: const BoxConstraints(minHeight: 64),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 14,
                            vertical: 12,
                          ),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(
                              color: selectedUnit
                                  ? AppColors.primaryGreen
                                  : const Color(0xFFE0E7E1),
                            ),
                          ),
                          child: Row(
                            children: <Widget>[
                              Icon(
                                custom
                                    ? Icons.edit_rounded
                                    : Icons.scale_outlined,
                                color: AppColors.primaryGreen,
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Text(
                                  unit,
                                  style: GoogleFonts.lexend(
                                    fontSize: 14,
                                    fontWeight: FontWeight.w700,
                                  ),
                                ),
                              ),
                              if (custom)
                                Text(
                                  'ENTER',
                                  style: GoogleFonts.lexend(
                                    color: AppColors.primaryGreen,
                                    fontSize: 9,
                                    fontWeight: FontWeight.w800,
                                  ),
                                )
                              else if (selectedUnit)
                                const Icon(
                                  Icons.check_circle_rounded,
                                  color: AppColors.primaryGreen,
                                ),
                            ],
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );

    if (selected == null || !mounted) return;

    if (selected.toLowerCase().startsWith('custom')) {
      final CustomQuantityResult? result =
      await showCustomQuantityDialog(
        context: context,
        product: widget.product,
        shopOwnerMode: widget.shopOwnerMode,
      );
      if (result == null || !mounted) return;
      setState(() {
        _customValue = result.value;
        _customUnit = result.unit;
        _customPrice = result.calculatedPrice;
        _selectedUnit = result.displayText;
      });
      return;
    }

    setState(() {
      _selectedUnit = selected;
      _customValue = null;
      _customPrice = null;
    });
  }

  void _addOne() {
    if (!widget.product.isAvailable) return;
    widget.cartService.addItem(
      widget.product.name,
      widget.product.image,
      _price,
      productId: widget.product.id,
      teluguName: widget.product.teluguName,
      weight: _selectedUnit,
      category: widget.product.category,
      categoryTelugu: widget.product.categoryTelugu,
      farmerId: widget.product.farmerId,
      farmerName: widget.product.farmerName,
      farmName: widget.product.farmName,
      organic: widget.product.organic,
      rating: widget.product.rating,
      isQuick: false,
      quickDeliveryMinutes: 0,
      minimumQuickQuantity: 1,
      quickAvailableStock: widget.product.quickAvailableStock,
      availableUnits: _units,
      availableDeliveryDays: widget.product.availableDeliveryDays,
      normalDeliveryNote: widget.product.normalDeliveryNote,
      isPreOrder: widget.product.canPreOrder,
      harvestDate: widget.product.activeHarvestDate,
      expectedDeliveryDate: widget.product.expectedDeliveryDate,
      deliverySlot: widget.product.availableDeliverySlots.isNotEmpty
          ? widget.product.availableDeliverySlots.first
          : '',
      quantityType: widget.product.quantityType,
      isCustomQuantity: _customValue != null,
      selectedQuantityValue: _customValue ?? 0,
      selectedQuantityUnit: _customValue == null ? '' : _customUnit,
      approximateWeightPerUnitKg:
      widget.product.safeApproximateWeightPerUnitKg,
    );
  }

  void _removeOne() {
    widget.cartService.removeOne(
      widget.product.name,
      productId: widget.product.id,
      teluguName: widget.product.teluguName,
      weight: _selectedUnit,
    );
  }

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: Material(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        child: InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: widget.onTap,
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE7ECE8)),
              boxShadow: const <BoxShadow>[
                BoxShadow(
                  color: Color(0x08000000),
                  blurRadius: 10,
                  offset: Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                AspectRatio(
                  aspectRatio: 1.02,
                  child: Stack(
                    children: <Widget>[
                      Positioned.fill(
                        child: ClipRRect(
                          borderRadius: const BorderRadius.vertical(
                            top: Radius.circular(20),
                          ),
                          child: Container(
                            color: const Color(0xFFF7FAF7),
                            padding: const EdgeInsets.all(12),
                            child: Image.asset(
                              widget.product.image,
                              fit: BoxFit.contain,
                              errorBuilder: (_, __, ___) => const Center(
                                child: Icon(
                                  Icons.image_not_supported_outlined,
                                  size: 42,
                                  color: Color(0xFFB7C2B9),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                      if (_discountPercent > 0)
                        Positioned(
                          top: 9,
                          left: 9,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 5,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFDFF3E5),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '$_discountPercent% OFF',
                              style: GoogleFonts.lexend(
                                color: AppColors.primaryGreen,
                                fontSize: 8,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ),
                      Positioned(
                        top: 7,
                        right: 7,
                        child: IconButton.filledTonal(
                          visualDensity: VisualDensity.compact,
                          onPressed: widget.onWishlist,
                          icon: Icon(
                            widget.isWishlisted
                                ? Icons.favorite_rounded
                                : Icons.favorite_border_rounded,
                            color: widget.isWishlisted
                                ? Colors.redAccent
                                : AppColors.primaryGreen,
                            size: 19,
                          ),
                        ),
                      ),
                      if (!widget.product.isAvailable)
                        Positioned.fill(
                          child: Container(
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.78),
                              borderRadius: const BorderRadius.vertical(
                                top: Radius.circular(20),
                              ),
                            ),
                            alignment: Alignment.center,
                            child: Text(
                              'OUT OF STOCK',
                              style: GoogleFonts.lexend(
                                color: Colors.redAccent,
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
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(12, 10, 12, 12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Row(
                          children: <Widget>[
                            Icon(
                              Icons.star_rounded,
                              color: Colors.amber.shade700,
                              size: 15,
                            ),
                            const SizedBox(width: 3),
                            Text(
                              widget.product.rating.toStringAsFixed(1),
                              style: GoogleFonts.lato(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w700,
                                color: Colors.grey.shade700,
                              ),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 7,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: widget.shopOwnerMode
                                    ? const Color(0xFFFFF2E7)
                                    : AppColors.lightMint,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                widget.shopOwnerMode ? 'WHOLESALE' : 'RETAIL',
                                style: GoogleFonts.lexend(
                                  color: widget.shopOwnerMode
                                      ? const Color(0xFF7A4318)
                                      : AppColors.primaryGreen,
                                  fontSize: 7,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 7),
                        Text(
                          widget.product.name,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.lexend(
                            color: AppColors.darkText,
                            fontSize: 13.5,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        if (widget.product.teluguName.trim().isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Text(
                            widget.product.teluguName,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                            style: GoogleFonts.notoSansTelugu(
                              color: Colors.grey.shade600,
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                        const SizedBox(height: 8),
                        InkWell(
                          borderRadius: BorderRadius.circular(10),
                          onTap: _chooseUnit,
                          child: Container(
                            width: double.infinity,
                            padding: const EdgeInsets.symmetric(
                              horizontal: 9,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF7FAF7),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                color: const Color(0xFFE1E8E2),
                              ),
                            ),
                            child: Row(
                              children: <Widget>[
                                Expanded(
                                  child: Text(
                                    _selectedUnit,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: GoogleFonts.lato(
                                      color: AppColors.darkText,
                                      fontSize: 10.5,
                                      fontWeight: FontWeight.w700,
                                    ),
                                  ),
                                ),
                                const Icon(
                                  Icons.keyboard_arrow_down_rounded,
                                  size: 18,
                                  color: AppColors.primaryGreen,
                                ),
                              ],
                            ),
                          ),
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
                                    '₹$_price',
                                    style: GoogleFonts.lexend(
                                      color: AppColors.darkText,
                                      fontSize: 16,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  if (_mrp > _price)
                                    Text(
                                      '₹$_mrp',
                                      style: GoogleFonts.lato(
                                        color: Colors.grey.shade500,
                                        fontSize: 10,
                                        decoration: TextDecoration.lineThrough,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            _quantity == 0
                                ? SizedBox(
                              height: 36,
                              child: ElevatedButton(
                                onPressed: widget.product.isAvailable
                                    ? _addOne
                                    : null,
                                style: ElevatedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 14,
                                  ),
                                  backgroundColor: AppColors.primaryGreen,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                                child: Text(
                                  'ADD',
                                  style: GoogleFonts.lexend(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                            )
                                : Container(
                              height: 36,
                              decoration: BoxDecoration(
                                color: AppColors.primaryGreen,
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: <Widget>[
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    onPressed: _removeOne,
                                    icon: const Icon(
                                      Icons.remove_rounded,
                                      color: Colors.white,
                                      size: 18,
                                    ),
                                  ),
                                  Text(
                                    '$_quantity',
                                    style: GoogleFonts.lexend(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.w800,
                                    ),
                                  ),
                                  IconButton(
                                    visualDensity: VisualDensity.compact,
                                    onPressed: _addOne,
                                    icon: const Icon(
                                      Icons.add_rounded,
                                      color: Colors.white,
                                      size: 18,
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
              ],
            ),
          ),
        ),
      ),
    );
  }
}
