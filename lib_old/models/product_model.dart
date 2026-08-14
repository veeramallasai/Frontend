import 'farmer.dart';

class ProductModel {
  final String id;
  final String name;
  final String teluguName;
  final String displayName;
  final String image;
  final List<String> images;
  final double price;
  final double mrp;
  final String category;
  final String categoryTelugu;
  final String collection;
  final String weight;
  final String unit;
  final double discount;
  final double rating;
  final int reviewCount;
  final int soldCount;
  final bool organic;
  final bool inStock;
  final bool bestSeller;
  final bool isQuick;
  final int quickDeliveryMinutes;
  final String deliveryTime;
  final String seller;
  final String origin;
  final String shelfLife;
  final String description;
  final int availableQuantity;
  final String offerText;
  final String couponCode;
  final String farmerId;
  final List<String> benefits;
  final Map<String, String> nutritionInfo;

  // Dynamic quantity and delivery fields
  final List<String> availableUnits;
  final String defaultUnit;
  final Map<String, double> unitPrices;
  final Map<String, double> unitMrps;

  // Quantity measurement and custom entry
  final String quantityType;
  final bool customQuantityAllowed;
  final double minimumCustomQuantity;
  final double maximumCustomQuantity;
  final double approximateWeightPerUnitKg;

  final double minimumQuickQuantity;
  final String minimumQuickUnit;
  final double quickAvailableStock;
  final List<String> availableDeliveryDays;
  final String normalDeliveryNote;

  // Farmer availability and location summary
  final bool farmerOnline;
  final bool acceptingOrders;
  final String farmerName;
  final String farmName;
  final String farmerLocation;
  final String farmerVillage;
  final String farmerDistrict;
  final String farmerState;
  final double farmerLatitude;
  final double farmerLongitude;
  final String farmerPhone;
  final String farmerExperience;
  final String farmerCertification;

  // Pre-order and harvest fields
  final bool preOrderAvailable;
  final DateTime? preOrderStartDate;
  final DateTime? preOrderEndDate;
  final DateTime? harvestDate;
  final DateTime? nextHarvestDate;
  final DateTime? expectedHarvestDate;
  final String harvestStatus;
  final String harvestStatusTelugu;
  final DateTime? expectedDeliveryDate;
  final List<String> availableDeliverySlots;
  final int minimumPreOrderQuantity;
  final int maximumPreOrderQuantity;
  final int preOrderBookedQuantity;
  final String preOrderNote;

  const ProductModel({
    required this.id,
    required this.name,
    required this.teluguName,
    required this.displayName,
    required this.image,
    required this.images,
    required this.price,
    required this.mrp,
    required this.category,
    required this.categoryTelugu,
    required this.collection,
    required this.weight,
    required this.unit,
    required this.discount,
    required this.rating,
    required this.reviewCount,
    required this.soldCount,
    required this.organic,
    required this.inStock,
    required this.bestSeller,
    required this.isQuick,
    required this.quickDeliveryMinutes,
    required this.deliveryTime,
    required this.seller,
    required this.origin,
    required this.shelfLife,
    required this.description,
    required this.availableQuantity,
    required this.offerText,
    required this.couponCode,
    required this.farmerId,
    required this.benefits,
    required this.nutritionInfo,
    this.availableUnits = const <String>[],
    this.defaultUnit = '',
    this.unitPrices = const <String, double>{},
    this.unitMrps = const <String, double>{},
    this.quantityType = 'weight',
    this.customQuantityAllowed = true,
    this.minimumCustomQuantity = 0.5,
    this.maximumCustomQuantity = 500,
    this.approximateWeightPerUnitKg = 1,
    this.minimumQuickQuantity = 1,
    this.minimumQuickUnit = '',
    this.quickAvailableStock = 0,
    this.availableDeliveryDays = const <String>[],
    this.normalDeliveryNote = '',
    this.farmerOnline = true,
    this.acceptingOrders = true,
    this.farmerName = '',
    this.farmName = '',
    this.farmerLocation = '',
    this.farmerVillage = '',
    this.farmerDistrict = '',
    this.farmerState = '',
    this.farmerLatitude = 0,
    this.farmerLongitude = 0,
    this.farmerPhone = '',
    this.farmerExperience = '',
    this.farmerCertification = '',
    this.preOrderAvailable = false,
    this.preOrderStartDate,
    this.preOrderEndDate,
    this.harvestDate,
    this.nextHarvestDate,
    this.expectedHarvestDate,
    this.harvestStatus = 'Growing',
    this.harvestStatusTelugu = 'పెరుగుతోంది',
    this.expectedDeliveryDate,
    this.availableDeliverySlots = const <String>[],
    this.minimumPreOrderQuantity = 1,
    this.maximumPreOrderQuantity = 10,
    this.preOrderBookedQuantity = 0,
    this.preOrderNote = '',
  });

