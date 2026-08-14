import 'dart:async';

import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

import '../../core/theme/app_theme.dart';
import '../../models/address_model.dart';
import '../../services/address_service.dart';

class AddressManagementScreen extends StatefulWidget {
  const AddressManagementScreen({super.key});

  @override
  State<AddressManagementScreen> createState() =>
      _AddressManagementScreenState();
}

class _AddressManagementScreenState
    extends State<AddressManagementScreen> {
  final AddressService _addressService = AddressService();

  StreamSubscription<List<AddressModel>>? _addressSubscription;

  List<AddressModel> _addresses = <AddressModel>[];

  bool _isLoading = true;
  String? _errorMessage;

  User? get _currentUser =>
      FirebaseAuth.instance.currentUser;

  @override
  void initState() {
    super.initState();
    _listenToAddresses();
  }

  void _listenToAddresses() {
    final User? user = _currentUser;

    if (user == null) {
      setState(() {
        _isLoading = false;
        _errorMessage =
        'Please login to manage your saved addresses.';
      });

      return;
    }

    _addressSubscription?.cancel();

    _addressSubscription = _addressService
        .getUserAddresses(user.uid)
        .listen(
          (List<AddressModel> addresses) {
        if (!mounted) {
          return;
        }

        setState(() {
          _addresses = addresses;
          _isLoading = false;
          _errorMessage = null;
        });
      },
      onError: (Object error) {
        if (!mounted) {
          return;
        }

        setState(() {
          _isLoading = false;
          _errorMessage =
          'Unable to load saved addresses. Please try again.';
        });
      },
    );
  }

  void _showMessage({
    required String message,
    required bool isError,
  }) {
    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          elevation: 12,
          backgroundColor: isError
              ? const Color(0xFFB3261E)
              : AppColors.primaryGreen,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          content: Row(
            children: [
              Icon(
                isError
                    ? Icons.error_outline_rounded
                    : Icons.check_circle_outline_rounded,
                color: Colors.white,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  message,
                  style: GoogleFonts.lato(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
  }

  Future<void> _openAddressForm({
    AddressModel? existingAddress,
  }) async {
    final User? user = _currentUser;

    if (user == null) {
      _showMessage(
        message:
        'Please login before adding an address.',
        isError: true,
      );

      return;
    }

    final bool isEditing = existingAddress != null;

    final GlobalKey<FormState> formKey =
    GlobalKey<FormState>();

    final TextEditingController fullNameController =
    TextEditingController(
      text: existingAddress?.fullName ?? '',
    );

    final TextEditingController phoneController =
    TextEditingController(
      text: existingAddress?.phone ?? '',
    );

    final TextEditingController houseNoController =
    TextEditingController(
      text: existingAddress?.houseNo ?? '',
    );

    final TextEditingController areaController =
    TextEditingController(
      text: existingAddress?.area ?? '',
    );

    final TextEditingController landmarkController =
    TextEditingController(
      text: existingAddress?.landmark ?? '',
    );

    final TextEditingController cityController =
    TextEditingController(
      text: existingAddress?.city ?? '',
    );

    final TextEditingController stateController =
    TextEditingController(
      text: existingAddress?.state ?? '',
    );

    final TextEditingController pincodeController =
    TextEditingController(
      text: existingAddress?.pincode ?? '',
    );

    String selectedLabel =
    existingAddress?.label?.trim().isNotEmpty == true
        ? existingAddress!.label!.trim()
        : 'Home';

    bool makeDefault =
        existingAddress?.isDefault ??
            _addresses.isEmpty;

    bool isSaving = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext sheetContext) {
        return StatefulBuilder(
          builder: (
              BuildContext context,
              void Function(void Function()) setSheetState,
              ) {
            Future<void> saveAddress() async {
              FocusScope.of(context).unfocus();

              final bool valid =
                  formKey.currentState?.validate() ??
                      false;

              if (!valid || isSaving) {
                return;
              }

              setSheetState(() {
                isSaving = true;
              });

              final String fullName =
              fullNameController.text.trim();

              final String phone =
              phoneController.text.trim();

              final String houseNo =
              houseNoController.text.trim();

              final String area =
              areaController.text.trim();

              final String landmark =
              landmarkController.text.trim();

              final String city =
              cityController.text.trim();

              final String state =
              stateController.text.trim();

              final String pincode =
              pincodeController.text.trim();

              final List<String> addressParts =
              <String>[
                houseNo,
                area,
                if (landmark.isNotEmpty) landmark,
                city,
                state,
                pincode,
              ];

              final String fullAddress =
              addressParts.join(', ');

              try {
                if (isEditing) {
                  final AddressModel updatedAddress =
                  existingAddress.copyWith(
                    fullName: fullName,
                    phone: phone,
                    houseNo: houseNo,
                    area: area,
                    landmark: landmark,
                    city: city,
                    state: state,
                    pincode: pincode,
                    fullAddress: fullAddress,
                    label: selectedLabel,
                    isDefault: makeDefault,
                  );

                  await _addressService
                      .updateAddressModel(
                    updatedAddress,
                  );

                  if (makeDefault &&
                      existingAddress.id != null) {
                    await _addressService.setDefault(
                      user.uid,
                      existingAddress.id!,
                    );
                  }
                } else {
                  final AddressModel newAddress =
                  AddressModel(
                    userId: user.uid,
                    fullAddress: fullAddress,
                    label: selectedLabel,
                    isDefault:
                    makeDefault || _addresses.isEmpty,
                    fullName: fullName,
                    phone: phone,
                    houseNo: houseNo,
                    area: area,
                    landmark: landmark,
                    city: city,
                    state: state,
                    pincode: pincode,
                  );

                  await _addressService.addAddress(
                    newAddress,
                  );
                }

                if (!sheetContext.mounted) {
                  return;
                }

                Navigator.of(sheetContext).pop();

                _showMessage(
                  message: isEditing
                      ? 'Address updated successfully.'
                      : 'Address added successfully.',
                  isError: false,
                );
              } catch (error) {
                _showMessage(
                  message: isEditing
                      ? 'Unable to update the address.'
                      : 'Unable to add the address.',
                  isError: true,
                );
              } finally {
                if (sheetContext.mounted) {
                  setSheetState(() {
                    isSaving = false;
                  });
                }
              }
            }

            return Container(
              constraints: BoxConstraints(
                maxHeight:
                MediaQuery.sizeOf(context).height *
                    0.94,
              ),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(
                  top: Radius.circular(30),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    width: 46,
                    height: 5,
                    margin: const EdgeInsets.only(
                      top: 12,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius:
                      BorderRadius.circular(20),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.fromLTRB(
                      22,
                      18,
                      14,
                      14,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: const Color(
                              0xFFEAF5EB,
                            ),
                            borderRadius:
                            BorderRadius.circular(
                              15,
                            ),
                          ),
                          child: Icon(
                            isEditing
                                ? Icons.edit_location_alt_rounded
                                : Icons.add_location_alt_rounded,
                            color:
                            AppColors.primaryGreen,
                            size: 27,
                          ),
                        ),
                        const SizedBox(width: 13),
                        Expanded(
                          child: Column(
                            crossAxisAlignment:
                            CrossAxisAlignment.start,
                            children: [
                              Text(
                                isEditing
                                    ? 'Edit Address'
                                    : 'Add New Address',
                                style: GoogleFonts.lexend(
                                  fontSize: 20,
                                  fontWeight:
                                  FontWeight.w700,
                                  color: AppColors.darkText,
                                ),
                              ),
                              const SizedBox(height: 3),
                              Text(
                                'Enter complete delivery details',
                                style: GoogleFonts.lato(
                                  color:
                                  Colors.grey.shade600,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                        IconButton(
                          tooltip: 'Close',
                          onPressed: isSaving
                              ? null
                              : () {
                            Navigator.of(
                              sheetContext,
                            ).pop();
                          },
                          icon: const Icon(
                            Icons.close_rounded,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Divider(
                    height: 1,
                    color: Colors.grey.shade200,
                  ),
                  Expanded(
                    child: Form(
                      key: formKey,
                      child: SingleChildScrollView(
                        keyboardDismissBehavior:
                        ScrollViewKeyboardDismissBehavior
                            .onDrag,
                        padding:
                        EdgeInsets.fromLTRB(
                          22,
                          20,
                          22,
                          MediaQuery.viewInsetsOf(
                            context,
                          ).bottom +
                              24,
                        ),
                        child: Column(
                          crossAxisAlignment:
                          CrossAxisAlignment.start,
                          children: [
                            _buildSectionTitle(
                              'Contact Details',
                            ),
                            const SizedBox(height: 12),
                            _buildTextField(
                              controller:
                              fullNameController,
                              label: 'Full Name',
                              hint:
                              'Enter receiver name',
                              icon:
                              Icons.person_outline_rounded,
                              textInputAction:
                              TextInputAction.next,
                              validator: (String? value) {
                                if (value == null ||
                                    value
                                        .trim()
                                        .isEmpty) {
                                  return 'Full name is required';
                                }

                                if (value.trim().length <
                                    3) {
                                  return 'Enter a valid full name';
                                }

                                return null;
                              },
                            ),
                            const SizedBox(height: 14),
                            _buildTextField(
                              controller:
                              phoneController,
                              label: 'Mobile Number',
                              hint:
                              'Enter 10-digit mobile number',
                              icon:
                              Icons.phone_android_rounded,
                              keyboardType:
                              TextInputType.phone,
                              textInputAction:
                              TextInputAction.next,
                              maxLength: 10,
                              validator: (String? value) {
                                final String phone =
                                    value?.trim() ?? '';

                                if (!RegExp(
                                  r'^[6-9][0-9]{9}$',
                                ).hasMatch(phone)) {
                                  return 'Enter a valid 10-digit Indian mobile number';
                                }

                                return null;
                              },
                            ),
                            const SizedBox(height: 22),
                            _buildSectionTitle(
                              'Address Details',
                            ),
                            const SizedBox(height: 12),
                            _buildTextField(
                              controller:
                              houseNoController,
                              label:
                              'House / Flat Number',
                              hint:
                              'Example: Flat 202, Door No. 4-15',
                              icon: Icons
                                  .home_outlined,
                              textInputAction:
                              TextInputAction.next,
                              validator: _requiredValidator(
                                'House or flat number',
                              ),
                            ),
                            const SizedBox(height: 14),
                            _buildTextField(
                              controller:
                              areaController,
                              label:
                              'Area / Street / Locality',
                              hint:
                              'Enter street and locality',
                              icon: Icons
                                  .location_on_outlined,
                              textInputAction:
                              TextInputAction.next,
                              validator: _requiredValidator(
                                'Area or locality',
                              ),
                            ),
                            const SizedBox(height: 14),
                            _buildTextField(
                              controller:
                              landmarkController,
                              label:
                              'Landmark (Optional)',
                              hint:
                              'Example: Near city hospital',
                              icon: Icons
                                  .signpost_outlined,
                              textInputAction:
                              TextInputAction.next,
                            ),
                            const SizedBox(height: 14),
                            Row(
                              crossAxisAlignment:
                              CrossAxisAlignment.start,
                              children: [
                                Expanded(
                                  child: _buildTextField(
                                    controller:
                                    cityController,
                                    label: 'City',
                                    hint: 'City',
                                    icon: Icons
                                        .location_city_outlined,
                                    textInputAction:
                                    TextInputAction
                                        .next,
                                    validator:
                                    _requiredValidator(
                                      'City',
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _buildTextField(
                                    controller:
                                    stateController,
                                    label: 'State',
                                    hint: 'State',
                                    icon: Icons
                                        .map_outlined,
                                    textInputAction:
                                    TextInputAction
                                        .next,
                                    validator:
                                    _requiredValidator(
                                      'State',
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 14),
                            _buildTextField(
                              controller:
                              pincodeController,
                              label: 'Pincode',
                              hint:
                              'Enter 6-digit pincode',
                              icon:
                              Icons.pin_drop_outlined,
                              keyboardType:
                              TextInputType.number,
                              textInputAction:
                              TextInputAction.done,
                              maxLength: 6,
                              validator: (String? value) {
                                final String pincode =
                                    value?.trim() ?? '';

                                if (!RegExp(
                                  r'^[1-9][0-9]{5}$',
                                ).hasMatch(pincode)) {
                                  return 'Enter a valid 6-digit pincode';
                                }

                                return null;
                              },
                            ),
                            const SizedBox(height: 22),
                            _buildSectionTitle(
                              'Address Type',
                            ),
                            const SizedBox(height: 12),
                            Wrap(
                              spacing: 10,
                              runSpacing: 10,
                              children: <String>[
                                'Home',
                                'Office',
                                'Other',
                              ].map(
                                    (String label) {
                                  final bool selected =
                                      selectedLabel ==
                                          label;

                                  return ChoiceChip(
                                    selected: selected,
                                    showCheckmark: true,
                                    checkmarkColor:
                                    Colors.white,
                                    selectedColor:
                                    AppColors
                                        .primaryGreen,
                                    backgroundColor:
                                    const Color(
                                      0xFFF4F7F4,
                                    ),
                                    side: BorderSide(
                                      color: selected
                                          ? AppColors
                                          .primaryGreen
                                          : const Color(
                                        0xFFDDE6DE,
                                      ),
                                    ),
                                    avatar: Icon(
                                      _labelIcon(label),
                                      size: 18,
                                      color: selected
                                          ? Colors.white
                                          : AppColors
                                          .primaryGreen,
                                    ),
                                    label: Text(
                                      label,
                                      style:
                                      GoogleFonts.lato(
                                        color: selected
                                            ? Colors.white
                                            : AppColors
                                            .darkText,
                                        fontWeight:
                                        FontWeight
                                            .w700,
                                      ),
                                    ),
                                    onSelected: isSaving
                                        ? null
                                        : (_) {
                                      setSheetState(
                                            () {
                                          selectedLabel =
                                              label;
                                        },
                                      );
                                    },
                                  );
                                },
                              ).toList(),
                            ),
                            const SizedBox(height: 18),
                            Container(
                              padding:
                              const EdgeInsets.all(
                                14,
                              ),
                              decoration: BoxDecoration(
                                color: const Color(
                                  0xFFF2F8F2,
                                ),
                                borderRadius:
                                BorderRadius.circular(
                                  16,
                                ),
                                border: Border.all(
                                  color: const Color(
                                    0xFFD9E9DA,
                                  ),
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons
                                        .verified_user_outlined,
                                    color: AppColors
                                        .primaryGreen,
                                  ),
                                  const SizedBox(width: 11),
                                  Expanded(
                                    child: Text(
                                      'Set this as my default delivery address',
                                      style:
                                      GoogleFonts.lato(
                                        color: AppColors
                                            .darkText,
                                        fontWeight:
                                        FontWeight
                                            .w700,
                                      ),
                                    ),
                                  ),
                                  Switch(
                                    value: makeDefault,
                                    activeColor:
                                    AppColors
                                        .primaryGreen,
                                    onChanged: isSaving
                                        ? null
                                        : (bool value) {
                                      setSheetState(
                                            () {
                                          makeDefault =
                                              value;
                                        },
                                      );
                                    },
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),
                            SizedBox(
                              width: double.infinity,
                              height: 56,
                              child: ElevatedButton(
                                onPressed: isSaving
                                    ? null
                                    : saveAddress,
                                style:
                                ElevatedButton.styleFrom(
                                  elevation: 0,
                                  backgroundColor:
                                  AppColors
                                      .primaryGreen,
                                  disabledBackgroundColor:
                                  AppColors
                                      .primaryGreen
                                      .withValues(alpha:
                                  0.55,
                                  ),
                                  foregroundColor:
                                  Colors.white,
                                  shape:
                                  RoundedRectangleBorder(
                                    borderRadius:
                                    BorderRadius
                                        .circular(17),
                                  ),
                                ),
                                child: isSaving
                                    ? const SizedBox(
                                  width: 24,
                                  height: 24,
                                  child:
                                  CircularProgressIndicator(
                                    strokeWidth: 2.6,
                                    color:
                                    Colors.white,
                                  ),
                                )
                                    : Row(
                                  mainAxisAlignment:
                                  MainAxisAlignment
                                      .center,
                                  children: [
                                    Icon(
                                      isEditing
                                          ? Icons
                                          .save_outlined
                                          : Icons
                                          .add_location_alt_outlined,
                                    ),
                                    const SizedBox(
                                      width: 10,
                                    ),
                                    Text(
                                      isEditing
                                          ? 'UPDATE ADDRESS'
                                          : 'SAVE ADDRESS',
                                      style:
                                      GoogleFonts
                                          .lexend(
                                        fontSize: 14,
                                        fontWeight:
                                        FontWeight
                                            .w700,
                                        letterSpacing:
                                        0.5,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        );
      },
    );

    fullNameController.dispose();
    phoneController.dispose();
    houseNoController.dispose();
    areaController.dispose();
    landmarkController.dispose();
    cityController.dispose();
    stateController.dispose();
    pincodeController.dispose();
  }

  String? Function(String?) _requiredValidator(
      String fieldName,
      ) {
    return (String? value) {
      if (value == null || value.trim().isEmpty) {
        return '$fieldName is required';
      }

      return null;
    };
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: GoogleFonts.lexend(
        fontSize: 15,
        fontWeight: FontWeight.w700,
        color: AppColors.darkText,
      ),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required String hint,
    required IconData icon,
    TextInputType keyboardType =
        TextInputType.text,
    TextInputAction textInputAction =
        TextInputAction.next,
    int? maxLength,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      textInputAction: textInputAction,
      maxLength: maxLength,
      validator: validator,
      autocorrect: true,
      enableSuggestions: true,
      decoration: InputDecoration(
        labelText: label,
        hintText: hint,
        counterText: '',
        prefixIcon: Icon(
          icon,
          color: AppColors.primaryGreen,
        ),
        labelStyle: GoogleFonts.lato(
          color: Colors.grey.shade600,
          fontWeight: FontWeight.w600,
        ),
        hintStyle: GoogleFonts.lato(
          color: Colors.grey.shade400,
          fontSize: 13,
        ),
        filled: true,
        fillColor: const Color(0xFFF8FAF8),
        contentPadding:
        const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 18,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(
            color: Color(0xFFDDE6DE),
          ),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(
            color: AppColors.primaryGreen,
            width: 1.7,
          ),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(
            color: Colors.redAccent,
          ),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(16),
          borderSide: const BorderSide(
            color: Colors.red,
            width: 1.5,
          ),
        ),
      ),
    );
  }

  IconData _labelIcon(String? label) {
    switch (label?.toLowerCase()) {
      case 'office':
        return Icons.business_center_outlined;

      case 'other':
        return Icons.location_on_outlined;

      case 'home':
      default:
        return Icons.home_outlined;
    }
  }

  Future<void> _setDefaultAddress(
      AddressModel address,
      ) async {
    final User? user = _currentUser;

    if (user == null || address.id == null) {
      return;
    }

    if (address.isDefault) {
      _showMessage(
        message:
        'This is already your default address.',
        isError: false,
      );

      return;
    }

    try {
      await _addressService.setDefault(
        user.uid,
        address.id!,
      );

      _showMessage(
        message: 'Default address updated.',
        isError: false,
      );
    } catch (_) {
      _showMessage(
        message:
        'Unable to update the default address.',
        isError: true,
      );
    }
  }

  Future<void> _confirmDelete(
      AddressModel address,
      ) async {
    if (address.id == null) {
      return;
    }

    final bool? shouldDelete =
    await showDialog<bool>(
      context: context,
      builder: (BuildContext dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(24),
          ),
          title: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFFFECEB),
                  borderRadius:
                  BorderRadius.circular(13),
                ),
                child: const Icon(
                  Icons.delete_outline_rounded,
                  color: Color(0xFFB3261E),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  'Delete Address?',
                  style: GoogleFonts.lexend(
                    fontSize: 19,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ],
          ),
          content: Text(
            address.isDefault
                ? 'This is your default address. If deleted, another saved address will automatically become default.'
                : 'This address will be permanently removed from your saved addresses.',
            style: GoogleFonts.lato(
              color: Colors.grey.shade700,
              fontSize: 14,
              height: 1.45,
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(
                  false,
                );
              },
              child: Text(
                'CANCEL',
                style: GoogleFonts.lato(
                  color: Colors.grey.shade700,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: () {
                Navigator.of(dialogContext).pop(
                  true,
                );
              },
              style: ElevatedButton.styleFrom(
                elevation: 0,
                backgroundColor:
                const Color(0xFFB3261E),
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius:
                  BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'DELETE',
                style: GoogleFonts.lato(
                  fontWeight: FontWeight.w800,
                ),
              ),
            ),
          ],
        );
      },
    );

    if (shouldDelete != true) {
      return;
    }

    try {
      await _addressService.deleteAddress(
        address.id!,
      );

      _showMessage(
        message: 'Address deleted successfully.',
        isError: false,
      );
    } catch (_) {
      _showMessage(
        message: 'Unable to delete the address.',
        isError: true,
      );
    }
  }

  Widget _buildAddressCard(
      AddressModel address,
      ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
          color: address.isDefault
              ? AppColors.primaryGreen
              : const Color(0xFFE1E8E2),
          width: address.isDefault ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.055),
            blurRadius: 22,
            offset: const Offset(0, 9),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment:
        CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment:
            CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: address.isDefault
                      ? AppColors.primaryGreen
                      : const Color(0xFFEAF5EB),
                  borderRadius:
                  BorderRadius.circular(15),
                ),
                child: Icon(
                  _labelIcon(address.label),
                  color: address.isDefault
                      ? Colors.white
                      : AppColors.primaryGreen,
                  size: 25,
                ),
              ),
              const SizedBox(width: 13),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                  CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            address.label
                                ?.trim()
                                .isNotEmpty ==
                                true
                                ? address.label!.trim()
                                : 'Address',
                            style: GoogleFonts.lexend(
                              color:
                              AppColors.darkText,
                              fontSize: 16,
                              fontWeight:
                              FontWeight.w700,
                            ),
                          ),
                        ),
                        if (address.isDefault) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding:
                            const EdgeInsets.symmetric(
                              horizontal: 9,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: const Color(
                                0xFFE6F4E8,
                              ),
                              borderRadius:
                              BorderRadius.circular(
                                20,
                              ),
                            ),
                            child: Text(
                              'DEFAULT',
                              style: GoogleFonts.lato(
                                color: AppColors
                                    .primaryGreen,
                                fontSize: 10,
                                fontWeight:
                                FontWeight.w800,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                    if (address.fullName
                        ?.trim()
                        .isNotEmpty ==
                        true) ...[
                      const SizedBox(height: 5),
                      Text(
                        address.fullName!.trim(),
                        style: GoogleFonts.lato(
                          color: const Color(
                            0xFF36443B,
                          ),
                          fontSize: 14,
                          fontWeight:
                          FontWeight.w700,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              PopupMenuButton<String>(
                tooltip: 'Address options',
                shape: RoundedRectangleBorder(
                  borderRadius:
                  BorderRadius.circular(16),
                ),
                onSelected: (String value) {
                  switch (value) {
                    case 'edit':
                      _openAddressForm(
                        existingAddress: address,
                      );
                      break;

                    case 'default':
                      _setDefaultAddress(address);
                      break;

                    case 'delete':
                      _confirmDelete(address);
                      break;
                  }
                },
                itemBuilder:
                    (BuildContext context) {
                  return [
                    PopupMenuItem<String>(
                      value: 'edit',
                      child: Row(
                        children: [
                          const Icon(
                            Icons.edit_outlined,
                            color: AppColors
                                .primaryGreen,
                          ),
                          const SizedBox(width: 11),
                          Text(
                            'Edit address',
                            style: GoogleFonts.lato(
                              fontWeight:
                              FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                    if (!address.isDefault)
                      PopupMenuItem<String>(
                        value: 'default',
                        child: Row(
                          children: [
                            const Icon(
                              Icons
                                  .check_circle_outline_rounded,
                              color: AppColors
                                  .primaryGreen,
                            ),
                            const SizedBox(width: 11),
                            Text(
                              'Set as default',
                              style:
                              GoogleFonts.lato(
                                fontWeight:
                                FontWeight.w700,
                              ),
                            ),
                          ],
                        ),
                      ),
                    PopupMenuItem<String>(
                      value: 'delete',
                      child: Row(
                        children: [
                          const Icon(
                            Icons
                                .delete_outline_rounded,
                            color:
                            Color(0xFFB3261E),
                          ),
                          const SizedBox(width: 11),
                          Text(
                            'Delete address',
                            style: GoogleFonts.lato(
                              color: const Color(
                                0xFFB3261E,
                              ),
                              fontWeight:
                              FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ];
                },
                icon: Icon(
                  Icons.more_vert_rounded,
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Divider(
            height: 1,
            color: Colors.grey.shade200,
          ),
          const SizedBox(height: 14),
          Row(
            crossAxisAlignment:
            CrossAxisAlignment.start,
            children: [
              Icon(
                Icons.location_on_outlined,
                size: 20,
                color: Colors.grey.shade600,
              ),
              const SizedBox(width: 9),
              Expanded(
                child: Text(
                  address.fullAddress,
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 14,
                    height: 1.5,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          if (address.phone?.trim().isNotEmpty ==
              true) ...[
            const SizedBox(height: 10),
            Row(
              children: [
                Icon(
                  Icons.phone_outlined,
                  size: 19,
                  color: Colors.grey.shade600,
                ),
                const SizedBox(width: 9),
                Text(
                  '+91 ${address.phone!.trim()}',
                  style: GoogleFonts.lato(
                    color: Colors.grey.shade700,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ],
          if (!address.isDefault) ...[
            const SizedBox(height: 15),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  _setDefaultAddress(address);
                },
                style: OutlinedButton.styleFrom(
                  foregroundColor:
                  AppColors.primaryGreen,
                  side: const BorderSide(
                    color: AppColors.primaryGreen,
                  ),
                  padding:
                  const EdgeInsets.symmetric(
                    vertical: 12,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius:
                    BorderRadius.circular(13),
                  ),
                ),
                icon: const Icon(
                  Icons
                      .check_circle_outline_rounded,
                  size: 20,
                ),
                label: Text(
                  'SET AS DEFAULT',
                  style: GoogleFonts.lato(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    letterSpacing: 0.5,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment:
          MainAxisAlignment.center,
          children: [
            Container(
              width: 120,
              height: 120,
              decoration: BoxDecoration(
                color: const Color(0xFFEAF5EB),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: AppColors.primaryGreen
                        .withValues(alpha: 0.12),
                    blurRadius: 28,
                    offset: const Offset(0, 12),
                  ),
                ],
              ),
              child: const Icon(
                Icons.location_off_outlined,
                color: AppColors.primaryGreen,
                size: 58,
              ),
            ),
            const SizedBox(height: 25),
            Text(
              'No Saved Addresses',
              textAlign: TextAlign.center,
              style: GoogleFonts.lexend(
                color: AppColors.darkText,
                fontSize: 22,
                fontWeight: FontWeight.w700,
              ),
            ),
            const SizedBox(height: 9),
            Text(
              'Add your delivery address to make checkout faster and easier.',
              textAlign: TextAlign.center,
              style: GoogleFonts.lato(
                color: Colors.grey.shade600,
                fontSize: 14,
                height: 1.5,
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: _openAddressForm,
              style: ElevatedButton.styleFrom(
                elevation: 0,
                backgroundColor:
                AppColors.primaryGreen,
                foregroundColor: Colors.white,
                padding:
                const EdgeInsets.symmetric(
                  horizontal: 22,
                  vertical: 15,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius:
                  BorderRadius.circular(15),
                ),
              ),
              icon: const Icon(
                Icons.add_location_alt_outlined,
              ),
              label: Text(
                'ADD DELIVERY ADDRESS',
                style: GoogleFonts.lexend(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisAlignment:
          MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline_rounded,
              size: 64,
              color: Color(0xFFB3261E),
            ),
            const SizedBox(height: 18),
            Text(
              _errorMessage ??
                  'Unable to load addresses.',
              textAlign: TextAlign.center,
              style: GoogleFonts.lato(
                color: Colors.grey.shade700,
                fontSize: 15,
                height: 1.4,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 18),
            OutlinedButton.icon(
              onPressed: () {
                setState(() {
                  _isLoading = true;
                  _errorMessage = null;
                });

                _listenToAddresses();
              },
              icon: const Icon(
                Icons.refresh_rounded,
              ),
              label: const Text('Try Again'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _addressSubscription?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF6F8F6),
      appBar: AppBar(
        elevation: 0,
        backgroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        leading: IconButton(
          tooltip: 'Back',
          onPressed: () {
            Navigator.of(context).pop();
          },
          icon: const Icon(
            Icons.arrow_back_ios_new_rounded,
            color: AppColors.darkText,
          ),
        ),
        title: Column(
          crossAxisAlignment:
          CrossAxisAlignment.start,
          children: [
            Text(
              'Saved Addresses',
              style: GoogleFonts.lexend(
                fontSize: 20,
                fontWeight: FontWeight.w700,
                color: AppColors.darkText,
              ),
            ),
            Text(
              '${_addresses.length} saved',
              style: GoogleFonts.lato(
                fontSize: 12,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(
        child: CircularProgressIndicator(
          color: AppColors.primaryGreen,
        ),
      )
          : _errorMessage != null
          ? _buildErrorState()
          : _addresses.isEmpty
          ? _buildEmptyState()
          : RefreshIndicator(
        color:
        AppColors.primaryGreen,
        onRefresh: () async {
          _listenToAddresses();

          await Future<void>.delayed(
            const Duration(
              milliseconds: 500,
            ),
          );
        },
        child: ListView(
          physics:
          const AlwaysScrollableScrollPhysics(),
          padding:
          const EdgeInsets.fromLTRB(
            16,
            18,
            16,
            100,
          ),
          children: [
            Container(
              padding:
              const EdgeInsets.all(
                15,
              ),
              margin:
              const EdgeInsets.only(
                bottom: 16,
              ),
              decoration: BoxDecoration(
                gradient:
                const LinearGradient(
                  colors: [
                    AppColors
                        .primaryGreen,
                    AppColors
                        .accentGreen,
                  ],
                ),
                borderRadius:
                BorderRadius.circular(
                  18,
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons
                        .local_shipping_outlined,
                    color: Colors.white,
                    size: 27,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Your default address will be automatically selected during checkout.',
                      style:
                      GoogleFonts.lato(
                        color: Colors.white,
                        fontSize: 13,
                        height: 1.35,
                        fontWeight:
                        FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            ..._addresses.map(
              _buildAddressCard,
            ),
          ],
        ),
      ),
      floatingActionButton:
      _addresses.isEmpty || _isLoading
          ? null
          : FloatingActionButton.extended(
        onPressed: _openAddressForm,
        backgroundColor:
        AppColors.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 8,
        icon: const Icon(
          Icons.add_location_alt_outlined,
        ),
        label: Text(
          'ADD ADDRESS',
          style: GoogleFonts.lexend(
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
      ),
    );
  }
}