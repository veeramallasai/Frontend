import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class ProfileShoppingModeCard extends StatelessWidget {
  ProfileShoppingModeCard({
    super.key,
    String mode = 'home',
    String? shoppingMode,
    ValueChanged<String>? onChanged,
    VoidCallback? onSelectHome,
    VoidCallback? onSelectShop,
    bool loading = false,
    bool? updating,
  })  : mode = shoppingMode ?? mode,
        onChanged = onChanged ?? _makeOnChanged(onSelectHome, onSelectShop),
        loading = updating ?? loading;

  static ValueChanged<String> _makeOnChanged(VoidCallback? home, VoidCallback? shop) {
    return (String value) {
      if (value == 'home' && home != null) home();
      if (value == 'shop' && shop != null) shop();
    };
  }

  final String mode;
  final ValueChanged<String> onChanged;
  final bool loading;

  @override
  Widget build(BuildContext context) {
    final bool home = mode != 'shop';
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[Color(0xFFFFFFFF), Color(0xFFF2FAF5)],
        ),
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFDDEBE3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Icon(Icons.swap_horiz_rounded, color: AppColors.primary),
              const SizedBox(width: 9),
              const Expanded(
                child: Text(
                  'Shopping mode',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              if (loading)
                const SizedBox(
                  width: 16,
                  height: 16,
                  child: CircularProgressIndicator(strokeWidth: 2),
                ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: <Widget>[
              ChoiceChip(
                label: const Text('Home'),
                selected: home,
                onSelected: (_) => onChanged('home'),
              ),
              const SizedBox(width: 10),
              ChoiceChip(
                label: const Text('Shop / Bulk'),
                selected: !home,
                onSelected: (_) => onChanged('shop'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
