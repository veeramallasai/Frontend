import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../features/auth/login_screen.dart';
import '../features/home/home_screen.dart';

class SessionGate extends StatelessWidget {
  const SessionGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (
          BuildContext context,
          AsyncSnapshot<User?> snapshot,
          ) {
        if (snapshot.connectionState ==
            ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        if (snapshot.data == null) {
          return const LoginScreen();
        }

        return const HomeScreen();
      },
    );
  }
}