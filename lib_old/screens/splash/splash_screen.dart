import 'dart:async';
import 'dart:math' as math;

import 'package:animate_do/animate_do.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../auth/email_verification_screen.dart';
import '../auth/login_screen.dart';
import '../home/home_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() =>
      _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  late final AnimationController _rotationController;
  late final AnimationController _pulseController;
  late final Animation<double> _pulseAnimation;

  String _statusText =
      'Preparing your fresh experience...';

  bool _hasStartedNavigation = false;

  @override
  void initState() {
    super.initState();

    _rotationController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 8),
    )..repeat();

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(
      begin: 0.94,
      end: 1.06,
    ).animate(
      CurvedAnimation(
        parent: _pulseController,
        curve: Curves.easeInOut,
      ),
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _resolveAuthentication();
    });
  }

  Future<void> _resolveAuthentication() async {
    if (_hasStartedNavigation) {
      return;
    }

    _hasStartedNavigation = true;

    final Stopwatch splashTimer = Stopwatch()..start();

    String? rememberedEmail;

    try {
      _updateStatus(
        'Restoring your secure session...',
      );

      User? user = await _waitForInitialAuthState();

      if (user == null) {
        await _completeMinimumSplashTime(
          splashTimer,
        );

        _openLogin();
        return;
      }

      rememberedEmail = user.email?.trim();

      _updateStatus(
        'Verifying your account...',
      );

      try {
        await user.reload();
        user = _auth.currentUser;
      } on FirebaseAuthException catch (error) {
        if (_shouldClearInvalidSession(error.code)) {
          await _safeSignOut();

          await _completeMinimumSplashTime(
            splashTimer,
          );

          _openLogin(
            initialEmail: rememberedEmail,
            message: _firebaseErrorMessage(error),
          );

          return;
        }

        if (error.code != 'network-request-failed') {
          rethrow;
        }

        user = _auth.currentUser;
      }

      if (user == null) {
        await _completeMinimumSplashTime(
          splashTimer,
        );

        _openLogin(
          initialEmail: rememberedEmail,
          message:
          'Your session has expired. Please login again.',
        );

        return;
      }

      final bool usesPasswordProvider =
      user.providerData.any(
            (UserInfo provider) =>
        provider.providerId == 'password',
      );

      if (usesPasswordProvider &&
          !user.emailVerified) {
        final String email =
        user.email?.trim().isNotEmpty == true
            ? user.email!.trim()
            : rememberedEmail ?? '';

        _updateStatus(
          'Email verification required...',
        );

        await _completeMinimumSplashTime(
          splashTimer,
        );

        _openEmailVerification(
          email: email,
        );

        return;
      }

      _updateStatus(
        'Welcome back, ${_displayNameFor(user)}...',
      );

      await _completeMinimumSplashTime(
        splashTimer,
      );

      _openHome();
    } on FirebaseAuthException catch (error) {
      await _safeSignOut();

      await _completeMinimumSplashTime(
        splashTimer,
      );

      _openLogin(
        initialEmail: rememberedEmail,
        message: _firebaseErrorMessage(error),
      );
    } catch (error, stackTrace) {
      debugPrint(
        'Splash authentication error: $error',
      );

      debugPrintStack(
        stackTrace: stackTrace,
      );

      await _safeSignOut();

      await _completeMinimumSplashTime(
        splashTimer,
      );

      _openLogin(
        initialEmail: rememberedEmail,
        message:
        'Unable to restore your session. Please login again.',
      );
    }
  }

  Future<User?> _waitForInitialAuthState() async {
    try {
      return await _auth
          .authStateChanges()
          .first
          .timeout(
        const Duration(seconds: 8),
      );
    } on TimeoutException {
      return _auth.currentUser;
    }
  }

  Future<void> _completeMinimumSplashTime(
      Stopwatch stopwatch,
      ) async {
    const Duration minimumDuration =
    Duration(milliseconds: 2800);

    final Duration elapsed = stopwatch.elapsed;

    if (elapsed < minimumDuration) {
      await Future<void>.delayed(
        minimumDuration - elapsed,
      );
    }
  }

  bool _shouldClearInvalidSession(
      String errorCode,
      ) {
    return errorCode == 'user-disabled' ||
        errorCode == 'user-not-found' ||
        errorCode == 'invalid-user-token' ||
        errorCode == 'user-token-expired';
  }

  String _firebaseErrorMessage(
      FirebaseAuthException error,
      ) {
    switch (error.code) {
      case 'network-request-failed':
        return 'Unable to connect. Check your internet connection.';

      case 'user-disabled':
        return 'This account has been disabled.';

      case 'user-not-found':
        return 'This account no longer exists.';

      case 'invalid-user-token':
      case 'user-token-expired':
        return 'Your session has expired. Please login again.';

      case 'too-many-requests':
        return 'Too many requests. Please wait and try again.';

      default:
        return error.message?.trim().isNotEmpty == true
            ? error.message!.trim()
            : 'Unable to restore your session. Please login again.';
    }
  }

  String _displayNameFor(User user) {
    final String displayName =
        user.displayName?.trim() ?? '';

    if (displayName.isNotEmpty) {
      return displayName
          .split(RegExp(r'\s+'))
          .first;
    }

    final String email =
        user.email?.trim() ?? '';

    if (email.contains('@')) {
      return email.split('@').first;
    }

    final String phone =
        user.phoneNumber?.trim() ?? '';

    if (phone.isNotEmpty) {
      return 'Customer';
    }

    return 'User';
  }

  Future<void> _safeSignOut() async {
    try {
      await _auth.signOut();
    } catch (_) {
      // Navigation continues even if sign-out fails.
    }
  }

  void _updateStatus(String value) {
    if (!mounted) {
      return;
    }

    setState(() {
      _statusText = value;
    });
  }

  Route<void> _buildFadeSlideRoute(
      Widget page,
      ) {
    return PageRouteBuilder<void>(
      transitionDuration:
      const Duration(milliseconds: 650),
      reverseTransitionDuration:
      const Duration(milliseconds: 300),
      pageBuilder: (
          BuildContext context,
          Animation<double> animation,
          Animation<double> secondaryAnimation,
          ) {
        return page;
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
    );
  }

  void _openHome() {
    if (!mounted) {
      return;
    }

    Navigator.of(context).pushAndRemoveUntil(
      _buildFadeSlideRoute(
        const HomeScreen(),
      ),
          (Route<dynamic> route) => false,
    );
  }

  void _openEmailVerification({
    required String email,
  }) {
    if (!mounted) {
      return;
    }

    Navigator.of(context).pushAndRemoveUntil(
      _buildFadeSlideRoute(
        EmailVerificationScreen(
          email: email,
        ),
      ),
          (Route<dynamic> route) => false,
    );
  }

  void _openLogin({
    String? initialEmail,
    String? message,
  }) {
    if (!mounted) {
      return;
    }

    Navigator.of(context).pushAndRemoveUntil(
      _buildFadeSlideRoute(
        LoginScreen(
          initialEmail: initialEmail,
          initialMessage: message,
        ),
      ),
          (Route<dynamic> route) => false,
    );
  }

  Widget _buildBackgroundDecoration() {
    return Stack(
      children: [
        Positioned.fill(
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                stops: <double>[
                  0.0,
                  0.48,
                  1.0,
                ],
                colors: <Color>[
                  Color(0xFF0B4D2B),
                  AppColors.primaryGreen,
                  AppColors.accentGreen,
                ],
              ),
            ),
          ),
        ),
        Positioned(
          top: -110,
          right: -80,
          child: Container(
            width: 280,
            height: 280,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color:
              Colors.white.withOpacity(0.07),
            ),
          ),
        ),
        Positioned(
          bottom: -130,
          left: -100,
          child: Container(
            width: 310,
            height: 310,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.goldAmber
                  .withOpacity(0.08),
            ),
          ),
        ),
        Positioned(
          top: 90,
          left: 36,
          child: FadeInDown(
            duration:
            const Duration(milliseconds: 900),
            child: Transform.rotate(
              angle: -0.35,
              child: Icon(
                Icons.eco_rounded,
                color: AppColors.goldAmber
                    .withOpacity(0.50),
                size: 31,
              ),
            ),
          ),
        ),
        Positioned(
          top: 155,
          right: 46,
          child: FadeInDown(
            delay:
            const Duration(milliseconds: 350),
            duration:
            const Duration(milliseconds: 900),
            child: Transform.rotate(
              angle: 0.55,
              child: Icon(
                Icons.eco_outlined,
                color: AppColors.goldAmber
                    .withOpacity(0.45),
                size: 25,
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 155,
          left: 52,
          child: FadeInUp(
            delay:
            const Duration(milliseconds: 600),
            duration:
            const Duration(milliseconds: 900),
            child: Transform.rotate(
              angle: 0.25,
              child: Icon(
                Icons.eco_outlined,
                color:
                Colors.white.withOpacity(0.22),
                size: 28,
              ),
            ),
          ),
        ),
        Positioned(
          bottom: 210,
          right: 42,
          child: FadeInUp(
            delay:
            const Duration(milliseconds: 850),
            duration:
            const Duration(milliseconds: 900),
            child: Transform.rotate(
              angle: -0.45,
              child: Icon(
                Icons.eco_rounded,
                color: AppColors.goldAmber
                    .withOpacity(0.38),
                size: 23,
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildLogo() {
    return ScaleTransition(
      scale: _pulseAnimation,
      child: SizedBox(
        width: 150,
        height: 150,
        child: Stack(
          alignment: Alignment.center,
          children: [
            RotationTransition(
              turns: _rotationController,
              child: const CustomPaint(
                size: Size.square(142),
                painter: _PremiumRingPainter(),
              ),
            ),
            Container(
              width: 112,
              height: 112,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: <Color>[
                    Colors.white,
                    Color(0xFFF4FFF6),
                  ],
                ),
                border: Border.all(
                  color:
                  Colors.white.withOpacity(0.80),
                  width: 2,
                ),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color:
                    Colors.black.withOpacity(0.24),
                    blurRadius: 28,
                    offset: const Offset(0, 14),
                  ),
                  BoxShadow(
                    color: AppColors.goldAmber
                        .withOpacity(0.20),
                    blurRadius: 30,
                    spreadRadius: 3,
                  ),
                ],
              ),
              child: const Icon(
                Icons.eco_rounded,
                size: 62,
                color: AppColors.primaryGreen,
              ),
            ),
            Positioned(
              top: 17,
              right: 25,
              child: Container(
                width: 13,
                height: 13,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.goldAmber,
                  boxShadow: <BoxShadow>[
                    BoxShadow(
                      color: AppColors.goldAmber
                          .withOpacity(0.55),
                      blurRadius: 10,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTitle() {
    return Column(
      children: [
        ShaderMask(
          blendMode: BlendMode.srcIn,
          shaderCallback: (Rect bounds) {
            return const LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              colors: <Color>[
                Colors.white,
                AppColors.goldAmber,
                Colors.white,
              ],
              stops: <double>[
                0.05,
                0.50,
                0.95,
              ],
            ).createShader(bounds);
          },
          child: Text(
            'FARM TO HOME',
            textAlign: TextAlign.center,
            style: GoogleFonts.lexend(
              fontSize: 33,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: 2.1,
            ),
          ),
        ),
        const SizedBox(height: 10),
        FadeIn(
          delay:
          const Duration(milliseconds: 700),
          duration:
          const Duration(milliseconds: 900),
          child: Text(
            'Premium Freshness at Your Doorstep',
            textAlign: TextAlign.center,
            style: GoogleFonts.lato(
              color:
              Colors.white.withOpacity(0.76),
              fontSize: 15,
              fontStyle: FontStyle.italic,
              fontWeight: FontWeight.w400,
              letterSpacing: 0.2,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusIndicator() {
    return Column(
      children: [
        SizedBox(
          width: 165,
          child: ClipRRect(
            borderRadius:
            BorderRadius.circular(20),
            child:
            const LinearProgressIndicator(
              minHeight: 4,
              backgroundColor:
              Color(0x33FFFFFF),
              valueColor:
              AlwaysStoppedAnimation<Color>(
                AppColors.goldAmber,
              ),
            ),
          ),
        ),
        const SizedBox(height: 15),
        AnimatedSwitcher(
          duration:
          const Duration(milliseconds: 350),
          transitionBuilder: (
              Widget child,
              Animation<double> animation,
              ) {
            return FadeTransition(
              opacity: animation,
              child: SlideTransition(
                position: Tween<Offset>(
                  begin:
                  const Offset(0, 0.25),
                  end: Offset.zero,
                ).animate(animation),
                child: child,
              ),
            );
          },
          child: Text(
            _statusText,
            key: ValueKey<String>(_statusText),
            textAlign: TextAlign.center,
            style: GoogleFonts.lato(
              color:
              Colors.white.withOpacity(0.72),
              fontSize: 12.5,
              fontWeight: FontWeight.w600,
              letterSpacing: 0.2,
            ),
          ),
        ),
      ],
    );
  }

  @override
  void dispose() {
    _rotationController.dispose();
    _pulseController.dispose();

    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final Size screenSize =
    MediaQuery.sizeOf(context);

    final bool isSmallScreen =
        screenSize.height < 650;

    return Scaffold(
      backgroundColor:
      AppColors.primaryGreen,
      body: Stack(
        children: [
          _buildBackgroundDecoration(),
          SafeArea(
            child: Center(
              child: SingleChildScrollView(
                physics:
                const NeverScrollableScrollPhysics(),
                padding:
                const EdgeInsets.symmetric(
                  horizontal: 24,
                  vertical: 24,
                ),
                child: ConstrainedBox(
                  constraints:
                  const BoxConstraints(
                    maxWidth: 520,
                  ),
                  child: Column(
                    mainAxisAlignment:
                    MainAxisAlignment.center,
                    children: [
                      FadeInDown(
                        duration: const Duration(
                          milliseconds: 900,
                        ),
                        child: _buildLogo(),
                      ),
                      SizedBox(
                        height:
                        isSmallScreen ? 22 : 32,
                      ),
                      FadeInUp(
                        delay: const Duration(
                          milliseconds: 250,
                        ),
                        duration: const Duration(
                          milliseconds: 900,
                        ),
                        child: _buildTitle(),
                      ),
                      SizedBox(
                        height:
                        isSmallScreen ? 40 : 58,
                      ),
                      FadeInUp(
                        delay: const Duration(
                          milliseconds: 600,
                        ),
                        duration: const Duration(
                          milliseconds: 900,
                        ),
                        child:
                        _buildStatusIndicator(),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 24,
            child: SafeArea(
              top: false,
              child: FadeIn(
                delay: const Duration(
                  milliseconds: 1100,
                ),
                child: Text(
                  'Fresh • Secure • Trusted',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.lato(
                    color: Colors.white
                        .withOpacity(0.48),
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PremiumRingPainter
    extends CustomPainter {
  const _PremiumRingPainter();

  @override
  void paint(Canvas canvas, Size size) {
    final Offset center = Offset(
      size.width / 2,
      size.height / 2,
    );

    final double radius =
        size.width / 2 - 4;

    final Rect ringRect =
    Rect.fromCircle(
      center: center,
      radius: radius,
    );

    final Paint basePaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2
      ..color =
      Colors.white.withOpacity(0.16);

    final Paint gradientPaint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round
      ..shader = const SweepGradient(
        colors: <Color>[
          Colors.transparent,
          AppColors.goldAmber,
          Colors.white,
          AppColors.goldAmber,
          Colors.transparent,
        ],
        stops: <double>[
          0.0,
          0.25,
          0.50,
          0.75,
          1.0,
        ],
      ).createShader(ringRect);

    canvas.drawCircle(
      center,
      radius,
      basePaint,
    );

    canvas.drawArc(
      ringRect,
      0,
      4.7,
      false,
      gradientPaint,
    );

    final Paint dotPaint = Paint()
      ..style = PaintingStyle.fill
      ..color = AppColors.goldAmber;

    const int dotCount = 8;

    for (
    int index = 0;
    index < dotCount;
    index++
    ) {
      final double angle =
          (index / dotCount) *
              2 *
              math.pi;

      final Offset dotPosition = Offset(
        center.dx +
            (radius - 8) *
                math.cos(angle),
        center.dy +
            (radius - 8) *
                math.sin(angle),
      );

      canvas.drawCircle(
        dotPosition,
        index.isEven ? 2.2 : 1.4,
        dotPaint,
      );
    }
  }

  @override
  bool shouldRepaint(
      covariant _PremiumRingPainter oldDelegate,
      ) {
    return false;
  }
}