import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../core/theme/app_colors.dart';
import '../../data/models/order_model.dart';
import '../../data/repositories/order_repository.dart';
import 'order_tracking_screen.dart';
import 'widgets/delivery_status_timeline.dart';
import 'widgets/order_item_tile.dart';
import 'widgets/order_price_summary.dart';
import 'widgets/reorder_button.dart';

class OrderDetailsScreen extends StatefulWidget {
  const OrderDetailsScreen({
    super.key,
    this.orderId = '',
    this.initialOrder,
    this.onTrack,
  });

  final String orderId;
  final OrderModel? initialOrder;
  final ValueChanged<OrderModel>? onTrack;

  @override
  State<OrderDetailsScreen> createState() => _OrderDetailsScreenState();
}

class _OrderDetailsScreenState extends State<OrderDetailsScreen> {
  late final OrderRepository _repository;

  Stream<OrderModel?>? _orderStream;
  OrderModel? _initialOrder;
  String _orderId = '';
  bool _initialized = false;
  bool _cancelling = false;
  bool _paying = false;

  @override
  void initState() {
    super.initState();
    _repository = OrderRepository();
    _initialOrder = widget.initialOrder;
    _orderId = widget.orderId.trim();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();

    if (_initialized) {
      return;
    }

    _initialized = true;
    _readRouteArguments();

    if (_orderId.isNotEmpty) {
      _orderStream = _repository.watchOrder(_orderId);
    }
  }

