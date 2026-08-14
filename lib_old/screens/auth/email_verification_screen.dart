import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../home/home_screen.dart';
import 'login_screen.dart';

class EmailVerificationScreen extends StatefulWidget {
  const EmailVerificationScreen({
    super.key,
    required this.email,
  });

  final String email;

  @override
  State<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState
    extends State<EmailVerificationScreen> {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  Timer? _verificationTimer;
  Timer? _resendTimer;

  bool _isChecking = false;
  bool _isResending = false;
  bool _isSigningOut = false;

  int _resendSeconds = 0;

  @override
  void initState() {
    super.initState();

    _startAutomaticVerificationCheck();
  }

  void _startAutomaticVerificationCheck() {
    _verificationTimer?.cancel();

    _verificationTimer = Timer.periodic(
      const Duration(seconds: 5),
          (_) {
        if (!_isChecking && mounted) {
          _checkVerification(
            showUnverifiedMessage: false,
          );
        }
      },
    );
  }

  Future<void> _checkVerification({
    bool showUnverifiedMessage = true,
  }) async {
    if (_isChecking || _isSigningOut) {
      return;
    }

    if (mounted) {
      setState(() {
        _isChecking = true;
      });
    }

    try {
      User? user = _auth.currentUser;

      if (user == null) {
        _openLogin(
          message:
          'Your verification session has expired. Please login again.',
        );

        return;
      }

      await user.reload();

      user = _auth.currentUser;

      if (user == null) {
        _openLogin(
          message:
          'Your verification session has expired. Please login again.',
        );

        return;
      }

      if (user.emailVerified) {
        _verificationTimer?.cancel();

        _showMessage(
          message: 'Email verified successfully.',
          isError: false,
        );

        await Future<void>.delayed(
          const Duration(milliseconds: 500),
        );

        _openHome();

        return;
      }

      if (showUnverifiedMessage) {
        _showMessage(
          message:
          'Email is not verified yet. Open your inbox and click the verification link.',
          isError: true,
        );
      }
    } on FirebaseAuthException catch (error) {
      if (showUnverifiedMessage) {
        _showMessage(
          message: _firebaseErrorMessage(error),
          isError: true,
        );
      }
    } catch (_) {
      if (showUnverifiedMessage) {
        _showMessage(
          message:
          'Unable to check verification status. Please try again.',
          isError: true,
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isChecking = false;
        });
      }
    }
  }

