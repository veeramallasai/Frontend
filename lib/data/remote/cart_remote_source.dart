import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/cart_item_model.dart';
import '../models/cart_model.dart';

class CartRemoteSource {
  CartRemoteSource({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  DocumentReference<Map<String, dynamic>> _cart(String userId) =>
      _firestore.collection('carts').doc(userId);

  Stream<CartModel> watchCart(String userId) {
    final String id = _requireUserId(userId);
    return _cart(id).snapshots().map(
          (DocumentSnapshot<Map<String, dynamic>> document) => document.exists
          ? CartModel.fromDocument(document)
          : CartModel.empty(id),
    );
  }

  Future<CartModel> getCart(String userId) async {
    final String id = _requireUserId(userId);
    final DocumentSnapshot<Map<String, dynamic>> document =
    await _cart(id).get();
    return document.exists
        ? CartModel.fromDocument(document)
        : CartModel.empty(id);
  }

  Future<void> addItem(String userId, CartItemModel item) async {
    final String id = _requireUserId(userId);
    await _firestore.runTransaction((Transaction transaction) async {
      final DocumentReference<Map<String, dynamic>> reference = _cart(id);
      final DocumentSnapshot<Map<String, dynamic>> document =
      await transaction.get(reference);
      final CartModel cart = document.exists
          ? CartModel.fromDocument(document)
          : CartModel.empty(id, shoppingMode: item.shoppingMode);
      final List<CartItemModel> items = List<CartItemModel>.from(cart.items);
      final int index = items.indexWhere(
            (CartItemModel value) => value.id == item.id,
      );

      if (index >= 0) {
        final CartItemModel current = items[index];
        items[index] = current.copyWith(
          quantity: current.quantity + item.quantity,
          unitPrice: item.unitPrice,
          mrp: item.mrp,
          imageUrl: item.imageUrl,
        );
      } else {
        items.add(item);
      }

      final CartItemModel savedItem = index >= 0 ? items[index] : items.last;

      transaction.set(
        reference,
        <String, dynamic>{
          ...cart.copyWith(
            shoppingMode: item.shoppingMode,
            items: items,
          ).toMap(),
          'updatedAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
      transaction.set(
        reference.collection('items').doc(savedItem.id),
        <String, dynamic>{
          ...savedItem.toMap(),
          'inStock': true,
          'updatedAt': FieldValue.serverTimestamp(),
        },
        SetOptions(merge: true),
      );
    });
  }

  Future<void> updateQuantity({
    required String userId,
    required String itemId,
    required int quantity,
  }) async {
    final CartModel cart = await getCart(userId);
    final List<CartItemModel> items = quantity <= 0
        ? cart.items.where((CartItemModel item) => item.id != itemId).toList()
        : cart.items.map((CartItemModel item) {
      return item.id == itemId ? item.copyWith(quantity: quantity) : item;
    }).toList();
    await _save(cart.copyWith(items: items));
    final DocumentReference<Map<String, dynamic>> itemReference =
        _cart(_requireUserId(userId)).collection('items').doc(itemId);
    if (quantity <= 0) {
      await itemReference.delete();
    } else {
      CartItemModel? updated;
      for (final CartItemModel item in items) {
        if (item.id == itemId) {
          updated = item;
          break;
        }
      }
      if (updated != null) {
        await itemReference.set(
          <String, dynamic>{
            ...updated.toMap(),
            'inStock': true,
            'updatedAt': FieldValue.serverTimestamp(),
          },
          SetOptions(merge: true),
        );
      }
    }
  }

  Future<void> removeItem(String userId, String itemId) {
    return updateQuantity(userId: userId, itemId: itemId, quantity: 0);
  }

  Future<void> applyCoupon({
    required String userId,
    required String couponCode,
    required double discount,
  }) async {
    final CartModel cart = await getCart(userId);
    await _save(
      cart.copyWith(
        couponCode: couponCode.trim().toUpperCase(),
        couponDiscount: discount < 0 ? 0 : discount,
      ),
    );
  }

  Future<void> clearCart(String userId) async {
    final String id = _requireUserId(userId);
    final QuerySnapshot<Map<String, dynamic>> legacyItems =
        await _cart(id).collection('items').get();
    if (legacyItems.docs.isNotEmpty) {
      final WriteBatch batch = _firestore.batch();
      for (final QueryDocumentSnapshot<Map<String, dynamic>> document
          in legacyItems.docs) {
        batch.delete(document.reference);
      }
      await batch.commit();
    }
    await _cart(id).set(<String, dynamic>{
      ...CartModel.empty(id).toMap(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  Future<void> _save(CartModel cart) {
    return _cart(cart.userId).set(
      <String, dynamic>{
        ...cart.toMap(),
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  String _requireUserId(String userId) {
    final String id = userId.trim();
    if (id.isEmpty) throw ArgumentError('User ID is required.');
    return id;
  }
}
