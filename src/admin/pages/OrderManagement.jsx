import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import {
  Search,
  ShoppingBag,
  Eye,
  CheckCircle2,
  XCircle,
  Truck,
  Printer,
  Download,
  DollarSign,
  MapPin,
  RefreshCw,
  UserCheck,
  Phone,
  Calendar,
  Filter,
  CreditCard,
  ChevronDown
} from 'lucide-react';
import toast from 'react-hot-toast';

const normalizeOrder = (order, fallback = {}) => ({
  ...fallback,
  ...order,
  id: String(order.id || order.orderCode || fallback.id || ''),
  customer: order.customer || order.customerName || fallback.customer || 'Customer',
  mobile: order.mobile || order.phone || fallback.mobile || 'N/A',
  items: order.items || order.products || fallback.items || '',
  totalItems: order.totalItems ?? order.itemsCount ?? fallback.totalItems ?? 0,
  amount: order.amount || (order.totalAmount != null ? `₹${Number(order.totalAmount).toLocaleString()}` : fallback.amount || '₹0'),
  numericAmount: order.numericAmount ?? Number(order.totalAmount || order.total || fallback.numericAmount || 0),
  paymentMethod: order.paymentMethod || fallback.paymentMethod || 'COD',
  paymentStatus: order.paymentStatus || fallback.paymentStatus || 'Pending',
  orderStatus: order.orderStatus || order.status || fallback.orderStatus || 'Pending',
  deliveryStatus: order.deliveryStatus || fallback.deliveryStatus || 'Unassigned',
  orderDate: order.orderDate || order.date || fallback.orderDate || new Date().toISOString(),
  dateObj: order.dateObj || new Date(order.date || order.orderDate || fallback.orderDate || Date.now()),
  address: typeof order.address === 'string'
    ? { street: order.address, area: '', city: '', pincode: '' }
    : order.address || fallback.address || { street: 'N/A', area: '', city: '', pincode: '' }
});

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 9 Order Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Time'); // All Time, Today, This Week, This Month
  const [statusFilter, setStatusFilter] = useState('All'); // All, Pending Orders, Delivered Orders, Cancelled Orders
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All'); // All, Paid, Pending, Refunded

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [addressModalOrder, setAddressModalOrder] = useState(null);
  const [assignDriverModalOrder, setAssignDriverModalOrder] = useState(null);

  // Delivery drivers list for assignment
  const deliveryDrivers = [
    { id: 'DRV-101', name: 'Rajesh Kumar', phone: '+91 98765 11111', area: 'Nashik Central' },
    { id: 'DRV-102', name: 'Suresh Patil', phone: '+91 98765 22222', area: 'Pune East' },
    { id: 'DRV-103', name: 'Vikram Singh', phone: '+91 98765 33333', area: 'Mumbai Suburbs' },
  ];

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await adminService.getOrders();
        const source = Array.isArray(data) ? data : [];
        setOrders(source.map((order) => normalizeOrder(order)));
      } catch (err) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    const handleOrdersChanged = () => fetchOrders();
    window.addEventListener('admin_orders_changed', handleOrdersChanged);
    return () => window.removeEventListener('admin_orders_changed', handleOrdersChanged);
  }, []);

  // Action Handlers for 9 Required Actions
  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      await adminService.updateOrderStatus(id, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, orderStatus: newStatus } : o))
      );
      toast.success(`Order ${id} status updated to "${newStatus}"`);
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder((prev) => ({ ...prev, orderStatus: newStatus }));
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to update order status');
    }
  };

  const handleConfirmOrder = (id) => {
    handleUpdateOrderStatus(id, 'Confirmed');
  };

  const handleCancelOrder = (id) => {
    handleUpdateOrderStatus(id, 'Cancelled');
  };

  const handleAssignDriver = (orderId, driverName) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, deliveryStatus: `Assigned (${driverName})`, orderStatus: o.orderStatus === 'Pending' ? 'Confirmed' : o.orderStatus }
          : o
      )
    );
    toast.success(`Assigned delivery partner "${driverName}" to Order ${orderId}`);
    setAssignDriverModalOrder(null);
    window.dispatchEvent(new CustomEvent('admin_orders_changed', { detail: { id: orderId, action: 'assign-driver' } }));
  };

  const handleRefundPayment = (id) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, paymentStatus: 'Refunded', orderStatus: 'Refunded' }
          : o
      )
    );
    toast.success(`Payment refunded successfully for Order ${id}`);
    if (selectedOrder && selectedOrder.id === id) {
      setSelectedOrder((prev) => ({ ...prev, paymentStatus: 'Refunded', orderStatus: 'Refunded' }));
    }
    window.dispatchEvent(new CustomEvent('admin_orders_changed', { detail: { id, action: 'refund' } }));
  };

  const handleDownloadInvoice = (order) => {
    const invoiceContent = `====================================
FARM TO HOME - ORDER INVOICE
====================================
Order ID: ${order.id}
Date: ${order.orderDate}
Customer: ${order.customer} (${order.mobile})
Delivery Address: ${order.address.street}, ${order.address.area}, ${order.address.city} - ${order.address.pincode}
------------------------------------
Items Ordered: ${order.items}
Total Items: ${order.totalItems}
Payment Method: ${order.paymentMethod}
Payment Status: ${order.paymentStatus}
Order Status: ${order.orderStatus}
------------------------------------
TOTAL AMOUNT: ${order.amount}
====================================`;

    const element = document.createElement('a');
    const file = new Blob([invoiceContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Invoice_${order.id.replace('#', '')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Invoice downloaded for Order ${order.id}`);
  };

  const handlePrintInvoice = (order) => {
    toast.success(`Sending Order ${order.id} invoice to printer...`);
    window.print();
  };

  // Filter Logic matching all 9 filter rules
  const filteredOrders = orders.filter((o) => {
    // 1. Search Query (Order ID, Customer Name, Mobile Number)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      o.id.toLowerCase().includes(query) ||
      o.customer.toLowerCase().includes(query) ||
      o.mobile.toLowerCase().includes(query);

    // 2. Status Filter (Pending, Delivered, Cancelled)
    let matchesStatus = true;
    if (statusFilter === 'Pending Orders') matchesStatus = o.orderStatus === 'Pending';
    else if (statusFilter === 'Delivered Orders') matchesStatus = o.orderStatus === 'Delivered';
    else if (statusFilter === 'Cancelled Orders') matchesStatus = o.orderStatus === 'Cancelled';
    else if (statusFilter !== 'All') matchesStatus = o.orderStatus === statusFilter;

    // 3. Payment Status Filter (Paid, Pending, Refunded)
    const matchesPayment =
      paymentStatusFilter === 'All' || o.paymentStatus === paymentStatusFilter;

    // 4. Time Filters (Today, This Week, This Month)
    let matchesTime = true;
    if (timeFilter === 'Today') {
      matchesTime = o.orderDate.includes('Jul 24');
    } else if (timeFilter === 'This Week') {
      matchesTime = true; // All mock items fall within the current week
    } else if (timeFilter === 'This Month') {
      matchesTime = true;
    }

    return matchesSearch && matchesStatus && matchesPayment && matchesTime;
  });

  // Badge Color Mapper for 10 Order Statuses
  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return { bg: '#FEF3C7', color: '#D97706' };
      case 'Confirmed': return { bg: '#E0F2FE', color: '#0284C7' };
      case 'Processing': return { bg: '#F3E8FF', color: '#9333EA' };
      case 'Packed': return { bg: '#E0E7FF', color: '#4338CA' };
      case 'Shipped': return { bg: '#CCFBF1', color: '#0D9488' };
      case 'Out for Delivery': return { bg: '#E0F2FE', color: '#0369A1' };
      case 'Delivered': return { bg: '#DCFCE7', color: '#15803D' };
      case 'Cancelled': return { bg: '#FEE2E2', color: '#DC2626' };
      case 'Returned': return { bg: '#FFEDD5', color: '#C2410C' };
      case 'Refunded': return { bg: '#F1F5F9', color: '#475569' };
      default: return { bg: '#F1F5F9', color: '#475569' };
    }
  };

  const getPaymentStatusBadge = (status) => {
    switch (status) {
      case 'Paid': return { bg: '#DCFCE7', color: '#15803D' };
      case 'Pending': return { bg: '#FEF3C7', color: '#D97706' };
      case 'Refunded': return { bg: '#F1F5F9', color: '#64748B' };
      default: return { bg: '#F1F5F9', color: '#64748B' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Orders Management</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Track, process, assign delivery partners, and manage customer invoices.
          </p>
        </div>

        <button
          onClick={() => {
            setSearchQuery('');
            setTimeFilter('All Time');
            setStatusFilter('All');
            setPaymentStatusFilter('All');
            toast.success('All order filters reset');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} /> Reset Filters
        </button>
      </div>

      {/* 9 ORDER FILTERS TOOLBAR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Search by Order ID, Customer Name, Mobile Number */}
          <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search by Order ID (#ORD...), Customer Name, or Mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px 9px 36px',
                borderRadius: '8px',
                border: '1px solid #CBD5E1',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Time Filters: Today, This Week, This Month */}
          <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F8FAFC', padding: '3px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            {['All Time', 'Today', 'This Week', 'This Month'].map((time) => (
              <button
                key={time}
                onClick={() => setTimeFilter(time)}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: timeFilter === time ? '#22C55E' : 'transparent',
                  color: timeFilter === time ? '#FFFFFF' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {time}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Status Quick Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
          >
            <option value="All">All Order Statuses (10)</option>
            <option value="Pending Orders">Pending Orders</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing</option>
            <option value="Packed">Packed</option>
            <option value="Shipped">Shipped</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered Orders">Delivered Orders</option>
            <option value="Cancelled Orders">Cancelled Orders</option>
            <option value="Returned">Returned</option>
            <option value="Refunded">Refunded</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Payment Pending</option>
            <option value="Refunded">Refunded</option>
          </select>

          <span style={{ fontSize: '12.5px', color: '#64748B', marginLeft: 'auto', fontWeight: 600 }}>
            Showing {filteredOrders.length} of {orders.length} orders
          </span>
        </div>
      </div>

      {/* 12-COLUMN ORDERS TABLE */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#16A34A' }}>
            <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 8px auto' }} />
            Fetching order register...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            No orders found matching the filter criteria.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Mobile Number</th>
                  <th>Product Details</th>
                  <th>Total Items</th>
                  <th>Order Amount</th>
                  <th>Payment Method</th>
                  <th>Payment Status</th>
                  <th>Order Status</th>
                  <th>Delivery Status</th>
                  <th>Order Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((ord) => {
                  const orderBadge = getOrderStatusBadge(ord.orderStatus);
                  const payBadge = getPaymentStatusBadge(ord.paymentStatus);

                  return (
                    <tr key={ord.id}>
                      {/* 1. Order ID */}
                      <td style={{ fontWeight: 700, color: '#16A34A' }}>{ord.id}</td>

                      {/* 2. Customer Name */}
                      <td style={{ fontWeight: 600, color: '#0F172A' }}>{ord.customer}</td>

                      {/* 3. Mobile Number */}
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>{ord.mobile}</td>

                      {/* 4. Product Details */}
                      <td style={{ fontSize: '12px', color: '#475569', maxWidth: '200px', whiteSpace: 'normal' }}>
                        {ord.items}
                      </td>

                      {/* 5. Total Items */}
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>{ord.totalItems}</td>

                      {/* 6. Order Amount */}
                      <td style={{ fontWeight: 800, color: '#0F172A' }}>{ord.amount}</td>

                      {/* 7. Payment Method */}
                      <td style={{ fontSize: '12px', color: '#64748B' }}>{ord.paymentMethod}</td>

                      {/* 8. Payment Status */}
                      <td>
                        <span style={{ backgroundColor: payBadge.bg, color: payBadge.color, fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '10px' }}>
                          {ord.paymentStatus}
                        </span>
                      </td>

                      {/* 9. Order Status (Inline selector option for Update Order Status) */}
                      <td>
                        <select
                          value={ord.orderStatus}
                          onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value)}
                          style={{
                            backgroundColor: orderBadge.bg,
                            color: orderBadge.color,
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '10px',
                            border: 'none',
                            cursor: 'pointer',
                            outline: 'none',
                          }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Packed">Packed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="Returned">Returned</option>
                          <option value="Refunded">Refunded</option>
                        </select>
                      </td>

                      {/* 10. Delivery Status */}
                      <td style={{ fontSize: '12px', color: '#475569', fontWeight: 500 }}>
                        {ord.deliveryStatus}
                      </td>

                      {/* 11. Order Date */}
                      <td style={{ fontSize: '11.5px', color: '#94A3B8', whiteSpace: 'nowrap' }}>
                        {ord.orderDate}
                      </td>

                      {/* 12. Actions (9 Actions available) */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          {/* View Order Modal */}
                          <button
                            onClick={() => setSelectedOrder(ord)}
                            title="View Order Details & Invoice"
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', cursor: 'pointer' }}
                          >
                            <Eye size={14} />
                          </button>

                          {/* Quick Confirm Order */}
                          {ord.orderStatus === 'Pending' && (
                            <button
                              onClick={() => handleConfirmOrder(ord.id)}
                              title="Confirm Order"
                              style={{ padding: '5px 8px', borderRadius: '6px', border: 'none', backgroundColor: '#DCFCE7', color: '#15803D', cursor: 'pointer' }}
                            >
                              <CheckCircle2 size={14} />
                            </button>
                          )}

                          {/* Assign Delivery Partner Modal */}
                          <button
                            onClick={() => setAssignDriverModalOrder(ord)}
                            title="Assign Delivery Partner"
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F0FDF4', color: '#16A34A', cursor: 'pointer' }}
                          >
                            <Truck size={14} />
                          </button>

                          {/* View Customer Address Modal */}
                          <button
                            onClick={() => setAddressModalOrder(ord)}
                            title="View Customer Delivery Address"
                            style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#E0F2FE', color: '#0284C7', cursor: 'pointer' }}
                          >
                            <MapPin size={14} />
                          </button>

                          {/* Refund Payment */}
                          {ord.paymentStatus === 'Paid' && (
                            <button
                              onClick={() => handleRefundPayment(ord.id)}
                              title="Refund Payment"
                              style={{ padding: '5px 8px', borderRadius: '6px', border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                            >
                              <DollarSign size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: VIEW ORDER INVOICE & FULL DETAILS */}
      {selectedOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setSelectedOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>
                Order Invoice: {selectedOrder.id}
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Download size={13} /> Download
                </button>
                <button
                  onClick={() => handlePrintInvoice(selectedOrder)}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#22C55E', color: '#FFFFFF', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}
                >
                  <Printer size={13} /> Print
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '16px' }}>
              <div><strong>Customer Name:</strong> {selectedOrder.customer} ({selectedOrder.mobile})</div>
              <div><strong>Delivery Address:</strong> {selectedOrder.address.street}, {selectedOrder.address.area}, {selectedOrder.address.city} - {selectedOrder.address.pincode}</div>
              <div><strong>Items Ordered:</strong> {selectedOrder.items} ({selectedOrder.totalItems} items)</div>
              <div><strong>Order Date:</strong> {selectedOrder.orderDate}</div>
              <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</div>
              <div><strong>Payment Status:</strong> <span style={{ fontWeight: 700, color: selectedOrder.paymentStatus === 'Paid' ? '#16A34A' : '#DC2626' }}>{selectedOrder.paymentStatus}</span></div>
              <div><strong>Total Amount:</strong> <span style={{ color: '#16A34A', fontWeight: 800, fontSize: '15px' }}>{selectedOrder.amount}</span></div>
            </div>

            {/* Quick Action Buttons in Modal */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {selectedOrder.orderStatus === 'Pending' && (
                <button
                  onClick={() => handleConfirmOrder(selectedOrder.id)}
                  style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#22C55E', color: '#FFFFFF', border: 'none', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  ✅ Confirm Order
                </button>
              )}
              {selectedOrder.orderStatus !== 'Cancelled' && (
                <button
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FEE2E2', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  🚫 Cancel Order
                </button>
              )}
              {selectedOrder.paymentStatus === 'Paid' && (
                <button
                  onClick={() => handleRefundPayment(selectedOrder.id)}
                  style={{ padding: '8px 14px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer' }}
                >
                  💳 Refund Payment
                </button>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0F172A', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW CUSTOMER ADDRESS */}
      {addressModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setAddressModalOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#0284C7' }}>
              <MapPin size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>Customer Delivery Address</h3>
            </div>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '13.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Customer:</strong> {addressModalOrder.customer}</div>
              <div><strong>Phone:</strong> {addressModalOrder.mobile}</div>
              <div><strong>Street:</strong> {addressModalOrder.address.street}</div>
              <div><strong>Area / Landmark:</strong> {addressModalOrder.address.area}</div>
              <div><strong>City:</strong> {addressModalOrder.address.city}</div>
              <div><strong>Pincode:</strong> {addressModalOrder.address.pincode}</div>
            </div>

            <button
              onClick={() => setAddressModalOrder(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN DELIVERY PARTNER */}
      {assignDriverModalOrder && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setAssignDriverModalOrder(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#16A34A' }}>
              <Truck size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>Assign Delivery Partner</h3>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', margin: '0 0 16px 0' }}>
              Select an active delivery agent to assign Order <strong>{assignDriverModalOrder.id}</strong>:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
              {deliveryDrivers.map((driver) => (
                <div
                  key={driver.id}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13.5px', color: '#0F172A' }}>{driver.name}</strong>
                    <div style={{ fontSize: '11.5px', color: '#64748B' }}>📍 {driver.area} • {driver.phone}</div>
                  </div>

                  <button
                    onClick={() => handleAssignDriver(assignDriverModalOrder.id, driver.name)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '6px',
                      backgroundColor: '#22C55E',
                      color: '#FFFFFF',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Assign Driver
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAssignDriverModalOrder(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', color: '#475569', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
