import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/cart_provider.dart';
import '../checkout/checkout_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _couponController = TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() => Provider.of<CartProvider>(context, listen: false).fetchCart());
  }

  void _applyCoupon(CartProvider cart) async {
    final code = _couponController.text.trim();
    if (code.isEmpty) return;
    try {
      await cart.applyCoupon(code);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Coupon applied successfully!'), backgroundColor: AppColors.primary),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cart = Provider.of<CartProvider>(context);
    final items = cart.items;

    return Scaffold(
      appBar: AppBar(title: const Text('My Cart')),
      body: cart.isLoading && items.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : items.isEmpty
              ? const Center(child: Text('Your cart is empty', style: TextStyle(color: AppColors.textLight)))
              : Column(
                  children: [
                    Expanded(
                      child: ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: items.length,
                        itemBuilder: (ctx, idx) {
                          final item = items[idx];
                          return Card(
                            color: Colors.white,
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(12.0),
                              child: Row(
                                children: [
                                  const Icon(Icons.eco, color: AppColors.primary, size: 36),
                                  const SizedBox(width: 16),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(item.product.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                                        Text('₹${item.product.activePrice} each', style: const TextStyle(color: AppColors.textLight, fontSize: 13)),
                                        Text('Total: ₹${item.totalPrice.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                                      ],
                                    ),
                                  ),
                                  Row(
                                    children: [
                                      IconButton(
                                        icon: const Icon(Icons.remove_circle_outline, color: AppColors.primary),
                                        onPressed: item.quantity > 1
                                            ? () => cart.updateCartItem(item.id, item.quantity - 1)
                                            : () => cart.removeItemFromCart(item.id),
                                      ),
                                      Text('${item.quantity}', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                                      IconButton(
                                        icon: const Icon(Icons.add_circle_outline, color: AppColors.primary),
                                        onPressed: () => cart.updateCartItem(item.id, item.quantity + 1),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    
                    // Coupon Code Section
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      color: Colors.white,
                      child: cart.appliedCouponCode == null
                          ? Row(
                              children: [
                                Expanded(
                                  child: TextField(
                                    controller: _couponController,
                                    decoration: const InputDecoration(
                                      hintText: 'Enter Coupon Code',
                                      border: OutlineInputBorder(),
                                      contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                ElevatedButton(
                                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                                  onPressed: () => _applyCoupon(cart),
                                  child: const Text('APPLY'),
                                ),
                              ],
                            )
                          : Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Row(
                                  children: [
                                    const Icon(Icons.local_offer, color: AppColors.primary),
                                    const SizedBox(width: 8),
                                    Text('Applied Code: ${cart.appliedCouponCode} (-₹${cart.couponDiscountAmount})',
                                        style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary)),
                                  ],
                                ),
                                TextButton(
                                  onPressed: cart.removeCoupon,
                                  child: const Text('REMOVE', style: TextStyle(color: AppColors.error)),
                                ),
                              ],
                            ),
                    ),

                    // Totals & Checkout
                    Container(
                      padding: const EdgeInsets.all(16),
                      color: Colors.white,
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Original Subtotal:', style: TextStyle(color: AppColors.textLight)),
                              Text('₹${cart.subtotal.toStringAsFixed(2)}'),
                            ],
                          ),
                          if (cart.productDiscount > 0) ...[
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Product Discount:', style: TextStyle(color: AppColors.error)),
                                Text('-₹${cart.productDiscount.toStringAsFixed(2)}', style: const TextStyle(color: AppColors.error)),
                              ],
                            ),
                          ],
                          if (cart.couponDiscountAmount > 0) ...[
                            const SizedBox(height: 4),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                const Text('Coupon Discount:', style: TextStyle(color: AppColors.error)),
                                Text('-₹${cart.couponDiscountAmount.toStringAsFixed(2)}', style: const TextStyle(color: AppColors.error)),
                              ],
                            ),
                          ],
                          const Divider(),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Estimated Pay Total:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              Text('₹${cart.finalAmount.toStringAsFixed(2)}', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.primary)),
                            ],
                          ),
                          const SizedBox(height: 16),
                          SizedBox(
                            width: double.infinity,
                            height: 48,
                            child: ElevatedButton(
                              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                              onPressed: () {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(builder: (_) => const CheckoutScreen()),
                                );
                              },
                              child: const Text('PROCEED TO CHECKOUT', style: TextStyle(fontWeight: FontWeight.bold)),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}
