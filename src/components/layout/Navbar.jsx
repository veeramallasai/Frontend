import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Leaf, LogOut, LayoutDashboard, Search, MapPin, ShoppingCart, ShoppingBag, Percent, History, User, Bell, ChevronRight, Heart, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCustomer } from '../../context/CustomerContext';
import Button from '../common/Button';
import NotificationBell from './NotificationBell';
import LocationModal from '../common/LocationModal';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  
  const { isAuthenticated, user, login, logout } = useAuth();
  const { cart = [] } = useCustomer();
  const location = useLocation();
  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Track scroll depth to adjust background opacity/blur
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/customer?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleAdminPanelClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const userRole = String(user?.role || '').toLowerCase();
    if (isAuthenticated && userRole === 'admin') {
      navigate('/admin');
    } else {
      navigate('/login', { state: { roleHint: 'admin' } });
    }
  };

  const handleFarmerPanelClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const userRole = String(user?.role || '').toLowerCase();
    if (isAuthenticated && userRole === 'farmer') {
      navigate('/dashboard');
    } else {
      navigate('/login', { state: { roleHint: 'farmer' } });
    }
  };

  const handleCustomerPanelClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    navigate('/customer');
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200'
          : 'bg-white border-b border-slate-100'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          
          {/* Logo & Location */}
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            <Link to="/" className="flex items-center space-x-1.5 text-primary font-bold text-lg sm:text-xl select-none">
              <div className="bg-[#ecfdf5] p-1.5 rounded-[12px]">
                <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
              </div>
              <span className="font-extrabold text-slate-800 tracking-tight leading-none">
                Farm2Home
              </span>
            </Link>

            <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex flex-col items-start hover:bg-slate-50 p-1.5 rounded-[12px] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-700" fill="currentColor" />
                <span className="text-xs font-bold text-slate-900">Location</span>
                <ChevronRight className="w-3 h-3 text-slate-500 rotate-90" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium ml-4 truncate max-w-[140px]">Hyderabad, Telangana, 500090, ...</span>
            </button>
          </div>

          {/* Desktop Search Bar (40px Height) */}
          <div className="hidden md:block flex-1 max-w-xl mx-2 lg:mx-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for 'Fruits', 'Dairy', 'Snacks'..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[40px] bg-[#f4f5f6] hover:bg-[#f0f2f4] text-slate-800 text-xs font-semibold rounded-[12px] py-1.5 pl-10 pr-4 focus:outline-none focus:bg-white focus:ring-1 focus:ring-slate-300 transition-all border-none"
              />
            </form>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
            
            {/* Action Icons */}
            <div className="hidden sm:flex items-center space-x-1.5 mr-1">
              <Link to="/customer" className="p-1.5 rounded-[12px] text-slate-600 hover:bg-slate-100 transition-colors" title="Offers">
                <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white">
                  <Percent className="w-3.5 h-3.5" />
                </div>
              </Link>
              <Link to="/customer/profile" state={{tab: 'wishlist'}} className="p-1.5 rounded-[12px] text-slate-600 hover:bg-slate-100 transition-colors" title="Wishlist">
                <Heart className="w-5 h-5" />
              </Link>
              <Link to="/customer/profile" state={{tab: 'orders'}} className="p-1.5 rounded-[12px] text-slate-600 hover:bg-slate-100 transition-colors" title="Order History">
                <History className="w-5 h-5" />
              </Link>
              <Link to="/cart" className="p-1.5 rounded-[12px] text-slate-600 hover:bg-slate-100 transition-colors relative" title="Cart">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>

            {/* Separate Panel Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              {/* Customer Panel */}
              <button
                onClick={handleCustomerPanelClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  location.pathname.startsWith('/customer')
                    ? 'bg-emerald-600 text-white font-extrabold'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
                title="Open Customer Panel"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Customer Panel</span>
              </button>

              {/* Farmer Panel */}
              <button
                onClick={handleFarmerPanelClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/farmer')
                    ? 'bg-amber-600 text-white font-extrabold'
                    : 'bg-emerald-50/80 text-emerald-900 hover:bg-emerald-100/90 border border-emerald-200'
                }`}
                title="Open Farmer Panel"
              >
                <Leaf className="w-3.5 h-3.5 text-emerald-700" />
                <span>Farmer Panel</span>
              </button>

              {/* Admin Panel */}
              <button
                onClick={handleAdminPanelClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[12px] text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  location.pathname.startsWith('/admin')
                    ? 'bg-slate-900 text-emerald-400 font-extrabold border border-slate-700'
                    : 'bg-slate-900/90 hover:bg-slate-900 text-slate-100 border border-slate-700'
                }`}
                title="Open Admin Panel"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Admin Panel</span>
              </button>
            </div>

            {isAuthenticated ? (
              <Link 
                to={user.role === 'admin' ? '/admin' : (user.role === 'farmer' ? '/dashboard' : '/customer/profile')}
                className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white hover:bg-slate-700 transition-colors"
                title={user.role === 'admin' ? 'Admin Panel' : 'Profile'}
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <Link to="/login" className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-white hover:bg-slate-700 transition-colors shadow-sm" title="Sign In">
                <User className="w-4 h-4" />
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors focus:outline-none ml-1"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Only visible on small screens - 40px height) */}
        <div className="md:hidden mt-2 mb-1">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search fruits, dairy, snacks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[40px] bg-[#f4f5f6] text-slate-800 text-xs font-semibold rounded-[12px] py-1.5 pl-9 pr-3 focus:outline-none focus:bg-white border-none"
            />
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg px-4 py-4 space-y-2 max-h-[80vh] overflow-y-auto">
          {/* Location for mobile */}
          <div className="bg-slate-50 p-3 rounded-xl mb-4 flex items-start gap-2">
            <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-slate-800">Delivery to</p>
              <p className="text-sm font-medium text-slate-500">Bengaluru, Karnataka 560001</p>
            </div>
          </div>

          <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">Home</Link>
          <Link to="/customer" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50">All Categories</Link>
          <div className="flex flex-col gap-2 my-1">
            <button 
              onClick={handleCustomerPanelClick} 
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 w-full cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>Customer Panel</span>
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-500" />
            </button>

            <button 
              onClick={handleFarmerPanelClick} 
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-emerald-900 bg-emerald-50/80 hover:bg-emerald-100/90 border border-emerald-200 w-full cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-600" />
                <span>Farmer Panel</span>
              </span>
              <ChevronRight className="w-4 h-4 text-emerald-500" />
            </button>

            <button 
              onClick={handleAdminPanelClick} 
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-100 bg-slate-900 hover:bg-slate-800 border border-slate-700 w-full cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Admin Panel</span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
          
          <div className="h-px bg-slate-100 my-2" />
          
          {isAuthenticated ? (
            <div className="space-y-1">
              <p className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Account</p>
              <Link
                to={user.role === 'admin' ? '/admin' : (user.role === 'farmer' ? '/dashboard' : '/customer/profile')}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                <LayoutDashboard className="w-5 h-5 text-slate-400" />
                <span>My Dashboard</span>
              </Link>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center font-bold text-slate-700 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center font-bold text-white bg-primary py-3 rounded-xl hover:bg-primary-dark text-sm shadow-sm"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Location Mapping Modal */}
      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        initialStep="map"
      />
    </nav>
  );
};

export default Navbar;


