import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  ChevronRight, 
  Heart, 
  Zap,
  AlertCircle,
  MessageCircle,
  Minus,
  Plus
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import CouponModal from '../../components/common/CouponModal';
import getProductImage from '../../utils/productImageMapper';
import toast from 'react-hot-toast';

// Local images fallback
import capsicumImg from '../../assets/images/capsicum.png';
import tomatoImg from '../../assets/images/tomato.png';
import potatoImg from '../../assets/images/potato.png';

const Cart = () => {
  const { cart, updateCartItem, removeFromCart, addToCart, addresses, selectedAddressId } = useCustomer();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [whatsAppUpdates, setWhatsAppUpdates] = useState(true);

  // Safe Cart Calculations
  const cartItems = cart ?? [];
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0),
    [cartItems]
  );
  
  const itemTotal = useMemo(
    () => cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0),
    [cartItems]
  );

  const mrpTotal = useMemo(
    () => itemTotal + (cartCount > 0 ? 1 : 0),
    [itemTotal, cartCount]
  );

  const deliveryFee = useMemo(() => (itemTotal >= 499 ? 0 : 40), [itemTotal]);

  const discountAmount = useMemo(() => {
    let disc = mrpTotal - itemTotal;
    if (appliedCoupon) {
      if (appliedCoupon.type === 'PERCENT') {
        disc += (itemTotal * appliedCoupon.value) / 100;
      } else if (appliedCoupon.type === 'FIXED') {
        disc += Math.min(appliedCoupon.value, itemTotal);
      }
    }
    return Math.max(1, disc);
  }, [appliedCoupon, itemTotal, mrpTotal]);

  const grandTotal = useMemo(
    () => Math.max(0, itemTotal + deliveryFee - (appliedCoupon ? (appliedCoupon.type === 'PERCENT' ? (itemTotal * appliedCoupon.value) / 100 : appliedCoupon.value) : 0)),
    [itemTotal, deliveryFee, appliedCoupon]
  );

  const minOrderAmount = 99;
  const isMinOrderReached = itemTotal >= minOrderAmount;
  const remainingForMinOrder = Math.max(0, minOrderAmount - itemTotal);

  const selectedAddress = useMemo(() => {
    if (!addresses || addresses.length === 0) return null;
    return addresses.find((a) => a.id === selectedAddressId) || addresses[0];
  }, [addresses, selectedAddressId]);

  const hasSelectedAddress = Boolean(selectedAddress);

  const handleApplyCoupon = (codeToApply) => {
    const code = (codeToApply || couponCode).toUpperCase().trim();
    if (!code) {
      toast.error('Please enter a valid coupon code');
      return;
    }
    if (code === 'FARM10') {
      setAppliedCoupon({ code: 'FARM10', type: 'PERCENT', value: 10, label: '10% OFF' });
      toast.success('Coupon FARM10 applied! (10% OFF)');
      setIsCouponModalOpen(false);
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', type: 'FIXED', value: 40, label: 'Free Delivery' });
      toast.success('Coupon FREESHIP applied!');
      setIsCouponModalOpen(false);
    } else if (code === 'SAVE50') {
      setAppliedCoupon({ code: 'SAVE50', type: 'FIXED', value: 50, label: '₹50 OFF' });
      toast.success('Coupon SAVE50 applied!');
      setIsCouponModalOpen(false);
    } else {
      toast.error('Invalid coupon code. Try FARM10 or FREESHIP');
    }
  };

  const handleProceedToCheckout = (preferredPaymentMethod = null) => {
    if (cartCount === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (!isMinOrderReached) {
      toast.error(`Minimum order value is ₹${minOrderAmount}. Please add items worth ₹${remainingForMinOrder.toFixed(2)} more to continue.`);
      return;
    }

    if (!isAuthenticated) {
      toast.error('Please log in to proceed to checkout');
      navigate('/login', { state: { from: hasSelectedAddress ? '/checkout' : '/checkout/address' } });
      return;
    }

    if (hasSelectedAddress) {
      navigate('/checkout', {
        state: {
          discountAmount,
          appliedCoupon,
          preferredPaymentMethod,
        },
      });
    } else {
      navigate('/checkout/address', {
        state: {
          discountAmount,
          appliedCoupon,
          preferredPaymentMethod,
        },
      });
    }
  };

  // Recommendations for "You may also like"
  const recommendations = [
    { id: 101, name: 'Simple Vitamin C Wash', price: 199, category: 'Personal Care', image: getProductImage('Apple', 'Fruit') },
    { id: 102, name: 'Simple Moisturising Wash', price: 210, category: 'Personal Care', image: getProductImage('Banana', 'Fruit') },
    { id: 103, name: 'Simple Refreshing Wash', price: 185, category: 'Personal Care', image: getProductImage('Carrot', 'Vegetables') },
    { id: 104, name: 'Fresh Capsicum', price: 55, category: 'Vegetables', image: capsicumImg },
    { id: 105, name: 'Organic Tomatoes', price: 45, category: 'Vegetables', image: tomatoImg },
    { id: 106, name: 'Farm Potatoes', price: 35, category: 'Vegetables', image: potatoImg },
  ];

  // Empty Cart State
  if (cartCount === 0) {
    return (
      <div className="min-h-screen bg-[#f4f5f7] pt-24 pb-20 px-4 flex flex-col items-center justify-center font-sans">
        <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-[#0088b6] mb-4 shadow-inner">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-800 mb-2">Your cart is empty</h2>
        <p className="text-slate-500 mb-6 text-center max-w-sm text-xs font-medium">
          Looks like you haven't added anything to your cart yet. Let's find some fresh farm produce for you!
        </p>
        <Button onClick={() => navigate('/customer')} variant="primary" className="px-6 py-2.5 rounded-full bg-[#0088b6] hover:bg-[#007099] font-bold text-xs shadow-sm">
          Continue Shopping
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#eef0f3] pt-12 pb-16 font-sans w-full overflow-x-hidden">
      <div className="max-w-[1200px] w-full mx-auto px-3 sm:px-4">
        <h1 className="text-[26px] leading-none font-black text-slate-700 mb-5">Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-5 items-start">
          <div className="space-y-4 min-w-0">
            <div className="bg-white rounded-[16px] border border-slate-200 overflow-hidden">
              <div className="px-4 sm:px-5 pt-4 pb-2 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-[18px] font-bold text-slate-800">
                    <span className="text-[#ff8f00]">-Quick</span> Delivery
                  </h2>
                  <p className="text-[14px] text-slate-600">Groceries ({cartCount} {cartCount === 1 ? 'item' : 'items'})</p>
                </div>
                <p className="text-[22px] font-black text-slate-900">₹{itemTotal.toFixed(2)}</p>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => {
                  const itemQty = Number(item.quantity || 1);
                  const itemPrice = Number(item.price || 0);
                  const itemSubtotal = itemPrice * itemQty;
                  const itemImage = getProductImage(item.name, item.category, item.image);

                  return (
                    <div key={item.id} className="px-4 sm:px-5 py-4 flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-200 rounded-md p-1 shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={itemImage}
                          alt={item.name}
                          className="w-full h-full object-contain"
                          onError={(e) => { e.target.src = capsicumImg; }}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="text-[20px] font-extrabold text-slate-800 truncate">{item.name}</h3>
                        <p className="text-[13px] text-slate-500 mt-0.5">{item.unit || '1 kg'}</p>
                      </div>

                      <div className="shrink-0 flex items-center gap-4">
                        <div className="h-10 w-[118px] rounded-[10px] bg-[#e6f6ff] border border-[#8ecdf3] overflow-hidden flex items-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (itemQty <= 1) removeFromCart(item.id);
                              else updateCartItem(item.id, itemQty - 1);
                            }}
                            className="w-10 h-full inline-flex items-center justify-center text-[#2a98ce] hover:bg-[#d5f0ff]"
                            aria-label={`Decrease ${item.name}`}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="flex-1 text-center text-base font-black text-[#1f7fb0]">{itemQty}</span>
                          <button
                            type="button"
                            onClick={() => updateCartItem(item.id, itemQty + 1)}
                            className="w-10 h-full inline-flex items-center justify-center text-[#2a98ce] hover:bg-[#d5f0ff]"
                            aria-label={`Increase ${item.name}`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right min-w-[72px]">
                          <p className="text-[20px] font-black text-slate-900">₹{itemSubtotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isMinOrderReached && (
                <div className="bg-[#fff2e9] border-t border-[#f8dcc8] px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="w-6 h-6 text-[#ff7b1f] shrink-0" />
                    <div>
                      <p className="text-[16px] font-bold text-[#ff7b1f]">Minimum order value is ₹{minOrderAmount}</p>
                      <p className="text-[14px] font-medium text-slate-600">Add items worth ₹{remainingForMinOrder.toFixed(2)} from groceries</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/customer')}
                    className="bg-[#0b88bf] hover:bg-[#0873a0] text-white h-10 px-5 rounded-full text-sm font-black shrink-0"
                  >
                    Add Items
                  </button>
                </div>
              )}
            </div>

            <div className="bg-[#ffe8ec] rounded-[16px] border border-[#ffd4dc] p-4 sm:p-5">
              <h3 className="text-[22px] leading-none font-black text-slate-900 mb-4">You may also like</h3>

              <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 hide-scrollbar">
                {recommendations.map((prod) => (
                  <div key={prod.id} className="bg-white rounded-xl p-3 w-[176px] shrink-0 relative border border-slate-100">
                    <button className="absolute top-2 left-2 text-slate-300 hover:text-rose-500 transition-colors">
                      <Heart className="w-4 h-4 fill-current" />
                    </button>

                    <button
                      onClick={() => addToCart(prod)}
                      className="absolute top-2 right-2 h-8 px-3 rounded-[10px] border border-[#7bc2e9] bg-[#e6f6ff] text-[#0b88bf] font-extrabold text-[14px] hover:bg-[#0b88bf] hover:text-white"
                    >
                      Add
                    </button>

                    <div className="h-[100px] mt-7 mb-2 flex items-center justify-center p-1">
                      <img src={prod.image} alt={prod.name} className="max-h-full max-w-full object-contain" />
                    </div>

                    <p className="text-[16px] font-bold text-slate-800 leading-tight line-clamp-2 min-h-[40px]">{prod.name}</p>
                    <p className="text-[18px] font-black text-slate-900 mt-1">₹{prod.price}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-3.5 lg:sticky lg:top-[78px] min-w-0">
            <button
              type="button"
              onClick={() => setIsCouponModalOpen(true)}
              className="w-full bg-white rounded-[16px] border border-slate-200 p-4 text-left hover:border-slate-300 transition flex items-center justify-between"
            >
              <div>
                <p className="text-[16px] font-bold text-slate-700">{appliedCoupon ? `${appliedCoupon.code} Applied` : 'No coupons available'}</p>
                <p className="text-[18px] leading-none font-black text-[#0b88bf] mt-2">View all coupons</p>
              </div>
              <ChevronRight className="w-6 h-6 text-slate-500" />
            </button>

            <div className="bg-white rounded-[16px] border border-slate-200 p-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <p className="text-[14px] font-medium text-slate-600 leading-snug">
                  Enable order updates and important information on WhatsApp
                </p>
              </div>

              <input
                type="checkbox"
                checked={whatsAppUpdates}
                onChange={(e) => setWhatsAppUpdates(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-[#0b88bf] focus:ring-0 cursor-pointer shrink-0"
              />
            </div>

            <div className="bg-white rounded-[16px] border border-slate-200 overflow-hidden">
              <div className="p-4">
                <h3 className="text-[22px] leading-none font-black text-slate-700 mb-4">Payment Details</h3>

                <div className="space-y-3 text-[16px] font-semibold text-slate-600">
                  <div className="flex justify-between">
                    <span>MRP Total</span>
                    <span className="font-bold text-slate-800">₹{mrpTotal.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-800">₹{itemTotal.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-slate-200" />
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-black text-slate-800">₹{grandTotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <p className="text-right text-emerald-600 text-sm font-bold">You saved ₹{discountAmount.toFixed(2)}</p>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 space-y-3">
                {selectedAddress && (
                  <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-2.5 flex items-center justify-between text-xs font-sans">
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-slate-800 truncate">Deliver to: {selectedAddress.name || 'Home'}</p>
                      <p className="text-slate-500 font-medium truncate">{selectedAddress.line1}, {selectedAddress.city}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/checkout/address')}
                      className="text-[#0070a6] font-bold shrink-0 hover:underline"
                    >
                      Change
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleProceedToCheckout()}
                  className="w-full h-12 rounded-full bg-[#0070a6] hover:bg-[#005f8d] text-white text-base font-black shadow-md transition-all"
                >
                  {hasSelectedAddress ? 'Proceed to Pay' : 'Add Address'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        onApplyCoupon={handleApplyCoupon}
      />
    </div>
  );
};

export default Cart;
