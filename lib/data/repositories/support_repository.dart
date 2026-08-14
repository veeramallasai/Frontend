import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/support_ticket_model.dart';

class SupportRepository {
  SupportRepository({FirebaseFirestore? firestore, FirebaseAuth? auth})
      : _firestore = firestore ?? FirebaseFirestore.instance,
        _auth = auth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  CollectionReference<Map<String, dynamic>> get _tickets =>
      _firestore.collection('support_tickets');

  Stream<List<SupportTicketModel>> watchMyTickets() {
    final String userId = _requireUserId();
    return _tickets.where('userId', isEqualTo: userId).snapshots().map(
      (QuerySnapshot<Map<String, dynamic>> snapshot) {
        final List<SupportTicketModel> values = snapshot.docs
            .map(SupportTicketModel.fromDocument)
            .toList(growable: true)
          ..sort((SupportTicketModel a, SupportTicketModel b) =>
              (b.updatedAt ?? b.createdAt ?? DateTime(1970))
                  .compareTo(a.updatedAt ?? a.createdAt ?? DateTime(1970)));
        return List<SupportTicketModel>.unmodifiable(values);
      },
    );
  }

  Future<String> createTicket({
    required String subject,
    required String message,
    String category = 'general',
    String priority = 'normal',
  }) async {
    final String userId = _requireUserId();
    final DocumentReference<Map<String, dynamic>> ref = _tickets.doc();
    final SupportTicketModel ticket = SupportTicketModel(
      id: ref.id,
      userId: userId,
      subject: subject.trim(),
      message: message.trim(),
      category: category.trim().toLowerCase(),
      priority: priority.trim().toLowerCase(),
    );
    await ref.set(<String, dynamic>{
      ...ticket.toMap(),
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    });
    return ref.id;
  }

  Future<void> closeTicket(String ticketId) async {
    final String userId = _requireUserId();
    final DocumentReference<Map<String, dynamic>> ref = _tickets.doc(ticketId.trim());
    final DocumentSnapshot<Map<String, dynamic>> doc = await ref.get();
    if (!doc.exists) return;
    if ((doc.data()?['userId']?.toString() ?? '') != userId) {
      throw StateError('You do not have access to this ticket.');
    }
    await ref.update(<String, dynamic>{
      'status': 'closed',
      'updatedAt': FieldValue.serverTimestamp(),
    });
  }

  String _requireUserId() {
    final String id = _auth.currentUser?.uid.trim() ?? '';
    if (id.isEmpty) throw StateError('Please login to continue.');
    return id;
  }
}
