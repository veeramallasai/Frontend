import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  MapPin,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ChevronDown,
  ChevronRight,
  Plus,
  ArrowLeft,
  Search,
  Heart,
  ShoppingCart,
  Menu,
  User,
  Loader2,
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import CustomerSidebar from '../../components/layout/CustomerSidebar';
import toast from 'react-hot-toast';
import './Checkout.css';

// Image assets
import tomatoImg from '../../assets/images/tomato.png';
import potatoImg from '../../assets/images/potato.png';
import cabbageImg from '../../assets/images/cabbage.png';
import dairy3dSvg from '../../assets/images/categories/dairy-3d.svg';

const DEFAULT_CHECKOUT_ITEMS = [
  { id: 'item-1', name: 'Fresh Organic Tomatoes', pack: '500 g', price: 38, quantity: 1, image: tomatoImg },
];

const PAYMENT_METHODS = [
  {
    id: 'UPI',
    name: 'UPI',
    description: 'Pay using any UPI app',
    logos: ['G Pay', 'PhonePe', 'Paytm'],
  },
  {
    id: 'CARDS',
    name: 'Credit / Debit Card',
    description: 'Visa, Mastercard, Rupay & more',
    logos: ['VISA', 'Mastercard', 'RuPay'],
  },
  {
    id: 'NETBANKING',
    name: 'Net Banking',
    description: 'All major banks supported',
    logos: [],
  },
  {
    id: 'COD',
    name: 'Cash on Delivery',
    description: 'Pay in cash when your order is delivered',
    logos: [],
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cart = [], addresses = [], selectedAddressId, placeOrder, clearCart } = useCustomer();
  const { user } = useAuth();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cart Items & Total Calculations
  const checkoutItems = useMemo(() => {
    return cart && cart.length > 0 ? cart : DEFAULT_CHECKOUT_ITEMS;
  }, [cart]);

  const totalItemsCount = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [checkoutItems]
  );

  const itemsSubtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0),
    [checkoutItems]
  );

  const productDiscount = 57;
  const couponDiscount = 20;
  const deliveryCharges = itemsSubtotal >= 499 ? 0 : 40;
  const taxesAndFees = 10;

  const totalAmount = useMemo(
    () => Math.max(0, itemsSubtotal - couponDiscount + deliveryCharges + taxesAndFees),
    [itemsSubtotal, couponDiscount, deliveryCharges, taxesAndFees]
  );

  const totalSaved = productDiscount + couponDiscount;

  // Delivery Address
  const activeAddress = useMemo(() => {
    if (addresses && addresses.length > 0) {
      return addresses.find((a) => a.id === selectedAddressId) || addresses[0];
    }
    return {
      id: 'addr-1',
      type: 'HOME',
      name: 'Sai Veeramalla',
      phone: '+91 98765 43210',
      line1: 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
    };
  }, [addresses, selectedAddressId]);

  const handlePlaceOrderSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (placeOrder) {
        await placeOrder(selectedPayment, activeAddress?.id);
      }
      toast.success('Order placed successfully!');
      if (clearCart) clearCart();
      setTimeout(() => {
        navigate('/customer/orders', {
          state: {
            orderId: `F2H-${Math.floor(100000 + Math.random() * 900000)}`,
            totalAmount,
            address: activeAddress,
          },
        });
      }, 500);
    } catch (err) {
      toast.error(err.message || 'Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  const currentUser = user || (storedUser ? JSON.parse(storedUser) : null);
  const userName = currentUser?.fullName?.split(' ')[0] || currentUser?.username || 'Sai';

  return (
    <div className="app-layout">
      {/* Reusable Left Sidebar */}
      <CustomerSidebar
        activeItem="shop"
        onItemClick={(item) => {
          if (item.id === 'shop') navigate('/customer/shop');
          if (item.id === 'cart') navigate('/cart');
          if (item.id === 'dashboard') navigate('/dashboard');
        }}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Checkout Area */}
      <div className="checkout-page">
        {/* Main Content Container (Compact & Sleek) */}
        <div className="checkout-container">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer active:scale-95 shrink-0"
              >
                <Menu className="h-4 w-4" />
              </button>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">
                Checkout
              </h1>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="hidden sm:flex items-center gap-1 text-xs">
                <MapPin className="h-3.5 w-3.5 text-[#009b5a]" />
                <span className="text-slate-400 text-[11px] font-semibold">Deliver to</span>
                <span className="font-extrabold text-slate-800 text-[11px]">Hyderabad, 500001</span>
              </div>
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                  <User className="h-3.5 w-3.5 text-slate-600" />
                </div>
                <span className="hidden sm:block text-xs font-bold text-slate-800">Hi, {userName}</span>
              </div>
            </div>
          </div>

          {/* 4-Step Indicator Bar (Compact) */}
          <div className="checkout-step-indicator shadow-2xs">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-[#009b5a] text-white font-black text-[11px] flex items-center justify-center shadow-2xs">
                1
              </div>
              <div className="text-left">
                <span className="block text-xs font-black text-slate-800 leading-tight">Address</span>
                <span className="hidden sm:block text-[9px] text-slate-400 font-semibold">Select delivery address</span>
              </div>
            </div>

            <div className="h-0.5 flex-1 bg-slate-200 mx-2" />

            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 font-black text-[11px] flex items-center justify-center">
                2
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-600 leading-tight">Payment</span>
                <span className="hidden sm:block text-[9px] text-slate-400 font-medium">Select payment method</span>
              </div>
            </div>

            <div className="h-0.5 flex-1 bg-slate-200 mx-2" />

            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 font-black text-[11px] flex items-center justify-center">
                3
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-600 leading-tight">Review</span>
                <span className="hidden sm:block text-[9px] text-slate-400 font-medium">Review your order</span>
              </div>
            </div>

            <div className="h-0.5 flex-1 bg-slate-200 mx-2" />

            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-200 text-slate-600 font-black text-[11px] flex items-center justify-center">
                4
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-slate-600 leading-tight">Place Order</span>
                <span className="hidden sm:block text-[9px] text-slate-400 font-medium">Order placed successfully</span>
              </div>
            </div>
          </div>

          {/* Main Layout Grid */}
          <div className="checkout-layout">
            {/* Left Checkout Main Sections */}
            <div className="checkout-main">
              {/* 1. Delivery Address Card */}
              <div className="address-card space-y-2.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h2 className="text-sm sm:text-base font-black text-slate-800">Delivery Address</h2>
                  <button
                    type="button"
                    onClick={() => navigate('/select-address')}
                    className="text-xs font-black text-[#009b5a] hover:underline cursor-pointer"
                  >
                    Change
                  </button>
                </div>

                <div className="bg-[#f0fdf4] border-2 border-[#009b5a] rounded-xl p-3.5 flex items-start justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-2.5 flex-1">
                    <div className="h-7 w-7 rounded-full bg-[#009b5a] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-black text-slate-800">{activeAddress.name}</span>
                        <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                          {activeAddress.type || 'HOME'}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-600">{activeAddress.phone}</p>
                      <p className="text-[11px] font-medium text-slate-500 leading-normal">
                        {activeAddress.line1}, {activeAddress.city}, {activeAddress.state} - {activeAddress.pincode}
                      </p>
                      <span className="inline-block text-[10px] font-extrabold text-[#009b5a] pt-0.5">
                        Deliver here
                      </span>
                    </div>
                  </div>

                  <div className="h-5 w-5 rounded-full bg-[#009b5a] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>

                <div
                  onClick={() => navigate('/select-address')}
                  className="bg-white border-2 border-dashed border-slate-200/90 hover:border-[#009b5a] hover:bg-emerald-50/40 rounded-xl py-2 px-3 text-center cursor-pointer transition-all flex items-center justify-center gap-2 text-xs font-black text-slate-700 hover:text-[#009b5a]"
                >
                  <Plus className="h-3.5 w-3.5 text-slate-500" />
                  <span>Add New Address</span>
                </div>
              </div>

              {/* 2. Delivery Slot Section */}
              <div className="delivery-slot-card space-y-2.5">
                <h2 className="text-sm sm:text-base font-black text-slate-800 border-b border-slate-100 pb-2">
                  Delivery Slot
                </h2>

                <div className="bg-[#f0fdf4] border-2 border-[#009b5a] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-full bg-[#009b5a] text-white flex items-center justify-center shrink-0">
                      <Truck className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex items-center gap-2 text-xs font-black text-slate-800">
                      <span>Today, 6 May</span>
                      <span className="text-[11px] font-bold text-slate-600">6 PM - 8 PM</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md">
                        FREE
                      </span>
                    </div>
                  </div>

                  <div className="h-5 w-5 rounded-full bg-[#009b5a] text-white flex items-center justify-center shrink-0 shadow-2xs">
                    <span className="h-2 w-2 rounded-full bg-white" />
                  </div>
                </div>

                <div className="text-center">
                  <button type="button" className="text-[11px] font-bold text-slate-500 hover:text-[#009b5a] inline-flex items-center gap-1">
                    <span>View all slots</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* 3. Payment Method Section */}
              <div className="payment-card space-y-2.5">
                <h2 className="text-sm sm:text-base font-black text-slate-800 border-b border-slate-100 pb-2">
                  Payment Method
                </h2>

                <div className="space-y-2">
                  {PAYMENT_METHODS.map((method) => {
                    const isSelected = selectedPayment === method.id;

                    return (
                      <div
                        key={method.id}
                        onClick={() => setSelectedPayment(method.id)}
                        className={`rounded-xl p-3 transition-all cursor-pointer border-2 flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#f0fdf4] border-[#009b5a] shadow-2xs'
                            : 'bg-white border-slate-200/90 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${isSelected ? 'bg-[#009b5a] text-white' : 'bg-slate-100 text-slate-600'}`}>
                            <CreditCard className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-slate-800 leading-tight">
                              {method.name}
                            </h4>
                            <p className="text-[10px] font-semibold text-slate-400 truncate">
                              {method.description}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {method.logos.map((logo, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-black text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200"
                            >
                              {logo}
                            </span>
                          ))}

                          <div className="pl-1">
                            {isSelected ? (
                              <div className="h-5 w-5 rounded-full bg-[#009b5a] text-white flex items-center justify-center shadow-xs">
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                              </div>
                            ) : (
                              <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Secure Payments Banner */}
              <div className="bg-[#f0fdf4] border border-[#c6f0da] rounded-xl p-3 flex items-center gap-2.5">
                <div className="h-6 w-6 rounded-full bg-[#009b5a] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-3.5 w-3.5" />
                </div>
                <div>
                  <h5 className="text-xs font-black text-emerald-900 leading-tight">Secure Payments</h5>
                  <p className="text-[10px] text-emerald-700 font-semibold">Your payment information is safe with us.</p>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="order-summary space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h2 className="text-sm sm:text-base font-black text-slate-800">Order Summary</h2>
                <span className="text-[11px] font-extrabold text-slate-400">{totalItemsCount} Items</span>
              </div>

              {/* Product Mini Items List */}
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 divide-y divide-slate-100 scrollbar-thin">
                {checkoutItems.map((item) => (
                  <div key={item.id} className="pt-1.5 flex items-center justify-between gap-2.5 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-slate-50 border border-slate-200 p-0.5 shrink-0 overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-contain" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-slate-800 truncate text-[11px]">{item.name}</h4>
                        <span className="text-[9px] text-slate-400 font-medium">{item.pack || '500 g'} . Qty: {item.quantity || 1}</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-800 text-xs shrink-0">₹{item.price * (item.quantity || 1)}</span>
                  </div>
                ))}
              </div>

              {/* Pricing Breakdown */}
              <div className="border-t border-slate-100 pt-2 space-y-1.5 text-xs font-bold text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-slate-900 font-extrabold">₹{itemsSubtotal}</span>
                </div>

                <div className="flex justify-between items-center text-[#009b5a]">
                  <span>Product Discount</span>
                  <span className="font-black">-₹{productDiscount}</span>
                </div>

                <div className="flex justify-between items-center text-[#009b5a]">
                  <span>Coupon Discount (WELCOME20)</span>
                  <span className="font-black">-₹{couponDiscount}</span>
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <span className="block text-slate-700">Delivery Charges</span>
                    <span className="text-[9px] text-slate-400 font-medium">Free on orders above ₹499</span>
                  </div>
                  <span className="text-slate-900 font-extrabold">₹{deliveryCharges}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Taxes & Fees</span>
                  <span className="text-slate-900 font-extrabold">₹{taxesAndFees}</span>
                </div>
              </div>

              {/* Total Amount Divider */}
              <div className="border-t border-slate-200 pt-2.5 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm sm:text-base font-black text-slate-900">Total Amount</span>
                  <span className="text-xl font-black text-[#009b5a]">₹{totalAmount}</span>
                </div>

                {totalSaved > 0 && (
                  <div className="bg-emerald-50 text-[#009b5a] text-[11px] font-black p-2 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#009b5a] shrink-0" />
                    <span>You will save ₹{totalSaved} on this order</span>
                  </div>
                )}
              </div>

              {/* Place Order CTA Button */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceOrderSubmit}
                className="w-full bg-[#009b5a] hover:bg-[#00874e] text-white py-3 px-4 rounded-xl font-black text-sm flex items-center justify-between shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2 w-full">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Processing Order...</span>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Lock className="h-4 w-4" />
                      <span>Place Order</span>
                    </div>
                    <span className="text-base">₹{totalAmount}</span>
                  </>
                )}
              </button>

              <p className="text-[9px] text-slate-400 text-center leading-tight">
                By placing this order, you agree to our{' '}
                <a href="#terms" className="underline hover:text-emerald-700">Terms & Conditions</a> and{' '}
                <a href="#privacy" className="underline hover:text-emerald-700">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>

        {/* Sticky Mobile Place Order Bar (< 768px) */}
        <div className="mobile-checkout-bar md:hidden">
          <div>
            <span className="text-[10px] text-slate-400 font-bold block leading-tight">Total Amount</span>
            <span className="text-base font-black text-[#009b5a]">₹{totalAmount}</span>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handlePlaceOrderSubmit}
            className="bg-[#009b5a] hover:bg-[#00874e] text-white px-5 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <>
                <span>Place Order</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
