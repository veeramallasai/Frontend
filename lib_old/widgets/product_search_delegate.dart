import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../core/theme/app_theme.dart';
import '../data/local_product_catalog.dart';
import '../screens/product/product_details_screen.dart';

class ProductSearchDelegate
    extends SearchDelegate<Map<String, dynamic>?> {
  ProductSearchDelegate(this.allProducts);

  final List<Map<String, dynamic>> allProducts;

  @override
  String get searchFieldLabel =>
      'Search fresh vegetables, fruits...';

  @override
  ThemeData appBarTheme(BuildContext context) {
    return Theme.of(context).copyWith(
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      inputDecorationTheme: const InputDecorationTheme(
        hintStyle: TextStyle(color: Colors.white70),
        border: InputBorder.none,
      ),
    );
  }

  @override
  List<Widget>? buildActions(BuildContext context) {
    return <Widget>[
      if (query.isNotEmpty)
        IconButton(
          icon: const Icon(Icons.clear),
          onPressed: () {
            query = '';
            showSuggestions(context);
          },
        ),
    ];
  }

  @override
  Widget? buildLeading(BuildContext context) {
    return IconButton(
      icon: const Icon(Icons.arrow_back),
      onPressed: () => close(context, null),
    );
  }

  @override
  Widget buildResults(BuildContext context) {
    return _buildSearchResults(context);
  }

  @override
  Widget buildSuggestions(BuildContext context) {
    return _buildSearchResults(context);
  }

  Widget _buildSearchResults(BuildContext context) {
    final String normalizedQuery = query.trim().toLowerCase();

    final List<Map<String, dynamic>> results =
    normalizedQuery.isEmpty
        ? <Map<String, dynamic>>[]
        : allProducts.where((Map<String, dynamic> product) {
      final String name =
          product['name']?.toString().toLowerCase() ?? '';
      final String teluguName =
          product['teluguName']
              ?.toString()
              .toLowerCase() ??
              '';
      final String category =
          product['category']
              ?.toString()
              .toLowerCase() ??
              '';

      return name.contains(normalizedQuery) ||
          teluguName.contains(normalizedQuery) ||
          category.contains(normalizedQuery);
    }).toList(growable: false);

    if (normalizedQuery.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.search,
              size: 80,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'Search for fresh products',
              style: GoogleFonts.lato(
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
      );
    }

    if (results.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Icon(
              Icons.search_off,
              size: 80,
              color: Colors.grey.shade300,
            ),
            const SizedBox(height: 16),
            Text(
              'No products found',
              style: GoogleFonts.lato(
                fontSize: 16,
                color: Colors.grey.shade500,
              ),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(12),
      itemCount: results.length,
      itemBuilder: (BuildContext context, int index) {
        final Map<String, dynamic> product = results[index];

        return Card(
          elevation: 1,
          shadowColor: Colors.black12,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(14),
          ),
          margin: const EdgeInsets.only(bottom: 8),
          child: ListTile(
            leading: ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: _searchImage(product),
            ),
            title: Text(
              product['name']?.toString() ?? 'No Name',
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: GoogleFonts.lato(
                fontWeight: FontWeight.w700,
              ),
            ),
            subtitle: Text(
              '₹${product['price'] ?? 0}',
              style: GoogleFonts.lexend(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.w700,
              ),
            ),
            onTap: () {
              close(context, product);
            },
          ),
        );
      },
    );
  }

  Widget _searchImage(Map<String, dynamic> product) {
    final String image = LocalProductCatalog.imageFor(
      name: product['name']?.toString() ?? '',
      preferredImage: product['image']?.toString(),
    );

    if (image.startsWith('assets/')) {
      return Image.asset(
        image,
        width: 50,
        height: 50,
        fit: BoxFit.contain,
        errorBuilder: (_, __, ___) {
          return const Icon(
            Icons.eco,
            color: AppColors.primaryGreen,
          );
        },
      );
    }

    return Image.network(
      image,
      width: 50,
      height: 50,
      fit: BoxFit.cover,
      errorBuilder: (_, __, ___) {
        return const Icon(
          Icons.eco,
          color: AppColors.primaryGreen,
        );
      },
    );
  }
}
