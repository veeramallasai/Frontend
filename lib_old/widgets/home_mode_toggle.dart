import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/theme/app_theme.dart';

enum HomeShoppingMode { forHome, shopOwner }

class HomeModeToggle extends StatelessWidget {
  const HomeModeToggle({
    super.key,
    required this.value,
    required this.onChanged,
  });

  final HomeShoppingMode value;
  final ValueChanged<HomeShoppingMode> onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 18),
      padding: const EdgeInsets.all(6),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: const Color(0xFFE0E8E1)),
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: _ModeItem(
              selected: value == HomeShoppingMode.forHome,
              icon: Icons.home_rounded,
              title: 'For Home',
              subtitle: 'Retail quantities',
              selectedColor: AppColors.primaryGreen,
              onTap: () => onChanged(HomeShoppingMode.forHome),
            ),
          ),
          const SizedBox(width: 7),
          Expanded(
            child: _ModeItem(
              selected: value == HomeShoppingMode.shopOwner,
              icon: Icons.storefront_rounded,
              title: 'For Shop Owners',
              subtitle: 'Bulk prices',
              selectedColor: const Color(0xFF7A4318),
              onTap: () => onChanged(HomeShoppingMode.shopOwner),
            ),
          ),
        ],
      ),
    );
  }
}

class _ModeItem extends StatelessWidget {
  const _ModeItem({
    required this.selected,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.selectedColor,
    required this.onTap,
  });

  final bool selected;
  final IconData icon;
  final String title;
  final String subtitle;
  final Color selectedColor;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: selected ? selectedColor : const Color(0xFFF7FAF7),
      borderRadius: BorderRadius.circular(17),
      child: InkWell(
        borderRadius: BorderRadius.circular(17),
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          height: 64,
          padding: const EdgeInsets.symmetric(horizontal: 11, vertical: 10),
          child: Row(
            children: <Widget>[
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: selected
                      ? Colors.white.withValues(alpha: 0.18)
                      : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: selected ? Colors.white : selectedColor,
                  size: 21,
                ),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      title,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.lexend(
                        color: selected ? Colors.white : AppColors.darkText,
                        fontSize: 12,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.lato(
                        color: selected ? Colors.white70 : Colors.grey.shade600,
                        fontSize: 9,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
