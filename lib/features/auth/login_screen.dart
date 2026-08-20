import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/app_routes.dart';
import '../../core/config/backend_config.dart';
import '../../core/constants/api_endpoints.dart';
import '../../core/errors/app_exception.dart';
import '../../core/errors/network_exception.dart';
import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../../core/theme/app_colors.dart';
import '../../data/repositories/session_repository.dart';
import 'forgot_password_screen.dart';
import 'register_screen.dart';
import 'widgets/apple_login_button.dart';
import 'widgets/auth_background.dart';
import 'widgets/google_login_button.dart';
import 'widgets/login_form.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final BackendApiService _apiService = BackendApiService();

  final TextEditingController _identifierController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  final FocusNode _identifierFocus = FocusNode();
  final FocusNode _passwordFocus = FocusNode();

  bool _obscurePassword = true;
  bool _loading = false;

  String? _socialLoading;

  @override
  void dispose() {
    _identifierController.dispose();
    _passwordController.dispose();
    _identifierFocus.dispose();
    _passwordFocus.dispose();
    _apiService.dispose();
    super.dispose();
  }

  String _normalizePhone(String value) {
    String digits = value.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('91') && digits.length == 12) {
      digits = digits.substring(2);
    }
    return digits;
  }

  String? _validateIdentifier(String? value) {
    final String input = value?.trim() ?? '';
    if (input.isEmpty) return 'Enter your email or mobile number';

    if (input.contains('@')) {
      final bool validEmail = RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(input);
      if (!validEmail) return 'Enter a valid email address';
      return null;
    }

    final String phone = _normalizePhone(input);
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(phone)) {
      return 'Enter a valid 10-digit mobile number';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    final String password = value ?? '';
    if (password.isEmpty) return 'Enter your password';
    if (password.length < 8) return 'Password must contain at least 8 characters';
    return null;
  }

  Future<void> _login() async {
    FocusScope.of(context).unfocus();

    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    setState(() {
      _loading = true;
      _socialLoading = null;
    });

    try {
      final String loginEmail = _identifierController.text.trim();
      debugPrint('LOGIN URL: ${BackendConfig.baseUrl}${ApiEndpoints.login}');
      debugPrint('LOGIN EMAIL: $loginEmail');

      final ApiResponse<dynamic> response = await _apiService.login(
        identifier: loginEmail,
        password: _passwordController.text,
      );

      debugPrint('LOGIN STATUS: ${response.statusCode}');
      debugPrint('LOGIN RESPONSE: ${response.message}');

      if (!mounted) return;

      if (response.isSuccess) {
        if (response.data != null && response.data is Map) {
          final Map<String, dynamic> data = Map<String, dynamic>.from(response.data as Map);
          final String? token = data['accessToken']?.toString() ?? data['token']?.toString();
          final String userEmail = data['email']?.toString() ?? loginEmail;
          if (token != null && token.isNotEmpty) {
            SessionRepository.setSession(
              userId: userEmail,
              email: userEmail,
              token: token,
            );
          }
        }
        Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutes.home,
          (Route<dynamic> route) => false,
        );
      } else {
        _showError(
          response.message.isNotEmpty
              ? response.message
              : 'Invalid email/phone or password. Please try again.',
        );
      }
    } catch (err) {
      if (!mounted) return;
      String errorMsg = 'Unable to login right now. Please try again.';
      if (err is NetworkException) {
        debugPrint('LOGIN STATUS: ${err.statusCode}');
        debugPrint('LOGIN RESPONSE DETAILS: ${err.details}');
        if (err.details is Map &&
            (err.details as Map)['message'] != null &&
            (err.details as Map)['message'].toString().trim().isNotEmpty) {
          errorMsg = (err.details as Map)['message'].toString();
        } else if (err.statusCode == 401) {
          errorMsg = 'Invalid email or password';
        } else if (err.message.isNotEmpty) {
          errorMsg = err.message;
        }
      } else if (err is AppException) {
        errorMsg = err.message;
      }
      _showError(errorMsg);
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  Future<void> _continueWithGoogle() async {
    _showError('Google login is not supported in REST mode.');
  }

  Future<void> _continueWithApple() async {
    _showError('Apple login is not supported in REST mode.');
  }

  void _openRegister() {
    if (_loading) return;

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const RegisterScreen(),
      ),
    );
  }

  void _openForgotPassword() {
    if (_loading) return;

    Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => const ForgotPasswordScreen(),
      ),
    );
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          backgroundColor: AppColors.error,
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
      resizeToAvoidBottomInset: true,
      body: AuthBackground(
        child: LayoutBuilder(
          builder: (
            BuildContext context,
            BoxConstraints constraints,
          ) {
            final bool compact = constraints.maxWidth < 820;

            if (compact) {
              return _buildMobile();
            }

            return _buildDesktop();
          },
        ),
      ),
    );
  }

  Widget _buildDesktop() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            Color(0xFFF1F8F4),
            Color(0xFFFFFCF5),
          ],
        ),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Center(
            child:
            ConstrainedBox(
              constraints:
              const BoxConstraints(
                maxWidth: 1120,
              ),
              child: Container(
                height: 680,
                clipBehavior: Clip.antiAlias,
                decoration:
                BoxDecoration(
                  color: Colors.white,
                  borderRadius:
                  BorderRadius
                      .circular(32),
                  border: Border.all(
                    color:
                    AppColors.border,
                  ),
                  boxShadow:
                  const <BoxShadow>[
                    BoxShadow(
                      color:
                      Color(
                        0x11000000,
                      ),
                      blurRadius: 26,
                      offset:
                      Offset(
                        0,
                        12,
                      ),
                    ),
                  ],
                ),
                child: Row(
                  children: <Widget>[
                    const Expanded(
                      child:
                      _PremiumBrandPanel(),
                    ),
                    Expanded(
                      child: Container(
                        color:
                        Colors.white,
                        padding:
                        const EdgeInsets
                            .symmetric(
                          horizontal: 46,
                          vertical: 38,
                        ),
                        child:
                        SingleChildScrollView(
                          child:
                          _buildForm(),
                        ),
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

  Widget _buildMobile() {
    return Container(
      decoration:
      const BoxDecoration(
        gradient: LinearGradient(
          begin:
          Alignment.topCenter,
          end:
          Alignment.bottomCenter,
          colors: <Color>[
            Color(0xFFE8F6ED),
            Color(0xFFFFFBF3),
          ],
        ),
      ),
      child: SafeArea(
        child:
        SingleChildScrollView(
          keyboardDismissBehavior:
          ScrollViewKeyboardDismissBehavior
              .onDrag,
          padding:
          const EdgeInsets.all(18),
          child: Center(
            child:
            ConstrainedBox(
              constraints:
              const BoxConstraints(
                maxWidth: 520,
              ),
              child: Column(
                children: <Widget>[
                  const _MobileBrand(),

                  const SizedBox(
                    height: 20,
                  ),

                  Container(
                    padding:
                    const EdgeInsets
                        .all(22),
                    decoration:
                    BoxDecoration(
                      color: Colors.white,
                      borderRadius:
                      BorderRadius
                          .circular(28),
                      border: Border.all(
                        color:
                        AppColors.border,
                      ),
                      boxShadow:
                      const <BoxShadow>[
                        BoxShadow(
                          color:
                          Color(
                            0x10000000,
                          ),
                          blurRadius: 22,
                          offset:
                          Offset(
                            0,
                            10,
                          ),
                        ),
                      ],
                    ),
                    child:
                    _buildForm(),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildForm() {
    return LoginForm(
      child: Form(
      key: _formKey,
      child: AutofillGroup(
        child: Column(
          mainAxisSize:
          MainAxisSize.min,
          crossAxisAlignment:
          CrossAxisAlignment
              .stretch,
          children: <Widget>[
            const Text(
              'Welcome back',
              style: TextStyle(
                color:
                AppColors.textPrimary,
                fontSize: 31,
                height: 1.05,
                fontWeight:
                FontWeight.w900,
              ),
            ),

            const SizedBox(height: 9),

            const Text(
              'Sign in to continue shopping fresh products from trusted farms.',
              style: TextStyle(
                color:
                AppColors.textSecondary,
                fontSize: 13.5,
                height: 1.45,
                fontWeight:
                FontWeight.w600,
              ),
            ),

            const SizedBox(height: 26),

            TextFormField(
              controller:
              _identifierController,
              focusNode:
              _identifierFocus,
              enabled: !_loading,
              keyboardType:
              TextInputType
                  .emailAddress,
              textInputAction:
              TextInputAction.next,
              autofillHints:
              const <String>[
                AutofillHints.username,
              ],
              inputFormatters:
              <TextInputFormatter>[
                LengthLimitingTextInputFormatter(
                  100,
                ),
              ],
              validator:
              _validateIdentifier,
              onFieldSubmitted:
                  (_) {
                _passwordFocus
                    .requestFocus();
              },
              decoration:
              const InputDecoration(
                labelText:
                'Email or phone number',
                hintText:
                'name@example.com or 98765 43210',
                prefixIcon: Icon(
                  Icons
                      .person_outline_rounded,
                  color:
                  AppColors.primary,
                ),
              ),
            ),

            const SizedBox(height: 15),

            TextFormField(
              controller:
              _passwordController,
              focusNode:
              _passwordFocus,
              enabled: !_loading,
              obscureText:
              _obscurePassword,
              textInputAction:
              TextInputAction.done,
              autofillHints:
              const <String>[
                AutofillHints.password,
              ],
              validator:
              _validatePassword,
              onFieldSubmitted:
                  (_) {
                if (!_loading) {
                  _login();
                }
              },
              decoration:
              InputDecoration(
                labelText: 'Password',
                hintText:
                'Enter your password',
                prefixIcon:
                const Icon(
                  Icons
                      .lock_outline_rounded,
                  color:
                  AppColors.primary,
                ),
                suffixIcon:
                IconButton(
                  onPressed:
                  _loading
                      ? null
                      : () {
                    setState(
                          () {
                        _obscurePassword =
                        !_obscurePassword;
                      },
                    );
                  },
                  icon: Icon(
                    _obscurePassword
                        ? Icons
                        .visibility_outlined
                        : Icons
                        .visibility_off_outlined,
                  ),
                ),
              ),
            ),

            Align(
              alignment:
              Alignment.centerRight,
              child: TextButton(
                onPressed:
                _loading
                    ? null
                    : _openForgotPassword,
                child: const Text(
                  'Forgot password?',
                  style: TextStyle(
                    fontWeight:
                    FontWeight.w800,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 3),

            SizedBox(
              height: 54,
              child:
              FilledButton(
                style:
                FilledButton.styleFrom(
                  backgroundColor:
                  AppColors.primary,
                  foregroundColor:
                  Colors.white,
                  shape:
                  RoundedRectangleBorder(
                    borderRadius:
                    BorderRadius
                        .circular(15),
                  ),
                ),
                onPressed:
                _loading
                    ? null
                    : _login,
                child:
                _loading &&
                    _socialLoading ==
                        null
                    ? const SizedBox(
                  width:
                  22,
                  height:
                  22,
                  child:
                  CircularProgressIndicator(
                    color:
                    Colors.white,
                    strokeWidth:
                    2.4,
                  ),
                )
                    : const Text(
                  'LOGIN',
                  style:
                  TextStyle(
                    fontWeight:
                    FontWeight
                        .w900,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 20),

            const _OrDivider(),

            const SizedBox(height: 17),

            GoogleLoginButton(
              child: _SocialButton(
              enabled: !_loading,
              onPressed:
              _continueWithGoogle,
              child: Row(
                mainAxisAlignment:
                MainAxisAlignment.center,
                children: <Widget>[
                  if (_socialLoading ==
                      'google')
                    const SizedBox(
                      width: 21,
                      height: 21,
                      child:
                      CircularProgressIndicator(
                        strokeWidth:
                        2.3,
                      ),
                    )
                  else
                    Image.asset(
                      'assets/icons/google logo.png',
                      width: 22,
                      height: 22,
                      fit:
                      BoxFit.contain,
                      errorBuilder:
                          (_, __, ___) =>
                      const Icon(
                        Icons
                            .g_mobiledata_rounded,
                        size: 27,
                      ),
                    ),

                  const SizedBox(
                    width: 10,
                  ),

                  const Text(
                    'Continue with Google',
                  ),
                ],
              ),
            ),
            ),

            const SizedBox(height: 11),

            AppleLoginButton(
              child: _SocialButton(
              enabled: !_loading,
              onPressed:
              _continueWithApple,
              child: Row(
                mainAxisAlignment:
                MainAxisAlignment.center,
                children: <Widget>[
                  if (_socialLoading ==
                      'apple')
                    const SizedBox(
                      width: 21,
                      height: 21,
                      child:
                      CircularProgressIndicator(
                        strokeWidth:
                        2.3,
                      ),
                    )
                  else
                    const Icon(
                      Icons.apple,
                      size: 22,
                      color: Colors.black,
                    ),

                  const SizedBox(
                    width: 10,
                  ),

                  const Text(
                    'Continue with Apple',
                  ),
                ],
              ),
            ),
            ),

            const SizedBox(height: 18),

            Container(
              padding:
              const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 11,
              ),
              decoration:
              BoxDecoration(
                color:
                const Color(
                  0xFFF5F8F6,
                ),
                borderRadius:
                BorderRadius
                    .circular(14),
              ),
              child: Row(
                children: <Widget>[
                  const Expanded(
                    child: Text(
                      'New to Farm To Home?',
                      style: TextStyle(
                        color: AppColors
                            .textSecondary,
                        fontSize: 12,
                        fontWeight:
                        FontWeight.w700,
                      ),
                    ),
                  ),

                  TextButton(
                    onPressed:
                    _loading
                        ? null
                        : _openRegister,
                    child: const Text(
                      'Create Account',
                      style: TextStyle(
                        fontWeight:
                        FontWeight.w900,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            const Text(
              'By continuing, you agree to our Terms of Service and Privacy Policy.',
              textAlign:
              TextAlign.center,
              style: TextStyle(
                color:
                AppColors.textSecondary,
                fontSize: 10.5,
                height: 1.4,
              ),
            ),
          ],
        ),
      ),
      ),
    );
  }
}

class _PremiumBrandPanel
    extends StatelessWidget {
  const _PremiumBrandPanel();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: double.infinity,
      padding:
      const EdgeInsets.all(44),
      decoration:
      const BoxDecoration(
        gradient: LinearGradient(
          begin:
          Alignment.topLeft,
          end:
          Alignment.bottomRight,
          colors: <Color>[
            Color(0xFF043C22),
            Color(0xFF08713A),
            Color(0xFF149A50),
          ],
        ),
      ),
      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,
        children: <Widget>[
          const Row(
            children: <Widget>[
              Icon(
                Icons.eco_rounded,
                color: Colors.white,
                size: 42,
              ),
              SizedBox(width: 12),
              Text(
                'FARM TO HOME',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 20,
                  letterSpacing: 1,
                  fontWeight:
                  FontWeight.w900,
                ),
              ),
            ],
          ),

          const SizedBox(height: 28),

          const Text(
            'Freshness\nstarts at the farm.',
            style: TextStyle(
              color: Colors.white,
              fontSize: 39,
              height: 1.08,
              fontWeight:
              FontWeight.w900,
            ),
          ),

          const SizedBox(height: 17),

          const Text(
            'Fresh products for your home and reliable bulk supply for your shop.',
            style: TextStyle(
              color: Colors.white70,
              fontSize: 14,
              height: 1.55,
              fontWeight:
              FontWeight.w600,
            ),
          ),

          const SizedBox(height: 28),

          const _Feature(
            icon:
            Icons.eco_outlined,
            text:
            'Farm-direct products',
          ),

          const SizedBox(height: 14),

          const _Feature(
            icon: Icons
                .storefront_outlined,
            text:
            'Home & Shop Owner modes',
          ),

          const SizedBox(height: 14),

          const _Feature(
            icon: Icons
                .local_shipping_outlined,
            text:
            'Quick, scheduled & pre-order',
          ),

          const SizedBox(height: 28),

          Container(
            padding:
            const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 7,
            ),
            decoration:
            BoxDecoration(
              color: Colors.white
                  .withValues(
                alpha: 0.12,
              ),
              borderRadius:
              BorderRadius
                  .circular(30),
            ),
            child: const Text(
              'FRESH • ORGANIC • TRUSTED',
              style: TextStyle(
                color: Colors.white,
                fontSize: 10,
                letterSpacing: 0.8,
                fontWeight:
                FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MobileBrand
    extends StatelessWidget {
  const _MobileBrand();

  @override
  Widget build(BuildContext context) {
    return const Row(
      mainAxisAlignment:
      MainAxisAlignment.center,
      children: <Widget>[
        CircleAvatar(
          radius: 25,
          backgroundColor:
          AppColors.primary,
          child: Icon(
            Icons.eco_rounded,
            color: Colors.white,
            size: 29,
          ),
        ),
        SizedBox(width: 11),
        Text(
          'FARM TO HOME',
          style: TextStyle(
            color:
            AppColors.primaryDark,
            fontSize: 20,
            letterSpacing: 0.8,
            fontWeight:
            FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _Feature extends StatelessWidget {
  const _Feature({
    required this.icon,
    required this.text,
  });

  final IconData icon;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Container(
          width: 38,
          height: 38,
          decoration:
          BoxDecoration(
            color: Colors.white
                .withValues(
              alpha: 0.12,
            ),
            borderRadius:
            BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            color: Colors.white,
            size: 20,
          ),
        ),
        const SizedBox(width: 11),
        Expanded(
          child: Text(
            text,
            style:
            const TextStyle(
              color: Colors.white,
              fontSize: 12.5,
              fontWeight:
              FontWeight.w700,
            ),
          ),
        ),
      ],
    );
  }
}

class _OrDivider
    extends StatelessWidget {
  const _OrDivider();

  @override
  Widget build(BuildContext context) {
    return const Row(
      children: <Widget>[
        Expanded(
          child: Divider(),
        ),
        Padding(
          padding:
          EdgeInsets.symmetric(
            horizontal: 12,
          ),
          child: Text(
            'OR CONTINUE WITH',
            style: TextStyle(
              color:
              AppColors.textSecondary,
              fontSize: 10,
              letterSpacing: 0.7,
              fontWeight:
              FontWeight.w800,
            ),
          ),
        ),
        Expanded(
          child: Divider(),
        ),
      ],
    );
  }
}

class _SocialButton
    extends StatelessWidget {
  const _SocialButton({
    required this.enabled,
    required this.onPressed,
    required this.child,
  });

  final bool enabled;
  final VoidCallback onPressed;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 52,
      child: OutlinedButton(
        onPressed:
        enabled ? onPressed : null,
        style:
        OutlinedButton.styleFrom(
          foregroundColor:
          AppColors.textPrimary,
          backgroundColor:
          Colors.white,
          side: const BorderSide(
            color: AppColors.border,
          ),
          shape:
          RoundedRectangleBorder(
            borderRadius:
            BorderRadius.circular(15),
          ),
        ),
        child: child,
      ),
    );
  }
}
