import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';
import 'package:google_sign_in/google_sign_in.dart';

import 'firestore_user_service.dart';

class AuthService {
  AuthService({
    FirebaseAuth? firebaseAuth,
    FirestoreUserService? firestoreUserService,
  })  : _auth = firebaseAuth ?? FirebaseAuth.instance,
        _firestoreUserService =
            firestoreUserService ?? FirestoreUserService();

  final FirebaseAuth _auth;
  final FirestoreUserService _firestoreUserService;

  bool _googleInitialized = false;
  bool _webPersistenceInitialized = false;

  FirebaseAuth get firebaseAuth => _auth;

  User? get currentUser => _auth.currentUser;

  bool get isLoggedIn => _auth.currentUser != null;

  Stream<User?> get authStateChanges {
    return _auth.authStateChanges();
  }

  Stream<User?> get userChanges {
    return _auth.userChanges();
  }

  Stream<User?> get idTokenChanges {
    return _auth.idTokenChanges();
  }

  // =========================================================
  // WEB SESSION PERSISTENCE
  // =========================================================

  Future<void> _ensureWebPersistence() async {
    if (!kIsWeb || _webPersistenceInitialized) {
      return;
    }

    await _auth.setPersistence(
      Persistence.LOCAL,
    );

    _webPersistenceInitialized = true;
  }

  // =========================================================
  // FIRESTORE USER SYNC
  // =========================================================

  Future<void> syncCurrentUserWithFirestore() async {
    final User? currentUser = _auth.currentUser;

    if (currentUser == null) {
      return;
    }

    User resolvedUser = currentUser;

    try {
      await currentUser.reload();

      resolvedUser = _auth.currentUser ?? currentUser;
    } catch (_) {
      resolvedUser = currentUser;
    }

    await _firestoreUserService.createOrUpdateUser(
      resolvedUser,
    );
  }

  Future<void> _syncCredentialUser(
      UserCredential userCredential,
      ) async {
    final User? credentialUser =
        userCredential.user ?? _auth.currentUser;

    if (credentialUser == null) {
      return;
    }

    User resolvedUser = credentialUser;

    try {
      await credentialUser.reload();

      resolvedUser =
          _auth.currentUser ?? credentialUser;
    } catch (_) {
      resolvedUser = credentialUser;
    }

    await _firestoreUserService.createOrUpdateUser(
      resolvedUser,
    );
  }

  // =========================================================
  // PHONE OTP AUTHENTICATION
  // =========================================================

  Future<void> sendOtp({
    required String phoneNumber,
    required void Function(
        PhoneAuthCredential credential,
        ) onVerificationCompleted,
    required void Function(
        FirebaseAuthException error,
        ) onVerificationFailed,
    required void Function(
        String verificationId,
        int? resendToken,
        ) onCodeSent,
    required void Function(
        String verificationId,
        ) onCodeAutoRetrievalTimeout,
    int? forceResendingToken,
  }) async {
    final String formattedPhoneNumber =
    _normalizeIndianPhoneNumber(phoneNumber);

    await _auth.verifyPhoneNumber(
      phoneNumber: formattedPhoneNumber,
      timeout: const Duration(seconds: 60),
      forceResendingToken: forceResendingToken,
      verificationCompleted: onVerificationCompleted,
      verificationFailed: onVerificationFailed,
      codeSent: onCodeSent,
      codeAutoRetrievalTimeout:
      onCodeAutoRetrievalTimeout,
    );
  }

  Future<UserCredential?> signInWithCredential(
      PhoneAuthCredential credential,
      ) async {
    final UserCredential result =
    await _auth.signInWithCredential(
      credential,
    );

    await _syncCredentialUser(result);

    return result;
  }

  Future<UserCredential> verifyOtp({
    required String verificationId,
    required String smsCode,
  }) async {
    final String normalizedCode = smsCode.trim();

    if (!RegExp(r'^[0-9]{6}$')
        .hasMatch(normalizedCode)) {
      throw FirebaseAuthException(
        code: 'invalid-verification-code',
        message:
        'Enter the valid 6-digit verification code.',
      );
    }

    final PhoneAuthCredential credential =
    PhoneAuthProvider.credential(
      verificationId: verificationId.trim(),
      smsCode: normalizedCode,
    );

    final UserCredential result =
    await _auth.signInWithCredential(
      credential,
    );

    await _syncCredentialUser(result);

    return result;
  }

  String _normalizeIndianPhoneNumber(
      String phoneNumber,
      ) {
    String value = phoneNumber
        .trim()
        .replaceAll(
      RegExp(r'[\s\-()]'),
      '',
    );

    if (value.startsWith('+91')) {
      value = value.substring(3);
    } else if (value.startsWith('91') &&
        value.length == 12) {
      value = value.substring(2);
    } else if (value.startsWith('0') &&
        value.length == 11) {
      value = value.substring(1);
    }

    if (!RegExp(r'^[6-9][0-9]{9}$')
        .hasMatch(value)) {
      throw FirebaseAuthException(
        code: 'invalid-phone-number',
        message:
        'Enter a valid 10-digit Indian mobile number.',
      );
    }

    return '+91$value';
  }

