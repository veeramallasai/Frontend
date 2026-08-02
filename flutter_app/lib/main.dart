import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'constants/app_colors.dart';
import 'providers/auth_provider.dart';
import 'providers/cart_provider.dart';
import 'providers/delivery_provider.dart';
import 'providers/order_provider.dart';
import 'screens/auth/login_screen.dart';
import 'screens/home/home_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()..tryAutoLogin()),
        ChangeNotifierProxyProvider<AuthProvider, CartProvider>(
          create: (_) => CartProvider(''),
          update: (_, auth, previous) => CartProvider(auth.token ?? ''),
        ),
        ChangeNotifierProxyProvider<AuthProvider, DeliveryProvider>(
          create: (_) => DeliveryProvider(''),
          update: (_, auth, previous) => DeliveryProvider(auth.token ?? ''),
        ),
        ChangeNotifierProxyProvider<AuthProvider, OrderProvider>(
          create: (_) => OrderProvider(''),
          update: (_, auth, previous) => OrderProvider(auth.token ?? ''),
        ),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'FarmToHome',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(
          seedColor: AppColors.primary,
          primary: AppColors.primary,
          secondary: AppColors.secondary,
          surface: AppColors.background,
        ),
        scaffoldBackgroundColor: AppColors.background,
        appBarTheme: const AppBarTheme(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          elevation: 0,
        ),
      ),
      home: Consumer<AuthProvider>(
        builder: (ctx, auth, _) {
          if (auth.isAuth) {
            return const HomeScreen();
          }
          return FutureBuilder(
            future: auth.tryAutoLogin(),
            builder: (ctx, authResultSnapshot) {
              if (authResultSnapshot.connectionState == ConnectionState.waiting) {
                return const Scaffold(
                  body: Center(
                    child: CircularProgressIndicator(color: AppColors.primary),
                  ),
                );
              }
              return const LoginScreen();
            },
          );
        },
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}
