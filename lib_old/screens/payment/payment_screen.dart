import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../models/payment_model.dart';
import '../../services/payment_service.dart';
import '../../widgets/payment/payment_method_card.dart';
import '../../widgets/payment/payment_summary_card.dart';
import 'payment_success_screen.dart';

class PaymentScreen extends StatefulWidget {
  final String orderId;
  final double subtotal;
  final double discount;
  final double deliveryCharge;
  final double platformFee;
  final double walletAmount;
  final String couponCode;
  final PaymentMethodType initialMethod;

  const PaymentScreen({
    super.key,
    required this.orderId,
    required this.subtotal,
    this.discount = 0,
    this.deliveryCharge = 0,
    this.platformFee = 0,
    this.walletAmount = 0,
    this.couponCode = '',
    this.initialMethod = PaymentMethodType.googlePay,
  });

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  final PaymentService _paymentService = PaymentService();

  late PaymentMethodType _selectedMethod;
  bool _isProcessing = false;

  @override
  void initState() {
    super.initState();
    _selectedMethod = widget.initialMethod;
  }

  double get _totalAmount {
    final double value = widget.subtotal +
        widget.deliveryCharge +
        widget.platformFee -
        widget.discount -
        widget.walletAmount;

    return value < 0 ? 0 : value;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        title: Text(
          'Payment',
          style: GoogleFonts.lexend(
            color: AppColors.darkText,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 120),
        children: <Widget>[
          _buildSecureBanner(),
          const SizedBox(height: 16),
          PaymentSummaryCard(
            subtotal: widget.subtotal,
            discount: widget.discount,
            deliveryCharge: widget.deliveryCharge,
            platformFee: widget.platformFee,
            walletAmount: widget.walletAmount,
            totalAmount: _totalAmount,
            couponCode: widget.couponCode,
          ),
          const SizedBox(height: 22),
          _sectionTitle('Recommended'),
          const SizedBox(height: 10),
          PaymentMethodCard(
            method: PaymentMethodType.googlePay,
            selected: _selectedMethod == PaymentMethodType.googlePay,
            recommended: true,
            subtitle: 'Fast and secure UPI payment',
            onTap: () {
              setState(() {
                _selectedMethod = PaymentMethodType.googlePay;
              });
            },
          ),
          const SizedBox(height: 12),
          _sectionTitle('UPI Apps'),
          const SizedBox(height: 10),
          _methodCard(
            PaymentMethodType.phonePe,
            'Pay using PhonePe',
          ),
          _methodCard(
            PaymentMethodType.paytm,
            'Pay using Paytm UPI',
          ),
          _methodCard(
            PaymentMethodType.upi,
            'Enter any UPI ID',
          ),
          const SizedBox(height: 12),
          _sectionTitle('Cards & Banking'),
          const SizedBox(height: 10),
          _methodCard(
            PaymentMethodType.creditCard,
            'Visa, Mastercard, RuPay and more',
          ),
          _methodCard(
            PaymentMethodType.debitCard,
            'Pay using your debit card',
          ),
          _methodCard(
            PaymentMethodType.netBanking,
            'All major Indian banks',
          ),
          const SizedBox(height: 12),
          _sectionTitle('Other Methods'),
          const SizedBox(height: 10),
          _methodCard(
            PaymentMethodType.farmWallet,
            'Use available Farm Wallet balance',
          ),
          _methodCard(
            PaymentMethodType.cashOnDelivery,
            'Pay when your order arrives',
          ),
        ],
      ),
      bottomNavigationBar: SafeArea(
        child: Container(
          color: Colors.white,
          padding: const EdgeInsets.all(12),
          child: ElevatedButton.icon(
            onPressed: _isProcessing ? null : _processPayment,
            icon: _isProcessing
                ? const SizedBox(
              width: 19,
              height: 19,
              child: CircularProgressIndicator(
                strokeWidth: 2.2,
                color: Colors.white,
              ),
            )
                : const Icon(Icons.lock_rounded),
            label: Text(
              _isProcessing
                  ? 'PROCESSING...'
                  : 'PAY ₹${_totalAmount.toStringAsFixed(0)}',
              style: GoogleFonts.lexend(
                fontWeight: FontWeight.w800,
              ),
            ),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 54),
            ),
          ),
        ),
      ),
    );
  }

  Widget _methodCard(
      PaymentMethodType method,
      String subtitle,
      ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: PaymentMethodCard(
        method: method,
        selected: _selectedMethod == method,
        subtitle: subtitle,
        onTap: () {
          setState(() {
            _selectedMethod = method;
          });
        },
      ),
    );
  }

  Widget _buildSecureBanner() {
    return Container(
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: <Widget>[
          const Icon(
            Icons.shield_outlined,
            color: Colors.white,
            size: 29,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Your payment details are encrypted and processed securely.',
              style: GoogleFonts.lato(
                color: Colors.white,
                fontSize: 12,
                height: 1.4,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.lexend(
        color: AppColors.darkText,
        fontSize: 17,
        fontWeight: FontWeight.w800,
      ),
    );
  }

  Future<void> _processPayment() async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      _showMessage(
        'Please sign in before making a payment.',
        isError: true,
      );
      return;
    }

    if (widget.orderId.trim().isEmpty) {
      _showMessage(
        'Order ID is unavailable.',
        isError: true,
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      final PaymentResult result =
      await _paymentService.processPayment(
        PaymentModel(
          userId: user.uid,
          orderId: widget.orderId,
          method: _selectedMethod,
          subtotal: widget.subtotal,
          discount: widget.discount,
          deliveryCharge: widget.deliveryCharge,
          platformFee: widget.platformFee,
          walletAmount: widget.walletAmount,
          totalAmount: _totalAmount,
          couponCode: widget.couponCode,
        ),
      );

      if (!mounted) return;

      if (!result.isSuccessful || result.payment == null) {
        _showMessage(
          result.message,
          isError: true,
        );
        return;
      }

      Navigator.of(context).pushReplacement(
        MaterialPageRoute<void>(
          builder: (_) => PaymentSuccessScreen(
            payment: result.payment!,
          ),
        ),
      );
    } on PaymentServiceException catch (error) {
      _showMessage(
        error.message,
        isError: true,
      );
    } catch (_) {
      _showMessage(
        'Payment could not be completed.',
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  void _showMessage(
      String message, {
        bool isError = false,
      }) {
    if (!mounted) return;

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: GoogleFonts.lato(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          backgroundColor: isError
              ? AppColors.errorRed
              : AppColors.primaryGreen,
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(13),
          ),
        ),
      );
  }
}
