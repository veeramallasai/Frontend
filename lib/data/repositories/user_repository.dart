import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/user_model.dart';

class UserRepository {
  UserRepository({FirebaseFirestore? firestore, FirebaseAuth? auth})
      : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  DocumentReference<Map<String, dynamic>> _user(String id) =>
      _firestore.collection('users').doc(id);

  Stream<UserModel?> watchCurrentUser() {
    final String id = _requireUserId();
    return _user(id).snapshots().map((DocumentSnapshot<Map<String, dynamic>> doc) =>
        doc.exists ? UserModel.fromDocument(doc) : _fromAuth(_auth.currentUser!));
  }

  Future<UserModel> getCurrentUser() async {
    final String id = _requireUserId();
    final DocumentSnapshot<Map<String, dynamic>> doc = await _user(id).get();
    return doc.exists ? UserModel.fromDocument(doc) : _fromAuth(_auth.currentUser!);
  }

  Future<void> saveProfile(UserModel profile) async {
    final String id = _requireUserId();
    await _user(id).set(
      <String, dynamic>{
        ...profile.copyWith(uid: id).toMap(),
        if (profile.createdAt == null) 'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
    final User? authUser = _auth.currentUser;
    if (authUser != null && profile.displayName.trim().isNotEmpty) {
      await authUser.updateDisplayName(profile.displayName.trim());
    }
  }

  Future<void> updateShoppingMode(String mode) async {
    final String normalized = mode.trim().toLowerCase() == 'shop' ? 'shop' : 'home';
    await _user(_requireUserId()).set(<String, dynamic>{
      'shoppingMode': normalized,
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
  }

  UserModel _fromAuth(User user) {
    final List<String> names = (user.displayName ?? '').trim().split(RegExp(r'\s+'));
    return UserModel(
      uid: user.uid,
      firstName: names.isEmpty ? '' : names.first,
      lastName: names.length <= 1 ? '' : names.skip(1).join(' '),
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      photoUrl: user.photoURL ?? '',
      isPhoneVerified: user.phoneNumber?.isNotEmpty == true,
      isProfileComplete: (user.displayName ?? '').trim().isNotEmpty,
    );
  }

  String _requireUserId() {
    final String id = _auth.currentUser?.uid.trim() ?? '';
    if (id.isEmpty) throw StateError('Please login to continue.');
    return id;
  }
}
