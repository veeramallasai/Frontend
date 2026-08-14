import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/app_colors.dart';
import '../../providers/auth_provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _otpController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _otpSent = false;

  void _requestOtp() async {
    if (!_formKey.currentState!.validate()) return;
    try {
      await Provider.of<AuthProvider>(context, listen: false).forgotPassword(_emailController.text.trim());
      setState(() => _otpSent = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('OTP sent to your email.'), backgroundColor: AppColors.primary),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
      );
    }
  }

  void _resetPassword() async {
    if (!_formKey.currentState!.validate()) return;
    try {
      await Provider.of<AuthProvider>(context, listen: false).resetPassword(
        _emailController.text.trim(),
        _otpController.text.trim(),
        _passwordController.text,
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Password reset successful. Please login.'), backgroundColor: AppColors.primary),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = Provider.of<AuthProvider>(context).isLoading;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Reset Password')),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Card(
            elevation: 4,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            color: AppColors.cardBg,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 32.0),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.lock_reset, size: 48, color: AppColors.primary),
                    const SizedBox(height: 16),
                    Text(
                      _otpSent ? 'Enter New Password' : 'Reset Account Password',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
                    ),
                    const SizedBox(height: 24),
                    TextFormField(
                      controller: _emailController,
                      enabled: !_otpSent,
                      keyboardType: TextInputType.emailAddress,
                      decoration: const InputDecoration(labelText: 'Email Address', border: OutlineInputBorder()),
                      validator: (value) =>
                          value == null || !value.contains('@') ? 'Enter a valid email' : null,
                    ),
                    if (_otpSent) ...[
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _otpController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(labelText: 'OTP Code', border: OutlineInputBorder()),
                        validator: (value) => value == null || value.length < 6 ? 'Enter complete code' : null,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _passwordController,
                        obscureText: true,
                        decoration: const InputDecoration(labelText: 'New Password', border: OutlineInputBorder()),
                        validator: (value) => value == null || value.length < 8 ? 'Must be at least 8 characters' : null,
                      ),
                    ],
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 48,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                        ),
                        onPressed: isLoading ? null : (_otpSent ? _resetPassword : _requestOtp),
                        child: isLoading
                            ? const CircularProgressIndicator(color: Colors.white)
                            : Text(_otpSent ? 'RESET PASSWORD' : 'SEND OTP CODE', style: const TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
