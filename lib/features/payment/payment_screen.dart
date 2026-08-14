import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/material.dart';

import '../../app/app_routes.dart';
import '../../core/theme/app_colors.dart';
import 'widgets/pay_now_bar.dart';
import 'widgets/payment_method_selector.dart';

class PaymentScreen extends StatefulWidget {
  const PaymentScreen({
    super.key,
    this.shoppingMode = 'home',
    this.deliveryMethod = 'quick',
    this.deliveryDate,
    this.deliverySlot = 'Earliest available',
    this.addressId = '',
    this.address = const <String, dynamic>{},
    this.subtotal = 0,
    this.productSavings = 0,
    this.couponCode = '',
    this.couponDiscount = 0,
    this.deliveryFee = 0,
    this.grandTotal = 0,
    this.itemCount = 0,
  });

  final String shoppingMode;
  final String deliveryMethod;
  final String? deliveryDate;
  final String deliverySlot;
  final String addressId;
  final Map<String, dynamic> address;
  final double subtotal;
  final double productSavings;
  final String couponCode;
  final double couponDiscount;
  final double deliveryFee;
  final double grandTotal;
  final int itemCount;

  @override
  State<PaymentScreen> createState() => _PaymentScreenState();
}

class _PaymentScreenState extends State<PaymentScreen> {
  PaymentMethodType _selectedMethod = PaymentMethodType.cashOnDelivery;
  bool _processing = false;

  User? get _user => FirebaseAuth.instance.currentUser;

  bool get _isCashOnDelivery =>
      _selectedMethod == PaymentMethodType.cashOnDelivery;

  double get _payableAmount {
    if (widget.grandTotal > 0) return widget.grandTotal;

    final double value =
        widget.subtotal - widget.couponDiscount + widget.deliveryFee;
    return value < 0 ? 0 : value;
  }

  DocumentReference<Map<String, dynamic>> _cartDocument(String userId) {
    return FirebaseFirestore.instance
        .collection('carts')
        .doc(userId);
  }

  void _selectMethod(PaymentMethodType method) {
    if (_processing) return;
    setState(() => _selectedMethod = method);
  }

