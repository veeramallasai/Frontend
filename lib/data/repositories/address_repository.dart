import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/address_model.dart';

class AddressRepository {
  AddressRepository({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;
  final List<AddressModel> _addressesList = <AddressModel>[];

  Stream<List<AddressModel>> watchAddresses() async* {
    final List<AddressModel> items = await getAddresses();
    yield items;
  }

  Future<List<AddressModel>> getAddresses() async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getAddresses();
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        List<dynamic> items = <dynamic>[];
        if (raw is List) {
          items = raw;
        } else if (raw is Map && raw['content'] is List) {
          items = raw['content'] as List;
        }

        if (items.isNotEmpty) {
          final List<AddressModel> remote = items
              .whereType<Map<String, dynamic>>()
              .map((Map<String, dynamic> map) => AddressModel.fromMap(map))
              .toList(growable: true);
          _addressesList.clear();
          _addressesList.addAll(remote);
          return List<AddressModel>.unmodifiable(_addressesList);
        }
      }
    } catch (_) {}
    return List<AddressModel>.unmodifiable(_addressesList);
  }

  Future<String> saveAddress(AddressModel address) async {
    String id = address.id.trim().isNotEmpty ? address.id.trim() : 'ADDR-${DateTime.now().millisecondsSinceEpoch}';
    final AddressModel model = address.copyWith(id: id);

    if (model.isDefault) {
      for (int i = 0; i < _addressesList.length; i++) {
        _addressesList[i] = _addressesList[i].copyWith(isDefault: false);
      }
    }
    _addressesList.removeWhere((AddressModel a) => a.id == id);
    _addressesList.add(model);

    try {
      if (address.id.trim().isEmpty) {
        final ApiResponse<dynamic> response = await _apiService.createAddress(address.toMap());
        if (response.isSuccess && response.data is Map<String, dynamic>) {
          final String backendId = (response.data['id'] ?? '').toString();
          if (backendId.isNotEmpty) {
            id = backendId;
            final AddressModel updated = model.copyWith(id: backendId);
            _addressesList.removeWhere((AddressModel a) => a.id == model.id || a.id == backendId);
            _addressesList.add(updated);
          }
        }
      } else {
        await _apiService.updateAddress(address.id, address.toMap());
      }
    } catch (_) {}

    return id;
  }

  Future<void> deleteAddress(String id) async {
    _addressesList.removeWhere((AddressModel a) => a.id == id);
    try {
      await _apiService.deleteAddress(id);
    } catch (_) {}
  }

  Future<void> setDefaultAddress(String id) async {
    for (int i = 0; i < _addressesList.length; i++) {
      final AddressModel a = _addressesList[i];
      final bool isDefault = a.id == id;
      _addressesList[i] = a.copyWith(isDefault: isDefault);
      if (isDefault) {
        try {
          await _apiService.updateAddress(a.id, <String, dynamic>{'isDefault': true});
        } catch (_) {}
      }
    }
  }

  Future<void> setDefault(String id) => setDefaultAddress(id);
}
