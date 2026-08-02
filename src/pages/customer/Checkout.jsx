import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  CreditCard, 
  Wallet, 
  Truck, 
  Landmark,
  Minus,
  Plus,
  X,
  Tag, 
  ShieldCheck, 
  Loader2
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import LocationModal from '../../components/common/LocationModal';
import getProductImage from '../../utils/productImageMapper';
import toast from 'react-hot-toast';

const DELIVERY_OPTIONS = [
  { id: 'standard', title: 'Standard Delivery', subtitle: 'Delivery by today, 6 PM', fee: 0, feeLabel: 'FREE' },
  { id: 'express', title: 'Express Delivery', subtitle: 'Delivery by tomorrow, 2 PM', fee: 49, feeLabel: '₹49' },
];

const PAYMENT_OPTIONS = [
  { id: 'UPI', label: 'UPI', meta: 'GPay / PhonePe / Paytm', icon: Wallet },
  { id: 'Cards', label: 'Credit / Debit / ATM Card', meta: 'Visa, Mastercard, RuPay', icon: CreditCard },
  { id: 'NETBANKING', label: 'Net Banking', meta: 'All major banks', icon: Landmark },
  { id: 'COD', label: 'Cash on Delivery', meta: 'Pay when delivered', icon: Truck },
];

const Checkout = () => {
  const { cart, addresses, selectedAddressId, setSelectedAddressId, addAddress, placeOrder, clearCart, updateCartItem, removeFromCart } = useCustomer();
  const navigate = useNavigate();
  const location = useLocation();

  const [paymentMethod, setPaymentMethod] = useState(location.state?.preferredPaymentMethod || 'UPI');
  const [selectedSlot, setSelectedSlot] = useState(location.state?.selectedSlot || 'standard');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasOrderPlaced, setHasOrderPlaced] = useState(false);
  const [addressList, setAddressList] = useState(addresses ?? []);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(location.state?.appliedCoupon || null);

  const cartItems = cart ?? [];
  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + Number(item.quantity || 1), 0), [cartItems]);
  const itemTotal = useMemo(() => cartItems.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0), [cartItems]);
  
  const selectedDeliveryOption = useMemo(
    () => DELIVERY_OPTIONS.find((option) => option.id === selectedSlot) || DELIVERY_OPTIONS[0],
    [selectedSlot]
  );

  const deliveryFee = useMemo(() => Number(selectedDeliveryOption?.fee || 0), [selectedDeliveryOption]);
  const handlingFee = useMemo(() => (cartCount > 0 ? 3 : 0), [cartCount]);

  const discountAmount = useMemo(() => {
    if (location.state?.discountAmount) return location.state.discountAmount;
    if (!appliedCoupon) return 0;
    if (appliedCoupon.type === 'PERCENT') return (itemTotal * appliedCoupon.value) / 100;
    if (appliedCoupon.type === 'FIXED') return Math.min(appliedCoupon.value, itemTotal);
    return 0;
  }, [appliedCoupon, itemTotal, location.state]);

  const gstAmount = useMemo(() => {
    const baseAmount = Math.max(0, itemTotal - discountAmount);
    return Number((baseAmount * 0.07).toFixed(2));
  }, [itemTotal, discountAmount]);

  const grandTotal = useMemo(
    () => Math.max(0, itemTotal + deliveryFee + handlingFee + gstAmount - discountAmount),
    [itemTotal, deliveryFee, handlingFee, gstAmount, discountAmount]
  );

  const selectedAddress = useMemo(() => {
    return addressList.find((addr) => addr.id === selectedAddressId) || addressList[0] || null;
  }, [addressList, selectedAddressId]);

  const savingsAmount = useMemo(() => {
    const freeDeliverySavings = selectedSlot === 'standard' ? 49 : 0;
    return Math.max(0, discountAmount + freeDeliverySavings);
  }, [discountAmount, selectedSlot]);

  useEffect(() => {
    if (cartCount === 0 && !hasOrderPlaced) {
      toast.error('Your cart is empty');
      navigate('/cart');
    }
  }, [cartCount, hasOrderPlaced, navigate]);

  useEffect(() => {
    setAddressList(addresses ?? []);
  }, [addresses]);

  useEffect(() => {
    const newlyAddedAddress = location.state?.newlyAddedAddress;
    if (!newlyAddedAddress?.id) return;

    setAddressList((prev) => {
      if (prev.some((addr) => addr.id === newlyAddedAddress.id)) return prev;
      return [newlyAddedAddress, ...prev];
    });

    setSelectedAddressId(newlyAddedAddress.id);
  }, [location.state, setSelectedAddressId]);

  useEffect(() => {
    if (!selectedAddressId && addressList.length > 0) {
      setSelectedAddressId(addressList[0].id);
    }
  }, [addressList, selectedAddressId, setSelectedAddressId]);

  const handleSaveAddress = async (addressPayload) => {
    const addedAddress = await addAddress(addressPayload);
    if (addedAddress?.id) {
      setSelectedAddressId(addedAddress.id);
      setIsLocationModalOpen(false);
    }
  };

  const handleApplyCoupon = () => {
    const code = couponCode.toUpperCase().trim();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }
    if (code === 'FARM10') {
      setAppliedCoupon({ code: 'FARM10', type: 'PERCENT', value: 10, label: '10% OFF' });
      toast.success('Coupon FARM10 applied!');
    } else if (code === 'FREESHIP') {
      setAppliedCoupon({ code: 'FREESHIP', type: 'FIXED', value: 40, label: 'Free Delivery' });
      toast.success('Coupon FREESHIP applied!');
    } else {
      toast.error('Invalid coupon code. Try FARM10 or FREESHIP');
    }
  };

  const handleDecreaseQty = async (item) => {
    const currentQty = Number(item.quantity || 1);
    const nextQty = currentQty - 1;
    if (nextQty <= 0) {
      await removeFromCart(item.id);
      return;
    }
    await updateCartItem(item.id, nextQty);
  };

  const handleIncreaseQty = async (item) => {
    const currentQty = Number(item.quantity || 1);
    await updateCartItem(item.id, currentQty + 1);
  };

  const handlePlaceOrder = async () => {
    if (cartCount === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (itemTotal < 99) {
      toast.error(`Minimum order value is ₹99. Add items worth ₹${(99 - itemTotal).toFixed(2)} more.`);
      return;
    }

    if (!selectedAddressId) {
      toast.error('Please select or add a delivery address');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select a delivery option');
      return;
    }

    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    setIsSubmitting(true);

    const orderSummarySnapshot = {
      items: cartItems.map((item) => ({
        id: item.id,
        productId: item.productId || item.id,
        name: item.name,
        quantity: item.quantity,
        price: Number(item.price || 0),
        image: item.image || getProductImage(item.name, item.category)
      })),
      total: grandTotal,
      itemTotal,
      deliveryFee,
      handlingFee,
      gstAmount,
      discountAmount,
      paymentMethod,
      slot: selectedSlot,
      notes: ''
    };

    const normalizedPaymentMethod = paymentMethod === 'NETBANKING' ? 'Cards' : paymentMethod;

    try {
      const placedOrder = await placeOrder(normalizedPaymentMethod, selectedAddressId, null);
      setIsSubmitting(false);

      if (placedOrder && placedOrder.id) {
        setHasOrderPlaced(true);
        if (typeof clearCart === 'function') clearCart();
        toast.success('Order placed successfully!');

        navigate('/order-success', {
          state: {
            order: placedOrder,
            orderSummary: orderSummarySnapshot
          },
        });
      }
    } catch (err) {
      setIsSubmitting(false);
      const status = err?.response?.status;
      const message = err?.response?.data?.message || err?.message || 'Failed to place order';

      if (status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login', { state: { from: '/checkout' } });
      } else if (status === 400) {
        toast.error(`Order Error: ${message}`);
      } else {
        toast.error(`Order Failed: ${message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f7fb] pt-8 pb-8 px-3 sm:px-4 lg:px-5 font-sans">
      <div className="max-w-[1220px] mx-auto">
        <div className="mb-4">
          <h1 className="text-[26px] leading-none font-black text-slate-900">Checkout</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-700 text-white inline-flex items-center justify-center text-[11px] font-black">1</span>
              <span className="text-slate-800">Cart</span>
            </div>
            <div className="w-9 h-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-emerald-700 text-white inline-flex items-center justify-center text-[11px] font-black">2</span>
              <span className="text-slate-800">Address</span>
            </div>
            <div className="w-9 h-px bg-slate-300" />
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-full border border-slate-300 text-slate-700 inline-flex items-center justify-center text-[11px] font-black">3</span>
              <span>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[270px_minmax(0,1fr)_300px] gap-3.5 items-start">
          <section className="space-y-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-black text-slate-800">DELIVERY ADDRESS</h2>
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="text-[13px] font-bold text-emerald-700 hover:text-emerald-800"
                >
                  Change
                </button>
              </div>

              {selectedAddress ? (
                <div className="space-y-1.5 text-[13px] text-slate-700">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-extrabold text-slate-900">{selectedAddress.name || 'Delivery Address'}</p>
                      <p>{selectedAddress.line1}</p>
                      <p>{[selectedAddress.city, selectedAddress.state, selectedAddress.pincode].filter(Boolean).join(', ')}</p>
                      <p className="font-bold mt-1 text-slate-800">Phone: {selectedAddress.phone || 'Not added'}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold"
                >
                  Add Delivery Address
                </button>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[15px] font-black text-slate-800">DELIVERY OPTIONS</h2>
                <span className="text-[13px] font-bold text-emerald-700">Change</span>
              </div>

              <div className="space-y-2.5">
                {DELIVERY_OPTIONS.map((option) => {
                  const isActive = selectedSlot === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedSlot(option.id)}
                      className={`w-full rounded-xl border p-2.5 text-left transition ${
                        isActive
                          ? 'border-emerald-300 bg-emerald-50/40'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-start gap-2">
                          <span
                            className={`mt-0.5 w-4 h-4 rounded-full border inline-flex items-center justify-center ${
                              isActive ? 'border-emerald-600' : 'border-slate-300'
                            }`}
                          >
                            {isActive && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                          </span>
                          <div>
                            <p className="text-[14px] font-extrabold text-slate-900">{option.title}</p>
                            <p className="text-[13px] text-slate-500">{option.subtitle}</p>
                          </div>
                        </div>
                        <span className={`text-[15px] font-black ${option.fee === 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                          {option.feeLabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="space-y-3.5">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-200">
                <h2 className="text-[19px] font-black text-slate-900">{cartCount} ITEMS IN YOUR CART</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {cartItems.map((item) => {
                  const qty = Number(item.quantity || 1);
                  const itemPrice = Number(item.price || 0);
                  const itemImage = getProductImage(item.name, item.category, item.image);
                  return (
                    <div key={item.id} className="px-4 py-3.5">
                      <div className="flex items-center gap-3.5">
                        <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0">
                          <img src={itemImage} alt={item.name} className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[17px] font-bold text-slate-900 truncate">{item.name}</p>
                          <p className="text-[14px] text-slate-500 mt-0.5">{item.unit || '1 kg'}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-[17px] font-black text-slate-900">₹{(itemPrice * qty).toFixed(2)}</p>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="mt-1 text-slate-400 hover:text-rose-500"
                            aria-label={`Remove ${item.name}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-2.5 ml-auto w-fit flex items-center border border-slate-300 rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => handleDecreaseQty(item)}
                          className="w-9 h-8 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100"
                          aria-label={`Decrease quantity for ${item.name}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-9 h-8 inline-flex items-center justify-center text-[15px] font-black text-slate-900">{qty}</span>
                        <button
                          type="button"
                          onClick={() => handleIncreaseQty(item)}
                          className="w-9 h-8 inline-flex items-center justify-center text-slate-700 hover:bg-slate-100"
                          aria-label={`Increase quantity for ${item.name}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="px-4 py-3.5 border-t border-slate-200">
                <button
                  onClick={() => navigate('/customer')}
                  className="w-full h-10 rounded-xl border border-slate-300 bg-white text-[15px] text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Add more items
                </button>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-100 inline-flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-[18px] font-black text-slate-900">100% Safe and Secure Payments</p>
                  <p className="text-[14px] text-slate-500">Your payment details are protected with industry-standard security.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-3.5 xl:sticky xl:top-16">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h3 className="text-[19px] font-black text-slate-900 mb-3">BILL SUMMARY</h3>
              <div className="space-y-1.5 text-[15px]">
                <div className="flex justify-between text-slate-700">
                  <span>Item Total ({cartCount} items)</span>
                  <span className="font-bold">₹{itemTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Delivery Charge</span>
                  <span className={deliveryFee === 0 ? 'font-bold text-emerald-700' : 'font-bold'}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>Handling Fee</span>
                  <span className="font-bold">₹{handlingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span>GST</span>
                  <span className="font-bold">₹{gstAmount.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount</span>
                    <span className="font-bold">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-[17px] font-black text-emerald-700">TO PAY</span>
                  <span className="text-[34px] font-black text-emerald-700">₹{grandTotal.toFixed(2)}</span>
                </div>
                {savingsAmount > 0 && (
                  <p className="mt-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-[13px] font-bold px-3 py-2 text-center">
                    You will save ₹{savingsAmount.toFixed(2)} on this order
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  PROMO CODE
                </h3>
                {appliedCoupon && (
                  <button onClick={() => setAppliedCoupon(null)} className="text-[13px] font-bold text-rose-600 hover:text-rose-700">Remove</button>
                )}
              </div>

              {appliedCoupon ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-[13px] font-bold text-emerald-700">
                  {appliedCoupon.code} applied ({appliedCoupon.label})
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Apply Promo Code"
                    className="flex-1 h-10 px-3 rounded-lg border border-slate-300 text-[14px] focus:outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="h-10 px-3.5 rounded-lg border border-emerald-600 text-[14px] text-emerald-700 hover:bg-emerald-50 font-bold"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm">
              <h3 className="text-[15px] font-black text-slate-900 mb-2.5">PAYMENT OPTIONS</h3>
              <div className="space-y-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = paymentMethod === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setPaymentMethod(option.id)}
                      className="w-full flex items-center gap-3 text-left"
                    >
                      <span className={`w-4 h-4 rounded-full border inline-flex items-center justify-center ${isActive ? 'border-emerald-600' : 'border-slate-300'}`}>
                        {isActive && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                      </span>
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-500'}`} />
                      <span className="flex-1">
                        <span className="block text-[14px] font-bold text-slate-800">{option.label}</span>
                        <span className="block text-[12px] text-slate-500">{option.meta}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cartCount === 0 || !selectedAddressId}
                className={`mt-3.5 w-full h-11 rounded-xl text-[15px] font-black text-white flex items-center justify-center gap-2 ${
                  isSubmitting ? 'bg-slate-400 cursor-wait' : 'bg-emerald-700 hover:bg-emerald-800'
                } ${(!selectedAddressId || cartCount === 0) && !isSubmitting ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>PLACE ORDER</>
                )}
              </button>

              <p className="mt-2.5 text-[10px] text-slate-500 text-center">
                By placing this order, you agree to our terms and privacy policy.
              </p>
            </div>
          </section>
        </div>
      </div>

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSaveAddress={handleSaveAddress}
        savedAddresses={addresses}
        initialStep="list"
      />
    </div>
  );
};

export default Checkout;