  // =========================================================
  // EMAIL AND PASSWORD AUTHENTICATION
  // =========================================================

  Future<UserCredential?> loginWithEmailPassword(
      String email,
      String password,
      ) async {
    await _ensureWebPersistence();

    final String normalizedEmail =
    _normalizeEmail(email);

    if (password.isEmpty) {
      throw FirebaseAuthException(
        code: 'wrong-password',
        message: 'Password is required.',
      );
    }

    final UserCredential result =
    await _auth.signInWithEmailAndPassword(
      email: normalizedEmail,
      password: password,
    );

    await _syncCredentialUser(result);

    return result;
  }

  Future<UserCredential?> registerWithEmailPassword(
      String email,
      String password,
      ) async {
    await _ensureWebPersistence();

    final String normalizedEmail =
    _normalizeEmail(email);

    if (password.length < 8) {
      throw FirebaseAuthException(
        code: 'weak-password',
        message:
        'Password must contain at least 8 characters.',
      );
    }

    final UserCredential result =
    await _auth.createUserWithEmailAndPassword(
      email: normalizedEmail,
      password: password,
    );

    await _syncCredentialUser(result);

    return result;
  }

  Future<void> sendPasswordResetEmail(
      String email,
      ) async {
    await _auth.sendPasswordResetEmail(
      email: _normalizeEmail(email),
    );
  }

  Future<void> sendCurrentUserEmailVerification({
    ActionCodeSettings? actionCodeSettings,
  }) async {
    User? user = _auth.currentUser;

    if (user == null) {
      throw FirebaseAuthException(
        code: 'user-not-found',
        message:
        'No authenticated user was found.',
      );
    }

    await user.reload();

    user = _auth.currentUser;

    if (user == null) {
      throw FirebaseAuthException(
        code: 'user-not-found',
        message:
        'Unable to load the current user.',
      );
    }

    final String email =
        user.email?.trim() ?? '';

    if (email.isEmpty) {
      throw FirebaseAuthException(
        code: 'missing-email',
        message:
        'This account does not have an email address.',
      );
    }

    if (user.emailVerified) {
      await _firestoreUserService
          .updateEmailVerificationStatus(
        uid: user.uid,
        emailVerified: true,
      );

      return;
    }

    if (actionCodeSettings != null) {
      await user.sendEmailVerification(
        actionCodeSettings,
      );
    } else {
      await user.sendEmailVerification();
    }
  }

  Future<bool>
  reloadAndCheckEmailVerification() async {
    final User? currentUser = _auth.currentUser;

    if (currentUser == null) {
      return false;
    }

    await currentUser.reload();

    final User? refreshedUser =
        _auth.currentUser;

    if (refreshedUser == null) {
      return false;
    }

    final bool isVerified =
        refreshedUser.emailVerified;

    await _firestoreUserService
        .updateEmailVerificationStatus(
      uid: refreshedUser.uid,
      emailVerified: isVerified,
    );

    if (isVerified) {
      await _firestoreUserService.createOrUpdateUser(
        refreshedUser,
      );
    }

    return isVerified;
  }

  Future<User?> reloadCurrentUser() async {
    final User? currentUser =
        _auth.currentUser;

    if (currentUser == null) {
      return null;
    }

    await currentUser.reload();

    final User? refreshedUser =
        _auth.currentUser;

    if (refreshedUser != null) {
      await _firestoreUserService.createOrUpdateUser(
        refreshedUser,
      );
    }

    return refreshedUser;
  }

  Future<void> updateDisplayName(
      String displayName,
      ) async {
    final User? currentUser =
        _auth.currentUser;

    if (currentUser == null) {
      throw FirebaseAuthException(
        code: 'user-not-found',
        message:
        'No authenticated user was found.',
      );
    }

    final String normalizedDisplayName =
    displayName.trim();

    if (normalizedDisplayName.isEmpty) {
      throw FirebaseAuthException(
        code: 'invalid-display-name',
        message:
        'Display name cannot be empty.',
      );
    }

    await currentUser.updateDisplayName(
      normalizedDisplayName,
    );

    await currentUser.reload();

    final User? refreshedUser =
        _auth.currentUser;

    if (refreshedUser == null) {
      return;
    }

    await _firestoreUserService.updateUserProfile(
      uid: refreshedUser.uid,
      name: normalizedDisplayName,
    );

    await _firestoreUserService.createOrUpdateUser(
      refreshedUser,
    );
  }

