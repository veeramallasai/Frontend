class Farmer {
  final String id;
  final String name;
  final String farmName;
  final String photo;
  final String phoneNumber;
  final String email;
  final String village;
  final String district;
  final String state;
  final String pincode;
  final double rating;
  final int totalReviews;
  final int experienceYears;
  final bool organicCertified;
  final bool verified;
  final String certification;
  final List<String> cropsGrown;
  final String farmSize;
  final double deliveryRadiusKm;
  final String deliveryTime;
  final String about;
  final List<String> farmImages;
  final DateTime? joinedDate;

  const Farmer({
    required this.id,
    required this.name,
    required this.farmName,
    required this.photo,
    required this.phoneNumber,
    required this.email,
    required this.village,
    required this.district,
    required this.state,
    required this.pincode,
    required this.rating,
    required this.totalReviews,
    required this.experienceYears,
    required this.organicCertified,
    required this.verified,
    required this.certification,
    required this.cropsGrown,
    required this.farmSize,
    required this.deliveryRadiusKm,
    required this.deliveryTime,
    required this.about,
    required this.farmImages,
    this.joinedDate,
  });

  String get location => [village, district, state]
      .where((value) => value.trim().isNotEmpty)
      .join(', ');

  String get displayRating => rating.toStringAsFixed(1);

  String get experienceText {
    if (experienceYears <= 0) return 'New farmer';
    if (experienceYears == 1) return '1 year experience';
    return '$experienceYears years experience';
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id,
      'name': name,
      'farmName': farmName,
      'photo': photo,
      'phoneNumber': phoneNumber,
      'email': email,
      'village': village,
      'district': district,
      'state': state,
      'pincode': pincode,
      'rating': rating,
      'totalReviews': totalReviews,
      'experienceYears': experienceYears,
      'organicCertified': organicCertified,
      'verified': verified,
      'certification': certification,
      'cropsGrown': cropsGrown,
      'farmSize': farmSize,
      'deliveryRadiusKm': deliveryRadiusKm,
      'deliveryTime': deliveryTime,
      'about': about,
      'farmImages': farmImages,
      'joinedDate': joinedDate?.toIso8601String(),
    };
  }

  factory Farmer.fromMap(
      Map<String, dynamic> map, {
        String? documentId,
      }) {
    return Farmer(
      id: _stringValue(map['id'], fallback: documentId ?? ''),
      name: _stringValue(map['name'], fallback: 'Farm To Home Farmer'),
      farmName: _stringValue(map['farmName'], fallback: 'Local Organic Farm'),
      photo: _stringValue(
        map['photo'],
        fallback: 'assets/images/farmers/default_farmer.png',
      ),
      phoneNumber: _stringValue(map['phoneNumber']),
      email: _stringValue(map['email']),
      village: _stringValue(map['village'], fallback: 'Local Village'),
      district: _stringValue(map['district']),
      state: _stringValue(map['state'], fallback: 'India'),
      pincode: _stringValue(map['pincode']),
      rating: _doubleValue(map['rating'], fallback: 4.5),
      totalReviews: _intValue(map['totalReviews']),
      experienceYears: _intValue(map['experienceYears']),
      organicCertified: _boolValue(
        map['organicCertified'],
        fallback: true,
      ),
      verified: _boolValue(map['verified'], fallback: true),
      certification: _stringValue(
        map['certification'],
        fallback: 'Farm To Home Quality Verified',
      ),
      cropsGrown: _stringListValue(map['cropsGrown']),
      farmSize: _stringValue(map['farmSize'], fallback: '5 acres'),
      deliveryRadiusKm: _doubleValue(
        map['deliveryRadiusKm'],
        fallback: 50,
      ),
      deliveryTime: _stringValue(
        map['deliveryTime'],
        fallback: '30-60 min',
      ),
      about: _stringValue(
        map['about'],
        fallback:
        'Fresh produce grown using responsible farming practices and supplied directly to customers.',
      ),
      farmImages: _stringListValue(map['farmImages']),
      joinedDate: _dateTimeValue(map['joinedDate']),
    );
  }

  Farmer copyWith({
    String? id,
    String? name,
    String? farmName,
    String? photo,
    String? phoneNumber,
    String? email,
    String? village,
    String? district,
    String? state,
    String? pincode,
    double? rating,
    int? totalReviews,
    int? experienceYears,
    bool? organicCertified,
    bool? verified,
    String? certification,
    List<String>? cropsGrown,
    String? farmSize,
    double? deliveryRadiusKm,
    String? deliveryTime,
    String? about,
    List<String>? farmImages,
    DateTime? joinedDate,
  }) {
    return Farmer(
      id: id ?? this.id,
      name: name ?? this.name,
      farmName: farmName ?? this.farmName,
      photo: photo ?? this.photo,
      phoneNumber: phoneNumber ?? this.phoneNumber,
      email: email ?? this.email,
      village: village ?? this.village,
      district: district ?? this.district,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      rating: rating ?? this.rating,
      totalReviews: totalReviews ?? this.totalReviews,
      experienceYears: experienceYears ?? this.experienceYears,
      organicCertified: organicCertified ?? this.organicCertified,
      verified: verified ?? this.verified,
      certification: certification ?? this.certification,
      cropsGrown: cropsGrown ?? this.cropsGrown,
      farmSize: farmSize ?? this.farmSize,
      deliveryRadiusKm: deliveryRadiusKm ?? this.deliveryRadiusKm,
      deliveryTime: deliveryTime ?? this.deliveryTime,
      about: about ?? this.about,
      farmImages: farmImages ?? this.farmImages,
      joinedDate: joinedDate ?? this.joinedDate,
    );
  }

  static String _stringValue(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    final result = value.toString().trim();
    return result.isEmpty ? fallback : result;
  }

  static double _doubleValue(dynamic value, {double fallback = 0}) {
    if (value is num) return value.toDouble();
    if (value is String) return double.tryParse(value.trim()) ?? fallback;
    return fallback;
  }

  static int _intValue(dynamic value, {int fallback = 0}) {
    if (value is num) return value.toInt();
    if (value is String) return int.tryParse(value.trim()) ?? fallback;
    return fallback;
  }

  static bool _boolValue(dynamic value, {bool fallback = false}) {
    if (value is bool) return value;
    if (value is num) return value != 0;
    if (value is String) {
      final normalized = value.trim().toLowerCase();
      if (normalized == 'true' || normalized == '1') return true;
      if (normalized == 'false' || normalized == '0') return false;
    }
    return fallback;
  }

  static List<String> _stringListValue(dynamic value) {
    if (value is Iterable) {
      return value
          .map((item) => item.toString().trim())
          .where((item) => item.isNotEmpty)
          .toList();
    }
    if (value is String && value.trim().isNotEmpty) {
      return value
          .split(',')
          .map((item) => item.trim())
          .where((item) => item.isNotEmpty)
          .toList();
    }
    return <String>[];
  }

  static DateTime? _dateTimeValue(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;
    if (value is String) return DateTime.tryParse(value.trim());

    try {
      final dynamic date = value.toDate();
      if (date is DateTime) return date;
    } catch (_) {
      return null;
    }
    return null;
  }
}

