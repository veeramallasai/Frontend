import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Trash2,
  Bookmark,
  Truck,
  RotateCcw,
  ShieldCheck,
  Leaf,
  Clock,
  CheckCircle2,
  Tag,
  X,
  Search,
  MapPin,
  Menu,
  User,
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import CustomerSidebar from '../../components/layout/CustomerSidebar';
import toast from 'react-hot-toast';
import './Cart.css';

// Image assets
import tomatoImg from '../../assets/images/tomato.png';
import potatoImg from '../../assets/images/potato.png';
import cabbageImg from '../../assets/images/cabbage.png';
import dairy3dSvg from '../../assets/images/categories/dairy-3d.svg';

const DEFAULT_INITIAL_CART = [
  {
    id: 'cart-1',
    name: 'Farm Fresh Tomatoes',
    category: 'Vegetables',
    pack: '500 g',
    price: 28,
    mrp: 35,
    discount: '20% OFF',
    quantity: 2,
    image: tomatoImg,
    inStock: true,
  },
  {
    id: 'cart-2',
    name: 'Farm Fresh Potatoes',
    category: 'Vegetables',
    pack: '1 kg',
    price: 40,
    mrp: 50,
    discount: '20% OFF',
    quantity: 1,
    image: potatoImg,
    inStock: true,
  },
  {
    id: 'cart-3',
    name: 'Broccoli',
    category: 'Vegetables',
    pack: '250 g',
    price: 59,
    mrp: 75,
    discount: '21% OFF',
    quantity: 1,
    image: cabbageImg,
    inStock: true,
  },
  {
    id: 'cart-4',
    name: 'Farm Fresh Milk',
    category: 'Dairy & Eggs',
    pack: '1 L',
    price: 52,
    mrp: 60,
    discount: '13% OFF',
    quantity: 1,
    image: dairy3dSvg,
    inStock: true,
  },
];

