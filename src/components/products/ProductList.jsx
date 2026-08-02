import React from 'react';
import ProductCard from './ProductCard';

const LoadingSkeleton = () => {
  return (
    <div className="h-[240px] w-[180px] overflow-hidden rounded-[12px] border border-slate-200 bg-white">
      <div className="h-[120px] animate-pulse bg-slate-200" />
      <div className="space-y-2 p-2.5">
        <div className="h-2.5 w-16 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-200" />
        <div className="h-7 w-full animate-pulse rounded-[8px] bg-slate-200" />
      </div>
    </div>
  );
};

const EmptyState = ({ title, subtitle }) => {
  return (
    <div className="rounded-[12px] border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
      <h3 className="text-[24px] font-black text-slate-900 leading-tight">{title}</h3>
      <p className="mt-1 text-xs font-semibold text-slate-500">{subtitle}</p>
    </div>
  );
};

const Pagination = ({ page, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const pages = [];
  for (let i = 1; i <= totalPages; i += 1) {
    pages.push(i);
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="rounded-[12px] border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Previous
      </button>
      {pages.map((item) => (
        <button
          key={item}
          onClick={() => onPageChange(item)}
          className={`h-8 min-w-8 rounded-[12px] px-2.5 text-xs font-black ${
            item === page ? 'bg-[#0b78b2] text-white' : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
          }`}
        >
          {item}
        </button>
      ))}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="rounded-[12px] border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
};

const ProductList = ({
  products,
  loading,
  page,
  totalPages,
  onPageChange,
  cartQuantities,
  onAddToCart,
  onQuantityChange,
  wishlist,
  onToggleWishlist,
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[12px]">
        {Array.from({ length: 12 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <EmptyState
        title="No products found"
        subtitle="Try changing your filters or search keyword to discover fresh stock."
      />
    );
  }

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[12px]">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            quantity={cartQuantities[product.id] || 0}
            onAddToCart={onAddToCart}
            onQuantityChange={onQuantityChange}
            inWishlist={wishlist.has(product.id)}
            onToggleWishlist={onToggleWishlist}
          />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
    </section>
  );
};

export default ProductList;
