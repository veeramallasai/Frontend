import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';

const EmptyOrders = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-[20px] border border-slate-200 p-10 text-center flex flex-col items-center justify-center space-y-3 shadow-2xs w-full">
      <div className="h-16 w-16 rounded-full bg-emerald-50 text-[#009b5a] flex items-center justify-center">
        <ShoppingBag className="h-8 w-8" />
      </div>
      <h3 className="text-xl font-black text-slate-800">No orders found</h3>
      <p className="text-xs text-slate-500 font-semibold max-w-sm">
        Your orders will appear here after you place an order. Explore fresh farm produce and start shopping!
      </p>
      <button
        type="button"
        onClick={() => navigate('/customer/shop')}
        className="mt-2 inline-flex items-center gap-2 bg-[#009b5a] hover:bg-[#00874e] text-white px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer"
      >
        Start Shopping
      </button>
    </div>
  );
};

export default EmptyOrders;
