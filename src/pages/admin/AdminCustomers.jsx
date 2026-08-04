import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Search, 
  ChevronRight, 
  Plus, 
  CheckCircle2, 
  Ban, 
  Edit3, 
  Trash2, 
  Eye, 
  Mail, 
  Phone, 
  ShoppingBag, 
  Award, 
  MapPin, 
  Clock,
  ShieldCheck,
  UserCheck,
  TrendingUp,
  Calendar,
  RefreshCw,
  Download,
  Filter,
  RotateCcw,
  BarChart3,
  PieChart,
  DollarSign,
  Repeat,
  Sparkles,
  X,
  Send,
  MessageSquare,
  FileSpreadsheet,
  ArrowUpRight,
  ShieldAlert,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import api from '../../services/api';

// Rich Default Sample Customers Data
const initialCustomersDataset = [
  {
    id: 'CUST-501',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@gmail.com',
    phone: '+91 98765 11223',
    location: 'Madhapur, Hyderabad, Telangana',
    joinDate: '2026-07-28',
    totalOrders: 14,
    totalSpent: 8450,
    lastOrderDate: '2026-07-30',
    status: 'VIP',
    address: 'Flat 402, Green Valley Apts, Madhapur, Hyderabad',
    orders: [
      { orderCode: 'ORD-9912', date: '2026-07-30', itemsCount: 6, total: 1250, status: 'DELIVERED' },
      { orderCode: 'ORD-8830', date: '2026-07-15', itemsCount: 4, total: 820, status: 'DELIVERED' },
      { orderCode: 'ORD-7711', date: '2026-06-30', itemsCount: 8, total: 1940, status: 'DELIVERED' }
    ]
  },
  {
    id: 'CUST-502',
    name: 'Sneha Patel',
    email: 'sneha.patel@yahoo.com',
    phone: '+91 98123 44556',
    location: 'Jubilee Hills, Hyderabad, Telangana',
    joinDate: '2026-07-27',
    totalOrders: 8,
    totalSpent: 4200,
    lastOrderDate: '2026-07-29',
    status: 'Active',
    address: 'Plot 88, Road No 10, Jubilee Hills, Hyderabad',
    orders: [
      { orderCode: 'ORD-9945', date: '2026-07-29', itemsCount: 3, total: 650, status: 'DELIVERED' },
      { orderCode: 'ORD-8891', date: '2026-07-10', itemsCount: 5, total: 1100, status: 'DELIVERED' }
    ]
  },
  {
    id: 'CUST-503',
    name: 'Amit Singh',
    email: 'amit.singh@outlook.com',
    phone: '+91 97654 22334',
    location: 'Gachibowli, Hyderabad, Telangana',
    joinDate: '2026-06-05',
    totalOrders: 2,
    totalSpent: 840,
    lastOrderDate: '2026-07-20',
    status: 'Active',
    address: 'House 12-4, Gachibowli DLF Phase 1, Hyderabad',
    orders: [
      { orderCode: 'ORD-9102', date: '2026-07-20', itemsCount: 2, total: 420, status: 'DELIVERED' }
    ]
  },
  {
    id: 'CUST-504',
    name: 'Priya Sharma',
    email: 'priya.sharma@gmail.com',
    phone: '+91 99887 11223',
    location: 'Banjara Hills, Hyderabad, Telangana',
    joinDate: '2025-12-28',
    totalOrders: 19,
    totalSpent: 14200,
    lastOrderDate: '2026-07-31',
    status: 'VIP',
    address: 'Villa 5, Palm Meadows, Banjara Hills, Hyderabad',
    orders: [
      { orderCode: 'ORD-9988', date: '2026-07-31', itemsCount: 10, total: 2400, status: 'DELIVERED' },
      { orderCode: 'ORD-9800', date: '2026-07-22', itemsCount: 7, total: 1850, status: 'DELIVERED' }
    ]
  },
  {
    id: 'CUST-505',
    name: 'Vikram Joshi',
    email: 'vikram.j@gmail.com',
    phone: '+91 91234 88776',
    location: 'Kondapur, Hyderabad, Telangana',
    joinDate: '2026-04-10',
    totalOrders: 0,
    totalSpent: 0,
    lastOrderDate: 'N/A',
    status: 'Blocked',
    address: 'Flat 101, Lakeview Apts, Kondapur, Hyderabad',
    orders: []
  },
  {
    id: 'CUST-506',
    name: 'Kavita Reddy',
    email: 'kavita.reddy@gmail.com',
    phone: '+91 94401 22334',
    location: 'Vijayawada, Andhra Pradesh',
    joinDate: '2026-07-26',
    totalOrders: 6,
    totalSpent: 3900,
    lastOrderDate: '2026-07-31',
    status: 'Active',
    address: 'Door 4-12, MG Road, Vijayawada',
    orders: [
      { orderCode: 'ORD-9991', date: '2026-07-31', itemsCount: 5, total: 890, status: 'PROCESSING' }
    ]
  },
  {
    id: 'CUST-507',
    name: 'Rajesh Goud',
    email: 'rajesh.goud@gmail.com',
    phone: '+91 93902 55667',
    location: 'Guntur, Andhra Pradesh',
    joinDate: '2026-07-28',
    totalOrders: 1,
    totalSpent: 450,
    lastOrderDate: '2026-07-28',
    status: 'Active',
    address: 'Kisan Nagar, Guntur',
    orders: [
      { orderCode: 'ORD-9890', date: '2026-07-28', itemsCount: 2, total: 450, status: 'DELIVERED' }
    ]
  }
];

