import React from 'react';
import { Leaf, Mail, Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';

const MarketplaceFooter = () => {
  return (
    <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-[1340px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="font-black text-white text-xl tracking-tight">
                Farm<span className="text-emerald-400">to</span>Home
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">
              Connecting consumers directly with top verified farmers, producers, independent artisans, and local businesses worldwide. Quality guaranteed.
            </p>
          </div>

          {/* Shopper Links */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">
              Explore Marketplace
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Fresh Produce & Veggies</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Organic Fruits & Dairy</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Tech & Electronics</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Artisanal Handmade</a></li>
            </ul>
          </div>

          {/* Seller Portal */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">
              Sell on Farm to Home
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Become a Seller / Farmer</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Seller Dashboard & API</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Fulfillment by Farm to Home</a></li>
              <li><a href="#" className="hover:text-emerald-400 transition-colors">Merchant Policy</a></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 mb-4">
              Customer Priority Care
            </h4>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> 100 Innovation Parkway, Suite 400</li>
              <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400" /> +1 (800) 555-FARM</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-emerald-400" /> support@farmtohome.com</li>
            </ul>
          </div>

        </div>

        <div className="h-px bg-slate-800/80 my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between text-xs font-semibold text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Farm to Home Inc. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-indigo-400">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400">Terms of Service</a>
            <a href="#" className="hover:text-indigo-400">Security Audit</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default MarketplaceFooter;
