import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../app/app_routes.dart';
import '../../core/errors/app_exception.dart';
import '../../core/errors/network_exception.dart';
import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../../core/theme/app_colors.dart';
import 'widgets/password_strength.dart';
import 'widgets/register_form.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final BackendApiService _apiService = BackendApiService();

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

  bool _hidePassword = true;
  bool _hideConfirmPassword = true;
  bool _loading = false;
  bool _termsAccepted = false;

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
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

  String? _validateFirstName(String? value) {
    final String text = value?.trim() ?? '';
    if (text.isEmpty) return 'Enter your first name';
    if (text.length < 2) return 'Enter a valid first name';
    return null;
  }

  String? _validateLastName(String? value) {
    final String text = value?.trim() ?? '';
    if (text.isEmpty) return 'Enter your last name';
    if (text.length < 2) return 'Enter a valid last name';
    return null;
  }

  String? _validatePhone(String? value) {
    final String phone = _normalizePhone(value ?? '');
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(phone)) {
      return 'Enter a valid 10-digit mobile number';
    }
    return null;
  }

  String? _validateEmail(String? value) {
    final String email = value?.trim() ?? '';
    if (email.isEmpty) return 'Enter your email address';
    if (!RegExp(r'^[^\s@]+@[^\s@]+\.[^\s@]+$').hasMatch(email)) {
      return 'Enter a valid email address';
    }
    return null;
  }

  String? _validatePassword(String? value) {
    final String password = value ?? '';
    if (password.length < 8) return 'Password must contain at least 8 characters';
    if (!RegExp(r'[A-Z]').hasMatch(password)) return 'Add at least one uppercase letter';
    if (!RegExp(r'[a-z]').hasMatch(password)) return 'Add at least one lowercase letter';
    if (!RegExp(r'\d').hasMatch(password)) return 'Add at least one number';
    return null;
  }

  String? _validateConfirmPassword(String? value) {
    if ((value ?? '').isEmpty) return 'Confirm your password';
    if (value != _passwordController.text) return 'Passwords do not match';
    return null;
  }

  void _showMessage(String message) {
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

  Future<void> _register() async {
    FocusScope.of(context).unfocus();

    if (!(_formKey.currentState?.validate() ?? false)) {
      return;
    }

    if (!_termsAccepted) {
      _showMessage('Please accept Terms of Service and Privacy Policy.');
      return;
    }

    setState(() {
      _loading = true;
    });

    try {
      final String firstName = _firstNameController.text.trim();
      final String lastName = _lastNameController.text.trim();
      final String email = _emailController.text.trim().toLowerCase();
      final String phone = '+91${_normalizePhone(_phoneController.text)}';
      final String password = _passwordController.text;

      final ApiResponse<dynamic> response = await _apiService.register(<String, dynamic>{
        'firstName': firstName,
        'lastName': lastName,
        'email': email,
        'phone': phone,
        'phoneNumber': phone,
        'password': password,
        'role': 'CUSTOMER',
      });

      debugPrint('REGISTER STATUS CODE: ${response.statusCode}');
      debugPrint('REGISTER RESPONSE MESSAGE: ${response.message}');
      debugPrint('REGISTER DATA: ${response.data}');

      if (!mounted) return;

      if (response.isSuccess) {
        final Map<String, dynamic> data =
            response.data is Map<String, dynamic> ? (response.data as Map<String, dynamic>) : <String, dynamic>{};

        final String userId = (data['id'] ?? data['userId'] ?? data['uid'] ?? '').toString();

        Navigator.of(context).pushReplacementNamed(
          AppRoutes.otp,
          arguments: <String, dynamic>{
            'phoneNumber': phone,
            'email': email,
            'userId': userId,
            'source': 'register',
          },
        );
      } else if (response.message.contains('VERIFICATION_PENDING') || response.message.toLowerCase().contains('verification is pending')) {
        _showMessage('Account exists but email verification is pending. Redirecting to OTP verification...');
        Future<void>.delayed(const Duration(milliseconds: 800), () {
          if (!mounted) return;
          Navigator.of(context).pushReplacementNamed(
            AppRoutes.otp,
            arguments: <String, dynamic>{
              'phoneNumber': phone,
              'email': email,
              'source': 'register',
            },
          );
        });
      } else if (response.message.contains('ACCOUNT_ALREADY_EXISTS') || response.message.toLowerCase().contains('already exists')) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(response.message.isNotEmpty ? response.message : 'Account already exists. Please login.'),
            action: SnackBarAction(
              label: 'LOGIN',
              textColor: Colors.amber,
              onPressed: _goLogin,
            ),
            duration: const Duration(seconds: 5),
          ),
        );
      } else {
        _showMessage(
          response.message.isNotEmpty
              ? response.message
              : 'Registration failed. Please try again.',
        );
      }
    } catch (e) {
      debugPrint('REGISTER EXCEPTION: $e');
      if (!mounted) return;
      String errorMsg = 'Unable to create account. Please try again.';
      bool isConflict = false;
      if (e is NetworkException) {
        if (e.statusCode == 409) isConflict = true;
        if (e.details is Map &&
            (e.details as Map)['message'] != null &&
            (e.details as Map)['message'].toString().trim().isNotEmpty) {
          errorMsg = (e.details as Map)['message'].toString();
        } else if (e.statusCode == 409) {
          errorMsg = 'An account already exists with this email or phone number. Please login.';
        } else if (e.message.isNotEmpty) {
          errorMsg = e.message;
        }
      } else if (e is AppException) {
        errorMsg = e.message;
      }

      if (isConflict) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMsg),
            action: SnackBarAction(
              label: 'LOGIN',
              textColor: Colors.amber,
              onPressed: _goLogin,
            ),
            duration: const Duration(seconds: 5),
          ),
        );
      } else {
        _showMessage(errorMsg);
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  void _goLogin() {
    if (Navigator.of(context).canPop()) {
      Navigator.of(context).pop();
      return;
    }

    Navigator.of(context).pushReplacementNamed(
      AppRoutes.login,
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool desktop = MediaQuery.sizeOf(context).width >= 900;

    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: AppColors.background,
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: <Color>[
              Color(0xFFE7F5EC),
              Color(0xFFFFFBF2),
              AppColors.background,
            ],
          ),
        ),
        child: SafeArea(
          child: SingleChildScrollView(
            keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
            padding: EdgeInsets.symmetric(
              horizontal: desktop ? 28 : 16,
              vertical: 18,
            ),
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(
                  maxWidth: 1050,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: <Widget>[
                    _buildHeader(),
                    const SizedBox(height: 20),
                    if (desktop)
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: <Widget>[
                          const Expanded(
                            flex: 4,
                            child: _RegisterHero(),
                          ),
                          const SizedBox(width: 20),
                          Expanded(
                            flex: 6,
                            child: _buildForm(),
                          ),
                        ],
                      )
                    else ...<Widget>[
                      const _RegisterHero(),
                      const SizedBox(height: 18),
                      _buildForm(),
                    ],
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Row(
      children: <Widget>[
        IconButton(
          onPressed: _loading ? null : _goLogin,
          icon: const SizedBox(
            width: 45,
            height: 45,
            child: Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 18,
            ),
          ),
        ),
        const SizedBox(width: 12),
        const Text(
          'Farm To Home',
          style: TextStyle(
            color: AppColors.primaryDark,
            fontSize: 18,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }

  Widget _buildForm() {
    return Container(
      padding:
      const EdgeInsets.all(22),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius:
        BorderRadius.circular(28),
        border: Border.all(
          color: AppColors.border,
        ),
        boxShadow:
        const <BoxShadow>[
          BoxShadow(
            color:
            Color(0x12000000),
            blurRadius: 34,
            offset:
            Offset(0, 14),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(28),
        child: RegisterForm(
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment
                  .stretch,
              children: <Widget>[
                Row(
              children: <Widget>[
                const Expanded(
                  child: Text(
                    'Join Fresh Club',
                    style: TextStyle(color: AppColors.textPrimary, fontSize: 27, fontWeight: FontWeight.w900),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                  decoration: BoxDecoration(color: const Color(0xFFEAF7EF), borderRadius: BorderRadius.circular(14)),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: <Widget>[
                      Icon(Icons.shield_rounded, color: AppColors.primary, size: 14),
                      SizedBox(width: 5),
                      Text('SECURE', style: TextStyle(color: AppColors.primary, fontSize: 8, fontWeight: FontWeight.w900)),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 8),

            const Text(
              'One account for fresh home shopping and business bulk orders.',
              style: TextStyle(
                color:
                AppColors.textSecondary,
                fontSize: 12.5,
                height: 1.45,
                fontWeight:
                FontWeight.w600,
              ),
            ),

            const SizedBox(height: 17),

            const _RegistrationSteps(),

            const SizedBox(height: 20),

            TextFormField(
              controller:
              _firstNameController,
              enabled: !_loading,
              textCapitalization:
              TextCapitalization.words,
              textInputAction:
              TextInputAction.next,
              validator:
              _validateFirstName,
              decoration:
              const InputDecoration(
                labelText:
                'First Name',
                prefixIcon: Icon(
                  Icons
                      .person_outline_rounded,
                  color:
                  AppColors.primary,
                ),
              ),
            ),

            const SizedBox(height: 14),

            TextFormField(
              controller:
              _lastNameController,
              enabled: !_loading,
              textCapitalization:
              TextCapitalization.words,
              textInputAction:
              TextInputAction.next,
              validator:
              _validateLastName,
              decoration:
              const InputDecoration(
                labelText:
                'Last Name',
                prefixIcon: Icon(
                  Icons
                      .badge_outlined,
                  color:
                  AppColors.primary,
                ),
              ),
            ),

            const SizedBox(height: 14),

            TextFormField(
              controller:
              _phoneController,
              enabled: !_loading,
              keyboardType:
              TextInputType.phone,
              textInputAction:
              TextInputAction.next,
              inputFormatters:
              <TextInputFormatter>[
                FilteringTextInputFormatter
                    .digitsOnly,
                LengthLimitingTextInputFormatter(
                  10,
                ),
              ],
              validator:
              _validatePhone,
              decoration:
              const InputDecoration(
                labelText:
                'Phone Number',
                hintText:
                '9876543210',
                prefixText:
                '+91  ',
                prefixIcon: Icon(
                  Icons
                      .phone_iphone_rounded,
                  color:
                  AppColors.primary,
                ),
              ),
            ),

            const SizedBox(height: 14),

            TextFormField(
              controller:
              _emailController,
              enabled: !_loading,
              keyboardType:
              TextInputType
                  .emailAddress,
              textInputAction:
              TextInputAction.next,
              validator:
              _validateEmail,
              decoration:
              const InputDecoration(
                labelText:
                'Email Address',
                hintText:
                'name@example.com',
                prefixIcon: Icon(
                  Icons
                      .alternate_email_rounded,
                  color:
                  AppColors.primary,
                ),
              ),
            ),

            const SizedBox(height: 14),

            TextFormField(
              controller:
              _passwordController,
              enabled: !_loading,
              obscureText:
              _hidePassword,
              textInputAction:
              TextInputAction.next,
              validator:
              _validatePassword,
              decoration:
              InputDecoration(
                labelText:
                'Password',
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
                        _hidePassword =
                        !_hidePassword;
                      },
                    );
                  },
                  icon: Icon(
                    _hidePassword
                        ? Icons
                        .visibility_outlined
                        : Icons
                        .visibility_off_outlined,
                  ),
                ),
              ),
            ),

            ValueListenableBuilder<TextEditingValue>(
              valueListenable: _passwordController,
              builder: (BuildContext context, TextEditingValue value, Widget? child) =>
                  PasswordStrength(password: value.text),
            ),

            const SizedBox(height: 14),

            TextFormField(
              controller:
              _confirmPasswordController,
              enabled: !_loading,
              obscureText:
              _hideConfirmPassword,
              textInputAction:
              TextInputAction.done,
              validator:
              _validateConfirmPassword,
              onFieldSubmitted:
                  (_) {
                if (!_loading) {
                  _register();
                }
              },
              decoration:
              InputDecoration(
                labelText:
                'Confirm Password',
                prefixIcon:
                const Icon(
                  Icons
                      .verified_user_outlined,
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
                        _hideConfirmPassword =
                        !_hideConfirmPassword;
                      },
                    );
                  },
                  icon: Icon(
                    _hideConfirmPassword
                        ? Icons
                        .visibility_outlined
                        : Icons
                        .visibility_off_outlined,
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            CheckboxListTile(
              value:
              _termsAccepted,
              contentPadding:
              EdgeInsets.zero,
              controlAffinity:
              ListTileControlAffinity
                  .leading,
              title: const Text(
                'I agree to the Terms of Service and Privacy Policy.',
                style: TextStyle(
                  color:
                  AppColors.textSecondary,
                  fontSize: 11.5,
                  fontWeight:
                  FontWeight.w600,
                ),
              ),
              onChanged:
              _loading
                  ? null
                  : (bool? value) {
                setState(
                      () {
                    _termsAccepted =
                        value ??
                            false;
                  },
                );
              },
            ),

            const SizedBox(height: 14),

            SizedBox(
              height: 56,
              child:
              FilledButton(
                onPressed:
                _loading
                    ? null
                    : _register,
                child:
                _loading
                    ? const SizedBox(
                  width:
                  23,
                  height:
                  23,
                  child:
                  CircularProgressIndicator(
                    color:
                    Colors.white,
                    strokeWidth:
                    2.5,
                  ),
                )
                    : const Text(
                  'CREATE MY FRESH ACCOUNT',
                ),
              ),
            ),

            const SizedBox(height: 14),

            Row(
              mainAxisAlignment:
              MainAxisAlignment
                  .center,
              children: <Widget>[
                const Text(
                  'Already have an account?',
                  style: TextStyle(
                    color: AppColors
                        .textSecondary,
                  ),
                ),
                TextButton(
                  onPressed:
                  _loading
                      ? null
                      : _goLogin,
                  child:
                  const Text(
                    'Login',
                    style:
                    TextStyle(
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    ),
  ),
);
  }
}

class _RegisterHero
    extends StatelessWidget {
  const _RegisterHero();

  @override
  Widget build(BuildContext context) {
    final bool compact = MediaQuery.sizeOf(context).width < 900;
    return Container(
      constraints:
      BoxConstraints(
        minHeight: compact ? 215 : 430,
      ),
      padding: const EdgeInsets.all(26),
      decoration: BoxDecoration(
        gradient:
        const LinearGradient(
          begin:
          Alignment.topLeft,
          end:
          Alignment.bottomRight,
          colors: <Color>[
            Color(0xFF052E1B),
            Color(0xFF0B6F3B),
            Color(0xFF25A75D),
          ],
        ),
        borderRadius:
        BorderRadius.circular(28),
      ),
      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,
        children: <Widget>[
          const CircleAvatar(
            radius: 33,
            backgroundColor:
            Colors.white,
            child: Icon(
              Icons.eco_rounded,
              color:
              AppColors.primary,
              size: 38,
            ),
          ),

          const SizedBox(height: 24),

          Text(
            'Fresh food.\nTrusted farms.',
            style: TextStyle(
              color: Colors.white,
              fontSize: compact ? 26 : 34,
              height: 1.1,
              fontWeight:
              FontWeight.w900,
            ),
          ),

          const SizedBox(height: 12),

          const Text(
            'Retail shopping for home and bulk ordering for shop owners — all in one account.',
            style: TextStyle(
              color:
              Colors.white70,
              fontSize: 13,
              height: 1.5,
              fontWeight:
              FontWeight.w600,
            ),
          ),
          const SizedBox(height: 18),
          const Wrap(
            spacing: 8,
            runSpacing: 8,
            children: <Widget>[
              _HeroPill(Icons.verified_rounded, 'Quality checked'),
              _HeroPill(Icons.lock_rounded, 'Secure account'),
              _HeroPill(Icons.local_shipping_rounded, 'Live delivery'),
            ],
          ),
        ],
      ),
    );
  }
}

class _RegistrationSteps extends StatelessWidget {
  const _RegistrationSteps();
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(color: const Color(0xFFF6FAF7), borderRadius: BorderRadius.circular(17), border: Border.all(color: const Color(0xFFE2ECE6))),
        child: const Row(children: <Widget>[
          _StepDot(number: '1', label: 'DETAILS', active: true),
          Expanded(child: Divider(color: Color(0xFFC7D9CF), indent: 7, endIndent: 7)),
          _StepDot(number: '2', label: 'VERIFY'),
          Expanded(child: Divider(color: Color(0xFFC7D9CF), indent: 7, endIndent: 7)),
          _StepDot(number: '3', label: 'FRESH'),
        ]),
      );
}

class _StepDot extends StatelessWidget {
  const _StepDot({required this.number, required this.label, this.active = false});
  final String number;
  final String label;
  final bool active;
  @override
  Widget build(BuildContext context) => Column(children: <Widget>[
        Container(width: 28, height: 28, alignment: Alignment.center, decoration: BoxDecoration(color: active ? AppColors.primary : Colors.white, shape: BoxShape.circle, border: Border.all(color: active ? AppColors.primary : const Color(0xFFC7D9CF))), child: Text(number, style: TextStyle(color: active ? Colors.white : AppColors.textSecondary, fontSize: 9, fontWeight: FontWeight.w900))),
        const SizedBox(height: 4),
        Text(label, style: TextStyle(color: active ? AppColors.primary : AppColors.textSecondary, fontSize: 7, fontWeight: FontWeight.w900)),
      ]);
}

class _HeroPill extends StatelessWidget {
  const _HeroPill(this.icon, this.label);
  final IconData icon;
  final String label;
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 6),
        decoration: BoxDecoration(color: Colors.white.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(14)),
        child: Row(mainAxisSize: MainAxisSize.min, children: <Widget>[
          Icon(icon, color: const Color(0xFFFFD66B), size: 13),
          const SizedBox(width: 5),
          Text(label, style: const TextStyle(color: Colors.white, fontSize: 8, fontWeight: FontWeight.w800)),
        ]),
      );
}
