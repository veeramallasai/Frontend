import 'package:cloud_firestore/cloud_firestore.dart';

class UserModel {
  final String uid;
  final String name;
  final String email;
  final String phone;
  final String photoUrl;
  final String loginMethod;
  final bool emailVerified;
  final Timestamp createdAt;
  final Timestamp lastLogin;

  const UserModel({
    required this.uid,
    required this.name,
    required this.email,
    required this.phone,
    required this.photoUrl,
    required this.loginMethod,
    required this.emailVerified,
    required this.createdAt,
    required this.lastLogin,
  });

  Map<String, dynamic> toMap() {
    return {
      'uid': uid,
      'name': name,
      'email': email,
      'phone': phone,
      'photoUrl': photoUrl,
      'loginMethod': loginMethod,
      'emailVerified': emailVerified,
      'createdAt': createdAt,
      'lastLogin': lastLogin,
    };
  }

  factory UserModel.fromMap(Map<String, dynamic> map) {
    return UserModel(
      uid: map['uid'] ?? '',
      name: map['name'] ?? '',
      email: map['email'] ?? '',
      phone: map['phone'] ?? '',
      photoUrl: map['photoUrl'] ?? '',
      loginMethod: map['loginMethod'] ?? '',
      emailVerified: map['emailVerified'] ?? false,
      createdAt: map['createdAt'] ?? Timestamp.now(),
      lastLogin: map['lastLogin'] ?? Timestamp.now(),
    );
  }

  UserModel copyWith({
    String? uid,
    String? name,
    String? email,
    String? phone,
    String? photoUrl,
    String? loginMethod,
    bool? emailVerified,
    Timestamp? createdAt,
    Timestamp? lastLogin,
  }) {
    return UserModel(
      uid: uid ?? this.uid,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      photoUrl: photoUrl ?? this.photoUrl,
      loginMethod: loginMethod ?? this.loginMethod,
      emailVerified: emailVerified ?? this.emailVerified,
      createdAt: createdAt ?? this.createdAt,
      lastLogin: lastLogin ?? this.lastLogin,
    );
  }
}