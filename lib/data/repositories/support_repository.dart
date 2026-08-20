import '../models/support_ticket_model.dart';
import '../../core/network/api_response.dart';
import '../../core/services/backend_api_service.dart';

class SupportRepository {
  SupportRepository({BackendApiService? apiService})
      : _apiService = apiService ?? BackendApiService();

  final BackendApiService _apiService;

  final List<SupportTicketModel> _tickets = <SupportTicketModel>[];

  Stream<List<SupportTicketModel>> watchMyTickets() async* {
    yield List<SupportTicketModel>.unmodifiable(_tickets);
  }

  Future<String> createTicket({
    required String subject,
    required String message,
    String category = 'general',
    String priority = 'normal',
  }) async {
    final ApiResponse<dynamic> response = await _apiService.createSupportTicket(<String, dynamic>{
      'userId': 'user',
      'subject': subject.trim(),
      'message': message.trim(),
      'category': category.trim().toLowerCase(),
      'priority': priority.trim().toLowerCase(),
    });
    if (!response.isSuccess || response.data is! Map) {
      throw StateError(response.message.isNotEmpty ? response.message : 'Unable to create support request.');
    }
    final Map<String, dynamic> data = Map<String, dynamic>.from(response.data as Map);
    return (data['id'] ?? '').toString();
  }

  Future<void> closeTicket(String ticketId) async {
    for (int i = 0; i < _tickets.length; i++) {
      if (_tickets[i].id == ticketId.trim()) {
        _tickets[i] = _tickets[i].copyWith(status: 'closed');
      }
    }
  }
}
