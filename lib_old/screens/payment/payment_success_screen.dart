import 'package:animate_do/animate_do.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../models/payment_model.dart';
import '../orders/order_success_screen.dart';

class PaymentSuccessScreen extends StatelessWidget {
  final PaymentModel payment;

  const PaymentSuccessScreen({
    super.key,
    required this.payment,
  });

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF7FAF7),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(22),
          child: Column(
            children: <Widget>[
              const SizedBox(height: 34),
              BounceInDown(
                child: Container(
                  width: 128,
                  height: 128,
                  decoration: const BoxDecoration(
                    color: AppColors.lightMint,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check_circle_rounded,
                    color: AppColors.primaryGreen,
                    size: 86,
                  ),
                ),
              ),
              const SizedBox(height: 22),
              FadeInUp(
                child: Text(
                  payment.method == PaymentMethodType.cashOnDelivery
                      ? 'Order Confirmed!'
                      : 'Payment Successful!',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 26,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              const SizedBox(height: 9),
              FadeInUp(
                delay: const Duration(milliseconds: 180),
                child: Text(
                  payment.method == PaymentMethodType.cashOnDelivery
                      ? 'Pay when your fresh farm products arrive.'
                      : 'Your payment has been processed securely.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 14,
                    height: 1.45,
                  ),
                ),
              ),
              const SizedBox(height: 28),
              FadeInUp(
                delay: const Duration(milliseconds: 260),
                child: _buildReceiptCard(context),
              ),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute<void>(
                        builder: (_) => const OrderSuccessScreen(),
                      ),
                    );
                  },
                  icon: const Icon(Icons.receipt_long_rounded),
                  label: const Text('VIEW ORDER SUCCESS'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildReceiptCard(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: const Color(0xFFE2EAE3),
        ),
      ),
      child: Column(
        children: <Widget>[
          _row('Payment method', payment.methodLabel),
          _row(
            'Amount paid',
            '₹${payment.totalAmount.toStringAsFixed(0)}',
          ),
          _row('Status', payment.statusLabel),
          _row(
            'Order ID',
            payment.orderId,
            copyValue: payment.orderId,
          ),
          _row(
            'Transaction ID',
            payment.transactionId,
            copyValue: payment.transactionId,
          ),
        ],
      ),
    );
  }

  Widget _row(
      String label,
      String value, {
        String? copyValue,
      }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 13),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 12,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: <Widget>[
                Flexible(
                  child: Text(
                    value,
                    textAlign: TextAlign.right,
                    style: GoogleFonts.lexend(
                      color: AppColors.darkText,
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
                if (copyValue != null && copyValue.trim().isNotEmpty) ...<Widget>[
                  const SizedBox(width: 4),
                  IconButton(
                    tooltip: 'Copy',
                    onPressed: () {
                      Clipboard.setData(
                        ClipboardData(text: copyValue),
                      );
                    },
                    icon: const Icon(
                      Icons.copy_rounded,
                      size: 17,
                      color: AppColors.primaryGreen,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}
