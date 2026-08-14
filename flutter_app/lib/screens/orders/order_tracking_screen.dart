import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../constants/app_colors.dart';
import '../../models/delivery_models.dart';
import '../../providers/order_provider.dart';
import '../../providers/delivery_provider.dart';

class OrderTrackingScreen extends StatefulWidget {
  final String orderId;

  const OrderTrackingScreen({super.key, required this.orderId});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen> {
  OrderDelivery? _tracking;
  bool _loadingTracking = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    final orderProvider = Provider.of<OrderProvider>(context, listen: false);
    final deliveryProvider = Provider.of<DeliveryProvider>(context, listen: false);

    setState(() => _loadingTracking = true);
    try {
      await orderProvider.fetchOrderDetails(widget.orderId);
      final details = await deliveryProvider.getTrackingDetails(widget.orderId);
      setState(() => _tracking = details);
    } catch (_) {}
    setState(() => _loadingTracking = false);
  }

  void _cancel() async {
    try {
      await Provider.of<OrderProvider>(context, listen: false).cancelOrder(widget.orderId);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Order cancelled successfully'), backgroundColor: AppColors.primary),
      );
      _loadData();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
      );
    }
  }

  void _reschedule() async {
    final delivery = Provider.of<DeliveryProvider>(context, listen: false);
    final chosenDate = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 7)),
    );
    if (chosenDate == null) return;

    await delivery.fetchAvailableSlots(chosenDate);

    if (!mounted) return;
    showDialog(
      context: context,
      builder: (ctx) {
        return AlertDialog(
          title: const Text('Select Reschedule Slot'),
          content: SizedBox(
            width: double.maxFinite,
            child: ListView.builder(
              shrinkWrap: true,
              itemCount: delivery.availableSlots.length,
              itemBuilder: (c, idx) {
                final slot = delivery.availableSlots[idx];
                return ListTile(
                  title: Text(slot.slotName),
                  subtitle: Text('${slot.startTime} - ${slot.endTime}'),
                  onTap: () async {
                    Navigator.pop(ctx);
                    try {
                      await delivery.rescheduleDelivery(widget.orderId, chosenDate, slot.id);
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Delivery rescheduled successfully!'), backgroundColor: AppColors.primary),
                      );
                      _loadData();
                    } catch (e) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text(e.toString()), backgroundColor: AppColors.error),
                      );
                    }
                  },
                );
              },
            ),
          ),
        );
      },
    );
  }

  Widget _buildTimelineStep(String label, bool isCompleted, bool isCurrent) {
    return Row(
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCompleted
                    ? AppColors.primary
                    : isCurrent
                        ? AppColors.accent
                        : Colors.grey.shade300,
              ),
              child: Icon(
                isCompleted ? Icons.check : Icons.radio_button_checked,
                size: 14,
                color: Colors.white,
              ),
            ),
          ],
        ),
        const SizedBox(width: 16),
        Text(
          label,
          style: TextStyle(
            fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
            color: isCompleted || isCurrent ? AppColors.textDark : AppColors.textLight,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final orderProvider = Provider.of<OrderProvider>(context);
    final order = orderProvider.activeOrderDetails;

    if (_loadingTracking || order == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Track Order')),
        body: const Center(child: CircularProgressIndicator(color: AppColors.primary)),
      );
    }

    // Determine current steps based on OrderDeliveryStatus
    final status = _tracking?.deliveryStatus ?? order.status;
    final isPlaced = true;
    final isConfirmed = status != 'PLACED' && status != 'CANCELLED';
    final isPacked = status == 'PACKED' || status == 'READY_FOR_PICKUP' || status == 'OUT_FOR_DELIVERY' || status == 'DELIVERED';
    final isOut = status == 'OUT_FOR_DELIVERY' || status == 'DELIVERED';
    final isDelivered = status == 'DELIVERED';
    final isCancelled = status == 'CANCELLED';

    return Scaffold(
      appBar: AppBar(title: const Text('Track Order')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order details summary
            Text('Order ID: ${order.id}', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 8),
            Text('Date Placed: ${order.createdAt.split('T')[0]}', style: const TextStyle(color: AppColors.textLight)),
            const SizedBox(height: 24),

            // Timeline
            const Text('Fulfillment Status', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 16),
            if (isCancelled)
              const Row(
                children: [
                  Icon(Icons.cancel, color: AppColors.error, size: 28),
                  SizedBox(width: 16),
                  Text('This order has been CANCELLED', style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold)),
                ],
              )
            else ...[
              _buildTimelineStep('Order Placed', isPlaced && !isConfirmed, isPlaced && !isConfirmed),
              const SizedBox(height: 12),
              _buildTimelineStep('Order Confirmed / Slot Locked', isConfirmed && !isPacked, isConfirmed),
              const SizedBox(height: 12),
              _buildTimelineStep('Packed & Ready', isPacked && !isOut, isPacked),
              const SizedBox(height: 12),
              _buildTimelineStep('Out for Delivery', isOut && !isDelivered, isOut),
              const SizedBox(height: 12),
              _buildTimelineStep('Delivered Successfully', isDelivered, isDelivered),
            ],
            const SizedBox(height: 24),
            const Divider(),
            const SizedBox(height: 16),

            // Reschedule and Cancellation panel
            if (!isCancelled && !isDelivered) ...[
              const Text('Delivery Options', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              Row(
                children: [
                  if (status == 'PLACED' || status == 'CONFIRMED' || status == 'PACKED')
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary, foregroundColor: Colors.white),
                        icon: const Icon(Icons.edit_calendar),
                        label: const Text('RESCHEDULE'),
                        onPressed: _reschedule,
                      ),
                    ),
                  if (status == 'PLACED') ...[
                    const SizedBox(width: 16),
                    Expanded(
                      child: OutlinedButton.icon(
                        style: OutlinedButton.styleFrom(foregroundColor: AppColors.error, side: const BorderSide(color: AppColors.error)),
                        icon: const Icon(Icons.cancel_outlined),
                        label: const Text('CANCEL ORDER'),
                        onPressed: _cancel,
                      ),
                    ),
                  ],
                ],
              ),
              const SizedBox(height: 24),
            ],

            // Delivery slot detail panel
            if (_tracking != null) ...[
              const Text('Slot Information', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
              const SizedBox(height: 8),
              Card(
                color: Colors.white,
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Scheduled Date: ${_tracking!.deliveryDate}', style: const TextStyle(fontWeight: FontWeight.bold)),
                      const SizedBox(height: 4),
                      Text('Timings: ${_tracking!.deliverySlotName}'),
                      if (_tracking!.deliveryPartnerName != null) ...[
                        const SizedBox(height: 8),
                        Text('Assigned Partner: ${_tracking!.deliveryPartnerName}', style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                      ],
                      if (_tracking!.estimatedArrivalTime != null) ...[
                        const SizedBox(height: 8),
                        Text('Estimated ETA: ${_tracking!.estimatedArrivalTime!.split('T')[1].substring(0, 5)} hrs'),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
