import React from 'react';
import { Eye, Heart, Leaf, Minus, Plus, ShoppingCart } from 'lucide-react';
import leafyPlaceholderImg from '../assets/images/leafy-vegetables/leafy-placeholder.png';

const LeafyVegetableCard = ({
  product,
  quantity,
  inWishlist,
  onToggleWishlist,
  onViewDetails,
  onAddToCart,
  onIncreaseQuantity,
  onDecreaseQuantity
}) => {
  const isOutOfStock = Number(product.stock || 0) <= 0;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-100">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-lime-50 to-cyan-50 p-4">
        <button
          onClick={() => onToggleWishlist(product)}
          className="absolute right-3 top-3 z-10 rounded-full bg-white/90 p-2 text-slate-500 shadow transition hover:scale-105"
          aria-label={`Wishlist ${product.name}`}
        >
          <Heart
            className="h-4 w-4"
            fill={inWishlist ? '#f43f5e' : 'none'}
            stroke={inWishlist ? '#f43f5e' : 'currentColor'}
          />
        </button>

        <img
          src={product.image}
          alt={product.name}
          onError={(event) => {
            event.currentTarget.src = leafyPlaceholderImg;
          }}
          className="h-44 w-full rounded-2xl object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2 flex items-center gap-2">
          {product.organic ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-2.5 py-1 text-[11px] font-bold text-lime-800">
              <Leaf className="h-3.5 w-3.5" />
              Organic
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
              Conventional
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
              isOutOfStock ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
          </span>
        </div>

        <h3 className="text-lg font-black text-slate-900">{product.name}</h3>
        <p className="text-sm font-semibold text-slate-500">{product.localName || 'Local name unavailable'}</p>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.description}</p>

        <div className="mt-3 flex items-end justify-between">
          <p className="text-2xl font-black text-slate-900">Rs {product.price}</p>
          <p className="text-sm font-bold text-slate-500">{product.weight}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={() => onViewDetails(product)}
            className="inline-flex h-10 items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 text-xs font-extrabold text-slate-700 transition hover:bg-slate-100"
          >
            <Eye className="h-4 w-4" />
            View Details
          </button>

          {quantity > 0 ? (
            <div className="flex h-10 items-center overflow-hidden rounded-xl border border-emerald-300 bg-white">
              <button
                onClick={() => onDecreaseQuantity(product)}
                disabled={quantity <= 1}
                className="flex h-full w-9 items-center justify-center text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="flex-1 text-center text-sm font-black text-slate-900">{quantity}</span>
              <button
                onClick={() => onIncreaseQuantity(product)}
                disabled={quantity >= product.stock || isOutOfStock}
                className="flex h-full w-9 items-center justify-center text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className="inline-flex h-10 items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 text-xs font-extrabold text-white shadow transition hover:brightness-95 disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
            >
              <ShoppingCart className="h-4 w-4" />
              {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

export default LeafyVegetableCard;
