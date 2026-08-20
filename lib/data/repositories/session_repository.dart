import 'dart:async';
import '../models/auth_session_model.dart';

class SessionRepository {
  SessionRepository();

  static AuthSessionModel _current = const AuthSessionModel(
    userId: '',
    isAuthenticated: false,
  );

  static final StreamController<AuthSessionModel> _controller =
      StreamController<AuthSessionModel>.broadcast();

  Stream<AuthSessionModel> watchSession() async* {
    yield _current;
    yield* _controller.stream;
  }

  AuthSessionModel get currentSession => _current;
  static String get currentToken => _current.token;

  static void setSession({
    required String userId,
    required String email,
    String phoneNumber = '',
    String token = '',
    String name = '',
  }) {
    _current = AuthSessionModel(
      userId: userId,
      email: email,
      phoneNumber: phoneNumber,
      token: token,
      provider: 'rest_api',
      isAuthenticated: userId.isNotEmpty,
      createdAt: DateTime.now(),
      lastSeenAt: DateTime.now(),
    );
    _controller.add(_current);
  }

  Future<void> touchSession() async {
    if (!_current.isAuthenticated) return;
    setSession(
      userId: _current.userId,
      email: _current.email,
      phoneNumber: _current.phoneNumber,
      token: _current.token,
    );
  }

  Future<void> endSession() async {
    _current = const AuthSessionModel(userId: '', isAuthenticated: false);
    _controller.add(_current);
  }
}
