import React, { useState } from 'react';
import { 
  ShoppingBag, Search, Heart, ShoppingCart, User, Mic, MicOff, 
  Menu, X, Sparkles, Store, ShieldCheck, ChevronDown, Leaf 
} from 'lucide-react';
import toast from 'react-hot-toast';

const MarketplaceNavbar = ({
  searchQuery,
  onSearchChange,
  cartCount = 0,
  wishlistCount = 0,
  onOpenCart,
  onOpenSellerDashboard,
  activeRole = 'customer',
  onRoleChange,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Voice search is not supported in your browser.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        toast('Listening for voice search...', { icon: '🎙️' });
      };

      recognition.onresult = (e) => {
        const transcript = e.results[0][0].transcript;
        onSearchChange(transcript);
        setIsListening(false);
        toast.success(`Search query: "${transcript}"`);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs transition-all">
      {/* Top Banner Announcement */}
      <div className="bg-slate-900 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2">
        <span className="bg-indigo-500 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px] uppercase">New Arrival</span>
        <span>✨ Explore 10,000+ Curated Products Direct From Top Verified Sellers & Artisans!</span>
      </div>

      <div className="max-w-[1340px] mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-2.5 cursor-pointer">
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
                <Leaf className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 text-xl tracking-tight leading-none">
                  Farm<span className="text-emerald-600">to</span>Home
                </span>
                <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest mt-0.5">Fresh Marketplace</span>
              </div>
            </div>
          </div>

          {/* Search Bar with Voice Trigger */}
          <div className="hidden md:block flex-1 max-w-xl mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search tech, fashion, home decor, handmade goods..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full h-11 bg-slate-50 hover:bg-slate-100/80 text-slate-800 text-xs font-semibold rounded-xl py-2 pl-10 pr-10 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 border border-slate-200/80 transition-all"
              />
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                  isListening ? 'text-red-500 bg-red-50 animate-pulse' : 'text-slate-400 hover:text-indigo-600'
                }`}
                title="Voice Search"
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Right Role Switcher & Action Icons */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Role Switcher Pill */}
            <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70 text-xs font-extrabold">
              <button
                onClick={() => onRoleChange('customer')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  activeRole === 'customer' 
                    ? 'bg-white text-indigo-600 shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Shopper
              </button>
              <button
                onClick={() => onRoleChange('seller')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  activeRole === 'seller' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Seller Portal</span>
              </button>
            </div>

            {/* Wishlist Icon */}
            <button 
              className="p-2.5 rounded-xl text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors relative cursor-pointer" 
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 bg-rose-500 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl transition-all font-bold text-xs shadow-md shadow-indigo-600/20 cursor-pointer active:scale-95"
              title="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center border-2 border-indigo-600">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-extrabold">Cart</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 bg-slate-50 text-slate-800 text-xs font-semibold rounded-xl py-2 pl-9 pr-8 border border-slate-200"
            />
            <button
              type="button"
              onClick={handleVoiceSearch}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg ${
                isListening ? 'text-red-500 bg-red-50' : 'text-slate-400'
              }`}
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-xl px-4 py-4 space-y-3">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs font-extrabold">
            <button
              onClick={() => {
                onRoleChange('customer');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-lg text-center ${activeRole === 'customer' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600'}`}
            >
              Shopper Mode
            </button>
            <button
              onClick={() => {
                onRoleChange('seller');
                setIsMobileMenuOpen(false);
              }}
              className={`flex-1 py-2 rounded-lg text-center ${activeRole === 'seller' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600'}`}
            >
              Seller Mode
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default MarketplaceNavbar;
