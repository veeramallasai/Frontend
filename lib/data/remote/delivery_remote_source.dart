import 'package:cloud_firestore/cloud_firestore.dart';

import '../models/delivery_slot_model.dart';

class DeliveryRemoteSource {
  DeliveryRemoteSource({FirebaseFirestore? firestore})
      : _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseFirestore _firestore;

  CollectionReference<Map<String, dynamic>> get _slots =>
      _firestore.collection('delivery_slots');

  Stream<List<DeliverySlotModel>> watchSlots({
    required String method,
    DateTime? date,
  }) {
    return _slots.snapshots().map(
          (QuerySnapshot<Map<String, dynamic>> snapshot) => _filterAndSort(
        snapshot.docs.map(DeliverySlotModel.fromDocument).toList(),
        method: method,
        date: date,
      ),
    );
  }

  Future<List<DeliverySlotModel>> getSlots({
    required String method,
    DateTime? date,
  }) async {
    final QuerySnapshot<Map<String, dynamic>> snapshot = await _slots.get();
    return _filterAndSort(
      snapshot.docs.map(DeliverySlotModel.fromDocument).toList(),
      method: method,
      date: date,
    );
  }

  Future<void> reserveSlot(String slotId) async {
    final String id = slotId.trim();
    if (id.isEmpty) return;
    await _firestore.runTransaction((Transaction transaction) async {
      final DocumentReference<Map<String, dynamic>> reference = _slots.doc(id);
      final DocumentSnapshot<Map<String, dynamic>> document =
      await transaction.get(reference);
      if (!document.exists) throw StateError('Delivery slot not found.');
      final DeliverySlotModel slot = DeliverySlotModel.fromDocument(document);
      if (!slot.canBook) throw StateError('This delivery slot is full.');
      transaction.update(reference, <String, dynamic>{
        'bookedCount': slot.bookedCount + 1,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    });
  }

  List<DeliverySlotModel> _filterAndSort(
      List<DeliverySlotModel> slots, {
        required String method,
        DateTime? date,
      }) {
    final String selectedMethod = method.trim().toLowerCase();
    final List<DeliverySlotModel> values = slots.where((DeliverySlotModel slot) {
      if (slot.method != selectedMethod) return false;
      if (date == null || slot.date == null) return true;
      return slot.date!.year == date.year &&
          slot.date!.month == date.month &&
          slot.date!.day == date.day;
    }).toList(growable: true);
    values.sort(
          (DeliverySlotModel first, DeliverySlotModel second) =>
          first.startTime.compareTo(second.startTime),
    );
    return List<DeliverySlotModel>.unmodifiable(values);
  }
}
