import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';

class PaymentSummaryCard extends StatelessWidget {
  final double subtotal;
  final double discount;
  final double deliveryCharge;
  final double platformFee;
  final double walletAmount;
  final double totalAmount;
  final String couponCode;

  const PaymentSummaryCard({
    super.key,
    required this.subtotal,
    required this.discount,
    required this.deliveryCharge,
    required this.platformFee,
    required this.walletAmount,
    required this.totalAmount,
    this.couponCode = '',
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: const Color(0xFFE2EAE3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            'Payment Summary',
            style: GoogleFonts.lexend(
              color: AppColors.darkText,
              fontSize: 17,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 15),
          _row('Subtotal', subtotal),
          if (discount > 0)
            _row(
              couponCode.trim().isEmpty
                  ? 'Discount'
                  : 'Discount ($couponCode)',
              -discount,
              highlight: true,
            ),
          _row('Delivery charge', deliveryCharge),
          _row('Platform fee', platformFee),
          if (walletAmount > 0)
            _row(
              'Farm Wallet',
              -walletAmount,
              highlight: true,
            ),
          const Divider(height: 24),
          Row(
            children: <Widget>[
              Expanded(
                child: Text(
                  'Total Payable',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 15,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              Text(
                '₹${totalAmount.toStringAsFixed(0)}',
                style: GoogleFonts.lexend(
                  color: AppColors.primaryGreen,
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _row(
      String label,
      double amount, {
        bool highlight = false,
      }) {
    final bool negative = amount < 0;
    final String sign = negative ? '-' : '';

    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.lato(
                color: Colors.grey.shade700,
                fontSize: 13,
              ),
            ),
          ),
          Text(
            '$sign₹${amount.abs().toStringAsFixed(0)}',
            style: GoogleFonts.lato(
              color: highlight
                  ? AppColors.primaryGreen
                  : AppColors.darkText,
              fontSize: 13,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }
}
