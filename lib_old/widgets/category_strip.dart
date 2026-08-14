import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/theme/app_theme.dart';

class CategoryStripItem {
  const CategoryStripItem({
    required this.name,
    required this.image,
    required this.icon,
  });

  final String name;
  final String image;
  final IconData icon;
}

class CategoryStrip extends StatelessWidget {
  const CategoryStrip({
    super.key,
    required this.items,
    required this.selectedCategory,
    required this.onSelected,
  });

  final List<CategoryStripItem> items;
  final String selectedCategory;
  final ValueChanged<String> onSelected;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 118,
      child: ListView.separated(
        padding: const EdgeInsets.symmetric(horizontal: 18),
        scrollDirection: Axis.horizontal,
        physics: const ClampingScrollPhysics(),
        itemCount: items.length,
        separatorBuilder: (_, __) => const SizedBox(width: 14),
        itemBuilder: (BuildContext context, int index) {
          final CategoryStripItem item = items[index];
          final bool selected = item.name == selectedCategory;

          return InkWell(
            borderRadius: BorderRadius.circular(18),
            onTap: () => onSelected(item.name),
            child: SizedBox(
              width: 72,
              child: Column(
                children: <Widget>[
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      color: selected
                          ? AppColors.lightMint
                          : const Color(0xFFF7FAF7),
                      shape: BoxShape.circle,
                      border: Border.all(
                        color: selected
                            ? AppColors.primaryGreen
                            : const Color(0xFFE3EAE4),
                        width: selected ? 1.5 : 1,
                      ),
                    ),
                    padding: const EdgeInsets.all(10),
                    child: item.image.isEmpty
                        ? Icon(item.icon,
                        color: AppColors.primaryGreen, size: 30)
                        : Image.asset(
                      item.image,
                      fit: BoxFit.contain,
                      errorBuilder: (_, __, ___) => Icon(
                        item.icon,
                        color: AppColors.primaryGreen,
                        size: 30,
                      ),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    item.name,
                    maxLines: 2,
                    textAlign: TextAlign.center,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.lato(
                      color: selected
                          ? AppColors.primaryGreen
                          : AppColors.darkText,
                      fontSize: 10.5,
                      fontWeight:
                      selected ? FontWeight.w800 : FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
