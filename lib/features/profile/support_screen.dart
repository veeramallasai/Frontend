import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/premium_toast.dart';

class SupportScreen extends StatefulWidget {
  const SupportScreen({super.key});

  @override
  State<SupportScreen> createState() => _SupportScreenState();
}

class _SupportScreenState extends State<SupportScreen> {
  final TextEditingController _orderId = TextEditingController();
  final TextEditingController _message = TextEditingController();
  String _topic = 'Order & delivery';
  bool _sending = false;

  Future<void> _submit() async {
    final String message = _message.text.trim();
    if (message.length < 10) {
      PremiumToast.show(context, 'Please describe the issue in a little more detail.', error: true);
      return;
    }
    final User? user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      PremiumToast.show(context, 'Please login to contact support.', error: true);
      return;
    }
    setState(() => _sending = true);
    try {
      final DocumentReference<Map<String, dynamic>> reference =
          FirebaseFirestore.instance.collection('support_tickets').doc();
      await reference.set(<String, dynamic>{
        'id': reference.id,
        'userId': user.uid,
        'email': user.email ?? '',
        'phone': user.phoneNumber ?? '',
        'topic': _topic,
        'orderId': _orderId.text.trim(),
        'message': message,
        'status': 'open',
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
      if (!mounted) return;
      _message.clear();
      PremiumToast.show(context, 'Support request ${reference.id.substring(0, 6).toUpperCase()} created');
    } on FirebaseException catch (error) {
      if (mounted) {
        PremiumToast.show(context, error.message ?? 'Unable to submit request.', error: true);
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  void dispose() {
    _orderId.dispose();
    _message.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(title: const Text('Priority Support')),
        body: ListView(
          padding: const EdgeInsets.fromLTRB(16, 10, 16, 32),
          children: <Widget>[
            const _SupportHero(),
            const SizedBox(height: 18),
            const Text(
              'HOW CAN WE HELP?',
              style: TextStyle(
                color: AppColors.textSecondary,
                fontSize: 9,
                letterSpacing: 1.1,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 9),
            DropdownButtonFormField<String>(
              initialValue: _topic,
              decoration: const InputDecoration(
                labelText: 'Issue type',
                prefixIcon: Icon(Icons.help_outline_rounded),
              ),
              items: const <String>[
                'Order & delivery',
                'Payment & refund',
                'Product quality',
                'Account & login',
                'Other',
              ]
                  .map((String value) => DropdownMenuItem<String>(value: value, child: Text(value)))
                  .toList(growable: false),
              onChanged: (String? value) => setState(() => _topic = value ?? _topic),
            ),
            const SizedBox(height: 13),
            TextField(
              controller: _orderId,
              decoration: const InputDecoration(
                labelText: 'Order ID (optional)',
                prefixIcon: Icon(Icons.receipt_long_outlined),
              ),
            ),
            const SizedBox(height: 13),
            TextField(
              controller: _message,
              minLines: 5,
              maxLines: 8,
              maxLength: 600,
              decoration: const InputDecoration(
                labelText: 'Describe your issue',
                alignLabelWithHint: true,
                prefixIcon: Padding(
                  padding: EdgeInsets.only(bottom: 90),
                  child: Icon(Icons.chat_bubble_outline_rounded),
                ),
              ),
            ),
            const SizedBox(height: 12),
            FilledButton.icon(
              onPressed: _sending ? null : _submit,
              icon: _sending
                  ? const SizedBox(
                      width: 17,
                      height: 17,
                      child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2),
                    )
                  : const Icon(Icons.send_rounded),
              label: const Text('SUBMIT SUPPORT REQUEST'),
              style: FilledButton.styleFrom(minimumSize: const Size.fromHeight(55)),
            ),
          ],
        ),
      );
}

class _SupportHero extends StatelessWidget {
  const _SupportHero();
  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          gradient: const LinearGradient(
            colors: <Color>[Color(0xFF073D24), Color(0xFF14884A)],
          ),
          borderRadius: BorderRadius.circular(26),
        ),
        child: const Row(
          children: <Widget>[
            Icon(Icons.support_agent_rounded, color: Color(0xFFFFD66B), size: 44),
            SizedBox(width: 15),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Text(
                    'We are here for you',
                    style: TextStyle(color: Colors.white, fontSize: 17, fontWeight: FontWeight.w900),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Orders, refunds or quality concerns—send one clear request and our team can follow it.',
                    style: TextStyle(color: Color(0xFFC9E7D6), fontSize: 9.5, height: 1.45),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
}