  double get discountedPrice {
    if (discount <= 0) return price;
    return price - (price * (discount / 100));
  }

  double get effectiveMrp => mrp > 0 ? mrp : price;

  double get savings {
    final double value = effectiveMrp - discountedPrice;
    return value > 0 ? value : 0;
  }

  bool get hasDiscount => discount > 0 || effectiveMrp > discountedPrice;
  bool get hasMultipleImages => images.length > 1;
  bool get isAvailable => inStock && availableQuantity > 0;

  bool get isQuickAvailable {
    return isQuick &&
        isAvailable &&
        quickAvailableStock > 0 &&
        farmerOnline &&
        acceptingOrders;
  }

  List<String> get safeAvailableUnits {
    if (availableUnits.isNotEmpty) return availableUnits;

    final String fallback = defaultUnit.trim().isNotEmpty
        ? defaultUnit.trim()
        : unit.trim().isNotEmpty
        ? unit.trim()
        : weight.trim();

    return fallback.isEmpty ? const <String>['1 unit'] : <String>[fallback];
  }

  String get safeDefaultUnit {
    if (defaultUnit.trim().isNotEmpty) return defaultUnit.trim();
    return safeAvailableUnits.first;
  }

  bool get isWeightBased =>
      quantityType.trim().toLowerCase() == 'weight';

  bool get isBunchBased =>
      quantityType.trim().toLowerCase() == 'bunch';

  bool get isPieceBased =>
      quantityType.trim().toLowerCase() == 'piece';

  bool get isVolumeBased =>
      quantityType.trim().toLowerCase() == 'volume';

  bool get isCountBased =>
      quantityType.trim().toLowerCase() == 'count';

  double get safeMinimumCustomQuantity =>
      minimumCustomQuantity > 0 ? minimumCustomQuantity : 0.5;

  double get safeMaximumCustomQuantity {
    final double minimum = safeMinimumCustomQuantity;
    return maximumCustomQuantity >= minimum
        ? maximumCustomQuantity
        : minimum;
  }

  double get safeApproximateWeightPerUnitKg =>
      approximateWeightPerUnitKg > 0
          ? approximateWeightPerUnitKg
          : 1;

  bool isValidCustomQuantity(double value) {
    return customQuantityAllowed &&
        value >= safeMinimumCustomQuantity &&
        value <= safeMaximumCustomQuantity;
  }

  double estimatedWeightKgFor({
    required String selectedUnit,
    required double quantity,
  }) {
    final double perSelectedUnit =
    _weightInKgFromLabel(selectedUnit);

    if (perSelectedUnit > 0) {
      return perSelectedUnit * quantity;
    }

    return safeApproximateWeightPerUnitKg * quantity;
  }

  String get harvestStatusDisplay {
    if (harvestStatusTelugu.trim().isEmpty) {
      return harvestStatus;
    }

    return '$harvestStatus ($harvestStatusTelugu)';
  }

  double priceForUnit(String selectedUnit) {
    final String key = selectedUnit.trim();
    return key.isNotEmpty && unitPrices.containsKey(key)
        ? unitPrices[key]!
        : price;
  }

  double mrpForUnit(String selectedUnit) {
    final String key = selectedUnit.trim();

    if (key.isNotEmpty && unitMrps.containsKey(key)) {
      return unitMrps[key]!;
    }

    final double selectedPrice = priceForUnit(selectedUnit);

    if (mrp > 0 && price > 0) {
      return selectedPrice * (mrp / price);
    }

    return selectedPrice;
  }

  double discountedPriceForUnit(String selectedUnit) {
    final double selectedPrice = priceForUnit(selectedUnit);

    if (discount <= 0) return selectedPrice;

    return selectedPrice -
        (selectedPrice * (discount / 100));
  }

  double savingsForUnit(String selectedUnit) {
    final double value = mrpForUnit(selectedUnit) -
        discountedPriceForUnit(selectedUnit);

    return value > 0 ? value : 0;
  }

