import React, { useState } from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';

const OrdersFilterModal = ({ isOpen, onClose, onApplyFilters, onClearFilters }) => {
  const [status, setStatus] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState('ALL');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  if (!isOpen) return null;

  const handleApply = (e) => {
    e.preventDefault();
    onApplyFilters({
      status,
      paymentMethod,
      minAmount: minAmount ? Number(minAmount) : null,
      maxAmount: maxAmount ? Number(maxAmount) : null,
    });
    onClose();
  };

  const handleReset = () => {
    setStatus('ALL');
    setPaymentMethod('ALL');
    setMinAmount('');
    setMaxAmount('');
    onClearFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-[24px] max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#009b5a]" />
            <h3 className="text-base font-black text-slate-800">Filter Orders</h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleApply} className="space-y-4">
          {/* Order Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Packed">Packed</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">All Payment Methods</option>
              <option value="UPI">UPI</option>
              <option value="Cards">Credit / Debit Cards</option>
              <option value="NetBanking">Net Banking</option>
              <option value="COD">Cash on Delivery</option>
            </select>
          </div>

          {/* Amount Range */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Order Amount Range (₹)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Min ₹"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#009b5a] hover:bg-[#00874e] text-white text-xs font-black shadow-md cursor-pointer"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrdersFilterModal;
