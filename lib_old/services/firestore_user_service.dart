import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/user_model.dart';

class FirestoreUserService {
  FirestoreUserService({
    FirebaseFirestore? firestore,
  }) : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> get _usersCollection {
    return _firestore.collection('users');
  }

  Future<void> createOrUpdateUser(User firebaseUser) async {
    final DocumentReference<Map<String, dynamic>> userDocument =
    _usersCollection.doc(firebaseUser.uid);

    final DocumentSnapshot<Map<String, dynamic>> existingUser =
    await userDocument.get();

    final String loginMethod = _getLoginMethod(firebaseUser);

    final String displayName = _getDisplayName(firebaseUser);

    if (existingUser.exists) {
      await userDocument.set(
        <String, dynamic>{
          'uid': firebaseUser.uid,
          'name': displayName,
          'email': firebaseUser.email?.trim() ?? '',
          'phone': firebaseUser.phoneNumber?.trim() ?? '',
          'photoUrl': firebaseUser.photoURL?.trim() ?? '',
          'loginMethod': loginMethod,
          'emailVerified': firebaseUser.emailVerified,
          'lastLogin': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );

      return;
    }

    final UserModel newUser = UserModel(
      uid: firebaseUser.uid,
      name: displayName,
      email: firebaseUser.email?.trim() ?? '',
      phone: firebaseUser.phoneNumber?.trim() ?? '',
      photoUrl: firebaseUser.photoURL?.trim() ?? '',
      loginMethod: loginMethod,
      emailVerified: firebaseUser.emailVerified,
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    );

    await userDocument.set(
      <String, dynamic>{
        ...newUser.toMap(),
        'createdAt': FieldValue.serverTimestamp(),
        'lastLogin': FieldValue.serverTimestamp(),
      },
    );
  }

  Future<UserModel?> getUserByUid(String uid) async {
    if (uid.trim().isEmpty) {
      return null;
    }

    final DocumentSnapshot<Map<String, dynamic>> document =
    await _usersCollection.doc(uid.trim()).get();

    final Map<String, dynamic>? data = document.data();

    if (!document.exists || data == null) {
      return null;
    }

    return UserModel.fromMap(data);
  }

  Stream<UserModel?> watchUserByUid(String uid) {
    if (uid.trim().isEmpty) {
      return Stream<UserModel?>.value(null);
    }

    return _usersCollection.doc(uid.trim()).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> document) {
        final Map<String, dynamic>? data = document.data();

        if (!document.exists || data == null) {
          return null;
        }

        return UserModel.fromMap(data);
      },
    );
  }

  Future<void> updateUserProfile({
    required String uid,
    String? name,
    String? phone,
    String? photoUrl,
  }) async {
    if (uid.trim().isEmpty) {
      throw ArgumentError('User UID cannot be empty.');
    }

    final Map<String, dynamic> updatedData = <String, dynamic>{
      'updatedAt': FieldValue.serverTimestamp(),
    };

    if (name != null) {
      updatedData['name'] = name.trim();
    }

    if (phone != null) {
      updatedData['phone'] = phone.trim();
    }

    if (photoUrl != null) {
      updatedData['photoUrl'] = photoUrl.trim();
    }

    await _usersCollection.doc(uid.trim()).set(
      updatedData,
      SetOptions(merge: true),
    );
  }

  Future<void> updateEmailVerificationStatus({
    required String uid,
    required bool emailVerified,
  }) async {
    if (uid.trim().isEmpty) {
      throw ArgumentError('User UID cannot be empty.');
    }

    await _usersCollection.doc(uid.trim()).set(
      <String, dynamic>{
        'emailVerified': emailVerified,
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  Future<void> updateLastLogin(String uid) async {
    if (uid.trim().isEmpty) {
      return;
    }

    await _usersCollection.doc(uid.trim()).set(
      <String, dynamic>{
        'lastLogin': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  Future<void> deleteUserDocument(String uid) async {
    if (uid.trim().isEmpty) {
      throw ArgumentError('User UID cannot be empty.');
    }

    await _usersCollection.doc(uid.trim()).delete();
  }

  String _getDisplayName(User firebaseUser) {
    final String firebaseDisplayName =
        firebaseUser.displayName?.trim() ?? '';

    if (firebaseDisplayName.isNotEmpty) {
      return firebaseDisplayName;
    }

    final String email = firebaseUser.email?.trim() ?? '';

    if (email.contains('@')) {
      final String emailName = email.split('@').first.trim();

      if (emailName.isNotEmpty) {
        return emailName;
      }
    }

    final String phone = firebaseUser.phoneNumber?.trim() ?? '';

    if (phone.isNotEmpty) {
      return 'Farm To Home Customer';
    }

    return 'Farm To Home Member';
  }

  String _getLoginMethod(User firebaseUser) {
    final List<String> providerIds = firebaseUser.providerData
        .map(
          (UserInfo provider) => provider.providerId,
    )
        .toList();

    if (providerIds.contains('google.com')) {
      return 'google';
    }

    if (providerIds.contains('apple.com')) {
      return 'apple';
    }

    if (providerIds.contains('phone')) {
      return 'phone';
    }

    if (providerIds.contains('password')) {
      return 'email';
    }

    return 'unknown';
  }
}