class FarmerModel {
  FarmerModel({
    required this.id,
    required this.name,
    required this.farmName,
    String? location,
    String? village,
    this.district = '',
    this.state = '',
    this.imageUrl = '',
    this.rating = 4.8,
    this.reviewCount = 0,
    bool? isVerified,
    bool? verified,
    this.experienceYears = 5,
    String? speciality,
    String? farmingMethod,
    this.bio = '',
  })  : location = location ?? (village != null && village.isNotEmpty ? '$village, $district' : village ?? district),
        village = village ?? location ?? '',
        isVerified = isVerified ?? verified ?? true,
        speciality = speciality ?? farmingMethod ?? 'Organic Farming';

  final String id;
  final String name;
  final String farmName;
  final String location;
  final String village;
  final String district;
  final String state;
  final String imageUrl;
  final double rating;
  final int reviewCount;
  final bool isVerified;
  final int experienceYears;
  final String speciality;
  final String bio;

  bool get verified => isVerified;
  String get farmingMethod => speciality;

  factory FarmerModel.fromMap(
      Map<String, dynamic> map, {
        String documentId = '',
      }) {
    return FarmerModel(
      id: _text(documentId.isNotEmpty ? documentId : map['id']),
      name: _text(map['name'] ?? map['farmerName'], fallback: 'Local Farmer'),
      farmName: _text(map['farmName'], fallback: 'Farm To Home Partner'),
      location: _text(map['location']),
      village: _text(map['village']),
      district: _text(map['district']),
      state: _text(map['state']),
      imageUrl: _text(map['imageUrl'] ?? map['profileImage']),
      rating: _toDouble(map['rating'], fallback: 4.8),
      reviewCount: _toInt(map['reviewCount'] ?? map['reviews']),
      isVerified: _toBool(map['isVerified'] ?? map['verified'], fallback: true),
      experienceYears: _toInt(map['experienceYears'] ?? map['experience'], fallback: 5),
      speciality: _text(map['speciality'] ?? map['specialty'] ?? map['farmingMethod'], fallback: 'Organic Farming'),
      bio: _text(map['bio']),
    );
  }

  Map<String, dynamic> toMap() => <String, dynamic>{
    'id': id,
    'name': name,
    'farmName': farmName,
    'location': location,
    'village': village,
    'district': district,
    'state': state,
    'imageUrl': imageUrl,
    'rating': rating,
    'reviewCount': reviewCount,
    'isVerified': isVerified,
    'verified': isVerified,
    'experienceYears': experienceYears,
    'speciality': speciality,
    'farmingMethod': speciality,
    'bio': bio,
  };

  FarmerModel copyWith({
    String? id,
    String? name,
    String? farmName,
    String? location,
    String? village,
    String? district,
    String? state,
    String? imageUrl,
    double? rating,
    int? reviewCount,
    bool? isVerified,
    int? experienceYears,
    String? speciality,
    String? bio,
  }) {
    return FarmerModel(
      id: id ?? this.id,
      name: name ?? this.name,
      farmName: farmName ?? this.farmName,
      location: location ?? this.location,
      village: village ?? this.village,
      district: district ?? this.district,
      state: state ?? this.state,
      imageUrl: imageUrl ?? this.imageUrl,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      isVerified: isVerified ?? this.isVerified,
      experienceYears: experienceYears ?? this.experienceYears,
      speciality: speciality ?? this.speciality,
      bio: bio ?? this.bio,
    );
  }
}

String _text(dynamic value, {String fallback = ''}) {
  final String text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

double _toDouble(dynamic value, {double fallback = 0}) {
  if (value is num) return value.toDouble();
  return double.tryParse(value?.toString() ?? '') ?? fallback;
}

int _toInt(dynamic value, {int fallback = 0}) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString() ?? '') ?? fallback;
}

bool _toBool(dynamic value, {bool fallback = false}) {
  if (value is bool) return value;
  if (value is num) return value != 0;
  final String text = _text(value).toLowerCase();
  if (text == 'true' || text == 'yes' || text == '1') return true;
  if (text == 'false' || text == 'no' || text == '0') return false;
  return fallback;
}