  Future<void> _placeOrder() async {
    final User? user = _user;

    if (user == null) {
      _showMessage('Please login to continue.', error: true);
      return;
    }

    if (_processing) return;

    if (widget.addressId.trim().isEmpty || widget.address.isEmpty) {
      _showMessage('Delivery address is missing.', error: true);
      return;
    }

    setState(() => _processing = true);
    DocumentReference<Map<String, dynamic>>? orderReference;

    try {
      final FirebaseFirestore firestore = FirebaseFirestore.instance;
      final DocumentSnapshot<Map<String, dynamic>> cartSnapshot =
      await _cartDocument(user.uid).get();
      final dynamic rawItems = cartSnapshot.data()?['items'];
      final List<_PaymentCartItem> items = rawItems is Iterable
          ? rawItems
              .whereType<Map>()
              .map(
                (Map item) => _PaymentCartItem.fromMap(
                  item.map(
                    (dynamic key, dynamic value) =>
                        MapEntry<String, dynamic>(key.toString(), value),
                  ),
                ),
              )
              .toList(growable: false)
          : <_PaymentCartItem>[];

      if (items.isEmpty) {
        _showMessage('Your cart is empty.', error: true);
        return;
      }

      if (items.any((_PaymentCartItem item) => !item.inStock)) {
        _showMessage(
          'Remove out-of-stock products before placing the order.',
          error: true,
        );
        return;
      }

      if (items.any(
            (_PaymentCartItem item) => item.shoppingMode != widget.shoppingMode,
      )) {
        _showMessage(
          'Your cart contains products from another shopping mode.',
          error: true,
        );
        return;
      }

      double actualSubtotal = 0;
      double actualMrpTotal = 0;
      int actualItemCount = 0;

      for (final _PaymentCartItem item in items) {
        actualSubtotal += item.lineTotal;
        actualMrpTotal += item.lineMrp;
        actualItemCount += item.quantity;
      }

      if (actualMrpTotal < actualSubtotal) {
        actualMrpTotal = actualSubtotal;
      }

      final double productSavings = actualMrpTotal - actualSubtotal;
      double couponDiscount = widget.couponDiscount.clamp(
        0,
        actualSubtotal,
      ).toDouble();
      final double deliveryFee = widget.deliveryFee < 0 ? 0 : widget.deliveryFee;
      double totalAmount = actualSubtotal - couponDiscount + deliveryFee;
      if (totalAmount < 0) totalAmount = 0;

      orderReference = firestore.collection('orders').doc();
      final String orderNumber = _generateOrderNumber();
      final String paymentStatus =
      _isCashOnDelivery ? 'pending' : 'paid_test';
      final String transactionId =
      _isCashOnDelivery ? '' : _generateTransactionId();

      await orderReference.set(<String, dynamic>{
        'id': orderReference.id,
        'orderId': orderReference.id,
        'orderNumber': orderNumber,
        'userId': user.uid,
        'shoppingMode': widget.shoppingMode,
        'status': 'placed',
        'paymentStatus': paymentStatus,
        'paymentMethod': _selectedMethod.value,
        'transactionId': transactionId,
        'items': items
            .map((_PaymentCartItem item) => item.toMap())
            .toList(growable: false),
        'itemCount': actualItemCount,
        'subtotal': actualSubtotal,
        'mrpTotal': actualMrpTotal,
        'productSavings': productSavings,
        'couponCode': widget.couponCode,
        'couponDiscount': couponDiscount,
        'deliveryFee': deliveryFee,
        'totalAmount': totalAmount,
        'addressId': widget.addressId,
        'address': widget.address,
        'deliveryMethod': widget.deliveryMethod,
        'deliveryDate': widget.deliveryDate,
        'deliverySlot': widget.deliverySlot,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
        'statusHistory': <Map<String, dynamic>>[
          <String, dynamic>{
            'status': 'placed',
            'time': Timestamp.now(),
          },
        ],
      });

      final DocumentReference<Map<String, dynamic>> paymentReference =
      firestore.collection('payments').doc();

      await paymentReference.set(<String, dynamic>{
        'id': paymentReference.id,
        'paymentId': paymentReference.id,
        'userId': user.uid,
        'orderId': orderReference.id,
        'orderNumber': orderNumber,
        'method': _selectedMethod.value,
        'status': paymentStatus,
        'subtotal': actualSubtotal,
        'productSavings': productSavings,
        'couponCode': widget.couponCode,
        'couponDiscount': couponDiscount,
        'deliveryFee': deliveryFee,
        'totalAmount': totalAmount,
        'transactionId': transactionId,
        'gateway': _isCashOnDelivery ? 'cash_on_delivery' : 'test_gateway',
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });

      await orderReference.update(<String, dynamic>{
        'paymentId': paymentReference.id,
        'updatedAt': FieldValue.serverTimestamp(),
      });

      await _clearCart(user.uid);

      if (!mounted) return;

      Navigator.of(context).pushNamedAndRemoveUntil(
        AppRoutes.orderConfirmation,
            (Route<dynamic> route) => route.settings.name == AppRoutes.home,
        arguments: <String, dynamic>{
          'orderId': orderReference.id,
          'orderNumber': orderNumber,
          'shoppingMode': widget.shoppingMode,
          'paymentMethod': _selectedMethod.value,
          'paymentStatus': paymentStatus,
          'transactionId': transactionId,
          'totalAmount': totalAmount,
          'itemCount': actualItemCount,
          'deliveryMethod': widget.deliveryMethod,
          'deliveryDate': widget.deliveryDate,
          'deliverySlot': widget.deliverySlot,
          'address': widget.address,
        },
      );
    } on FirebaseException catch (error) {
      await _markOrderFailed(orderReference);
      _showMessage(error.message ?? 'Unable to place order.', error: true);
    } catch (_) {
      await _markOrderFailed(orderReference);
      _showMessage('Unable to complete the order.', error: true);
    } finally {
      if (mounted) setState(() => _processing = false);
    }
  }

  Future<void> _markOrderFailed(
      DocumentReference<Map<String, dynamic>>? reference,
      ) async {
    if (reference == null) return;

    try {
      await reference.set(<String, dynamic>{
        'status': 'failed',
        'updatedAt': FieldValue.serverTimestamp(),
      }, SetOptions(merge: true));
    } catch (_) {
      // The original payment failure is shown to the user.
    }
  }

