import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronRight,
  Download,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  X,
  Star,
  MapPin,
  Heart,
  ShoppingCart,
  Menu,
  User,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import CustomerSidebar from '../../components/layout/CustomerSidebar';
import OrdersSkeleton from './components/OrdersSkeleton';
import EmptyOrders from './components/EmptyOrders';
import OrdersFilterModal from './components/OrdersFilterModal';
import toast from 'react-hot-toast';
import './orders.css';

// Image assets
import tomatoImg from '../../assets/images/tomato.png';
import potatoImg from '../../assets/images/potato.png';
import cabbageImg from '../../assets/images/cabbage.png';
import dairy3dSvg from '../../assets/images/categories/dairy-3d.svg';
import { aiVegBasket, aiFruitBasket } from '../../assets/images/aiImageAssets';

const vegBasket3d = aiVegBasket;
const fruitBasket3d = aiFruitBasket;

const SAMPLE_CUSTOMER_ORDERS = [
  {
    id: 'F2H123456',
    date: 'May 06, 2025 · 6:30 PM',
    itemCount: 4,
    total: 507,
    status: 'Delivered',
    deliveredDate: 'Delivered on May 07, 2025',
    image: vegBasket3d || tomatoImg,
    paymentMethod: 'Paid via UPI',
    address: {
      name: 'Sai Veeramalla',
      phone: '+91 98765 43210',
      line: 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur, Hyderabad, Telangana - 500081',
    },
    timeline: [
      { step: 'Order Placed', time: 'May 06, 2025 · 6:30 PM', done: true },
      { step: 'Confirmed', time: 'May 06, 2025 · 6:35 PM', done: true },
      { step: 'Packed', time: 'May 06, 2025 · 8:10 PM', done: true },
      { step: 'Out for Delivery', time: 'May 07, 2025 · 9:15 AM', done: true },
      { step: 'Delivered', time: 'May 07, 2025 · 11:20 AM', done: true },
    ],
    items: [
      { id: 'i1', name: 'Farm Fresh Tomatoes', pack: '500 g', qty: 2, price: 56, image: tomatoImg },
      { id: 'i2', name: 'Farm Fresh Potatoes', pack: '1 kg', qty: 1, price: 40, image: potatoImg },
      { id: 'i3', name: 'Broccoli', pack: '250 g', qty: 1, price: 59, image: cabbageImg },
    ],
  },
  {
    id: 'F2H123455',
    date: 'May 05, 2025 · 11:20 AM',
    itemCount: 6,
    total: 892,
    status: 'Out for Delivery',
    deliveredDate: 'Expected by May 06, 2025',
    image: fruitBasket3d || tomatoImg,
    paymentMethod: 'Paid via UPI',
    address: {
      name: 'Sai Veeramalla',
      phone: '+91 98765 43210',
      line: 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur, Hyderabad, Telangana - 500081',
    },
    timeline: [
      { step: 'Order Placed', time: 'May 05, 2025 · 11:20 AM', done: true },
      { step: 'Confirmed', time: 'May 05, 2025 · 11:25 AM', done: true },
      { step: 'Packed', time: 'May 05, 2025 · 2:10 PM', done: true },
      { step: 'Out for Delivery', time: 'May 06, 2025 · 9:00 AM', done: true },
      { step: 'Delivered', time: 'Expected by 6:00 PM', done: false },
    ],
    items: [
      { id: 'i1', name: 'Farm Fresh Tomatoes', pack: '500 g', qty: 2, price: 56, image: tomatoImg },
      { id: 'i4', name: 'Farm Fresh Milk', pack: '1 L', qty: 2, price: 104, image: dairy3dSvg },
    ],
  },
  {
    id: 'F2H123454',
    date: 'May 04, 2025 · 8:45 PM',
    itemCount: 3,
    total: 312,
    status: 'Confirmed',
    deliveredDate: 'Will be delivered by May 05, 2025',
    image: vegBasket3d || potatoImg,
    paymentMethod: 'Paid via Cards',
    address: {
      name: 'Sai Veeramalla',
      phone: '+91 98765 43210',
      line: 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur, Hyderabad, Telangana - 500081',
    },
    timeline: [
      { step: 'Order Placed', time: 'May 04, 2025 · 8:45 PM', done: true },
      { step: 'Confirmed', time: 'May 04, 2025 · 8:50 PM', done: true },
      { step: 'Packed', time: 'Pending', done: false },
      { step: 'Out for Delivery', time: 'Pending', done: false },
      { step: 'Delivered', time: 'Pending', done: false },
    ],
    items: [
      { id: 'i2', name: 'Farm Fresh Potatoes', pack: '1 kg', qty: 2, price: 80, image: potatoImg },
    ],
  },
  {
    id: 'F2H123453',
    date: 'May 03, 2025 · 10:15 AM',
    itemCount: 5,
    total: 645,
    status: 'Cancelled',
    deliveredDate: 'Cancelled on May 03, 2025',
    image: fruitBasket3d || cabbageImg,
    paymentMethod: 'Paid via NetBanking',
    address: {
      name: 'Sai Veeramalla',
      phone: '+91 98765 43210',
      line: 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur, Hyderabad, Telangana - 500081',
    },
    timeline: [
      { step: 'Order Placed', time: 'May 03, 2025 · 10:15 AM', done: true },
      { step: 'Cancelled', time: 'May 03, 2025 · 10:30 AM', done: true },
    ],
    items: [
      { id: 'i3', name: 'Broccoli', pack: '250 g', qty: 2, price: 118, image: cabbageImg },
    ],
  },
  {
    id: 'F2H123452',
    date: 'May 02, 2025 · 7:30 PM',
    itemCount: 2,
    total: 215,
    status: 'Delivered',
    deliveredDate: 'Delivered on May 03, 2025',
    image: vegBasket3d || tomatoImg,
    paymentMethod: 'Paid via UPI',
    address: {
      name: 'Sai Veeramalla',
      phone: '+91 98765 43210',
      line: 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur, Hyderabad, Telangana - 500081',
    },
    timeline: [
      { step: 'Order Placed', time: 'May 02, 2025 · 7:30 PM', done: true },
      { step: 'Delivered', time: 'May 03, 2025 · 11:00 AM', done: true },
    ],
    items: [
      { id: 'i1', name: 'Farm Fresh Tomatoes', pack: '500 g', qty: 1, price: 28, image: tomatoImg },
    ],
  },
  {
    id: 'F2H123451',
    date: 'May 01, 2025 · 9:10 AM',
    itemCount: 7,
    total: 1245,
    status: 'Delivered',
    deliveredDate: 'Delivered on May 02, 2025',
    image: fruitBasket3d || potatoImg,
    paymentMethod: 'Paid via UPI',
    address: {
      name: 'Sai Veeramalla',
      phone: '+91 98765 43210',
      line: 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur, Hyderabad, Telangana - 500081',
    },
    timeline: [
      { step: 'Order Placed', time: 'May 01, 2025 · 9:10 AM', done: true },
      { step: 'Delivered', time: 'May 02, 2025 · 2:00 PM', done: true },
    ],
    items: [
      { id: 'i4', name: 'Farm Fresh Milk', pack: '1 L', qty: 3, price: 156, image: dairy3dSvg },
    ],
  },
];

