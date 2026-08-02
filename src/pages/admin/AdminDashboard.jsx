import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Package, 
  ShoppingCart, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  AlertTriangle,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  Plus,
  Truck,
  CreditCard,
  Eye,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [liveStats, setLiveStats] = useState(null);
  const [recentOrdersList, setRecentOrdersList] = useState(null);
  const [totalCustomersCount, setTotalCustomersCount] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchDashboardData = async () => {
      const stats = await adminService.getDashboardStats();
      const orders = await adminService.getOrders();
      const customers = await adminService.getCustomers();

      if (isMounted) {
        if (stats) setLiveStats(stats);
        if (orders && Array.isArray(orders)) setRecentOrdersList(orders.slice(0, 5));
        if (customers) {
          const count = Array.isArray(customers)
            ? customers.length
            : customers?.totalCustomers ?? customers?.totalElements ?? 0;
          setTotalCustomersCount(count);
        }
      }
    };
    fetchDashboardData();
    return () => { isMounted = false; };
  }, []);

  // Metrics Data
  const metrics = [
    {
      title: 'Total Farmers',
      value: liveStats?.totalFarmers != null ? String(liveStats.totalFarmers) : '48',
      subtitle: '+4 this week',
      icon: UserCheck,
      bgColor: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'Total Customers',
      value: String(totalCustomersCount ?? liveStats?.totalCustomers ?? 0),
      subtitle: 'Lifetime registered',
      icon: Users,
      bgColor: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-100'
    },
    {
      title: 'Total Products',
      value: liveStats?.totalProducts != null ? String(liveStats.totalProducts) : '36',
      subtitle: '5 categories',
      icon: Package,
      bgColor: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-100'
    },
    {
      title: 'Active Orders',
      value: liveStats?.activeOrders != null ? String(liveStats.activeOrders) : '14',
      subtitle: 'In transit / packed',
      icon: ShoppingCart,
      bgColor: 'bg-amber-50 text-amber-600',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Delivered Orders',
      value: liveStats?.deliveredOrders != null ? String(liveStats.deliveredOrders) : '128',
      subtitle: 'Completed',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-100'
    },
    {
      title: 'Pending Orders',
      value: liveStats?.pendingOrders != null ? String(liveStats.pendingOrders) : '06',
      subtitle: 'Awaiting confirm',
      icon: Clock,
      bgColor: 'bg-orange-50 text-orange-600',
      borderColor: 'border-orange-100'
    },
    {
      title: 'Total Revenue',
      value: liveStats?.totalRevenue != null ? `₹${Number(liveStats.totalRevenue).toLocaleString()}` : '₹1,84,500',
      subtitle: '+18.4% growth',
      icon: IndianRupee,
      bgColor: 'bg-emerald-50 text-emerald-700',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Out of Stock',
      value: liveStats?.outOfStockProducts != null ? String(liveStats.outOfStockProducts) : '02',
      subtitle: 'Re-stock required',
      icon: AlertTriangle,
      bgColor: 'bg-rose-50 text-rose-600',
      borderColor: 'border-rose-100'
    }
  ];

  const recentOrders = recentOrdersList || [
    { id: '#ORD-1234', customer: 'Ramesh Kumar', items: 'Spinach 1kg, Mint 250g', amount: 1250, status: 'Delivered', time: '10m ago' },
    { id: '#ORD-1233', customer: 'Sneha Patel', items: 'Coriander 500g, Methi 1kg', amount: 860, status: 'Out for Delivery', time: '25m ago' },
    { id: '#ORD-1232', customer: 'Amit Singh', items: 'Amarnath Green 2kg', amount: 420, status: 'Packed', time: '40m ago' },
    { id: '#ORD-1231', customer: 'Priya Sharma', items: 'Red Amarnath 1.5kg', amount: 1560, status: 'Confirmed', time: '1h ago' },
    { id: '#ORD-1230', customer: 'Vikram Joshi', items: 'Dill Leaves 500g', amount: 780, status: 'Pending', time: '2h ago' },
  ];

  return (
    <div className="p-4 sm:p-5 max-w-[1600px] mx-auto space-y-4 text-left">
      
      {/* Compact Top Banner Greeting */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-xl p-4 sm:p-5 text-white shadow-sm relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative z-10 space-y-1 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 bg-emerald-700/60 backdrop-blur-xs px-2.5 py-0.5 rounded-full text-[11px] font-bold text-emerald-200 border border-emerald-500/30">
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Farm2Home Admin Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">Welcome, Admin!</h1>
          <p className="text-xs text-emerald-100 font-medium">
            Overview of store performance, orders, farmer settlements, and inventory.
          </p>
        </div>

        {/* Action Buttons inside banner */}
        <div className="relative z-10 flex items-center gap-2">
          <button 
            onClick={() => navigate('/admin/products')}
            className="bg-white hover:bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>Add Product</span>
          </button>

          <button 
            onClick={() => navigate('/admin/orders')}
            className="bg-emerald-700/80 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center space-x-1.5 transition-all border border-emerald-500/40 cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Orders</span>
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* 8 Overview Metric Cards Grid - 4 per row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {metrics.map((m, idx) => {
          const IconComp = m.icon;
          return (
            <div 
              key={idx} 
              className={`bg-white p-3.5 rounded-xl border ${m.borderColor} shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between space-y-2 group`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{m.title}</span>
                <div className={`p-1.5 rounded-lg ${m.bgColor} transition-transform group-hover:scale-105`}>
                  <IconComp className="w-4 h-4" />
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight leading-none">{m.value}</h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-1">{m.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Compact Quick Actions Section */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-800">Quick Actions</h2>
          <span className="text-[11px] text-slate-400 font-medium">Instant controls</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Action 1: Add New Product */}
          <button 
            onClick={() => navigate('/admin/products')}
            className="p-2.5 bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-200 rounded-lg flex items-center space-x-2.5 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-emerald-800 transition-colors leading-tight">Add Product</h3>
              <p className="text-[10px] text-slate-400 font-medium">Catalog & prices</p>
            </div>
          </button>

          {/* Action 2: Approve Farmers */}
          <button 
            onClick={() => navigate('/admin/farmers')}
            className="p-2.5 bg-blue-50/60 hover:bg-blue-100/70 border border-blue-200 rounded-lg flex items-center space-x-2.5 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-800 transition-colors leading-tight">Approve Farmers</h3>
              <p className="text-[10px] text-slate-400 font-medium">Verify profiles</p>
            </div>
          </button>

          {/* Action 3: View Orders */}
          <button 
            onClick={() => navigate('/admin/orders')}
            className="p-4 bg-purple-50/60 hover:bg-purple-100/70 border border-purple-200 rounded-lg flex items-center space-x-2.5 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-purple-800 transition-colors leading-tight">View Orders</h3>
              <p className="text-[10px] text-slate-400 font-medium">Order status</p>
            </div>
          </button>

          {/* Action 4: Send Notification */}
          <button 
            onClick={() => navigate('/admin/notifications')}
            className="p-2.5 bg-amber-50/60 hover:bg-amber-100/70 border border-amber-200 rounded-lg flex items-center space-x-2.5 text-left transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 group-hover:text-amber-800 transition-colors leading-tight">Send Notification</h3>
              <p className="text-[10px] text-slate-400 font-medium">Broadcast alerts</p>
            </div>
          </button>

        </div>
      </div>

      {/* Compact Charts & Shortcuts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Compact Sales Curve Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800">Sales & Revenue Trend</h3>
              <p className="text-[10px] text-slate-400">Weekly customer purchases & payouts</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              +18.4% Growth
            </span>
          </div>

          <div className="h-36 w-full pt-2">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 500 120">
              <defs>
                <linearGradient id="dashboardSalesGradCompact" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              <path 
                d="M0,100 Q70,70 140,85 T280,45 T420,60 T500,15 L500,120 L0,120 Z" 
                fill="url(#dashboardSalesGradCompact)" 
              />

              <path 
                d="M0,100 Q70,70 140,85 T280,45 T420,60 T500,15" 
                fill="none" 
                stroke="#10b981" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />

              <circle cx="140" cy="85" r="4" fill="#047857" />
              <circle cx="280" cy="45" r="4" fill="#047857" />
              <circle cx="500" cy="15" r="5" fill="#10b981" />
            </svg>
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 pt-1 border-t border-slate-100">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Compact Quick Operational Shortcuts */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 mb-2">Shortcuts</h3>

            <div className="space-y-2">
              <button 
                onClick={() => navigate('/admin/inventory')}
                className="w-full p-2 bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                    <Package className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">Stock Inventory</h4>
                    <p className="text-[10px] text-slate-400">Manage stock in kg</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/admin/delivery')}
                className="w-full p-2 bg-slate-50 hover:bg-purple-50/60 border border-slate-200 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-purple-100 text-purple-700 rounded-md">
                    <Truck className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">Delivery Fleet</h4>
                    <p className="text-[10px] text-slate-400">Live GPS tracking</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button 
                onClick={() => navigate('/admin/payments')}
                className="w-full p-2 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 rounded-lg flex items-center justify-between text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-md">
                    <CreditCard className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 leading-tight">Farmer Payouts</h4>
                    <p className="text-[10px] text-slate-400">Settlements & commission</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Recent Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800">Recent Orders</h3>
          </div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5 cursor-pointer"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-bold text-slate-700">
                <th className="px-3.5 py-2.5">Order ID</th>
                <th className="px-3.5 py-2.5">Customer</th>
                <th className="px-3.5 py-2.5">Products</th>
                <th className="px-3.5 py-2.5">Amount</th>
                <th className="px-3.5 py-2.5">Status</th>
                <th className="px-3.5 py-2.5 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="text-[12px] font-semibold text-slate-600 divide-y divide-slate-100">
              {recentOrders.map((ord, idx) => {
                const orderId = ord.id || ord.orderId ? (String(ord.id || ord.orderId).startsWith('#') ? (ord.id || ord.orderId) : `#${ord.id || ord.orderId}`) : `#ORD-${idx+1}`;
                const customerName = ord.customer || ord.customerName || 'Customer';
                const orderAmount = ord.amount ?? ord.totalAmount ?? ord.totalPrice ?? 0;
                const orderStatus = ord.status || 'Pending';
                const orderTime = ord.time || ord.date || ord.createdAt || 'Recent';

                const formattedItems = typeof ord.items === 'string'
                  ? ord.items
                  : Array.isArray(ord.items)
                  ? ord.items.map(i => {
                      if (typeof i === 'string') return i;
                      if (i && typeof i === 'object') {
                        const name = i.productName || i.name || i.title || 'Product';
                        const qty = i.quantity || i.qty || i.count || '';
                        return qty ? `${name} (${qty})` : name;
                      }
                      return String(i || '');
                    }).filter(Boolean).join(', ')
                  : '';

                return (
                  <tr key={ord.id || idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-3.5 py-2 font-bold text-emerald-600 text-xs">
                      {orderId}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-slate-800">
                      {customerName}
                    </td>
                    <td className="px-3.5 py-2 text-[11px] text-slate-500">
                      {formattedItems || 'N/A'}
                    </td>
                    <td className="px-3.5 py-2 font-bold text-slate-800">
                      ₹{typeof orderAmount === 'number' ? orderAmount.toLocaleString() : orderAmount}
                    </td>
                    <td className="px-3.5 py-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        {orderStatus}
                      </span>
                    </td>
                    <td className="px-3.5 py-2 text-right text-[11px] text-slate-400 font-medium">
                      {orderTime}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;
