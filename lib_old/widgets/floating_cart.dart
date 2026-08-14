import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/theme/app_theme.dart';
import '../services/cart_service.dart';

class FloatingCartBar extends StatefulWidget {
  const FloatingCartBar({
    super.key,
    required this.cartService,
    required this.onTap,
  });

  final CartService cartService;
  final VoidCallback onTap;

  @override
  State<FloatingCartBar> createState() => _FloatingCartBarState();
}

class _FloatingCartBarState extends State<FloatingCartBar> {
  @override
  void initState() {
    super.initState();
    widget.cartService.addListener(_refresh);
  }

  @override
  void didUpdateWidget(covariant FloatingCartBar oldWidget) {
    super.didUpdateWidget(oldWidget);
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

  @override
  Widget build(BuildContext context) {
    if (widget.cartService.isEmpty) return const SizedBox.shrink();

    return SafeArea(
      minimum: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      child: Material(
        color: AppColors.primaryGreen,
        borderRadius: BorderRadius.circular(18),
        elevation: 10,
        child: InkWell(
          borderRadius: BorderRadius.circular(18),
          onTap: widget.onTap,
          child: Container(
            height: 62,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: <Widget>[
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.16),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.shopping_cart_rounded,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      Text(
                        '${widget.cartService.totalItemCount} items',
                        style: GoogleFonts.lexend(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.cartService.automaticDeliveryModeLabel,
                        style: GoogleFonts.lato(
                          color: Colors.white70,
                          fontSize: 10.5,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                Text(
                  '₹${widget.cartService.totalAmount}',
                  style: GoogleFonts.lexend(
                    color: Colors.white,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.arrow_forward_rounded, color: Colors.white),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
