import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/order_provider.dart';
import 'payment_screen.dart';

class BillSummaryScreen extends StatefulWidget {
  final String orderId;

  const BillSummaryScreen({super.key, required this.orderId});

  @override
  State<BillSummaryScreen> createState() => _BillSummaryScreenState();
}

class _BillSummaryScreenState extends State<BillSummaryScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        Provider.of<OrderProvider>(context, listen: false).fetchBillSummary(widget.orderId));
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);
    final summary = orderProvider.activeBillSummary;

    return Scaffold(
      appBar: AppBar(title: const Text('Bill Summary')),
      body: orderProvider.isLoading || summary == null
          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Payment Breakdown', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textDark)),
                  const SizedBox(height: 16),
                  Card(
                    color: Colors.white,
                    elevation: 3,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    child: Padding(
                      padding: const EdgeInsets.all(20.0),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Subtotal:', style: TextStyle(color: AppColors.textLight, fontSize: 15)),
                              Text('₹${summary.subtotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 15)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Product Discount:', style: TextStyle(color: AppColors.error, fontSize: 15)),
                              Text('-₹${summary.productDiscount.toStringAsFixed(2)}', style: const TextStyle(color: AppColors.error, fontSize: 15)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Coupon Discount:', style: TextStyle(color: AppColors.error, fontSize: 15)),
                              Text('-₹${summary.couponDiscount.toStringAsFixed(2)}', style: const TextStyle(color: AppColors.error, fontSize: 15)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Delivery Charges:', style: TextStyle(color: AppColors.textLight, fontSize: 15)),
                              Text('₹${summary.deliveryCharge.toStringAsFixed(2)}', style: const TextStyle(fontSize: 15)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Platform Fee:', style: TextStyle(color: AppColors.textLight, fontSize: 15)),
                              Text('₹${summary.platformFee.toStringAsFixed(2)}', style: const TextStyle(fontSize: 15)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Packaging Charges:', style: TextStyle(color: AppColors.textLight, fontSize: 15)),
                              Text('₹${summary.packagingCharge.toStringAsFixed(2)}', style: const TextStyle(fontSize: 15)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('GST (Tax):', style: TextStyle(color: AppColors.textLight, fontSize: 15)),
                              Text('₹${summary.gst.toStringAsFixed(2)}', style: const TextStyle(fontSize: 15)),
                            ],
                          ),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Total Savings:', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 16)),
                              Text('₹${summary.totalSavings.toStringAsFixed(2)}', style: const TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 16)),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text('Final Payable Amount:', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.textDark)),
                              Text('₹${summary.finalAmount.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.primary)),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 48),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                      onPressed: () {
                        Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (_) => PaymentScreen(orderId: widget.orderId, amount: summary.finalAmount),
                          ),
                        );
                      },
                      child: const Text('PROCEED TO PAYMENT', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
