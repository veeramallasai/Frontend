import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import deliveryScooterSvg from '../../assets/images/delivery-scooter-3d.svg';

const FreeDeliveryStageBanner = ({ className = '', onShopClick }) => {
  const navigate = useNavigate();

  const handleShop = () => {
    if (onShopClick) {
      onShopClick();
    } else {
      navigate('/customer/shop');
    }
  };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-rose-200/70 shadow-sm transition-all duration-300 hover:shadow-md ${className}`}
      style={{
        background: 'linear-gradient(135deg, #fff0f4 0%, #ffe4ec 45%, #fce7f3 100%)',
      }}
    >
      {/* Decorative ambient lighting glow */}
      <div className="pointer-events-none absolute -top-12 -left-12 h-40 w-40 rounded-full bg-rose-200/40 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-10 right-20 h-40 w-40 rounded-full bg-pink-300/30 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-6 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-7 gap-6">
        
        {/* LEFT CONTENT */}
        <div className="flex-1 max-w-lg text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 border border-rose-200/80 px-3 py-1 text-[11px] font-black tracking-wider text-rose-600 uppercase shadow-2xs mb-3">
            <Truck className="h-3.5 w-3.5 text-rose-500 animate-bounce" />
            <span>EXPRESS DELIVERY</span>
            <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400" />
          </div>

          {/* Title */}
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-rose-600 leading-tight">
            Free Delivery
          </h2>

          {/* Subtitle */}
          <p className="mt-1.5 text-base sm:text-lg lg:text-xl font-bold text-slate-700">
            On orders above <span className="text-rose-600 font-extrabold">₹499</span>
          </p>

          {/* Features bullet micro list */}
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 100% Fresh Guaranteed
            </span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-rose-500" /> No Coupon Required
            </span>
          </div>

          {/* Shop Now CTA Button */}
          <div className="mt-5">
            <button
              onClick={handleShop}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-rose-600 px-7 py-3 text-sm sm:text-base font-black text-white shadow-md shadow-rose-500/25 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-rose-500/35 active:scale-95 cursor-pointer"
            >
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* RIGHT 3D SCOOTER RIDER STAGE PHOTO */}
        <div className="relative w-full max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] shrink-0 flex items-center justify-center">
          <style>{`
            @keyframes scooterFloat {
              0%, 100% {
                transform: translateY(0px) rotate(0deg);
              }
              50% {
                transform: translateY(-8px) rotate(-1deg);
              }
            }
            .scooter-stage-img {
              animation: scooterFloat 4s ease-in-out infinite;
              filter: drop-shadow(0 16px 24px rgba(225, 29, 72, 0.15));
            }
          `}</style>
          
          <img
            src={deliveryScooterSvg}
            alt="Free Express Delivery Rider on Green Scooter"
            className="scooter-stage-img w-full h-auto object-contain max-h-[240px] sm:max-h-[280px]"
          />
        </div>

      </div>
    </div>
  );
};

export default FreeDeliveryStageBanner;
