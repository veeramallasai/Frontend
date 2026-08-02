import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  PackageCheck, 
  Truck, 
  XCircle, 
  Eye, 
  Filter,
  DollarSign,
  User,
  MapPin,
  Calendar,
  Download,
  Printer,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  ArrowUpDown,
  ChevronLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import DeliveryOverview from './deliveries/DeliveryOverview';

const initialOrdersDataset = [
  {
    id: 'ORD-1234',
    date: '2026-07-31T10:15:00',
    customerName: 'Ramesh Kumar',
    farmerName: 'Ramesh Organic Farms',
    phone: '+91 98765 43210',
    address: 'Flat 402, Hightech City, Hyderabad',
    products: 'Spinach (Palak), Tomato, Coriander Leaves',
    quantity: '6 kg',
    totalAmount: 1250,
    paymentMethod: 'COD',
    paymentStatus: 'PAID',
    status: 'Delivered',
    deliveryStatus: 'DELIVERED'
  },
  {
    id: 'ORD-1233',
    date: '2026-07-31T11:30:00',
    customerName: 'Sneha Patel',
    farmerName: 'Sri Venkateswara Farms',
    phone: '+91 98123 45678',
    address: 'Plot 12, Jubilee Hills, Hyderabad',
    products: 'Amaranth Green, Capsicum',
    quantity: '3.5 kg',
    totalAmount: 860,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    status: 'Out for Delivery',
    deliveryStatus: 'OUT_FOR_DELIVERY'
  },
  {
    id: 'ORD-1232',
    date: '2026-07-30T12:10:00',
    customerName: 'Amit Singh',
    farmerName: 'Green Valley Produce',
    phone: '+91 97654 32109',
    address: 'Block B-301, Gachibowli, Hyderabad',
    products: 'Red Amaranth, Potato',
    quantity: '6 kg',
    totalAmount: 420,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'Packed',
    deliveryStatus: 'PACKED'
  },
  {
    id: 'ORD-1231',
    date: '2026-07-29T13:45:00',
    customerName: 'Priya Sharma',
    farmerName: 'Krishna Agriculture Co.',
    phone: '+91 99887 76655',
    address: 'Villa 15, Banjara Hills, Hyderabad',
    products: 'Mint Leaves, Fenugreek Leaves',
    quantity: '5 kg',
    totalAmount: 1560,
    paymentMethod: 'CARD',
    paymentStatus: 'PAID',
    status: 'Confirmed',
    deliveryStatus: 'CONFIRMED'
  },
  {
    id: 'ORD-1230',
    date: '2026-07-28T14:20:00',
    customerName: 'Vikram Joshi',
    farmerName: 'Telangana Fresh Growers',
    phone: '+91 91234 56789',
    address: 'Apt 104, Madhapur, Hyderabad',
    products: 'Curry Leaves, Methi',
    quantity: '2 kg',
    totalAmount: 780,
    paymentMethod: 'COD',
    paymentStatus: 'PENDING',
    status: 'Pending',
    deliveryStatus: 'SCHEDULED'
  },
  {
    id: 'ORD-1229',
    date: '2026-07-25T08:00:00',
    customerName: 'Ananya Rao',
    farmerName: 'Organic Greens Co.',
    phone: '+91 94455 66778',
    address: 'H.No 4-50, Kukatpally, Hyderabad',
    products: 'Dill Leaves, Ladies Finger',
    quantity: '3 kg',
    totalAmount: 650,
    paymentMethod: 'UPI',
    paymentStatus: 'PAID',
    status: 'Cancelled',
    deliveryStatus: 'CANCELLED'
  }
];

