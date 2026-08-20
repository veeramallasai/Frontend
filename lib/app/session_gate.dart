import 'package:flutter/material.dart';

import '../data/models/auth_session_model.dart';
import '../data/repositories/session_repository.dart';
import '../features/auth/login_screen.dart';
import '../features/home/home_screen.dart';

class SessionGate extends StatelessWidget {
  const SessionGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthSessionModel>(
      stream: SessionRepository().watchSession(),
      builder: (
        BuildContext context,
        AsyncSnapshot<AuthSessionModel> snapshot,
      ) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(),
            ),
          );
        }

        final AuthSessionModel? session = snapshot.data;
        if (session == null || !session.isAuthenticated) {
          return const LoginScreen();
        }

        return const HomeScreen();
      },
    );
  }
}