import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';
import '../models/delivery_slot_model.dart';

class DeliveryRemoteSource {
  DeliveryRemoteSource({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  Stream<List<DeliverySlotModel>> watchSlots({
    required String method,
    DateTime? date,
  }) async* {
    final List<DeliverySlotModel> slots = await getSlots(method: method, date: date);
    yield slots;
  }

  Future<List<DeliverySlotModel>> getSlots({
    required String method,
    DateTime? date,
  }) async {
    try {
      final ApiResponse<dynamic> response = await _apiService.getDeliverySlots(method: method);
      if (response.isSuccess && response.data != null) {
        final dynamic raw = response.data;
        List<dynamic> items = <dynamic>[];
        if (raw is List) {
          items = raw;
        } else if (raw is Map && raw['content'] is List) {
          items = raw['content'] as List;
        }
        if (items.isNotEmpty) {
          return items
              .whereType<Map<String, dynamic>>()
              .map((Map<String, dynamic> map) => DeliverySlotModel.fromMap(map))
              .where((DeliverySlotModel s) => s.method.toLowerCase() == method.toLowerCase())
              .toList(growable: false);
        }
      }
    } catch (_) {}

    return <DeliverySlotModel>[];
  }

  Future<void> reserveSlot(String slotId) async {}
}
