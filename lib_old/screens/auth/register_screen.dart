import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../services/auth_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() =>
      _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final GlobalKey<FormState> _formKey =
  GlobalKey<FormState>();

  final TextEditingController _firstNameController =
  TextEditingController();

  final TextEditingController _lastNameController =
  TextEditingController();

  final TextEditingController _phoneController =
  TextEditingController();

  final TextEditingController _emailController =
  TextEditingController();

  final TextEditingController _passwordController =
  TextEditingController();

  final TextEditingController _confirmPasswordController =
  TextEditingController();

  final FocusNode _firstNameFocusNode = FocusNode();
  final FocusNode _lastNameFocusNode = FocusNode();
  final FocusNode _phoneFocusNode = FocusNode();
  final FocusNode _emailFocusNode = FocusNode();
  final FocusNode _passwordFocusNode = FocusNode();
  final FocusNode _confirmPasswordFocusNode = FocusNode();

  final AuthService _authService = AuthService();

  bool _isPasswordVisible = false;
  bool _isConfirmPasswordVisible = false;
  bool _isLoading = false;
  bool _acceptTerms = false;

  String _loadingMessage = 'Creating your account...';

  double get _passwordStrength {
    final String password =
        _passwordController.text;

    if (password.isEmpty) {
      return 0;
    }

    double strength = 0;

    if (password.length >= 8) {
      strength += 0.20;
    }

    if (password.length >= 12) {
      strength += 0.15;
    }

    if (RegExp(r'[A-Z]').hasMatch(password)) {
      strength += 0.15;
    }

    if (RegExp(r'[a-z]').hasMatch(password)) {
      strength += 0.15;
    }

    if (RegExp(r'[0-9]').hasMatch(password)) {
      strength += 0.15;
    }

    if (RegExp(
      r'[!@#$%^&*(),.?":{}|<>_\-+=]',
    ).hasMatch(password)) {
      strength += 0.20;
    }

    return strength.clamp(0.0, 1.0);
  }

  String get _passwordStrengthText {
    final double strength = _passwordStrength;

    if (strength == 0) {
      return '';
    }

    if (strength <= 0.35) {
      return 'Weak password';
    }

    if (strength <= 0.70) {
      return 'Medium password';
    }

    return 'Strong password';
  }

  Color get _passwordStrengthColor {
    final double strength = _passwordStrength;

    if (strength <= 0.35) {
      return Colors.red;
    }

    if (strength <= 0.70) {
      return Colors.orange;
    }

    return Colors.green;
  }

  String? _validateName(
      String? value,
      String fieldName,
      ) {
    final String name = value?.trim() ?? '';

    if (name.isEmpty) {
      return '$fieldName is required';
    }

    if (name.length < 2) {
      return '$fieldName must contain at least 2 characters';
    }

    if (!RegExp(r"^[a-zA-Z\s'-]+$")
        .hasMatch(name)) {
      return 'Enter a valid $fieldName';
    }

    return null;
  }

  String? _validatePhone(String? value) {
    final String phone = value?.trim() ?? '';

    if (phone.isEmpty) {
      return 'Phone number is required';
    }

    if (!RegExp(r'^[6-9][0-9]{9}$')
        .hasMatch(phone)) {
      return 'Enter a valid 10-digit Indian phone number';
    }

    return null;
  }

  String? _validateEmail(String? value) {
    final String email =
        value?.trim().toLowerCase() ?? '';

    if (email.isEmpty) {
      return 'Email address is required';
    }

    final RegExp emailPattern = RegExp(
      r'^[a-zA-Z0-9.!#$%&'
      r"'"
      r'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+'
      r'(?:\.[a-zA-Z0-9-]+)+$',
    );

    if (!emailPattern.hasMatch(email)) {
      return 'Enter a valid email address';
    }

    final String domain =
    email.split('@').last.toLowerCase();

    if (domain.isEmpty ||
        !domain.contains('.') ||
        domain.startsWith('.') ||
        domain.endsWith('.')) {
      return 'Enter a valid email domain';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    final String password = value ?? '';

    if (password.isEmpty) {
      return 'Password is required';
    }

    if (password.length < 8) {
      return 'Password must contain at least 8 characters';
    }

    if (!RegExp(r'[A-Z]').hasMatch(password)) {
      return 'Add at least one uppercase letter';
    }

    if (!RegExp(r'[a-z]').hasMatch(password)) {
      return 'Add at least one lowercase letter';
    }

    if (!RegExp(r'[0-9]').hasMatch(password)) {
      return 'Add at least one number';
    }

    if (!RegExp(
      r'[!@#$%^&*(),.?":{}|<>_\-+=]',
    ).hasMatch(password)) {
      return 'Add at least one special character';
    }

    return null;
  }

  String? _validateConfirmPassword(
      String? value,
      ) {
    final String confirmPassword = value ?? '';

    if (confirmPassword.isEmpty) {
      return 'Confirm your password';
    }

    if (confirmPassword !=
        _passwordController.text) {
      return 'Passwords do not match';
    }

    return null;
  }

  void _setLoading({
    required bool value,
    String message = 'Creating your account...',
  }) {
    if (!mounted) {
      return;
    }

    setState(() {
      _isLoading = value;
      _loadingMessage = message;
    });
  }

  Future<void> _handleRegister() async {
    FocusScope.of(context).unfocus();

    final bool formValid =
        _formKey.currentState?.validate() ?? false;

    if (!formValid || _isLoading) {
      return;
    }

    if (!_acceptTerms) {
      _showMessage(
        message:
        'Please accept the Terms of Service and Privacy Policy.',
        isError: true,
      );

      return;
    }

    final String firstName =
    _firstNameController.text.trim();

    final String lastName =
    _lastNameController.text.trim();

    final String fullName =
    '$firstName $lastName'.trim();

    final String email =
    _emailController.text.trim().toLowerCase();

    final String password =
        _passwordController.text;

    User? createdUser;
    bool verificationEmailSent = false;

    _setLoading(
      value: true,
      message: 'Creating your secure account...',
    );

    try {
      final UserCredential? userCredential =
      await _authService
          .registerWithEmailPassword(
        email,
        password,
      );

      createdUser = userCredential?.user;

      if (createdUser == null) {
        throw FirebaseAuthException(
          code: 'registration-failed',
          message:
          'Account creation could not be completed.',
        );
      }

      _setLoading(
        value: true,
        message: 'Saving your profile...',
      );

      await createdUser.updateDisplayName(fullName);
      await createdUser.reload();

      createdUser =
          FirebaseAuth.instance.currentUser;

      if (createdUser == null) {
        throw FirebaseAuthException(
          code: 'user-session-missing',
          message:
          'The newly created account could not be loaded.',
        );
      }

      _setLoading(
        value: true,
        message: 'Sending verification email...',
      );

      await createdUser.sendEmailVerification();

      verificationEmailSent = true;

      await _authService.signOut();

      if (!mounted) {
        return;
      }

      _setLoading(value: false);

      await _showVerificationDialog(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (error) {
      await _safeSignOut();

      if (!mounted) {
        return;
      }

      _setLoading(value: false);

      if (createdUser != null &&
          !verificationEmailSent) {
        await _showVerificationSendFailedDialog(
          email: email,
          errorMessage:
          _firebaseErrorMessage(error),
        );

        return;
      }

      _showMessage(
        message: _firebaseErrorMessage(error),
        isError: true,
      );
    } catch (_) {
      await _safeSignOut();

      if (!mounted) {
        return;
      }

      _setLoading(value: false);

      _showMessage(
        message:
        'Registration failed. Please try again.',
        isError: true,
      );
    }
  }

  Future<void> _safeSignOut() async {
    try {
      await _authService.signOut();
    } catch (_) {
      // The registration screen remains available.
    }
  }

  String _firebaseErrorMessage(
      FirebaseAuthException error,
      ) {
    switch (error.code) {
      case 'email-already-in-use':
        return 'An account already exists with this email address. Login or reset your password.';

      case 'invalid-email':
        return 'The email address is not valid.';

      case 'weak-password':
        return 'The password is too weak. Use a stronger password.';

      case 'operation-not-allowed':
        return 'Email and password registration is not enabled in Firebase.';

      case 'network-request-failed':
        return 'Unable to connect. Check your internet connection.';

      case 'too-many-requests':
        return 'Too many requests. Please wait and try again.';

      case 'internal-error':
        return 'Firebase could not complete registration. Try again.';

      case 'user-disabled':
        return 'This account has been disabled.';

      case 'requires-recent-login':
        return 'Please login again and retry this action.';

      case 'user-session-missing':
      case 'registration-failed':
        return error.message ??
            'Account registration failed.';

      default:
        return error.message ??
            'Registration failed. Please try again.';
    }
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
          backgroundColor: isError
              ? const Color(0xFFB3261E)
              : AppColors.primaryGreen,
          margin: const EdgeInsets.all(16),
          duration: const Duration(seconds: 5),
          elevation: 10,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
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
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                    height: 1.35,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
  }

  Future<bool> _signInTemporarily({
    required String email,
    required String password,
  }) async {
    try {
      final UserCredential? credential =
      await _authService
          .loginWithEmailPassword(
        email,
        password,
      );

      return credential?.user != null;
    } on FirebaseAuthException catch (error) {
      _showMessage(
        message: _firebaseErrorMessage(error),
        isError: true,
      );

      return false;
    } catch (_) {
      _showMessage(
        message:
        'Unable to access your account. Please try again.',
        isError: true,
      );

      return false;
    }
  }

  Future<void> _showVerificationDialog({
    required String email,
    required String password,
  }) async {
    if (!mounted) {
      return;
    }

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        bool isChecking = false;
        bool isResending = false;

        return StatefulBuilder(
          builder: (
              BuildContext context,
              void Function(void Function())
              setDialogState,
              ) {
            Future<void> checkVerification() async {
              setDialogState(() {
                isChecking = true;
              });

              try {
                final bool signedIn =
                await _signInTemporarily(
                  email: email,
                  password: password,
                );

                if (!signedIn) {
                  return;
                }

                User? user =
                    FirebaseAuth.instance.currentUser;

                await user?.reload();

                user =
                    FirebaseAuth.instance.currentUser;

                if (user != null &&
                    user.emailVerified) {
                  await _authService.signOut();

                  if (!dialogContext.mounted) {
                    return;
                  }

                  Navigator.of(dialogContext).pop();

                  if (!mounted) {
                    return;
                  }

                  _showMessage(
                    message:
                    'Email verified successfully. You can now login.',
                    isError: false,
                  );

                  await Future<void>.delayed(
                    const Duration(milliseconds: 350),
                  );

                  if (mounted) {
                    Navigator.of(context).pop(email);
                  }

                  return;
                }

                await _authService.signOut();

                _showMessage(
                  message:
                  'Your email is not verified yet. Open your inbox and click the verification link.',
                  isError: true,
                );
              } on FirebaseAuthException catch (error) {
                await _safeSignOut();

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

            Future<void> resendVerification() async {
              setDialogState(() {
                isResending = true;
              });

              try {
                final bool signedIn =
                await _signInTemporarily(
                  email: email,
                  password: password,
                );

                if (!signedIn) {
                  return;
                }

                User? user =
                    FirebaseAuth.instance.currentUser;

                await user?.reload();

                user =
                    FirebaseAuth.instance.currentUser;

                if (user == null) {
                  throw FirebaseAuthException(
                    code: 'user-session-missing',
                    message:
                    'Unable to load this account.',
                  );
                }

                if (user.emailVerified) {
                  await _authService.signOut();

                  if (!dialogContext.mounted) {
                    return;
                  }

                  Navigator.of(dialogContext).pop();

                  if (mounted) {
                    Navigator.of(context).pop(email);
                  }

                  return;
                }

                await user.sendEmailVerification();
                await _authService.signOut();

                _showMessage(
                  message:
                  'A new verification email has been sent.',
                  isError: false,
                );
              } on FirebaseAuthException catch (error) {
                await _safeSignOut();

                _showMessage(
                  message:
                  _firebaseErrorMessage(error),
                  isError: true,
                );
              } finally {
                if (dialogContext.mounted) {
                  setDialogState(() {
                    isResending = false;
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
                    maxWidth: 460,
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
                        width: 86,
                        height: 86,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          gradient:
                          const LinearGradient(
                            begin: Alignment.topLeft,
                            end:
                            Alignment.bottomRight,
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
                              .mark_email_unread_rounded,
                          color: Colors.white,
                          size: 44,
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
                        'Your account has been created, but app access remains locked until email verification is completed.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          fontSize: 14,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 14),
                      Container(
                        width: double.infinity,
                        padding:
                        const EdgeInsets.symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          color:
                          const Color(0xFFF0F7F0),
                          borderRadius:
                          BorderRadius.circular(14),
                        ),
                        child: Column(
                          children: [
                            Text(
                              'Verification link sent to',
                              style: GoogleFonts.lato(
                                color: Colors
                                    .grey.shade600,
                                fontSize: 12,
                              ),
                            ),
                            const SizedBox(height: 5),
                            Text(
                              email,
                              textAlign:
                              TextAlign.center,
                              style: GoogleFonts.lato(
                                color: AppColors
                                    .primaryGreen,
                                fontWeight:
                                FontWeight.w800,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 13),
                      Text(
                        'Open the email, click the verification link, return here and press the verification button.',
                        textAlign: TextAlign.center,
                        style: GoogleFonts.lato(
                          color: Colors.grey.shade600,
                          fontSize: 13.5,
                          height: 1.45,
                        ),
                      ),
                      const SizedBox(height: 22),
                      SizedBox(
                        width: double.infinity,
                        height: 52,
                        child: ElevatedButton(
                          onPressed: isChecking ||
                              isResending
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
                          onPressed: isChecking ||
                              isResending
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
                          child: isResending
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
                        onPressed: isChecking ||
                            isResending
                            ? null
                            : () async {
                          await _safeSignOut();

                          if (!dialogContext
                              .mounted) {
                            return;
                          }

                          Navigator.of(
                            dialogContext,
                          ).pop();

                          if (mounted) {
                            Navigator.of(context)
                                .pop(email);
                          }
                        },
                        child: Text(
                          'Verify later and return to login',
                          textAlign: TextAlign.center,
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

  Future<void>
  _showVerificationSendFailedDialog({
    required String email,
    required String errorMessage,
  }) async {
    if (!mounted) {
      return;
    }

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext dialogContext) {
        return Dialog(
          backgroundColor: Colors.transparent,
          insetPadding:
          const EdgeInsets.symmetric(horizontal: 24),
          child: Container(
            constraints:
            const BoxConstraints(maxWidth: 440),
            padding: const EdgeInsets.fromLTRB(
              24,
              28,
              24,
              22,
            ),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(28),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black26,
                  blurRadius: 30,
                  offset: Offset(0, 15),
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 82,
                  height: 82,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color:
                    const Color(0xFFFFF1EF),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.red
                            .withOpacity(0.12),
                        blurRadius: 20,
                        offset:
                        const Offset(0, 10),
                      ),
                    ],
                  ),
                  child: const Icon(
                    Icons
                        .mark_email_unread_outlined,
                    color: Color(0xFFB3261E),
                    size: 42,
                  ),
                ),
                const SizedBox(height: 20),
                Text(
                  'Verification Email Not Sent',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lexend(
                    fontSize: 21,
                    fontWeight: FontWeight.w700,
                    color:
                    const Color(0xFF1F2D23),
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'The Firebase account was created, but the verification email could not be delivered right now.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade600,
                    fontSize: 14,
                    height: 1.45,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  errorMessage,
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lato(
                    color:
                    const Color(0xFFB3261E),
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 22),
                SizedBox(
                  width: double.infinity,
                  height: 52,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(dialogContext)
                          .pop();

                      if (mounted) {
                        Navigator.of(context)
                            .pop(email);
                      }
                    },
                    style:
                    ElevatedButton.styleFrom(
                      elevation: 0,
                      backgroundColor:
                      AppColors.primaryGreen,
                      foregroundColor:
                      Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius:
                        BorderRadius.circular(15),
                      ),
                    ),
                    child: Text(
                      'RETURN TO LOGIN',
                      style: GoogleFonts.lexend(
                        fontSize: 14,
                        fontWeight:
                        FontWeight.w700,
                        letterSpacing: 0.6,
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  InputDecoration _inputDecoration({
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
        color: const Color(0xFF233128),
        fontWeight: FontWeight.w700,
      ),
      filled: true,
      fillColor: const Color(0xFFF8FAF8),
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 16,
        vertical: 18,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(
          color: Color(0xFFE1E9E2),
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(16),
        borderSide: const BorderSide(
          color: AppColors.primaryGreen,
          width: 1.7,
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

  Widget _buildHeader() {
    return Column(
      children: [
        FadeInDown(
          duration:
          const Duration(milliseconds: 650),
          child: Container(
            width: 78,
            height: 78,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white,
              boxShadow: [
                BoxShadow(
                  color:
                  Colors.black.withOpacity(0.15),
                  blurRadius: 22,
                  offset: const Offset(0, 11),
                ),
              ],
            ),
            child: const Icon(
              Icons.eco_rounded,
              size: 44,
              color: AppColors.primaryGreen,
            ),
          ),
        ),
        const SizedBox(height: 16),
        FadeInDown(
          delay: const Duration(milliseconds: 100),
          child: Text(
            'Create Your Account',
            textAlign: TextAlign.center,
            style: GoogleFonts.lexend(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.w700,
              letterSpacing: -0.3,
            ),
          ),
        ),
        const SizedBox(height: 7),
        FadeInDown(
          delay: const Duration(milliseconds: 180),
          child: Text(
            'Create a secure and verified Farm To Home account',
            textAlign: TextAlign.center,
            style: GoogleFonts.lato(
              color: Colors.white.withOpacity(0.82),
              fontSize: 14,
              fontWeight: FontWeight.w400,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildPasswordStrength() {
    if (_passwordController.text.isEmpty) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.only(top: 10),
      child: Column(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: LinearProgressIndicator(
              minHeight: 6,
              value: _passwordStrength,
              backgroundColor:
              Colors.grey.shade200,
              valueColor:
              AlwaysStoppedAnimation<Color>(
                _passwordStrengthColor,
              ),
            ),
          ),
          const SizedBox(height: 7),
          Row(
            children: [
              Expanded(
                child: Text(
                  'Use uppercase, lowercase, number and special character',
                  style: GoogleFonts.lato(
                    fontSize: 11.5,
                    color: Colors.grey.shade500,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                _passwordStrengthText,
                style: GoogleFonts.lato(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: _passwordStrengthColor,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildRegisterForm() {
    return FadeInUp(
      duration:
      const Duration(milliseconds: 750),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.fromLTRB(
          22,
          28,
          22,
          22,
        ),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(30),
          boxShadow: [
            BoxShadow(
              color:
              Colors.black.withOpacity(0.13),
              blurRadius: 36,
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
            CrossAxisAlignment.start,
            children: [
              Text(
                'Personal Information',
                style: GoogleFonts.lexend(
                  fontSize: 19,
                  fontWeight: FontWeight.w700,
                  color: const Color(0xFF233128),
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Use your real and accessible email address.',
                style: GoogleFonts.lato(
                  fontSize: 13,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 22),
              LayoutBuilder(
                builder: (
                    BuildContext context,
                    BoxConstraints constraints,
                    ) {
                  final bool useColumn =
                      constraints.maxWidth < 430;

                  final Widget firstNameField =
                  TextFormField(
                    controller:
                    _firstNameController,
                    focusNode:
                    _firstNameFocusNode,
                    textCapitalization:
                    TextCapitalization.words,
                    textInputAction:
                    TextInputAction.next,
                    autofillHints: const [
                      AutofillHints.givenName,
                    ],
                    onFieldSubmitted: (_) {
                      _lastNameFocusNode
                          .requestFocus();
                    },
                    decoration: _inputDecoration(
                      label: 'First Name',
                      hint: 'Enter first name',
                      icon: Icons
                          .person_outline_rounded,
                    ),
                    validator: (String? value) {
                      return _validateName(
                        value,
                        'First name',
                      );
                    },
                  );

                  final Widget lastNameField =
                  TextFormField(
                    controller:
                    _lastNameController,
                    focusNode:
                    _lastNameFocusNode,
                    textCapitalization:
                    TextCapitalization.words,
                    textInputAction:
                    TextInputAction.next,
                    autofillHints: const [
                      AutofillHints.familyName,
                    ],
                    onFieldSubmitted: (_) {
                      _phoneFocusNode
                          .requestFocus();
                    },
                    decoration: _inputDecoration(
                      label: 'Last Name',
                      hint: 'Enter last name',
                      icon: Icons
                          .person_outline_rounded,
                    ),
                    validator: (String? value) {
                      return _validateName(
                        value,
                        'Last name',
                      );
                    },
                  );

                  if (useColumn) {
                    return Column(
                      children: [
                        firstNameField,
                        const SizedBox(height: 16),
                        lastNameField,
                      ],
                    );
                  }

                  return Row(
                    crossAxisAlignment:
                    CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: firstNameField,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: lastNameField,
                      ),
                    ],
                  );
                },
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _phoneController,
                focusNode: _phoneFocusNode,
                keyboardType: TextInputType.phone,
                textInputAction:
                TextInputAction.next,
                autofillHints: const [
                  AutofillHints.telephoneNumber,
                ],
                inputFormatters: [
                  FilteringTextInputFormatter
                      .digitsOnly,
                  LengthLimitingTextInputFormatter(
                    10,
                  ),
                ],
                onFieldSubmitted: (_) {
                  _emailFocusNode.requestFocus();
                },
                decoration: _inputDecoration(
                  label: 'Phone Number',
                  hint:
                  'Enter 10-digit mobile number',
                  icon:
                  Icons.phone_android_rounded,
                  prefixText: '+91  ',
                ),
                validator: _validatePhone,
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller: _emailController,
                focusNode: _emailFocusNode,
                keyboardType:
                TextInputType.emailAddress,
                textInputAction:
                TextInputAction.next,
                autofillHints: const [
                  AutofillHints.email,
                  AutofillHints.username,
                ],
                autocorrect: false,
                enableSuggestions: false,
                onFieldSubmitted: (_) {
                  _passwordFocusNode
                      .requestFocus();
                },
                decoration: _inputDecoration(
                  label: 'Email Address',
                  hint:
                  'Enter your active email address',
                  icon: Icons
                      .alternate_email_rounded,
                ),
                validator: _validateEmail,
              ),
              const SizedBox(height: 10),
              Container(
                padding:
                const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color:
                  const Color(0xFFF0F7F0),
                  borderRadius:
                  BorderRadius.circular(13),
                ),
                child: Row(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons
                          .verified_user_outlined,
                      size: 20,
                      color:
                      AppColors.primaryGreen,
                    ),
                    const SizedBox(width: 9),
                    Expanded(
                      child: Text(
                        'A verification link will be sent to this email. Login remains locked until verification is completed.',
                        style: GoogleFonts.lato(
                          color: AppColors
                              .primaryGreen,
                          fontSize: 12,
                          fontWeight:
                          FontWeight.w600,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              TextFormField(
                controller:
                _passwordController,
                focusNode:
                _passwordFocusNode,
                obscureText:
                !_isPasswordVisible,
                textInputAction:
                TextInputAction.next,
                autofillHints: const [
                  AutofillHints.newPassword,
                ],
                autocorrect: false,
                enableSuggestions: false,
                onChanged: (_) {
                  setState(() {});
                },
                onFieldSubmitted: (_) {
                  _confirmPasswordFocusNode
                      .requestFocus();
                },
                decoration: _inputDecoration(
                  label: 'Password',
                  hint:
                  'Create a strong password',
                  icon:
                  Icons.lock_outline_rounded,
                  suffixIcon: IconButton(
                    tooltip: _isPasswordVisible
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
                      color:
                      AppColors.primaryGreen,
                    ),
                  ),
                ),
                validator: _validatePassword,
              ),
              _buildPasswordStrength(),
              const SizedBox(height: 16),
              TextFormField(
                controller:
                _confirmPasswordController,
                focusNode:
                _confirmPasswordFocusNode,
                obscureText:
                !_isConfirmPasswordVisible,
                textInputAction:
                TextInputAction.done,
                autofillHints: const [
                  AutofillHints.newPassword,
                ],
                autocorrect: false,
                enableSuggestions: false,
                onFieldSubmitted: (_) {
                  _handleRegister();
                },
                decoration: _inputDecoration(
                  label: 'Confirm Password',
                  hint:
                  'Enter password again',
                  icon: Icons
                      .verified_user_outlined,
                  suffixIcon: IconButton(
                    tooltip:
                    _isConfirmPasswordVisible
                        ? 'Hide password'
                        : 'Show password',
                    onPressed: _isLoading
                        ? null
                        : () {
                      setState(() {
                        _isConfirmPasswordVisible =
                        !_isConfirmPasswordVisible;
                      });
                    },
                    icon: Icon(
                      _isConfirmPasswordVisible
                          ? Icons
                          .visibility_rounded
                          : Icons
                          .visibility_off_rounded,
                      color:
                      AppColors.primaryGreen,
                    ),
                  ),
                ),
                validator:
                _validateConfirmPassword,
              ),
              const SizedBox(height: 18),
              InkWell(
                borderRadius:
                BorderRadius.circular(12),
                onTap: _isLoading
                    ? null
                    : () {
                  setState(() {
                    _acceptTerms =
                    !_acceptTerms;
                  });
                },
                child: Padding(
                  padding:
                  const EdgeInsets.symmetric(
                    vertical: 4,
                  ),
                  child: Row(
                    crossAxisAlignment:
                    CrossAxisAlignment.start,
                    children: [
                      SizedBox(
                        width: 24,
                        height: 24,
                        child: Checkbox(
                          value: _acceptTerms,
                          activeColor:
                          AppColors.primaryGreen,
                          shape:
                          RoundedRectangleBorder(
                            borderRadius:
                            BorderRadius.circular(
                              5,
                            ),
                          ),
                          onChanged: _isLoading
                              ? null
                              : (bool? value) {
                            setState(() {
                              _acceptTerms =
                                  value ?? false;
                            });
                          },
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Padding(
                          padding:
                          const EdgeInsets.only(
                            top: 2,
                          ),
                          child: RichText(
                            text: TextSpan(
                              style:
                              GoogleFonts.lato(
                                color: Colors
                                    .grey.shade600,
                                fontSize: 13,
                                height: 1.4,
                              ),
                              children: const [
                                TextSpan(
                                  text:
                                  'I agree to the ',
                                ),
                                TextSpan(
                                  text:
                                  'Terms of Service',
                                  style: TextStyle(
                                    color: AppColors
                                        .primaryGreen,
                                    fontWeight:
                                    FontWeight
                                        .w700,
                                  ),
                                ),
                                TextSpan(
                                  text: ' and ',
                                ),
                                TextSpan(
                                  text:
                                  'Privacy Policy',
                                  style: TextStyle(
                                    color: AppColors
                                        .primaryGreen,
                                    fontWeight:
                                    FontWeight
                                        .w700,
                                  ),
                                ),
                                TextSpan(text: '.'),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Container(
                width: double.infinity,
                height: 56,
                decoration: BoxDecoration(
                  borderRadius:
                  BorderRadius.circular(17),
                  gradient:
                  const LinearGradient(
                    begin: Alignment.centerLeft,
                    end: Alignment.centerRight,
                    colors: [
                      AppColors.primaryGreen,
                      AppColors.accentGreen,
                    ],
                  ),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors
                          .primaryGreen
                          .withOpacity(0.30),
                      blurRadius: 17,
                      offset:
                      const Offset(0, 9),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: _isLoading
                      ? null
                      : _handleRegister,
                  style:
                  ElevatedButton.styleFrom(
                    elevation: 0,
                    backgroundColor:
                    Colors.transparent,
                    disabledBackgroundColor:
                    Colors.transparent,
                    shadowColor:
                    Colors.transparent,
                    foregroundColor: Colors.white,
                    shape:
                    RoundedRectangleBorder(
                      borderRadius:
                      BorderRadius.circular(17),
                    ),
                  ),
                  child: AnimatedSwitcher(
                    duration: const Duration(
                      milliseconds: 250,
                    ),
                    child: _isLoading
                        ? Row(
                      key:
                      const ValueKey<String>(
                        'register-loading',
                      ),
                      mainAxisAlignment:
                      MainAxisAlignment
                          .center,
                      children: [
                        const SizedBox(
                          width: 23,
                          height: 23,
                          child:
                          CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Flexible(
                          child: Text(
                            _loadingMessage,
                            overflow:
                            TextOverflow
                                .ellipsis,
                            style: GoogleFonts
                                .lexend(
                              fontSize: 13,
                              fontWeight:
                              FontWeight
                                  .w700,
                            ),
                          ),
                        ),
                      ],
                    )
                        : Row(
                      key:
                      const ValueKey<String>(
                        'register-button',
                      ),
                      mainAxisAlignment:
                      MainAxisAlignment
                          .center,
                      children: [
                        Text(
                          'CREATE SECURE ACCOUNT',
                          style:
                          GoogleFonts.lexend(
                            fontSize: 14,
                            fontWeight:
                            FontWeight.w700,
                            letterSpacing: 0.7,
                          ),
                        ),
                        const SizedBox(width: 10),
                        const Icon(
                          Icons
                              .arrow_forward_rounded,
                          size: 21,
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 18),
              Row(
                mainAxisAlignment:
                MainAxisAlignment.center,
                children: [
                  Text(
                    'Already have an account?',
                    style: GoogleFonts.lato(
                      color: Colors.grey.shade600,
                      fontSize: 14,
                    ),
                  ),
                  TextButton(
                    onPressed: _isLoading
                        ? null
                        : () {
                      Navigator.of(context)
                          .pop();
                    },
                    child: Text(
                      'Login',
                      style: GoogleFonts.lato(
                        color:
                        AppColors.primaryGreen,
                        fontWeight:
                        FontWeight.w800,
                        fontSize: 14,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();

    _firstNameFocusNode.dispose();
    _lastNameFocusNode.dispose();
    _phoneFocusNode.dispose();
    _emailFocusNode.dispose();
    _passwordFocusNode.dispose();
    _confirmPasswordFocusNode.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Size screenSize =
    MediaQuery.sizeOf(context);

    final bool isWideScreen =
        screenSize.width >= 700;

    return Scaffold(
      backgroundColor:
      const Color(0xFFF4F8F4),
      body: Stack(
        children: [
          Positioned.fill(
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  stops: [
                    0.0,
                    0.37,
                    0.70,
                  ],
                  colors: [
                    AppColors.primaryGreen,
                    AppColors.accentGreen,
                    Color(0xFFF4F8F4),
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            top: -90,
            right: -70,
            child: Container(
              width: 230,
              height: 230,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color:
                Colors.white.withOpacity(0.08),
              ),
            ),
          ),
          Positioned(
            top: 145,
            left: -70,
            child: Container(
              width: 165,
              height: 165,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppColors.goldAmber
                    .withOpacity(0.10),
              ),
            ),
          ),
          Positioned(
            top: 105,
            right: 34,
            child: Transform.rotate(
              angle: 0.4,
              child: Icon(
                Icons.eco_rounded,
                size: 34,
                color: AppColors.goldAmber
                    .withOpacity(0.42),
              ),
            ),
          ),
          Positioned(
            top: 215,
            left: 28,
            child: Transform.rotate(
              angle: -0.5,
              child: Icon(
                Icons.eco_outlined,
                size: 27,
                color:
                Colors.white.withOpacity(0.28),
              ),
            ),
          ),
          SafeArea(
            child: Column(
              children: [
                Padding(
                  padding:
                  const EdgeInsets.fromLTRB(
                    8,
                    4,
                    16,
                    0,
                  ),
                  child: Row(
                    children: [
                      IconButton(
                        tooltip: 'Back',
                        onPressed: _isLoading
                            ? null
                            : () {
                          Navigator.of(
                            context,
                          ).pop();
                        },
                        icon: const Icon(
                          Icons
                              .arrow_back_ios_new_rounded,
                          color: Colors.white,
                        ),
                      ),
                      const Spacer(),
                      Text(
                        'FARM TO HOME',
                        style: GoogleFonts.lexend(
                          color: Colors.white
                              .withOpacity(0.88),
                          fontSize: 13,
                          fontWeight:
                          FontWeight.w700,
                          letterSpacing: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: SingleChildScrollView(
                    keyboardDismissBehavior:
                    ScrollViewKeyboardDismissBehavior
                        .onDrag,
                    padding: EdgeInsets.fromLTRB(
                      isWideScreen ? 80 : 20,
                      12,
                      isWideScreen ? 80 : 20,
                      32,
                    ),
                    child: Center(
                      child: ConstrainedBox(
                        constraints:
                        const BoxConstraints(
                          maxWidth: 620,
                        ),
                        child: Column(
                          children: [
                            _buildHeader(),
                            const SizedBox(height: 28),
                            _buildRegisterForm(),
                            const SizedBox(height: 20),
                            Text(
                              'Secure authentication powered by Firebase',
                              textAlign:
                              TextAlign.center,
                              style:
                              GoogleFonts.lato(
                                color: Colors
                                    .grey.shade600,
                                fontSize: 12,
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
          if (_isLoading)
            Positioned.fill(
              child: IgnorePointer(
                child: Container(
                  color:
                  Colors.black.withOpacity(0.06),
                ),
              ),
            ),
        ],
      ),
    );
  }
}