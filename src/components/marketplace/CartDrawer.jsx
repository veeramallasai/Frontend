import React, { useState, useMemo } from 'react';
import { X, ShoppingBag, Trash2, Plus, Minus, Tag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const CartDrawer = ({ isOpen, onClose, cartItems = [], onUpdateQuantity, onRemoveItem, onProceedToCheckout }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState({ code: 'WELCOME15', discount: 15 });

  const totalItems = useMemo(() => cartItems.reduce((acc, item) => acc + item.quantity, 0), [cartItems]);
  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0), [cartItems]);
  const mrpTotal = useMemo(() => Math.round(subtotal * 1.25), [subtotal]);
  const productDiscount = mrpTotal - subtotal;
  const couponDiscountAmount = useMemo(() => Math.round((subtotal * appliedCoupon.discount) / 100), [subtotal, appliedCoupon]);
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const grandTotal = Math.max(0, subtotal - couponDiscountAmount + shippingFee);

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (couponCode.toUpperCase() === 'FARM20' || couponCode.toUpperCase() === 'NEXUS20') {
      setAppliedCoupon({ code: 'FARM20', discount: 20 });
      toast.success('Coupon FARM20 applied! 20% discount added.');
    } else {
      toast.error('Invalid coupon code. Try "FARM20"');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900">Your Shopping Cart</h2>
              <p className="text-xs text-slate-500 font-semibold">{totalItems} Items in Cart</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Free Shipping Progress Bar */}
        <div className="bg-indigo-50/70 border-b border-indigo-100 px-4 py-2.5 text-xs font-bold text-indigo-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>{subtotal >= 999 ? '🎉 You qualify for FREE Shipping!' : `Add ₹${999 - subtotal} more for FREE Shipping`}</span>
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-800">Your Cart is Empty</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Explore our marketplace to add your favorite products!</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                <div className="w-20 h-20 bg-slate-50 rounded-xl p-2 flex items-center justify-center shrink-0 border border-slate-100">
                  <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                        {item.category}
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 truncate mt-0.5">{item.name}</h4>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-2">
                    <span className="text-sm font-black text-slate-900">₹{item.price}</span>

                    <div className="flex h-7 items-center rounded-lg border border-slate-200 bg-slate-50">
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        className="w-6 text-xs font-black text-slate-600 hover:bg-slate-200/70 h-full rounded-l-lg"
                      >
                        <Minus className="w-3 h-3 mx-auto" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-slate-900">{item.quantity}</span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        className="w-6 text-xs font-black text-slate-600 hover:bg-slate-200/70 h-full rounded-r-lg"
                      >
                        <Plus className="w-3 h-3 mx-auto" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer & Order Summary */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 space-y-3">
            {/* Coupon Code Input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Coupon code (e.g. NEXUS20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="w-full h-9 bg-white border border-slate-200 text-xs font-bold rounded-xl pl-9 pr-3 uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black cursor-pointer"
              >
                Apply
              </button>
            </form>

            {/* Calculations */}
            <div className="space-y-1.5 text-xs font-semibold text-slate-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">₹{subtotal}</span>
              </div>
              {couponDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Coupon Discount ({appliedCoupon.code})</span>
                  <span>-₹{couponDiscountAmount}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-indigo-600 text-base">₹{grandTotal}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={onProceedToCheckout}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default CartDrawer;
