class AddressModel {
  final String? id;
  final String userId;

  final String fullName;
  final String phone;
  final String houseNo;
  final String area;
  final String landmark;
  final String city;
  final String state;
  final String pincode;

  final String fullAddress;
  final String? label;
  final bool isDefault;

  const AddressModel({
    this.id,
    required this.userId,
    this.fullName = '',
    this.phone = '',
    this.houseNo = '',
    this.area = '',
    this.landmark = '',
    this.city = '',
    this.state = '',
    this.pincode = '',
    required this.fullAddress,
    this.label,
    this.isDefault = false,
  });

  Map<String, dynamic> toMap() {
    return {
      'userId': userId,
      'fullName': fullName.trim(),
      'phone': phone.trim(),
      'houseNo': houseNo.trim(),
      'area': area.trim(),
      'landmark': landmark.trim(),
      'city': city.trim(),
      'state': state.trim(),
      'pincode': pincode.trim(),
      'fullAddress': fullAddress.trim(),
      'label': label?.trim() ?? '',
      'isDefault': isDefault,
    };
  }

  factory AddressModel.fromMap(
      String id,
      Map<String, dynamic> map,
      ) {
    return AddressModel(
      id: id,
      userId: map['userId']?.toString() ?? '',
      fullName: map['fullName']?.toString() ?? '',
      phone: map['phone']?.toString() ?? '',
      houseNo: map['houseNo']?.toString() ?? '',
      area: map['area']?.toString() ?? '',
      landmark: map['landmark']?.toString() ?? '',
      city: map['city']?.toString() ?? '',
      state: map['state']?.toString() ?? '',
      pincode: map['pincode']?.toString() ?? '',
      fullAddress: map['fullAddress']?.toString() ?? '',
      label: _nullableString(map['label']),
      isDefault: map['isDefault'] == true,
    );
  }

  AddressModel copyWith({
    String? id,
    String? userId,
    String? fullName,
    String? phone,
    String? houseNo,
    String? area,
    String? landmark,
    String? city,
    String? state,
    String? pincode,
    String? fullAddress,
    String? label,
    bool? isDefault,
  }) {
    return AddressModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      fullName: fullName ?? this.fullName,
      phone: phone ?? this.phone,
      houseNo: houseNo ?? this.houseNo,
      area: area ?? this.area,
      landmark: landmark ?? this.landmark,
      city: city ?? this.city,
      state: state ?? this.state,
      pincode: pincode ?? this.pincode,
      fullAddress: fullAddress ?? this.fullAddress,
      label: label ?? this.label,
      isDefault: isDefault ?? this.isDefault,
    );
  }

  String get displayLabel {
    final value = label?.trim() ?? '';

    if (value.isEmpty) {
      return 'Other';
    }

    return value;
  }

  String get contactName {
    final value = fullName.trim();

    if (value.isEmpty) {
      return 'Customer';
    }

    return value;
  }

  bool get hasValidDocumentId {
    return id != null && id!.trim().isNotEmpty;
  }

  bool get hasStructuredAddress {
    return houseNo.trim().isNotEmpty ||
        area.trim().isNotEmpty ||
        city.trim().isNotEmpty ||
        state.trim().isNotEmpty ||
        pincode.trim().isNotEmpty;
  }

  static String? _nullableString(dynamic value) {
    if (value == null) {
      return null;
    }

    final text = value.toString().trim();

    if (text.isEmpty) {
      return null;
    }

    return text;
  }
}