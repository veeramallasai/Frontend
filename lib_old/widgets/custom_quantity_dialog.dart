import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/theme/app_theme.dart';
import '../models/product_model.dart';

class CustomQuantityResult {
  const CustomQuantityResult({
    required this.value,
    required this.unit,
    required this.displayText,
    required this.calculatedPrice,
  });

  final double value;
  final String unit;
  final String displayText;
  final int calculatedPrice;
}

Future<CustomQuantityResult?> showCustomQuantityDialog({
  required BuildContext context,
  required ProductModel product,
  required bool shopOwnerMode,
}) async {
  final TextEditingController controller = TextEditingController();
  late final String unit;
  late final String title;
  late final double minimum;

  switch (product.quantityType.trim().toLowerCase()) {
    case 'bunch':
      unit = 'bunches';
      title = 'Enter custom bunches';
      minimum = shopOwnerMode ? 10 : 1;
      break;
    case 'piece':
      unit = 'pieces';
      title = 'Enter custom pieces';
      minimum = shopOwnerMode ? 10 : 1;
      break;
    case 'volume':
      unit = 'L';
      title = 'Enter custom litres';
      minimum = shopOwnerMode ? 10 : 0.5;
      break;
    case 'count':
      unit = 'count';
      title = 'Enter custom count';
      minimum = shopOwnerMode ? 30 : 1;
      break;
    default:
      unit = 'kg';
      title = 'Enter custom weight';
      minimum = shopOwnerMode ? 10 : 0.25;
  }

  final double? value = await showDialog<double>(
    context: context,
    builder: (BuildContext dialogContext) {
      String? errorText;
      return StatefulBuilder(
        builder: (BuildContext context, StateSetter setDialogState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(24),
            ),
            title: Text(
              title,
              style: GoogleFonts.lexend(
                fontWeight: FontWeight.w800,
                color: AppColors.darkText,
              ),
            ),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  shopOwnerMode
                      ? 'Enter the quantity required for your business.'
                      : 'Enter the exact quantity you need.',
                  style: GoogleFonts.lato(color: Colors.grey.shade600),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: controller,
                  autofocus: true,
                  keyboardType: const TextInputType.numberWithOptions(
                    decimal: true,
                  ),
                  decoration: InputDecoration(
                    labelText: 'Quantity',
                    suffixText: unit,
                    errorText: errorText,
                    filled: true,
                    fillColor: const Color(0xFFF7FAF7),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Minimum: $minimum $unit',
                  style: GoogleFonts.lato(
                    color: AppColors.primaryGreen,
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
            actions: <Widget>[
              TextButton(
                onPressed: () => Navigator.pop(dialogContext),
                child: const Text('Cancel'),
              ),
              ElevatedButton(
                onPressed: () {
                  final double? parsed =
                  double.tryParse(controller.text.trim());
                  if (parsed == null || parsed < minimum) {
                    setDialogState(() {
                      errorText = 'Enter at least $minimum $unit';
                    });
                    return;
                  }
                  Navigator.pop(dialogContext, parsed);
                },
                child: const Text('Confirm'),
              ),
            ],
          );
        },
      );
    },
  );

  controller.dispose();
  if (value == null) return null;

  final double basePrice =
  product.discountedPriceForUnit(product.safeDefaultUnit);
  final double baseWeight = product.estimatedWeightKgFor(
    selectedUnit: product.safeDefaultUnit,
    quantity: 1,
  );

  double calculatedPrice;
  if (product.isWeightBased || product.isVolumeBased) {
    final double rate = baseWeight > 0 ? basePrice / baseWeight : basePrice;
    calculatedPrice = rate * value;
  } else {
    calculatedPrice = basePrice * value;
  }

  if (shopOwnerMode) calculatedPrice *= 0.90;

  final String valueText = value == value.roundToDouble()
      ? value.toInt().toString()
      : value.toStringAsFixed(2);

  return CustomQuantityResult(
    value: value,
    unit: unit,
    displayText: '$valueText $unit',
    calculatedPrice: calculatedPrice.round(),
  );
}
