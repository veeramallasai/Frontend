import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/address_model.dart';

class AddressRepository {
  AddressRepository({FirebaseFirestore? firestore, FirebaseAuth? auth})
      : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  CollectionReference<Map<String, dynamic>> _addresses(String userId) =>
      _firestore.collection('users').doc(userId).collection('addresses');

  Stream<List<AddressModel>> watchAddresses() {
    final String userId = _requireUserId();
    return _addresses(userId).snapshots().map((QuerySnapshot<Map<String, dynamic>> value) {
      final List<AddressModel> addresses =
      value.docs.map(AddressModel.fromDocument).toList(growable: true);
      addresses.sort((AddressModel first, AddressModel second) {
        if (first.isDefault != second.isDefault) return first.isDefault ? -1 : 1;
        return first.type.compareTo(second.type);
      });
      return List<AddressModel>.unmodifiable(addresses);
    });
  }

  Future<String> saveAddress(AddressModel address) async {
    final String userId = _requireUserId();
    final DocumentReference<Map<String, dynamic>> reference =
    address.id.trim().isEmpty ? _addresses(userId).doc() : _addresses(userId).doc(address.id);
    if (address.isDefault) await _clearDefaults(userId);
    await reference.set(<String, dynamic>{
      ...address.copyWith(id: reference.id, userId: userId).toMap(),
      if (address.createdAt == null) 'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    }, SetOptions(merge: true));
    return reference.id;
  }

  Future<void> deleteAddress(String addressId) async {
    final String userId = _requireUserId();
    if (addressId.trim().isEmpty) return;
    await _addresses(userId).doc(addressId.trim()).delete();
  }

  Future<void> setDefault(String addressId) async {
    final String userId = _requireUserId();
    await _clearDefaults(userId);
    await _addresses(userId).doc(addressId).update(<String, dynamic>{
      'isDefault': true,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> _clearDefaults(String userId) async {
    final QuerySnapshot<Map<String, dynamic>> snapshot = await _addresses(userId).get();
    final WriteBatch batch = _firestore.batch();
    for (final QueryDocumentSnapshot<Map<String, dynamic>> document in snapshot.docs) {
      batch.update(document.reference, <String, dynamic>{'isDefault': false});
    }
    await batch.commit();
  }

  String _requireUserId() {
    final String userId = _auth.currentUser?.uid.trim() ?? '';
    if (userId.isEmpty) throw StateError('Please login to continue.');
    return userId;
  }
}
