import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/order_provider.dart';
import 'order_tracking_screen.dart';

class OrderHistoryScreen extends StatefulWidget {
  const OrderHistoryScreen({super.key});

  @override
  State<OrderHistoryScreen> createState() => _OrderHistoryScreenState();
}

class _OrderHistoryScreenState extends State<OrderHistoryScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => Provider.of<OrderProvider>(context, listen: false).fetchOrders());
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);
    final orders = orderProvider.orders;

    return Scaffold(
      appBar: AppBar(title: const Text('My Orders')),
      body: orderProvider.isLoading && orders.isEmpty
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : orders.isEmpty
              ? const Center(child: Text('No orders placed yet', style: TextStyle(color: AppColors.textLight)))
              : RefreshIndicator(
                  onRefresh: orderProvider.fetchOrders,
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: orders.length,
                    itemBuilder: (ctx, idx) {
                      final order = orders[idx];
                      return Card(
                        color: Colors.white,
                        margin: const EdgeInsets.only(bottom: 12),
                        child: ListTile(
                          contentPadding: const EdgeInsets.all(16),
                          title: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text('Order ID: ${order.id.substring(0, 8)}...', style: const TextStyle(fontWeight: FontWeight.bold)),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: AppColors.primary.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  order.status,
                                  style: const TextStyle(color: AppColors.primary, fontSize: 12, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 8),
                              Text('Items Count: ${order.items.length}'),
                              Text('Placed on: ${order.createdAt.split('T')[0]}'),
                              const SizedBox(height: 4),
                              Text(
                                'Total Paid: ₹${order.totalAmount.toStringAsFixed(2)}',
                                style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary),
                              ),
                            ],
                          ),
                          trailing: const Icon(Icons.chevron_right),
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => OrderTrackingScreen(orderId: order.id),
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
    );
  }
}
