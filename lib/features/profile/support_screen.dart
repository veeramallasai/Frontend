import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/premium_toast.dart';
import '../../data/repositories/session_repository.dart';

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
    final session = SessionRepository().currentSession;
    if (!session.isAuthenticated) {
      PremiumToast.show(context, 'Please login to contact support.', error: true);
      return;
    }
    setState(() => _sending = true);
    await Future<void>.delayed(const Duration(milliseconds: 600));
    if (!mounted) return;
    _message.clear();
    _orderId.clear();
    PremiumToast.show(context, 'Support request created successfully. Our team will contact you shortly.');
    setState(() => _sending = false);
  }

  @override
  void dispose() {
    _orderId.dispose();
    _message.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Help & Support')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: <Widget>[
          DropdownButtonFormField<String>(
            value: _topic,
            decoration: const InputDecoration(labelText: 'Topic'),
            items: const <String>['Order & delivery', 'Payment & refund', 'Account', 'Wholesale inquiry']
                .map((t) => DropdownMenuItem(value: t, child: Text(t)))
                .toList(),
            onChanged: (v) => setState(() => _topic = v ?? _topic),
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _orderId,
            decoration: const InputDecoration(labelText: 'Order ID (Optional)'),
          ),
          const SizedBox(height: 14),
          TextFormField(
            controller: _message,
            maxLines: 4,
            decoration: const InputDecoration(labelText: 'Message / Details'),
          ),
          const SizedBox(height: 24),
          SizedBox(
            height: 52,
            child: FilledButton(
              onPressed: _sending ? null : _submit,
              child: _sending
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('Submit Request'),
            ),
          ),
        ],
      ),
    );
  }
}
