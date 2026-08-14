import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../services/auth_service.dart';
import '../../services/cart_service.dart';
import '../home/home_screen.dart';
import 'forgot_password_screen.dart';
import 'otp_verification_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({
    super.key,
    this.initialEmail,
    this.initialMessage,
  });

  final String? initialEmail;
  final String? initialMessage;

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final TextEditingController _inputController =
  TextEditingController();

  final TextEditingController _passwordController =
  TextEditingController();

  final FocusNode _inputFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();

  final AuthService _authService = AuthService();
  final CartService _cartService = CartService();

  bool _isPasswordVisible = false;
  bool _isLoading = false;
  bool _rememberEmail = true;

  String _activeAction = '';

  bool get _isPhoneNumber {
    final String value = _inputController.text.trim();

    return RegExp(r'^[6-9][0-9]{9}$').hasMatch(value);
  }

  bool get _hasInput {
    return _inputController.text.trim().isNotEmpty;
  }

  @override
  void initState() {
    super.initState();

    final String initialEmail =
        widget.initialEmail?.trim() ?? '';

    if (initialEmail.isNotEmpty) {
      _inputController.text = initialEmail;
    }

    final String initialMessage =
        widget.initialMessage?.trim() ?? '';

    if (initialMessage.isNotEmpty) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _showMessage(
          message: initialMessage,
          isError: true,
        );
      });
    }
  }

  String? _validateEmailOrPhone(String? value) {
    final String input = value?.trim() ?? '';

    if (input.isEmpty) {
      return 'Email address or mobile number is required';
    }

    if (RegExp(r'^[0-9]+$').hasMatch(input)) {
      if (!RegExp(r'^[6-9][0-9]{9}$').hasMatch(input)) {
        return 'Enter a valid 10-digit Indian mobile number';
      }

      return null;
    }

    final RegExp emailPattern = RegExp(
      r'^[a-zA-Z0-9.!#$%&'
      r"'"
      r'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+'
      r'(?:\.[a-zA-Z0-9-]+)+$',
    );

    if (!emailPattern.hasMatch(input)) {
      return 'Enter a valid email address';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    if (_isPhoneNumber) {
      return null;
    }

    final String password = value ?? '';

    if (password.isEmpty) {
      return 'Password is required';
    }

    if (password.length < 6) {
      return 'Password must contain at least 6 characters';
    }

    return null;
  }

  void _setLoading({
    required bool value,
    String action = '',
  }) {
    if (!mounted) {
      return;
    }

    setState(() {
      _isLoading = value;
      _activeAction = value ? action : '';
    });
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
          duration: const Duration(seconds: 5),
          elevation: 12,
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
      case 'invalid-email':
        return 'The email address is not valid.';

      case 'user-not-found':
        return 'No registered account was found with this email address.';

      case 'wrong-password':
        return 'The password you entered is incorrect.';

      case 'invalid-credential':
        return 'Incorrect email address or password.';

      case 'user-disabled':
        return 'This account has been disabled. Contact support.';

      case 'too-many-requests':
        return 'Too many attempts. Please wait and try again.';

      case 'network-request-failed':
        return 'Unable to connect. Check your internet connection.';

      case 'operation-not-allowed':
        return 'This login method is not enabled in Firebase.';

      case 'invalid-phone-number':
        return 'Enter a valid mobile number.';

      case 'quota-exceeded':
        return 'SMS quota has been exceeded. Try again later.';

      case 'billing-not-enabled':
        return 'Firebase Phone Authentication requires billing configuration.';

      case 'account-exists-with-different-credential':
        return 'This email is already connected to another login method.';

      case 'popup-blocked':
        return 'The sign-in popup was blocked by the browser.';

      case 'popup-closed-by-user':
      case 'cancelled-popup-request':
        return 'Sign-in was cancelled.';

      case 'missing-google-id-token':
        return 'Google authentication token was not received.';

      case 'google-sign-in-failed':
        return error.message ??
            'Google sign-in could not be completed.';

      case 'email-not-verified':
        return 'Verify your email address before logging in.';

      default:
        return error.message ??
            'Authentication failed. Please try again.';
    }
  }

  Future<void> _goHome() async {
    await _cartService.resetCartForNewLogin();

    if (!mounted) {
      return;
    }

    Navigator.of(context).pushAndRemoveUntil(
      PageRouteBuilder<void>(
        transitionDuration:
        const Duration(milliseconds: 650),
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
            begin: const Offset(0, 0.06),
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

  Future<void> _handleLogin() async {
    FocusScope.of(context).unfocus();

    final bool valid =
        _formKey.currentState?.validate() ?? false;

    if (!valid || _isLoading) {
      return;
    }

    if (_isPhoneNumber) {
      await _handlePhoneLogin();
      return;
    }

    await _handleEmailLogin();
  }

  Future<void> _handleEmailLogin() async {
    _setLoading(
      value: true,
      action: 'email',
    );

    try {
      final String email =
      _inputController.text.trim().toLowerCase();

      final String password =
          _passwordController.text;

      final UserCredential? credential =
      await _authService.loginWithEmailPassword(
        email,
        password,
      );

      User? user = credential?.user;

      if (user == null) {
        throw FirebaseAuthException(
          code: 'user-not-found',
          message: 'No registered user was found.',
        );
      }

      await user.reload();

      user = FirebaseAuth.instance.currentUser;

      if (user == null) {
        throw FirebaseAuthException(
          code: 'user-not-found',
          message: 'Unable to load this user account.',
        );
      }

      final bool usesPasswordProvider =
      user.providerData.any(
            (UserInfo provider) {
          return provider.providerId == 'password';
        },
      );

      if (usesPasswordProvider &&
          !user.emailVerified) {
        await _showEmailVerificationDialog(user);

        await _authService.signOut();

        return;
      }

      if (!mounted) {
        return;
      }

      _showMessage(
        message:
        'Welcome back, ${_userDisplayName(user)}.',
        isError: false,
      );

      await Future<void>.delayed(
        const Duration(milliseconds: 300),
      );

      await _goHome();
    } on FirebaseAuthException catch (error) {
      await _safeSignOutAfterFailedEmailLogin();

      _showMessage(
        message: _firebaseErrorMessage(error),
        isError: true,
      );
    } catch (_) {
      await _safeSignOutAfterFailedEmailLogin();

      _showMessage(
        message: 'Login failed. Please try again.',
        isError: true,
      );
    } finally {
      _setLoading(value: false);
    }
  }

  Future<void> _safeSignOutAfterFailedEmailLogin() async {
    try {
      final User? currentUser =
          FirebaseAuth.instance.currentUser;

      if (currentUser != null &&
          currentUser.providerData.any(
                (UserInfo provider) =>
            provider.providerId == 'password',
          )) {
        await _authService.signOut();
      }
    } catch (_) {
      // The login screen remains available when sign-out fails.
    }
  }

  String _userDisplayName(User user) {
    final String displayName =
        user.displayName?.trim() ?? '';

    if (displayName.isNotEmpty) {
      return displayName
          .split(RegExp(r'\s+'))
          .first;
    }

    final String email = user.email ?? '';

    if (email.contains('@')) {
      return email.split('@').first;
    }

    return 'User';
  }

  Future<void> _showEmailVerificationDialog(
      User user,
      ) async {
    if (!mounted) {
      return;
    }

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        bool isSending = false;
        bool isChecking = false;

        return StatefulBuilder(
          builder: (
              BuildContext context,
              void Function(void Function()) setDialogState,
              ) {
            Future<void> resendVerification() async {
              setDialogState(() {
                isSending = true;
              });

              try {
                await user.sendEmailVerification();

                if (!dialogContext.mounted) {
                  return;
                }

                _showMessage(
                  message:
                  'A new verification email has been sent.',
                  isError: false,
                );
              } on FirebaseAuthException catch (error) {
                _showMessage(
                  message:
                  _firebaseErrorMessage(error),
                  isError: true,
                );
              } finally {
                if (dialogContext.mounted) {
                  setDialogState(() {
                    isSending = false;
                  });
                }
              }
            }

            Future<void> checkVerification() async {
              setDialogState(() {
                isChecking = true;
              });

              try {
                await user.reload();

                final User? refreshedUser =
                    FirebaseAuth.instance.currentUser;

                if (refreshedUser != null &&
                    refreshedUser.emailVerified) {
                  if (dialogContext.mounted) {
                    Navigator.of(dialogContext).pop();
                  }

                  _showMessage(
                    message:
                    'Email verified successfully.',
                    isError: false,
                  );

                  await Future<void>.delayed(
                    const Duration(milliseconds: 250),
                  );

                  await _goHome();

                  return;
                }

                _showMessage(
                  message:
                  'Email is not verified yet. Open your inbox and click the verification link.',
                  isError: true,
                );
              } on FirebaseAuthException catch (error) {
                _showMessage(
                  message:
                  _firebaseErrorMessage(error),
                  isError: true,
                );
              } finally {
                if (dialogContext.mounted) {
                  setDialogState(() {
                    isChecking = false;
                  });
                }
              }
            }

            return PopScope(
              canPop: false,
              child: Dialog(
                backgroundColor: Colors.transparent,
                insetPadding:
                const EdgeInsets.symmetric(
                  horizontal: 24,
                ),
                child: Container(
                  constraints: const BoxConstraints(
                    maxWidth: 440,
                  ),
                  padding: const EdgeInsets.fromLTRB(
                    24,
                    28,
                    24,
                    22,
                  ),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius:
                    BorderRadius.circular(28),
                    boxShadow: const [
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 32,
                        offset: Offset(0, 16),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Container(
                        width: 84,
                        height: 84,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient:
                          const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              AppColors.primaryGreen,
                              AppColors.accentGreen,
                            ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors
                                  .primaryGreen
                                  .withOpacity(0.28),
                              blurRadius: 22,
                              offset:
                              const Offset(0, 11),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons
                              .mark_email_unread_outlined,
                          color: Colors.white,
                          size: 42,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Verify Your Email',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lexend(
                          fontSize: 23,
                          fontWeight: FontWeight.w700,
                          color:
                          const Color(0xFF1F2D23),
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'A verification link was sent to',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 6),
                      Container(
                        padding:
                        const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 10,
                        ),
                        decoration: BoxDecoration(
                          color:
                          const Color(0xFFF0F7F0),
                          borderRadius:
                          BorderRadius.circular(12),
                        ),
                        child: Text(
                          user.email ?? '',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.lato(
                            color:
                            AppColors.primaryGreen,
                            fontWeight: FontWeight.w700,
                            fontSize: 14,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Open your email inbox, click the verification link, return to the app and press the button below.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          height: 1.45,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 22),
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed:
                          isChecking || isSending
                              ? null
                              : checkVerification,
                          style:
                          ElevatedButton.styleFrom(
                            elevation: 0,
                            backgroundColor:
                            AppColors.primaryGreen,
                            foregroundColor:
                            Colors.white,
                            shape:
                            RoundedRectangleBorder(
                              borderRadius:
                              BorderRadius.circular(
                                15,
                              ),
                            ),
                          ),
                          child: isChecking
                              ? const SizedBox(
                            width: 23,
                            height: 23,
                            child:
                            CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                              : Text(
                            'I HAVE VERIFIED MY EMAIL',
                            style:
                            GoogleFonts.lexend(
                              fontSize: 13,
                              fontWeight:
                              FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 10),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: OutlinedButton(
                          onPressed:
                          isChecking || isSending
                              ? null
                              : resendVerification,
                          style:
                          OutlinedButton.styleFrom(
                            foregroundColor:
                            AppColors.primaryGreen,
                            side: const BorderSide(
                              color:
                              AppColors.primaryGreen,
                            ),
                            shape:
                            RoundedRectangleBorder(
                              borderRadius:
                              BorderRadius.circular(
                                15,
                              ),
                            ),
                          ),
                          child: isSending
                              ? const SizedBox(
                            width: 22,
                            height: 22,
                            child:
                            CircularProgressIndicator(
                              strokeWidth: 2.4,
                              color: AppColors
                                  .primaryGreen,
                            ),
                          )
                              : Text(
                            'RESEND VERIFICATION EMAIL',
                            style:
                            GoogleFonts.lexend(
                              fontSize: 12,
                              fontWeight:
                              FontWeight.w700,
                              letterSpacing: 0.4,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 6),
                      TextButton(
                        onPressed:
                        isChecking || isSending
                            ? null
                            : () {
                          Navigator.of(
                            dialogContext,
                          ).pop();
                        },
                        child: Text(
                          'Back to login',
                          style: GoogleFonts.lato(
                            color:
                            Colors.grey.shade700,
                            fontWeight:
                            FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );
  }

  Future<void> _handlePhoneLogin() async {
    if (kIsWeb) {
      _showMessage(
        message:
        'Phone OTP login is currently available in the Android app.',
        isError: true,
      );

      return;
    }

    _setLoading(
      value: true,
      action: 'phone',
    );

    final String phoneNumber =
        '+91${_inputController.text.trim()}';

    try {
      await _authService.sendOtp(
        phoneNumber: phoneNumber,
        onVerificationCompleted:
            (PhoneAuthCredential credential) async {
          try {
            final UserCredential? userCredential =
            await _authService
                .signInWithCredential(
              credential,
            );

            if (userCredential?.user != null) {
              await _goHome();
            }
          } on FirebaseAuthException catch (error) {
            _showMessage(
              message:
              _firebaseErrorMessage(error),
              isError: true,
            );
          } catch (_) {
            _showMessage(
              message:
              'Automatic phone verification failed.',
              isError: true,
            );
          } finally {
            _setLoading(value: false);
          }
        },
        onVerificationFailed:
            (FirebaseAuthException error) {
          _setLoading(value: false);

          _showMessage(
            message: _firebaseErrorMessage(error),
            isError: true,
          );
        },
        onCodeSent: (
            String verificationId,
            int? forceResendingToken,
            ) {
          _setLoading(value: false);

          if (!mounted) {
            return;
          }

          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) =>
                  OtpVerificationScreen(
                    verificationId: verificationId,
                    phoneNumber: phoneNumber,
                  ),
            ),
          );
        },
        onCodeAutoRetrievalTimeout:
            (String verificationId) {
          _setLoading(value: false);
        },
      );
    } on FirebaseAuthException catch (error) {
      _setLoading(value: false);

      _showMessage(
        message: _firebaseErrorMessage(error),
        isError: true,
      );
    } catch (_) {
      _setLoading(value: false);

      _showMessage(
        message:
        'Unable to send OTP. Please try again.',
        isError: true,
      );
    }
  }

  Future<bool> _verifyNewGoogleAccount(User user) async {
    if (!mounted) return false;

    bool verified = false;

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        bool isChecking = false;

        return StatefulBuilder(
          builder: (BuildContext context, void Function(void Function()) setDialogState) {
            Future<void> checkGoogleVerification() async {
              setDialogState(() => isChecking = true);

              try {
                await user.reload();
                final User? refreshedUser = FirebaseAuth.instance.currentUser;

                if (!dialogContext.mounted) return;

                if (!(refreshedUser?.emailVerified ?? false)) {
                  _showMessage(
                    message: 'Google could not verify this email address. Try another Google account.',
                    isError: true,
                  );
                  return;
                }

                verified = true;
                Navigator.of(dialogContext).pop();
              } on FirebaseAuthException catch (error) {
                _showMessage(
                  message: _firebaseErrorMessage(error),
                  isError: true,
                );
              } finally {
                if (dialogContext.mounted) {
                  setDialogState(() => isChecking = false);
                }
              }
            }

            return PopScope(
              canPop: false,
              child: Dialog(
                backgroundColor: Colors.transparent,
                insetPadding: const EdgeInsets.symmetric(horizontal: 22),
                child: Container(
                  constraints: const BoxConstraints(maxWidth: 440),
                  padding: const EdgeInsets.fromLTRB(24, 28, 24, 22),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(28),
                    boxShadow: const <BoxShadow>[
                      BoxShadow(
                        color: Colors.black26,
                        blurRadius: 32,
                        offset: Offset(0, 16),
                      ),
                    ],
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Container(
                        width: 82,
                        height: 82,
                        decoration: const BoxDecoration(
                          shape: BoxShape.circle,
                          gradient: LinearGradient(
                            colors: <Color>[
                              AppColors.primaryGreen,
                              AppColors.accentGreen,
                            ],
                          ),
                        ),
                        child: const Icon(
                          Icons.verified_user_rounded,
                          color: Colors.white,
                          size: 42,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Verify New Google Account',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lexend(
                          color: const Color(0xFF1F2D23),
                          fontSize: 22,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Text(
                        'This Google account is being used for the first time in Farm To Home.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          fontSize: 14,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF0F7F0),
                          borderRadius: BorderRadius.circular(13),
                        ),
                        child: Text(
                          user.email ?? 'Google account',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.lato(
                            color: AppColors.primaryGreen,
                            fontSize: 14,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                      const SizedBox(height: 14),
                      Text(
                        'Google verifies this email. Press Verify & Continue to complete first-time account verification.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade700,
                          fontSize: 13,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 22),
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton.icon(
                          onPressed: isChecking ? null : checkGoogleVerification,
                          icon: isChecking
                              ? const SizedBox(
                            width: 21,
                            height: 21,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.4,
                              color: Colors.white,
                            ),
                          )
                              : const Icon(Icons.verified_rounded),
                          label: Text(
                            isChecking ? 'VERIFYING...' : 'VERIFY & CONTINUE',
                            style: GoogleFonts.lexend(
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primaryGreen,
                            foregroundColor: Colors.white,
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(15),
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 8),
                      TextButton(
                        onPressed: isChecking
                            ? null
                            : () async {
                          Navigator.of(dialogContext).pop();
                          await _authService.signOut();
                        },
                        child: Text(
                          'Use another account',
                          style: GoogleFonts.lato(
                            color: Colors.grey.shade700,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );

    return verified;
  }

  Future<void> _handleGoogleSignIn() async {
    if (_isLoading) {
      return;
    }

    _setLoading(
      value: true,
      action: 'google',
    );

    try {
      final UserCredential? userCredential =
      await _authService.signInWithGoogle();

      final User? googleUser = userCredential?.user;

      if (googleUser == null) {
        _showMessage(
          message: 'Google sign-in was cancelled.',
          isError: true,
        );

        return;
      }

      final bool isNewGoogleUser =
          userCredential?.additionalUserInfo?.isNewUser ?? false;

      if (!isNewGoogleUser) {
        await _goHome();
        return;
      }

      final bool verified =
      await _verifyNewGoogleAccount(googleUser);

      if (!verified) {
        return;
      }

      await _goHome();
    } on FirebaseAuthException catch (error) {
      _showMessage(
        message: _firebaseErrorMessage(error),
        isError: true,
      );
    } catch (_) {
      _showMessage(
        message:
        'Google sign-in could not be completed.',
        isError: true,
      );
    } finally {
      _setLoading(value: false);
    }
  }

  Future<void> _handleAppleSignIn() async {
    if (_isLoading) {
      return;
    }

    _setLoading(
      value: true,
      action: 'apple',
    );

    try {
      final UserCredential? userCredential =
      await _authService.signInWithApple();

      if (userCredential?.user == null) {
        _showMessage(
          message: 'Apple sign-in was cancelled.',
          isError: true,
        );

        return;
      }

      await _goHome();
    } on FirebaseAuthException catch (error) {
      _showMessage(
        message: _firebaseErrorMessage(error),
        isError: true,
      );
    } catch (_) {
      _showMessage(
        message:
        'Apple sign-in could not be completed.',
        isError: true,
      );
    } finally {
      _setLoading(value: false);
    }
  }

  Future<void> _openRegisterScreen() async {
    if (_isLoading) {
      return;
    }

    final String? registeredEmail =
    await Navigator.of(context).push<String>(
      MaterialPageRoute<String>(
        builder: (_) => const RegisterScreen(),
      ),
    );

    if (!mounted ||
        registeredEmail == null ||
        registeredEmail.trim().isEmpty) {
      return;
    }

    setState(() {
      _inputController.text =
          registeredEmail.trim();

      _passwordController.clear();
    });

    _passwordFocusNode.requestFocus();

    _showMessage(
      message:
      'Account created. Verify your email before logging in.',
      isError: false,
    );
  }

  Future<void> _openForgotPassword() async {
    if (_isLoading) {
      return;
    }

    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) =>
        const ForgotPasswordScreen(),
      ),
    );
  }

  InputDecoration _fieldDecoration({
    required String label,
    required String hint,
    required IconData icon,
    Widget? suffixIcon,
    String? prefixText,
  }) {
    return InputDecoration(
      labelText: label,
      hintText: hint,
      prefixText: prefixText,
      prefixIcon: Icon(
        icon,
        color: AppColors.primaryGreen,
      ),
      suffixIcon: suffixIcon,
      labelStyle: GoogleFonts.lato(
        color: Colors.grey.shade600,
        fontWeight: FontWeight.w600,
      ),
      hintStyle: GoogleFonts.lato(
        color: Colors.grey.shade400,
      ),
      prefixStyle: GoogleFonts.lato(
        color: AppColors.darkText,
        fontWeight: FontWeight.w700,
      ),
      filled: true,
      fillColor: const Color(0xFFF7FAF7),
      contentPadding: const EdgeInsets.symmetric(
        vertical: 18,
        horizontal: 16,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(
          color: Color(0xFFE0E9E1),
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(
          color: AppColors.primaryGreen,
          width: 1.8,
        ),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(
          color: Colors.redAccent,
        ),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(
          color: Colors.red,
          width: 1.5,
        ),
      ),
    );
  }

  ButtonStyle _socialButtonStyle() {
    return OutlinedButton.styleFrom(
      elevation: 0,
      foregroundColor: AppColors.darkText,
      backgroundColor: Colors.white,
      side: const BorderSide(
        color: Color(0xFFDDE5DE),
      ),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
    );
  }

  Widget _buildMainButton() {
    final bool phoneLogin = _isPhoneNumber;

    return Container(
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(17),
        gradient: const LinearGradient(
          begin: Alignment.centerLeft,
          end: Alignment.centerRight,
          colors: [
            AppColors.primaryGreen,
            AppColors.accentGreen,
          ],
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen
                .withOpacity(0.28),
            blurRadius: 18,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed:
        _isLoading ? null : _handleLogin,
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: Colors.transparent,
          disabledBackgroundColor:
          Colors.transparent,
          shadowColor: Colors.transparent,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(17),
          ),
        ),
        child: AnimatedSwitcher(
          duration:
          const Duration(milliseconds: 220),
          child: _isLoading &&
              (_activeAction == 'email' ||
                  _activeAction == 'phone')
              ? const SizedBox(
            key:
            ValueKey<String>('main-loading'),
            width: 25,
            height: 25,
            child: CircularProgressIndicator(
              strokeWidth: 2.7,
              color: Colors.white,
            ),
          )
              : Row(
            key: ValueKey<bool>(phoneLogin),
            mainAxisAlignment:
            MainAxisAlignment.center,
            children: [
              Text(
                phoneLogin
                    ? 'SEND OTP'
                    : 'LOGIN SECURELY',
                style: GoogleFonts.lexend(
                  fontSize: 15,
                  fontWeight:
                  FontWeight.w700,
                  letterSpacing: 0.9,
                ),
              ),
              const SizedBox(width: 10),
              Icon(
                phoneLogin
                    ? Icons.sms_outlined
                    : Icons
                    .arrow_forward_rounded,
                size: 21,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSocialButton({
    required String action,
    required VoidCallback onPressed,
    required Widget icon,
    required String label,
  }) {
    final bool actionLoading =
        _isLoading && _activeAction == action;

    return SizedBox(
      width: double.infinity,
      height: 54,
      child: OutlinedButton(
        onPressed: _isLoading ? null : onPressed,
        style: _socialButtonStyle(),
        child: actionLoading
            ? const SizedBox(
          width: 22,
          height: 22,
          child: CircularProgressIndicator(
            strokeWidth: 2.4,
            color: AppColors.primaryGreen,
          ),
        )
            : Row(
          children: [
            SizedBox(
              width: 28,
              child: Center(child: icon),
            ),
            Expanded(
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: GoogleFonts.lato(
                  color: AppColors.darkText,
                  fontWeight:
                  FontWeight.w700,
                  fontSize: 15,
                ),
              ),
            ),
            const SizedBox(width: 28),
          ],
        ),
      ),
    );
  }

  Widget _buildLoginCard() {
    final bool phoneLogin = _isPhoneNumber;

    return FadeInUp(
      duration: const Duration(milliseconds: 700),
      child: Container(
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
              blurRadius: 35,
              offset: const Offset(0, 18),
            ),
          ],
        ),
        child: Form(
          key: _formKey,
          autovalidateMode:
          AutovalidateMode.onUserInteraction,
          child: Column(
            crossAxisAlignment:
            CrossAxisAlignment.stretch,
            children: [
              Text(
                'Welcome Back',
                style: GoogleFonts.lexend(
                  fontSize: 25,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF213027),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Login with your verified account details.',
                style: GoogleFonts.lato(
                  fontSize: 14,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 25),
              TextFormField(
                controller: _inputController,
                focusNode: _inputFocusNode,
                keyboardType:
                TextInputType.emailAddress,
                textInputAction: phoneLogin
                    ? TextInputAction.done
                    : TextInputAction.next,
                autofillHints: const [
                  AutofillHints.email,
                  AutofillHints.username,
                  AutofillHints.telephoneNumber,
                ],
                autocorrect: false,
                enableSuggestions: false,
                onChanged: (_) {
                  setState(() {});
                },
                onFieldSubmitted: (_) {
                  if (phoneLogin) {
                    _handleLogin();
                  } else {
                    _passwordFocusNode
                        .requestFocus();
                  }
                },
                decoration: _fieldDecoration(
                  label: 'Email or Mobile Number',
                  hint:
                  'Enter registered email or mobile number',
                  icon: phoneLogin
                      ? Icons.phone_android_rounded
                      : Icons
                      .alternate_email_rounded,
                  prefixText:
                  phoneLogin ? '+91  ' : null,
                  suffixIcon: _hasInput
                      ? IconButton(
                    tooltip: 'Clear',
                    onPressed: _isLoading
                        ? null
                        : () {
                      setState(() {
                        _inputController
                            .clear();

                        _passwordController
                            .clear();
                      });
                    },
                    icon: Icon(
                      Icons.cancel_rounded,
                      color:
                      Colors.grey.shade400,
                    ),
                  )
                      : null,
                ),
                validator: _validateEmailOrPhone,
              ),
              AnimatedSwitcher(
                duration:
                const Duration(milliseconds: 250),
                transitionBuilder: (
                    Widget child,
                    Animation<double> animation,
                    ) {
                  return SizeTransition(
                    sizeFactor: animation,
                    child: FadeTransition(
                      opacity: animation,
                      child: child,
                    ),
                  );
                },
                child: phoneLogin
                    ? Padding(
                  key: const ValueKey<String>(
                    'phone-information',
                  ),
                  padding:
                  const EdgeInsets.only(
                    top: 12,
                  ),
                  child: Container(
                    padding:
                    const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: const Color(
                        0xFFF0F7F0,
                      ),
                      borderRadius:
                      BorderRadius.circular(
                        13,
                      ),
                    ),
                    child: Row(
                      children: [
                        const Icon(
                          Icons
                              .verified_user_outlined,
                          size: 19,
                          color: AppColors
                              .primaryGreen,
                        ),
                        const SizedBox(width: 9),
                        Expanded(
                          child: Text(
                            kIsWeb
                                ? 'Phone OTP login is available in the Android app.'
                                : 'A secure OTP will be sent to this mobile number.',
                            style:
                            GoogleFonts.lato(
                              color: AppColors
                                  .primaryGreen,
                              fontSize: 12,
                              fontWeight:
                              FontWeight.w600,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                )
                    : Column(
                  key: const ValueKey<String>(
                    'password-section',
                  ),
                  children: [
                    const SizedBox(height: 16),
                    TextFormField(
                      controller:
                      _passwordController,
                      focusNode:
                      _passwordFocusNode,
                      obscureText:
                      !_isPasswordVisible,
                      textInputAction:
                      TextInputAction.done,
                      autofillHints: const [
                        AutofillHints.password,
                      ],
                      autocorrect: false,
                      enableSuggestions: false,
                      onFieldSubmitted: (_) {
                        _handleLogin();
                      },
                      decoration:
                      _fieldDecoration(
                        label: 'Password',
                        hint:
                        'Enter your password',
                        icon: Icons
                            .lock_outline_rounded,
                        suffixIcon: IconButton(
                          tooltip:
                          _isPasswordVisible
                              ? 'Hide password'
                              : 'Show password',
                          onPressed: _isLoading
                              ? null
                              : () {
                            setState(() {
                              _isPasswordVisible =
                              !_isPasswordVisible;
                            });
                          },
                          icon: Icon(
                            _isPasswordVisible
                                ? Icons
                                .visibility_rounded
                                : Icons
                                .visibility_off_rounded,
                            color: AppColors
                                .primaryGreen,
                          ),
                        ),
                      ),
                      validator:
                      _validatePassword,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value:
                            _rememberEmail,
                            activeColor:
                            AppColors
                                .primaryGreen,
                            shape:
                            RoundedRectangleBorder(
                              borderRadius:
                              BorderRadius
                                  .circular(5),
                            ),
                            onChanged: _isLoading
                                ? null
                                : (bool? value) {
                              setState(() {
                                _rememberEmail =
                                    value ??
                                        true;
                              });
                            },
                          ),
                        ),
                        const SizedBox(width: 7),
                        Text(
                          'Remember email',
                          style:
                          GoogleFonts.lato(
                            color: Colors
                                .grey.shade600,
                            fontSize: 13,
                            fontWeight:
                            FontWeight.w600,
                          ),
                        ),
                        const Spacer(),
                        TextButton(
                          onPressed:
                          _openForgotPassword,
                          child: Text(
                            'Forgot password?',
                            style:
                            GoogleFonts.lato(
                              color: AppColors
                                  .primaryGreen,
                              fontWeight:
                              FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 18),
              _buildMainButton(),
              const SizedBox(height: 23),
              Row(
                children: [
                  Expanded(
                    child: Divider(
                      color: Colors.grey.shade300,
                    ),
                  ),
                  Padding(
                    padding:
                    const EdgeInsets.symmetric(
                      horizontal: 13,
                    ),
                    child: Text(
                      'OR CONTINUE WITH',
                      style: GoogleFonts.lato(
                        color:
                        Colors.grey.shade500,
                        fontWeight:
                        FontWeight.w700,
                        fontSize: 11,
                        letterSpacing: 0.7,
                      ),
                    ),
                  ),
                  Expanded(
                    child: Divider(
                      color: Colors.grey.shade300,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 19),
              _buildSocialButton(
                action: 'google',
                onPressed: _handleGoogleSignIn,
                icon: Image.asset(
                  'assets/icons/google logo.png',
                  width: 22,
                  height: 22,
                  errorBuilder: (
                      BuildContext context,
                      Object error,
                      StackTrace? stackTrace,
                      ) {
                    return const Icon(
                      Icons.g_mobiledata_rounded,
                      color: Colors.red,
                      size: 30,
                    );
                  },
                ),
                label: 'Continue with Google',
              ),
              const SizedBox(height: 12),
              _buildSocialButton(
                action: 'apple',
                onPressed: _handleAppleSignIn,
                icon: const Icon(
                  Icons.apple_rounded,
                  color: Colors.black,
                  size: 27,
                ),
                label: 'Continue with Apple',
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _inputController.dispose();
    _passwordController.dispose();
    _inputFocusNode.dispose();
    _passwordFocusNode.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Size screenSize =
    MediaQuery.sizeOf(context);

    final bool isWideScreen =
        screenSize.width >= 700;

    final bool isSmallHeight =
        screenSize.height < 720;

    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: AppColors.primaryGreen,
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
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
            top: -80,
            right: -55,
            child: Container(
              width: 220,
              height: 220,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color:
                Colors.white.withOpacity(0.10),
              ),
            ),
          ),
          Positioned(
            top: 235,
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
            top: 110,
            right: 32,
            child: Transform.rotate(
              angle: 0.45,
              child: Icon(
                Icons.eco_rounded,
                color: AppColors.goldAmber
                    .withOpacity(0.42),
                size: 34,
              ),
            ),
          ),
          Positioned(
            top: 270,
            left: 30,
            child: Transform.rotate(
              angle: -0.4,
              child: Icon(
                Icons.eco_outlined,
                color:
                Colors.white.withOpacity(0.25),
                size: 29,
              ),
            ),
          ),
          SafeArea(
            child: SingleChildScrollView(
              keyboardDismissBehavior:
              ScrollViewKeyboardDismissBehavior
                  .onDrag,
              padding: EdgeInsets.fromLTRB(
                isWideScreen ? 70 : 20,
                isSmallHeight ? 18 : 28,
                isWideScreen ? 70 : 20,
                32,
              ),
              child: Center(
                child: ConstrainedBox(
                  constraints:
                  const BoxConstraints(
                    maxWidth: 500,
                  ),
                  child: Column(
                    children: [
                      FadeInDown(
                        duration: const Duration(
                          milliseconds: 650,
                        ),
                        child: Column(
                          children: [
                            Container(
                              width: 82,
                              height: 82,
                              decoration:
                              BoxDecoration(
                                color: Colors.white,
                                shape:
                                BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: Colors
                                        .black
                                        .withOpacity(
                                      0.20,
                                    ),
                                    blurRadius: 22,
                                    offset:
                                    const Offset(
                                      0,
                                      11,
                                    ),
                                  ),
                                ],
                              ),
                              child: const Icon(
                                Icons.eco_rounded,
                                color: AppColors
                                    .primaryGreen,
                                size: 46,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Farm To Home',
                              textAlign:
                              TextAlign.center,
                              style:
                              GoogleFonts.lexend(
                                fontSize: 30,
                                fontWeight:
                                FontWeight.w700,
                                letterSpacing: 0.2,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              'Fresh from farm, delivered with care',
                              textAlign:
                              TextAlign.center,
                              style: GoogleFonts.lato(
                                color: Colors.white
                                    .withOpacity(0.78),
                                fontSize: 15,
                              ),
                            ),
                          ],
                        ),
                      ),
                      SizedBox(
                        height:
                        isSmallHeight ? 24 : 36,
                      ),
                      _buildLoginCard(),
                      const SizedBox(height: 24),
                      FadeInUp(
                        delay: const Duration(
                          milliseconds: 180,
                        ),
                        child: Wrap(
                          alignment:
                          WrapAlignment.center,
                          crossAxisAlignment:
                          WrapCrossAlignment.center,
                          children: [
                            Text(
                              'New to Farm To Home? ',
                              style: GoogleFonts.lato(
                                color: Colors.white
                                    .withOpacity(0.78),
                                fontSize: 14,
                              ),
                            ),
                            GestureDetector(
                              onTap: _isLoading
                                  ? null
                                  : _openRegisterScreen,
                              child: Text(
                                'Create an account',
                                style:
                                GoogleFonts.lato(
                                  color: Colors.white,
                                  fontSize: 14,
                                  fontWeight:
                                  FontWeight.w800,
                                  decoration:
                                  TextDecoration
                                      .underline,
                                  decorationColor:
                                  Colors.white,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'Secure authentication powered by Firebase',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lato(
                          color: Colors.white
                              .withOpacity(0.58),
                          fontSize: 11,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          if (_isLoading)
            Positioned.fill(
              child: IgnorePointer(
                child: Container(
                  color:
                  Colors.black.withOpacity(0.04),
                ),
              ),
            ),
        ],
      ),
    );
  }
}