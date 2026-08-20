import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/app_routes.dart';
import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../../core/theme/app_colors.dart';
import 'widgets/otp_input.dart';

class OtpScreen extends StatefulWidget {
  const OtpScreen({
    super.key,
    this.phoneNumber = '',
    this.email,
    this.userId,
    this.source,
  });

  final String phoneNumber;
  final String? email;
  final String? userId;
  final String? source;

  @override
  State<OtpScreen> createState() => _OtpScreenState();
}

class _OtpScreenState extends State<OtpScreen>
    with SingleTickerProviderStateMixin {
  final TextEditingController _otpController = TextEditingController();
  final FocusNode _otpFocusNode = FocusNode();

  late final AnimationController _animationController;
  late final Animation<double> _fadeAnimation;
  late final Animation<Offset> _slideAnimation;

  final BackendApiService _apiService = BackendApiService();

  Timer? _timer;

  bool _sendingOtp = false;
  bool _verifyingOtp = false;
  bool _otpSent = false;

  int _secondsRemaining = 30;

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );

    _fadeAnimation = CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    );

    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.04),
      end: Offset.zero,
    ).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: Curves.easeOutCubic,
      ),
    );

    _animationController.forward();

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _sendOtp();
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _animationController.dispose();
    _otpController.dispose();
    _otpFocusNode.dispose();
    _apiService.dispose();
    super.dispose();
  }

  String get _targetEmail {
    return (widget.email ?? '').trim();
  }

  String get _maskedEmail {
    final String email = _targetEmail;
    if (email.isEmpty) return 'your email';

    final List<String> parts = email.split('@');
    if (parts.length != 2 || parts.first.isEmpty) return email;

    final String name = parts.first;
    final String domain = parts.last;

    if (name.length <= 2) {
      return '${name.substring(0, 1)}***@$domain';
    }

    return '${name.substring(0, 2)}***@$domain';
  }

  void _startTimer() {
    _timer?.cancel();

    setState(() {
      _secondsRemaining = 30;
    });

    _timer = Timer.periodic(
      const Duration(seconds: 1),
      (Timer timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }

        if (_secondsRemaining <= 1) {
          timer.cancel();

          setState(() {
            _secondsRemaining = 0;
          });

          return;
        }

        setState(() {
          _secondsRemaining--;
        });
      },
    );
  }

  Future<void> _sendOtp({
    bool resend = false,
  }) async {
    if (_sendingOtp || _verifyingOtp) {
      return;
    }

    final String target = _targetEmail;
    if (target.isEmpty) {
      _showMessage(
        'No email address provided for verification.',
        error: true,
      );
      return;
    }

    setState(() {
      _sendingOtp = true;
    });

    try {
      final ApiResponse<dynamic> response = resend
          ? await _apiService.resendOtp(target)
          : await _apiService.sendEmailOtp(target);

      if (!mounted) return;

      if (response.isSuccess) {
        setState(() {
          _otpSent = true;
        });

        _startTimer();
        _otpFocusNode.requestFocus();

        _showMessage(
          resend
              ? 'A new verification OTP code has been sent to your email.'
              : 'Verification OTP sent to your email.',
          error: false,
        );
      } else {
        _showMessage(
          response.message.isNotEmpty
              ? response.message
              : 'Unable to send email OTP. Please try again.',
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;

      _showMessage(
        'Unable to send OTP. Please check your network connection.',
        error: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _sendingOtp = false;
        });
      }
    }
  }

  Future<void> _verifyOtp() async {
    FocusScope.of(context).unfocus();

    final String otp = _otpController.text.trim();

    if (otp.length != 6) {
      _showMessage(
        'Enter the complete 6-digit OTP.',
        error: true,
      );
      return;
    }

    final String target = _targetEmail;
    if (target.isEmpty) {
      _showMessage(
        'No email address found for verification.',
        error: true,
      );
      return;
    }

    setState(() {
      _verifyingOtp = true;
    });

    try {
      final ApiResponse<dynamic> response = await _apiService.verifyEmailOtp(
        email: target,
        otpCode: otp,
      );

      if (!mounted) return;

      if (response.isSuccess) {
        await _markEmailVerified();
      } else {
        _showMessage(
          response.message.isNotEmpty
              ? response.message
              : 'Invalid verification code. Please check and try again.',
          error: true,
        );
      }
    } catch (_) {
      if (!mounted) return;

      _showMessage(
        'OTP verification failed. Please try again.',
        error: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _verifyingOtp = false;
        });
      }
    }
  }

  Future<void> _markEmailVerified() async {
    if (!mounted) return;

    _timer?.cancel();

    _showMessage(
      'Email address verified successfully.',
      error: false,
    );

    await Future<void>.delayed(
      const Duration(milliseconds: 450),
    );

    if (!mounted) return;

    Navigator.of(context).pushNamedAndRemoveUntil(
      AppRoutes.home,
      (Route<dynamic> route) => false,
    );
  }

  Future<void> _resendOtp() async {
    if (_secondsRemaining > 0 || _sendingOtp || _verifyingOtp) {
      return;
    }

    _otpController.clear();
    await _sendOtp(resend: true);
  }

  void _changeEmail() {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
      return;
    }

    Navigator.of(context).pushReplacementNamed(
      AppRoutes.register,
    );
  }

  void _showMessage(
    String message, {
    required bool error,
  }) {
    if (!mounted) return;

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
          content: Row(
            children: <Widget>[
              Icon(
                error
                    ? Icons.error_outline_rounded
                    : Icons.check_circle_outline_rounded,
                color: Colors.white,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: const TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final double width = MediaQuery.sizeOf(context).width;

    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: AppColors.background,
      body: Stack(
        fit: StackFit.expand,
        children: <Widget>[
          const _OtpBackground(),
          SafeArea(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(
                horizontal: width >= 700 ? 28 : 18,
                vertical: 20,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints: const BoxConstraints(
                    maxWidth: 540,
                  ),
                  child: FadeTransition(
                    opacity: _fadeAnimation,
                    child: SlideTransition(
                      position: _slideAnimation,
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.stretch,
                        children: <Widget>[
                          _buildTopBar(),
                          const SizedBox(height: 32),
                          _buildOtpCard(),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTopBar() {
    return Row(
      children: <Widget>[
        Material(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          child: InkWell(
            borderRadius: BorderRadius.circular(16),
            onTap: _sendingOtp || _verifyingOtp ? null : _changeEmail,
            child: const SizedBox(
              width: 46,
              height: 46,
              child: Icon(
                Icons.arrow_back_ios_new_rounded,
                size: 18,
              ),
            ),
          ),
        ),
        const SizedBox(width: 14),
        const Text(
          'Verify Email',
          style: TextStyle(
            color: AppColors.primaryDark,
            fontSize: 18,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }

  Widget _buildOtpCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x16000000),
            blurRadius: 40,
            offset: Offset(0, 18),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          Center(
            child: Container(
              width: 92,
              height: 92,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: <Color>[
                    Color(0xFF0B7A3E),
                    Color(0xFF23A559),
                  ],
                ),
                borderRadius: BorderRadius.circular(28),
                boxShadow: const <BoxShadow>[
                  BoxShadow(
                    color: Color(0x300B7A3E),
                    blurRadius: 26,
                    offset: Offset(0, 13),
                  ),
                ],
              ),
              child: const Icon(
                Icons.mark_email_read_outlined,
                color: Colors.white,
                size: 42,
              ),
            ),
          ),
          const SizedBox(height: 24),
          const Text(
            'Email Verification',
            textAlign: TextAlign.center,
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 27,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 10),
          Text(
            _sendingOtp && !_otpSent
                ? 'Sending OTP to $_targetEmail...'
                : 'Enter the 6-digit code sent to $_maskedEmail',
            textAlign: TextAlign.center,
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 13.5,
              height: 1.45,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 28),
          OtpInput(
            child: TextField(
              controller: _otpController,
              focusNode: _otpFocusNode,
              enabled: !_verifyingOtp,
              keyboardType: TextInputType.number,
              textInputAction: TextInputAction.done,
              textAlign: TextAlign.center,
              maxLength: 6,
              autofillHints: const <String>[
                AutofillHints.oneTimeCode,
              ],
              inputFormatters: <TextInputFormatter>[
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(6),
              ],
              onSubmitted: (_) {
                _verifyOtp();
              },
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 27,
                letterSpacing: 8,
                fontWeight: FontWeight.w900,
              ),
              decoration: InputDecoration(
                counterText: '',
                hintText: '• • • • • •',
                hintStyle: const TextStyle(
                  color: AppColors.textSecondary,
                  letterSpacing: 6,
                ),
                contentPadding: const EdgeInsets.symmetric(
                  vertical: 22,
                  horizontal: 16,
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(18),
                  borderSide: const BorderSide(
                    color: AppColors.border,
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(18),
                  borderSide: const BorderSide(
                    color: AppColors.primary,
                    width: 2,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 18),
          SizedBox(
            height: 56,
            child: FilledButton(
              onPressed: _verifyingOtp || _sendingOtp ? null : _verifyOtp,
              child: _verifyingOtp
                  ? const SizedBox(
                      width: 23,
                      height: 23,
                      child: CircularProgressIndicator(
                        strokeWidth: 2.5,
                        color: Colors.white,
                      ),
                    )
                  : const Text(
                      'VERIFY & CONTINUE',
                    ),
            ),
          ),
          const SizedBox(height: 18),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              const Text(
                "Didn't receive OTP?",
                style: TextStyle(
                  color: AppColors.textSecondary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(width: 6),
              if (_secondsRemaining > 0)
                Text(
                  '${_secondsRemaining}s',
                  style: const TextStyle(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w900,
                  ),
                )
              else
                TextButton(
                  onPressed: _sendingOtp || _verifyingOtp ? null : _resendOtp,
                  child: const Text(
                    'Resend OTP',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
            ],
          ),
          TextButton.icon(
            onPressed: _sendingOtp || _verifyingOtp ? null : _changeEmail,
            icon: const Icon(
              Icons.edit_outlined,
              size: 18,
            ),
            label: const Text(
              'Change email address',
              style: TextStyle(
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFFF1F8F4),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: const Color(0xFFDCEFE4),
              ),
            ),
            child: const Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Icon(
                  Icons.shield_outlined,
                  color: AppColors.primary,
                  size: 20,
                ),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Never share your OTP with anyone. Farm To Home will never ask for your OTP by phone or message.',
                    style: TextStyle(
                      color: AppColors.textSecondary,
                      fontSize: 11.5,
                      height: 1.45,
                      fontWeight: FontWeight.w600,
                    ),
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

class _OtpBackground extends StatelessWidget {
  const _OtpBackground();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: <Widget>[
        const Positioned.fill(
          child: DecoratedBox(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: <Color>[
                  Color(0xFFE8F6ED),
                  Color(0xFFFFFBF2),
                  AppColors.background,
                ],
              ),
            ),
          ),
        ),
        Positioned(
          top: -120,
          right: -100,
          child: Container(
            width: 350,
            height: 350,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0x100B7A3E),
            ),
          ),
        ),
        Positioned(
          bottom: -120,
          left: -100,
          child: Container(
            width: 320,
            height: 320,
            decoration: const BoxDecoration(
              shape: BoxShape.circle,
              color: Color(0x10F4B400),
            ),
          ),
        ),
      ],
    );
  }
}
