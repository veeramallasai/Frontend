import React, { useEffect, useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check } from 'lucide-react';
import getProductImage from '../../utils/productImageMapper';

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const order = location.state?.order || (params.orderId ? {
    id: params.orderId,
    orderNumber: `FTH-${params.orderId}`,
    status: 'PLACED',
    totalAmount: location.state?.orderSummary?.total || 175,
    createdAt: new Date().toISOString()
  } : null);

  const orderSummary = location.state?.orderSummary;

  const displayItems = useMemo(() => {
    const summaryItems = Array.isArray(orderSummary?.items) ? orderSummary.items : [];
    if (Array.isArray(order?.items) && order.items.length > 0) {
      return order.items.map((item, index) => ({
        id: item.id || `${index}`,
        name: item.productName || item.name || `Produce Item ${index + 1}`,
        quantity: Number(item.quantity || 1),
        price: Number(item.unitPrice || item.price || 0),
        image: item.image || item.productImage || '',
        unit: item.unit || 'kg',
      }));
    }
    if (summaryItems.length > 0) {
      return summaryItems.map((item, index) => ({
        id: item.id || `${index}`,
        name: item.name || `Produce Item ${index + 1}`,
        quantity: Number(item.quantity || 1),
        price: Number(item.price || 0),
        image: item.image || '',
        unit: item.unit || 'kg',
      }));
    }
    return [
      { id: '1', name: 'Fresh Farm Produce', quantity: 1, price: 175, image: '' }
    ];
  }, [order?.items, orderSummary?.items]);

  const displayOrderNumber = useMemo(() => {
    if (order?.orderNumber) return order.orderNumber;
    if (order?.id) return `FTH-${order.id}`;
    return 'FTH-86CT3';
  }, [order?.id, order?.orderNumber]);

  const totalAmount = useMemo(() => {
    if (order?.totalAmount) return Number(order.totalAmount);
    if (orderSummary?.total) return Number(orderSummary.total);
    return displayItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [order?.totalAmount, orderSummary?.total, displayItems]);

  useEffect(() => {
    if (!order) {
      navigate('/customer');
    }
  }, [order, navigate]);

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 px-4 flex flex-col items-center justify-center font-sans">
      <div className="w-full max-w-[520px] text-center">
        
        {/* Top Green Circle Checkmark Icon */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#34c759] text-white flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20 animate-in zoom-in duration-300">
          <Check className="w-9 h-9 sm:w-11 sm:h-11 stroke-[3]" />
        </div>

        {/* Thank You Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-2">
          Thank you for your purchase
        </h1>

        {/* Delivery Subtitle */}
        <p className="text-slate-500 text-xs sm:text-sm font-semibold leading-relaxed max-w-md mx-auto mb-1">
          We've received your order and it will be delivered soon.
        </p>

        {/* Order Number */}
        <p className="text-slate-700 text-xs sm:text-sm font-extrabold mb-7">
          Your order number is <span className="font-black text-slate-900">#{displayOrderNumber}</span>
        </p>

        {/* White Order Summary Card */}
        <div className="bg-white border border-slate-200/90 rounded-[20px] shadow-sm p-5 sm:p-6 mb-8 text-left">
          <h2 className="text-base font-black text-slate-800 mb-4 pb-3 border-b border-slate-100">
            Order Summary
          </h2>

          <div className="space-y-4 mb-4 divide-y divide-slate-100/80">
            {displayItems.map((item, idx) => (
              <div key={item.id || idx} className={`flex items-center justify-between gap-3 ${idx > 0 ? 'pt-3' : ''}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 p-1 shrink-0 flex items-center justify-center">
                    <img
                      src={getProductImage(item.name, 'Vegetables', item.image)}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">{item.name}</p>
                    <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                      Qty: {item.quantity}
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm font-black text-slate-800 shrink-0">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm font-black text-slate-800">Total</span>
            <span className="text-base sm:text-lg font-black text-slate-900">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/customer/shop')}
            className="w-full sm:w-auto px-8 py-3 rounded-full border-2 border-slate-300 hover:border-slate-400 bg-white text-slate-800 text-xs sm:text-sm font-black shadow-xs transition-all hover:bg-slate-50"
          >
            Continue Shopping
          </button>

          <button
            type="button"
            onClick={() => navigate('/customer/orders')}
            className="w-full sm:w-auto px-8 py-3 rounded-full bg-[#009b5a] hover:bg-[#00874e] text-white text-xs sm:text-sm font-black shadow-md transition-all cursor-pointer"
          >
            View My Orders
          </button>
        </div>

      </div>
    </div>
  );
};

export default OrderSuccess;