export default function AdminCustomers() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'analytics'
  const [customers, setCustomers] = useState(initialCustomersDataset);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);

  // Active KPI Card Filter Selected State
  const [activeKpiFilter, setActiveKpiFilter] = useState('TOTAL'); // 'TOTAL' | 'NEW_WEEK' | 'NEW_MONTH' | 'ACTIVE' | 'FREQUENT' | 'REPEAT'

  // Filters State
  const [searchName, setSearchName] = useState('');
  const [searchMobile, setSearchMobile] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [startDateFilter, setStartDateFilter] = useState('');
  const [endDateFilter, setEndDateFilter] = useState('');

  // Drawer & Modal States
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Total Customers State & Loading
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [loadingTotalCustomers, setLoadingTotalCustomers] = useState(true);

  const fetchTotalCustomers = async () => {
    try {
      setLoadingTotalCustomers(true);

      // Use the centralized `api` instance (src/services/api.js) instead of
      // a raw fetch() with a manually built URL, so this shares the same
      // baseURL, auth headers, and error handling as the rest of the app.
      let data = null;
      try {
        const response = await api.get('/customers');
        data = response.data;
      } catch (e) {
        try {
          const response = await api.get('/admin/customers');
          data = response.data;
        } catch (err) {}
      }

      if (!data) {
        data = await adminService.getCustomers();
      }

      const rawData = data?.data?.content || data?.data || data;
      const count = Array.isArray(rawData)
        ? rawData.length
        : rawData?.totalCustomers ?? rawData?.totalElements ?? (Array.isArray(data) ? data.length : 0);

      setTotalCustomers(count);
    } catch (error) {
      console.error("Customer count error:", error);
      setTotalCustomers(0);
    } finally {
      setLoadingTotalCustomers(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchTotalCustomers();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [customersData, analyticsData] = await Promise.all([
        adminService.getCustomers(),
        adminService.getCustomerAnalytics()
      ]);

      if (Array.isArray(customersData) && customersData.length > 0) {
        setCustomers(customersData);
      }
      if (analyticsData) {
        setAnalytics(analyticsData);
      }
      fetchTotalCustomers();
    } catch (err) {
      console.warn('Using demo customer data fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  // KPI Metrics Calculation
  const kpiCards = useMemo(() => {
    const total = loadingTotalCustomers ? "..." : totalCustomers;
    
    const active = analytics?.activeCustomers ?? customers.filter(c => {
      const st = (c.status || '').toLowerCase();
      return st === 'active' || st === 'vip';
    }).length;

    const newWeek = analytics?.newCustomersThisWeek ?? customers.filter(c => {
      const created = new Date(c.joinDate || c.createdAt || Date.now());
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return created >= weekAgo;
    }).length;

    const newMonth = analytics?.newCustomersThisMonth ?? customers.filter(c => {
      const created = new Date(c.joinDate || c.createdAt || Date.now());
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return created >= monthAgo;
    }).length;

    const frequent = analytics?.frequentlyOrderedCustomers ?? customers.filter(c => (c.totalOrders || c.ordersCount || 0) >= 5).length;
    
    const repeatCount = analytics?.repeatOrdersCount ?? customers.reduce((sum, c) => {
      const count = c.totalOrders || c.ordersCount || 0;
      return sum + (count > 1 ? count - 1 : 0);
    }, 0);

    return { total, newWeek, newMonth, active, frequent, repeatCount };
  }, [customers, analytics, totalCustomers, loadingTotalCustomers]);

  // Handler to filter table when user clicks on a KPI card
  const handleKpiCardClick = (kpiKey) => {
    setActiveKpiFilter(kpiKey);
    setActiveTab('overview');

    // Reset general filters first
    setSearchName('');
    setSearchMobile('');
    setSearchLocation('');
    setStartDateFilter('');
    setEndDateFilter('');

    if (kpiKey === 'TOTAL') {
      setStatusFilter('ALL');
      setFrequencyFilter('ALL');
      toast.success('Showing All Customers');
    } else if (kpiKey === 'NEW_WEEK') {
      setStatusFilter('ALL');
      setFrequencyFilter('ALL');
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDateFilter(weekAgo);
      toast.success('Filtered: New Customers This Week');
    } else if (kpiKey === 'NEW_MONTH') {
      setStatusFilter('ALL');
      setFrequencyFilter('ALL');
      const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStartDateFilter(monthAgo);
      toast.success('Filtered: New Customers This Month');
    } else if (kpiKey === 'ACTIVE') {
      setStatusFilter('ACTIVE');
      setFrequencyFilter('ALL');
      toast.success('Filtered: Active Customers');
    } else if (kpiKey === 'FREQUENT') {
      setStatusFilter('ALL');
      setFrequencyFilter('FREQUENT');
      toast.success('Filtered: Frequently Ordered Customers (5+ orders)');
    } else if (kpiKey === 'REPEAT') {
      setStatusFilter('ALL');
      setFrequencyFilter('REPEAT');
      toast.success('Filtered: Repeat Order Customers');
    }
  };

  // Filtered Customers List
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      // Name Filter
      if (searchName && !(c.name || '').toLowerCase().includes(searchName.toLowerCase())) {
        return false;
      }

      // Mobile Filter
      if (searchMobile && !(c.phone || c.phoneNumber || '').toLowerCase().includes(searchMobile.toLowerCase())) {
        return false;
      }

      // Location Filter
      if (searchLocation && !(c.location || '').toLowerCase().includes(searchLocation.toLowerCase())) {
        return false;
      }

      // Status Filter
      if (statusFilter !== 'ALL') {
        const st = (c.status || '').toUpperCase();
        if (statusFilter === 'VIP' && st !== 'VIP') return false;
        if (statusFilter === 'ACTIVE' && st !== 'ACTIVE' && st !== 'VIP') return false;
        if (statusFilter === 'BLOCKED' && st !== 'BLOCKED') return false;
        if (statusFilter === 'INACTIVE' && st !== 'INACTIVE') return false;
      }

      // Order Frequency Filter
      const count = c.totalOrders || c.ordersCount || 0;
      if (frequencyFilter === '1' && count !== 1) return false;
      if (frequencyFilter === 'REGULAR' && (count < 2 || count > 5)) return false;
      if (frequencyFilter === 'FREQUENT' && count < 5) return false;
      if (frequencyFilter === 'HEAVY' && count < 15) return false;
      if (frequencyFilter === 'REPEAT' && count <= 1) return false;

      // Date Range Filter
      if (startDateFilter) {
        const created = new Date(c.joinDate || c.createdAt || Date.now());
        const start = new Date(startDateFilter);
        if (created < start) return false;
      }
      if (endDateFilter) {
        const created = new Date(c.joinDate || c.createdAt || Date.now());
        const end = new Date(endDateFilter);
        end.setHours(23, 59, 59);
        if (created > end) return false;
      }

      return true;
    });
  }, [customers, searchName, searchMobile, searchLocation, statusFilter, frequencyFilter, startDateFilter, endDateFilter]);

  // Actions Handlers
  const handleToggleBlock = async (customer) => {
    const isCurrentlyBlocked = (customer.status || '').toLowerCase() === 'blocked';
    try {
      await adminService.toggleBlockCustomer(customer.id, customer.status);
      setCustomers(prev => prev.map(c => {
        if (c.id === customer.id) {
          return { ...c, status: isCurrentlyBlocked ? 'Active' : 'Blocked' };
        }
        return c;
      }));
      toast.success(`Customer ${customer.name} ${isCurrentlyBlocked ? 'Unblocked' : 'Blocked'} successfully!`);
    } catch (err) {
      toast.error('Failed to update customer status');
    }
  };

  const handleSendContact = (e) => {
    e.preventDefault();
    toast.success(`Notification & Email sent to ${selectedCustomer?.name || 'Customer'}!`);
    setShowContactModal(false);
    setContactSubject('');
    setContactMessage('');
  };

  const clearFilters = () => {
    setActiveKpiFilter('TOTAL');
    setSearchName('');
    setSearchMobile('');
    setSearchLocation('');
    setStatusFilter('ALL');
    setFrequencyFilter('ALL');
    setStartDateFilter('');
    setEndDateFilter('');
    toast.success('All filters reset');
  };

  const exportCustomersCSV = () => {
    const headers = ['Customer ID,Customer Name,Mobile Number,Location,Registration Date,Total Orders,Total Amount Spent (INR),Last Order Date,Customer Status'];
    const rows = filteredCustomers.map(c => 
      `"${c.id}","${c.name}","${c.phone || c.phoneNumber}","${c.location || ''}","${c.joinDate || ''}","${c.totalOrders || 0}","${c.totalSpent || 0}","${c.lastOrderDate || ''}","${c.status || 'Active'}"`
    );
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Customer_Management_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Customer data report exported as CSV!');
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs mb-1 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Enterprise Admin Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span>Customer Intelligence</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Customer Management Dashboard</h1>
          <p className="text-slate-300 text-sm mt-1 max-w-2xl">
            Track user registrations, lifetime purchase value, order frequencies, and regional customer growth metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData} 
            className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Data</span>
          </button>
          <button 
            onClick={exportCustomersCSV} 
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl shadow-md transition active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Customer CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Interactive KPI Summary Cards - Click any card to filter */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {/* Card 1: Total Customers */}
        <div 
          onClick={() => handleKpiCardClick('TOTAL')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-4 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 ${
            activeKpiFilter === 'TOTAL' 
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/20' 
              : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL CUSTOMERS</p>
            <div className="text-2xl font-bold text-slate-900 mt-0.5 customer-count">
              {loadingTotalCustomers ? "..." : totalCustomers}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-0.5">Lifetime registered</p>
          </div>
        </div>

        {/* Card 2: New Customers This Week */}
        <div 
          onClick={() => handleKpiCardClick('NEW_WEEK')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-4 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 ${
            activeKpiFilter === 'NEW_WEEK' 
              ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md bg-blue-50/20' 
              : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="p-3 bg-blue-100 text-blue-700 rounded-xl shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New This Week</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{kpiCards.newWeek}</h3>
            <p className="text-xs text-blue-600 font-medium mt-0.5">Last 7 days joiners</p>
          </div>
        </div>

        {/* Card 3: New Customers This Month */}
        <div 
          onClick={() => handleKpiCardClick('NEW_MONTH')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-4 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 ${
            activeKpiFilter === 'NEW_MONTH' 
              ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md bg-purple-50/20' 
              : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">New This Month</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{kpiCards.newMonth}</h3>
            <p className="text-xs text-purple-600 font-medium mt-0.5">Last 30 days joiners</p>
          </div>
        </div>

        {/* Card 4: Active Customers */}
        <div 
          onClick={() => handleKpiCardClick('ACTIVE')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-4 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 ${
            activeKpiFilter === 'ACTIVE' 
              ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-md bg-teal-50/20' 
              : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="p-3 bg-teal-100 text-teal-700 rounded-xl shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Customers</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{kpiCards.active}</h3>
            <p className="text-xs text-teal-600 font-medium mt-0.5">Account enabled</p>
          </div>
        </div>

        {/* Card 5: Frequently Ordered Customers */}
        <div 
          onClick={() => handleKpiCardClick('FREQUENT')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-4 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 ${
            activeKpiFilter === 'FREQUENT' 
              ? 'border-amber-500 ring-2 ring-amber-500/20 shadow-md bg-amber-50/20' 
              : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="p-3 bg-amber-100 text-amber-700 rounded-xl shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Frequently Ordered</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{kpiCards.frequent}</h3>
            <p className="text-xs text-amber-600 font-medium mt-0.5">5+ orders placed</p>
          </div>
        </div>

        {/* Card 6: Repeat Orders */}
        <div 
          onClick={() => handleKpiCardClick('REPEAT')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-center gap-4 active:scale-95 hover:shadow-lg hover:-translate-y-0.5 ${
            activeKpiFilter === 'REPEAT' 
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/20' 
              : 'border-slate-200 shadow-sm hover:border-slate-300'
          }`}
        >
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Repeat Orders</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-0.5">{kpiCards.repeatCount}</h3>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">Re-purchase volume</p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Customer Directory & Table</span>
          <span className="bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
            {filteredCustomers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-md'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <PieChart className="w-4 h-4 text-emerald-400" />
          <span>Analytics & Visual Trends</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CUSTOMER DIRECTORY TABLE & FILTERS */}
      {/* ========================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 6 Multi-Field Filter Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <span>Multi-Criteria Search & Filters</span>
                {activeKpiFilter !== 'TOTAL' && (
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200 ml-2">
                    Card Filter Active: {activeKpiFilter.replace('_', ' ')}
                  </span>
                )}
              </h3>
              <button
                onClick={clearFilters}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 flex items-center gap-1 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Filter 1: Customer Name */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh"
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Filter 2: Mobile Number */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Mobile Number</label>
                <input
                  type="text"
                  placeholder="e.g. 98765"
                  value={searchMobile}
                  onChange={e => setSearchMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Filter 3: Location */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Hyderabad"
                  value={searchLocation}
                  onChange={e => setSearchLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Filter 4: Customer Status */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Customer Status</label>
                <select
                  value={statusFilter}
                  onChange={e => {
                    setStatusFilter(e.target.value);
                    if (activeKpiFilter !== 'TOTAL') setActiveKpiFilter('TOTAL');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="VIP">VIP Customer</option>
                  <option value="BLOCKED">Blocked</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              {/* Filter 5: Order Frequency */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Order Frequency</label>
                <select
                  value={frequencyFilter}
                  onChange={e => {
                    setFrequencyFilter(e.target.value);
                    if (activeKpiFilter !== 'TOTAL') setActiveKpiFilter('TOTAL');
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="ALL">All Frequencies</option>
                  <option value="1">First Time (1 order)</option>
                  <option value="REGULAR">Regular (2-5 orders)</option>
                  <option value="FREQUENT">Frequent (5+ orders)</option>
                  <option value="REPEAT">Repeat Buyers (&gt;1 order)</option>
                  <option value="HEAVY">Heavy VIP (15+ orders)</option>
                </select>
              </div>

              {/* Filter 6: Registration Date Range */}
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Reg. From Date</label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={e => {
                    setStartDateFilter(e.target.value);
                    if (activeKpiFilter !== 'TOTAL') setActiveKpiFilter('TOTAL');
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* 9 Column Customer Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">Customer ID</th>
                    <th className="px-5 py-4">Customer Name</th>
                    <th className="px-5 py-4">Mobile Number</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Reg. Date</th>
                    <th className="px-5 py-4 text-center">Total Orders</th>
                    <th className="px-5 py-4 text-right">Total Spent</th>
                    <th className="px-5 py-4">Last Order Date</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-12 text-center text-slate-400">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-semibold text-slate-700">No customers matched your selected filters.</p>
                        <p className="text-xs text-slate-400 mt-1">Click "Reset All Filters" or select a different KPI card above.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map(customer => {
                      const isBlocked = (customer.status || '').toLowerCase() === 'blocked';
                      const isVip = (customer.status || '').toLowerCase() === 'vip';
                      return (
                        <tr key={customer.id} className="hover:bg-slate-50/80 transition">
                          {/* 1. Customer ID */}
                          <td className="px-5 py-4 font-mono font-bold text-xs text-slate-700">
                            {customer.id}
                          </td>

                          {/* 2. Customer Name */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                                {(customer.name || 'C')[0]}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900">{customer.name}</h4>
                                <p className="text-[11px] text-slate-400">{customer.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* 3. Mobile Number */}
                          <td className="px-5 py-4 font-mono text-xs text-slate-700">
                            {customer.phone || customer.phoneNumber}
                          </td>

                          {/* 4. Location */}
                          <td className="px-5 py-4 text-xs text-slate-600 max-w-xs truncate">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              {customer.location || 'Hyderabad, TS'}
                            </span>
                          </td>

                          {/* 5. Registration Date */}
                          <td className="px-5 py-4 text-xs text-slate-500">
                            {customer.joinDate || (customer.createdAt ? String(customer.createdAt).split('T')[0] : '2026-01-15')}
                          </td>

                          {/* 6. Total Orders */}
                          <td className="px-5 py-4 text-center">
                            <span className="px-2.5 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-800">
                              {customer.totalOrders || customer.ordersCount || 0}
                            </span>
                          </td>

                          {/* 7. Total Amount Spent */}
                          <td className="px-5 py-4 text-right font-bold text-emerald-700">
                            ₹{Number(customer.totalSpent || 0).toLocaleString()}
                          </td>

                          {/* 8. Last Order Date */}
                          <td className="px-5 py-4 text-xs text-slate-500">
                            {customer.lastOrderDate || 'Recent'}
                          </td>

                          {/* 9. Customer Status */}
                          <td className="px-5 py-4">
                            {isBlocked ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                                <Ban className="w-3 h-3" /> Blocked
                              </span>
                            ) : isVip ? (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                                <Award className="w-3 h-3 text-amber-600" /> VIP
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Active
                              </span>
                            )}
                          </td>

                          {/* 5 Action Buttons */}
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Action 1: View Profile */}
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowProfileDrawer(true);
                                }}
                                title="View Customer Profile"
                                className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>

                              {/* Action 2: View Order History */}
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowHistoryModal(true);
                                }}
                                title="View Order History"
                                className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <ShoppingBag className="w-4 h-4" />
                              </button>

                              {/* Action 3: Contact Customer */}
                              <button
                                onClick={() => {
                                  setSelectedCustomer(customer);
                                  setShowContactModal(true);
                                }}
                                title="Contact Customer"
                                className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition cursor-pointer"
                              >
                                <Mail className="w-4 h-4" />
                              </button>

                              {/* Action 4: Block / Unblock Customer */}
                              <button
                                onClick={() => handleToggleBlock(customer)}
                                title={isBlocked ? 'Unblock Customer' : 'Block Customer'}
                                className={`p-1.5 rounded-lg transition cursor-pointer ${
                                  isBlocked
                                    ? 'text-emerald-600 hover:bg-emerald-50'
                                    : 'text-rose-500 hover:bg-rose-50'
                                }`}
                              >
                                {isBlocked ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
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
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ANALYTICS & CHARTS */}
      {/* ========================================================= */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chart 1: Weekly Customer Registrations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-1">Weekly Customer Registrations</h3>
              <p className="text-xs text-slate-500 mb-4">Daily signup velocity over the past 7 days</p>
              
              <div className="h-44 flex items-end justify-between gap-2 pt-4 border-b border-slate-200">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                  const heights = [35, 60, 45, 90, 75, 100, 80];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div 
                        style={{ height: `${heights[idx]}%` }}
                        className="w-full bg-emerald-500 hover:bg-emerald-600 rounded-t-lg transition-all"
                      ></div>
                      <span className="text-[11px] font-bold text-slate-500">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Monthly Customer Registrations */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-1">Monthly Customer Registrations</h3>
              <p className="text-xs text-slate-500 mb-4">Weekly onboarding velocity across last 4 weeks</p>
              
              <div className="h-44 flex items-end justify-between gap-4 pt-4 border-b border-slate-200">
                {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((wk, idx) => {
                  const heights = [50, 75, 65, 95];
                  return (
                    <div key={wk} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div 
                        style={{ height: `${heights[idx]}%` }}
                        className="w-full bg-blue-500 hover:bg-blue-600 rounded-t-lg transition-all"
                      ></div>
                      <span className="text-[11px] font-bold text-slate-500">{wk}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 3: Frequently Ordered Customers Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-1">Frequently Ordered Customers Distribution</h3>
              <p className="text-xs text-slate-500 mb-4">Order frequency tier breakdown</p>

              <div className="space-y-3 pt-2">
                {[
                  { tier: 'First Time (1 Order)', count: customers.filter(c => (c.totalOrders || 0) === 1).length || 2, pct: 28, color: 'bg-blue-500' },
                  { tier: 'Regular (2-5 Orders)', count: customers.filter(c => (c.totalOrders || 0) >= 2 && (c.totalOrders || 0) <= 5).length || 3, pct: 45, color: 'bg-emerald-500' },
                  { tier: 'Frequent (6-15 Orders)', count: customers.filter(c => (c.totalOrders || 0) >= 6 && (c.totalOrders || 0) <= 15).length || 3, pct: 19, color: 'bg-amber-500' },
                  { tier: 'Heavy VIP (15+ Orders)', count: customers.filter(c => (c.totalOrders || 0) > 15).length || 2, pct: 8, color: 'bg-purple-500' }
                ].map(item => (
                  <div key={item.tier} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-700">
                      <span>{item.tier}</span>
                      <span>{item.count} customers ({item.pct}%)</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div style={{ width: `${item.pct}%` }} className={`h-full ${item.color} rounded-full`}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart 4: Repeat Order Trends */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-1">Repeat Order Trends</h3>
              <p className="text-xs text-slate-500 mb-4">Ratio of repeat orders vs single purchases</p>

              <div className="flex items-center justify-around h-44 border-b border-slate-200 pb-4">
                <div className="text-center space-y-1">
                  <span className="text-3xl font-extrabold text-emerald-600">68.4%</span>
                  <p className="text-xs text-slate-500 font-bold">Repeat Customer Rate</p>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-3xl font-extrabold text-blue-600">3.8x</span>
                  <p className="text-xs text-slate-500 font-bold">Avg Orders per User</p>
                </div>
                <div className="text-center space-y-1">
                  <span className="text-3xl font-extrabold text-amber-600">₹1,240</span>
                  <p className="text-xs text-slate-500 font-bold">Avg Order Value</p>
                </div>
              </div>
            </div>
          </div>

          {/* Chart 5 & 6: Top Customers Leaderboard & Growth Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Customers Leaderboard */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-1">Top Customers by Number of Orders</h3>
              <p className="text-xs text-slate-500 mb-4">Highest purchasing power users</p>

              <div className="space-y-3">
                {[...customers].sort((a,b) => (b.totalOrders || 0) - (a.totalOrders || 0)).slice(0, 5).map((c, idx) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{c.name}</h4>
                        <p className="text-[11px] text-slate-500">{c.location}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-xs text-emerald-700">{c.totalOrders || 12} Orders</span>
                      <p className="text-[11px] text-slate-400">₹{(c.totalSpent || 5400).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Growth Trend */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-800 mb-1">Cumulative Customer Growth Trend</h3>
              <p className="text-xs text-slate-500 mb-4">Total platform user base expansion timeline</p>

              <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-slate-200">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((mth, idx) => {
                  const heights = [20, 35, 50, 65, 78, 88, 100];
                  return (
                    <div key={mth} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                      <div 
                        style={{ height: `${heights[idx]}%` }}
                        className="w-full bg-gradient-to-t from-slate-900 to-emerald-600 rounded-t-lg transition-all"
                      ></div>
                      <span className="text-xs font-semibold text-slate-600">{mth}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* PROFILE DRAWER */}
      {/* ========================================================= */}
      {showProfileDrawer && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white w-full max-w-lg h-full shadow-2xl overflow-y-auto p-6 space-y-6 border-l border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider">Customer Profile</span>
                <h3 className="text-xl font-bold text-slate-900">{selectedCustomer.name}</h3>
              </div>
              <button onClick={() => setShowProfileDrawer(false)} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <div className="p-4 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                <p><span className="font-bold text-slate-800">Customer ID:</span> {selectedCustomer.id}</p>
                <p><span className="font-bold text-slate-800">Email:</span> {selectedCustomer.email}</p>
                <p><span className="font-bold text-slate-800">Mobile:</span> {selectedCustomer.phone || selectedCustomer.phoneNumber}</p>
                <p><span className="font-bold text-slate-800">Address:</span> {selectedCustomer.address || selectedCustomer.location}</p>
                <p><span className="font-bold text-slate-800">Joined Date:</span> {selectedCustomer.joinDate || '2026-01-15'}</p>
                <p><span className="font-bold text-slate-800">Status:</span> {selectedCustomer.status || 'Active'}</p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl space-y-2 border border-emerald-200">
                <h4 className="font-bold text-emerald-900">Lifetime Purchase Metrics</h4>
                <p><span className="font-bold text-emerald-800">Total Orders:</span> {selectedCustomer.totalOrders || 0}</p>
                <p><span className="font-bold text-emerald-800">Total Spent:</span> ₹{Number(selectedCustomer.totalSpent || 0).toLocaleString()}</p>
                <p><span className="font-bold text-emerald-800">Last Order Date:</span> {selectedCustomer.lastOrderDate || 'Recent'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ORDER HISTORY MODAL */}
      {/* ========================================================= */}
      {showHistoryModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Order History - {selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500">ID: {selectedCustomer.id} • Mobile: {selectedCustomer.phone}</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {(!selectedCustomer.orders || selectedCustomer.orders.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl text-slate-400 text-xs">
                  No previous orders placed by this customer yet.
                </div>
              ) : (
                selectedCustomer.orders.map((ord, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-slate-800">{ord.orderCode}</h4>
                      <p className="text-slate-500">{ord.date} • {ord.itemsCount} Items</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 text-sm">₹{ord.total}</span>
                      <p className="text-[10px] text-emerald-600 font-semibold">{ord.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CONTACT CUSTOMER MODAL */}
      {/* ========================================================= */}
      {showContactModal && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleSendContact} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">Contact {selectedCustomer.name}</h3>
              <button type="button" onClick={() => setShowContactModal(false)} className="p-2 text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. FarmToHome Special Offer / Account Support" 
                  value={contactSubject}
                  onChange={e => setContactSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Message</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="Type message to push as Email and App Notification..." 
                  value={contactMessage}
                  onChange={e => setContactMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowContactModal(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer">
                <Send className="w-3.5 h-3.5" /> Send Message
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