  String _normalizeEmail(String email) {
    final String normalizedEmail =
    email.trim().toLowerCase();

    final RegExp emailPattern = RegExp(
      r'^[a-zA-Z0-9.!#$%&'
      r"'"
      r'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+'
      r'(?:\.[a-zA-Z0-9-]+)+$',
    );

    if (!emailPattern.hasMatch(
      normalizedEmail,
    )) {
      throw FirebaseAuthException(
        code: 'invalid-email',
        message:
        'Enter a valid email address.',
      );
    }

    return normalizedEmail;
  }

  // =========================================================
  // GOOGLE AUTHENTICATION
  // =========================================================

  Future<void> _initializeGoogleSignIn() async {
    if (_googleInitialized || kIsWeb) {
      return;
    }

    await GoogleSignIn.instance.initialize();

    _googleInitialized = true;
  }

  Future<UserCredential?> signInWithGoogle() async {
    await _ensureWebPersistence();

    if (kIsWeb) {
      final GoogleAuthProvider provider =
      GoogleAuthProvider();

      provider.addScope('email');
      provider.addScope('profile');

      final UserCredential result =
      await _auth.signInWithPopup(
        provider,
      );

      await _syncCredentialUser(result);

      return result;
    }

    await _initializeGoogleSignIn();

    try {
      if (!GoogleSignIn.instance
          .supportsAuthenticate()) {
        throw FirebaseAuthException(
          code:
          'google-sign-in-not-supported',
          message:
          'Google Sign-In is not supported on this platform.',
        );
      }

      final GoogleSignInAccount googleUser =
      await GoogleSignIn.instance.authenticate();

      final GoogleSignInAuthentication
      googleAuthentication =
          googleUser.authentication;

      final String? idToken =
          googleAuthentication.idToken;

      if (idToken == null ||
          idToken.trim().isEmpty) {
        throw FirebaseAuthException(
          code: 'missing-google-id-token',
          message:
          'Google account ID token was not received. Check Firebase and Google Sign-In configuration.',
        );
      }

      final OAuthCredential credential =
      GoogleAuthProvider.credential(
        idToken: idToken,
      );

      final UserCredential result =
      await _auth.signInWithCredential(
        credential,
      );

      await _syncCredentialUser(result);

      return result;
    } on GoogleSignInException catch (error) {
      if (error.code ==
          GoogleSignInExceptionCode.canceled) {
        return null;
      }

      throw FirebaseAuthException(
        code: 'google-sign-in-failed',
        message: error.description ??
            'Google sign-in could not be completed.',
      );
    } on FirebaseAuthException {
      rethrow;
    } catch (error) {
      throw FirebaseAuthException(
        code: 'google-sign-in-failed',
        message:
        'Google sign-in failed: $error',
      );
    }
  }

  // =========================================================
  // APPLE AUTHENTICATION
  // =========================================================

  Future<UserCredential?> signInWithApple() async {
    await _ensureWebPersistence();

    final AppleAuthProvider provider =
    AppleAuthProvider();

    provider.addScope('email');
    provider.addScope('name');

    final UserCredential result;

    if (kIsWeb) {
      result = await _auth.signInWithPopup(
        provider,
      );
    } else {
      result = await _auth.signInWithProvider(
        provider,
      );
    }

    await _syncCredentialUser(result);

    return result;
  }

  // =========================================================
  // ACCOUNT HELPERS
  // =========================================================

  bool usesPasswordProvider(User user) {
    return user.providerData.any(
          (UserInfo provider) {
        return provider.providerId == 'password';
      },
    );
  }

  bool usesGoogleProvider(User user) {
    return user.providerData.any(
          (UserInfo provider) {
        return provider.providerId ==
            GoogleAuthProvider.PROVIDER_ID;
      },
    );
  }

  bool usesAppleProvider(User user) {
    return user.providerData.any(
          (UserInfo provider) {
        return provider.providerId ==
            AppleAuthProvider.PROVIDER_ID;
      },
    );
  }

  bool usesPhoneProvider(User user) {
    return user.providerData.any(
          (UserInfo provider) {
        return provider.providerId ==
            PhoneAuthProvider.PROVIDER_ID;
      },
    );
  }

  Future<void> deleteCurrentAccount() async {
    final User? currentUser =
        _auth.currentUser;

    if (currentUser == null) {
      throw FirebaseAuthException(
        code: 'user-not-found',
        message:
        'No authenticated account was found.',
      );
    }

    final String uid = currentUser.uid;

    await _firestoreUserService
        .deleteUserDocument(uid);

    await currentUser.delete();
  }

  // =========================================================
  // SIGN OUT
  // =========================================================

  Future<void> signOut() async {
    try {
      if (!kIsWeb && _googleInitialized) {
        await GoogleSignIn.instance.signOut();
      }
    } catch (_) {
      // Firebase sign-out must continue.
    }

    await _auth.signOut();
  }
}