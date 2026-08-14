import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, MapPin, CreditCard, Truck, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutModal = ({ isOpen, onClose, cartItems = [], onOrderComplete }) => {
  const [step, setStep] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState('UPI');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [address, setAddress] = useState({
    fullName: 'Sai Veeramalla',
    mobile: '+91 98765 43210',
    houseNo: 'Plot 42, Hitech City',
    street: 'Madhapur Main Road',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
  });

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const grandTotal = subtotal + shippingFee;

  const handlePlaceOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const orderId = `F2H-${Math.floor(100000 + Math.random() * 900000)}`;
      toast.success(`Order ${orderId} placed successfully! 🎉`);
      onOrderComplete(orderId);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600">Step {step} of 2</span>
            <h2 className="text-lg font-black text-slate-900">
              {step === 1 ? 'Shipping Address & Slot' : 'Select Payment Method'}
            </h2>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-900 uppercase">Default Shipping Address</span>
                  <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md shadow-2xs">Home</span>
                </div>
                <p className="text-sm font-bold text-slate-900">{address.fullName} ({address.mobile})</p>
                <p className="text-xs text-slate-600 font-medium">{address.houseNo}, {address.street}, {address.city}, {address.state} - {address.pincode}</p>
              </div>

              {/* Delivery Slot */}
              <div>
                <label className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">Delivery Speed</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-indigo-600 text-white font-bold text-xs border border-indigo-600 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-300" />
                    <div>
                      <p>Express 24-Hour</p>
                      <p className="text-[10px] opacity-80 font-normal">Delivered tomorrow</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 flex items-center gap-2 opacity-60">
                    <Truck className="w-4 h-4 text-slate-400" />
                    <div>
                      <p>Standard Delivery</p>
                      <p className="text-[10px] text-slate-400 font-normal">2-3 Business Days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="text-xs font-extrabold text-slate-700 block">Order Summary ({cartItems.length} Products)</span>
                <div className="flex justify-between text-xs font-bold text-slate-600 pt-1">
                  <span>Payable Amount</span>
                  <span className="text-sm font-black text-slate-900">₹{grandTotal}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider block mb-2">Choose Payment Option</span>

              <div className="space-y-2">
                {[
                  { id: 'UPI', title: 'UPI (GPay, PhonePe, Paytm)', sub: 'Instant payment via UPI QR / ID' },
                  { id: 'CARDS', title: 'Credit / Debit Card', sub: 'Visa, Mastercard, RuPay' },
                  { id: 'COD', title: 'Cash on Delivery', sub: 'Pay cash upon package arrival' },
                ].map((pay) => (
                  <div
                    key={pay.id}
                    onClick={() => setSelectedPayment(pay.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      selectedPayment === pay.id 
                        ? 'bg-indigo-50 border-indigo-600 text-indigo-900 font-bold shadow-xs' 
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-black">{pay.title}</p>
                      <p className="text-[11px] text-slate-500 font-medium">{pay.sub}</p>
                    </div>
                    {selectedPayment === pay.id && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs font-bold">
                <span>Final Payable Total</span>
                <span className="text-base font-black text-amber-400">₹{grandTotal}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          {step === 2 ? (
            <button
              onClick={() => setStep(1)}
              className="text-xs font-black text-slate-600 hover:text-slate-900 underline"
            >
              Back to Address
            </button>
          ) : (
            <span className="text-xs font-bold text-slate-400">100% Encrypted Checkout</span>
          )}

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center gap-2 cursor-pointer"
            >
              <span>Continue to Payment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="h-11 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-emerald-600/20 flex items-center gap-2 cursor-pointer active:scale-95 disabled:bg-slate-400"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Processing...' : `Pay ₹${grandTotal} & Place Order`}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default CheckoutModal;
