import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/address_model.dart';

class AddressService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  CollectionReference<Map<String, dynamic>> get _addressesCollection {
    return _db.collection('addresses');
  }

  // Get all addresses belonging to the current user.
  Stream<List<AddressModel>> getUserAddresses(String userId) {
    return _addressesCollection
        .where('userId', isEqualTo: userId)
        .snapshots()
        .map((QuerySnapshot<Map<String, dynamic>> snapshot) {
      final List<AddressModel> addresses = snapshot.docs
          .map(
            (QueryDocumentSnapshot<Map<String, dynamic>> doc) {
          return AddressModel.fromMap(
            doc.id,
            doc.data(),
          );
        },
      )
          .toList();

      addresses.sort((AddressModel first, AddressModel second) {
        if (first.isDefault && !second.isDefault) {
          return -1;
        }

        if (!first.isDefault && second.isDefault) {
          return 1;
        }

        return 0;
      });

      return addresses;
    });
  }

  // Add a new address.
  Future<void> addAddress(AddressModel address) async {
    final DocumentReference<Map<String, dynamic>> newAddressReference =
    _addressesCollection.doc();

    final Map<String, dynamic> addressData = address.toMap();

    addressData['createdAt'] = FieldValue.serverTimestamp();
    addressData['updatedAt'] = FieldValue.serverTimestamp();

    if (address.isDefault) {
      await _saveAddressAsDefault(
        userId: address.userId,
        addressReference: newAddressReference,
        addressData: addressData,
      );

      return;
    }

    await newAddressReference.set(addressData);
  }

  // Update selected fields of an address.
  Future<void> updateAddress(
      String id,
      Map<String, dynamic> data,
      ) async {
    final Map<String, dynamic> updatedData = {
      ...data,
      'updatedAt': FieldValue.serverTimestamp(),
    };

    await _addressesCollection.doc(id).update(updatedData);
  }

  // Update the complete AddressModel.
  Future<void> updateAddressModel(AddressModel address) async {
    final String? addressId = address.id;

    if (addressId == null || addressId.trim().isEmpty) {
      throw ArgumentError(
        'Address ID is required to update an address.',
      );
    }

    final DocumentReference<Map<String, dynamic>> addressReference =
    _addressesCollection.doc(addressId);

    final Map<String, dynamic> addressData = address.toMap();

    addressData['updatedAt'] = FieldValue.serverTimestamp();

    if (address.isDefault) {
      await _saveAddressAsDefault(
        userId: address.userId,
        addressReference: addressReference,
        addressData: addressData,
      );

      return;
    }

    await addressReference.update(addressData);
  }

  // Delete an address.
  // If the deleted address was default, another address becomes default.
  Future<void> deleteAddress(String id) async {
    final DocumentReference<Map<String, dynamic>> addressReference =
    _addressesCollection.doc(id);

    final DocumentSnapshot<Map<String, dynamic>> addressSnapshot =
    await addressReference.get();

    if (!addressSnapshot.exists) {
      return;
    }

    final Map<String, dynamic>? addressData = addressSnapshot.data();

    final String userId =
        addressData?['userId']?.toString().trim() ?? '';

    final bool wasDefault =
        addressData?['isDefault'] == true;

    await addressReference.delete();

    if (!wasDefault || userId.isEmpty) {
      return;
    }

    final QuerySnapshot<Map<String, dynamic>> remainingAddresses =
    await _addressesCollection
        .where('userId', isEqualTo: userId)
        .limit(1)
        .get();

    if (remainingAddresses.docs.isEmpty) {
      return;
    }

    await remainingAddresses.docs.first.reference.update({
      'isDefault': true,
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  // Remove default status from existing addresses
  // and set the selected address as default.
  Future<void> setDefault(
      String userId,
      String addressId,
      ) async {
    final WriteBatch batch = _db.batch();

    final QuerySnapshot<Map<String, dynamic>> defaultAddresses =
    await _addressesCollection
        .where('userId', isEqualTo: userId)
        .where('isDefault', isEqualTo: true)
        .get();

    for (final QueryDocumentSnapshot<Map<String, dynamic>> document
    in defaultAddresses.docs) {
      batch.update(
        document.reference,
        {
          'isDefault': false,
          'updatedAt': FieldValue.serverTimestamp(),
        },
      );
    }

    batch.update(
      _addressesCollection.doc(addressId),
      {
        'isDefault': true,
        'updatedAt': FieldValue.serverTimestamp(),
      },
    );

    await batch.commit();
  }

  Future<void> _saveAddressAsDefault({
    required String userId,
    required DocumentReference<Map<String, dynamic>> addressReference,
    required Map<String, dynamic> addressData,
  }) async {
    final WriteBatch batch = _db.batch();

    final QuerySnapshot<Map<String, dynamic>> currentDefaultAddresses =
    await _addressesCollection
        .where('userId', isEqualTo: userId)
        .where('isDefault', isEqualTo: true)
        .get();

    for (final QueryDocumentSnapshot<Map<String, dynamic>> document
    in currentDefaultAddresses.docs) {
      if (document.id == addressReference.id) {
        continue;
      }

      batch.update(
        document.reference,
        {
          'isDefault': false,
          'updatedAt': FieldValue.serverTimestamp(),
        },
      );
    }

    batch.set(
      addressReference,
      {
        ...addressData,
        'isDefault': true,
      },
      SetOptions(merge: true),
    );

    await batch.commit();
  }
}