const Cart = () => {
  const { cart = [], updateCartItem, removeFromCart, selectedAddressId } = useCustomer();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [localCartItems, setLocalCartItems] = useState(
    cart && cart.length > 0 ? cart : DEFAULT_INITIAL_CART
  );
  const [appliedCoupon, setAppliedCoupon] = useState({ code: 'WELCOME20', discount: 20 });
  const [savedForLater, setSavedForLater] = useState([]);

  // Calculate Subtotals & Discounts
  const activeItems = localCartItems;
  const totalItemsCount = useMemo(
    () => activeItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [activeItems]
  );

  const mrpSubtotal = useMemo(
    () => activeItems.reduce((sum, item) => sum + (item.mrp || item.price * 1.25) * (item.quantity || 1), 0),
    [activeItems]
  );

  const itemsSubtotal = useMemo(
    () => activeItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [activeItems]
  );

  const productDiscount = useMemo(
    () => Math.max(0, Math.round(mrpSubtotal - itemsSubtotal)),
    [mrpSubtotal, itemsSubtotal]
  );

  const couponDiscount = appliedCoupon ? appliedCoupon.discount : 0;
  const deliveryCharge = itemsSubtotal >= 499 ? 0 : 40;
  const taxesAndFees = 10;

  const totalAmount = useMemo(
    () => Math.max(0, itemsSubtotal - couponDiscount + deliveryCharge + taxesAndFees),
    [itemsSubtotal, couponDiscount, deliveryCharge, taxesAndFees]
  );

  const totalSaved = useMemo(
    () => productDiscount + couponDiscount,
    [productDiscount, couponDiscount]
  );

  const handleUpdateQty = (itemId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    setLocalCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQty } : item))
    );
    if (updateCartItem) {
      updateCartItem(itemId, newQty);
    }
  };

  const handleRemoveItem = (itemId) => {
    setLocalCartItems((prev) => prev.filter((item) => item.id !== itemId));
    if (removeFromCart) {
      removeFromCart(itemId);
    }
    toast.success('Item removed from cart');
  };

  const handleSaveForLater = (item) => {
    handleRemoveItem(item.id);
    setSavedForLater((prev) => [...prev, item]);
    toast.success(`${item.name} saved for later!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.success('Coupon removed');
  };

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);
  const userName = currentUser?.fullName?.split(' ')[0] || currentUser?.username || 'Sai';

  return (
    <div className="app-layout">
      {/* Reusable Left Sidebar with Cart item highlighted */}
      <CustomerSidebar
        activeItem="cart"
        onItemClick={(item) => {
          if (item.id === 'shop') navigate('/customer/shop');
          if (item.id === 'dashboard') navigate('/dashboard');
        }}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Cart Content Area */}
      <div className="cart-page">
        {/* Top Header Navbar */}
        <header className="top-header">
          <div className="w-full mx-auto flex items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3 flex-1 max-w-[650px]">
              {/* Mobile Sidebar Hamburger Button */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                aria-label="Open Navigation Sidebar"
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer active:scale-95 shrink-0"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Compact Search Bar */}
              <form onSubmit={(e) => e.preventDefault()} className="relative w-full flex items-center">
                <input
                  type="text"
                  placeholder="Search for fruits, vegetables, groceries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-9.5 pl-3.5 pr-10 text-xs sm:text-sm font-medium rounded-xl border border-slate-200 bg-slate-50/80 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="submit"
                  aria-label="Submit Search"
                  className="absolute right-1.5 h-7 w-7 bg-[#009b5a] hover:bg-[#00874e] text-white rounded-lg flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 sm:gap-6 shrink-0">
              {/* Delivery Location */}
              <div className="hidden lg:flex items-center gap-1.5 text-xs">
                <MapPin className="h-4 w-4 text-[#009b5a]" />
                <div>
                  <span className="text-slate-400 text-[10px] block font-bold leading-tight">Deliver to</span>
                  <span className="font-extrabold text-slate-800">Hyderabad, 500001</span>
                </div>
              </div>

              {/* Wishlist Icon */}
              <Link to="/customer/shop" className="relative text-slate-600 hover:text-emerald-700 transition-colors p-1" title="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>

              {/* Cart Icon with Badge */}
              <Link to="/cart" className="relative text-slate-700 hover:text-emerald-700 transition-colors p-1" title="My Cart">
                <ShoppingCart className="h-5.5 w-5.5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#009b5a] text-white text-[10px] font-black flex items-center justify-center">
                  {totalItemsCount}
                </span>
              </Link>

              {/* User Avatar */}
              <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-700 font-black text-xs">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <div className="hidden sm:block text-xs">
                  <span className="font-bold text-slate-800 block leading-tight">Hi, {userName}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">Customer</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Cart Container */}
        <div className="w-full mx-auto px-3 sm:px-6 py-4 sm:py-6">
          {/* Breadcrumb & Header Title */}
          <div className="mb-4">
            <h1 className="text-2xl sm:text-[30px] font-black tracking-tight text-slate-800 flex items-baseline gap-2">
              My Cart <span className="text-xs sm:text-sm font-extrabold text-slate-400">({totalItemsCount} items)</span>
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mt-1">
              <Link to="/customer/shop" className="hover:text-emerald-700 transition-colors">Home</Link>
              <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
              <span className="text-slate-700">My Cart</span>
            </div>
          </div>

          {/* Cart Grid Layout */}
          <div className="cart-layout">
            {/* Left Column: Delivery Banner + Items List + Trust Badges */}
            <div className="cart-products">
              {/* Free Delivery Banner */}
              <div className="bg-[#f0fdf4] border border-[#c6f0da] rounded-[14px] p-3 sm:p-3.5 flex items-center gap-3 text-xs sm:text-sm font-extrabold text-emerald-900 shadow-2xs">
                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-[#009b5a] text-white flex items-center justify-center shrink-0">
                  <Truck className="h-4 w-4" />
                </div>
                <span>
                  Add items worth <strong className="text-[#009b5a] font-black">₹199</strong> more to get <span className="text-[#009b5a] font-black underline decoration-emerald-400 underline-offset-2">FREE</span> delivery!
                </span>
              </div>

              {/* Cart Items List */}
              {activeItems.length === 0 ? (
                <div className="bg-white rounded-[20px] border border-slate-200 p-10 text-center shadow-xs">
                  <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center text-[#009b5a] mx-auto mb-3">
                    <ShoppingCart className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-1">Your cart is empty</h3>
                  <p className="text-xs text-slate-500 font-semibold mb-4">Explore fresh farm produce and add items to your cart.</p>
                  <Link
                    to="/customer/shop"
                    className="inline-flex items-center gap-2 bg-[#009b5a] hover:bg-[#00874e] text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all"
                  >
                    Start Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {activeItems.map((item) => (
                    <div key={item.id} className="cart-item">
                      {/* Desktop / Tablet Row Arrangement */}
                      <div className="hidden sm:flex items-center justify-between w-full gap-4">
                        {/* Thumbnail & Details */}
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          <div className="cart-product-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <h3 className="text-sm sm:text-base font-extrabold text-slate-800 truncate leading-snug">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-400 font-medium">{item.category}</span>
                              <span className="bg-[#e6f7ef] text-[#009b5a] text-[11px] font-black px-2 py-0.5 rounded-md">
                                {item.pack || '500 g'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                              <span>In Stock</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Discount */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-base sm:text-lg font-black text-[#009b5a]">₹{item.price}</span>
                            {item.mrp && (
                              <span className="text-xs text-slate-400 line-through font-semibold">₹{item.mrp}</span>
                            )}
                          </div>
                          {item.discount && (
                            <span className="bg-emerald-100/80 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                              {item.discount}
                            </span>
                          )}
                        </div>

                        {/* Quantity Stepper & Actions */}
                        <div className="flex items-center gap-3.5 shrink-0">
                          <div className="quantity-control">
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, (item.quantity || 1) - 1)}
                              aria-label="Decrease quantity"
                              className="quantity-btn"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-black text-slate-900">
                              {item.quantity || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQty(item.id, (item.quantity || 1) + 1)}
                              aria-label="Increase quantity"
                              className="quantity-btn"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <span className="text-sm font-black text-slate-800 min-w-[45px] text-right">
                            ₹{item.price * (item.quantity || 1)}
                          </span>

                          <div className="flex items-center gap-1 border-l border-slate-200 pl-2.5">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              title="Remove Item"
                              aria-label="Remove item"
                              className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveForLater(item)}
                              title="Save for later"
                              className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            >
                              <Bookmark className="h-3.5 w-3.5" />
                              <span className="hidden lg:inline">Save for later</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Mobile 3-Row Arrangement (< 768px) */}
                      <div className="flex sm:hidden flex-col w-full gap-2.5">
                        {/* Row 1: Image + Details + Price */}
                        <div className="cart-item-row-1">
                          <div className="cart-product-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <h3 className="text-sm font-extrabold text-slate-800 truncate leading-snug">
                              {item.name}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] text-slate-400 font-medium">{item.category}</span>
                              <span className="bg-[#e6f7ef] text-[#009b5a] text-[10px] font-black px-2 py-0.5 rounded">
                                {item.pack || '500 g'}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 pt-0.5">
                              <span className="text-sm font-black text-[#009b5a]">₹{item.price}</span>
                              {item.mrp && <span className="text-xs text-slate-400 line-through">₹{item.mrp}</span>}
                              {item.discount && (
                                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-1.5 py-0.5 rounded">
                                  {item.discount}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Row 2: Stock Status + Quantity Stepper + Remove */}
                        <div className="cart-item-row-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block" />
                            <span>In Stock</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="quantity-control">
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, (item.quantity || 1) - 1)}
                                className="quantity-btn"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center text-xs font-black text-slate-900">
                                {item.quantity || 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleUpdateQty(item.id, (item.quantity || 1) + 1)}
                                className="quantity-btn"
                                aria-label="Increase quantity"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveItem(item.id)}
                              aria-label="Remove Item"
                              className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>

                        {/* Row 3: Save for later */}
                        <div className="cart-item-row-3">
                          <button
                            type="button"
                            onClick={() => handleSaveForLater(item)}
                            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors py-1 cursor-pointer"
                          >
                            <Bookmark className="h-3.5 w-3.5 text-slate-500" />
                            <span>Save for later</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Trust Benefits Section */}
              <div className="cart-benefits">
                <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#009b5a] flex items-center justify-center shrink-0">
                    <Truck className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800 leading-tight">Free Delivery</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">On orders above ₹499</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#009b5a] flex items-center justify-center shrink-0">
                    <RotateCcw className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800 leading-tight">Easy Returns</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">Quick & hassle free</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#009b5a] flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800 leading-tight">Secure Payment</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">100% secure payments</p>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-slate-200/80 p-3 flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-[#009b5a] flex items-center justify-center shrink-0">
                    <Leaf className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="text-xs font-black text-slate-800 leading-tight">Fresh Products</h5>
                    <p className="text-[10px] text-slate-400 font-semibold">Direct from farmers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="order-summary space-y-4">
              <h2 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              {/* Pricing Breakdown */}
              <div className="space-y-2.5 text-xs font-bold text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Total Items</span>
                  <span className="text-slate-900 font-extrabold">{totalItemsCount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-extrabold">₹{itemsSubtotal}</span>
                </div>

                {productDiscount > 0 && (
                  <div className="flex justify-between items-center text-[#009b5a]">
                    <span>Product Discount</span>
                    <span className="font-black">-₹{productDiscount}</span>
                  </div>
                )}

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-[#009b5a]">
                    <span>Coupon Discount</span>
                    <span className="font-black">-₹{appliedCoupon.discount}</span>
                  </div>
                )}

                {/* Coupon Tag */}
                {appliedCoupon && (
                  <div className="bg-[#f0fdf4] border border-emerald-300/80 rounded-xl p-2.5 flex items-center justify-between text-xs font-extrabold text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-[#009b5a]" />
                      <span>{appliedCoupon.code}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      aria-label="Remove coupon"
                      className="text-emerald-700 hover:text-rose-600 p-0.5 cursor-pointer"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                <div className="flex justify-between items-center pt-1">
                  <div>
                    <span className="block text-slate-700">Delivery Charges</span>
                    <span className="text-[10px] text-slate-400 font-medium">Free on orders above ₹499</span>
                  </div>
                  <span className="text-slate-900 font-extrabold">
                    {deliveryCharge === 0 ? <span className="text-[#009b5a]">FREE</span> : `₹${deliveryCharge}`}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Taxes & Fees</span>
                  <span className="text-slate-900 font-extrabold">₹{taxesAndFees}</span>
                </div>
              </div>

              {/* Total Amount Divider & Summary */}
              <div className="border-t border-slate-200/90 pt-3.5 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-black text-slate-900">Total Amount</span>
                  <span className="text-[22px] font-black text-[#009b5a]">₹{totalAmount}</span>
                </div>
                {totalSaved > 0 && (
                  <p className="text-xs font-extrabold text-[#009b5a]">
                    You will save ₹{totalSaved} on this order
                  </p>
                )}
              </div>

              {/* Proceed to Checkout CTA Button */}
              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full bg-[#009b5a] hover:bg-[#00874e] text-white h-12 rounded-xl font-black text-base flex items-center justify-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ChevronRight className="h-5 w-5" />
              </button>

              {/* Trust Features */}
              <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px] font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Estimated delivery: Today, 6 PM - 8 PM</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Secure payment options</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>Easy cancellation & refunds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Checkout Bar (< 768px) */}
        <div className="mobile-checkout-bar md:hidden">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block leading-tight">Total Amount</span>
            <span className="text-lg font-black text-[#009b5a]">₹{totalAmount}</span>
          </div>
          <button
            type="button"
            onClick={handleProceedToCheckout}
            className="bg-[#009b5a] hover:bg-[#00874e] text-white px-6 py-3 rounded-xl font-extrabold text-sm flex items-center gap-2 shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
          >
            <span>Checkout</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
