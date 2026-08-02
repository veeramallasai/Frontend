import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  Search, 
  Filter, 
  Calendar, 
  ArrowLeft, 
  Eye, 
  UserPlus, 
  RefreshCw, 
  Clock, 
  XCircle, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  User, 
  CreditCard,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import deliveryService from '../../../services/deliveryService';
import adminService from '../../../services/adminService';

const initialDeliveriesDataset = [
  {
    orderId: 'ORD-9912',
    customerName: 'Ramesh Kumar',
    customerMobile: '+91 98765 11223',
    deliveryAddress: 'Flat 402, Green Valley Apts, Madhapur, Hyderabad',
    deliveryPartner: 'Speedy Express (Suresh)',
    deliveryDate: '2026-07-31',
    deliveryTime: '10:00 AM - 12:00 PM',
    orderAmount: 1250,
    paymentStatus: 'PAID',
    deliveryStatus: 'OUT_FOR_DELIVERY'
  },
  {
    orderId: 'ORD-9945',
    customerName: 'Sneha Patel',
    customerMobile: '+91 98123 44556',
    deliveryAddress: 'Plot 88, Road No 10, Jubilee Hills, Hyderabad',
    deliveryPartner: 'FarmLogistics (Raju)',
    deliveryDate: '2026-07-31',
    deliveryTime: '02:00 PM - 04:00 PM',
    orderAmount: 650,
    paymentStatus: 'PAID',
    deliveryStatus: 'IN_TRANSIT'
  },
  {
    orderId: 'ORD-9880',
    customerName: 'Amit Singh',
    customerMobile: '+91 97654 22334',
    deliveryAddress: 'House 12-4, Gachibowli DLF Phase 1, Hyderabad',
    deliveryPartner: 'Unassigned',
    deliveryDate: '2026-08-01',
    deliveryTime: '09:00 AM - 11:00 AM',
    orderAmount: 840,
    paymentStatus: 'PENDING',
    deliveryStatus: 'SCHEDULED'
  },
  {
    orderId: 'ORD-9988',
    customerName: 'Priya Sharma',
    customerMobile: '+91 99887 11223',
    deliveryAddress: 'Villa 5, Palm Meadows, Banjara Hills, Hyderabad',
    deliveryPartner: 'GreenExpress (Venkatesh)',
    deliveryDate: '2026-07-31',
    deliveryTime: '04:00 PM - 06:00 PM',
    orderAmount: 2400,
    paymentStatus: 'PAID',
    deliveryStatus: 'PICKED_UP'
  },
  {
    orderId: 'ORD-9991',
    customerName: 'Kavita Reddy',
    customerMobile: '+91 94401 22334',
    deliveryAddress: 'Door 4-12, MG Road, Vijayawada',
    deliveryPartner: 'Unassigned',
    deliveryDate: '2026-08-02',
    deliveryTime: '11:00 AM - 01:00 PM',
    orderAmount: 890,
    paymentStatus: 'PAID',
    deliveryStatus: 'CONFIRMED'
  }
];

