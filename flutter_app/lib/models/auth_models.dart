class UserProfile {
  final String id;
  final String firstName;
  final String lastName;
  final String email;
  final String phone;
  final String role;

  UserProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.email,
    required this.phone,
    required this.role,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id']?.toString() ?? '',
      firstName: json['firstName'] ?? '',
      lastName: json['lastName'] ?? '',
      email: json['email'] ?? '',
      phone: json['phone'] ?? '',
      role: json['role'] is Map
          ? (json['role']['name'] ?? 'CUSTOMER')
          : (json['role']?.toString() ?? 'CUSTOMER'),
    );
  }
}

class LoginResponse {
  final String token;
  final UserProfile user;

  LoginResponse({required this.token, required this.user});

  factory LoginResponse.fromJson(Map<String, dynamic> json) {
    return LoginResponse(
      token: json['token'] ?? '',
      user: UserProfile.fromJson(json['user'] ?? {}),
    );
  }
}
