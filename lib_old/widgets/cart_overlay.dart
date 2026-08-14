import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme/app_theme.dart';

void showAddedToCartOverlay(BuildContext context, String name, String image, int qty, int price) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    builder: (ctx) => Container(
      margin: const EdgeInsets.all(12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.cardWhite,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 10)],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.network(image, width: 50, height: 50, fit: BoxFit.cover,
                    errorBuilder: (_, __, ___) => const Icon(Icons.eco, color: AppColors.primaryGreen)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(name, style: GoogleFonts.lexend(fontWeight: FontWeight.w600)),
              ),
              const Icon(Icons.check_circle, color: AppColors.primaryGreen),
            ],
          ),
          const SizedBox(height: 12),
          Text('Qty: $qty  |  ₹${price * qty}',
              style: GoogleFonts.lato(color: AppColors.primaryGreen, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Continue Shopping'),
            ),
          ),
        ],
      ),
    ),
  );
}