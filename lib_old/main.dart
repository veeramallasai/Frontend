import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/material.dart';

import 'core/theme/app_theme.dart';
import 'firebase_options.dart';
import 'screens/splash/splash_screen.dart';
import 'services/notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
  } catch (error, stackTrace) {
    debugPrint('Firebase initialization failed: $error');
    debugPrintStack(stackTrace: stackTrace);
  }

  try {
    await NotificationService().initialize();
  } catch (error, stackTrace) {
    debugPrint('Notification initialization skipped: $error');
    debugPrintStack(stackTrace: stackTrace);
  }

  runApp(const FarmToHomeApp());
}

class FarmToHomeApp extends StatelessWidget {
  const FarmToHomeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Farm To Home',
      theme: AppTheme.premiumTheme,
      home: const SplashScreen(),
    );
  }
}