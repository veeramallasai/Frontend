import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, CheckCircle2, Store } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductDetailsModal = ({ product, isOpen, onClose, onAddToCart, onToggleWishlist, inWishlist }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen || !product) return null;

  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price * 1.25);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  const handleAdd = () => {
    onAddToCart(product, quantity);
    toast.success(`Added ${quantity} ${product.name} to your cart`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-slate-400 hover:text-slate-700 bg-white/80 backdrop-blur-md rounded-full shadow-sm"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid md:grid-cols-12 gap-0">
          
          {/* Product Image Column */}
          <div className="md:col-span-6 bg-slate-50 p-6 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
            <div className="w-full max-w-[280px] h-[280px] flex items-center justify-center">
              <img
                src={product.image}
                alt={product.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-md"
              />
            </div>
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 rounded-xl bg-indigo-600 px-3 py-1 text-xs font-black text-white">
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Product Info Column */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-black uppercase text-indigo-700">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/50">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{Number(product.rating || 4.8).toFixed(1)} Rating</span>
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h2>

              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                <span>Seller: <strong className="text-slate-800">{product.seller || 'Verified Brand Partner'}</strong></span>
              </div>

              <p className="mt-3 text-xs text-slate-600 font-medium leading-relaxed">
                {product.description || `Premium quality ${product.name} sourced directly from top verified brands. High durability, original manufacturer warranty, and quality compliance.`}
              </p>

              {/* Price Box */}
              <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-slate-400">Offer Price</span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-slate-900">₹{price}</span>
                    {originalPrice > price && (
                      <span className="text-xs font-bold text-slate-400 line-through">₹{originalPrice}</span>
                    )}
                  </div>
                </div>

                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-lg">
                  In Stock
                </span>
              </div>

              {/* Quantity Modifier */}
              <div className="mt-5 flex items-center gap-3">
                <span className="text-xs font-extrabold text-slate-700">Quantity:</span>
                <div className="flex h-9 items-center rounded-xl border border-slate-300 bg-white">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="h-full w-8 text-sm font-black text-slate-700 hover:bg-slate-100 rounded-l-xl"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-xs font-black text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="h-full w-8 text-sm font-black text-slate-700 hover:bg-slate-100 rounded-r-xl"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
              <button
                onClick={handleAdd}
                className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add {quantity} to Cart</span>
              </button>

              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                  inWishlist ? 'bg-rose-50 text-rose-500 border-rose-200' : 'bg-white text-slate-400 border-slate-200 hover:text-rose-500'
                }`}
              >
                <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
