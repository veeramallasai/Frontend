import React, { useMemo, useState } from 'react';
import { ChevronRight, ShoppingBag, X } from 'lucide-react';

const fallbackCoupons = [
  {
    id: 'vacuum5',
    title: 'Use code: VACUUM5*',
    code: 'VACUUM5',
    description: 'Use code: VACUUM5, get flat 5% off on Vacuum cleaners*',
  },
  {
    id: 'rain5',
    title: 'Use code: RAIN5*',
    code: 'RAIN5',
    description: '*Get 5% Upto 1500 Off on Washing Machines',
  },
  {
    id: 'dyson5',
    title: 'Use code: DYSON5*',
    code: 'DYSON5',
    description: 'Use code: DYSON5, save 5% on selected cleaning products*',
  },
];

const CouponModal = ({ isOpen, onClose, coupons = fallbackCoupons, onApplyCoupon }) => {
  const [couponQuery, setCouponQuery] = useState('');

  const filteredCoupons = useMemo(() => {
    const query = couponQuery.trim().toLowerCase();

    if (!query) {
      return coupons;
    }

    return coupons.filter((coupon) => {
      return String(coupon.code || '').toLowerCase().includes(query);
    });
  }, [coupons, couponQuery]);

  const selectedCoupon = useMemo(() => {
    const query = couponQuery.trim().toUpperCase();
    return coupons.find((coupon) => String(coupon.code || '').toUpperCase() === query);
  }, [coupons, couponQuery]);

  const handleApplyFromInput = () => {
    if (!selectedCoupon || !onApplyCoupon) {
      return;
    }

    onApplyCoupon(selectedCoupon.code);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] bg-slate-900/45 backdrop-blur-[1px] flex items-end sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-[480px] h-[88vh] sm:h-[84vh] bg-[#f3f4f6] rounded-t-[24px] sm:rounded-[24px] shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        <div className="px-4 pt-4 pb-3 bg-white border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-[#f4f5f6] rounded-full px-4 py-3 flex items-center gap-3">
              <input
                type="text"
                value={couponQuery}
                onChange={(event) => setCouponQuery(event.target.value.toUpperCase())}
                placeholder="TYPE COUPON CODE HERE"
                className="w-full text-[14px] font-bold text-slate-700 placeholder-slate-400 bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={handleApplyFromInput}
                disabled={!selectedCoupon}
                className="text-[32px] leading-none text-slate-500 disabled:text-slate-300"
                aria-label="Apply coupon"
              >
                &gt;
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[#1e3a8a] hover:bg-slate-100 transition-colors"
              aria-label="Close coupons"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredCoupons.map((coupon) => (
            <div key={coupon.id} className="bg-white rounded-[20px] border border-slate-100 overflow-hidden shadow-sm">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-[15px] leading-tight text-slate-700 font-extrabold tracking-wide">{coupon.title}</h3>
                    <p className="text-[13px] font-semibold text-[#1e3a8a] mt-0.5">Use Code {coupon.code}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 mt-1" />
              </div>

              <div className="px-4 pb-3 text-[11px] font-semibold text-slate-400">{coupon.description}</div>

              <button
                type="button"
                onClick={() => onApplyCoupon?.(coupon.code)}
                className="w-full py-3 border-t border-slate-100 text-[13px] font-bold text-slate-300 hover:text-[#0078ad] transition-colors"
              >
                Apply
              </button>
            </div>
          ))}

          {!filteredCoupons.length && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 text-center text-sm font-bold text-slate-500">
              No matching coupons found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CouponModal;
