import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  LogOut, 
  Menu,
  X,
  Leaf,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Bell,
  CreditCard,
  Truck,
  Settings,
  Box,
  ShoppingCart,
  Users,
  ShoppingBag,
  Layers,
  Tags,
  Ticket,
  Image as ImageIcon,
  MessageSquare,
  BarChart2,
  AlertCircle,
  Shield,
  UserCheck,
  Package
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/layout/NotificationBell';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, end: true },
    { 
      name: 'Products', 
      icon: Box,
      isExpanded: true,
      subItems: [
        { name: 'All My Products', path: '/dashboard/products' },
        { name: 'Add New Product', path: '/dashboard/products/new' }
      ]
    },
    { name: 'My Orders', path: '/dashboard/orders', icon: ShoppingCart },
    { name: 'Deliveries', path: '/dashboard/delivery', icon: Truck },
    { name: 'Earnings & Payments', path: '/dashboard/payments', icon: CreditCard },
    { name: 'Farm Inventory', path: '/dashboard/inventory', icon: ShoppingBag },
    { name: 'Offers & Coupons', path: '/dashboard/coupons', icon: Ticket },
    { name: 'Customer Reviews', path: '/dashboard/reviews', icon: MessageSquare },
    { name: 'Notifications', path: '/dashboard/notifications', icon: Bell },
    { name: 'Support & Help', path: '/dashboard/support', icon: HelpCircle },
    { name: 'Farm Profile', path: '/dashboard/profile', icon: User },
    { name: 'Bank Details', path: '/dashboard/bank-details', icon: CreditCard },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-left">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-[225px] bg-slate-900 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-0 -left-[225px] md:left-0'
      }`}>
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center px-4 h-[56px] bg-white border-r border-b border-slate-200">
            <Link to="/" className="flex items-center space-x-2 text-emerald-600 font-bold text-lg select-none">
              <div className="p-1.5">
                <Leaf className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-black text-slate-800 text-[17px] tracking-tight">
                  FarmToHome
                </span>
                <span className="text-[11px] text-slate-500 font-bold tracking-wide">
                  Farmer Workspace
                </span>
              </div>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-1.5 ml-auto text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-2.5 py-3 space-y-0.5 overflow-y-auto bg-slate-900 scrollbar-none">
            {navItems.map((item) => (
              <div key={item.name}>
                {item.subItems ? (
                  <div className="mb-1">
                    <button className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold text-white/90 hover:bg-white/10 transition-colors">
                      <div className="flex items-center space-x-2.5">
                        <item.icon className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{item.name}</span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                    <div className="mt-0.5 pl-4 pr-1 space-y-0.5">
                      {item.subItems.map(sub => (
                        <NavLink
                          key={sub.name}
                          to={sub.path}
                          onClick={() => setIsSidebarOpen(false)}
                          className={({ isActive }) => `block px-3 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all duration-200
                            ${isActive || sub.highlight
                              ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30' 
                              : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                        >
                          {sub.name}
                        </NavLink>
                      ))}
                    </div>
                  </div>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.end}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) => `flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200
                      ${isActive 
                        ? 'bg-white/10 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.name !== 'Reviews' && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    )}
                  </NavLink>
                )}
              </div>
            ))}
          </nav>

          {/* User Info / Logout Button */}
          <div className="p-2.5 border-t border-white/10 bg-slate-900">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Navbar */}
        <header className="h-[56px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex-1 flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 mr-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <h3 className="text-sm font-semibold text-slate-600">Farmer Workspace</h3>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            {/* Status Indicator Badge */}
            <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide
              ${user?.status === 'approved' 
                ? 'bg-emerald-50 text-emerald-600' 
                : user?.status === 'rejected'
                ? 'bg-red-50 text-red-600'
                : 'bg-amber-50 text-amber-600'
              }
            `}>
              {user?.status === 'approved' ? 'Approved' : user?.status === 'rejected' ? 'Rejected' : 'Awaiting Approval'}
            </div>

            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">2</span>
            </button>
            
            <div className="flex items-center space-x-2 border-l border-slate-200 pl-5">
              <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden">
                <span className="text-emerald-700 font-bold text-xs uppercase">{user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}</span>
              </div>
              <div className="hidden md:flex flex-col cursor-pointer">
                <span className="text-[13px] font-bold text-slate-700">{user?.firstName} {user?.lastName}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase">{user?.role}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 hidden md:block" />
            </div>
          </div>
        </header>

        {/* Status Notification Alerts */}
        {user?.status === 'pending' && (
          <div className="bg-amber-50 border-b border-amber-100 px-6 py-2.5 flex items-center space-x-2 text-amber-800 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Your registration request is currently under review by our audit team. Some actions may be limited until verified.
            </span>
          </div>
        )}

        {/* Dynamic page contents rendering */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F8FAFC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
