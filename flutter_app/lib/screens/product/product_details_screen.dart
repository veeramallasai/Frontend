import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../models/product_models.dart';
import '../../providers/cart_provider.dart';

class ProductDetailsScreen extends StatefulWidget {
  final Product product;

  const ProductDetailsScreen({super.key, required this.product});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  int _quantity = 1;
  bool _isAdding = false;

  void _addToCart() async {
    setState(() => _isAdding = true);
    try {
      await Provider.of<CartProvider>(context, listen: false)
          .addItemToCart(widget.product.id, _quantity);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Added $_quantity x ${widget.product.name} to Cart'),
          backgroundColor: AppColors.primary,
        ),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
      );
    } finally {
      setState(() => _isAdding = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.product;
    final isOutOfStock = p.quantity <= 0;

    return Scaffold(
      appBar: AppBar(title: Text(p.name)),
      body: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              height: 250,
              width: double.infinity,
              color: AppColors.primary.withOpacity(0.05),
              child: const Center(
                child: Icon(Icons.eco, size: 100, color: AppColors.primary),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(20.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          p.name,
                          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.textDark),
                        ),
                      ),
                      if (p.organic)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: Colors.green.shade800,
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: const Text('ORGANIC', style: TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Text('${p.weight} ${p.unit}', style: const TextStyle(fontSize: 16, color: AppColors.textLight)),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      Text(
                        '₹${p.activePrice}',
                        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                      const SizedBox(width: 12),
                      if (p.hasDiscount) ...[
                        Text(
                          '₹${p.price}',
                          style: const TextStyle(fontSize: 18, decoration: TextDecoration.lineThrough, color: AppColors.textLight),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Save ₹${p.savingPerUnit.toStringAsFixed(2)}',
                          style: const TextStyle(color: AppColors.error, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 20),
                  Text(
                    p.description.isNotEmpty ? p.description : 'Fresh produce sourced directly from local organic farms. Cleaned, packed, and delivered to preserve nutrients and freshness.',
                    style: const TextStyle(color: AppColors.textDark, height: 1.5),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      const Text('Stock Status: ', style: TextStyle(fontWeight: FontWeight.bold)),
                      Text(
                        isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK (${p.quantity} left)',
                        style: TextStyle(color: isOutOfStock ? AppColors.error : AppColors.primary, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 32),
                  if (!isOutOfStock) ...[
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        IconButton(
                          icon: const Icon(Icons.remove_circle_outline, size: 36, color: AppColors.primary),
                          onPressed: _quantity > 1 ? () => setState(() => _quantity--) : null,
                        ),
                        const SizedBox(width: 16),
                        Text('$_quantity', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                        const SizedBox(width: 16),
                        IconButton(
                          icon: const Icon(Icons.add_circle_outline, size: 36, color: AppColors.primary),
                          onPressed: _quantity < p.quantity ? () => setState(() => _quantity++) : null,
                        ),
                      ],
                    ),
                    const SizedBox(height: 24),
                  ],
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        disabledBackgroundColor: Colors.grey,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: isOutOfStock || _isAdding ? null : _addToCart,
                      child: _isAdding
                          ? const CircularProgressIndicator(color: Colors.white)
                          : Text(isOutOfStock ? 'OUT OF STOCK' : 'ADD TO CART', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