  void _readRouteArguments() {
    final Object? arguments = ModalRoute.of(context)?.settings.arguments;

    if (arguments is OrderModel) {
      _initialOrder = arguments;
      _orderId = arguments.id;
      return;
    }

    if (arguments is String && arguments.trim().isNotEmpty) {
      _orderId = arguments.trim();
      return;
    }

    if (arguments is Map) {
      final Map<dynamic, dynamic> map = arguments;
      final Object? orderValue = map['order'];

      if (orderValue is OrderModel) {
        _initialOrder = orderValue;
        _orderId = orderValue.id;
      }

      final String argumentOrderId =
      (map['orderId'] ?? map['id'] ?? '').toString().trim();

      if (argumentOrderId.isNotEmpty) {
        _orderId = argumentOrderId;
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: <Widget>[
            _buildHeader(),
            Expanded(
              child: _orderStream == null
                  ? _buildWithoutStream()
                  : StreamBuilder<OrderModel?>(
                stream: _orderStream,
                initialData: _initialOrder,
                builder: (
                    BuildContext context,
                    AsyncSnapshot<OrderModel?> snapshot,
                    ) {
                  if (snapshot.connectionState ==
                      ConnectionState.waiting &&
                      snapshot.data == null) {
                    return const Center(
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    );
                  }

                  if (snapshot.hasError) {
                    return _buildErrorState(
                      _friendlyError(snapshot.error),
                    );
                  }

                  final OrderModel? order = snapshot.data;

                  if (order == null) {
                    return _buildErrorState('Order not found.');
                  }

                  return _buildOrderContent(order);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(8, 8, 16, 9),
      decoration: const BoxDecoration(
        color: Colors.white,
        boxShadow: <BoxShadow>[
          BoxShadow(
            color: Color(0x0A000000),
            blurRadius: 18,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          IconButton(
            tooltip: 'Back',
            onPressed: () => Navigator.of(context).maybePop(),
            icon: const Icon(Icons.arrow_back_rounded),
          ),
          const SizedBox(width: 4),
          Container(
            width: 43,
            height: 43,
            decoration: BoxDecoration(
              color: const Color(0xFFEAF7EF),
              borderRadius: BorderRadius.circular(13),
            ),
            child: const Icon(
              Icons.receipt_long_rounded,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(width: 11),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Order Details',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Items, delivery and payment information',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWithoutStream() {
    if (_initialOrder != null) {
      return _buildOrderContent(_initialOrder!);
    }

    return _buildErrorState('Order ID is missing.');
  }

  Widget _buildOrderContent(OrderModel order) {
    final bool desktop = MediaQuery.sizeOf(context).width >= 900;

    return SingleChildScrollView(
      physics: const BouncingScrollPhysics(),
      padding: EdgeInsets.fromLTRB(
        desktop ? 32 : 16,
        20,
        desktop ? 32 : 16,
        32,
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1060),
          child: Column(
            children: <Widget>[
              _buildStatusCard(order),
              const SizedBox(height: 14),
              _buildTimelineCard(order),
              const SizedBox(height: 18),
              desktop
                  ? Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: <Widget>[
                  Expanded(
                    flex: 6,
                    child: Column(
                      children: <Widget>[
                        _buildItemsCard(order),
                        const SizedBox(height: 16),
                        _buildDeliveryCard(order),
                      ],
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    flex: 4,
                    child: Column(
                      children: <Widget>[
                        _buildPriceCard(order),
                        const SizedBox(height: 16),
                        _buildPaymentCard(order),
                        const SizedBox(height: 16),
                        _buildAddressCard(order),
                      ],
                    ),
                  ),
                ],
              )
                  : Column(
                children: <Widget>[
                  _buildItemsCard(order),
                  const SizedBox(height: 16),
                  _buildPriceCard(order),
                  const SizedBox(height: 16),
                  _buildDeliveryCard(order),
                  const SizedBox(height: 16),
                  _buildPaymentCard(order),
                  const SizedBox(height: 16),
                  _buildAddressCard(order),
                ],
              ),
              const SizedBox(height: 22),
              _buildActions(order),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStatusCard(OrderModel order) {
    final _StatusStyle style = _statusStyle(order.status);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[
            Color(0xFF043D22),
            Color(0xFF17A45B),
          ],
        ),
        borderRadius: BorderRadius.circular(25),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x2117A45B),
            blurRadius: 25,
            offset: Offset(0, 11),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Container(
            width: 66,
            height: 66,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: Icon(
              style.icon,
              color: AppColors.primary,
              size: 36,
            ),
          ),
          const SizedBox(width: 15),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  order.statusLabel,
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 5),
                Text(
                  _statusMessage(order.status),
                  style: const TextStyle(
                    color: Color(0xFFDDF4E7),
                    fontSize: 10.5,
                    height: 1.4,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'ORDER #${order.shortOrderId}',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 9,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 0.5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          Text(
            _formatDate(order.createdAt),
            textAlign: TextAlign.right,
            style: const TextStyle(
              color: Color(0xFFDDF4E7),
              fontSize: 9,
              fontWeight: FontWeight.w700,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineCard(OrderModel order) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(14, 16, 14, 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: AppColors.border),
      ),
      child: DeliveryStatusTimeline(order: order),
    );
  }

  Widget _buildItemsCard(OrderModel order) {
    return _sectionCard(
      icon: Icons.shopping_basket_rounded,
      title: 'Order Items',
      trailing: '${order.calculatedItemCount} items',
      child: order.items.isEmpty
          ? const Padding(
        padding: EdgeInsets.symmetric(vertical: 14),
        child: Center(
          child: Text(
            'Item details are unavailable.',
            style: TextStyle(
              color: AppColors.textSecondary,
              fontSize: 11,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      )
          : Column(
        children: <Widget>[
          for (int index = 0; index < order.items.length; index++)
            OrderItemTile(
              item: order.items[index],
              showDivider: index < order.items.length - 1,
            ),
        ],
      ),
    );
  }

  Widget _buildPriceCard(OrderModel order) {
    return OrderPriceSummary(order: order);
  }

  Widget _buildDeliveryCard(OrderModel order) {
    return _sectionCard(
      icon: Icons.local_shipping_rounded,
      title: 'Delivery Details',
      child: Column(
        children: <Widget>[
          _detailRow('Method', order.deliveryMethodLabel),
          if (order.deliveryDate != null)
            _detailRow('Delivery date', order.deliveryDate!),
          _detailRow('Delivery slot', order.deliverySlot),
          const SizedBox(height: 5),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFEAF7EF),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Row(
              children: <Widget>[
                Icon(
                  Icons.notifications_active_rounded,
                  color: AppColors.primary,
                  size: 21,
                ),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'You will receive updates when the order status changes.',
                    style: TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 10,
                      height: 1.4,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentCard(OrderModel order) {
    return _sectionCard(
      icon: Icons.account_balance_wallet_rounded,
      title: 'Payment',
      child: Column(
        children: <Widget>[
          _detailRow('Method', order.paymentMethodLabel),
          _detailRow(
            'Status',
            order.paymentStatusLabel,
            valueColor: order.isPaid
                ? AppColors.primary
                : const Color(0xFFE28A00),
          ),
          if (order.transactionId.isNotEmpty)
            _detailRow('Transaction ID', order.transactionId),
          if (order.paymentId.isNotEmpty)
            _detailRow('Payment ID', order.paymentId),
          if (order.isCashOnDelivery &&
              !order.isPaid &&
              !order.isDelivered &&
              !order.isCancelled) ...<Widget>[
            const SizedBox(height: 13),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                gradient: const LinearGradient(colors: <Color>[Color(0xFFE8F7EF), Color(0xFFFFFBEC)]),
                borderRadius: BorderRadius.circular(15),
                border: Border.all(color: const Color(0xFFCDE5D7)),
              ),
              child: const Row(children: <Widget>[
                Icon(Icons.schedule_send_rounded, color: AppColors.primary, size: 21),
                SizedBox(width: 9),
                Expanded(child: Text('Pay online anytime before delivery. Your COD order stays confirmed.', style: TextStyle(color: AppColors.textPrimary, fontSize: 9.5, height: 1.4, fontWeight: FontWeight.w700))),
              ]),
            ),
            const SizedBox(height: 11),
            FilledButton.icon(
              onPressed: _paying ? null : () => _payNow(order),
              style: FilledButton.styleFrom(
                backgroundColor: const Color(0xFF073D24),
                minimumSize: const Size.fromHeight(50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              ),
              icon: _paying
                  ? const SizedBox(width: 17, height: 17, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Icon(Icons.lock_rounded, size: 18),
              label: Text(_paying ? 'UPDATING PAYMENT...' : 'PAY ₹${order.totalAmount.toStringAsFixed(0)} NOW'),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildAddressCard(OrderModel order) {
    final Map<String, dynamic> address = order.address;
    final String name = _text(
      address['fullName'] ?? address['name'],
      fallback: 'Delivery address',
    );
    final String phone = _text(
      address['phone'] ?? address['phoneNumber'],
    );

    return _sectionCard(
      icon: Icons.location_on_rounded,
      title: 'Delivering To',
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Text(
            name,
            style: const TextStyle(
              color: AppColors.textPrimary,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          if (phone.isNotEmpty) ...<Widget>[
            const SizedBox(height: 5),
            Text(
              phone,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 10,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
          const SizedBox(height: 8),
          Text(
            _formatAddress(address),
            style: const TextStyle(
              color: AppColors.textSecondary,
              fontSize: 10.5,
              height: 1.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionCard({
    required IconData icon,
    required String title,
    required Widget child,
    String? trailing,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(17),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x0B000000),
            blurRadius: 18,
            offset: Offset(0, 7),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Row(
            children: <Widget>[
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFFEAF7EF),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: AppColors.primary, size: 21),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 15,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
              if (trailing != null)
                Text(
                  trailing,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 9.5,
                    fontWeight: FontWeight.w700,
                  ),
                ),
            ],
          ),
          const SizedBox(height: 16),
          child,
        ],
      ),
    );
  }

  Widget _detailRow(
      String label,
      String value, {
        bool important = false,
        Color? valueColor,
      }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 10),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          Expanded(
            child: Text(
              label,
              style: TextStyle(
                color: important
                    ? AppColors.textPrimary
                    : AppColors.textSecondary,
                fontSize: important ? 12.5 : 10.5,
                fontWeight: important
                    ? FontWeight.w900
                    : FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: TextStyle(
                color: valueColor ?? AppColors.textPrimary,
                fontSize: important ? 17 : 10.5,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(OrderModel order) {
    return Column(
      children: <Widget>[
        if (order.canTrack)
          SizedBox(
            width: double.infinity,
            height: 52,
            child: FilledButton.icon(
              onPressed: () {
                if (widget.onTrack != null) {
                  widget.onTrack!(order);
                } else {
                  _openOrderTracking(order);
                }
              },
              style: FilledButton.styleFrom(
                backgroundColor: AppColors.primary,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
              ),
              icon: const Icon(Icons.location_searching_rounded),
              label: const Text(
                'TRACK ORDER',
                style: TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ),
        if (order.canTrack && order.canCancel)
          const SizedBox(height: 11),
        if (order.canCancel)
          SizedBox(
            width: double.infinity,
            height: 50,
            child: OutlinedButton.icon(
              onPressed: _cancelling ? null : () => _cancelOrder(order),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.error,
                side: const BorderSide(color: AppColors.error),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
              ),
              icon: _cancelling
                  ? const SizedBox(
                width: 18,
                height: 18,
                child: CircularProgressIndicator(
                  color: AppColors.error,
                  strokeWidth: 2.5,
                ),
              )
                  : const Icon(Icons.close_rounded),
              label: Text(
                _cancelling ? 'CANCELLING...' : 'CANCEL ORDER',
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
            ),
          ),
        if ((order.canTrack || order.canCancel) && order.canReorder)
          const SizedBox(height: 11),
        if (order.canReorder)
          SizedBox(
            width: double.infinity,
            child: ReorderButton(
              order: order,
              onReorder: (OrderModel selectedOrder) async {
                await _repository.reorder(selectedOrder.id);
              },
              onSuccess: () {
                _showMessage('Order items added to your cart.');
              },
              onError: (Object error) {
                _showMessage(_friendlyError(error), error: true);
              },
            ),
          ),
      ],
    );
  }

  Future<void> _cancelOrder(OrderModel order) async {
    final TextEditingController controller = TextEditingController();

    final bool? confirmed = await showModalBottomSheet<bool>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext sheetContext) {
        return Padding(
          padding: EdgeInsets.only(
            bottom: MediaQuery.viewInsetsOf(sheetContext).bottom,
          ),
          child: Container(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 24),
            decoration: const BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.vertical(top: Radius.circular(26)),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  'Cancel order?',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 20,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Order #${order.shortOrderId} will be cancelled.',
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 17),
                TextField(
                  controller: controller,
                  maxLines: 3,
                  maxLength: 150,
                  decoration: const InputDecoration(
                    hintText: 'Reason (optional)',
                  ),
                ),
                const SizedBox(height: 12),
                Row(
                  children: <Widget>[
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () =>
                            Navigator.of(sheetContext).pop(false),
                        child: const Text('KEEP ORDER'),
                      ),
                    ),
                    const SizedBox(width: 11),
                    Expanded(
                      child: FilledButton(
                        onPressed: () =>
                            Navigator.of(sheetContext).pop(true),
                        style: FilledButton.styleFrom(
                          backgroundColor: AppColors.error,
                        ),
                        child: const Text('CANCEL'),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );

    final String reason = controller.text.trim();
    controller.dispose();

    if (confirmed != true || !mounted) {
      return;
    }

    setState(() => _cancelling = true);

    try {
      await _repository.cancelOrder(
        orderId: order.id,
        reason: reason,
      );

      if (!mounted) {
        return;
      }

      _showMessage('Order cancelled successfully.');
    } catch (error) {
      if (!mounted) {
        return;
      }

      _showMessage(_friendlyError(error), error: true);
    } finally {
      if (mounted) {
        setState(() => _cancelling = false);
      }
    }
  }

  Future<void> _openOrderTracking(OrderModel order) async {
    await Navigator.of(context).push(
      MaterialPageRoute<void>(
        builder: (_) => OrderTrackingScreen(
          orderId: order.id,
          initialOrder: order,
        ),
      ),
    );
  }

  Future<void> _payNow(OrderModel order) async {
    String selected = 'upi';
    final String? method = await showModalBottomSheet<String>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (BuildContext sheetContext) => StatefulBuilder(
        builder: (BuildContext context, StateSetter setSheetState) => Container(
          padding: EdgeInsets.fromLTRB(18, 12, 18, MediaQuery.paddingOf(context).bottom + 18),
          decoration: const BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.vertical(top: Radius.circular(30)),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Center(child: Container(width: 42, height: 4, decoration: BoxDecoration(color: const Color(0xFFD8DFDB), borderRadius: BorderRadius.circular(8)))),
              const SizedBox(height: 18),
              const Row(children: <Widget>[
                CircleAvatar(radius: 24, backgroundColor: Color(0xFFEAF7EF), child: Icon(Icons.lock_rounded, color: AppColors.primary)),
                SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                  Text('Pay before delivery', style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w900)),
                  SizedBox(height: 3),
                  Text('Your order and delivery slot will not change.', style: TextStyle(color: AppColors.textSecondary, fontSize: 9.5)),
                ])),
              ]),
              const SizedBox(height: 18),
              _PayMethodTile(
                icon: Icons.qr_code_2_rounded,
                title: 'UPI payment',
                subtitle: 'Google Pay, PhonePe or any UPI app',
                selected: selected == 'upi',
                onTap: () => setSheetState(() => selected = 'upi'),
              ),
              const SizedBox(height: 10),
              _PayMethodTile(
                icon: Icons.credit_card_rounded,
                title: 'Credit / Debit card',
                subtitle: 'Visa, Mastercard and RuPay',
                selected: selected == 'card',
                onTap: () => setSheetState(() => selected = 'card'),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: () => Navigator.pop(sheetContext, selected),
                style: FilledButton.styleFrom(backgroundColor: const Color(0xFF073D24), minimumSize: const Size.fromHeight(55), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(17))),
                icon: const Icon(Icons.verified_user_rounded),
                label: Text('PAY ₹${order.totalAmount.toStringAsFixed(0)} SECURELY'),
              ),
            ],
          ),
        ),
      ),
    );
    if (method == null || !mounted) return;

    setState(() => _paying = true);
    try {
      final User? user = FirebaseAuth.instance.currentUser;
      if (user == null || user.uid != order.userId) {
        throw StateError('Please sign in again to pay for this order.');
      }
      final FirebaseFirestore firestore = FirebaseFirestore.instance;
      final DocumentReference<Map<String, dynamic>> orderRef = firestore.collection('orders').doc(order.id);
      final DocumentReference<Map<String, dynamic>> paymentRef = order.paymentId.isNotEmpty
          ? firestore.collection('payments').doc(order.paymentId)
          : firestore.collection('payments').doc();
      final String transactionId = 'TXN${DateTime.now().millisecondsSinceEpoch}';
      final WriteBatch batch = firestore.batch();
      batch.set(paymentRef, <String, dynamic>{
        'id': paymentRef.id,
        'paymentId': paymentRef.id,
        'userId': user.uid,
        'orderId': order.id,
        'orderNumber': order.orderNumber,
        'method': method,
        'status': 'paid_test',
        'totalAmount': order.totalAmount,
        'transactionId': transactionId,
        'gateway': 'test_gateway',
        'convertedFromCod': true,
        'updatedAt': FieldValue.serverTimestamp(),
        if (order.paymentId.isEmpty) 'createdAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
      batch.update(orderRef, <String, dynamic>{
        'paymentId': paymentRef.id,
        'paymentMethod': method,
        'paymentStatus': 'paid_test',
        'transactionId': transactionId,
        'updatedAt': FieldValue.serverTimestamp(),
      });
      await batch.commit();
      if (!mounted) return;
      _showMessage('Payment recorded. Your order remains on schedule.');
    } catch (error) {
      if (!mounted) return;
      _showMessage(_friendlyError(error), error: true);
    } finally {
      if (mounted) setState(() => _paying = false);
    }
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(28),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            const Icon(
              Icons.error_outline_rounded,
              color: AppColors.error,
              size: 54,
            ),
            const SizedBox(height: 16),
            const Text(
              'Unable to open order',
              style: TextStyle(
                color: AppColors.textPrimary,
                fontSize: 19,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.textSecondary,
                fontSize: 11,
                height: 1.5,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 18),
            OutlinedButton.icon(
              onPressed: () => Navigator.of(context).maybePop(),
              icon: const Icon(Icons.arrow_back_rounded),
              label: const Text('GO BACK'),
            ),
          ],
        ),
      ),
    );
  }

  void _showMessage(String message, {bool error = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          backgroundColor: error ? AppColors.error : AppColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(15),
          ),
          content: Text(
            message,
            style: const TextStyle(
              color: Colors.white,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      );
  }
}

class _StatusStyle {
  const _StatusStyle({required this.icon});

  final IconData icon;
}

class _PayMethodTile extends StatelessWidget {
  const _PayMethodTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.selected,
    required this.onTap,
  });
  final IconData icon;
  final String title;
  final String subtitle;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Material(
        color: selected ? const Color(0xFFEAF7EF) : const Color(0xFFF7F9F8),
        borderRadius: BorderRadius.circular(18),
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(18),
          child: Container(
            padding: const EdgeInsets.all(13),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: selected ? AppColors.primary : const Color(0xFFE2E8E5), width: selected ? 1.5 : 1),
            ),
            child: Row(children: <Widget>[
              Container(width: 43, height: 43, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(13)), child: Icon(icon, color: AppColors.primary)),
              const SizedBox(width: 11),
              Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: <Widget>[
                Text(title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 11.5, fontWeight: FontWeight.w900)),
                const SizedBox(height: 3),
                Text(subtitle, style: const TextStyle(color: AppColors.textSecondary, fontSize: 8.5)),
              ])),
              Icon(selected ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded, color: selected ? AppColors.primary : AppColors.textSecondary),
            ]),
          ),
        ),
      );
}

_StatusStyle _statusStyle(String status) {
  switch (status) {
    case 'delivered':
      return const _StatusStyle(icon: Icons.check_circle_rounded);
    case 'cancelled':
    case 'failed':
      return const _StatusStyle(icon: Icons.cancel_rounded);
    case 'shipped':
    case 'out_for_delivery':
      return const _StatusStyle(icon: Icons.local_shipping_rounded);
    case 'processing':
    case 'packed':
      return const _StatusStyle(icon: Icons.inventory_2_rounded);
    case 'confirmed':
      return const _StatusStyle(icon: Icons.verified_rounded);
    case 'placed':
    default:
      return const _StatusStyle(icon: Icons.schedule_rounded);
  }
}

String _statusMessage(String status) {
  switch (status) {
    case 'confirmed':
      return 'Your order has been confirmed.';
    case 'processing':
    case 'packed':
      return 'Your fresh products are being prepared.';
    case 'shipped':
      return 'Your order has been shipped.';
    case 'out_for_delivery':
      return 'Your order is out for delivery.';
    case 'delivered':
      return 'Your order was delivered successfully.';
    case 'cancelled':
      return 'This order was cancelled.';
    case 'failed':
      return 'This order could not be completed.';
    case 'placed':
    default:
      return 'Your order was placed successfully.';
  }
}

String _formatDate(DateTime? date) {
  if (date == null) {
    return 'Recently';
  }

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

String _formatAddress(Map<String, dynamic> address) {
  final List<String> parts = <String>[
    _text(address['houseNumber'] ?? address['houseNo']),
    _text(address['building'] ?? address['apartment']),
    _text(address['street'] ?? address['addressLine1']),
    _text(address['landmark']),
    _text(address['area'] ?? address['addressLine2']),
    _text(address['city']),
    _text(address['state']),
    _text(address['pincode'] ?? address['postalCode']),
  ].where((String value) => value.isNotEmpty).toList();

  if (parts.isNotEmpty) {
    return parts.join(', ');
  }

  return _text(
    address['fullAddress'] ?? address['address'],
    fallback: 'Address details unavailable',
  );
}

String _text(dynamic value, {String fallback = ''}) {
  if (value == null) {
    return fallback;
  }

  final String text = value.toString().trim();
  return text.isEmpty ? fallback : text;
}

String _friendlyError(Object? error) {
  final String message = error?.toString().trim() ?? '';

  if (message.startsWith('Bad state: ')) {
    return message.substring('Bad state: '.length);
  }

  return message.isEmpty ? 'Please try again.' : message;
}
