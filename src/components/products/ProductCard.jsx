import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { defaultFallbackImage, getProductImage } from '../../utils/productImageMapper';

const ProductCard = ({
  product,
  quantity = 0,
  onAddToCart,
  onQuantityChange,
  onToggleWishlist,
  inWishlist = false,
  className = '',
}) => {
  if (!product) return null;

  // Pricing calculations
  const price = Number(product.sellingPrice ?? product.price ?? 0);
  const originalPrice = Number(product.originalPrice ?? product.marketPrice ?? product.price ?? 0);
  const discountPercent = Number(
    product.discountPercentage ?? 
    product.discount ?? 
    (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)
  );

  const preferredImage = useMemo(
    () => getProductImage(product.name || product.productName, product.category, product.imageUrl || product.image || product.imagePath),
    [product.name, product.productName, product.category, product.imageUrl, product.image, product.imagePath]
  );

  const mappedFallbackImage = useMemo(
    () => getProductImage(product.name || product.productName, product.category),
    [product.name, product.productName, product.category]
  );

  const [imageSrc, setImageSrc] = useState(preferredImage);

  useEffect(() => {
    setImageSrc(preferredImage);
  }, [preferredImage]);

  const handleImageError = () => {
    if (imageSrc !== mappedFallbackImage) {
      setImageSrc(mappedFallbackImage);
      return;
    }
    if (imageSrc !== defaultFallbackImage) {
      setImageSrc(defaultFallbackImage);
    }
  };

  const categoryName = typeof product.category === 'object' 
    ? product.category?.name || 'Fresh Produce' 
    : (product.category || 'Fresh Produce');

  const unitDisplay = product.unit ? product.unit : '500 g';
  const isOutOfStock = product.stockQuantity !== undefined && product.stockQuantity <= 0;

  return (
    <article className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition-all duration-300 hover:shadow-md hover:border-emerald-200 hover:-translate-y-1 ${className}`}>
      
      {/* Discount Badge & Wishlist Button */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        {discountPercent > 0 ? (
          <span className="pointer-events-auto rounded-lg bg-emerald-600 px-2 py-0.5 text-[11px] font-black uppercase text-white shadow-xs">
            {discountPercent}% OFF
          </span>
        ) : (
          <span className="pointer-events-auto rounded-lg bg-slate-800/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">
            Fresh
          </span>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleWishlist && onToggleWishlist(product.id);
          }}
          className={`pointer-events-auto rounded-full p-1.5 shadow-sm backdrop-blur-md transition-all ${
            inWishlist 
              ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
              : 'bg-white/90 text-slate-400 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Toggle wishlist"
          title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
        >
          <Heart
            className="h-4 w-4"
            fill={inWishlist ? 'currentColor' : 'none'}
            stroke={inWishlist ? 'none' : 'currentColor'}
          />
        </button>
      </div>

      {/* Product Image Container with contain object-fit */}
      <Link 
        to={`/catalog/${product.id}`} 
        className="relative block h-40 w-full overflow-hidden bg-slate-50/60 p-4 transition-colors group-hover:bg-emerald-50/30 flex items-center justify-center"
      >
        <img
          src={imageSrc}
          alt={product.name || product.productName || 'Fresh Product'}
          loading="lazy"
          onError={handleImageError}
          className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-100 text-rose-700 text-xs font-black px-2.5 py-1 rounded-lg">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* Card Details */}
      <div className="flex flex-col justify-between flex-1 p-3.5 pt-2">
        <div>
          <div className="mb-1 flex items-center justify-between gap-1">
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold uppercase text-emerald-800 truncate max-w-[110px]">
              {categoryName}
            </span>
            <div className="flex items-center gap-0.5 text-[11px] font-bold text-slate-700 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <span>{Number(product.rating || 4.5).toFixed(1)}</span>
            </div>
          </div>

          <Link to={`/catalog/${product.id}`} className="block group-hover:text-emerald-700 transition-colors">
            <h3 className="line-clamp-1 text-sm font-bold text-slate-900 leading-snug">
              {product.name || product.productName}
            </h3>
          </Link>

          <p className="mt-0.5 text-xs font-semibold text-slate-500">
            {unitDisplay}
          </p>
        </div>

        {/* Price & Quantity Controls */}
        <div className="mt-3 flex items-end justify-between gap-1 pt-2 border-t border-slate-100">
          <div>
            {originalPrice > price && (
              <p className="text-[11px] font-bold text-slate-400 line-through leading-none">
                ₹{originalPrice.toFixed(0)}
              </p>
            )}
            <p className="text-base font-black leading-none text-slate-900 mt-0.5">
              ₹{price.toFixed(0)}
            </p>
          </div>

          {isOutOfStock ? (
            <span className="text-[11px] font-bold text-slate-400 italic">Unavailable</span>
          ) : quantity > 0 ? (
            <div className="flex h-8 items-center overflow-hidden rounded-xl border border-emerald-600 bg-emerald-50 shadow-xs">
              <button
                onClick={() => onQuantityChange && onQuantityChange(product.id, quantity - 1)}
                className="flex h-full w-7 items-center justify-center text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-6 text-center text-xs font-black text-emerald-950">{quantity}</span>
              <button
                onClick={() => onQuantityChange && onQuantityChange(product.id, quantity + 1)}
                className="flex h-full w-7 items-center justify-center text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-colors"
                title="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart && onAddToCart(product.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-extrabold text-white shadow-xs transition-all hover:bg-emerald-700 hover:shadow-md cursor-pointer active:scale-95"
            >
              <Plus className="h-3.5 w-3.5 stroke-[3]" />
              <span>ADD</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