const statusOptions = ['All', 'Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'];

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Confirmed':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Packed':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'Out for Delivery':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Delivered':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Cancelled':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const AdminOrderManagement = () => {
  const [orders, setOrders] = useState(initialOrdersDataset);
  const [loading, setLoading] = useState(false);
  const [dateError, setDateError] = useState('');

  // Date Range Filters State
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [quickFilter, setQuickFilter] = useState('Custom Date Range');
  const [appliedFromDate, setAppliedFromDate] = useState('');
  const [appliedToDate, setAppliedToDate] = useState('');

  // Other Filters State
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Sorting State
  const [sortBy, setSortBy] = useState('date'); // 'date' | 'totalAmount' | 'status'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Order Modal
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {};
      if (appliedFromDate) params.fromDate = appliedFromDate;
      if (appliedToDate) params.toDate = appliedToDate;
      if (search) params.search = search;
      if (activeTab !== 'All') params.status = activeTab;

      const data = await adminService.getOrders(params);
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(o => ({
          id: String(o.id || o.orderCode || 'ORD-000'),
          date: o.date || o.createdAt || new Date().toISOString(),
          customerName: o.customerName || (o.customer ? `${o.customer.firstName || ''} ${o.customer.lastName || ''}`.trim() : 'Customer'),
          farmerName: o.farmerName || 'Ramesh Organic Farms',
          phone: o.phone || o.customer?.phone || 'N/A',
          address: o.address || o.shippingAddress || 'Hyderabad',
          products: Array.isArray(o.items) 
            ? o.items.map(i => i.name || i.product?.name).filter(Boolean).join(', ') || 'Fresh Greens'
            : (o.products || 'Organic Produce'),
          quantity: o.quantity || (Array.isArray(o.items) ? `${o.items.reduce((acc, i) => acc + (i.quantity || 1), 0)} items` : '1 kg'),
          totalAmount: o.totalAmount ?? o.total ?? 500,
          paymentMethod: o.paymentMethod || 'COD',
          paymentStatus: o.paymentStatus || 'PAID',
          status: o.status || 'Pending',
          deliveryStatus: o.deliveryStatus || 'OUT_FOR_DELIVERY'
        }));
        setOrders(formatted);
      }
    } catch (err) {
      console.warn('Failed to load orders from backend, using dataset fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  // Quick Date Range Handler
  const applyQuickFilter = (type) => {
    setQuickFilter(type);
    setDateError('');

    const todayObj = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    if (type === 'Today') {
      const str = formatDate(todayObj);
      setFromDate(str);
      setToDate(str);
      setAppliedFromDate(str);
      setAppliedToDate(str);
    } else if (type === 'Yesterday') {
      const yest = new Date(todayObj);
      yest.setDate(todayObj.getDate() - 1);
      const str = formatDate(yest);
      setFromDate(str);
      setToDate(str);
      setAppliedFromDate(str);
      setAppliedToDate(str);
    } else if (type === 'This Week') {
      const day = todayObj.getDay();
      const diffToMonday = todayObj.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(todayObj.setDate(diffToMonday));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      const startStr = formatDate(monday);
      const endStr = formatDate(sunday);
      setFromDate(startStr);
      setToDate(endStr);
      setAppliedFromDate(startStr);
      setAppliedToDate(endStr);
    } else if (type === 'This Month') {
      const firstDay = new Date(todayObj.getFullYear(), todayObj.getMonth(), 1);
      const lastDay = new Date(todayObj.getFullYear(), todayObj.getMonth() + 1, 0);
      
      const startStr = formatDate(firstDay);
      const endStr = formatDate(lastDay);
      setFromDate(startStr);
      setToDate(endStr);
      setAppliedFromDate(startStr);
      setAppliedToDate(endStr);
    } else if (type === 'Last 30 Days') {
      const thirtyDaysAgo = new Date(todayObj);
      thirtyDaysAgo.setDate(todayObj.getDate() - 30);
      
      const startStr = formatDate(thirtyDaysAgo);
      const endStr = formatDate(new Date());
      setFromDate(startStr);
      setToDate(endStr);
      setAppliedFromDate(startStr);
      setAppliedToDate(endStr);
    } else if (type === 'Custom Date Range') {
      setFromDate('');
      setToDate('');
      setAppliedFromDate('');
      setAppliedToDate('');
    }
  };

  // Search & Validation Handler
  const handleDateSearch = () => {
    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      setDateError('"From Date" cannot be greater than "To Date".');
      toast.error('"From Date" cannot be greater than "To Date"');
      return;
    }
    setDateError('');
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    fetchOrders();
  };

  const handleResetFilters = () => {
    setFromDate('');
    setToDate('');
    setAppliedFromDate('');
    setAppliedToDate('');
    setQuickFilter('Custom Date Range');
    setSearch('');
    setActiveTab('All');
    setDateError('');
    fetchOrders();
  };

  // Filtered & Sorted Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      // Date Filtering
      if (appliedFromDate) {
        const oDate = new Date(order.date);
        const fDate = new Date(appliedFromDate);
        fDate.setHours(0, 0, 0, 0);
        if (oDate < fDate) return false;
      }
      if (appliedToDate) {
        const oDate = new Date(order.date);
        const tDate = new Date(appliedToDate);
        tDate.setHours(23, 59, 59, 999);
        if (oDate > tDate) return false;
      }

      // Search Query
      if (search) {
        const query = search.toLowerCase();
        const oid = (order.id || '').toLowerCase();
        const cust = (order.customerName || '').toLowerCase();
        if (!oid.includes(query) && !cust.includes(query)) return false;
      }

      // Status Tab
      if (activeTab !== 'All' && order.status !== activeTab) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'date') {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'totalAmount') {
        comparison = a.totalAmount - b.totalAmount;
      } else if (sortBy === 'status') {
        comparison = String(a.status).localeCompare(String(b.status));
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [orders, appliedFromDate, appliedToDate, search, activeTab, sortBy, sortOrder]);

  // Dynamic Summary KPI Cards (Calculated from filtered dataset)
  const summaryMetrics = useMemo(() => {
    const total = filteredOrders.length;
    const delivered = filteredOrders.filter(o => o.status === 'Delivered').length;
    const pending = filteredOrders.filter(o => o.status === 'Pending').length;
    const cancelled = filteredOrders.filter(o => o.status === 'Cancelled').length;
    const revenue = filteredOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return { total, delivered, pending, cancelled, revenue };
  }, [filteredOrders]);

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage]);

  // Export to Excel / CSV
  const handleExportCSV = () => {
    const headers = ['Order ID', 'Order Date', 'Customer Name', 'Farmer Name', 'Products', 'Quantity', 'Total Amount', 'Payment Method', 'Payment Status', 'Order Status', 'Delivery Status'];
    const rows = filteredOrders.map(o => [
      o.id,
      new Date(o.date).toLocaleString(),
      `"${o.customerName}"`,
      `"${o.farmerName}"`,
      `"${o.products}"`,
      `"${o.quantity}"`,
      o.totalAmount,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.deliveryStatus
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Orders_Report_${appliedFromDate || 'all'}_to_${appliedToDate || 'all'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Orders report exported to CSV / Excel');
  };

  // Print Report
  const handlePrintReport = () => {
    window.print();
  };

  const handleStatusChange = async (orderId, newStatus) => {
    await adminService.updateOrderStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    toast.success(`Order #${orderId} status updated to "${newStatus}"`);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left bg-slate-50 min-h-screen">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Order Management</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-700 shadow-xs">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Orders</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage customer orders, date range dispatches, and delivery status.
              </p>
            </div>
          </div>
        </div>

        {/* Export & Print Report Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs"
          >
            <Printer className="w-4 h-4 text-blue-600" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Embedded Delivery Overview Section */}
      <DeliveryOverview />

      {/* Date Range Filter Bar (Top of Orders Page) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Date Range Filter</h3>
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['Today', 'Yesterday', 'This Week', 'This Month', 'Last 30 Days', 'Custom Date Range'].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => applyQuickFilter(preset)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                  quickFilter === preset
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Date Pickers & Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); setDateError(''); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => { setToDate(e.target.value); setDateError(''); }}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 col-span-2">
            <button
              type="button"
              onClick={handleDateSearch}
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shadow-sm"
            >
              <Search className="w-4 h-4" />
              <span>Search Date Range</span>
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Validation Error Message */}
        {dateError && (
          <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{dateError}</span>
          </div>
        )}
      </div>

      {/* Dynamic Summary Cards (Updating based on Date Range) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800">{summaryMetrics.total}</h4>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800">{summaryMetrics.delivered}</h4>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Delivered Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800">{summaryMetrics.pending}</h4>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Pending Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800">{summaryMetrics.cancelled}</h4>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Cancelled Orders</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xl font-extrabold text-slate-800">₹{summaryMetrics.revenue.toLocaleString()}</h4>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4">
        
        {/* Table Filter Tabs & Search */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 md:pb-0">
            {statusOptions.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setCurrentPage(1); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Bar & Sorting Controls */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order ID or Customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
            >
              <option value="date">Sort by Date</option>
              <option value="totalAmount">Sort by Amount</option>
              <option value="status">Sort by Status</option>
            </select>

            <button
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-slate-200 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700"
              title="Toggle Sort Order"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Loading State Indicator */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold">Loading orders for selected date range...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5">Order ID</th>
                  <th className="px-4 py-3.5">Order Date & Time</th>
                  <th className="px-4 py-3.5">Customer Name</th>
                  <th className="px-4 py-3.5">Farmer Name</th>
                  <th className="px-4 py-3.5">Products</th>
                  <th className="px-4 py-3.5">Quantity</th>
                  <th className="px-4 py-3.5 text-right">Total Amount</th>
                  <th className="px-4 py-3.5">Payment Method</th>
                  <th className="px-4 py-3.5">Payment Status</th>
                  <th className="px-4 py-3.5">Order Status</th>
                  <th className="px-4 py-3.5">Delivery Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="px-6 py-12 text-center text-slate-400">
                      <AlertCircle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No orders found for the selected date range.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try expanding your date range or resetting filters.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">#{order.id}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-mono">
                        {new Date(order.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{order.customerName}</td>
                      <td className="px-4 py-3.5 text-slate-700">{order.farmerName}</td>
                      <td className="px-4 py-3.5 max-w-xs truncate text-slate-600">{order.products}</td>
                      <td className="px-4 py-3.5 text-slate-700">{order.quantity}</td>
                      <td className="px-4 py-3.5 text-right font-black text-slate-900">₹{order.totalAmount}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-700">{order.paymentMethod}</td>
                      <td className="px-4 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          order.paymentStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${getStatusBadgeClass(order.status)}`}
                        >
                          {statusOptions.filter(s => s !== 'All').map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                          {order.deliveryStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 ml-auto"
                        >
                          <Eye className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {paginatedOrders.length} of {filteredOrders.length} orders</span>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 font-bold"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700">Page {currentPage} of {totalPages}</span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 font-bold"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* View Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center border-b pb-3 font-bold text-slate-900 text-sm">
              <span>Order Details: #{selectedOrder.id}</span>
              <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2">
              <p><span className="font-bold text-slate-700">Customer:</span> {selectedOrder.customerName} ({selectedOrder.phone})</p>
              <p><span className="font-bold text-slate-700">Farmer Farm:</span> {selectedOrder.farmerName}</p>
              <p><span className="font-bold text-slate-700">Delivery Address:</span> {selectedOrder.address}</p>
              <p><span className="font-bold text-slate-700">Products & Qty:</span> {selectedOrder.products} ({selectedOrder.quantity})</p>
              <p><span className="font-bold text-slate-700">Total Amount:</span> ₹{selectedOrder.totalAmount}</p>
              <p><span className="font-bold text-slate-700">Payment:</span> {selectedOrder.paymentMethod} ({selectedOrder.paymentStatus})</p>
              <p><span className="font-bold text-slate-700">Order Status:</span> {selectedOrder.status}</p>
              <p><span className="font-bold text-slate-700">Delivery Status:</span> {selectedOrder.deliveryStatus}</p>
              <p><span className="font-bold text-slate-700">Order Date:</span> {new Date(selectedOrder.date).toLocaleString()}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => setSelectedOrder(null)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderManagement;
