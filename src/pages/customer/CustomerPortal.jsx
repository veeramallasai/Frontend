import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Heart, ShoppingCart, Package, MapPin, CreditCard, ArrowRight, 
  ChevronRight, Tag, User, Bookmark, Wallet, BookOpen, BadgePercent, Percent, 
  Contact, HelpCircle, Edit2, Filter, LogOut
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import Cart from './Cart';
import MyOrders from './MyOrders';

const CustomerPortal = () => {
  const {
    products = [],
    cart = [],
    wishlist = [],
    addresses = [],
    orders = [],
    selectedAddressId,
    addToCart,
    updateCartItem,
    toggleWishlist,
    addAddress,
    setDefaultAddress,
    placeOrder,
    advanceOrderStatus,
    cancelOrder,
    setSelectedAddressId,
  } = useCustomer();
  
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const [activeTab, setActiveTab] = useState(location.state?.tab || 'profile_home');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [addressForm, setAddressForm] = useState({ title: '', name: '', line1: '', city: '', state: '', pincode: '', phone: '' });
  const [orderFilter, setOrderFilter] = useState('all');

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const mrpTotal = useMemo(() => Math.round(cartTotal * 1.2), [cartTotal]);
  const discount = mrpTotal - cartTotal;
  const wishlistProducts = useMemo(() => products.filter((product) => wishlist.includes(product.id)), [products, wishlist]);

  const filteredOrders = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    const now = Date.now();
    const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
    const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

    return orders.filter((order) => {
      const orderDate = new Date(order.createdAt || Date.now()).getTime();
      const statusLower = String(order.status || '').toLowerCase();

      if (orderFilter === 'quick') {
        return statusLower.includes('placed') || statusLower.includes('processing') || statusLower.includes('accepted');
      }
      if (orderFilter === '7days') {
        return Number.isNaN(orderDate) || (now - orderDate <= SEVEN_DAYS);
      }
      if (orderFilter === '30days') {
        return Number.isNaN(orderDate) || (now - orderDate <= THIRTY_DAYS);
      }
      return true;
    });
  }, [orders, orderFilter]);

  const handleAddressSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const data = {
      title: form.title.value || addressForm.title,
      name: form.name.value || addressForm.name,
      line1: form.line1.value || addressForm.line1,
      city: form.city.value || addressForm.city,
      state: form.state.value || addressForm.state,
      pincode: form.pincode.value || addressForm.pincode,
      phone: form.phone.value || addressForm.phone,
    };
    addAddress(data);
    setAddressForm({ title: '', name: '', line1: '', city: '', state: '', pincode: '', phone: '' });
  };

  const getUserDisplayName = (usr) => {
    if (!usr) return 'Customer';
    const fullName = [usr.firstName, usr.lastName].filter(Boolean).join(' ').trim();
    if (fullName) return fullName;
    if (usr.name) return usr.name;
    if (usr.email) return usr.email.split('@')[0];
    return 'Customer';
  };

  const getInitials = (usr) => {
    if (!usr) return 'U';
    const displayName = getUserDisplayName(usr);
    const nameParts = displayName.split(/\s+/).filter(Boolean);
    const first = nameParts[0] || displayName || 'U';
    const last = nameParts[1] || '';
    if (first && last) {
      return (first.charAt(0) + last.charAt(0)).toUpperCase();
    }
    return first.charAt(0).toUpperCase();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile_home':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">My Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Orders Card */}
              <div 
                onClick={() => setActiveTab('orders')} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 mb-4">
                  <Package className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Orders</h3>
                <p className="text-sm text-slate-500">Track, returns and buy again</p>
              </div>

              {/* Wishlist Card */}
              <div 
                onClick={() => setActiveTab('wishlist')} 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 mb-4">
                  <Heart className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Wishlist</h3>
                <p className="text-sm text-slate-500">Order or edit from list</p>
              </div>

              {/* Coupons Card */}
              <div 
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 mb-4">
                  <Percent className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Coupons</h3>
                <p className="text-sm text-slate-500">View available discounts</p>
              </div>

              {/* Personal Info Card */}
              <div 
                onClick={() => setActiveTab('personal_info')}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 mb-4">
                  <Contact className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Personal Info</h3>
                <p className="text-sm text-slate-500">Manage account details</p>
              </div>

              {/* Help Card */}
              <div 
                onClick={() => setActiveTab('help')}
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-700 mb-4">
                  <HelpCircle className="w-5 h-5 fill-current" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Help</h3>
                <p className="text-sm text-slate-500">Contact our support</p>
              </div>

              {/* Logout Card */}
              <div 
                onClick={handleLogout}
                className="bg-rose-50/80 rounded-2xl p-6 shadow-sm border border-rose-200/80 hover:bg-rose-100/80 cursor-pointer transition-all group"
              >
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-700 mb-4 group-hover:scale-110 transition-transform">
                  <LogOut className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-black text-rose-700 mb-1">Logout</h3>
                <p className="text-sm text-rose-500 font-medium">Sign out of your account</p>
              </div>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="bg-[#f4f5f6] rounded-2xl min-h-[600px]">
            {/* Breadcrumb & Header */}
            <div className="mb-6 px-2">
              <div className="flex gap-2 text-xs font-semibold text-sky-600 mb-4">
                <span onClick={() => setActiveTab('profile_home')} className="cursor-pointer hover:underline">Home</span>
                <span className="text-slate-400">&gt;</span>
                <span onClick={() => setActiveTab('profile_home')} className="cursor-pointer hover:underline">My Profile</span>
                <span className="text-slate-400">&gt;</span>
                <span className="text-slate-600">Need Help</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('profile_home')} className="hover:bg-slate-200 p-1.5 rounded-full transition-colors">
                  <ArrowRight className="w-6 h-6 text-slate-600 rotate-180" />
                </button>
                <h1 className="text-3xl font-extrabold text-slate-700">Need Help</h1>
              </div>
            </div>

            <div className="mb-8 px-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-extrabold text-slate-700">My service requests</h3>
                <button className="text-sm font-bold text-sky-600 hover:underline">View all</button>
              </div>
              <p className="text-xs text-slate-500 font-semibold">No service requests found.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Help with recent orders Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-slate-700">Help with recent orders?</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-sm font-bold text-sky-600 hover:underline">View all</button>
                </div>
                
                <div className="space-y-4">
                  {orders.slice(0, 4).map((order, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                          {order.items && order.items[0] && order.items[0].image ? (
                            <img src={order.items[0].image} alt="product" className="w-full h-full object-contain mix-blend-multiply p-1" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-600 capitalize">{String(order.status || 'Processing').toLowerCase()} . {String(order.createdAt || '').split(',')[0]}</p>
                          <p className="text-xs font-semibold text-slate-500 mt-0.5">{order.items ? order.items.length : 1} items</p>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-slate-200">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <p className="text-sm text-slate-500 font-medium">No recent orders to show.</p>
                  )}
                </div>
              </div>

              {/* Quick Links Card */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-extrabold text-slate-700">Here are some quick links</h3>
                  <button className="text-sm font-bold text-sky-600 hover:underline">View all</button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div onClick={() => setActiveTab('orders')} className="bg-[#f4f5f6] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Package className="w-5 h-5" />
                      <span className="text-sm font-semibold">My Orders</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </div>
                  
                  <div onClick={() => setActiveTab('wishlist')} className="bg-[#f4f5f6] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Bookmark className="w-5 h-5" />
                      <span className="text-sm font-semibold">Wishlist</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </div>
                  
                  <div className="bg-[#f4f5f6] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Percent className="w-5 h-5" />
                      <span className="text-sm font-semibold">Offers</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </div>
                  
                  <div className="bg-[#f4f5f6] p-4 rounded-xl flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors">
                    <div className="flex items-center gap-3 text-slate-600">
                      <Wallet className="w-5 h-5" />
                      <span className="text-sm font-semibold">Farm2Home Wallet</span>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'personal_info':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800 hidden lg:block">Personal Info</h2>
            
            {/* Basic Details Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-xl font-extrabold text-slate-800 mb-1">Basic Details</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">View and manage your basic profile details</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-0.5">Full Name</p>
                      <p className="text-sm font-extrabold text-slate-800">{user?.name || 'Sai bro Sai v'}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-sky-600" />
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Date of Birth</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-sky-600" />
                </div>
                
                <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-4 px-4 py-2 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="4"></circle><path d="M12 14v7"></path><path d="M9 18h6"></path></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">Gender</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-sky-600" />
                </div>
              </div>
            </div>

            {/* Contact Details Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
              <h3 className="text-xl font-extrabold text-slate-800 mb-1">Contact Details</h3>
              <p className="text-sm text-slate-500 font-medium mb-6">View and manage your contact information</p>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 cursor-pointer hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-0.5">Mobile</p>
                      <p className="text-sm font-extrabold text-slate-800">83****4537</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-sky-600" />
                </div>
                
                <div className="flex items-center justify-between cursor-pointer hover:bg-slate-50 -mx-4 px-4 py-2 rounded-xl transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 group-hover:bg-white group-hover:shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-600 mb-0.5">Email</p>
                      <p className="text-sm font-extrabold text-slate-800">8********7@nomail.jiomart.com</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-sky-600" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mt-6">
              <button
                onClick={handleLogout}
                className="w-full h-12 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <LogOut className="w-5 h-5" />
                Logout from Account
              </button>
            </div>
            
          </div>
        );

      case 'orders':
        return <MyOrders />;

      case 'wishlist':
        return (
          <div className="bg-white p-6 rounded-2xl min-h-[600px] border border-slate-100 shadow-sm">
            {/* Breadcrumb & Header */}
            <div className="mb-6">
              <div className="flex gap-2 text-xs font-semibold text-sky-600 mb-4">
                <span onClick={() => setActiveTab('profile_home')} className="cursor-pointer hover:underline">Home</span>
                <span className="text-slate-400">&gt;</span>
                <span onClick={() => setActiveTab('profile_home')} className="cursor-pointer hover:underline">My Account</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setActiveTab('profile_home')} className="hover:bg-slate-100 p-1.5 rounded-full transition-colors">
                  <ArrowRight className="w-6 h-6 text-slate-600 rotate-180" />
                </button>
                <h1 className="text-3xl font-extrabold text-slate-700">Wishlist</h1>
              </div>
            </div>

            {wishlistProducts.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {wishlistProducts.map((product) => (
                  <Card key={product.id} className="bg-white flex flex-col justify-between shadow-sm border border-slate-100">
                    <div>
                      <div className="flex h-32 items-center justify-center mb-4 bg-slate-50 rounded-lg overflow-hidden">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-contain mix-blend-multiply" />
                        ) : (
                          <div className="text-4xl">🥬</div>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-800">{product.name}</h3>
                      <p className="text-sm font-bold text-slate-800 mt-1">₹{product.price} / {product.unit}</p>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => toggleWishlist(product.id)}>Remove</Button>
                      <Button size="sm" variant="gradient" className="flex-1" onClick={() => addToCart(product)}>Add to cart</Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="relative w-40 h-40 mb-6 bg-sky-50 rounded-full flex items-center justify-center">
                  {/* Mockup for the phone/heart illustration */}
                  <div className="relative">
                    <div className="w-16 h-28 bg-slate-800 rounded-2xl flex flex-col items-center justify-center border-4 border-slate-700 shadow-xl relative z-10">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-4 h-4 text-sky-500" />
                      </div>
                      <div className="absolute -bottom-2 -right-3 w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-20">
                        <Heart className="w-4 h-4 text-white fill-current" />
                      </div>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-slate-800 mb-2">No Products Available</h3>
                <p className="text-sm text-slate-500 font-medium max-w-xs leading-relaxed">
                  Looks like you haven't added any products to your wishlist yet.
                </p>
              </div>
            )}
          </div>
        );

      case 'addresses':
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Delivery Address</h2>
            <Card className="bg-white shadow-sm border border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Add a delivery address</h3>
              <form onSubmit={handleAddressSubmit} className="mt-4 grid gap-3 md:grid-cols-2">
                <Input name="title" label="Title" value={addressForm.title} onChange={(event) => setAddressForm({ ...addressForm, title: event.target.value })} placeholder="Home" />
                <Input name="name" label="Name" value={addressForm.name} onChange={(event) => setAddressForm({ ...addressForm, name: event.target.value })} placeholder="Customer name" />
                <Input name="line1" label="Street / House" className="md:col-span-2" value={addressForm.line1} onChange={(event) => setAddressForm({ ...addressForm, line1: event.target.value })} placeholder="12, Green Park" />
                <Input name="city" label="City" value={addressForm.city} onChange={(event) => setAddressForm({ ...addressForm, city: event.target.value })} placeholder="Bengaluru" />
                <Input name="state" label="State" value={addressForm.state} onChange={(event) => setAddressForm({ ...addressForm, state: event.target.value })} placeholder="Karnataka" />
                <Input name="pincode" label="Pincode" value={addressForm.pincode} onChange={(event) => setAddressForm({ ...addressForm, pincode: event.target.value })} placeholder="560001" />
                <Input name="phone" label="Phone" value={addressForm.phone} onChange={(event) => setAddressForm({ ...addressForm, phone: event.target.value })} placeholder="9876543210" />
                <div className="md:col-span-2">
                  <Button type="submit" variant="gradient">Save address</Button>
                </div>
              </form>
            </Card>
            <div className="grid gap-3">
              {addresses.map((address) => (
                <Card key={address.id} className="bg-white shadow-sm border border-slate-100">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-800">{address.title}</h4>
                        {address.isDefault && <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Default</span>}
                      </div>
                      <p className="mt-2 text-sm text-slate-500">{address.name}</p>
                      <p className="text-sm text-slate-500">{address.line1}, {address.city}, {address.state} - {address.pincode}</p>
                      <p className="text-sm text-slate-500">{address.phone}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" variant={selectedAddressId === address.id ? 'primary' : 'outline'} onClick={() => setSelectedAddressId(address.id)}>{selectedAddressId === address.id ? 'Selected' : 'Select'}</Button>
                      {!address.isDefault && <Button size="sm" variant="outline" onClick={() => setDefaultAddress(address.id)}>Set default</Button>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'wallet':
        return (
          <div className="bg-transparent h-full min-h-[600px] flex flex-col gap-6">
            <h2 className="text-[28px] font-extrabold text-slate-700">Farm2Home Wallet</h2>
            
            <div className="bg-white rounded-[24px] p-8 shadow-sm flex flex-col items-center border border-slate-100 flex-1 relative overflow-hidden">
              
              {/* Wallet Layered Graphic */}
              <div className="relative w-full max-w-[400px] h-[300px] mt-8 mb-4">
                
                {/* Top Card (Gold) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[120px] bg-gradient-to-r from-amber-200 to-amber-300 rounded-t-2xl shadow-sm px-5 py-4 z-10 flex justify-between">
                  <span className="text-[11px] font-bold text-slate-800">Farm2Home Wallet</span>
                  <span className="text-[14px] font-extrabold text-slate-800">₹0.00</span>
                </div>

                {/* Middle Card (Light Blue) */}
                <div className="absolute top-[40px] left-1/2 -translate-x-1/2 w-[85%] h-[120px] bg-gradient-to-r from-sky-200 to-sky-300 rounded-t-2xl shadow-sm px-5 py-4 z-20 flex justify-between">
                  <span className="text-[11px] font-bold text-slate-800">Farm2Home Gift Card</span>
                  <span className="text-[14px] font-extrabold text-slate-800">₹0.00</span>
                </div>

                {/* Main Wallet Pocket (Dark Blue) */}
                <div className="absolute top-[80px] left-1/2 -translate-x-1/2 w-[90%] h-[160px] bg-[#003c5a] rounded-2xl shadow-lg z-30 flex flex-col items-center justify-center relative overflow-hidden">
                  
                  {/* Stitched border effect */}
                  <div className="absolute inset-[3px] border border-dashed border-sky-800/40 rounded-xl pointer-events-none"></div>
                  
                  <div className="flex flex-col items-center justify-center mt-4">
                    <span className="text-3xl font-extrabold text-white mb-1">₹0.00</span>
                    <span className="text-[11px] font-semibold text-sky-100">Total Wallet balance</span>
                  </div>
                </div>
              </div>

              <p className="text-[13px] font-medium text-slate-500 mb-8 mt-4 text-center">
                Farm2Home Wallet can be used for only select products. 
                <span className="text-[#0070a6] font-bold hover:underline cursor-pointer"> T&C Apply</span>
              </p>

              {/* FAQs accordion */}
              <div className="w-full border border-slate-100 rounded-xl flex items-center justify-between p-4 hover:bg-slate-50 cursor-pointer transition-colors mt-auto">
                <span className="text-[14px] font-extrabold text-slate-800">Read FAQs</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>

            </div>
          </div>
        );

      case 'cart':
        return <Cart />;
        
      default:
        return <div>Content not found</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f5f6] py-8">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar Layout */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
            
            {/* User Info Header Box */}
            <div className="bg-[#eaf4fb] rounded-2xl p-6 flex flex-col items-center text-center shadow-sm relative overflow-hidden h-44 justify-center">
              <div className="w-16 h-16 bg-sky-200 text-sky-800 rounded-full flex items-center justify-center text-2xl font-black mb-3 shadow-inner">
                {getInitials(user)}
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 capitalize">
                {getUserDisplayName(user)}
              </h2>
              <button 
                onClick={() => setActiveTab('profile_home')}
                className="absolute right-4 top-4 w-7 h-7 bg-sky-500 rounded-full flex items-center justify-center text-white shadow-sm hover:bg-sky-600 transition-colors"
                title="Edit Profile"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sidebar Navigation */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <nav className="space-y-1">
                <button 
                  onClick={() => setActiveTab('profile_home')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'profile_home' ? 'bg-[#eaf4fb] text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <User className="w-5 h-5 opacity-70" />
                  My Profile
                </button>
                
                <button 
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'orders' ? 'bg-[#eaf4fb] text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Package className="w-5 h-5 opacity-70" />
                  My Orders
                </button>

                <button 
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'wishlist' ? 'bg-[#eaf4fb] text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Bookmark className="w-5 h-5 opacity-70" />
                  My Wishlist
                </button>
                
                <button 
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex flex-col items-start px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'addresses' ? 'bg-[#eaf4fb] text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4 w-full">
                    <MapPin className="w-5 h-5 opacity-70" />
                    <div className="flex flex-col items-start">
                      <span>Delivery Addresses</span>
                      <span className="text-[10px] text-slate-400 font-medium">{addresses.length} saved address{addresses.length !== 1 ? 'es' : ''}</span>
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => setActiveTab('wallet')}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'wallet' ? 'bg-[#eaf4fb] text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-4">
                    <Wallet className="w-5 h-5 opacity-70" />
                    Farm2Home Wallet
                  </div>
                  <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">₹0.00</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('personal_info')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'personal_info' ? 'bg-[#eaf4fb] text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <Contact className="w-5 h-5 opacity-70" />
                  Personal Information
                </button>
              </nav>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-1">
                <h4 className="px-4 text-xs font-bold text-slate-800 mb-2">Help & Support</h4>
                <button 
                  onClick={() => setActiveTab('help')}
                  className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeTab === 'help' ? 'bg-[#eaf4fb] text-slate-800' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  <HelpCircle className="w-5 h-5 opacity-70" />
                  Need Help?
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-5 h-5 opacity-80 text-rose-600" />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full max-w-full">
            {renderContent()}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;