  double get safeMinimumQuickQuantity {
    return minimumQuickQuantity <= 0 ? 1 : minimumQuickQuantity;
  }

  String get safeMinimumQuickUnit {
    if (minimumQuickUnit.trim().isNotEmpty) return minimumQuickUnit.trim();
    return safeDefaultUnit;
  }

  bool isValidQuickQuantity(double quantity) {
    return isQuickAvailable &&
        quantity >= safeMinimumQuickQuantity &&
        quantity <= quickAvailableStock;
  }

  String get quickMinimumText {
    return 'Minimum ${_formatQuantity(safeMinimumQuickQuantity)} '
        '$safeMinimumQuickUnit';
  }

  String get quickStockText {
    if (!isQuick) return '';
    if (quickAvailableStock <= 0) return 'Quick delivery sold out';
    return '${_formatQuantity(quickAvailableStock)} '
        '$safeMinimumQuickUnit available';
  }

  bool get hasFarmerLocation {
    return farmerLatitude != 0 && farmerLongitude != 0;
  }

  String get farmerFullLocation {
    final List<String> parts = <String>[
      farmerLocation,
      farmerVillage,
      farmerDistrict,
      farmerState,
    ].map((String value) => value.trim())
        .where((String value) => value.isNotEmpty)
        .toList();

    return parts.isEmpty ? 'Location not available' : parts.toSet().join(', ');
  }

  bool get canPreOrder {
    if (!preOrderAvailable || !farmerOnline || !acceptingOrders) return false;

    final DateTime now = DateTime.now();

    if (preOrderStartDate != null && now.isBefore(preOrderStartDate!)) {
      return false;
    }

    if (preOrderEndDate != null && now.isAfter(preOrderEndDate!)) {
      return false;
    }

    return remainingPreOrderQuantity > 0;
  }

  int get safeMinimumPreOrderQuantity {
    return minimumPreOrderQuantity < 1 ? 1 : minimumPreOrderQuantity;
  }

  int get safeMaximumPreOrderQuantity {
    final int minimum = safeMinimumPreOrderQuantity;
    return maximumPreOrderQuantity < minimum
        ? minimum
        : maximumPreOrderQuantity;
  }

  int get remainingPreOrderQuantity {
    final int booked = preOrderBookedQuantity < 0
        ? 0
        : preOrderBookedQuantity;
    final int remaining = safeMaximumPreOrderQuantity - booked;
    return remaining > 0 ? remaining : 0;
  }

  bool isValidPreOrderQuantity(int quantity) {
    return canPreOrder &&
        quantity >= safeMinimumPreOrderQuantity &&
        quantity <= safeMaximumPreOrderQuantity &&
        quantity <= remainingPreOrderQuantity;
  }

  String get preOrderAvailabilityText {
    if (!preOrderAvailable) return 'Pre-order unavailable';
    if (!canPreOrder) return 'Pre-order closed';
    return '$remainingPreOrderQuantity slots available';
  }

  DateTime? get activeHarvestDate => nextHarvestDate ?? harvestDate;

  String get formattedDisplayName {
    if (displayName.trim().isNotEmpty) return displayName;
    if (teluguName.trim().isEmpty) return name;
    return '$name ($teluguName)';
  }

  String get quickDeliveryText {
    return isQuick ? 'Quick Delivery' : '';
  }

