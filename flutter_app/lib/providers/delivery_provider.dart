import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../constants/api_endpoints.dart';
import '../models/delivery_models.dart';
import '../services/api_client.dart';

class DeliveryProvider with ChangeNotifier {
  final String _token;
  List<DeliverySlot> _availableSlots = [];
  bool _isLoading = false;

  DateTime? _selectedDate;
  String? _selectedSlotId;
  String? _selectedSlotName;

  DeliveryProvider(this._token);

  List<DeliverySlot> get availableSlots => _availableSlots;
  bool get isLoading => _isLoading;
  DateTime? get selectedDate => _selectedDate;
  String? get selectedSlotId => _selectedSlotId;
  String? get selectedSlotName => _selectedSlotName;

  void _setLoading(bool val) {
    _isLoading = val;
    notifyListeners();
  }

  void selectDate(DateTime date) {
    _selectedDate = date;
    _selectedSlotId = null;
    _selectedSlotName = null;
    notifyListeners();
    fetchAvailableSlots(date);
  }

  void selectSlot(String slotId, String slotName) {
    _selectedSlotId = slotId;
    _selectedSlotName = slotName;
    notifyListeners();
  }

  Future<void> fetchAvailableSlots(DateTime date) async {
    if (_token.isEmpty) return;
    _setLoading(true);
    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(date);
      final List<dynamic> data = await ApiClient.get(
        '${ApiEndpoints.deliverySlots}?date=$formattedDate',
        token: _token,
      );
      _availableSlots = data.map((json) => DeliverySlot.fromJson(json)).toList();
    } finally {
      _setLoading(false);
    }
  }

  Future<OrderDelivery> selectSlotForOrder(String orderId) async {
    if (_token.isEmpty || _selectedDate == null || _selectedSlotId == null) {
      throw Exception('Please select delivery date and slot');
    }
    _setLoading(true);
    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(_selectedDate!);
      final data = await ApiClient.post(
        ApiEndpoints.selectDeliverySlot,
        {
          'orderId': orderId,
          'deliveryDate': formattedDate,
          'deliverySlotId': _selectedSlotId,
        },
        token: _token,
      );
      return OrderDelivery.fromJson(data);
    } finally {
      _setLoading(false);
    }
  }

  Future<OrderDelivery> rescheduleDelivery(String orderId, DateTime date, String slotId) async {
    if (_token.isEmpty) throw Exception('Authentication required');
    _setLoading(true);
    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(date);
      final data = await ApiClient.put(
        ApiEndpoints.rescheduleDelivery,
        {
          'orderId': orderId,
          'deliveryDate': formattedDate,
          'deliverySlotId': slotId,
        },
        token: _token,
      );
      return OrderDelivery.fromJson(data);
    } finally {
      _setLoading(false);
    }
  }

  Future<OrderDelivery> getTrackingDetails(String orderId) async {
    if (_token.isEmpty) throw Exception('Authentication required');
    _setLoading(true);
    try {
      final data = await ApiClient.get(
        '${ApiEndpoints.trackDelivery}/$orderId',
        token: _token,
      );
      return OrderDelivery.fromJson(data);
    } finally {
      _setLoading(false);
    }
  }
}