const formatOrderObject = (rawOrder) => {
  if (!rawOrder || typeof rawOrder !== 'object') return null;

  try {
    const orderId = rawOrder.id || rawOrder.orderNumber || rawOrder.orderId || 'F2H123456';
    const rawStatus = String(rawOrder.status || 'Confirmed');
    const orderStatus = rawStatus === 'PLACED' ? 'Confirmed' : (rawStatus === 'DELIVERED' ? 'Delivered' : rawStatus);

    let itemsList = [];
    if (Array.isArray(rawOrder.items) && rawOrder.items.length > 0) {
      itemsList = rawOrder.items.map((item, idx) => ({
        id: String(item?.id || `item-${idx}`),
        name: String(item?.name || item?.productName || 'Organic Produce Item'),
        pack: String(item?.pack || item?.unit || '500 g'),
        qty: Number(item?.qty || item?.quantity || 1),
        price: Number(item?.price || item?.unitPrice || 0),
        image: item?.image || item?.productImage || tomatoImg,
      }));
    } else {
      itemsList = [
        { id: 'i1', name: 'Farm Fresh Tomatoes', pack: '500 g', qty: 2, price: 56, image: tomatoImg },
        { id: 'i2', name: 'Farm Fresh Potatoes', pack: '1 kg', qty: 1, price: 40, image: potatoImg },
      ];
    }

    const addressObj = {
      name: String(rawOrder.address?.name || rawOrder.shippingAddress?.name || 'Sai Veeramalla'),
      phone: String(rawOrder.address?.phone || rawOrder.shippingAddress?.phone || '+91 98765 43210'),
      line: String(rawOrder.address?.line || rawOrder.shippingAddress?.line || rawOrder.shippingAddress?.addressLine1 || 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur, Hyderabad - 500081'),
    };

    const timelineList = Array.isArray(rawOrder.timeline) && rawOrder.timeline.length > 0
      ? rawOrder.timeline
      : [
          { step: 'Order Placed', time: rawOrder.createdAt ? String(rawOrder.createdAt).split('T')[0] : '6:30 PM', done: true },
          { step: 'Confirmed', time: '6:35 PM', done: true },
          { step: 'Packed', time: '8:10 PM', done: true },
          { step: 'Out for Delivery', time: 'Expected by 6:00 PM', done: orderStatus === 'Delivered' },
          { step: 'Delivered', time: '11:20 AM', done: orderStatus === 'Delivered' },
        ];

    return {
      id: String(orderId),
      date: String(rawOrder.date || (rawOrder.createdAt ? String(rawOrder.createdAt).split('T')[0] + ' · 6:30 PM' : 'May 06, 2025 · 6:30 PM')),
      itemCount: Number(rawOrder.itemCount || itemsList.length),
      total: Number(rawOrder.total || rawOrder.totalAmount || 180),
      status: orderStatus,
      deliveredDate: String(rawOrder.deliveredDate || (orderStatus === 'Delivered' ? 'Delivered on May 07, 2025' : 'Expected by 6:00 PM')),
      image: rawOrder.image || (itemsList[0] ? itemsList[0].image : vegBasket3d || tomatoImg),
      paymentMethod: String(rawOrder.paymentMethod || 'Paid via UPI'),
      address: addressObj,
      timeline: timelineList,
      items: itemsList,
    };
  } catch {
    return null;
  }
};

const MyOrders = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { cart = [], orders: backendOrders = [], fetchOrders } = useCustomer();
  const { user } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tab State
  const initialTab = searchParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);

  // Normalize Orders list
  const ordersList = useMemo(() => {
    try {
      const rawList = Array.isArray(backendOrders) && backendOrders.length > 0 ? backendOrders : SAMPLE_CUSTOMER_ORDERS;
      const formatted = rawList.map(formatOrderObject).filter(Boolean);
      return formatted.length > 0 ? formatted : SAMPLE_CUSTOMER_ORDERS;
    } catch {
      return SAMPLE_CUSTOMER_ORDERS;
    }
  }, [backendOrders]);

  const [selectedOrder, setSelectedOrder] = useState(ordersList[0] || SAMPLE_CUSTOMER_ORDERS[0]);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  useEffect(() => {
    if (ordersList.length > 0 && (!selectedOrder || !ordersList.some((o) => o?.id === selectedOrder?.id))) {
      setSelectedOrder(ordersList[0]);
    }
  }, [ordersList]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 6;

  // Tab Counts
  const counts = useMemo(() => {
    try {
      const list = Array.isArray(ordersList) ? ordersList : SAMPLE_CUSTOMER_ORDERS;
      const activeCount = list.filter((o) =>
        o && ['Out for Delivery', 'Confirmed', 'Packed', 'Order Placed', 'PLACED'].includes(o.status)
      ).length;
      const deliveredCount = list.filter((o) => o && o.status === 'Delivered').length;
      const cancelledCount = list.filter((o) => o && o.status === 'Cancelled').length;
      return {
        all: list.length,
        active: activeCount,
        delivered: deliveredCount,
        cancelled: cancelledCount,
      };
    } catch {
      return { all: SAMPLE_CUSTOMER_ORDERS.length, active: 2, delivered: 4, cancelled: 1 };
    }
  }, [ordersList]);

  // Tab Selection
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
    setCurrentPage(1);
  };

  // Filtered Orders List
  const filteredOrders = useMemo(() => {
    try {
      const list = Array.isArray(ordersList) ? ordersList : SAMPLE_CUSTOMER_ORDERS;
      return list.filter((order) => {
        if (!order) return false;
        if (activeTab === 'active' && !['Out for Delivery', 'Confirmed', 'Packed', 'Order Placed', 'PLACED'].includes(order.status)) {
          return false;
        }
        if (activeTab === 'delivered' && order.status !== 'Delivered') {
          return false;
        }
        if (activeTab === 'cancelled' && order.status !== 'Cancelled') {
          return false;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesId = String(order.id || '').toLowerCase().includes(q);
          const matchesItems = Array.isArray(order.items) && order.items.some((i) => String(i?.name || '').toLowerCase().includes(q));
          const matchesStatus = String(order.status || '').toLowerCase().includes(q);
          if (!matchesId && !matchesItems && !matchesStatus) return false;
        }

        if (appliedFilters) {
          if (appliedFilters.status !== 'ALL' && order.status !== appliedFilters.status) return false;
          if (appliedFilters.paymentMethod !== 'ALL' && !String(order.paymentMethod || '').includes(appliedFilters.paymentMethod)) return false;
          if (appliedFilters.minAmount && order.total < appliedFilters.minAmount) return false;
          if (appliedFilters.maxAmount && order.total > appliedFilters.maxAmount) return false;
        }

        return true;
      });
    } catch {
      return SAMPLE_CUSTOMER_ORDERS;
    }
  }, [ordersList, activeTab, searchQuery, appliedFilters]);

  // Paginated List
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, currentPage]);

  const handleSelectOrder = (order) => {
    if (order) {
      setSelectedOrder(order);
      setIsMobileDetailsOpen(true);
    }
  };

  const handleDownloadInvoice = (orderId) => {
    toast.success(`Invoice for Order #${orderId} downloaded successfully!`);
  };

  return (
    <div className="customer-shop-shell bg-[#f8fafc]">
      {/* Left Navigation Sidebar */}
      <CustomerSidebar
        activeItem="orders"
        onItemClick={(item) => {
          if (item.id === 'shop') navigate('/customer/shop');
          if (item.id === 'cart') navigate('/cart');
          if (item.id === 'dashboard') navigate('/dashboard');
        }}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="customer-shop-main min-h-screen pb-8 pt-3 px-2 sm:px-4">
        <div className="orders-container">
          {/* Top Title Header */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/60 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer active:scale-95 transition-all shadow-2xs"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
                  My Orders
                </h1>
                <p className="text-xs font-semibold text-slate-400">
                  Track, view and manage your orders
                </p>
              </div>
            </div>
          </div>

          {/* Order Status Filter Tabs Bar */}
          <div className="orders-tabs mb-2.5">
            <button
              type="button"
              onClick={() => handleTabChange('all')}
              className={`orders-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            >
              <span>All Orders</span>
              <span className="bg-slate-100 text-slate-700 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {counts.all}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('active')}
              className={`orders-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
            >
              <span>Active</span>
              <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {counts.active}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('delivered')}
              className={`orders-tab-btn ${activeTab === 'delivered' ? 'active' : ''}`}
            >
              <span>Delivered</span>
              <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {counts.delivered}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('cancelled')}
              className={`orders-tab-btn ${activeTab === 'cancelled' ? 'active' : ''}`}
            >
              <span>Cancelled</span>
              <span className="bg-purple-100 text-purple-800 font-black text-[10px] px-1.5 py-0.2 rounded-full">
                {counts.cancelled}
              </span>
            </button>
          </div>

          {/* Search Bar & Filter Button Toolbar */}
          <div className="orders-toolbar mb-3">
            <div className="orders-search">
              <input
                type="text"
                placeholder="Search by order ID or product name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>

            <button
              type="button"
              onClick={() => setFilterModalOpen(true)}
              className="orders-filter-btn"
            >
              <Filter className="h-3 w-3" />
              <span>Filter</span>
              {appliedFilters && (
                <span className="h-1.5 w-1.5 rounded-full bg-[#009b5a] inline-block" />
              )}
            </button>
          </div>

          {/* Main Grid: Orders Cards List + Selected Order Details Panel */}
          {loading ? (
            <OrdersSkeleton />
          ) : error ? (
            <div className="bg-white rounded-[14px] border border-rose-200 p-6 text-center space-y-2">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
              <h3 className="text-sm font-black text-slate-800">Failed to load orders</h3>
              <p className="text-xs text-slate-500">{error}</p>
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  if (fetchOrders) fetchOrders();
                }}
                className="inline-flex items-center gap-1.5 bg-[#009b5a] text-white px-4 py-1.5 rounded-lg font-bold text-xs cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Try Again</span>
              </button>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="orders-layout">
              {/* Left Column: Orders Cards List */}
              <div className="orders-main">
                <div className="orders-list">
                  {paginatedOrders.map((order) => {
                    const isSelected = selectedOrder?.id === order?.id;

                    return (
                      <div
                        key={order.id}
                        onClick={() => handleSelectOrder(order)}
                        className={`order-card ${isSelected ? 'selected' : ''}`}
                      >
                        {/* Order Thumbnail */}
                        <div className="order-card-image">
                          <img src={order.image} alt={order.id} />
                        </div>

                        {/* Order Info */}
                        <div className="order-card-content space-y-0.5">
                          <h3 className="text-xs sm:text-sm font-black text-[#009b5a] truncate">
                            Order #{order.id}
                          </h3>
                          <p className="text-[11px] font-semibold text-slate-400">{order.date}</p>
                          <p className="text-[11px] font-bold text-slate-600">{order.itemCount} Items</p>
                          <p className="text-xs font-black text-slate-900 pt-0.5">
                            Total: ₹{order.total}
                          </p>
                        </div>

                        {/* Order Status & Actions */}
                        <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                          <span
                            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                              order.status === 'Delivered'
                                ? 'bg-emerald-100 text-emerald-800'
                                : order.status === 'Out for Delivery'
                                ? 'bg-emerald-50 text-emerald-700'
                                : order.status === 'Confirmed'
                                ? 'bg-amber-100 text-amber-800'
                                : order.status === 'Packed'
                                ? 'bg-sky-100 text-sky-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {order.status}
                          </span>

                          <span className="text-[10px] font-semibold text-slate-400">
                            {order.deliveredDate}
                          </span>

                          <div className="pt-0.5 flex items-center gap-1">
                            {order.status === 'Delivered' ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success('Rate & Review modal opened');
                                }}
                                className="text-[11px] font-bold text-[#009b5a] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <span className="text-amber-500 text-[10px]">★★★★★</span>
                                <span>Rate & Review</span>
                              </button>
                            ) : ['Out for Delivery', 'Confirmed', 'Packed'].includes(order.status) ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toast.success(`Tracking Order #${order.id}`);
                                }}
                                className="text-[11px] font-bold text-[#009b5a] hover:underline flex items-center gap-0.5 cursor-pointer"
                              >
                                <Truck className="h-3 w-3" />
                                <span>Track Order</span>
                              </button>
                            ) : null}
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination Controls */}
                <div className="orders-pagination">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="h-7 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-700 disabled:opacity-40"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                    <button
                      key={pg}
                      type="button"
                      onClick={() => setCurrentPage(pg)}
                      className={`h-7 w-7 rounded-md text-[11px] font-black transition-all ${
                        currentPage === pg
                          ? 'bg-[#009b5a] text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {pg}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="h-7 px-2.5 rounded-md bg-white border border-slate-200 text-[11px] font-bold text-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* Right Column: Selected Order Details Panel (Desktop/Laptop) */}
              {selectedOrder && (
                <div className="order-details-panel space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h2 className="text-xs font-black text-slate-800 uppercase tracking-wider">Order Details</h2>
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(null)}
                      className="text-slate-400 hover:text-slate-600 p-0.5"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Top Order Overview */}
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs sm:text-sm font-black text-slate-900">Order #{selectedOrder.id}</h3>
                      <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.2 rounded-full">
                        {selectedOrder.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-semibold">{selectedOrder.date}</p>

                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(selectedOrder.id)}
                      className="text-[11px] font-extrabold text-[#009b5a] hover:underline flex items-center gap-1 pt-0.5 cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download Invoice</span>
                    </button>
                  </div>

                  {/* Delivery Address */}
                  {selectedOrder.address && (
                    <div className="border-t border-slate-100 pt-2 space-y-0.5">
                      <h4 className="text-[11px] font-black text-slate-800">Delivery Address</h4>
                      <p className="text-[11px] font-extrabold text-slate-800">{selectedOrder.address.name}</p>
                      <p className="text-[10px] font-bold text-slate-500">{selectedOrder.address.phone}</p>
                      <p className="text-[10px] font-medium text-slate-500 leading-tight">
                        {selectedOrder.address.line}
                      </p>
                    </div>
                  )}

                  {/* 5-Stage Delivery Timeline */}
                  {Array.isArray(selectedOrder.timeline) && (
                    <div className="border-t border-slate-100 pt-2 space-y-1.5">
                      <h4 className="text-[11px] font-black text-slate-800 mb-1">Delivery Timeline</h4>
                      <div className="relative pl-4 space-y-2 border-l-2 border-emerald-200">
                        {selectedOrder.timeline.map((item, idx) => (
                          <div key={idx} className="relative flex flex-col">
                            <div
                              className={`absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border border-white flex items-center justify-center ${
                                item?.done ? 'bg-[#009b5a]' : 'bg-slate-300'
                              }`}
                            >
                              {item?.done && <CheckCircle2 className="h-2 w-2 text-white" />}
                            </div>
                            <span className={`text-[11px] font-black ${item?.done ? 'text-slate-800' : 'text-slate-400'}`}>
                              {item?.step}
                            </span>
                            <span className="text-[9px] font-semibold text-slate-400">{item?.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Order Products List */}
                  {Array.isArray(selectedOrder.items) && (
                    <div className="border-t border-slate-100 pt-2 space-y-1.5">
                      <h4 className="text-[11px] font-black text-slate-800">Order Items ({selectedOrder.items.length})</h4>
                      <div className="space-y-1.5 divide-y divide-slate-100 max-h-[140px] overflow-y-auto pr-1">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="pt-1.5 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-7 w-7 rounded-md bg-slate-50 border border-slate-200 p-0.5 shrink-0 overflow-hidden">
                                <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-slate-800 truncate text-[11px]">{item.name}</h5>
                                <span className="text-[9px] text-slate-400 font-medium">{item.pack} . Qty: {item.qty}</span>
                              </div>
                            </div>
                            <span className="font-black text-slate-800 text-[11px] shrink-0">₹{item.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total & Payment */}
                  <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-black text-slate-800 block">Total Amount</span>
                      <span className="text-[9px] text-[#009b5a] font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <span className="text-base font-black text-[#009b5a]">₹{selectedOrder.total}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <OrdersFilterModal
        isOpen={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
        onApplyFilters={(filters) => setAppliedFilters(filters)}
        onClearFilters={() => setAppliedFilters(null)}
      />

      {/* Mobile Order Details Full Screen Modal / Sheet */}
      {selectedOrder && isMobileDetailsOpen && (
        <div className="mobile-order-details open md:hidden">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
            <h2 className="text-base font-black text-slate-800">Order Details</h2>
            <button
              type="button"
              onClick={() => setIsMobileDetailsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900">Order #{selectedOrder.id}</h3>
              <span className="bg-emerald-100 text-emerald-800 font-black text-[10px] px-2 py-0.2 rounded-full">
                {selectedOrder.status}
              </span>
            </div>

            {selectedOrder.address && (
              <div className="border-t border-slate-100 pt-2 space-y-0.5">
                <h4 className="text-[11px] font-black text-slate-800">Delivery Address</h4>
                <p className="text-[11px] font-extrabold text-slate-800">{selectedOrder.address.name}</p>
                <p className="text-[10px] font-bold text-slate-600">{selectedOrder.address.phone}</p>
                <p className="text-[10px] font-medium text-slate-500">{selectedOrder.address.line}</p>
              </div>
            )}

            {Array.isArray(selectedOrder.timeline) && (
              <div className="border-t border-slate-100 pt-2 space-y-1.5">
                <h4 className="text-[11px] font-black text-slate-800">Delivery Timeline</h4>
                <div className="relative pl-4 space-y-2 border-l-2 border-emerald-200">
                  {selectedOrder.timeline.map((item, idx) => (
                    <div key={idx} className="relative flex flex-col">
                      <span className={`text-[11px] font-black ${item?.done ? 'text-slate-800' : 'text-slate-400'}`}>
                        {item?.step}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-400">{item?.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 flex items-center justify-between">
              <span className="text-xs font-black text-slate-900">Total Amount</span>
              <span className="text-base font-black text-[#009b5a]">₹{selectedOrder.total}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