  Future<void> _clearCart(
      String userId,
      ) async {
    final FirebaseFirestore firestore = FirebaseFirestore.instance;
    final QuerySnapshot<Map<String, dynamic>> legacySnapshot = await firestore
        .collection('carts')
        .doc(userId)
        .collection('items')
        .get();
    WriteBatch batch = firestore.batch();
    int operationCount = 0;

    for (final QueryDocumentSnapshot<Map<String, dynamic>> document
    in legacySnapshot.docs) {
      batch.delete(document.reference);
      operationCount++;

      if (operationCount >= 400) {
        await batch.commit();
        batch = firestore.batch();
        operationCount = 0;
      }
    }

    if (operationCount > 0) await batch.commit();

    await firestore.collection('carts').doc(userId).set(
      <String, dynamic>{
        'items': <Map<String, dynamic>>[],
        'itemCount': 0,
        'couponCode': '',
        'couponDiscount': 0,
        'updatedAt': FieldValue.serverTimestamp(),
      },
      SetOptions(merge: true),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_user == null) {
      return _LoginRequired(
        onLogin: () => Navigator.of(context).pushNamedAndRemoveUntil(
          AppRoutes.login,
              (Route<dynamic> route) => false,
        ),
      );
    }

    final bool desktop = MediaQuery.sizeOf(context).width >= 1000;

    return Scaffold(
      backgroundColor: AppColors.background,
      bottomNavigationBar: PayNowBar(
        amount: _payableAmount,
        isCashOnDelivery: _isCashOnDelivery,
        isProcessing: _processing,
        onPressed: _placeOrder,
      ),
      body: SafeArea(
        bottom: false,
        child: Column(
          children: <Widget>[
            _buildHeader(),
            Expanded(
              child: SingleChildScrollView(
                physics: const BouncingScrollPhysics(),
                padding: EdgeInsets.fromLTRB(
                  desktop ? 32 : 16,
                  18,
                  desktop ? 32 : 16,
                  30,
                ),
                child: Center(
                  child: ConstrainedBox(
                    constraints: const BoxConstraints(maxWidth: 1180),
                    child: desktop
                        ? Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: <Widget>[
                        Expanded(flex: 7, child: _buildPaymentSection()),
                        const SizedBox(width: 24),
                        Expanded(flex: 3, child: _buildSummaryCard()),
                      ],
                    )
                        : Column(
                      children: <Widget>[
                        _buildPaymentSection(),
                        const SizedBox(height: 22),
                        _buildSummaryCard(),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
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
            onPressed: _processing ? null : () => Navigator.of(context).pop(),
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
            child: const Icon(Icons.payments_rounded, color: AppColors.primary),
          ),
          const SizedBox(width: 11),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  'Payment',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                SizedBox(height: 2),
                Text(
                  'Choose your payment method',
                  style: TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10.5,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.lock_rounded, color: AppColors.primary, size: 19),
          const SizedBox(width: 13),
        ],
      ),
    );
  }

  Widget _buildPaymentSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: <Widget>[
        _buildHero(),
        const SizedBox(height: 24),
        PaymentMethodSelector(
          selectedMethod: _selectedMethod,
          enabled: !_processing,
          onChanged: _selectMethod,
        ),
        const SizedBox(height: 20),
        _buildNotice(),
        const SizedBox(height: 16),
        _buildAddressCard(),
      ],
    );
  }

  Widget _buildHero() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: <Color>[Color(0xFF043D22), Color(0xFF17A45B)],
        ),
        borderRadius: BorderRadius.circular(28),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x1D0B7A3E),
            blurRadius: 26,
            offset: Offset(0, 11),
          ),
        ],
      ),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                const Text(
                  'SECURE CHECKOUT',
                  style: TextStyle(
                    color: Color(0xFFDDF4E7),
                    fontSize: 8.5,
                    letterSpacing: 0.7,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 13),
                Text(
                  _isCashOnDelivery
                      ? 'Pay when your order arrives'
                      : 'Complete your payment securely',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 25,
                    height: 1.12,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _isCashOnDelivery
                      ? 'Place your fresh order now and pay during delivery.'
                      : 'Online methods currently work in development test mode.',
                  style: const TextStyle(
                    color: Color(0xFFDDF4E7),
                    fontSize: 11,
                    height: 1.45,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Icon(
            _isCashOnDelivery
                ? Icons.local_shipping_rounded
                : Icons.verified_user_rounded,
            color: const Color(0x55FFFFFF),
            size: 76,
          ),
        ],
      ),
    );
  }

  Widget _buildNotice() {
    final Color background =
    _isCashOnDelivery ? const Color(0xFFEAF7EF) : const Color(0xFFFFF7E8);
    final Color border =
    _isCashOnDelivery ? const Color(0xFFCDE7D6) : const Color(0xFFF0D49B);

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: background,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: border),
      ),
      child: Row(
        children: <Widget>[
          Icon(
            _isCashOnDelivery
                ? Icons.check_circle_outline_rounded
                : Icons.info_outline_rounded,
            color: _isCashOnDelivery
                ? AppColors.primary
                : const Color(0xFFE39A18),
          ),
          const SizedBox(width: 11),
          Expanded(
            child: Text(
              _isCashOnDelivery
                  ? 'Cash on Delivery does not require an online payment gateway.'
                  : 'This online option is currently in test mode. A real gateway can be connected later.',
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 10,
                height: 1.45,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAddressCard() {
    final String label = _text(widget.address['label'], fallback: 'Delivery Address');
    final String name = _text(widget.address['fullName']);
    String fullAddress = _text(widget.address['displayAddress']);

    if (fullAddress.isEmpty) {
      fullAddress = <String>[
        _text(widget.address['house']),
        _text(widget.address['area']),
        _text(widget.address['landmark']),
        _text(widget.address['city']),
        _text(widget.address['state']),
        _text(widget.address['pincode']),
      ].where((String value) => value.isNotEmpty).join(', ');
    }

    return _WhiteCard(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: <Widget>[
          const CircleAvatar(
            radius: 24,
            backgroundColor: Color(0xFFEAF7EF),
            child: Icon(Icons.location_on_rounded, color: AppColors.primary),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: <Widget>[
                Text(
                  label,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 12.5,
                    fontWeight: FontWeight.w900,
                  ),
                ),
                if (name.isNotEmpty) ...<Widget>[
                  const SizedBox(height: 4),
                  Text(
                    name,
                    style: const TextStyle(
                      color: AppColors.textPrimary,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  fullAddress.isEmpty ? 'Address details unavailable' : fullAddress,
                  style: const TextStyle(
                    color: AppColors.textSecondary,
                    fontSize: 10,
                    height: 1.45,
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

  Widget _buildSummaryCard() {
    return _WhiteCard(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: <Widget>[
          const Text(
            'Payment Summary',
            style: TextStyle(
              color: AppColors.textPrimary,
              fontSize: 18,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 18),
          _SummaryRow(label: 'Item subtotal', value: _currency(widget.subtotal)),
          if (widget.productSavings > 0) ...<Widget>[
            const SizedBox(height: 11),
            _SummaryRow(
              label: 'Product savings',
              value: '- ${_currency(widget.productSavings)}',
              highlight: true,
            ),
          ],
          if (widget.couponDiscount > 0) ...<Widget>[
            const SizedBox(height: 11),
            _SummaryRow(
              label: widget.couponCode.isEmpty
                  ? 'Coupon discount'
                  : 'Coupon (${widget.couponCode})',
              value: '- ${_currency(widget.couponDiscount)}',
              highlight: true,
            ),
          ],
          const SizedBox(height: 11),
          _SummaryRow(
            label: 'Delivery fee',
            value: widget.deliveryFee <= 0
                ? 'FREE'
                : _currency(widget.deliveryFee),
            highlight: widget.deliveryFee <= 0,
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 15),
            child: Divider(color: AppColors.border),
          ),
          _SummaryRow(
            label: 'Amount to Pay',
            value: _currency(_payableAmount),
            bold: true,
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFEAF7EF),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Text(
              _isCashOnDelivery
                  ? 'Payment remains pending until delivery.'
                  : 'Test payment will be recorded securely.',
              textAlign: TextAlign.center,
              style: const TextStyle(
                color: AppColors.primary,
                fontSize: 9.5,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _generateOrderNumber() {
    final String value = DateTime.now().millisecondsSinceEpoch.toString();
    final String suffix =
    value.length > 7 ? value.substring(value.length - 7) : value;
    return 'FTH$suffix';
  }

  String _generateTransactionId() {
    return 'TXN${DateTime.now().millisecondsSinceEpoch}';
  }

  void _showMessage(String message, {bool error = false}) {
    if (!mounted) return;

    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          behavior: SnackBarBehavior.floating,
          margin: const EdgeInsets.all(16),
          backgroundColor: error ? AppColors.error : AppColors.primary,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
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

class _WhiteCard extends StatelessWidget {
  const _WhiteCard({required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: AppColors.border),
        boxShadow: const <BoxShadow>[
          BoxShadow(
            color: Color(0x09000000),
            blurRadius: 20,
            offset: Offset(0, 8),
          ),
        ],
      ),
      child: child,
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.highlight = false,
    this.bold = false,
  });

  final String label;
  final String value;
  final bool highlight;
  final bool bold;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: <Widget>[
        Expanded(
          child: Text(
            label,
            style: TextStyle(
              color: bold ? AppColors.textPrimary : AppColors.textSecondary,
              fontSize: bold ? 13 : 10.5,
              fontWeight: bold ? FontWeight.w900 : FontWeight.w600,
            ),
          ),
        ),
        const SizedBox(width: 10),
        Text(
          value,
          style: TextStyle(
            color: highlight ? AppColors.primary : AppColors.textPrimary,
            fontSize: bold ? 15 : 11,
            fontWeight: FontWeight.w900,
          ),
        ),
      ],
    );
  }
}

class _LoginRequired extends StatelessWidget {
  const _LoginRequired({required this.onLogin});

  final VoidCallback onLogin;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(28),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              const Icon(
                Icons.lock_person_rounded,
                color: AppColors.primary,
                size: 60,
              ),
              const SizedBox(height: 16),
              const Text(
                'Login required',
                style: TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 20,
                  fontWeight: FontWeight.w900,
                ),
              ),
              const SizedBox(height: 18),
              FilledButton(onPressed: onLogin, child: const Text('LOGIN')),
            ],
          ),
        ),
      ),
    );
  }
}

class _PaymentCartItem {
  const _PaymentCartItem({
    required this.documentId,
    required this.productId,
    required this.name,
    required this.category,
    required this.image,
    required this.shoppingMode,
    required this.unit,
    required this.unitPrice,
    required this.mrp,
    required this.quantity,
    required this.inStock,
  });

  final String documentId;
  final String productId;
  final String name;
  final String category;
  final String image;
  final String shoppingMode;
  final String unit;
  final double unitPrice;
  final double mrp;
  final int quantity;
  final bool inStock;

  double get lineTotal => unitPrice * quantity;
  double get lineMrp => mrp * quantity;

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'cartItemId': documentId,
      'productId': productId,
      'name': name,
      'category': category,
      'imageUrl': image,
      'shoppingMode': shoppingMode,
      'unit': unit,
      'unitPrice': unitPrice,
      'mrp': mrp,
      'quantity': quantity,
      'lineTotal': lineTotal,
      'inStock': inStock,
    };
  }

  factory _PaymentCartItem.fromMap(Map<String, dynamic> data) {
    final double price = _toDouble(data['unitPrice'] ?? data['price']);
    double mrp = _toDouble(data['mrp'], fallback: price);
    if (mrp < price) mrp = price;

    return _PaymentCartItem(
      documentId: _text(data['id'] ?? data['cartItemId'] ?? data['productId']),
      productId: _text(data['productId']),
      name: _text(data['name'], fallback: 'Fresh Product'),
      category: _text(data['category']),
      image: _text(data['imageUrl'] ?? data['image']),
      shoppingMode: _text(data['shoppingMode']).toLowerCase() == 'shop'
          ? 'shop'
          : 'home',
      unit: _text(data['unit'], fallback: '1 unit'),
      unitPrice: price,
      mrp: mrp,
      quantity: _toInt(data['quantity'], fallback: 1),
      inStock: data['inStock'] is bool ? data['inStock'] as bool : true,
    );
  }
}

String _text(dynamic value, {String fallback = ''}) {
  final String text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}

double _toDouble(dynamic value, {double fallback = 0}) {
  if (value is num) return value.toDouble();

  final String cleaned = value
      ?.toString()
      .replaceAll(',', '')
      .replaceAll(RegExp(r'[^0-9.\-]'), '') ??
      '';
  return double.tryParse(cleaned) ?? fallback;
}

int _toInt(dynamic value, {int fallback = 0}) {
  if (value is num) return value.toInt();
  return int.tryParse(value?.toString().trim() ?? '') ?? fallback;
}

String _currency(double value) {
  if (value == value.roundToDouble()) return '₹${value.toStringAsFixed(0)}';
  return '₹${value.toStringAsFixed(2)}';
}
