import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';
import '../../providers/cart_provider.dart';
import '../../providers/delivery_provider.dart';
import '../../providers/order_provider.dart';
import '../../services/api_client.dart';
import 'bill_summary_screen.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  String? _selectedAddressId;
  String _addressDisplay = 'Loading address...';
  bool _isLoadingAddress = true;
  bool _isPlacingOrder = false;

  @override
  void initState() {
    super.initState();
    _loadOrCreateAddress();
  }

  void _loadOrCreateAddress() async {
    try {
      final List<dynamic> data = await ApiClient.get('/api/v1/customers/address');
      if (data.isNotEmpty) {
        setState(() {
          _selectedAddressId = data[0]['id'];
          _addressDisplay = '${data[0]['street']}, ${data[0]['city']}, ${data[0]['state']} - ${data[0]['pincode']}';
          _isLoadingAddress = false;
        });
      } else {
        // Auto create a default address
        final newAddr = await ApiClient.post('/api/v1/customers/address', {
          'street': '123 Green Farm Lane',
          'city': 'Bangalore',
          'state': 'Karnataka',
          'pincode': '560001',
          'country': 'India',
          'addressType': 'HOME',
          'defaultAddress': true,
        });
        setState(() {
          _selectedAddressId = newAddr['id'];
          _addressDisplay = '123 Green Farm Lane, Bangalore, Karnataka - 560001';
          _isLoadingAddress = false;
        });
      }
    } catch (_) {
      setState(() {
        _addressDisplay = 'Error loading address';
        _isLoadingAddress = false;
      });
    }
  }

  void _placeOrder() async {
    final cart = Provider.of<CartProvider>(context, listen: false);
    final delivery = Provider.of<DeliveryProvider>(context, listen: false);
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);

    if (_selectedAddressId == null) return;
    if (delivery.selectedDate == null || delivery.selectedSlotId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select delivery date and slot'), backgroundColor: AppColors.error),
      );
      return;
    }

    setState(() => _isPlacingOrder = true);
    try {
      final List<Map<String, dynamic>> itemsPayload = cart.items
          .map((item) => {
                'productId': item.product.id,
                'quantity': item.quantity,
              })
          .toList();

      final placedOrder = await orderProvider.placeOrder(
        _selectedAddressId!,
        itemsPayload,
        cart.appliedCouponCode,
      );

      // Immediately save the selected slot in backend delivery tracker!
      await delivery.selectSlotForOrder(placedOrder.id);

      // Route to Bill Summary
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => BillSummaryScreen(orderId: placedOrder.id),
        ),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
      );
    } finally {
      setState(() => _isPlacingOrder = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final delivery = Provider.of<DeliveryProvider>(context);

    return Scaffold(
      appBar: AppBar(title: const Text('Checkout Details')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Shipping Address Card
            const Text('Delivery Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark)),
            const SizedBox(height: 8),
            Card(
              color: Colors.white,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  children: [
                    const Icon(Icons.location_on, color: AppColors.primary, size: 28),
                    const SizedBox(width: 16),
                    Expanded(
                      child: _isLoadingAddress
                          ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                          : Text(_addressDisplay, style: const TextStyle(height: 1.4)),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // Select Delivery Date
            const Text('Select Delivery Date', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark)),
            const SizedBox(height: 8),
            ListTile(
              tileColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              leading: const Icon(Icons.calendar_today, color: AppColors.primary),
              title: Text(
                delivery.selectedDate == null
                    ? 'Choose Date'
                    : DateFormat('EEEE, d MMMM yyyy').format(delivery.selectedDate!),
                style: const TextStyle(fontWeight: FontWeight.bold),
              ),
              trailing: const Icon(Icons.chevron_right),
              onTap: () async {
                final chosen = await showDatePicker(
                  context: context,
                  initialDate: DateTime.now().add(const Duration(days: 1)),
                  firstDate: DateTime.now(),
                  lastDate: DateTime.now().add(const Duration(days: 7)),
                );
                if (chosen != null) {
                  delivery.selectDate(chosen);
                }
              },
            ),
            const SizedBox(height: 24),

            // Select Delivery Slot
            if (delivery.selectedDate != null) ...[
              const Text('Available Time Slots', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: AppColors.textDark)),
              const SizedBox(height: 8),
              delivery.isLoading
                  ? const Center(child: CircularProgressIndicator(color: AppColors.primary))
                  : delivery.availableSlots.isEmpty
                      ? const Text('No active slots available for this date', style: TextStyle(color: AppColors.error))
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          itemCount: delivery.availableSlots.length,
                          itemBuilder: (ctx, idx) {
                            final slot = delivery.availableSlots[idx];
                            final isSelected = delivery.selectedSlotId == slot.id;
                            final isFull = (slot.availableOrders ?? 0) <= 0;

                            return Card(
                              color: isSelected ? AppColors.primary.withOpacity(0.1) : Colors.white,
                              shape: RoundedRectangleBorder(
                                side: BorderSide(
                                  color: isSelected ? AppColors.primary : Colors.grey.shade300,
                                  width: isSelected ? 2 : 1,
                                ),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: ListTile(
                                enabled: !isFull,
                                title: Text(slot.slotName, style: const TextStyle(fontWeight: FontWeight.bold)),
                                subtitle: Text('${slot.startTime} - ${slot.endTime} • ${slot.availableOrders ?? 0} slots left'),
                                trailing: isFull
                                    ? const Text('FULL', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold))
                                    : isSelected
                                        ? const Icon(Icons.check_circle, color: AppColors.primary)
                                        : null,
                                onTap: () => delivery.selectSlot(slot.id, slot.slotName),
                              ),
                            );
                          },
                        ),
            ],
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                onPressed: _isPlacingOrder || _selectedAddressId == null ? null : _placeOrder,
                child: _isPlacingOrder
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('CONFIRM ORDER & VIEW BILL', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
