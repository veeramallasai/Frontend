import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../core/theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/cart_service.dart';
import '../home/home_screen.dart';

class OtpVerificationScreen extends StatefulWidget {
  final String verificationId;
  final String phoneNumber;

  const OtpVerificationScreen({super.key, required this.verificationId, required this.phoneNumber});

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  final _otpController = TextEditingController();
  final AuthService _authService = AuthService();
  final CartService _cartService = CartService();
  bool _isLoading = false;

  void _verifyOtp() async {
    if (_otpController.text.length != 6) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter valid 6-digit OTP')));
      return;
    }

    setState(() => _isLoading = true);
    final credential = PhoneAuthProvider.credential(
      verificationId: widget.verificationId,
      smsCode: _otpController.text.trim(),
    );

    final userCredential = await _authService.signInWithCredential(credential);
    setState(() => _isLoading = false);

    if (userCredential != null) {
      _cartService.loadCart();
      Navigator.pushAndRemoveUntil(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
            (route) => false,
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Invalid OTP. Please try again.')));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Verify OTP')),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'OTP sent to ${widget.phoneNumber}',
              style: GoogleFonts.lato(fontSize: 16, color: Colors.grey[600]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 30),
            TextField(
              controller: _otpController,
              keyboardType: TextInputType.number,
              maxLength: 6,
              textAlign: TextAlign.center,
              style: GoogleFonts.lexend(fontSize: 24, letterSpacing: 8, fontWeight: FontWeight.bold),
              decoration: InputDecoration(
                counterText: '',
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: BorderSide(color: Colors.grey[300]!),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(14),
                  borderSide: const BorderSide(color: AppColors.primaryGreen, width: 2),
                ),
              ),
            ),
            const SizedBox(height: 30),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _verifyOtp,
                child: _isLoading
                    ? const SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : Text('VERIFY OTP', style: GoogleFonts.lexend(fontSize: 18, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}