import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';
import 'card_option.dart';
import 'cod_option.dart';
import 'upi_option.dart';

enum PaymentMethodType {
  cashOnDelivery,
  googlePay,
  phonePe,
  upi,
  card,
  netBanking,
}

extension PaymentMethodTypeValue on PaymentMethodType {
  String get value {
    switch (this) {
      case PaymentMethodType.cashOnDelivery:
        return 'cash_on_delivery';
      case PaymentMethodType.googlePay:
        return 'google_pay';
      case PaymentMethodType.phonePe:
        return 'phone_pe';
      case PaymentMethodType.upi:
        return 'upi';
      case PaymentMethodType.card:
        return 'card';
      case PaymentMethodType.netBanking:
        return 'net_banking';
    }
  }
}

class PaymentMethodSelector extends StatelessWidget {
  const PaymentMethodSelector({
    super.key,
    required this.selectedMethod,
    ValueChanged<PaymentMethodType>? onChanged,
    ValueChanged<PaymentMethodType>? onMethodSelected,
    this.enabled = true,
  }) : onChanged = onChanged ?? onMethodSelected ?? _noop;

  static void _noop(PaymentMethodType _) {}

  final PaymentMethodType selectedMethod;
  final ValueChanged<PaymentMethodType> onChanged;
  final bool enabled;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        const Text(
          'Choose Payment Method',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 18,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 16),
        CodOption(
          selected: selectedMethod == PaymentMethodType.cashOnDelivery,
          onSelect: () => onChanged(PaymentMethodType.cashOnDelivery),
          enabled: enabled,
        ),
        const SizedBox(height: 12),
        UpiOption(
          selected: selectedMethod == PaymentMethodType.upi ||
              selectedMethod == PaymentMethodType.googlePay ||
              selectedMethod == PaymentMethodType.phonePe,
          onSelect: () => onChanged(PaymentMethodType.upi),
          enabled: enabled,
        ),
        const SizedBox(height: 12),
        CardOption(
          selected: selectedMethod == PaymentMethodType.card,
          onSelect: () => onChanged(PaymentMethodType.card),
          enabled: enabled,
        ),
      ],
    );
  }
}