  Future<void> _resendVerificationEmail() async {
    if (_isResending ||
        _isChecking ||
        _isSigningOut ||
        _resendSeconds > 0) {
      return;
    }

    setState(() {
      _isResending = true;
    });

    try {
      User? user = _auth.currentUser;

      if (user == null) {
        _openLogin(
          message:
          'Your session has expired. Login again to resend verification.',
        );

        return;
      }

      await user.reload();

      user = _auth.currentUser;

      if (user == null) {
        _openLogin(
          message:
          'Your session has expired. Login again to resend verification.',
        );

        return;
      }

      if (user.emailVerified) {
        _openHome();
        return;
      }

      await user.sendEmailVerification();

      _startResendCountdown();

      _showMessage(
        message:
        'A new verification email has been sent to ${user.email ?? widget.email}.',
        isError: false,
      );
    } on FirebaseAuthException catch (error) {
      _showMessage(
        message: _firebaseErrorMessage(error),
        isError: true,
      );
    } catch (_) {
      _showMessage(
        message:
        'Unable to resend verification email. Please try again.',
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isResending = false;
        });
      }
    }
  }

  void _startResendCountdown() {
    _resendTimer?.cancel();

    setState(() {
      _resendSeconds = 60;
    });

    _resendTimer = Timer.periodic(
      const Duration(seconds: 1),
          (Timer timer) {
        if (!mounted) {
          timer.cancel();
          return;
        }

        if (_resendSeconds <= 1) {
          timer.cancel();

          setState(() {
            _resendSeconds = 0;
          });

          return;
        }

        setState(() {
          _resendSeconds--;
        });
      },
    );
  }

  Future<void> _signOutAndReturnToLogin() async {
    if (_isSigningOut) {
      return;
    }

    setState(() {
      _isSigningOut = true;
    });

    try {
      await _auth.signOut();
    } catch (_) {
      // Login navigation continues even when sign-out fails.
    }

    if (!mounted) {
      return;
    }

    _openLogin(
      message:
      'Verify your email before logging into your account.',
    );
  }

  void _openHome() {
    if (!mounted) {
      return;
    }

    Navigator.of(context).pushAndRemoveUntil(
      PageRouteBuilder<void>(
        transitionDuration:
        const Duration(milliseconds: 650),
        reverseTransitionDuration:
        const Duration(milliseconds: 300),
        pageBuilder: (
            BuildContext context,
            Animation<double> animation,
            Animation<double> secondaryAnimation,
            ) {
          return const HomeScreen();
        },
        transitionsBuilder: (
            BuildContext context,
            Animation<double> animation,
            Animation<double> secondaryAnimation,
            Widget child,
            ) {
          final Animation<double> fadeAnimation =
          CurvedAnimation(
            parent: animation,
            curve: Curves.easeOutCubic,
          );

          final Animation<Offset> slideAnimation =
          Tween<Offset>(
            begin: const Offset(0, 0.05),
            end: Offset.zero,
          ).animate(
            CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            ),
          );

          return FadeTransition(
            opacity: fadeAnimation,
            child: SlideTransition(
              position: slideAnimation,
              child: child,
            ),
          );
        },
      ),
          (Route<dynamic> route) => false,
    );
  }

  void _openLogin({
    String? message,
  }) {
    if (!mounted) {
      return;
    }

    Navigator.of(context).pushAndRemoveUntil(
      PageRouteBuilder<void>(
        transitionDuration:
        const Duration(milliseconds: 600),
        pageBuilder: (
            BuildContext context,
            Animation<double> animation,
            Animation<double> secondaryAnimation,
            ) {
          return LoginScreen(
            initialEmail: widget.email,
            initialMessage: message,
          );
        },
        transitionsBuilder: (
            BuildContext context,
            Animation<double> animation,
            Animation<double> secondaryAnimation,
            Widget child,
            ) {
          return FadeTransition(
            opacity: CurvedAnimation(
              parent: animation,
              curve: Curves.easeOutCubic,
            ),
            child: child,
          );
        },
      ),
          (Route<dynamic> route) => false,
    );
  }

  void _showMessage({
    required String message,
    required bool isError,
  }) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 4),
          backgroundColor: isError
              ? const Color(0xFFB3261E)
              : AppColors.primaryGreen,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: Row(
            children: [
              Icon(
                isError
                    ? Icons.error_outline_rounded
                    : Icons.check_circle_outline_rounded,
                color: Colors.white,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: GoogleFonts.lato(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
  }

  String _firebaseErrorMessage(
      FirebaseAuthException error,
      ) {
    switch (error.code) {
      case 'too-many-requests':
        return 'Too many requests. Please wait before trying again.';

      case 'network-request-failed':
        return 'Internet connection failed. Check your network and retry.';

      case 'user-disabled':
        return 'This account has been disabled.';

      case 'user-not-found':
        return 'This account no longer exists.';

      case 'requires-recent-login':
        return 'Please login again to continue.';

      case 'invalid-user-token':
      case 'user-token-expired':
        return 'Your session has expired. Please login again.';

      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Firebase could not complete this request.';
    }
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          width: 108,
          height: 108,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: Colors.white,
            border: Border.all(
              color: Colors.white.withOpacity(0.75),
              width: 3,
            ),
            boxShadow: [
              BoxShadow(
                color:
                Colors.black.withOpacity(0.18),
                blurRadius: 30,
                offset: const Offset(0, 15),
              ),
              BoxShadow(
                color: AppColors.goldAmber
                    .withOpacity(0.22),
                blurRadius: 28,
                spreadRadius: 2,
              ),
            ],
          ),
          child: const Icon(
            Icons.mark_email_unread_rounded,
            size: 54,
            color: AppColors.primaryGreen,
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Verify Your Email',
          textAlign: TextAlign.center,
          style: GoogleFonts.lexend(
            color: Colors.white,
            fontSize: 30,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 9),
        Text(
          'One final step to secure your Farm To Home account',
          textAlign: TextAlign.center,
          style: GoogleFonts.lato(
            color: Colors.white.withOpacity(0.78),
            fontSize: 15,
            height: 1.4,
          ),
        ),
      ],
    );
  }

  Widget _buildVerificationCard() {
    final String email =
    widget.email.trim().isNotEmpty
        ? widget.email.trim()
        : _auth.currentUser?.email ??
        'your registered email';

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(
        24,
        28,
        24,
        24,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.14),
            blurRadius: 36,
            offset: const Offset(0, 18),
          ),
        ],
      ),
      child: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 15,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFFF0F7F0),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: const Color(0xFFDDEADD),
              ),
            ),
            child: Column(
              children: [
                Text(
                  'Verification link sent to',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 12,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  email,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lato(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w800,
                    fontSize: 15,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 22),
          Text(
            'Open your email inbox and click the verification link. Then return to the app and press the button below.',
            textAlign: TextAlign.center,
            style: GoogleFonts.lato(
              color: Colors.grey.shade700,
              fontSize: 14,
              height: 1.55,
            ),
          ),
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              color: const Color(0xFFFFF8E7),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              crossAxisAlignment:
              CrossAxisAlignment.start,
              children: [
                const Icon(
                  Icons.info_outline_rounded,
                  color: AppColors.goldAmber,
                  size: 21,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Check your Spam or Promotions folder if the email is not visible in your inbox.',
                    style: GoogleFonts.lato(
                      color: Colors.grey.shade700,
                      fontSize: 12.5,
                      height: 1.4,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed:
              _isChecking || _isSigningOut
                  ? null
                  : () {
                _checkVerification();
              },
              style: ElevatedButton.styleFrom(
                elevation: 0,
                backgroundColor:
                AppColors.primaryGreen,
                foregroundColor: Colors.white,
                disabledBackgroundColor:
                AppColors.primaryGreen
                    .withOpacity(0.55),
                shape: RoundedRectangleBorder(
                  borderRadius:
                  BorderRadius.circular(16),
                ),
              ),
              child: _isChecking
                  ? const SizedBox(
                width: 24,
                height: 24,
                child:
                CircularProgressIndicator(
                  strokeWidth: 2.5,
                  color: Colors.white,
                ),
              )
                  : Text(
                'I HAVE VERIFIED MY EMAIL',
                style: GoogleFonts.lexend(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 11),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: OutlinedButton(
              onPressed: _isChecking ||
                  _isResending ||
                  _isSigningOut ||
                  _resendSeconds > 0
                  ? null
                  : _resendVerificationEmail,
              style: OutlinedButton.styleFrom(
                foregroundColor:
                AppColors.primaryGreen,
                side: const BorderSide(
                  color: AppColors.primaryGreen,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius:
                  BorderRadius.circular(16),
                ),
              ),
              child: _isResending
                  ? const SizedBox(
                width: 22,
                height: 22,
                child:
                CircularProgressIndicator(
                  strokeWidth: 2.4,
                  color: AppColors.primaryGreen,
                ),
              )
                  : Text(
                _resendSeconds > 0
                    ? 'RESEND IN $_resendSeconds SECONDS'
                    : 'RESEND VERIFICATION EMAIL',
                style: GoogleFonts.lexend(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 0.4,
                ),
              ),
            ),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed:
            _isChecking || _isSigningOut
                ? null
                : _signOutAndReturnToLogin,
            child: _isSigningOut
                ? const SizedBox(
              width: 20,
              height: 20,
              child:
              CircularProgressIndicator(
                strokeWidth: 2.2,
                color: AppColors.primaryGreen,
              ),
            )
                : Text(
              'Use another account',
              style: GoogleFonts.lato(
                color: Colors.grey.shade700,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _verificationTimer?.cancel();
    _resendTimer?.cancel();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Size size = MediaQuery.sizeOf(context);
    final bool isWideScreen = size.width >= 700;

    return PopScope(
      canPop: false,
      child: Scaffold(
        backgroundColor:
        AppColors.primaryGreen,
        body: Stack(
          children: [
            Positioned.fill(
              child: Container(
                decoration:
                const BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      AppColors.primaryGreen,
                      AppColors.accentGreen,
                    ],
                  ),
                ),
              ),
            ),
            Positioned(
              top: -90,
              right: -70,
              child: Container(
                width: 240,
                height: 240,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color:
                  Colors.white.withOpacity(0.08),
                ),
              ),
            ),
            Positioned(
              top: 260,
              left: -85,
              child: Container(
                width: 190,
                height: 190,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.goldAmber
                      .withOpacity(0.10),
                ),
              ),
            ),
            Positioned(
              top: 120,
              right: 34,
              child: Transform.rotate(
                angle: 0.45,
                child: Icon(
                  Icons.eco_rounded,
                  size: 34,
                  color: AppColors.goldAmber
                      .withOpacity(0.42),
                ),
              ),
            ),
            SafeArea(
              child: SingleChildScrollView(
                padding: EdgeInsets.fromLTRB(
                  isWideScreen ? 80 : 20,
                  28,
                  isWideScreen ? 80 : 20,
                  32,
                ),
                child: Center(
                  child: ConstrainedBox(
                    constraints:
                    const BoxConstraints(
                      maxWidth: 520,
                    ),
                    child: Column(
                      children: [
                        _buildHeader(),
                        const SizedBox(height: 32),
                        _buildVerificationCard(),
                        const SizedBox(height: 22),
                        Text(
                          'Secure authentication powered by Firebase',
                          textAlign:
                          TextAlign.center,
                          style: GoogleFonts.lato(
                            color: Colors.white
                                .withOpacity(0.58),
                            fontSize: 11,
                            fontWeight:
                            FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}