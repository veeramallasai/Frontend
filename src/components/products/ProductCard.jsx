import React, { useEffect, useMemo, useState } from 'react';
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { defaultFallbackImage, getProductImage } from '../../utils/productImageMapper';

const ProductCard = ({
  product,
  quantity,
  onAddToCart,
  onQuantityChange,
  onToggleWishlist,
  inWishlist,
}) => {
  const discountedPrice = Number((product.price * (1 - product.discount / 100)).toFixed(2));
  const preferredImage = useMemo(
    () => getProductImage(product.name, product.category, product.imageUrl || product.image),
    [product.name, product.category, product.imageUrl, product.image]
  );
  const mappedFallbackImage = useMemo(
    () => getProductImage(product.name, product.category),
    [product.name, product.category]
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

  return (
    <article className="group relative flex flex-col justify-between overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md w-[180px] h-[240px] shrink-0">
      <button
        onClick={() => onToggleWishlist(product.id)}
        className="absolute left-2 top-2 z-10 rounded-full bg-white/90 p-1 text-slate-500 shadow transition hover:text-rose-500"
        aria-label="Toggle wishlist"
      >
        <Heart
          className="h-3.5 w-3.5"
          fill={inWishlist ? '#f43f5e' : 'none'}
          stroke={inWishlist ? '#f43f5e' : 'currentColor'}
        />
      </button>

      <div className="h-[120px] w-full overflow-hidden bg-gradient-to-br from-[#f2fbff] to-[#fff8ef] p-2">
        <img
          src={imageSrc}
          alt={product.name}
          loading="lazy"
          onError={handleImageError}
          className="h-full w-full rounded-[8px] object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-col justify-between flex-1 p-2.5">
        <div>
          <div className="mb-1 flex items-center justify-between gap-1">
            <span className="rounded-full bg-[#ecf8ff] px-2 py-0.5 text-[10px] font-bold uppercase text-[#0b78b2] truncate max-w-[90px]">
              {typeof product.category === 'object' ? product.category?.name || 'Vegetables' : (product.category || 'Vegetables')}
            </span>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              {product.discount}% OFF
            </span>
          </div>

          <h3 className="line-clamp-1 text-[15px] font-extrabold text-slate-900 leading-tight">{product.name}</h3>

          <div className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {product.rating.toFixed(1)}
            <span className="text-slate-300">•</span>
            {product.unit}
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between gap-1">
          <div>
            <p className="text-[10px] font-semibold text-slate-400 line-through">₹{product.price.toFixed(0)}</p>
            <p className="text-[16px] font-black leading-none text-slate-900">₹{discountedPrice.toFixed(0)}</p>
          </div>
          {quantity > 0 ? (
            <div className="flex h-7 items-center overflow-hidden rounded-[8px] border border-[#0b78b2]">
              <button
                onClick={() => onQuantityChange(product.id, quantity - 1)}
                className="h-full w-6 text-xs font-black text-[#0b78b2] transition hover:bg-[#e8f6ff]"
              >
                -
              </button>
              <span className="w-5 text-center text-xs font-bold text-slate-900">{quantity}</span>
              <button
                onClick={() => onQuantityChange(product.id, quantity + 1)}
                className="h-full w-6 text-xs font-black text-[#0b78b2] transition hover:bg-[#e8f6ff]"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product.id)}
              className="inline-flex h-7 items-center gap-1 rounded-[8px] bg-[#0b78b2] px-2.5 text-xs font-bold text-white transition hover:bg-[#095f8d]"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
