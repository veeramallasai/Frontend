import 'package:flutter/material.dart';

import '../../app/app_routes.dart';
import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../../core/theme/app_colors.dart';
import 'widgets/pay_now_bar.dart';
import 'widgets/payment_method_selector.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({
    super.key,
    this.shoppingMode = 'home',
    this.deliveryMethod = 'quick',
    this.deliveryDate,
    this.deliverySlot = 'Earliest available',
    this.addressId = '',
    this.address = const <String, dynamic>{},
    this.subtotal = 0,
    this.productSavings = 0,
    this.couponCode = '',
    this.couponDiscount = 0,
    this.deliveryFee = 0,
    this.grandTotal = 0,
    this.itemCount = 0,
  });

  final String shoppingMode;
  final String deliveryMethod;
  final String? deliveryDate;
  final String deliverySlot;
  final String addressId;
  final Map<String, dynamic> address;
  final double subtotal;
  final double productSavings;
  final String couponCode;
  final double couponDiscount;
  final double deliveryFee;
  final double grandTotal;
  final int itemCount;

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final BackendApiService _apiService = BackendApiService();
  PaymentMethodType _selectedMethod = PaymentMethodType.cashOnDelivery;
  bool _processing = false;

  bool get _isCashOnDelivery =>
      _selectedMethod == PaymentMethodType.cashOnDelivery;

  double get _payableAmount {
    if (widget.grandTotal > 0) return widget.grandTotal;

    final double value =
        widget.subtotal - widget.couponDiscount + widget.deliveryFee;
    return value < 0 ? 0 : value;
  }

  void _selectMethod(PaymentMethodType method) {
    if (_processing) return;
    setState(() => _selectedMethod = method);
  }

  @override
  void dispose() {
    _apiService.dispose();
    super.dispose();
  }

  Future<void> _placeOrder() async {
    if (_processing) return;

    if (widget.addressId.trim().isEmpty || widget.address.isEmpty) {
      _showMessage('Delivery address is missing.', error: true);
      return;
    }

    setState(() => _processing = true);

    try {
      final String pMethod = _isCashOnDelivery
          ? 'COD'
          : (_selectedMethod == PaymentMethodType.card ? 'CARD' : 'UPI');

      final String transactionId = _isCashOnDelivery ? '' : _generateTransactionId();
      final String orderNumber = _generateOrderNumber();

      final Map<String, dynamic> backendPayload = <String, dynamic>{
        'couponCode': widget.couponCode,
        'paymentMethod': pMethod,
        'transactionRef': transactionId,
        'shoppingMode': widget.shoppingMode,
        'deliveryMethod': widget.deliveryMethod,
        'deliverySlot': widget.deliverySlot,
        'address': widget.address,
      };

      await _apiService.createOrder(backendPayload);

      if (!mounted) return;

      final Map<String, dynamic> args = <String, dynamic>{
        'orderId': orderNumber,
        'orderNumber': orderNumber,
        'grandTotal': _payableAmount,
        'paymentMethod': _selectedMethod.value,
        'deliveryMethod': widget.deliveryMethod,
        'deliverySlot': widget.deliverySlot,
        'address': widget.address,
      };

      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.orderConfirmation,
        (Route<dynamic> route) => false,
        arguments: args,
      );
    } catch (_) {
      if (!mounted) return;
      _showMessage('Unable to complete the order. Please try again.', error: true);
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  String _generateOrderNumber() {
    final int timestamp = DateTime.now().millisecondsSinceEpoch;
    final String suffix = timestamp.toString().substring(
          timestamp.toString().length - 6,
        );
    return 'F2H-$suffix';
  }

  String _generateTransactionId() {
    final int timestamp = DateTime.now().millisecondsSinceEpoch;
    return 'TXN$timestamp';
  }

  void _showMessage(
    String message, {
    bool error = false,
  }) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: error ? AppColors.error : AppColors.primary,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: Text(
            message,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Payment'),
      ),
      body: SafeArea(
        child: Column(
          children: <Widget>[
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    PaymentMethodSelector(
                      selectedMethod: _selectedMethod,
                      onMethodSelected: _selectMethod,
                    ),
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.border),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Text(
                            'ORDER SUMMARY',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w900,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: 12),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: <Widget>[
                              const Text('Subtotal'),
                              Text('₹${widget.subtotal.toStringAsFixed(2)}'),
                            ],
                          ),
                          if (widget.couponDiscount > 0) ...<Widget>[
                            const SizedBox(height: 8),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: <Widget>[
                                const Text('Discount'),
                                Text(
                                  '-₹${widget.couponDiscount.toStringAsFixed(2)}',
                                  style: const TextStyle(color: AppColors.primary),
                                ),
                              ],
                            ),
                          ],
                          const SizedBox(height: 8),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: <Widget>[
                              const Text('Delivery Fee'),
                              Text('₹${widget.deliveryFee.toStringAsFixed(2)}'),
                            ],
                          ),
                          const Divider(height: 24),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: <Widget>[
                              const Text(
                                'Total Payable',
                                style: TextStyle(fontWeight: FontWeight.w900),
                              ),
                              Text(
                                '₹${_payableAmount.toStringAsFixed(2)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.w900,
                                  color: AppColors.primary,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            PayNowBar(
              amount: _payableAmount,
              isProcessing: _processing,
              onPressed: _placeOrder,
            ),
          ],
        ),
      ),
    );
  }
}