  Farmer get farmer => farmerById(farmerId);

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id,
      'name': name,
      'teluguName': teluguName,
      'displayName': displayName,
      'image': image,
      'images': images,
      'price': price,
      'mrp': mrp,
      'category': category,
      'categoryTelugu': categoryTelugu,
      'collection': collection,
      'weight': weight,
      'unit': unit,
      'discount': discount,
      'rating': rating,
      'reviewCount': reviewCount,
      'soldCount': soldCount,
      'organic': organic,
      'inStock': inStock,
      'bestSeller': bestSeller,
      'isQuick': isQuick,
      'quickDeliveryMinutes': quickDeliveryMinutes,
      'deliveryTime': deliveryTime,
      'seller': seller,
      'origin': origin,
      'shelf_life': shelfLife,
      'description': description,
      'availableQuantity': availableQuantity,
      'offerText': offerText,
      'couponCode': couponCode,
      'farmerId': farmerId,
      'benefits': benefits,
      'nutritionInfo': nutritionInfo,
      'availableUnits': safeAvailableUnits,
      'defaultUnit': safeDefaultUnit,
      'unitPrices': unitPrices,
      'unitMrps': unitMrps,
      'quantityType': quantityType,
      'customQuantityAllowed': customQuantityAllowed,
      'minimumCustomQuantity': safeMinimumCustomQuantity,
      'maximumCustomQuantity': safeMaximumCustomQuantity,
      'approximateWeightPerUnitKg': safeApproximateWeightPerUnitKg,
      'minimumQuickQuantity': safeMinimumQuickQuantity,
      'minimumQuickUnit': safeMinimumQuickUnit,
      'quickAvailableStock': quickAvailableStock,
      'availableDeliveryDays': availableDeliveryDays,
      'normalDeliveryNote': normalDeliveryNote,
      'farmerOnline': farmerOnline,
      'acceptingOrders': acceptingOrders,
      'farmerName': farmerName,
      'farmName': farmName,
      'farmerLocation': farmerLocation,
      'farmerVillage': farmerVillage,
      'farmerDistrict': farmerDistrict,
      'farmerState': farmerState,
      'farmerLatitude': farmerLatitude,
      'farmerLongitude': farmerLongitude,
      'farmerPhone': farmerPhone,
      'farmerExperience': farmerExperience,
      'farmerCertification': farmerCertification,
      'preOrderAvailable': preOrderAvailable,
      'preOrderStartDate': preOrderStartDate?.toIso8601String(),
      'preOrderEndDate': preOrderEndDate?.toIso8601String(),
      'harvestDate': harvestDate?.toIso8601String(),
      'nextHarvestDate': nextHarvestDate?.toIso8601String(),
      'expectedHarvestDate': expectedHarvestDate?.toIso8601String(),
      'harvestStatus': harvestStatus,
      'harvestStatusTelugu': harvestStatusTelugu,
      'expectedDeliveryDate': expectedDeliveryDate?.toIso8601String(),
      'availableDeliverySlots': availableDeliverySlots,
      'minimumPreOrderQuantity': safeMinimumPreOrderQuantity,
      'maximumPreOrderQuantity': safeMaximumPreOrderQuantity,
      'preOrderBookedQuantity': preOrderBookedQuantity,
      'preOrderNote': preOrderNote,
    };
  }

  factory ProductModel.fromMap(
      Map<String, dynamic> map, {
        String? documentId,
      }) {
    final String name = _stringValue(
      map['name'],
      fallback: 'Unknown Product',
    );

    final String teluguName = _stringValue(map['teluguName']);
    final String image = _stringValue(map['image']);
    final List<String> parsedImages = _stringListValue(map['images']);
    final double price = _doubleValue(map['price']);
    final double discount = _doubleValue(map['discount']);
    final double parsedMrp = _doubleValue(map['mrp']);

    final double calculatedMrp = parsedMrp > 0
        ? parsedMrp
        : discount > 0
        ? price / (1 - (discount / 100))
        : price;

    final int quickMinutes = _intValue(
      map['quickDeliveryMinutes'],
      fallback: _extractMinutes(map['deliveryTime']),
    );

    final String category = _stringValue(
      map['category'],
      fallback: 'Vegetables',
    );

    return ProductModel(
      id: _stringValue(map['id'], fallback: documentId ?? ''),
      name: name,
      teluguName: teluguName,
      displayName: _stringValue(
        map['displayName'],
        fallback: teluguName.isEmpty ? name : '$name ($teluguName)',
      ),
      image: image,
      images: parsedImages.isEmpty
          ? image.isEmpty
          ? <String>[]
          : <String>[image]
          : parsedImages,
      price: price,
      mrp: calculatedMrp,
      category: category,
      categoryTelugu: _stringValue(
        map['categoryTelugu'],
        fallback: _defaultCategoryTelugu(category),
      ),
      collection: _stringValue(
        map['collection'],
        fallback: 'Everyday Essentials',
      ),
      weight: _stringValue(
        map['weight'] ?? map['unit'],
        fallback: '500 g',
      ),
      unit: _stringValue(
        map['unit'] ?? map['weight'],
        fallback: '500 g',
      ),
      discount: discount,
      rating: _doubleValue(map['rating'], fallback: 4.5),
      reviewCount: _intValue(map['reviewCount'] ?? map['totalReviews']),
      soldCount: _intValue(map['soldCount']),
      organic: _boolValue(map['organic'], fallback: true),
      inStock: _boolValue(map['inStock'], fallback: true),
      bestSeller: _boolValue(map['bestSeller']),
      isQuick: _boolValue(
        map['isQuick'],
        fallback: false,
      ),
      quickDeliveryMinutes: quickMinutes,
      deliveryTime: _stringValue(
        map['deliveryTime'],
        fallback: quickMinutes > 0 ? '$quickMinutes min' : '30 min',
      ),
      seller: _stringValue(
        map['seller'],
        fallback: 'Farm To Home Growers',
      ),
      origin: _stringValue(map['origin'], fallback: 'India'),
      shelfLife: _stringValue(
        map['shelf_life'] ?? map['shelfLife'],
        fallback: '3 days',
      ),
      description: _stringValue(
        map['description'],
        fallback: 'Fresh product sourced directly from local farms.',
      ),
      availableQuantity: _intValue(
        map['availableQuantity'],
        fallback: _boolValue(map['inStock'], fallback: true) ? 20 : 0,
      ),
      offerText: _stringValue(
        map['offerText'],
        fallback: discount > 0
            ? '${discount.toStringAsFixed(0)}% OFF'
            : '',
      ),
      couponCode: _stringValue(map['couponCode']),
      farmerId: _stringValue(
        map['farmerId'],
        fallback: _defaultFarmerIdForCategory(category),
      ),
      benefits: _stringListValue(map['benefits']),
      nutritionInfo: _stringMapValue(map['nutritionInfo']),
      availableUnits: _stringListValue(
        map['availableUnits'] ?? map['quantityOptions'],
      ),
      defaultUnit: _stringValue(
        map['defaultUnit'] ?? map['unit'] ?? map['weight'],
      ),
      unitPrices: _doubleMapValue(map['unitPrices']),
      unitMrps: _doubleMapValue(map['unitMrps']),
      quantityType: _stringValue(
        map['quantityType'],
        fallback: _defaultQuantityType(category, name),
      ),
      customQuantityAllowed: _boolValue(
        map['customQuantityAllowed'],
        fallback: true,
      ),
      minimumCustomQuantity: _doubleValue(
        map['minimumCustomQuantity'],
        fallback: 0.5,
      ),
      maximumCustomQuantity: _doubleValue(
        map['maximumCustomQuantity'],
        fallback: 500,
      ),
      approximateWeightPerUnitKg: _doubleValue(
        map['approximateWeightPerUnitKg'],
        fallback: _defaultApproximateWeightKg(category, name),
      ),
      minimumQuickQuantity: _doubleValue(
        map['minimumQuickQuantity'],
        fallback: 1,
      ),
      minimumQuickUnit: _stringValue(
        map['minimumQuickUnit'] ?? map['unit'] ?? map['weight'],
      ),
      quickAvailableStock: _doubleValue(
        map['quickAvailableStock'] ?? map['availableQuantity'],
      ),
      availableDeliveryDays: _stringListValue(
        map['availableDeliveryDays'] ?? map['deliveryDays'],
      ),
      normalDeliveryNote: _stringValue(map['normalDeliveryNote']),
      farmerOnline: _boolValue(map['farmerOnline'], fallback: true),
      acceptingOrders: _boolValue(map['acceptingOrders'], fallback: true),
      farmerName: _stringValue(map['farmerName'] ?? map['seller']),
      farmName: _stringValue(map['farmName']),
      farmerLocation: _stringValue(map['farmerLocation'] ?? map['location']),
      farmerVillage: _stringValue(map['farmerVillage']),
      farmerDistrict: _stringValue(map['farmerDistrict']),
      farmerState: _stringValue(map['farmerState']),
      farmerLatitude: _doubleValue(map['farmerLatitude'] ?? map['latitude']),
      farmerLongitude: _doubleValue(map['farmerLongitude'] ?? map['longitude']),
      farmerPhone: _stringValue(map['farmerPhone']),
      farmerExperience: _stringValue(map['farmerExperience']),
      farmerCertification: _stringValue(map['farmerCertification']),
      preOrderAvailable: _boolValue(
        map['preOrderAvailable'],
        fallback: false,
      ),
      preOrderStartDate: _dateTimeValue(map['preOrderStartDate']),
      preOrderEndDate: _dateTimeValue(map['preOrderEndDate']),
      harvestDate: _dateTimeValue(map['harvestDate']),
      nextHarvestDate: _dateTimeValue(map['nextHarvestDate']),
      expectedHarvestDate: _dateTimeValue(
        map['expectedHarvestDate'] ?? map['nextHarvestDate'],
      ),
      harvestStatus: _stringValue(
        map['harvestStatus'],
        fallback: 'Growing',
      ),
      harvestStatusTelugu: _stringValue(
        map['harvestStatusTelugu'],
        fallback: 'పెరుగుతోంది',
      ),
      expectedDeliveryDate: _dateTimeValue(map['expectedDeliveryDate']),
      availableDeliverySlots: _stringListValue(
        map['availableDeliverySlots'] ?? map['deliverySlots'],
      ),
      minimumPreOrderQuantity: _positiveIntValue(
        map['minimumPreOrderQuantity'],
        fallback: 1,
      ),
      maximumPreOrderQuantity: _positiveIntValue(
        map['maximumPreOrderQuantity'],
        fallback: 10,
      ),
      preOrderBookedQuantity: _intValue(
        map['preOrderBookedQuantity'],
        fallback: 0,
      ),
      preOrderNote: _stringValue(map['preOrderNote']),
    );
  }

  ProductModel copyWith({
    String? id,
    String? name,
    String? teluguName,
    String? displayName,
    String? image,
    List<String>? images,
    double? price,
    double? mrp,
    String? category,
    String? categoryTelugu,
    String? collection,
    String? weight,
    String? unit,
    double? discount,
    double? rating,
    int? reviewCount,
    int? soldCount,
    bool? organic,
    bool? inStock,
    bool? bestSeller,
    bool? isQuick,
    int? quickDeliveryMinutes,
    String? deliveryTime,
    String? seller,
    String? origin,
    String? shelfLife,
    String? description,
    int? availableQuantity,
    String? offerText,
    String? couponCode,
    String? farmerId,
    List<String>? benefits,
    Map<String, String>? nutritionInfo,
    List<String>? availableUnits,
    String? defaultUnit,
    Map<String, double>? unitPrices,
    Map<String, double>? unitMrps,
    String? quantityType,
    bool? customQuantityAllowed,
    double? minimumCustomQuantity,
    double? maximumCustomQuantity,
    double? approximateWeightPerUnitKg,
    double? minimumQuickQuantity,
    String? minimumQuickUnit,
    double? quickAvailableStock,
    List<String>? availableDeliveryDays,
    String? normalDeliveryNote,
    bool? farmerOnline,
    bool? acceptingOrders,
    String? farmerName,
    String? farmName,
    String? farmerLocation,
    String? farmerVillage,
    String? farmerDistrict,
    String? farmerState,
    double? farmerLatitude,
    double? farmerLongitude,
    String? farmerPhone,
    String? farmerExperience,
    String? farmerCertification,
    bool? preOrderAvailable,
    DateTime? preOrderStartDate,
    DateTime? preOrderEndDate,
    DateTime? harvestDate,
    DateTime? nextHarvestDate,
    DateTime? expectedHarvestDate,
    String? harvestStatus,
    String? harvestStatusTelugu,
    DateTime? expectedDeliveryDate,
    List<String>? availableDeliverySlots,
    int? minimumPreOrderQuantity,
    int? maximumPreOrderQuantity,
    int? preOrderBookedQuantity,
    String? preOrderNote,
  }) {
    return ProductModel(
      id: id ?? this.id,
      name: name ?? this.name,
      teluguName: teluguName ?? this.teluguName,
      displayName: displayName ?? this.displayName,
      image: image ?? this.image,
      images: images ?? this.images,
      price: price ?? this.price,
      mrp: mrp ?? this.mrp,
      category: category ?? this.category,
      categoryTelugu: categoryTelugu ?? this.categoryTelugu,
      collection: collection ?? this.collection,
      weight: weight ?? this.weight,
      unit: unit ?? this.unit,
      discount: discount ?? this.discount,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      soldCount: soldCount ?? this.soldCount,
      organic: organic ?? this.organic,
      inStock: inStock ?? this.inStock,
      bestSeller: bestSeller ?? this.bestSeller,
      isQuick: isQuick ?? this.isQuick,
      quickDeliveryMinutes:
      quickDeliveryMinutes ?? this.quickDeliveryMinutes,
      deliveryTime: deliveryTime ?? this.deliveryTime,
      seller: seller ?? this.seller,
      origin: origin ?? this.origin,
      shelfLife: shelfLife ?? this.shelfLife,
      description: description ?? this.description,
      availableQuantity: availableQuantity ?? this.availableQuantity,
      offerText: offerText ?? this.offerText,
      couponCode: couponCode ?? this.couponCode,
      farmerId: farmerId ?? this.farmerId,
      benefits: benefits ?? this.benefits,
      nutritionInfo: nutritionInfo ?? this.nutritionInfo,
      availableUnits: availableUnits ?? this.availableUnits,
      defaultUnit: defaultUnit ?? this.defaultUnit,
      unitPrices: unitPrices ?? this.unitPrices,
      unitMrps: unitMrps ?? this.unitMrps,
      quantityType: quantityType ?? this.quantityType,
      customQuantityAllowed: customQuantityAllowed ?? this.customQuantityAllowed,
      minimumCustomQuantity: minimumCustomQuantity ?? this.minimumCustomQuantity,
      maximumCustomQuantity: maximumCustomQuantity ?? this.maximumCustomQuantity,
      approximateWeightPerUnitKg: approximateWeightPerUnitKg ?? this.approximateWeightPerUnitKg,
      minimumQuickQuantity: minimumQuickQuantity ?? this.minimumQuickQuantity,
      minimumQuickUnit: minimumQuickUnit ?? this.minimumQuickUnit,
      quickAvailableStock: quickAvailableStock ?? this.quickAvailableStock,
      availableDeliveryDays: availableDeliveryDays ?? this.availableDeliveryDays,
      normalDeliveryNote: normalDeliveryNote ?? this.normalDeliveryNote,
      farmerOnline: farmerOnline ?? this.farmerOnline,
      acceptingOrders: acceptingOrders ?? this.acceptingOrders,
      farmerName: farmerName ?? this.farmerName,
      farmName: farmName ?? this.farmName,
      farmerLocation: farmerLocation ?? this.farmerLocation,
      farmerVillage: farmerVillage ?? this.farmerVillage,
      farmerDistrict: farmerDistrict ?? this.farmerDistrict,
      farmerState: farmerState ?? this.farmerState,
      farmerLatitude: farmerLatitude ?? this.farmerLatitude,
      farmerLongitude: farmerLongitude ?? this.farmerLongitude,
      farmerPhone: farmerPhone ?? this.farmerPhone,
      farmerExperience: farmerExperience ?? this.farmerExperience,
      farmerCertification: farmerCertification ?? this.farmerCertification,
      preOrderAvailable: preOrderAvailable ?? this.preOrderAvailable,
      preOrderStartDate: preOrderStartDate ?? this.preOrderStartDate,
      preOrderEndDate: preOrderEndDate ?? this.preOrderEndDate,
      harvestDate: harvestDate ?? this.harvestDate,
      nextHarvestDate: nextHarvestDate ?? this.nextHarvestDate,
      expectedHarvestDate: expectedHarvestDate ?? this.expectedHarvestDate,
      harvestStatus: harvestStatus ?? this.harvestStatus,
      harvestStatusTelugu: harvestStatusTelugu ?? this.harvestStatusTelugu,
      expectedDeliveryDate:
      expectedDeliveryDate ?? this.expectedDeliveryDate,
      availableDeliverySlots:
      availableDeliverySlots ?? this.availableDeliverySlots,
      minimumPreOrderQuantity:
      minimumPreOrderQuantity ?? this.minimumPreOrderQuantity,
      maximumPreOrderQuantity:
      maximumPreOrderQuantity ?? this.maximumPreOrderQuantity,
      preOrderBookedQuantity:
      preOrderBookedQuantity ?? this.preOrderBookedQuantity,
      preOrderNote: preOrderNote ?? this.preOrderNote,
    );
  }

  static String _defaultQuantityType(String category, String name) {
    final String normalized = '${category.toLowerCase()} ${name.toLowerCase()}';
    const bunchItems = <String>['spinach','coriander','mint','curry leaves','spring onion','amaranth','fenugreek'];
    if (bunchItems.any(normalized.contains)) return 'bunch';
    const volumeItems = <String>['milk','lassi','buttermilk','juice','oil','ghee'];
    if (volumeItems.any(normalized.contains)) return 'volume';
    const pieceItems = <String>['cabbage','cauliflower','pumpkin','watermelon','coconut','papaya','pineapple'];
    if (pieceItems.any(normalized.contains)) return 'piece';
    if (normalized.contains('egg')) return 'count';
    return 'weight';
  }

  static double _defaultApproximateWeightKg(String category, String name) {
    switch (_defaultQuantityType(category, name)) {
      case 'bunch': return 0.25;
      case 'piece': return 1;
      case 'volume': return 1;
      case 'count': return 0.06;
      default: return 1;
    }
  }

  static double _weightInKgFromLabel(String label) {
    final String normalized = label.trim().toLowerCase();
    final RegExpMatch? match = RegExp(r'\d+(?:\.\d+)?').firstMatch(normalized);
    if (match == null) return 0;
    final double value = double.tryParse(match.group(0) ?? '') ?? 0;
    if (value <= 0) return 0;
    if (normalized.contains('kg')) return value;
    if (normalized.contains(' g') || normalized.endsWith('g')) return value / 1000;
    if (normalized.contains('ml')) return value / 1000;
    if (normalized.contains(' l') || normalized.endsWith('l') || normalized.contains('litre') || normalized.contains('liter')) return value;
    return 0;
  }

  static String _defaultFarmerIdForCategory(String category) {
    switch (category.trim().toLowerCase()) {
      case 'fruits':
        return 'farmer_002';
      case 'dairy':
        return 'farmer_003';
      case 'seasonal':
        return 'farmer_004';
      case 'vegetables':
      default:
        return 'farmer_001';
    }
  }

  static String _defaultCategoryTelugu(String category) {
    switch (category.trim().toLowerCase()) {
      case 'fruits':
        return 'పండ్లు';
      case 'dairy':
        return 'పాల ఉత్పత్తులు';
      case 'seasonal':
        return 'సీజనల్ ఉత్పత్తులు';
      case 'vegetables':
      default:
        return 'కూరగాయలు';
    }
  }

  static int _extractMinutes(dynamic value) {
    if (value == null) return 0;
    final RegExpMatch? match = RegExp(r'\d+').firstMatch(value.toString());
    if (match == null) return 0;
    return int.tryParse(match.group(0) ?? '') ?? 0;
  }

  static String _stringValue(dynamic value, {String fallback = ''}) {
    if (value == null) return fallback;
    final String result = value.toString().trim();
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

  static int _positiveIntValue(dynamic value, {int fallback = 1}) {
    final int parsed = _intValue(value, fallback: fallback);
    return parsed > 0 ? parsed : fallback;
  }

  static DateTime? _dateTimeValue(dynamic value) {
    if (value == null) return null;
    if (value is DateTime) return value;

    if (value is String) {
      return DateTime.tryParse(value.trim());
    }

    if (value is int) {
      return DateTime.fromMillisecondsSinceEpoch(value);
    }

    if (value is num) {
      return DateTime.fromMillisecondsSinceEpoch(value.toInt());
    }

    try {
      final dynamic converted = value.toDate();
      return converted is DateTime ? converted : null;
    } catch (_) {
      return null;
    }
  }

  static bool _boolValue(dynamic value, {bool fallback = false}) {
    if (value is bool) return value;
    if (value is num) return value != 0;
    if (value is String) {
      final String normalized = value.trim().toLowerCase();
      if (normalized == 'true' || normalized == '1') return true;
      if (normalized == 'false' || normalized == '0') return false;
    }
    return fallback;
  }

  static List<String> _stringListValue(dynamic value) {
    if (value is Iterable) {
      return value
          .map((dynamic item) => item.toString().trim())
          .where((String item) => item.isNotEmpty)
          .toList();
    }

    if (value is String && value.trim().isNotEmpty) {
      return value
          .split(',')
          .map((String item) => item.trim())
          .where((String item) => item.isNotEmpty)
          .toList();
    }

    return <String>[];
  }

  static String _formatQuantity(double value) {
    if (value == value.roundToDouble()) return value.toInt().toString();
    return value.toStringAsFixed(1);
  }

  static Map<String, double> _doubleMapValue(dynamic value) {
    if (value is Map) {
      final Map<String, double> result =
      <String, double>{};

      value.forEach((dynamic key, dynamic item) {
        final double? parsed = item is num
            ? item.toDouble()
            : double.tryParse(item.toString().trim());

        if (parsed != null) {
          result[key.toString()] = parsed;
        }
      });

      return result;
    }

    return <String, double>{};
  }

  static Map<String, String> _stringMapValue(dynamic value) {
    if (value is Map) {
      return value.map<String, String>(
            (dynamic key, dynamic item) => MapEntry<String, String>(
          key.toString(),
          item.toString(),
        ),
      );
    }

    return <String, String>{};
  }
}
