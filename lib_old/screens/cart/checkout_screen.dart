import 'dart:async';

import 'package:animate_do/animate_do.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:geocoding/geocoding.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../models/address_model.dart';
import '../../models/order_model.dart';
import '../../models/payment_model.dart';
import '../../models/farmer.dart';
import '../../services/address_service.dart';
import '../../services/cart_service.dart';
import '../../services/farmer_service.dart';
import '../farmer/farmer_profile_screen.dart';
import '../home/home_screen.dart';
import '../payment/payment_screen.dart';

enum CheckoutDeliveryMode {
  quick,
  scheduled,
  preOrder,
}

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({
    super.key,
    this.initialDeliveryMode = 'scheduled',
  });

  final String initialDeliveryMode;

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final CartService _cartService = CartService();
  final AddressService _addressService = AddressService();
  final FarmerService _farmerService = FarmerService.instance;

  final TextEditingController _promoController = TextEditingController();
  final TextEditingController _orderNoteController = TextEditingController();



  StreamSubscription<List<AddressModel>>? _addressSubscription;
  late final VoidCallback _cartListener;

  List<AddressModel> _userAddresses = <AddressModel>[];

  AddressModel? _selectedAddress;

  String _paymentMethod = 'Cash on Delivery';

  DateTime? _selectedScheduledDate;
  String? _selectedScheduledTimeSlot;

  DateTime? _selectedPreOrderDate;
  String? _selectedPreOrderTimeSlot;

  late CheckoutDeliveryMode _deliveryMode;

  String _deliveryInstruction = 'Call before delivery';
  bool _useEcoFriendlyPacking = true;

  bool _isLoadingAddresses = true;
  bool _addressLoadingError = false;
  bool _isPlacingOrder = false;
  bool _isGettingLocation = false;

  double _appliedDiscount = 0;
  String? _appliedPromoCode;

  List<CartItem> get _cartItems {
    return List<CartItem>.unmodifiable(_cartService.items);
  }

  CheckoutDeliveryMode _deliveryModeFromValue(
      String value,
      ) {
    switch (value.trim().toLowerCase()) {
      case 'quick':
        return CheckoutDeliveryMode.quick;
      case 'pre_order':
      case 'preorder':
      case 'pre-order':
        return CheckoutDeliveryMode.preOrder;
      default:
        return CheckoutDeliveryMode.scheduled;
    }
  }

  String get _deliveryModeValue {
    switch (_deliveryMode) {
      case CheckoutDeliveryMode.quick:
        return 'quick';
      case CheckoutDeliveryMode.preOrder:
        return 'pre_order';
      case CheckoutDeliveryMode.scheduled:
        return 'scheduled';
    }
  }

  String get _deliveryModeTitle {
    switch (_deliveryMode) {
      case CheckoutDeliveryMode.quick:
        return 'Quick Delivery';
      case CheckoutDeliveryMode.preOrder:
        return 'Advance Pre-Booking';
      case CheckoutDeliveryMode.scheduled:
        return 'Scheduled Delivery';
    }
  }


  List<CartItem> get _quickItems {
    return _cartItems
        .where((CartItem item) => item.isQuick)
        .toList();
  }

  int get _maximumQuickDeliveryMinutes {
    return _quickItems.fold<int>(
      0,
          (int current, CartItem item) =>
      item.quickDeliveryMinutes > current
          ? item.quickDeliveryMinutes
          : current,
    );
  }


  String get _deliveryScheduleSummary {
    switch (_deliveryMode) {
      case CheckoutDeliveryMode.quick:
        return 'Quick Delivery • '
            '${_maximumQuickDeliveryMinutes > 0 ? _maximumQuickDeliveryMinutes : 90} min';

      case CheckoutDeliveryMode.scheduled:
        if (_selectedScheduledDate == null ||
            _selectedScheduledTimeSlot == null) {
          return 'Scheduled Delivery';
        }

        return 'Scheduled • '
            '${_formatCheckoutDate(_selectedScheduledDate!)} '
            '$_selectedScheduledTimeSlot';

      case CheckoutDeliveryMode.preOrder:
        if (_selectedPreOrderDate == null ||
            _selectedPreOrderTimeSlot == null) {
          return 'Advance Pre-Booking';
        }

        return 'Pre-Order • '
            '${_formatCheckoutDate(_selectedPreOrderDate!)} '
            '$_selectedPreOrderTimeSlot';
    }
  }

  double get subtotal {
    return _cartService.items.fold<double>(
      0,
          (double total, dynamic item) {
        return total + (item.price * item.quantity);
      },
    );
  }

  double get deliveryCharge {
    if (subtotal <= 0) {
      return 0;
    }

    return subtotal >= 499 ? 0 : 30;
  }

  double get handlingFee {
    return subtotal > 0 ? 5 : 0;
  }

  double get total {
    final double finalTotal =
        subtotal + deliveryCharge + handlingFee - _appliedDiscount;

    return finalTotal < 0 ? 0 : finalTotal;
  }

  @override
  void initState() {
    super.initState();
    _deliveryMode =
        _deliveryModeFromValue(widget.initialDeliveryMode);

    _cartListener = () {
      if (mounted) {
        setState(() {});
      }
    };

    _cartService.addListener(_cartListener);
    _loadAddresses();
  }

  @override
  void dispose() {
    _addressSubscription?.cancel();
    _cartService.removeListener(_cartListener);
    _promoController.dispose();
    _orderNoteController.dispose();
    super.dispose();
  }

  void _loadAddresses() {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      setState(() {
        _isLoadingAddresses = false;
        _addressLoadingError = true;
      });
      return;
    }

    _addressSubscription?.cancel();

    setState(() {
      _isLoadingAddresses = true;
      _addressLoadingError = false;
    });

    _addressSubscription =
        _addressService.getUserAddresses(user.uid).listen(
              (List<AddressModel> addresses) {
            if (!mounted) {
              return;
            }

            AddressModel? selectedAddress;

            if (_selectedAddress != null) {
              for (final AddressModel address in addresses) {
                if (address.id == _selectedAddress!.id) {
                  selectedAddress = address;
                  break;
                }
              }
            }

            if (selectedAddress == null) {
              for (final AddressModel address in addresses) {
                if (address.isDefault) {
                  selectedAddress = address;
                  break;
                }
              }
            }

            if (selectedAddress == null && addresses.isNotEmpty) {
              selectedAddress = addresses.first;
            }

            setState(() {
              _userAddresses = addresses;
              _selectedAddress = selectedAddress;
              _isLoadingAddresses = false;
              _addressLoadingError = false;
            });
          },
          onError: (Object error) {
            if (!mounted) {
              return;
            }

            setState(() {
              _isLoadingAddresses = false;
              _addressLoadingError = true;
            });
          },
        );
  }

  Future<void> _placeOrder() async {
    final NavigatorState navigator = Navigator.of(context);
    if (_isPlacingOrder) {
      return;
    }

    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      _showMessage(
        'Please login before placing your order.',
        isError: true,
      );
      return;
    }

    if (_cartService.items.isEmpty) {
      _showMessage(
        'Your cart is empty. Add products before checkout.',
        isError: true,
      );
      return;
    }

    if (_selectedAddress == null) {
      _showMessage(
        'Please select a delivery address.',
        isError: true,
      );
      return;
    }

    if (_deliveryMode == CheckoutDeliveryMode.scheduled &&
        _selectedScheduledDate == null) {
      _showMessage(
        'Please select a delivery date.',
        isError: true,
      );
      return;
    }

    if (_deliveryMode == CheckoutDeliveryMode.scheduled &&
        _selectedScheduledTimeSlot == null) {
      _showMessage(
        'Please select a delivery time slot.',
        isError: true,
      );
      return;
    }

    if (_deliveryMode == CheckoutDeliveryMode.preOrder &&
        _selectedPreOrderDate == null) {
      _showMessage(
        'Please select the required pre-order date.',
        isError: true,
      );
      return;
    }

    if (_deliveryMode == CheckoutDeliveryMode.preOrder &&
        _selectedPreOrderTimeSlot == null) {
      _showMessage(
        'Please select the required pre-order time slot.',
        isError: true,
      );
      return;
    }


    setState(() {
      _isPlacingOrder = true;
    });

    try {
      final List<Map<String, dynamic>> orderItems =
      _cartService.items.map<Map<String, dynamic>>(
            (dynamic item) {
          return <String, dynamic>{
            'productId': item.productId,
            'name': item.name,
            'teluguName': item.teluguName,
            'displayName': item.displayName,
            'image': item.image,
            'price': item.price,
            'unitPrice': item.price,
            'quantity': item.quantity,
            'weight': item.weight,
            'selectedUnit': item.weight,
            'itemTotal': item.price * item.quantity,
            'category': item.category,
            'categoryTelugu': item.categoryTelugu,
            'farmerId': item.farmerId,
            'farmerName': item.farmerName,
            'farmName': item.farmName,
            'organic': item.organic,
            'rating': item.rating,
            'isQuick': item.isQuick,
            'quickDeliveryMinutes': item.quickDeliveryMinutes,
            'minimumQuickQuantity':
            item.safeMinimumQuickQuantity,
            'quickAvailableStock': item.quickAvailableStock,
            'isPreOrder': item.isPreOrder,
            'deliveryType': _deliveryModeValue,
            'harvestDate':
            item.harvestDate?.toIso8601String(),
            'expectedDeliveryDate':
            _deliveryMode == CheckoutDeliveryMode.preOrder
                ? _selectedPreOrderDate?.toIso8601String()
                : null,
            'scheduledDeliveryDate':
            _deliveryMode == CheckoutDeliveryMode.scheduled
                ? _selectedScheduledDate?.toIso8601String()
                : null,
            'deliverySlot':
            _deliveryMode == CheckoutDeliveryMode.quick
                ? ''
                : _deliveryMode ==
                CheckoutDeliveryMode.preOrder
                ? (_selectedPreOrderTimeSlot ?? '')
                : (_selectedScheduledTimeSlot ?? ''),
            'deliveryInstruction': _deliveryInstruction,
            'ecoFriendlyPacking': _useEcoFriendlyPacking,
            'customerNote': _orderNoteController.text.trim(),
          };
        },
      ).toList();

      final DocumentReference<Map<String, dynamic>> orderReference =
      FirebaseFirestore.instance.collection('orders').doc();

      final OrderModel order = OrderModel(
        id: orderReference.id,
        userId: user.uid,
        items: orderItems,
        totalAmount: total,
        address: _selectedAddress!.fullAddress,
        paymentMethod: _paymentMethod,
        timeSlot: _deliveryScheduleSummary,
        timestamp: DateTime.now(),
        status: 'pending_payment',
      );

      await orderReference.set(<String, dynamic>{
        ...order.toMap(),
        'id': orderReference.id,
        'addressId': _selectedAddress!.id ?? '',
        'addressLabel': _selectedAddress!.label,
        'subtotal': subtotal,
        'discount': _appliedDiscount,
        'deliveryCharge': deliveryCharge,
        'platformFee': handlingFee,
        'couponCode': _appliedPromoCode ?? '',
        'deliveryInstruction': _deliveryInstruction,
        'ecoFriendlyPacking': _useEcoFriendlyPacking,
        'customerNote': _orderNoteController.text.trim(),
        'deliveryMode': _deliveryModeValue,
        'deliveryModeTitle': _deliveryModeTitle,
        'deliverySchedule': <String, dynamic>{
          'mode': _deliveryModeValue,
          'quickEtaMinutes':
          _deliveryMode == CheckoutDeliveryMode.quick
              ? (_maximumQuickDeliveryMinutes > 0
              ? _maximumQuickDeliveryMinutes
              : 90)
              : null,
          'scheduledDate':
          _deliveryMode == CheckoutDeliveryMode.scheduled
              ? _selectedScheduledDate?.toIso8601String()
              : null,
          'requiredPreOrderDate':
          _deliveryMode == CheckoutDeliveryMode.preOrder
              ? _selectedPreOrderDate?.toIso8601String()
              : null,
          'timeSlot':
          _deliveryMode == CheckoutDeliveryMode.quick
              ? ''
              : _deliveryMode ==
              CheckoutDeliveryMode.preOrder
              ? (_selectedPreOrderTimeSlot ?? '')
              : (_selectedScheduledTimeSlot ?? ''),
          'farmerConfirmationRequired':
          _deliveryMode == CheckoutDeliveryMode.preOrder,
        },
        'paymentStatus': 'pending',
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      if (!mounted) {
        return;
      }

      final PaymentMethodType initialMethod =
      _paymentMethod == 'Cash on Delivery'
          ? PaymentMethodType.cashOnDelivery
          : _paymentMethod == 'Card'
          ? PaymentMethodType.creditCard
          : PaymentMethodType.upi;

      await navigator.push(
        MaterialPageRoute<void>(
          builder: (_) => PaymentScreen(
            orderId: orderReference.id,
            subtotal: subtotal,
            discount: _appliedDiscount,
            deliveryCharge: deliveryCharge,
            platformFee: handlingFee,
            walletAmount: 0,
            couponCode: _appliedPromoCode ?? '',
            initialMethod: initialMethod,
          ),
        ),
      );
    } catch (error) {
      if (!mounted) {
        return;
      }

      _showMessage(
        'Unable to continue to payment. Please try again.',
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isPlacingOrder = false;
        });
      }
    }
  }

  Future<void> _showAddressSelector() async {
    if (_userAddresses.isEmpty) {
      await _addNewAddress();
      return;
    }

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext bottomSheetContext) {
        return SafeArea(
          child: Container(
            constraints: BoxConstraints(
              maxHeight: MediaQuery.of(bottomSheetContext).size.height * 0.75,
            ),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(
                top: Radius.circular(28),
              ),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                const SizedBox(height: 12),
                Container(
                  width: 44,
                  height: 5,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(20, 18, 20, 12),
                  child: Row(
                    children: <Widget>[
                      Expanded(
                        child: Text(
                          'Select Delivery Address',
                          style: GoogleFonts.lexend(
                            fontSize: 20,
                            fontWeight: FontWeight.w700,
                            color: AppColors.darkText,
                          ),
                        ),
                      ),
                      IconButton(
                        onPressed: () {
                          Navigator.pop(bottomSheetContext);
                        },
                        icon: const Icon(Icons.close),
                      ),
                    ],
                  ),
                ),
                Flexible(
                  child: ListView.separated(
                    padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
                    itemCount: _userAddresses.length,
                    separatorBuilder: (_, __) {
                      return const SizedBox(height: 10);
                    },
                    itemBuilder: (
                        BuildContext context,
                        int index,
                        ) {
                      final AddressModel address =
                      _userAddresses[index];

                      final bool isSelected =
                          _selectedAddress?.id == address.id;

                      return Material(
                        color: isSelected
                            ? AppColors.lightMint
                            : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        child: InkWell(
                          borderRadius: BorderRadius.circular(16),
                          onTap: () {
                            setState(() {
                              _selectedAddress = address;
                            });

                            Navigator.pop(bottomSheetContext);
                          },
                          child: Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: isSelected
                                    ? AppColors.primaryGreen
                                    : Colors.grey.shade200,
                                width: isSelected ? 1.5 : 1,
                              ),
                            ),
                            child: Row(
                              crossAxisAlignment:
                              CrossAxisAlignment.start,
                              children: <Widget>[
                                Container(
                                  width: 42,
                                  height: 42,
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryGreen
                                        .withValues(alpha: 0.10),
                                    borderRadius:
                                    BorderRadius.circular(12),
                                  ),
                                  child: Icon(
                                    _addressIcon(address.label),
                                    color: AppColors.primaryGreen,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                    children: <Widget>[
                                      Row(
                                        children: <Widget>[
                                          Text(
                                            _addressLabel(address),
                                            style: GoogleFonts.lexend(
                                              fontSize: 14,
                                              fontWeight:
                                              FontWeight.w700,
                                              color:
                                              AppColors.darkText,
                                            ),
                                          ),
                                          if (address.isDefault) ...<
                                              Widget>[
                                            const SizedBox(width: 8),
                                            _smallBadge('Default'),
                                          ],
                                        ],
                                      ),
                                      const SizedBox(height: 6),
                                      Text(
                                        address.fullAddress,
                                        style: GoogleFonts.lato(
                                          fontSize: 13,
                                          height: 1.4,
                                          color: Colors.grey.shade700,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                const SizedBox(width: 8),
                                Icon(
                                  isSelected
                                      ? Icons.check_circle
                                      : Icons.radio_button_unchecked,
                                  color: isSelected
                                      ? AppColors.primaryGreen
                                      : Colors.grey.shade400,
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
                  child: SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      onPressed: () {
                        Navigator.pop(bottomSheetContext);
                        _addNewAddress();
                      },
                      icon: const Icon(Icons.add_location_alt_outlined),
                      label: const Text('Add New Address'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.primaryGreen,
                        side: const BorderSide(
                          color: AppColors.primaryGreen,
                        ),
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _addNewAddress() async {
    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      _showMessage(
        'Please login to add an address.',
        isError: true,
      );
      return;
    }

    final TextEditingController addressController =
    TextEditingController();

    String selectedLabel = 'Home';
    bool isSaving = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext bottomSheetContext) {
        return StatefulBuilder(
          builder: (
              BuildContext context,
              StateSetter modalSetState,
              ) {
            return Padding(
              padding: EdgeInsets.only(
                bottom: MediaQuery.of(context).viewInsets.bottom,
              ),
              child: Container(
                decoration: const BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(28),
                  ),
                ),
                padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment:
                    CrossAxisAlignment.start,
                    children: <Widget>[
                      Center(
                        child: Container(
                          width: 44,
                          height: 5,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade300,
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Add Delivery Address',
                        style: GoogleFonts.lexend(
                          fontSize: 21,
                          fontWeight: FontWeight.w700,
                          color: AppColors.darkText,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Enter complete address for accurate delivery.',
                        style: GoogleFonts.lato(
                          fontSize: 14,
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 20),
                      TextField(
                        controller: addressController,
                        minLines: 3,
                        maxLines: 5,
                        textCapitalization:
                        TextCapitalization.sentences,
                        decoration: InputDecoration(
                          labelText: 'Full Address',
                          hintText:
                          'House number, street, area, city and postal code',
                          prefixIcon:
                          const Icon(Icons.location_on_outlined),
                          filled: true,
                          fillColor: AppColors.lightCream,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide.none,
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: BorderSide(
                              color: Colors.grey.shade200,
                            ),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(14),
                            borderSide: const BorderSide(
                              color: AppColors.primaryGreen,
                              width: 1.5,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 18),
                      Text(
                        'Save address as',
                        style: GoogleFonts.lexend(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 10,
                        runSpacing: 10,
                        children: <Widget>[
                          _addressLabelChip(
                            label: 'Home',
                            icon: Icons.home_outlined,
                            selectedLabel: selectedLabel,
                            onSelected: () {
                              modalSetState(() {
                                selectedLabel = 'Home';
                              });
                            },
                          ),
                          _addressLabelChip(
                            label: 'Office',
                            icon: Icons.business_outlined,
                            selectedLabel: selectedLabel,
                            onSelected: () {
                              modalSetState(() {
                                selectedLabel = 'Office';
                              });
                            },
                          ),
                          _addressLabelChip(
                            label: 'Other',
                            icon: Icons.location_on_outlined,
                            selectedLabel: selectedLabel,
                            onSelected: () {
                              modalSetState(() {
                                selectedLabel = 'Other';
                              });
                            },
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: isSaving
                              ? null
                              : () async {
                            final String fullAddress =
                            addressController.text.trim();

                            if (fullAddress.isEmpty) {
                              _showMessage(
                                'Please enter your full address.',
                                isError: true,
                              );
                              return;
                            }

                            modalSetState(() {
                              isSaving = true;
                            });

                            try {
                              final AddressModel newAddress =
                              AddressModel(
                                userId: user.uid,
                                fullAddress: fullAddress,
                                label: selectedLabel,
                                isDefault:
                                _userAddresses.isEmpty,
                              );

                              await _addressService
                                  .addAddress(newAddress);

                              if (!bottomSheetContext.mounted) {
                                return;
                              }

                              Navigator.of(
                                bottomSheetContext,
                              ).pop();

                              _showMessage(
                                'Address added successfully.',
                              );
                            } catch (error) {
                              modalSetState(() {
                                isSaving = false;
                              });

                              _showMessage(
                                'Unable to add address.',
                                isError: true,
                              );
                            }
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor:
                            AppColors.primaryGreen,
                            foregroundColor: Colors.white,
                            minimumSize:
                            const Size(double.infinity, 54),
                            shape: const RoundedRectangleBorder(
                              borderRadius: BorderRadius.all(
                                Radius.circular(14),
                              ),
                            ),
                          ),
                          child: isSaving
                              ? const SizedBox(
                            width: 22,
                            height: 22,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.4,
                              color: Colors.white,
                            ),
                          )
                              : Text(
                            'Save Address',
                            style: GoogleFonts.lexend(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );

    addressController.dispose();
  }

  Future<void> _useCurrentLocation() async {
    if (_isGettingLocation) {
      return;
    }

    final User? user = FirebaseAuth.instance.currentUser;

    if (user == null) {
      _showMessage(
        'Please login to use current location.',
        isError: true,
      );
      return;
    }

    setState(() {
      _isGettingLocation = true;
    });

    try {
      final bool serviceEnabled =
      await Geolocator.isLocationServiceEnabled();

      if (!mounted) return;

      if (!serviceEnabled) {
        _showMessage(
          'Location service is disabled. Please enable it.',
          isError: true,
        );
        return;
      }

      LocationPermission permission =
      await Geolocator.checkPermission();

      if (!mounted) return;

      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();

        if (!mounted) return;
      }

      if (permission == LocationPermission.denied) {
        _showMessage(
          'Location permission was denied.',
          isError: true,
        );
        return;
      }

      if (permission == LocationPermission.deniedForever) {
        _showMessage(
          'Location permission is permanently denied. Enable it in settings.',
          isError: true,
        );
        return;
      }

      final Position position =
      await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );

      if (!mounted) return;

      final List<Placemark> placemarks =
      await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      );

      if (!mounted) return;

      if (placemarks.isEmpty) {
        _showMessage(
          'Unable to find address from your location.',
          isError: true,
        );
        return;
      }

      final Placemark place = placemarks.first;

      final List<String> addressParts = <String>[
        place.name ?? '',
        place.street ?? '',
        place.subLocality ?? '',
        place.locality ?? '',
        place.administrativeArea ?? '',
        place.postalCode ?? '',
      ].where((String value) => value.trim().isNotEmpty).toList();

      final String fullAddress = addressParts.join(', ');

      if (fullAddress.isEmpty) {
        _showMessage(
          'Unable to generate your current address.',
          isError: true,
        );
        return;
      }

      final AddressModel newAddress = AddressModel(
        userId: user.uid,
        fullAddress: fullAddress,
        label: 'Current Location',
        isDefault: _userAddresses.isEmpty,
      );

      await _addressService.addAddress(newAddress);

      if (!mounted) {
        return;
      }

      _showMessage(
        'Current location added successfully.',
      );
    } catch (error) {
      if (!mounted) {
        return;
      }

      _showMessage(
        'Unable to get current location.',
        isError: true,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isGettingLocation = false;
        });
      }
    }
  }

  void _applyPromoCode(String code) {
    final String normalizedCode =
    code.trim().toUpperCase();

    if (normalizedCode.isEmpty) {
      _showMessage(
        'Please enter a promo code.',
        isError: true,
      );
      return;
    }

    if (normalizedCode == 'SAVE50') {
      if (subtotal < 199) {
        _showMessage(
          'SAVE50 is available on orders above ₹199.',
          isError: true,
        );
        return;
      }

      setState(() {
        _appliedPromoCode = 'SAVE50';
        _appliedDiscount = 50;
        _promoController.text = 'SAVE50';
      });

      _showMessage('SAVE50 applied. You saved ₹50.');
      return;
    }

    if (normalizedCode == 'FLAT20') {
      setState(() {
        _appliedPromoCode = 'FLAT20';
        _appliedDiscount = 20;
        _promoController.text = 'FLAT20';
      });

      _showMessage('FLAT20 applied. You saved ₹20.');
      return;
    }

    _showMessage(
      'Invalid promo code.',
      isError: true,
    );
  }

  void _removePromoCode() {
    setState(() {
      _appliedPromoCode = null;
      _appliedDiscount = 0;
      _promoController.clear();
    });

    _showMessage('Promo code removed.');
  }

  void _showMessage(
      String message, {
        bool isError = false,
      }) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(
            message,
            style: GoogleFonts.lato(
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
          behavior: SnackBarBehavior.floating,
          backgroundColor: isError
              ? AppColors.errorRed
              : AppColors.primaryGreen,
          margin: const EdgeInsets.all(16),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final List<CartItem> items =
    List<CartItem>.from(_cartService.items);

    return Scaffold(
      backgroundColor: AppColors.lightCream,
      appBar: AppBar(
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () {
            Navigator.pop(context);
          },
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
            color: AppColors.darkText,
          ),
        ),
        title: Text(
          'Checkout',
          style: GoogleFonts.lexend(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: AppColors.darkText,
          ),
        ),
        centerTitle: true,
      ),
      body: items.isEmpty
          ? _buildEmptyCart()
          : Column(
        children: <Widget>[
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: const EdgeInsets.fromLTRB(
                16,
                16,
                16,
                120,
              ),
              child: Column(
                crossAxisAlignment:
                CrossAxisAlignment.start,
                children: <Widget>[
                  FadeInUp(
                    child: _buildQuickDeliverySection(),
                  ),
                  const SizedBox(height: 18),
                  FadeInUp(
                    delay: const Duration(milliseconds: 80),
                    child: _buildDeliveryAddressSection(),
                  ),
                  const SizedBox(height: 18),
                  FadeInUp(
                    delay:
                    const Duration(milliseconds: 100),
                    child: _buildOrderItemsSection(items),
                  ),
                  const SizedBox(height: 18),
                  FadeInUp(
                    delay:
                    const Duration(milliseconds: 200),
                    child: _buildPromoSection(),
                  ),
                  const SizedBox(height: 18),
                  FadeInUp(
                    delay:
                    const Duration(milliseconds: 300),
                    child: _buildDeliverySlotSection(),
                  ),
                  const SizedBox(height: 18),
                  FadeInUp(
                    delay:
                    const Duration(milliseconds: 400),
                    child: _buildDeliveryInstructionSection(),
                  ),
                  const SizedBox(height: 18),
                  FadeInUp(
                    delay:
                    const Duration(milliseconds: 440),
                    child: _buildOrderNoteSection(),
                  ),
                  const SizedBox(height: 18),
                  FadeInUp(
                    delay:
                    const Duration(milliseconds: 480),
                    child: _buildPaymentSection(),
                  ),
                  const SizedBox(height: 18),
                  FadeInUp(
                    delay:
                    const Duration(milliseconds: 500),
                    child: _buildBillSummary(),
                  ),
                ],
              ),
            ),
          ),
          _buildBottomOrderBar(),
        ],
      ),
    );
  }

  Widget _buildQuickDeliverySection() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: <Color>[
            Color(0xFF0F7A3A),
            Color(0xFF1F9D55),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(22),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x331B5E20),
            blurRadius: 18,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 54,
            height: 54,
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.18),
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(
              Icons.bolt_rounded,
              color: Colors.white,
              size: 32,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  _deliveryModeTitle,
                  style: GoogleFonts.lexend(
                    color: Colors.white,
                    fontSize: 18,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  _deliveryMode == CheckoutDeliveryMode.quick
                      ? 'Ready-stock products delivered in 45–90 minutes.'
                      : _deliveryMode == CheckoutDeliveryMode.preOrder
                      ? 'Choose the required date and time for advance booking.'
                      : 'Choose one delivery date and time slot for the full order.',
                  style: GoogleFonts.lato(
                    color: Colors.white.withValues(alpha: 0.90),
                    fontSize: 13,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _deliveryMode == CheckoutDeliveryMode.quick
                  ? 'FAST'
                  : _deliveryMode == CheckoutDeliveryMode.preOrder
                  ? 'BOOK'
                  : 'SLOT',
              style: GoogleFonts.lexend(
                color: AppColors.primaryGreen,
                fontSize: 11,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDeliveryAddressSection() {
    return _sectionContainer(
      title: 'Delivery Address',
      icon: Icons.location_on_outlined,
      child: _isLoadingAddresses
          ? const Padding(
        padding: EdgeInsets.symmetric(vertical: 22),
        child: Center(
          child: CircularProgressIndicator(
            color: AppColors.primaryGreen,
          ),
        ),
      )
          : _addressLoadingError
          ? _buildAddressError()
          : _selectedAddress == null
          ? _buildNoAddress()
          : _buildSelectedAddress(),
    );
  }

  Widget _buildAddressError() {
    return Column(
      children: <Widget>[
        Icon(
          Icons.cloud_off_outlined,
          size: 42,
          color: Colors.grey.shade400,
        ),
        const SizedBox(height: 10),
        Text(
          'Unable to load your addresses',
          style: GoogleFonts.lato(
            fontSize: 14,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _loadAddresses,
          icon: const Icon(Icons.refresh),
          label: const Text('Retry'),
        ),
      ],
    );
  }

  Widget _buildNoAddress() {
    return Column(
      children: <Widget>[
        Container(
          width: 58,
          height: 58,
          decoration: BoxDecoration(
            color: AppColors.lightMint,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Icon(
            Icons.add_location_alt_outlined,
            color: AppColors.primaryGreen,
            size: 30,
          ),
        ),
        const SizedBox(height: 12),
        Text(
          'No delivery address added',
          style: GoogleFonts.lexend(
            fontWeight: FontWeight.w600,
            color: AppColors.darkText,
          ),
        ),
        const SizedBox(height: 6),
        Text(
          'Add an address to continue with your order.',
          textAlign: TextAlign.center,
          style: GoogleFonts.lato(
            fontSize: 13,
            color: Colors.grey.shade600,
          ),
        ),
        const SizedBox(height: 14),
        Row(
          children: <Widget>[
            Expanded(
              child: OutlinedButton.icon(
                onPressed: _addNewAddress,
                icon: const Icon(Icons.add),
                label: const Text('Add Address'),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: OutlinedButton.icon(
                onPressed:
                _isGettingLocation ? null : _useCurrentLocation,
                icon: _isGettingLocation
                    ? const SizedBox(
                  width: 17,
                  height: 17,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                  ),
                )
                    : const Icon(Icons.my_location),
                label: const Text('Current'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildSelectedAddress() {
    final AddressModel address = _selectedAddress!;

    return Material(
      color: AppColors.lightMint.withValues(alpha: 0.55),
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        borderRadius: BorderRadius.circular(16),
        onTap: _showAddressSelector,
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: AppColors.primaryGreen.withValues(alpha: 0.20),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(13),
                ),
                child: Icon(
                  _addressIcon(address.label),
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Row(
                      children: <Widget>[
                        Text(
                          _addressLabel(address),
                          style: GoogleFonts.lexend(
                            fontSize: 15,
                            fontWeight: FontWeight.w700,
                            color: AppColors.darkText,
                          ),
                        ),
                        if (address.isDefault) ...<Widget>[
                          const SizedBox(width: 8),
                          _smallBadge('Default'),
                        ],
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      address.fullAddress,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.lato(
                        fontSize: 13,
                        height: 1.4,
                        color: Colors.grey.shade700,
                      ),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: <Widget>[
                        TextButton.icon(
                          onPressed: _showAddressSelector,
                          icon: const Icon(
                            Icons.swap_horiz_rounded,
                            size: 18,
                          ),
                          label: const Text('Change'),
                          style: TextButton.styleFrom(
                            foregroundColor:
                            AppColors.primaryGreen,
                            padding: EdgeInsets.zero,
                          ),
                        ),
                        const SizedBox(width: 18),
                        TextButton.icon(
                          onPressed: _addNewAddress,
                          icon: const Icon(
                            Icons.add_location_alt_outlined,
                            size: 18,
                          ),
                          label: const Text('Add New'),
                          style: TextButton.styleFrom(
                            foregroundColor:
                            AppColors.primaryGreen,
                            padding: EdgeInsets.zero,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              const Icon(
                Icons.keyboard_arrow_right_rounded,
                color: AppColors.primaryGreen,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildOrderItemsSection(List<CartItem> items) {
    return _sectionContainer(
      title: 'Order Items',
      icon: Icons.shopping_bag_outlined,
      trailing: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 10,
          vertical: 5,
        ),
        decoration: BoxDecoration(
          color: AppColors.lightMint,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          '${items.length} Items',
          style: GoogleFonts.lato(
            fontSize: 12,
            fontWeight: FontWeight.w700,
            color: AppColors.primaryGreen,
          ),
        ),
      ),
      child: Column(
        children: <Widget>[
          ..._buildFarmerOrderGroups(items),
          const SizedBox(height: 8),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute<void>(
                    builder: (_) => const HomeScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.add_shopping_cart_outlined),
              label: const Text('Add More Products'),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primaryGreen,
                side: const BorderSide(
                  color: AppColors.primaryGreen,
                ),
                minimumSize: const Size(double.infinity, 48),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckoutProductItem(CartItem item) {
    final double itemTotal =
    (item.price * item.quantity).toDouble();

    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: <Widget>[
        ClipRRect(
          borderRadius: BorderRadius.circular(14),
          child: Container(
            width: 74,
            height: 74,
            color: AppColors.lightMint,
            child: item.image.toString().startsWith('assets/')
                ? Image.asset(
              item.image.toString(),
              fit: BoxFit.contain,
              errorBuilder: (
                  BuildContext context,
                  Object error,
                  StackTrace? stackTrace,
                  ) {
                return const Icon(
                  Icons.eco_outlined,
                  size: 34,
                  color: AppColors.primaryGreen,
                );
              },
            )
                : Image.network(
              item.image.toString(),
              fit: BoxFit.cover,
              errorBuilder: (
                  BuildContext context,
                  Object error,
                  StackTrace? stackTrace,
                  ) {
                return const Icon(
                  Icons.eco_outlined,
                  size: 34,
                  color: AppColors.primaryGreen,
                );
              },
            ),
          ),
        ),
        const SizedBox(width: 14),
        Expanded(
          child: Column(
            crossAxisAlignment:
            CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                item.displayName,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.lexend(
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                  color: AppColors.darkText,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                <String>[
                  item.farmerDisplayName,
                  item.weight.trim().isEmpty ? 'Farm fresh' : item.weight,
                ].join(' • '),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.lato(
                  fontSize: 11,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 5),
              Text(
                '₹${item.price.toStringAsFixed(0)} each',
                style: GoogleFonts.lato(
                  fontSize: 12,
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 7),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 5,
                ),
                decoration: BoxDecoration(
                  color: AppColors.lightMint,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  'Qty: ${item.quantity}',
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryGreen,
                  ),
                ),
              ),
              const SizedBox(height: 7),
              Wrap(
                spacing: 6,
                runSpacing: 6,
                children: <Widget>[
                  if (item.isQuick)
                    _smallBadge(
                      '${item.quickDeliveryText.isEmpty ? 'Quick' : item.quickDeliveryText} • '
                          'Min ${item.safeMinimumQuickQuantity}',
                    ),
                  if (item.isPreOrder)
                    _smallBadge('Pre-order'),
                  if (item.organic)
                    _smallBadge('Organic'),
                ],
              ),
              if (item.isPreOrder) ...<Widget>[
                const SizedBox(height: 7),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(9),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFFF8E1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: <Widget>[
                      if (item.harvestDate != null)
                        Text(
                          'Harvest: ${_formatCheckoutDate(item.harvestDate!)}',
                          style: GoogleFonts.lato(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      if (item.expectedDeliveryDate != null)
                        Text(
                          'Delivery: ${_formatCheckoutDate(item.expectedDeliveryDate!)}',
                          style: GoogleFonts.lato(
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      if (item.deliverySlot.trim().isNotEmpty)
                        Text(
                          'Slot: ${item.deliverySlot}',
                          style: GoogleFonts.lato(
                            color: AppColors.primaryGreen,
                            fontSize: 10,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                    ],
                  ),
                ),
              ],
            ],
          ),
        ),
        const SizedBox(width: 10),
        Text(
          '₹${itemTotal.toStringAsFixed(0)}',
          style: GoogleFonts.lexend(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: AppColors.primaryGreen,
          ),
        ),
      ],
    );
  }


  List<Widget> _buildFarmerOrderGroups(
      List<CartItem> items,
      ) {
    final Map<String, List<CartItem>> groups =
    <String, List<CartItem>>{};

    for (final CartItem item in items) {
      groups
          .putIfAbsent(
        item.farmerDisplayName,
            () => <CartItem>[],
      )
          .add(item);
    }

    final List<Widget> widgets = <Widget>[];

    for (final MapEntry<String, List<CartItem>> entry
    in groups.entries) {
      final CartItem firstItem = entry.value.first;

      widgets.add(
        _buildFarmerCheckoutHeader(
          farmName: entry.key,
          item: firstItem,
          itemCount: entry.value.fold<int>(
            0,
                (int total, CartItem item) {
              return total + item.quantity;
            },
          ),
        ),
      );
      widgets.add(const SizedBox(height: 12));

      for (int index = 0;
      index < entry.value.length;
      index++) {
        widgets.add(
          _buildCheckoutProductItem(entry.value[index]),
        );

        if (index != entry.value.length - 1) {
          widgets.add(
            Divider(
              height: 24,
              color: Colors.grey.shade200,
            ),
          );
        }
      }

      widgets.add(const SizedBox(height: 18));
    }

    return widgets;
  }

  Widget _buildFarmerCheckoutHeader({
    required String farmName,
    required CartItem item,
    required int itemCount,
  }) {
    final bool canOpenFarm = item.farmerId.trim().isNotEmpty;

    return Material(
      color: AppColors.lightCream,
      borderRadius: BorderRadius.circular(15),
      child: InkWell(
        borderRadius: BorderRadius.circular(15),
        onTap: canOpenFarm
            ? () => _openFarmerProfile(item)
            : null,
        child: Container(
          padding: const EdgeInsets.all(13),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(15),
            border: Border.all(
              color: const Color(0xFFE2EAE3),
            ),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 43,
                height: 43,
                decoration: BoxDecoration(
                  color: AppColors.lightMint,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(
                  Icons.agriculture_rounded,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      farmName,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: GoogleFonts.lexend(
                        fontSize: 13,
                        fontWeight: FontWeight.w800,
                        color: AppColors.darkText,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '$itemCount item${itemCount == 1 ? '' : 's'} from this farm',
                      style: GoogleFonts.lato(
                        color: Colors.grey.shade600,
                        fontSize: 10,
                      ),
                    ),
                  ],
                ),
              ),
              if (canOpenFarm) ...<Widget>[
                Text(
                  'View farm',
                  style: GoogleFonts.lato(
                    color: AppColors.primaryGreen,
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const Icon(
                  Icons.chevron_right_rounded,
                  color: AppColors.primaryGreen,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _openFarmerProfile(CartItem item) async {
    final NavigatorState navigator = Navigator.of(context);
    try {
      final Farmer farmer = await _farmerService.getFarmerById(
        item.farmerId,
      );

      if (!navigator.mounted) return;

      navigator.push(
        MaterialPageRoute<void>(
          builder: (_) => FarmerProfileScreen(farmer: farmer),
        ),
      );
    } catch (_) {
      _showMessage(
        'Unable to load farm details.',
        isError: true,
      );
    }
  }

  Widget _buildDeliveryInstructionSection() {
    const List<Map<String, dynamic>> options =
    <Map<String, dynamic>>[
      <String, dynamic>{
        'label': 'Call before delivery',
        'icon': Icons.call_outlined,
      },
      <String, dynamic>{
        'label': 'Leave at the door',
        'icon': Icons.door_front_door_outlined,
      },
      <String, dynamic>{
        'label': 'Ring the bell',
        'icon': Icons.notifications_active_outlined,
      },
      <String, dynamic>{
        'label': 'Hand over to me',
        'icon': Icons.person_outline_rounded,
      },
    ];

    return _sectionContainer(
      title: 'Delivery Instructions',
      icon: Icons.delivery_dining_outlined,
      child: Column(
        children: <Widget>[
          ...options.map<Widget>(
                (Map<String, dynamic> option) {
              final String label =
              option['label']! as String;
              final IconData icon =
              option['icon']! as IconData;
              final bool selected =
                  _deliveryInstruction == label;

              return Padding(
                padding: const EdgeInsets.only(bottom: 9),
                child: Material(
                  color: selected
                      ? AppColors.lightMint
                      : AppColors.lightCream,
                  borderRadius: BorderRadius.circular(13),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(13),
                    onTap: () {
                      setState(() {
                        _deliveryInstruction = label;
                      });
                    },
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(13),
                        border: Border.all(
                          color: selected
                              ? AppColors.primaryGreen
                              : Colors.grey.shade200,
                        ),
                      ),
                      child: Row(
                        children: <Widget>[
                          Icon(
                            icon,
                            color: AppColors.primaryGreen,
                          ),
                          const SizedBox(width: 11),
                          Expanded(
                            child: Text(
                              label,
                              style: GoogleFonts.lato(
                                fontWeight: FontWeight.w700,
                                color: AppColors.darkText,
                              ),
                            ),
                          ),
                          Icon(
                            selected
                                ? Icons.radio_button_checked
                                : Icons.radio_button_unchecked,
                            color: selected
                                ? AppColors.primaryGreen
                                : Colors.grey.shade400,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
          SwitchListTile.adaptive(
            contentPadding: EdgeInsets.zero,
            value: _useEcoFriendlyPacking,
            activeThumbColor: AppColors.primaryGreen,
            activeTrackColor:
            AppColors.primaryGreen.withValues(alpha: 0.35),
            title: Text(
              'Eco-friendly packing',
              style: GoogleFonts.lexend(
                fontSize: 13,
                fontWeight: FontWeight.w700,
              ),
            ),
            subtitle: Text(
              'Prefer paper bags and minimal plastic.',
              style: GoogleFonts.lato(
                fontSize: 11,
                color: Colors.grey.shade600,
              ),
            ),
            onChanged: (bool value) {
              setState(() {
                _useEcoFriendlyPacking = value;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildOrderNoteSection() {
    return _sectionContainer(
      title: 'Order Note',
      icon: Icons.edit_note_rounded,
      child: TextField(
        controller: _orderNoteController,
        minLines: 3,
        maxLines: 5,
        textCapitalization: TextCapitalization.sentences,
        decoration: InputDecoration(
          hintText:
          'Example: Please choose ripe fruits, avoid plastic packing...',
          filled: true,
          fillColor: AppColors.lightCream,
          prefixIcon: const Padding(
            padding: EdgeInsets.only(bottom: 48),
            child: Icon(
              Icons.notes_rounded,
              color: AppColors.primaryGreen,
            ),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: BorderSide(
              color: Colors.grey.shade200,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(14),
            borderSide: const BorderSide(
              color: AppColors.primaryGreen,
              width: 1.5,
            ),
          ),
        ),
      ),
    );
  }

  String _formatCheckoutDate(DateTime date) {
    const List<String> months = <String>[
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    return '${date.day.toString().padLeft(2, '0')} '
        '${months[date.month - 1]} ${date.year}';
  }

  Widget _buildPromoSection() {
    return _sectionContainer(
      title: 'Coupons & Offers',
      icon: Icons.local_offer_outlined,
      child: Column(
        children: <Widget>[
          TextField(
            controller: _promoController,
            textCapitalization: TextCapitalization.characters,
            decoration: InputDecoration(
              hintText: 'Enter promo code',
              filled: true,
              fillColor: AppColors.lightCream,
              prefixIcon: const Icon(
                Icons.discount_outlined,
                color: AppColors.primaryGreen,
              ),
              suffixIcon: TextButton(
                onPressed: () {
                  _applyPromoCode(_promoController.text);
                },
                child: Text(
                  'APPLY',
                  style: GoogleFonts.lexend(
                    fontSize: 12,
                    fontWeight: FontWeight.w700,
                    color: AppColors.primaryGreen,
                  ),
                ),
              ),
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide(
                  color: Colors.grey.shade200,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: const BorderSide(
                  color: AppColors.primaryGreen,
                  width: 1.5,
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          if (_appliedPromoCode != null)
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppColors.lightMint,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: <Widget>[
                  const Icon(
                    Icons.check_circle,
                    color: AppColors.primaryGreen,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      '$_appliedPromoCode applied. You saved ₹${_appliedDiscount.toStringAsFixed(0)}',
                      style: GoogleFonts.lato(
                        fontSize: 13,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: _removePromoCode,
                    icon: const Icon(
                      Icons.close,
                      size: 20,
                    ),
                  ),
                ],
              ),
            )
          else
            Row(
              children: <Widget>[
                Expanded(
                  child: _promoOfferCard(
                    code: 'SAVE50',
                    description: '₹50 off above ₹199',
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: _promoOfferCard(
                    code: 'FLAT20',
                    description: 'Flat ₹20 discount',
                  ),
                ),
              ],
            ),
        ],
      ),
    );
  }

  Widget _promoOfferCard({
    required String code,
    required String description,
  }) {
    return Material(
      color: AppColors.lightCream,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () {
          _promoController.text = code;
          _applyPromoCode(code);
        },
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: Colors.grey.shade200,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: <Widget>[
              Text(
                code,
                style: GoogleFonts.lexend(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                description,
                maxLines: 2,
                style: GoogleFonts.lato(
                  fontSize: 11,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDeliverySlotSection() {
    return _sectionContainer(
      title: 'Delivery Method',
      icon: Icons.route_outlined,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          _buildSelectedModeHeader(),
          const SizedBox(height: 14),
          if (_deliveryMode ==
              CheckoutDeliveryMode.quick)
            _buildQuickDeliveryPlanCard()
          else if (_deliveryMode ==
              CheckoutDeliveryMode.preOrder)
            _buildPreOrderDeliveryPlanCard()
          else
            _buildScheduledDeliveryPlanCard(),
        ],
      ),
    );
  }

  Widget _buildSelectedModeHeader() {
    late final IconData icon;
    late final Color color;
    late final Color background;
    late final String subtitle;

    switch (_deliveryMode) {
      case CheckoutDeliveryMode.quick:
        icon = Icons.bolt_rounded;
        color = AppColors.primaryGreen;
        background = const Color(0xFFEAF7ED);
        subtitle =
        'All products in this order will use Quick Delivery.';
        break;
      case CheckoutDeliveryMode.preOrder:
        icon = Icons.agriculture_rounded;
        color = const Color(0xFF6A45B8);
        background = const Color(0xFFF2ECFF);
        subtitle =
        'All products in this order will be booked for the required date.';
        break;
      case CheckoutDeliveryMode.scheduled:
        icon = Icons.calendar_month_outlined;
        color = const Color(0xFF1E88E5);
        background = const Color(0xFFEAF4FF);
        subtitle =
        'All products in this order will be delivered in one selected slot.';
        break;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: color.withValues(alpha: 0.25),
        ),
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color,
              borderRadius: BorderRadius.circular(13),
            ),
            child: Icon(icon, color: Colors.white),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  _deliveryModeTitle,
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  subtitle,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 10.5,
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }


  Widget _buildQuickDeliveryPlanCard() {
    final int eta = _maximumQuickDeliveryMinutes > 0
        ? _maximumQuickDeliveryMinutes
        : 90;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFEAF7ED),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.primaryGreen
              .withValues(alpha: 0.25),
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: AppColors.primaryGreen,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.bolt_rounded,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment:
              CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Quick Delivery',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  '${_cartService.totalItemCount} item'
                      '${_cartService.totalItemCount == 1 ? '' : 's'} '
                      'will be placed under Quick Delivery and delivered within '
                      '$eta minutes. No date or time-slot selection is required.',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 11.5,
                    height: 1.45,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          _smallBadge('$eta MIN'),
        ],
      ),
    );
  }

  Widget _buildScheduledDeliveryPlanCard() {
    const List<String> slots = <String>[
      '6:00 AM - 8:00 AM',
      '8:00 AM - 10:00 AM',
      '10:00 AM - 12:00 PM',
      '12:00 PM - 2:00 PM',
      '2:00 PM - 4:00 PM',
      '4:00 PM - 6:00 PM',
      '6:00 PM - 8:00 PM',
      '8:00 PM - 10:00 PM',
      '10:00 PM - 12:00 AM',
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFFFF8E1),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.goldAmber
              .withValues(alpha: 0.30),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Icon(
                Icons.calendar_month_outlined,
                color: AppColors.goldAmber,
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  'Normal / Scheduled Delivery',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              _smallBadge(
                '${_cartItems.length} PRODUCTS',
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Choose the day and time by which you need these products.',
            style: GoogleFonts.lato(
              color: Colors.grey.shade700,
              fontSize: 11.5,
            ),
          ),
          const SizedBox(height: 13),
          _buildDateSelector(
            label: 'Delivery date',
            selectedDate: _selectedScheduledDate,
            firstDate: DateTime.now().add(
              const Duration(days: 1),
            ),
            lastDate: DateTime.now().add(
              const Duration(days: 14),
            ),
            onSelected: (DateTime date) {
              setState(() {
                _selectedScheduledDate = date;
              });
            },
          ),
          const SizedBox(height: 12),
          _buildSlotSelector(
            slots: slots,
            selectedSlot:
            _selectedScheduledTimeSlot,
            onSelected: (String slot) {
              setState(() {
                _selectedScheduledTimeSlot = slot;
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPreOrderDeliveryPlanCard() {
    final DateTime tomorrow =
    DateTime.now().add(const Duration(days: 1));

    DateTime firstDate = tomorrow;

    for (final CartItem item in _cartItems) {
      final DateTime? harvestDate =
          item.harvestDate;

      if (harvestDate != null &&
          harvestDate.isAfter(firstDate)) {
        firstDate = harvestDate;
      }
    }

    const List<String> slots = <String>[
      '6:00 AM - 8:00 AM',
      '8:00 AM - 10:00 AM',
      '10:00 AM - 12:00 PM',
      '12:00 PM - 2:00 PM',
      '2:00 PM - 4:00 PM',
      '4:00 PM - 6:00 PM',
      '6:00 PM - 8:00 PM',
      '8:00 PM - 10:00 PM',
      '10:00 PM - 12:00 AM',
    ];

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(15),
      decoration: BoxDecoration(
        color: const Color(0xFFF2ECFF),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: const Color(0xFF7E57C2)
              .withValues(alpha: 0.25),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              const Icon(
                Icons.agriculture_outlined,
                color: Color(0xFF7E57C2),
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  'Pre-Order / Advance Booking',
                  style: GoogleFonts.lexend(
                    color: AppColors.darkText,
                    fontSize: 14,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ),
              _smallBadge(
                '${_cartService.totalItemCount} ITEMS',
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Select the particular date and time by which you need '
                'the complete order. It will be saved as an advance booking '
                'for the selected schedule.',
            style: GoogleFonts.lato(
              color: Colors.grey.shade700,
              fontSize: 11.5,
              height: 1.45,
            ),
          ),
          const SizedBox(height: 13),
          _buildDateSelector(
            label: 'Required delivery date',
            selectedDate: _selectedPreOrderDate,
            firstDate: firstDate,
            lastDate: firstDate.add(
              const Duration(days: 45),
            ),
            onSelected: (DateTime date) {
              setState(() {
                _selectedPreOrderDate = date;
              });
            },
          ),
          const SizedBox(height: 12),
          _buildSlotSelector(
            slots: slots,
            selectedSlot:
            _selectedPreOrderTimeSlot,
            onSelected: (String slot) {
              setState(() {
                _selectedPreOrderTimeSlot = slot;
              });
            },
          ),
          const SizedBox(height: 11),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.white
                  .withValues(alpha: 0.72),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              'Status after booking: Requested → Farmer Confirmed → '
                  'Harvest Scheduled → Ready → Delivered',
              style: GoogleFonts.lato(
                color: const Color(0xFF5E35B1),
                fontSize: 10.5,
                height: 1.4,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDateSelector({
    required String label,
    required DateTime? selectedDate,
    required DateTime firstDate,
    required DateTime lastDate,
    required ValueChanged<DateTime> onSelected,
  }) {
    return Material(
      color: Colors.white,
      borderRadius: BorderRadius.circular(13),
      child: InkWell(
        borderRadius: BorderRadius.circular(13),
        onTap: () async {
          final DateTime initialDate =
          selectedDate != null &&
              !selectedDate.isBefore(firstDate)
              ? selectedDate
              : firstDate;

          final DateTime? picked =
          await showDatePicker(
            context: context,
            initialDate: initialDate,
            firstDate: firstDate,
            lastDate: lastDate,
          );

          if (picked != null) {
            onSelected(picked);
          }
        },
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 13,
            vertical: 12,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(13),
            border: Border.all(
              color: selectedDate == null
                  ? Colors.grey.shade300
                  : AppColors.primaryGreen,
            ),
          ),
          child: Row(
            children: <Widget>[
              const Icon(
                Icons.event_outlined,
                color: AppColors.primaryGreen,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  selectedDate == null
                      ? label
                      : _formatCheckoutDate(
                    selectedDate,
                  ),
                  style: GoogleFonts.lato(
                    color: selectedDate == null
                        ? Colors.grey.shade600
                        : AppColors.darkText,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              const Icon(
                Icons.chevron_right_rounded,
                color: AppColors.primaryGreen,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSlotSelector({
    required List<String> slots,
    required String? selectedSlot,
    required ValueChanged<String> onSelected,
  }) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: slots.map<Widget>((String slot) {
        final bool selected =
            selectedSlot == slot;

        return ChoiceChip(
          selected: selected,
          showCheckmark: false,
          label: Text(slot),
          selectedColor: AppColors.primaryGreen,
          backgroundColor: Colors.white,
          side: BorderSide(
            color: selected
                ? AppColors.primaryGreen
                : Colors.grey.shade300,
          ),
          labelStyle: GoogleFonts.lato(
            color: selected
                ? Colors.white
                : AppColors.darkText,
            fontSize: 11,
            fontWeight: FontWeight.w700,
          ),
          onSelected: (_) => onSelected(slot),
        );
      }).toList(),
    );
  }

  Widget _buildPaymentSection() {
    return _sectionContainer(
      title: 'Payment Method',
      icon: Icons.account_balance_wallet_outlined,
      child: Column(
        children: <Widget>[
          _paymentOption(
            title: 'Cash on Delivery',
            subtitle: 'Pay when your order is delivered',
            icon: Icons.payments_outlined,
            value: 'Cash on Delivery',
          ),
          const SizedBox(height: 10),
          _paymentOption(
            title: 'UPI Payment',
            subtitle: 'Google Pay, PhonePe, Paytm and other UPI apps',
            icon: Icons.qr_code_rounded,
            value: 'UPI',
          ),
          const SizedBox(height: 10),
          _paymentOption(
            title: 'Credit / Debit Card',
            subtitle: 'Visa, Mastercard and RuPay cards',
            icon: Icons.credit_card_outlined,
            value: 'Card',
          ),
        ],
      ),
    );
  }

  Widget _paymentOption({
    required String title,
    required String subtitle,
    required IconData icon,
    required String value,
  }) {
    final bool isSelected = _paymentMethod == value;

    return Material(
      color: isSelected
          ? AppColors.lightMint
          : AppColors.lightCream,
      borderRadius: BorderRadius.circular(14),
      child: InkWell(
        borderRadius: BorderRadius.circular(14),
        onTap: () {
          setState(() {
            _paymentMethod = value;
          });
        },
        child: Container(
          padding: const EdgeInsets.all(13),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isSelected
                  ? AppColors.primaryGreen
                  : Colors.grey.shade200,
              width: isSelected ? 1.4 : 1,
            ),
          ),
          child: Row(
            children: <Widget>[
              Container(
                width: 42,
                height: 42,
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  icon,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: <Widget>[
                    Text(
                      title,
                      style: GoogleFonts.lexend(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: AppColors.darkText,
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: GoogleFonts.lato(
                        fontSize: 11,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                isSelected
                    ? Icons.radio_button_checked
                    : Icons.radio_button_unchecked,
                color: isSelected
                    ? AppColors.primaryGreen
                    : Colors.grey.shade400,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBillSummary() {
    return _sectionContainer(
      title: 'Bill Summary',
      icon: Icons.receipt_long_outlined,
      child: Column(
        children: <Widget>[
          _billRow(
            'Item Total',
            '₹${subtotal.toStringAsFixed(0)}',
          ),
          _billRow(
            'Delivery Fee',
            deliveryCharge == 0
                ? 'FREE'
                : '₹${deliveryCharge.toStringAsFixed(0)}',
            isFree: deliveryCharge == 0,
          ),
          _billRow(
            'Handling Fee',
            '₹${handlingFee.toStringAsFixed(0)}',
          ),
          if (_appliedDiscount > 0)
            _billRow(
              'Coupon Discount',
              '-₹${_appliedDiscount.toStringAsFixed(0)}',
              isDiscount: true,
            ),
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 10),
            child: Divider(
              color: Colors.grey.shade200,
            ),
          ),
          _billRow(
            'Total Amount',
            '₹${total.toStringAsFixed(0)}',
            isTotal: true,
          ),
          if (deliveryCharge == 0) ...<Widget>[
            const SizedBox(height: 12),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(11),
              decoration: BoxDecoration(
                color: AppColors.lightMint,
                borderRadius: BorderRadius.circular(11),
              ),
              child: Row(
                children: <Widget>[
                  const Icon(
                    Icons.local_shipping_outlined,
                    size: 19,
                    color: AppColors.primaryGreen,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'You unlocked free delivery on this order.',
                      style: GoogleFonts.lato(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: AppColors.primaryGreen,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildBottomOrderBar() {
    return Container(
      padding: EdgeInsets.fromLTRB(
        16,
        12,
        16,
        MediaQuery.of(context).padding.bottom + 12,
      ),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 18,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment:
              CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Total Amount',
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    color: Colors.grey.shade600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  '₹${total.toStringAsFixed(0)}',
                  style: GoogleFonts.lexend(
                    fontSize: 21,
                    fontWeight: FontWeight.w800,
                    color: AppColors.darkText,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            flex: 2,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(15),
                gradient: const LinearGradient(
                  colors: <Color>[
                    AppColors.primaryGreen,
                    AppColors.accentGreen,
                  ],
                ),
                boxShadow: <BoxShadow>[
                  BoxShadow(
                    color:
                    AppColors.primaryGreen.withValues(alpha: 0.30),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: ElevatedButton(
                onPressed:
                _isPlacingOrder ? null : _placeOrder,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  disabledBackgroundColor:
                  Colors.transparent,
                  shadowColor: Colors.transparent,
                  minimumSize:
                  const Size(double.infinity, 55),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(15),
                  ),
                ),
                child: _isPlacingOrder
                    ? const SizedBox(
                  width: 23,
                  height: 23,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2.5,
                  ),
                )
                    : Row(
                  mainAxisAlignment:
                  MainAxisAlignment.center,
                  children: <Widget>[
                    Text(
                      'Continue to Payment',
                      style: GoogleFonts.lexend(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Icon(
                      Icons.arrow_forward_rounded,
                      color: Colors.white,
                      size: 20,
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            Container(
              width: 110,
              height: 110,
              decoration: BoxDecoration(
                color: AppColors.lightMint,
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.shopping_cart_outlined,
                size: 52,
                color: AppColors.primaryGreen,
              ),
            ),
            const SizedBox(height: 22),
            Text(
              'Your cart is empty',
              style: GoogleFonts.lexend(
                fontSize: 22,
                fontWeight: FontWeight.w700,
                color: AppColors.darkText,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Add fresh products to your cart and continue shopping.',
              textAlign: TextAlign.center,
              style: GoogleFonts.lato(
                fontSize: 14,
                height: 1.5,
                color: Colors.grey.shade600,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.pushReplacement(
                  context,
                  MaterialPageRoute<void>(
                    builder: (_) => const HomeScreen(),
                  ),
                );
              },
              icon: const Icon(Icons.storefront_outlined),
              label: const Text('Continue Shopping'),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                foregroundColor: Colors.white,
                minimumSize: const Size(210, 52),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionContainer({
    required String title,
    required IconData icon,
    required Widget child,
    Widget? trailing,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Colors.grey.shade200,
        ),
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.035),
            blurRadius: 12,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: AppColors.lightMint,
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(
                  icon,
                  size: 21,
                  color: AppColors.primaryGreen,
                ),
              ),
              const SizedBox(width: 11),
              Expanded(
                child: Text(
                  title,
                  style: GoogleFonts.lexend(
                    fontSize: 17,
                    fontWeight: FontWeight.w700,
                    color: AppColors.darkText,
                  ),
                ),
              ),
              if (trailing != null) trailing,
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _billRow(
      String label,
      String amount, {
        bool isDiscount = false,
        bool isTotal = false,
        bool isFree = false,
      }) {
    Color amountColor = AppColors.darkText;

    if (isDiscount || isFree) {
      amountColor = AppColors.primaryGreen;
    }

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 7),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Text(
              label,
              style: GoogleFonts.lato(
                fontSize: isTotal ? 16 : 14,
                fontWeight: isTotal
                    ? FontWeight.w700
                    : FontWeight.w500,
                color: isTotal
                    ? AppColors.darkText
                    : Colors.grey.shade700,
              ),
            ),
          ),
          Text(
            amount,
            style: GoogleFonts.lexend(
              fontSize: isTotal ? 18 : 14,
              fontWeight: isTotal
                  ? FontWeight.w800
                  : FontWeight.w600,
              color: isTotal
                  ? AppColors.primaryGreen
                  : amountColor,
            ),
          ),
        ],
      ),
    );
  }

  Widget _smallBadge(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 3,
      ),
      decoration: BoxDecoration(
        color: AppColors.primaryGreen,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        text,
        style: GoogleFonts.lato(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: Colors.white,
        ),
      ),
    );
  }

  Widget _addressLabelChip({
    required String label,
    required IconData icon,
    required String selectedLabel,
    required VoidCallback onSelected,
  }) {
    final bool isSelected = label == selectedLabel;

    return Material(
      color: isSelected
          ? AppColors.primaryGreen
          : AppColors.lightCream,
      borderRadius: BorderRadius.circular(12),
      child: InkWell(
        onTap: onSelected,
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 10,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: isSelected
                  ? AppColors.primaryGreen
                  : Colors.grey.shade300,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              Icon(
                icon,
                size: 18,
                color: isSelected
                    ? Colors.white
                    : AppColors.primaryGreen,
              ),
              const SizedBox(width: 7),
              Text(
                label,
                style: GoogleFonts.lato(
                  fontWeight: FontWeight.w700,
                  color: isSelected
                      ? Colors.white
                      : AppColors.darkText,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  IconData _addressIcon(String? label) {
    final String normalized =
        label?.trim().toLowerCase() ?? '';

    if (normalized.contains('office')) {
      return Icons.business_outlined;
    }

    if (normalized.contains('current')) {
      return Icons.my_location;
    }

    if (normalized.contains('home')) {
      return Icons.home_outlined;
    }

    return Icons.location_on_outlined;
  }

  String _addressLabel(AddressModel address) {
    final String? label = address.label;

    if (label == null || label.trim().isEmpty) {
      return 'Delivery Address';
    }

    return label;
  }
}