const List<Farmer> sampleFarmers = <Farmer>[
  Farmer(
    id: 'farmer_001',
    name: 'Ramesh Reddy',
    farmName: 'Green Valley Organic Farms',
    photo: 'assets/images/farmers/ramesh_reddy.png',
    phoneNumber: '+91 98765 43210',
    email: 'ramesh@farmtohome.com',
    village: 'Shamirpet',
    district: 'Medchal-Malkajgiri',
    state: 'Telangana',
    pincode: '500078',
    rating: 4.9,
    totalReviews: 1280,
    experienceYears: 14,
    organicCertified: true,
    verified: true,
    certification: 'NPOP Organic Certified',
    cropsGrown: <String>[
      'Tomato',
      'Onion',
      'Spinach',
      'Broccoli',
      'Green Chilli',
    ],
    farmSize: '12 acres',
    deliveryRadiusKm: 60,
    deliveryTime: '30-45 min',
    about:
    'Ramesh Reddy follows natural farming methods and supplies freshly harvested vegetables directly from his farm.',
    farmImages: <String>[
      'assets/images/farmers/farms/green_valley_1.png',
      'assets/images/farmers/farms/green_valley_2.png',
    ],
  ),
  Farmer(
    id: 'farmer_002',
    name: 'Lakshmi Devi',
    farmName: 'Sri Lakshmi Fresh Farms',
    photo: 'assets/images/farmers/lakshmi_devi.png',
    phoneNumber: '+91 91234 56780',
    email: 'lakshmi@farmtohome.com',
    village: 'Vikarabad',
    district: 'Vikarabad',
    state: 'Telangana',
    pincode: '501101',
    rating: 4.8,
    totalReviews: 940,
    experienceYears: 11,
    organicCertified: true,
    verified: true,
    certification: 'Farm To Home Organic Verified',
    cropsGrown: <String>[
      'Mango',
      'Guava',
      'Papaya',
      'Pomegranate',
      'Custard Apple',
    ],
    farmSize: '18 acres',
    deliveryRadiusKm: 80,
    deliveryTime: '45-60 min',
    about:
    'Lakshmi Devi manages a family-owned fruit farm known for naturally ripened and carefully selected seasonal fruits.',
    farmImages: <String>[
      'assets/images/farmers/farms/lakshmi_farm_1.png',
      'assets/images/farmers/farms/lakshmi_farm_2.png',
    ],
  ),
  Farmer(
    id: 'farmer_003',
    name: 'Suresh Yadav',
    farmName: 'Happy Cow Dairy Farm',
    photo: 'assets/images/farmers/suresh_yadav.png',
    phoneNumber: '+91 90123 45678',
    email: 'suresh@farmtohome.com',
    village: 'Chevella',
    district: 'Ranga Reddy',
    state: 'Telangana',
    pincode: '501503',
    rating: 4.9,
    totalReviews: 1560,
    experienceYears: 16,
    organicCertified: true,
    verified: true,
    certification: 'FSSAI Registered Dairy Farm',
    cropsGrown: <String>[
      'Milk',
      'Curd',
      'Paneer',
      'Butter',
      'Ghee',
    ],
    farmSize: '20 acres',
    deliveryRadiusKm: 70,
    deliveryTime: '30-60 min',
    about:
    'Happy Cow Dairy Farm provides fresh milk and dairy products prepared under hygienic and quality-controlled conditions.',
    farmImages: <String>[
      'assets/images/farmers/farms/happy_cow_1.png',
      'assets/images/farmers/farms/happy_cow_2.png',
    ],
  ),
  Farmer(
    id: 'farmer_004',
    name: 'Anitha Naik',
    farmName: 'Nature Basket Seasonal Farms',
    photo: 'assets/images/farmers/anitha_naik.png',
    phoneNumber: '+91 99887 76655',
    email: 'anitha@farmtohome.com',
    village: 'Sangareddy',
    district: 'Sangareddy',
    state: 'Telangana',
    pincode: '502001',
    rating: 4.7,
    totalReviews: 720,
    experienceYears: 9,
    organicCertified: true,
    verified: true,
    certification: 'Sustainable Farming Verified',
    cropsGrown: <String>[
      'Watermelon',
      'Sweet Corn',
      'Tender Coconut',
      'Jackfruit',
      'Seasonal Greens',
    ],
    farmSize: '10 acres',
    deliveryRadiusKm: 75,
    deliveryTime: '45-60 min',
    about:
    'Anitha Naik specialises in seasonal produce harvested at the right time for better freshness, flavour, and nutrition.',
    farmImages: <String>[
      'assets/images/farmers/farms/nature_basket_1.png',
      'assets/images/farmers/farms/nature_basket_2.png',
    ],
  ),
];

Farmer farmerById(String farmerId) {
  return sampleFarmers.firstWhere(
        (farmer) => farmer.id == farmerId,
    orElse: () => sampleFarmers.first,
  );
}
