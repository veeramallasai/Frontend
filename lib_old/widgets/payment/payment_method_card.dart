import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../models/payment_model.dart';

class PaymentMethodCard extends StatelessWidget {
  final PaymentMethodType method;
  final bool selected;
  final bool recommended;
  final String subtitle;
  final VoidCallback onTap;

  const PaymentMethodCard({
    super.key,
    required this.method,
    required this.selected,
    required this.onTap,
    this.recommended = false,
    this.subtitle = '',
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? AppColors.lightMint : Colors.white,
      borderRadius: BorderRadius.circular(18),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(18),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(18),
            border: Border.all(
              color: selected
                  ? AppColors.primaryGreen
                  : const Color(0xFFE2EAE3),
              width: selected ? 1.5 : 1,
            ),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: selected
                      ? AppColors.primaryGreen
                      : AppColors.lightCream,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Icon(
                  _iconFor(method),
                  color: selected
                      ? Colors.white
                      : AppColors.primaryGreen,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Flexible(
                          child: Text(
                            _labelFor(method),
                            style: GoogleFonts.lexend(
                              color: AppColors.darkText,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        if (recommended) ...<Widget>[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 7,
                              vertical: 3,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFF8E1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'RECOMMENDED',
                              style: GoogleFonts.lato(
                                color: AppColors.goldAmber,
                                fontSize: 8,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (subtitle.trim().isNotEmpty) ...<Widget>[
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          fontSize: 11,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Icon(
                selected
                    ? Icons.radio_button_checked_rounded
                    : Icons.radio_button_off_rounded,
                color: selected
                    ? AppColors.primaryGreen
                    : Colors.grey.shade400,
              ),
            ],
          ),
        ),
      ),
    );
  }

  static String _labelFor(PaymentMethodType method) {
    switch (method) {
      case PaymentMethodType.upi:
        return 'UPI';
      case PaymentMethodType.googlePay:
        return 'Google Pay';
      case PaymentMethodType.phonePe:
        return 'PhonePe';
      case PaymentMethodType.paytm:
        return 'Paytm';
      case PaymentMethodType.creditCard:
        return 'Credit Card';
      case PaymentMethodType.debitCard:
        return 'Debit Card';
      case PaymentMethodType.netBanking:
        return 'Net Banking';
      case PaymentMethodType.cashOnDelivery:
        return 'Cash on Delivery';
      case PaymentMethodType.farmWallet:
        return 'Farm Wallet';
    }
  }

  static IconData _iconFor(PaymentMethodType method) {
    switch (method) {
      case PaymentMethodType.upi:
      case PaymentMethodType.googlePay:
      case PaymentMethodType.phonePe:
      case PaymentMethodType.paytm:
        return Icons.qr_code_2_rounded;
      case PaymentMethodType.creditCard:
      case PaymentMethodType.debitCard:
        return Icons.credit_card_rounded;
      case PaymentMethodType.netBanking:
        return Icons.account_balance_rounded;
      case PaymentMethodType.cashOnDelivery:
        return Icons.payments_outlined;
      case PaymentMethodType.farmWallet:
        return Icons.account_balance_wallet_outlined;
    }
  }
}
