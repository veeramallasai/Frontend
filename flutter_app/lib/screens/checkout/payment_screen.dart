import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/cart_provider.dart';
import '../../providers/order_provider.dart';
import '../home/home_screen.dart';

class PaymentScreen extends StatefulWidget {
  final String orderId;
  final double amount;

  const PaymentScreen({super.key, required this.orderId, required this.amount});

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  String _paymentMethod = 'UPI';
  bool _isProcessing = false;
  bool _paymentSuccess = false;
  String _invoiceText = '';

  void _processPayment() async {
    setState(() => _isProcessing = true);
    try {
      // Call the backend payment endpoint
      await Provider.of<OrderProvider>(context, listen: false).processPayment(
        widget.orderId,
        _paymentMethod,
        'TXN-${DateTime.now().millisecondsSinceEpoch}',
      );

      // Clear local cart state
      Provider.of<CartProvider>(context, listen: false).clearCartLocal();

      // Fetch the raw invoice content from backend
      final text = await Provider.of<OrderProvider>(context, listen: false)
          .downloadInvoiceText(widget.orderId);
      setState(() {
        _invoiceText = text;
        _paymentSuccess = true;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Payment failed: ${e.toString()}'), backgroundColor: AppColors.error),
      );
    } finally {
      setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_paymentSuccess) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Order Confirmed'),
          automaticallyImplyLeading: false,
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            children: [
              const Icon(Icons.check_circle, color: AppColors.primary, size: 80),
              const SizedBox(height: 16),
              const Text(
                'Payment Successful!',
                style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: AppColors.primary),
              ),
              const SizedBox(height: 8),
              Text(
                'Order ID: ${widget.orderId}',
                style: const TextStyle(color: AppColors.textLight),
              ),
              const SizedBox(height: 32),
              const Align(
                alignment: Alignment.centerLeft,
                child: Text('Receipt Details:', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.05),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _invoiceText,
                  style: const TextStyle(fontFamily: 'monospace', fontSize: 12),
                ),
              ),
              const SizedBox(height: 48),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                  onPressed: () {
                    Navigator.pushAndRemoveUntil(
                      context,
                      MaterialPageRoute(builder: (_) => const HomeScreen()),
                      (route) => false,
                    );
                  },
                  child: const Text('CONTINUE SHOPPING', style: TextStyle(fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Payment Options')),
      body: _isProcessing
          ? const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppColors.primary),
                  SizedBox(height: 16),
                  Text('Processing secure payment... Please do not close the app'),
                ],
              ),
            )
          : Padding(
              padding: const EdgeInsets.all(24.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Payable Amount: ₹${widget.amount.toStringAsFixed(2)}',
                    style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                  const SizedBox(height: 24),
                  const Text('Select Payment Method', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 16),
                  RadioListTile<String>(
                    title: const Text('UPI (GPay / PhonePe / Paytm)'),
                    value: 'UPI',
                    groupValue: _paymentMethod,
                    activeColor: AppColors.primary,
                    onChanged: (v) => setState(() => _paymentMethod = v!),
                  ),
                  RadioListTile<String>(
                    title: const Text('Credit / Debit Card'),
                    value: 'CARD',
                    groupValue: _paymentMethod,
                    activeColor: AppColors.primary,
                    onChanged: (v) => setState(() => _paymentMethod = v!),
                  ),
                  RadioListTile<String>(
                    title: const Text('Cash on Delivery (COD)'),
                    value: 'COD',
                    groupValue: _paymentMethod,
                    activeColor: AppColors.primary,
                    onChanged: (v) => setState(() => _paymentMethod = v!),
                  ),
                  const Spacer(),
                  SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                      onPressed: _processPayment,
                      child: Text('PAY ₹${widget.amount.toStringAsFixed(2)} NOW', style: const TextStyle(fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
    );
  }
}