export default function DeliveryList({ filter = 'active', title = 'Deliveries Management' }) {
  const navigate = useNavigate();
  const [deliveries, setDeliveries] = useState(initialDeliveriesDataset);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('ALL');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('ALL');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Order Modal Action States
  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [showModalType, setShowModalType] = useState(null); // 'VIEW' | 'ASSIGN' | 'STATUS' | 'RESCHEDULE' | 'CANCEL'
  const [assignedPartner, setAssignedPartner] = useState('');
  const [updatedStatus, setUpdatedStatus] = useState('');
  const [newDeliveryDate, setNewDeliveryDate] = useState('');

  useEffect(() => {
    loadDeliveries();
  }, [filter]);

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      let data = [];
      if (filter === 'active') data = await deliveryService.getActiveDeliveries();
      else if (filter === 'scheduled') data = await deliveryService.getScheduledDeliveries();
      else if (filter === 'today') data = await deliveryService.getTodayDeliveries();
      else if (filter === 'week') data = await deliveryService.getWeekDeliveries();
      else if (filter === 'month') data = await deliveryService.getMonthDeliveries();

      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(o => ({
          orderId: o.orderCode || o.id || 'ORD-100',
          customerName: o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() : 'Customer',
          customerMobile: o.customer?.phone || o.phone || 'N/A',
          deliveryAddress: o.shippingAddress || o.location || 'Hyderabad, TS',
          deliveryPartner: o.deliveryPartner || 'Unassigned',
          deliveryDate: o.deliveryDate || (o.createdAt ? String(o.createdAt).split('T')[0] : '2026-07-31'),
          deliveryTime: o.deliveryTimeSlot || '10:00 AM - 01:00 PM',
          orderAmount: o.totalAmount || o.orderAmount || 500,
          paymentStatus: o.paymentStatus || 'PAID',
          deliveryStatus: o.status || 'OUT_FOR_DELIVERY'
        }));
        setDeliveries(formatted);
      }
    } catch (err) {
      console.warn('Using demo delivery list fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      // Category filter matching status rules
      if (filter === 'active') {
        const st = (d.deliveryStatus || '').toUpperCase();
        if (!['OUT_FOR_DELIVERY', 'PICKED_UP', 'IN_TRANSIT', 'PROCESSING', 'SHIPPED'].includes(st)) {
          return false;
        }
      } else if (filter === 'scheduled') {
        const st = (d.deliveryStatus || '').toUpperCase();
        if (!['CONFIRMED', 'PACKED', 'SCHEDULED', 'PENDING'].includes(st)) {
          return false;
        }
      }

      if (searchOrderId && !d.orderId.toLowerCase().includes(searchOrderId.toLowerCase())) return false;
      if (searchCustomer && !d.customerName.toLowerCase().includes(searchCustomer.toLowerCase())) return false;
      if (deliveryStatusFilter !== 'ALL' && d.deliveryStatus !== deliveryStatusFilter) return false;
      if (paymentStatusFilter !== 'ALL' && d.paymentStatus !== paymentStatusFilter) return false;
      if (partnerFilter !== 'ALL' && !d.deliveryPartner.toLowerCase().includes(partnerFilter.toLowerCase())) return false;

      if (startDateFilter) {
        const dDate = new Date(d.deliveryDate);
        if (dDate < new Date(startDateFilter)) return false;
      }
      if (endDateFilter) {
        const dDate = new Date(d.deliveryDate);
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59);
        if (dDate > end) return false;
      }

      return true;
    });
  }, [deliveries, filter, searchOrderId, searchCustomer, deliveryStatusFilter, paymentStatusFilter, partnerFilter, startDateFilter, endDateFilter]);

  const totalPages = Math.ceil(filteredDeliveries.length / itemsPerPage) || 1;
  const paginatedDeliveries = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDeliveries.slice(start, start + itemsPerPage);
  }, [filteredDeliveries, currentPage]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/admin/deliveries');
    }
  };

  const handleAssignPartnerSubmit = (e) => {
    e.preventDefault();
    setDeliveries(prev => prev.map(d => d.orderId === selectedDelivery.orderId ? { ...d, deliveryPartner: assignedPartner } : d));
    toast.success(`Assigned delivery partner ${assignedPartner} to order ${selectedDelivery.orderId}`);
    setShowModalType(null);
  };

  const handleUpdateStatusSubmit = (e) => {
    e.preventDefault();
    setDeliveries(prev => prev.map(d => d.orderId === selectedDelivery.orderId ? { ...d, deliveryStatus: updatedStatus } : d));
    toast.success(`Updated order ${selectedDelivery.orderId} status to ${updatedStatus}`);
    setShowModalType(null);
  };

  const handleRescheduleSubmit = (e) => {
    e.preventDefault();
    setDeliveries(prev => prev.map(d => d.orderId === selectedDelivery.orderId ? { ...d, deliveryDate: newDeliveryDate, deliveryStatus: 'SCHEDULED' } : d));
    toast.success(`Rescheduled order ${selectedDelivery.orderId} to ${newDeliveryDate}`);
    setShowModalType(null);
  };

  const handleCancelSubmit = () => {
    setDeliveries(prev => prev.map(d => d.orderId === selectedDelivery.orderId ? { ...d, deliveryStatus: 'CANCELLED' } : d));
    toast.success(`Cancelled delivery for order ${selectedDelivery.orderId}`);
    setShowModalType(null);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600" />
            <span>Back</span>
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900">{title}</h1>
            <p className="text-xs text-slate-500">Manage and track delivery dispatches & status workflow.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/deliveries')}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
          >
            Delivery Overview
          </button>
          <button
            onClick={loadDeliveries}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Multi-Criteria Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-emerald-600" />
            <span>Delivery Filters & Search</span>
          </span>
          <button
            onClick={() => {
              setSearchOrderId('');
              setSearchCustomer('');
              setDeliveryStatusFilter('ALL');
              setPaymentStatusFilter('ALL');
              setStartDateFilter('');
              setEndDateFilter('');
              setPartnerFilter('ALL');
            }}
            className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Order ID */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Order ID</label>
            <input
              type="text"
              placeholder="e.g. ORD-9912"
              value={searchOrderId}
              onChange={e => setSearchOrderId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Customer Name */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Customer Name</label>
            <input
              type="text"
              placeholder="e.g. Ramesh"
              value={searchCustomer}
              onChange={e => setSearchCustomer(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Delivery Status */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery Status</label>
            <select
              value={deliveryStatusFilter}
              onChange={e => setDeliveryStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Status</label>
            <select
              value={paymentStatusFilter}
              onChange={e => setPaymentStatusFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="ALL">All Payments</option>
              <option value="PAID">Paid</option>
              <option value="PENDING">Pending (COD)</option>
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery Date</label>
            <input
              type="date"
              value={startDateFilter}
              onChange={e => setStartDateFilter(e.target.value)}
              className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
          </div>

          {/* Delivery Partner */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Delivery Partner</label>
            <select
              value={partnerFilter}
              onChange={e => setPartnerFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            >
              <option value="ALL">All Partners</option>
              <option value="Speedy">Speedy Express</option>
              <option value="FarmLogistics">FarmLogistics</option>
              <option value="GreenExpress">GreenExpress</option>
              <option value="Unassigned">Unassigned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Deliveries Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5">Order ID</th>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Customer Mobile</th>
                <th className="px-4 py-3.5">Delivery Address</th>
                <th className="px-4 py-3.5">Delivery Partner</th>
                <th className="px-4 py-3.5">Delivery Date</th>
                <th className="px-4 py-3.5">Delivery Time</th>
                <th className="px-4 py-3.5 text-right">Order Amount</th>
                <th className="px-4 py-3.5">Payment</th>
                <th className="px-4 py-3.5">Delivery Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDeliveries.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-6 py-10 text-center text-slate-400">
                    <Truck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No deliveries found for selected filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedDeliveries.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{item.orderId}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{item.customerName}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600">{item.customerMobile}</td>
                    <td className="px-4 py-3.5 max-w-xs truncate text-slate-500">{item.deliveryAddress}</td>
                    <td className="px-4 py-3.5 font-medium text-slate-700">{item.deliveryPartner}</td>
                    <td className="px-4 py-3.5 font-medium">{item.deliveryDate}</td>
                    <td className="px-4 py-3.5 text-slate-500">{item.deliveryTime}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-emerald-700">₹{item.orderAmount}</td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {item.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        {item.deliveryStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setSelectedDelivery(item); setShowModalType('VIEW'); }}
                          title="View Order"
                          className="p-1 hover:bg-slate-100 text-slate-600 rounded"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedDelivery(item); setAssignedPartner(item.deliveryPartner); setShowModalType('ASSIGN'); }}
                          title="Assign Partner"
                          className="p-1 hover:bg-emerald-50 text-emerald-600 rounded"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedDelivery(item); setUpdatedStatus(item.deliveryStatus); setShowModalType('STATUS'); }}
                          title="Update Status"
                          className="p-1 hover:bg-blue-50 text-blue-600 rounded"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedDelivery(item); setNewDeliveryDate(item.deliveryDate); setShowModalType('RESCHEDULE'); }}
                          title="Reschedule"
                          className="p-1 hover:bg-purple-50 text-purple-600 rounded"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => { setSelectedDelivery(item); setShowModalType('CANCEL'); }}
                          title="Cancel Delivery"
                          className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {paginatedDeliveries.length} of {filteredDeliveries.length} deliveries</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      {showModalType && selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-2 font-bold text-slate-900 text-sm">
              <span>Action: {showModalType} - {selectedDelivery.orderId}</span>
              <button onClick={() => setShowModalType(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {showModalType === 'VIEW' && (
              <div className="space-y-2">
                <p><span className="font-bold text-slate-700">Customer:</span> {selectedDelivery.customerName} ({selectedDelivery.customerMobile})</p>
                <p><span className="font-bold text-slate-700">Address:</span> {selectedDelivery.deliveryAddress}</p>
                <p><span className="font-bold text-slate-700">Partner:</span> {selectedDelivery.deliveryPartner}</p>
                <p><span className="font-bold text-slate-700">Date/Time:</span> {selectedDelivery.deliveryDate} ({selectedDelivery.deliveryTime})</p>
                <p><span className="font-bold text-slate-700">Amount/Payment:</span> ₹{selectedDelivery.orderAmount} ({selectedDelivery.paymentStatus})</p>
                <p><span className="font-bold text-slate-700">Status:</span> {selectedDelivery.deliveryStatus}</p>
              </div>
            )}

            {showModalType === 'ASSIGN' && (
              <form onSubmit={handleAssignPartnerSubmit} className="space-y-3">
                <label className="font-bold block text-slate-700">Select Delivery Partner</label>
                <select 
                  value={assignedPartner} 
                  onChange={e => setAssignedPartner(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-slate-50"
                >
                  <option value="Speedy Express (Suresh)">Speedy Express (Suresh)</option>
                  <option value="FarmLogistics (Raju)">FarmLogistics (Raju)</option>
                  <option value="GreenExpress (Venkatesh)">GreenExpress (Venkatesh)</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModalType(null)} className="px-3 py-1.5 rounded-lg bg-slate-100">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold">Assign Partner</button>
                </div>
              </form>
            )}

            {showModalType === 'STATUS' && (
              <form onSubmit={handleUpdateStatusSubmit} className="space-y-3">
                <label className="font-bold block text-slate-700">Select New Delivery Status</label>
                <select 
                  value={updatedStatus} 
                  onChange={e => setUpdatedStatus(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-slate-50"
                >
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PACKED">PACKED</option>
                  <option value="PICKED_UP">PICKED_UP</option>
                  <option value="IN_TRANSIT">IN_TRANSIT</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                </select>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModalType(null)} className="px-3 py-1.5 rounded-lg bg-slate-100">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-bold">Update Status</button>
                </div>
              </form>
            )}

            {showModalType === 'RESCHEDULE' && (
              <form onSubmit={handleRescheduleSubmit} className="space-y-3">
                <label className="font-bold block text-slate-700">Select New Delivery Date</label>
                <input 
                  type="date"
                  required
                  value={newDeliveryDate} 
                  onChange={e => setNewDeliveryDate(e.target.value)}
                  className="w-full p-2 border rounded-xl bg-slate-50"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModalType(null)} className="px-3 py-1.5 rounded-lg bg-slate-100">Cancel</button>
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold">Reschedule</button>
                </div>
              </form>
            )}

            {showModalType === 'CANCEL' && (
              <div className="space-y-3">
                <p className="text-slate-600 font-medium">Are you sure you want to cancel delivery for order <span className="font-bold text-slate-900">{selectedDelivery.orderId}</span>?</p>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowModalType(null)} className="px-3 py-1.5 rounded-lg bg-slate-100">No, Keep</button>
                  <button type="button" onClick={handleCancelSubmit} className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold">Yes, Cancel Delivery</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
