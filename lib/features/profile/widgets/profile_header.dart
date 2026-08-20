import 'package:flutter/material.dart';

import '../../../core/theme/app_colors.dart';

class ProfileHeader extends StatelessWidget {
  const ProfileHeader({
    super.key,
    required this.name,
    required this.email,
    required this.phone,
    required this.photoUrl,
    required this.shoppingMode,
    required this.onEdit,
    this.isProfileComplete = true,
  });

  final String name;
  final String email;
  final String phone;
  final String photoUrl;
  final String shoppingMode;
  final VoidCallback onEdit;
  final bool isProfileComplete;

  @override
  Widget build(BuildContext context) {
    final String contact = email.trim().isNotEmpty ? email : phone;
    return Container(
      margin: const EdgeInsets.fromLTRB(12, 10, 12, 0),
      padding: const EdgeInsets.fromLTRB(20, 17, 20, 20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            Color(0xFF032A19),
            Color(0xFF08723B),
            Color(0xFF20A45A),
          ],
        ),
        borderRadius: BorderRadius.circular(30),
      ),
      child: Row(
        children: <Widget>[
          CircleAvatar(
            radius: 32,
            backgroundColor: Colors.white24,
            backgroundImage: photoUrl.isNotEmpty ? NetworkImage(photoUrl) : null,
            child: photoUrl.isEmpty
                ? Text(
                    name.isNotEmpty ? name[0].toUpperCase() : 'U',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                    ),
                  )
                : null,
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  name.isNotEmpty ? name : 'User',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (contact.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 4),
                  Text(
                    contact,
                    style: const TextStyle(color: Colors.white70, fontSize: 13),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            onPressed: onEdit,
            icon: const Icon(Icons.edit_rounded, color: Colors.white),
          ),
        ],
      ),
    );
  }
}
