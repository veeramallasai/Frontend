import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../core/widgets/premium_toast.dart';
import '../../data/repositories/session_repository.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  final TextEditingController _name = TextEditingController();
  final TextEditingController _phone = TextEditingController();
  final TextEditingController _photo = TextEditingController();
  bool _loading = false;
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load() {
    final session = SessionRepository().currentSession;
    _name.text = session.email.isNotEmpty ? session.email.split('@').first : 'User';
    _phone.text = session.phoneNumber;
  }

  Future<void> _save() async {
    if (_formKey.currentState?.validate() != true || _saving) return;
    setState(() => _saving = true);
    final session = SessionRepository().currentSession;
    SessionRepository.setSession(
      userId: session.userId,
      email: session.email,
      phoneNumber: _phone.text.trim(),
      name: _name.text.trim(),
    );
    if (!mounted) return;
    PremiumToast.show(context, 'Profile updated successfully');
    Navigator.pop(context, true);
    setState(() => _saving = false);
  }

  @override
  void dispose() {
    _name.dispose();
    _phone.dispose();
    _photo.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = SessionRepository().currentSession;
    return Scaffold(
      backgroundColor: const Color(0xFFF4F7F5),
      appBar: AppBar(
        title: const Text('Edit Profile'),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: <Widget>[
                TextFormField(
                  controller: _name,
                  decoration: const InputDecoration(labelText: 'Display Name'),
                  validator: (String? v) => (v ?? '').trim().isEmpty ? 'Name required' : null,
                ),
                const SizedBox(height: 14),
                TextFormField(
                  controller: _phone,
                  decoration: const InputDecoration(labelText: 'Phone Number'),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  height: 52,
                  child: FilledButton(
                    onPressed: _saving ? null : _save,
                    child: _saving
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Save Changes'),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
