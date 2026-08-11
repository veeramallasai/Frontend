import React from 'react';

const OrdersSkeleton = () => {
  return (
    <div className="space-y-3 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-[16px] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 flex-1">
            <div className="h-16 w-16 rounded-xl orders-skeleton shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-32 orders-skeleton" />
              <div className="h-3 w-24 orders-skeleton" />
              <div className="h-4 w-20 orders-skeleton" />
            </div>
          </div>
          <div className="space-y-2 text-right shrink-0">
            <div className="h-6 w-20 orders-skeleton rounded-full" />
            <div className="h-3 w-28 orders-skeleton" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrdersSkeleton;
