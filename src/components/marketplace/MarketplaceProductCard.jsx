import React from 'react';
import { Heart, Star, ShoppingCart, Eye, Plus, Minus, CheckCircle2 } from 'lucide-react';

const MarketplaceProductCard = ({
  product,
  quantity = 0,
  onAddToCart,
  onQuantityChange,
  onQuickView,
  onToggleWishlist,
  inWishlist = false,
}) => {
  if (!product) return null;

  const price = Number(product.price || 0);
  const originalPrice = Number(product.originalPrice || price * 1.25);
  const discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all duration-300 hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1">
      
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        {discountPercent > 0 ? (
          <span className="pointer-events-auto rounded-lg bg-indigo-600 px-2.5 py-0.5 text-[11px] font-black uppercase text-white shadow-xs">
            {discountPercent}% OFF
          </span>
        ) : (
          <span className="pointer-events-auto rounded-lg bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
            Curated
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          className={`pointer-events-auto rounded-full p-2 shadow-sm backdrop-blur-md transition-all cursor-pointer ${
            inWishlist 
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Wishlist"
        >
          <Heart className="h-4 w-4" fill={inWishlist ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Product Image Container */}
      <div 
        onClick={() => onQuickView(product)}
        className="relative block h-48 w-full overflow-hidden bg-slate-50 p-4 flex items-center justify-center cursor-pointer group-hover:bg-indigo-50/20 transition-colors"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover Quick View Overlay */}
        <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-white text-slate-900 text-xs font-black px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5 hover:scale-105 transition-transform">
            <Eye className="w-3.5 h-3.5 text-indigo-600" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Details Box */}
      <div className="flex flex-col justify-between flex-1 p-4">
        <div>
          <div className="mb-1.5 flex items-center justify-between gap-1">
            <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-indigo-700 truncate max-w-[110px]">
              {product.category || 'General'}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{Number(product.rating || 4.8).toFixed(1)}</span>
            </div>
          </div>

          <h3 
            onClick={() => onQuickView(product)}
            className="line-clamp-1 text-sm font-bold text-slate-900 leading-snug cursor-pointer group-hover:text-indigo-600 transition-colors"
          >
            {product.name}
          </h3>

          <p className="mt-1 text-xs text-slate-500 font-medium line-clamp-1">
            Seller: <span className="font-bold text-slate-700">{product.seller || 'Verified Seller'}</span>
          </p>
        </div>

        {/* Pricing & Add Button */}
        <div className="mt-4 flex items-end justify-between gap-2 pt-3 border-t border-slate-100">
          <div>
            {originalPrice > price && (
              <p className="text-[11px] font-bold text-slate-400 line-through leading-none">
                ₹{originalPrice.toFixed(0)}
              </p>
            )}
            <p className="text-lg font-black leading-none text-slate-900 mt-0.5">
              ₹{price.toFixed(0)}
            </p>
          </div>

          {quantity > 0 ? (
            <div className="flex h-8 items-center overflow-hidden rounded-xl border border-indigo-600 bg-indigo-50 shadow-xs">
              <button
                onClick={() => onQuantityChange(product.id, quantity - 1)}
                className="flex h-full w-7 items-center justify-center text-xs font-black text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-black text-indigo-950">{quantity}</span>
              <button
                onClick={() => onQuantityChange(product.id, quantity + 1)}
                className="flex h-full w-7 items-center justify-center text-xs font-black text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              className="inline-flex h-8.5 items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-extrabold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-700 cursor-pointer active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>Add</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default MarketplaceProductCard;
