import React from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Truck, Zap, Award, Star, Leaf } from 'lucide-react';

const MarketplaceHero = ({ onExplore, onBecomeSeller }) => {
  return (
    <section className="relative max-w-[1340px] mx-auto px-4 sm:px-6 pt-6 pb-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 shadow-xl border border-emerald-900/50">
        
        {/* Ambient Glow Effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid lg:grid-cols-12 items-center gap-8 relative z-10">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 backdrop-blur-md px-4 py-1.5 text-xs font-extrabold text-emerald-300">
              <Leaf className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span>Direct Freshness • Farm to Home Marketplace</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              The Direct Farm to Home <br />
              <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 bg-clip-text text-transparent">
                Fresh Produce & Organics
              </span>
            </h1>

            <p className="max-w-xl text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Connect directly with verified local farmers, organic growers, and fresh food producers. Enjoy daily morning harvest delivery, zero middleman markup, and 100% quality guarantee.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExplore}
                className="flex items-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold px-7 py-4 text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <span>Shop Fresh Produce</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onBecomeSeller}
                className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-6 py-4 text-sm backdrop-blur-md transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Join as Farmer / Seller</span>
              </button>
            </div>

            {/* Live Marketplace Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800/80 max-w-lg">
              <div>
                <p className="text-2xl font-black text-white">100%</p>
                <p className="text-xs text-slate-400 font-semibold">Organic & Verified</p>
              </div>
              <div>
                <p className="text-2xl font-black text-emerald-400">10K+</p>
                <p className="text-xs text-slate-400 font-semibold">Local Farmers</p>
              </div>
              <div>
                <p className="text-2xl font-black text-amber-400">Morning</p>
                <p className="text-xs text-slate-400 font-semibold">Express Shipping</p>
              </div>
            </div>

          </div>

          {/* Right Visual Floating Card Showcase */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-full max-w-[400px] aspect-square rounded-3xl bg-gradient-to-br from-emerald-950/60 to-slate-950/90 border border-emerald-500/30 p-6 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
              
              <div className="flex items-center justify-between">
                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30">
                  VERIFIED ORGANIC FARMER
                </span>
                <div className="flex items-center gap-1 text-xs text-amber-400 font-black">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>4.9 / 5.0</span>
                </div>
              </div>

              <div className="space-y-2 my-auto text-left">
                <h3 className="text-xl font-black text-white leading-snug">
                  Fresh Farm Harvested Organic Tomatoes & Vegetables
                </h3>
                <p className="text-xs text-slate-300 font-medium">
                  Direct From Organic Greenhouses • Zero Pesticides • 100% Fresh
                </p>
                <div className="pt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-black text-emerald-400">₹149</span>
                  <span className="text-xs text-slate-400 line-through">₹220</span>
                  <span className="text-xs font-extrabold text-amber-400">32% OFF</span>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Quality Verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-400" />
                  <span>Morning Harvest Dispatch</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default MarketplaceHero;
