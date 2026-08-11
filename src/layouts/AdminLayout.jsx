import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  User,
  Clock, 
  ShieldCheck, 
  LogOut, 
  Menu, 
  X, 
  Leaf, 
  Search,
  ShoppingBag,
  ShoppingCart,
  Box,
  Layers,
  Tags,
  Image as ImageIcon,
  MessageSquare,
  BarChart2,
  Settings,
  ChevronRight,
  ChevronDown,
  Bell,
  SlidersHorizontal,
  CreditCard,
  Truck,
  UserCheck,
  Package,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationBell from '../components/layout/NotificationBell';

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDisplayName = () => {
    if (user?.firstName && user?.lastName) return `${user.firstName} ${user.lastName}`;
    if (user?.firstName) return user.firstName;
    if (user?.name) return user.name;
    return 'System Admin';
  };

  const getInitials = () => {
    const fn = user?.firstName || '';
    const ln = user?.lastName || '';
    if (fn && ln) return `${fn[0]}${ln[0]}`.toUpperCase();
    if (fn) return fn.slice(0, 2).toUpperCase();
    if (user?.name) {
      const parts = user.name.split(/\s+/);
      if (parts.length > 1) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return user.name.slice(0, 2).toUpperCase();
    }
    return 'SA';
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: Home, end: true },
    { name: 'Farmer Management', path: '/admin/farmers', icon: UserCheck },
    { name: 'Customer Management', path: '/admin/customers', icon: Users },
    { 
      name: 'Products & Catalog', 
      icon: Box,
      isExpanded: true,
      subItems: [
        { name: 'All Products', path: '/admin/products' },
        { name: 'Add Product', path: '/admin/products/new' },
        { name: 'Category Management', path: '/admin/manage-categories' }
      ]
    },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Delivery Overview', path: '/admin/deliveries', icon: Truck },
    { name: 'Payments & Payouts', path: '/admin/payments', icon: CreditCard },
    { name: 'Stock & Inventory', path: '/admin/inventory', icon: ShoppingBag },
    { name: 'Offers & Coupons', path: '/admin/coupons', icon: Tags },
    { name: 'Banners & Marketing', path: '/admin/banners', icon: ImageIcon },
    { name: 'Customer Reviews', path: '/admin/reviews', icon: MessageSquare },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart2 },
    { name: 'Support & Help', path: '/admin/support', icon: HelpCircle },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
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
                  Admin Panel
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
        {/* Top Header */}
        <header className="h-[56px] bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 z-20 shrink-0">
          <div className="flex-1 flex items-center">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 mr-3 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative w-96 max-w-full hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search products, orders, customers..." 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[13px] outline-none focus:bg-white focus:border-emerald-500 transition-all font-medium text-slate-600"
              />
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-bold">5</span>
            </button>
            
            {/* Header Profile & Dropdown */}
            <div className="relative border-l border-slate-200 pl-4">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer outline-none active:scale-95"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                  {getInitials()}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-extrabold text-slate-800 leading-tight">
                    {getDisplayName()}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold tracking-wider uppercase">
                    {(user?.role || 'ADMIN').toUpperCase()}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu Card */}
              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)} 
                  />
                  <div className="absolute right-0 top-12 z-50 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-2 space-y-1 animate-in fade-in zoom-in-95 text-left">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center space-x-3 mb-1">
                      <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-extrabold flex items-center justify-center text-xs shrink-0">
                        {getInitials()}
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="text-xs font-extrabold text-slate-800 truncate">
                          {getDisplayName()}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@farmtohome.com'}</p>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase">
                          {(user?.role || 'ADMIN').toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/settings');
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      <span>My Profile</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        navigate('/admin/settings');
                      }}
                      className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>Admin Settings</span>
                    </button>

                    <div className="border-t border-slate-100 my-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-500" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic page contents rendering */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
