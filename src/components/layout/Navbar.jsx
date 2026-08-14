import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Leaf, LogOut, LayoutDashboard, Search, MapPin, 
  ShoppingCart, ShoppingBag, Percent, History, User, ChevronRight, 
  Heart, Truck, Mic, MicOff, ChevronDown, CheckCircle2 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCustomer } from '../../context/CustomerContext';
import LocationModal from '../common/LocationModal';
import toast from 'react-hot-toast';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [savedLocation, setSavedLocation] = useState('Hyderabad, Telangana 500090');

  const { isAuthenticated, user, logout } = useAuth();
  const { cart = [] } = useCustomer();
  const location = useLocation();
  const navigate = useNavigate();
  const profileMenuRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Load active address / location from localStorage if available
  useEffect(() => {
    try {
      const activeAddr = localStorage.getItem('activeDeliveryAddress');
      if (activeAddr) {
        const parsed = JSON.parse(activeAddr);
        setSavedLocation(`${parsed.city || parsed.landmark || 'Hyderabad'}, ${parsed.pincode || '500090'}`);
      }
    } catch (e) {
      // Ignore fallback
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsProfileMenuOpen(false);
    logout();
    toast.success('Signed out successfully');
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    if (searchQuery.trim()) {
      navigate(`/customer?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Voice Search Handler (SpeechRecognition API)
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in your browser. Try typing your search query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening for voice search...', { icon: '🎙️' });
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
        toast.success(`Searching for: "${transcript}"`);
        navigate(`/customer?search=${encodeURIComponent(transcript.trim())}`);
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        toast.error('Could not capture audio. Please try again.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      toast.error('Unable to access microphone');
    }
  };

  const handleFarmerPanelClick = (e) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    const userRole = String(user?.role || '').toLowerCase();
    if (isAuthenticated && userRole === 'farmer') {
      navigate('/dashboard');
    } else {
      navigate('/farmer/login');
    }
  };

  const handleCustomerPanelClick = (e) => {
    e?.preventDefault?.();
    setIsMobileMenuOpen(false);
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("accessToken") ||
      sessionStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userRole = String(currentUser?.role || '').toUpperCase();

    if (token && userRole === "CUSTOMER") {
      navigate("/customer/shop");
    } else {
      navigate("/customer/login");
    }
  };

  const handleDeliveryPartnerPanelClick = (e) => {
    e?.preventDefault?.();
    setIsMobileMenuOpen(false);
    const token =
      localStorage.getItem("accessToken") ||
      localStorage.getItem("token") ||
      sessionStorage.getItem("accessToken") ||
      sessionStorage.getItem("token");

    const storedUser =
      localStorage.getItem("user") || sessionStorage.getItem("user");

    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userRole = String(currentUser?.role || '').toUpperCase();
    const faceVerified =
      sessionStorage.getItem('deliveryPartnerFaceVerified') === 'true' ||
      localStorage.getItem('deliveryPartnerFaceVerified') === 'true';

    if (token && (userRole === "DELIVERY_PARTNER" || userRole.includes("DELIVERY"))) {
      if (faceVerified) {
        navigate("/delivery-partner/dashboard");
      } else {
        navigate("/delivery-partner/face-verification");
      }
    } else {
      navigate("/delivery-partner/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-xs border-b border-slate-100 transition-all duration-300">
      {/* Top Banner Announcement */}
      <div className="bg-emerald-800 text-white text-[11px] sm:text-xs py-1 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <span className="bg-amber-400 text-emerald-950 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">Direct Harvest</span>
        <span>🌾 100% Organic & Fresh Farm Produce Delivered to Your Doorstep within 30 Minutes!</span>
      </div>

      <div className="max-w-[1340px] mx-auto px-3 sm:px-5 lg:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 lg:gap-6">
          
          {/* Logo & Delivery Location Picker */}
          <div className="flex items-center gap-3 lg:gap-6 shrink-0">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-sm group-hover:bg-emerald-700 transition-colors">
                <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 text-lg sm:text-xl tracking-tight leading-none group-hover:text-emerald-700 transition-colors">
                  Farm<span className="text-emerald-600">to</span>Home
                </span>
                <span className="text-[10px] text-slate-500 font-semibold tracking-wider uppercase">Direct Freshness</span>
              </div>
            </Link>

            {/* Location Selector Button */}
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden lg:flex items-center gap-2 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl transition-all cursor-pointer group"
              title="Change Delivery Location"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-extrabold text-slate-900 uppercase tracking-wider">Deliver to</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-600" />
                </div>
                <span className="text-xs text-slate-600 font-medium truncate max-w-[140px]">{savedLocation}</span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar with Voice Search */}
          <div className="hidden md:block flex-1 max-w-xl mx-2 lg:mx-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search fresh vegetables, fruits, dairy, organic honey..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-[42px] bg-slate-50 hover:bg-slate-100/80 text-slate-800 text-xs font-semibold rounded-xl py-2 pl-10 pr-10 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 border border-slate-200 transition-all"
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors cursor-pointer ${
                  isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-emerald-600'
                }`}
                title="Voice Search"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </form>
          </div>

          {/* Right Action Icons & Auth User State */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Direct Link Badges */}
            <div className="hidden sm:flex items-center gap-1.5">
              <Link 
                to="/customer/profile" 
                state={{ tab: 'wishlist' }} 
                className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors relative" 
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
              </Link>

              <Link 
                to="/orders" 
                className="p-2 rounded-xl text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 transition-colors" 
                title="My Orders"
              >
                <History className="w-5 h-5" />
              </Link>

              {/* Cart Button */}
              <Link 
                to="/cart" 
                className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl transition-all font-bold text-xs relative group" 
                title="View Shopping Cart"
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 text-emerald-700 group-hover:scale-110 transition-transform" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-bold">Cart</span>
              </Link>
            </div>

            {/* Profile Dropdown or Auth Button */}
            {isAuthenticated ? (
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-2 p-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                  title="My Account"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                    {user?.fullName ? user.fullName.charAt(0) : (user?.name ? user.name.charAt(0) : 'U')}
                  </div>
                  <div className="hidden lg:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[100px]">
                      {user?.fullName || user?.name || 'My Account'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">{user?.role || 'Customer'}</span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user?.fullName || user?.name || 'Account User'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user?.email || 'user@farmtohome.com'}</p>
                    </div>

                    <div className="py-1">
                      <Link 
                        to="/customer/profile" 
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link 
                        to="/orders" 
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <History className="w-4 h-4 text-slate-400" />
                        <span>My Orders</span>
                      </Link>

                      <Link 
                        to="/customer/profile" 
                        state={{ tab: 'wishlist' }}
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>My Wishlist</span>
                      </Link>

                      {user?.role?.toUpperCase() === 'FARMER' && (
                        <Link 
                          to="/dashboard" 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                        >
                          <Leaf className="w-4 h-4 text-amber-600" />
                          <span>Farmer Dashboard</span>
                        </Link>
                      )}

                      {user?.role?.toUpperCase() === 'DELIVERY_PARTNER' && (
                        <Link 
                          to="/delivery-partner/dashboard" 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                        >
                          <Truck className="w-4 h-4 text-emerald-600" />
                          <span>Delivery Dashboard</span>
                        </Link>
                      )}

                      {user?.role?.toUpperCase() === 'ADMIN' && (
                        <Link 
                          to="/admin" 
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-purple-600" />
                          <span>Admin Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-slate-100 pt-1 mt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link 
                  to="/customer/login" 
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                >
                  Sign In
                </Link>
              </div>
            )}

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar with Voice */}
        <div className="md:hidden mt-2.5">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search vegetables, fruits, dairy..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-[40px] bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl py-2 pl-9 pr-9 focus:outline-none focus:bg-white border border-slate-200"
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg ${
                isListening ? 'text-red-500 bg-red-50' : 'text-slate-400'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl px-4 py-4 space-y-3">
          <button 
            onClick={() => {
              setIsMobileMenuOpen(false);
              setIsLocationModalOpen(true);
            }}
            className="w-full bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-2 text-left">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <div>
                <p className="text-[11px] font-extrabold text-emerald-900 uppercase">Deliver to</p>
                <p className="text-xs font-bold text-slate-700">{savedLocation}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 underline">Change</span>
          </button>

          <div className="space-y-1">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">Home</Link>
            <Link to="/customer/shop" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">All Products</Link>
            <Link to="/leafy-vegetables" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">Leafy Vegetables</Link>
            <Link to="/cart" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">Cart ({cartCount})</Link>
            <Link to="/orders" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50">My Orders</Link>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <button onClick={handleCustomerPanelClick} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 text-xs font-bold border border-slate-200">
              <span className="flex items-center gap-2"><ShoppingBag className="w-4 h-4 text-emerald-600" /> Customer Panel</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button onClick={handleFarmerPanelClick} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 text-xs font-bold border border-slate-200">
              <span className="flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-600" /> Farmer Panel</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
            <button onClick={handleDeliveryPartnerPanelClick} className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-800 text-xs font-bold border border-slate-200">
              <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-emerald-600" /> Delivery Partner Panel</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      <LocationModal 
        isOpen={isLocationModalOpen} 
        onClose={() => setIsLocationModalOpen(false)} 
        initialStep="map"
      />
    </header>
  );
};

export default Navbar;
