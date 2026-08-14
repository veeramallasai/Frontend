import 'package:flutter/material.dart';
import '../../constants/app_colors.dart';
import '../../constants/api_endpoints.dart';
import '../../models/product_models.dart';
import '../../services/api_client.dart';
import '../product/product_details_screen.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  List<Product> _results = [];
  bool _isLoading = false;
  bool _organicOnly = false;
  double _minPrice = 0.0;
  double _maxPrice = 1000.0;

  void _search() async {
    setState(() => _isLoading = true);
    try {
      final query = _searchController.text.trim();
      String url = '${ApiEndpoints.products}?query=$query';
      if (_organicOnly) url += '&organic=true';
      if (_minPrice > 0) url += '&minPrice=$_minPrice';
      if (_maxPrice < 1000) url += '&maxPrice=$_maxPrice';

      final List<dynamic> data = await ApiClient.get(url);
      setState(() {
        _results = data.map((json) => Product.fromJson(json)).toList();
      });
    } catch (_) {
      // Graceful error logging
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _showFilters() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setModalState) {
            return Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Filter Products', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 16),
                  CheckboxListTile(
                    title: const Text('Organic Products Only'),
                    value: _organicOnly,
                    activeColor: AppColors.primary,
                    onChanged: (val) {
                      if (val != null) {
                        setModalState(() => _organicOnly = val);
                        setState(() => _organicOnly = val);
                      }
                    },
                  ),
                  const SizedBox(height: 16),
                  Text('Price Range: ₹${_minPrice.round()} - ₹${_maxPrice.round()}'),
                  RangeSlider(
                    values: RangeValues(_minPrice, _maxPrice),
                    min: 0.0,
                    max: 1000.0,
                    divisions: 20,
                    activeColor: AppColors.primary,
                    labels: RangeLabels('₹${_minPrice.round()}', '₹${_maxPrice.round()}'),
                    onChanged: (values) {
                      setModalState(() {
                        _minPrice = values.start;
                        _maxPrice = values.end;
                      });
                      setState(() {
                        _minPrice = values.start;
                        _maxPrice = values.end;
                      });
                    },
                  ),
                  const SizedBox(height: 16),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                      onPressed: () {
                        Navigator.pop(context);
                        _search();
                      },
                      child: const Text('APPLY FILTERS'),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: TextField(
          controller: _searchController,
          style: const TextStyle(color: Colors.white),
          decoration: const InputDecoration(
            hintText: 'Search fresh goods...',
            hintStyle: TextStyle(color: Colors.white60),
            border: InputBorder.none,
          ),
          onSubmitted: (_) => _search(),
        ),
        actions: [
          IconButton(icon: const Icon(Icons.filter_list), onPressed: _showFilters),
          IconButton(icon: const Icon(Icons.search), onPressed: _search),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : _results.isEmpty
              ? const Center(child: Text('No products found matching search', style: TextStyle(color: AppColors.textLight)))
              : ListView.builder(
                  padding: const EdgeInsets.all(16.0),
                  itemCount: _results.length,
                  itemBuilder: (ctx, idx) {
                    final product = _results[idx];
                    return Card(
                      color: Colors.white,
                      elevation: 1,
                      margin: const EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: const CircleAvatar(
                          backgroundColor: AppColors.background,
                          child: Icon(Icons.eco, color: AppColors.primary),
                        ),
                        title: Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: Text('₹${product.activePrice} / ${product.weight} ${product.unit}'),
                        trailing: const Icon(Icons.chevron_right),
                        onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(builder: (_) => ProductDetailsScreen(product: product)),
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
