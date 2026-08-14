import React, { useEffect, useMemo, useState } from 'react';
import { adminApiService } from '../services/adminApiService';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  PencilLine,
  ArrowRightCircle,
  XCircle,
  Trash2,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  MapPin,
  Package,
  CreditCard,
  CalendarDays,
  Clock3,
  Loader2,
  AlertTriangle,
  CalendarRange,
} from 'lucide-react';
import toast from 'react-hot-toast';

const statusOptions = ['All', 'Pending', 'Confirmed', 'Scheduled', 'Cancelled', 'Completed'];
const paymentStatusOptions = ['All', 'Paid', 'Pending', 'Refunded'];

const statusBadgeClasses = {
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
  Scheduled: 'bg-purple-50 text-purple-700 border-purple-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200'
};

const paymentBadgeClasses = {
  Paid: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Pending: 'bg-amber-50 text-amber-700 border-amber-200',
  Refunded: 'bg-slate-50 text-slate-700 border-slate-200'
};

const PreOrderList = () => {
  const [preOrders, setPreOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');
  const [createdFromDate, setCreatedFromDate] = useState('');
  const [createdToDate, setCreatedToDate] = useState('');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);
  const [selectedPreOrder, setSelectedPreOrder] = useState(null);
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [scheduleTarget, setScheduleTarget] = useState(null);
  const [convertTarget, setConvertTarget] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const fetchPreOrders = async () => {
    setLoading(true);
    try {
      const data = await adminApiService.getPreOrders();
      setPreOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load pre-orders', err);
      toast.error('Failed to load pre-orders');
      setPreOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreOrders();
  }, []);

  const currentList = useMemo(() => {
    return preOrders
      .filter((item) => {
        const query = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !query ||
          item.preOrderId?.toLowerCase().includes(query) ||
          item.customerName?.toLowerCase().includes(query) ||
          item.mobileNumber?.toLowerCase().includes(query) ||
          item.productDetails?.toLowerCase().includes(query);

        const matchesStatus = statusFilter === 'All' || item.preOrderStatus === statusFilter;
        const matchesPayment = paymentStatusFilter === 'All' || item.paymentStatus === paymentStatusFilter;

        const createdDate = item.createdDate ? new Date(item.createdDate) : null;
        const fromDate = createdFromDate ? new Date(createdFromDate) : null;
        const toDate = createdToDate ? new Date(createdToDate) : null;
        const deliveryDate = deliveryDateFilter ? new Date(deliveryDateFilter) : null;
        const itemDeliveryDate = item.preferredDeliveryDate ? new Date(item.preferredDeliveryDate) : null;

        let matchesCreatedRange = true;
        if (fromDate && createdDate) {
          const minDate = new Date(fromDate);
          minDate.setHours(0, 0, 0, 0);
          matchesCreatedRange = matchesCreatedRange && createdDate >= minDate;
        }
        if (toDate && createdDate) {
          const maxDate = new Date(toDate);
          maxDate.setHours(23, 59, 59, 999);
          matchesCreatedRange = matchesCreatedRange && createdDate <= maxDate;
        }

        const matchesDeliveryDate = !deliveryDate || !itemDeliveryDate || itemDeliveryDate.toDateString() === deliveryDate.toDateString();

        return matchesSearch && matchesStatus && matchesPayment && matchesCreatedRange && matchesDeliveryDate;
      })
      .sort((a, b) => new Date(b.createdDate || 0) - new Date(a.createdDate || 0));
  }, [preOrders, searchQuery, statusFilter, paymentStatusFilter, createdFromDate, createdToDate, deliveryDateFilter]);

  const totalPages = Math.ceil(currentList.length / itemsPerPage) || 1;
  const paginatedPreOrders = currentList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const summary = useMemo(() => ({
    total: preOrders.length,
    pending: preOrders.filter((item) => item.preOrderStatus === 'Pending').length,
    confirmed: preOrders.filter((item) => item.preOrderStatus === 'Confirmed').length,
    scheduled: preOrders.filter((item) => item.preOrderStatus === 'Scheduled').length,
    cancelled: preOrders.filter((item) => item.preOrderStatus === 'Cancelled').length
  }), [preOrders]);

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setPaymentStatusFilter('All');
    setCreatedFromDate('');
    setCreatedToDate('');
    setDeliveryDateFilter('');
    setCurrentPage(1);
  };

  const handleExportExcel = () => {
    const headers = [
      'Pre-Order ID',
      'Customer Name',
      'Mobile Number',
      'Product Details',
      'Quantity',
      'Estimated Order Value',
      'Preferred Delivery Date',
      'Preferred Delivery Time',
      'Payment Method',
      'Payment Status',
      'Pre-Order Status',
      'Created Date'
    ];

    const rows = currentList.map((item) => [
      item.preOrderId,
      item.customerName,
      item.mobileNumber,
      item.productDetails,
      item.quantity,
      item.estimatedOrderValue,
      item.preferredDeliveryDate,
      item.preferredDeliveryTime,
      item.paymentMethod,
      item.paymentStatus,
      item.preOrderStatus,
      item.createdDate
    ]);

    const csv = [headers, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`;
    link.download = `Pre_Order_List_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Pre-order list exported for Excel');
  };

  const handleExportPDF = () => {
    const popup = window.open('', '_blank', 'width=1200,height=800');
    if (!popup) {
      toast.error('Popup blocked. Please allow popups to export PDF.');
      return;
    }

    const rows = currentList.map((item) => `
      <tr>
        <td>${item.preOrderId}</td>
        <td>${item.customerName}</td>
        <td>${item.mobileNumber}</td>
        <td>${item.productDetails}</td>
        <td>${item.quantity}</td>
        <td>₹${Number(item.estimatedOrderValue || 0).toLocaleString()}</td>
        <td>${item.preferredDeliveryDate}</td>
        <td>${item.preferredDeliveryTime}</td>
        <td>${item.paymentMethod}</td>
        <td>${item.paymentStatus}</td>
        <td>${item.preOrderStatus}</td>
        <td>${item.createdDate}</td>
      </tr>
    `).join('');

    popup.document.write(`
      <html>
        <head>
          <title>Pre-Order List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Pre-Order List</h1>
          <table>
            <thead>
              <tr>
                <th>Pre-Order ID</th>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Product Details</th>
                <th>Quantity</th>
                <th>Estimated Order Value</th>
                <th>Preferred Delivery Date</th>
                <th>Preferred Delivery Time</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Pre-Order Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    await adminApiService.confirmPreOrder(confirmTarget.preOrderId);
    toast.success(`Pre-order ${confirmTarget.preOrderId} confirmed`);
    setConfirmTarget(null);
    fetchPreOrders();
  };

  const handleScheduleSave = async () => {
    if (!scheduleTarget || !scheduleDate || !scheduleTime) return;
    await adminApiService.updatePreOrderSchedule(scheduleTarget.preOrderId, scheduleDate, scheduleTime);
    toast.success(`Delivery schedule updated for ${scheduleTarget.preOrderId}`);
    setScheduleTarget(null);
    setScheduleDate('');
    setScheduleTime('');
    fetchPreOrders();
  };

  const handleConvert = async () => {
    if (!convertTarget) return;
    await adminApiService.convertPreOrderToOrder(convertTarget.preOrderId);
    toast.success(`Pre-order ${convertTarget.preOrderId} moved to Orders`);
    setConvertTarget(null);
    fetchPreOrders();
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    await adminApiService.cancelPreOrder(cancelTarget.preOrderId);
    toast.success(`Pre-order ${cancelTarget.preOrderId} cancelled`);
    setCancelTarget(null);
    fetchPreOrders();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await adminApiService.deletePreOrder(deleteTarget.preOrderId);
    toast.success(`Pre-order ${deleteTarget.preOrderId} deleted`);
    setDeleteTarget(null);
    fetchPreOrders();
  };

  const actionDisabled = (item) => item.preOrderStatus === 'Cancelled' || item.preOrderStatus === 'Completed';

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <CalendarRange className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Pre-Order List</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-700 shadow-xs">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Pre-Order List</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Manage pre-orders separately from active orders.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleExportExcel} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button onClick={handleExportPDF} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Export PDF</span>
          </button>
          <button onClick={fetchPreOrders} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs">
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {[
          { title: 'Total Pre-Orders', value: summary.total, icon: Package, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { title: 'Pending', value: summary.pending, icon: Clock3, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { title: 'Confirmed', value: summary.confirmed, icon: CheckCircle2, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { title: 'Scheduled', value: summary.scheduled, icon: CalendarDays, color: 'text-purple-600 bg-purple-50 border-purple-100' },
          { title: 'Cancelled', value: summary.cancelled, icon: AlertTriangle, color: 'text-rose-600 bg-rose-50 border-rose-100' }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</h3>
                <p className="text-xl font-black text-slate-800 mt-1">{card.value}</p>
              </div>
              <div className={`p-2 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Filters</h3>
          </div>
          <button onClick={resetFilters} className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Pre-Order ID, Customer, Mobile, or Product"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
            <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              {statusOptions.map((status) => <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>)}
            </select>
            <select value={paymentStatusFilter} onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              {paymentStatusOptions.map((status) => <option key={status} value={status}>{status === 'All' ? 'All Payment Statuses' : status}</option>)}
            </select>
            <input type="date" value={createdFromDate} onChange={(e) => { setCreatedFromDate(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" title="Created date from" />
            <input type="date" value={deliveryDateFilter} onChange={(e) => { setDeliveryDateFilter(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700" title="Preferred delivery date" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input type="date" value={createdToDate} onChange={(e) => { setCreatedToDate(e.target.value); setCurrentPage(1); }} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 max-w-xs" title="Created date to" />
          <div className="text-xs text-slate-500 sm:text-right self-center font-medium">Showing {paginatedPreOrders.length} of {currentList.length} pre-orders</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold">Loading pre-orders...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[1400px]">
              <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Pre-Order ID</th>
                  <th className="px-4 py-3.5">Customer Name</th>
                  <th className="px-4 py-3.5">Mobile Number</th>
                  <th className="px-4 py-3.5">Product Details</th>
                  <th className="px-4 py-3.5">Quantity</th>
                  <th className="px-4 py-3.5 text-right">Estimated Value</th>
                  <th className="px-4 py-3.5">Preferred Delivery Date</th>
                  <th className="px-4 py-3.5">Preferred Delivery Time</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5">Pre-Order Status</th>
                  <th className="px-4 py-3.5">Created Date</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedPreOrders.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="px-6 py-12 text-center text-slate-400">
                      <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No pre-orders found.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Adjust search or filters to find matching records.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedPreOrders.map((item) => {
                    const disabled = actionDisabled(item);
                    return (
                      <tr key={item.preOrderId} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">{item.preOrderId}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">{item.customerName}</td>
                        <td className="px-4 py-3.5 text-slate-600">{item.mobileNumber}</td>
                        <td className="px-4 py-3.5 max-w-xs truncate text-slate-600">{item.productDetails}</td>
                        <td className="px-4 py-3.5 text-slate-700">{item.quantity}</td>
                        <td className="px-4 py-3.5 text-right font-black text-slate-900">₹{Number(item.estimatedOrderValue || 0).toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-slate-700">{item.preferredDeliveryDate}</td>
                        <td className="px-4 py-3.5 text-slate-700">{item.preferredDeliveryTime}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-700">{item.paymentMethod}</td>
                        <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${paymentBadgeClasses[item.paymentStatus] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>{item.paymentStatus}</span></td>
                        <td className="px-4 py-3.5"><span className={`px-2 py-0.5 rounded text-[10px] font-extrabold border ${statusBadgeClasses[item.preOrderStatus] || 'bg-slate-50 text-slate-700 border-slate-200'}`}>{item.preOrderStatus}</span></td>
                        <td className="px-4 py-3.5 text-slate-600">{item.createdDate}</td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            <button onClick={() => setSelectedPreOrder(item)} className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>View Details</span>
                            </button>
                            <button disabled={disabled || item.preOrderStatus === 'Confirmed' || item.preOrderStatus === 'Scheduled'} onClick={() => setConfirmTarget(item)} className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Confirm Pre-Order</span>
                            </button>
                            <button disabled={disabled} onClick={() => { setScheduleTarget(item); setScheduleDate(item.preferredDeliveryDate || ''); setScheduleTime(item.preferredDeliveryTime || ''); }} className="px-2.5 py-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                              <PencilLine className="w-3.5 h-3.5" />
                              <span>Edit Delivery Schedule</span>
                            </button>
                            <button disabled={disabled} onClick={() => setConvertTarget(item)} className="px-2.5 py-1 rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                              <ArrowRightCircle className="w-3.5 h-3.5" />
                              <span>Convert to Active Order</span>
                            </button>
                            <button disabled={disabled} onClick={() => setCancelTarget(item)} className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel Pre-Order</span>
                            </button>
                            <button onClick={() => setDeleteTarget(item)} className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1">
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Delete Pre-Order</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing {paginatedPreOrders.length} of {currentList.length} pre-orders</span>
          <div className="flex items-center gap-2">
            <select value={itemsPerPage} onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700">
              <option value={5}>5</option>
              <option value={8}>8</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 font-bold">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 font-bold">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedPreOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 font-bold text-slate-900 text-sm">
              <span>Pre-Order Details: {selectedPreOrder.preOrderId}</span>
              <button onClick={() => setSelectedPreOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <DetailCard icon={User} label="Customer Name" value={selectedPreOrder.customerName} />
              <DetailCard icon={Phone} label="Mobile Number" value={selectedPreOrder.mobileNumber} />
              <DetailCard icon={Package} label="Product Details" value={selectedPreOrder.productDetails} />
              <DetailCard icon={MapPin} label="Delivery Location" value={selectedPreOrder.deliveryLocation || 'N/A'} />
              <DetailCard icon={CreditCard} label="Payment Method" value={selectedPreOrder.paymentMethod} />
              <DetailCard icon={Clock3} label="Pre-Order Status" value={selectedPreOrder.preOrderStatus} />
              <DetailCard icon={CalendarDays} label="Preferred Delivery Date" value={selectedPreOrder.preferredDeliveryDate} />
              <DetailCard icon={Clock3} label="Preferred Delivery Time" value={selectedPreOrder.preferredDeliveryTime} />
              <DetailCard icon={CalendarRange} label="Created Date" value={selectedPreOrder.createdDate} />
              <DetailCard icon={Package} label="Quantity" value={selectedPreOrder.quantity} />
              <DetailCard icon={CreditCard} label="Estimated Value" value={`₹${Number(selectedPreOrder.estimatedOrderValue || 0).toLocaleString()}`} />
              <DetailCard icon={AlertTriangle} label="Payment Status" value={selectedPreOrder.paymentStatus} />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">History</h4>
              <div className="space-y-2">
                {(selectedPreOrder.history || []).map((entry, index) => (
                  <div key={`${entry.action}-${index}`} className="text-slate-700 text-xs flex items-start gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 font-bold">{index + 1}</span>
                    <div>
                      <p className="font-bold">{entry.action}</p>
                      <p className="text-slate-500">{entry.note || entry.at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedPreOrder(null)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Close</button>
            </div>
          </div>
        </div>
      )}

      {confirmTarget && (
        <ConfirmModal title="Confirm Pre-Order" description={`Confirm ${confirmTarget.preOrderId} for ${confirmTarget.customerName}?`} primaryLabel="Confirm" primaryClassName="bg-blue-600" onClose={() => setConfirmTarget(null)} onPrimary={handleConfirm} />
      )}

      {scheduleTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 font-bold text-slate-900 text-sm">
              <span>Edit Delivery Schedule: {scheduleTarget.preOrderId}</span>
              <button onClick={() => setScheduleTarget(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Date</label>
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800" />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Delivery Time</label>
                <input type="text" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} placeholder="09:00 - 11:00 AM" className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setScheduleTarget(null)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">Cancel</button>
              <button onClick={handleScheduleSave} className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold">Save Schedule</button>
            </div>
          </div>
        </div>
      )}

      {convertTarget && (
        <ConfirmModal title="Convert to Active Order" description={`Move ${convertTarget.preOrderId} to Orders Management? This keeps the history attached to the converted order.`} primaryLabel="Convert" primaryClassName="bg-emerald-600" onClose={() => setConvertTarget(null)} onPrimary={handleConvert} />
      )}

      {cancelTarget && (
        <ConfirmModal title="Cancel Pre-Order" description={`Cancel pre-order ${cancelTarget.preOrderId}?`} primaryLabel="Cancel Pre-Order" primaryClassName="bg-rose-600" onClose={() => setCancelTarget(null)} onPrimary={handleCancel} />
      )}

      {deleteTarget && (
        <ConfirmModal title="Delete Pre-Order" description={`Delete pre-order ${deleteTarget.preOrderId} permanently?`} primaryLabel="Delete" primaryClassName="bg-slate-800" onClose={() => setDeleteTarget(null)} onPrimary={handleDelete} />
      )}
    </div>
  );
};

const DetailCard = ({ icon: Icon, label, value }) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
    <div className="font-semibold text-slate-900 text-sm">{value || 'N/A'}</div>
  </div>
);

const ConfirmModal = ({ title, description, primaryLabel, primaryClassName, onClose, onPrimary }) => (
  <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
      <div className="flex justify-between items-center border-b pb-3 font-bold text-slate-900 text-sm">
        <span>{title}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      <p className="text-slate-600 text-sm leading-6">{description}</p>
      <div className="flex justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">Cancel</button>
        <button onClick={onPrimary} className={`px-4 py-2 rounded-xl text-white font-bold ${primaryClassName}`}>{primaryLabel}</button>
      </div>
    </div>
  </div>
);

export default PreOrderList;