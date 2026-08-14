import 'dart:async';

import 'package:flutter/foundation.dart';

import '../data/models/address_model.dart';
import '../data/repositories/address_repository.dart';

class AddressProvider extends ChangeNotifier {
  AddressProvider({AddressRepository? repository})
      : _repository = repository ?? AddressRepository();

  final AddressRepository _repository;
  StreamSubscription<List<AddressModel>>? _subscription;
  List<AddressModel> _addresses = <AddressModel>[];
  String _selectedAddressId = '';
  bool _isLoading = false;
  bool _isUpdating = false;
  String? _errorMessage;
  bool _disposed = false;

  List<AddressModel> get addresses => List<AddressModel>.unmodifiable(_addresses);
  bool get isLoading => _isLoading;
  bool get isUpdating => _isUpdating;
  String? get errorMessage => _errorMessage;
  String get selectedAddressId => _selectedAddressId;
  AddressModel? get selectedAddress {
    for (final AddressModel address in _addresses) {
      if (address.id == _selectedAddressId) return address;
    }
    return null;
  }

  void listenToAddresses() {
    _subscription?.cancel();
    _isLoading = true;
    _errorMessage = null;
    _notify();
    try {
      _subscription = _repository.watchAddresses().listen(
            (List<AddressModel> values) {
          if (_disposed) return;
          _addresses = List<AddressModel>.from(values);
          final bool selectionExists = values.any(
                (AddressModel item) => item.id == _selectedAddressId,
          );
          if (!selectionExists && values.isNotEmpty) {
            _selectedAddressId = values.firstWhere(
                  (AddressModel item) => item.isDefault,
              orElse: () => values.first,
            ).id;
          } else if (values.isEmpty) {
            _selectedAddressId = '';
          }
          _isLoading = false;
          _errorMessage = null;
          _notify();
        },
        onError: (Object error, StackTrace stackTrace) {
          if (_disposed) return;
          _isLoading = false;
          _errorMessage = _friendlyError(error);
          _notify();
        },
      );
    } catch (error) {
      _isLoading = false;
      _errorMessage = _friendlyError(error);
      _notify();
    }
  }

  void selectAddress(String addressId) {
    _selectedAddressId = addressId.trim();
    _notify();
  }

  Future<bool> deleteAddress(String addressId) =>
      _run(() => _repository.deleteAddress(addressId));
  Future<bool> setDefault(String addressId) =>
      _run(() => _repository.setDefault(addressId));

  Future<bool> _run(Future<void> Function() action) async {
    if (_isUpdating) return false;
    _isUpdating = true;
    _errorMessage = null;
    _notify();
    try {
      await action();
      return true;
    } catch (error) {
      _errorMessage = _friendlyError(error);
      return false;
    } finally {
      _isUpdating = false;
      _notify();
    }
  }

  void _notify() {
    if (!_disposed) notifyListeners();
  }

  String _friendlyError(Object error) {
    String message = error.toString().trim();
    if (message.startsWith('Bad state: ')) message = message.substring(11);
    return message.isEmpty ? 'Unable to update address.' : message;
  }

  @override
  void dispose() {
    _disposed = true;
    _subscription?.cancel();
    super.dispose();
  }
}
