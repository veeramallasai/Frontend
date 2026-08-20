import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class PayNowBar extends StatelessWidget {
  const PayNowBar({
    super.key,
    required this.amount,
    this.isCashOnDelivery = true,
    required this.onPressed,
    this.isProcessing = false,
    this.enabled = true,
  });

  final double amount;
  final bool isCashOnDelivery;
  final VoidCallback onPressed;
  final bool isProcessing;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    final bool canPress = enabled && !isProcessing;

    return Material(
      color: Colors.white,
      elevation: 12,
      shadowColor: const Color(0x22000000),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 12),
          child: Row(
            children: <Widget>[
              Expanded(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      isCashOnDelivery ? 'Amount to pay' : 'Total payable',
                      style: const TextStyle(
                        color: AppColors.textSecondary,
                        fontSize: 9.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '₹${amount.toStringAsFixed(2)}',
                      style: const TextStyle(
                        color: AppColors.textPrimary,
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: SizedBox(
                  height: 50,
                  child: ElevatedButton(
                    onPressed: canPress ? onPressed : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: isProcessing
                        ? const SizedBox(
                            width: 24,
                            height: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2.5,
                            ),
                          )
                        : Text(
                            isCashOnDelivery ? 'PLACE ORDER' : 'PAY NOW',
                            style: const TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
