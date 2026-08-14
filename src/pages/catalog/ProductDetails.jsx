import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Leaf, MapPin, Star, Truck, ShieldCheck, Heart, ShoppingBag, Plus, Minus, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { productService, normalizeProduct } from '../../services/productService';
import { useCustomer } from '../../context/CustomerContext';
import ProductCard from '../../components/products/ProductCard';
import toast from 'react-hot-toast';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart = [], toggleWishlist, wishlist = [] } = useCustomer();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProductAndRelated = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await productService.getProductById(id);
        const normalized = normalizeProduct(response);
        setProduct(normalized);

        // Fetch related products in same category
        try {
          const allProds = await productService.getAllActiveProducts();
          const categoryProds = allProds.filter(
            (p) => String(p.id) !== String(id) && (
              String(p.category || '').toLowerCase() === String(normalized?.category || '').toLowerCase() ||
              !normalized?.category
            )
          ).slice(0, 4);
          setRelatedProducts(categoryProds);
        } catch {
          setRelatedProducts([]);
        }
      } catch (fetchError) {
        setError(fetchError?.message || 'Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndRelated();
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    toast.success(`Added ${quantity} ${product.unit || 'item'} of ${product.name} to cart`);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="animate-pulse rounded-3xl bg-white p-6 shadow-sm border border-slate-100">
            <div className="mb-4 h-7 w-32 rounded-xl bg-slate-200" />
            <div className="grid gap-8 md:grid-cols-2">
              <div className="h-96 rounded-2xl bg-slate-100" />
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded-xl bg-slate-200" />
                <div className="h-4 w-full rounded-lg bg-slate-100" />
                <div className="h-4 w-2/3 rounded-lg bg-slate-100" />
                <div className="h-16 w-full rounded-2xl bg-slate-100" />
                <div className="h-12 w-48 rounded-xl bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-16">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center max-w-lg mx-auto">
            <p className="text-lg font-black text-red-800">{error || 'Product not available'}</p>
            <p className="text-xs text-red-600 font-medium mt-1">This product could not be found or has been removed.</p>
            <Link
              to="/customer/shop"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Customer Shop
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const price = Number(product.sellingPrice ?? product.price ?? 0);
  const originalPrice = Number(product.originalPrice ?? product.marketPrice ?? product.price ?? 0);
  const discountPercent = Number(
    product.discountPercentage ?? 
    product.discount ?? 
    (originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0)
  );

  const inWishlist = Array.isArray(wishlist) && wishlist.includes(product.id);
  const stock = Number(product.stockQuantity ?? product.stock ?? 50);

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16 pt-6">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        
        {/* Navigation Back Link */}
        <Link
          to="/customer/shop"
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to All Products</span>
        </Link>

        {/* Main Product Container */}
        <section className="overflow-hidden rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="grid gap-0 md:grid-cols-12">
            
            {/* Product Image Gallery Viewer */}
            <div className="md:col-span-5 bg-slate-50/80 p-6 sm:p-8 flex items-center justify-center relative border-b md:border-b-0 md:border-r border-slate-100">
              <div className="w-full max-w-[360px] h-[340px] sm:h-[380px] flex items-center justify-center relative">
                <img
                  src={product.imageUrl || product.imagePath || product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-md transition-transform hover:scale-105"
                />
              </div>

              {discountPercent > 0 && (
                <span className="absolute top-6 left-6 rounded-xl bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-xs">
                  {discountPercent}% OFF
                </span>
              )}

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-6 right-6 p-2.5 rounded-full shadow-sm backdrop-blur-md transition-all ${
                  inWishlist 
                    ? 'bg-rose-50 text-rose-500 hover:bg-rose-100' 
                    : 'bg-white text-slate-400 hover:text-rose-500'
                }`}
                title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart className="w-5 h-5" fill={inWishlist ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Product Meta & Purchase Actions */}
            <div className="md:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
              <div>
                {/* Badges Bar */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-xs font-black uppercase text-emerald-800">
                    {product.category || 'Fresh Harvest'}
                  </span>
                  {product.organic && (
                    <span className="inline-flex items-center gap-1 rounded-lg bg-lime-50 border border-lime-200 px-2.5 py-1 text-xs font-bold text-lime-800">
                      <Leaf className="h-3.5 w-3.5 text-lime-600" />
                      100% Organic Verified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 border border-amber-200 px-2 py-1 text-xs font-bold text-amber-800">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {Number(product.rating || 4.5).toFixed(1)} Rating
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {product.name}
                </h1>

                {/* Farmer & Location Info */}
                <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Farmer: <strong className="text-slate-800">{product.farmerName || 'Verified Regional Farmer'}</strong></span>
                  </div>
                  {product.location && (
                    <span className="text-slate-500">{product.location}</span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-4 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                  {product.description || `Freshly harvested ${product.name} sourced directly from local organic farms. Carefully inspected for peak flavor, high nutritional value, and pesticide-free quality.`}
                </p>

                {/* Harvest Date Details if available */}
                <div className="mt-4 flex items-center gap-4 py-2 px-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs font-semibold text-emerald-900">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Harvest Date: <strong>{product.harvestDate || 'Today Morning'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Est. Shelf Life: <strong>5 - 7 Days</strong></span>
                  </div>
                </div>

                {/* Price Display Box */}
                <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200/80 p-4 sm:p-5 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Special Farm Price</span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-3xl font-black text-slate-900">₹{price.toFixed(0)}</span>
                      {originalPrice > price && (
                        <span className="text-base font-bold text-slate-400 line-through">₹{originalPrice.toFixed(0)}</span>
                      )}
                      <span className="text-xs font-extrabold text-slate-500">/ {product.unit || '500 g'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-700'}`}>
                      {stock > 0 ? `In Stock (${stock} ${product.unit || 'units'})` : 'Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Quantity Modifier & Action Buttons */}
                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <div className="flex h-12 items-center overflow-hidden rounded-xl border border-slate-300 bg-white">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      className="h-full w-10 text-lg font-black text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center text-sm font-black text-slate-900">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.min(stock, prev + 1))}
                      className="h-full w-10 text-lg font-black text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={stock <= 0}
                    className="flex-1 min-w-[140px] h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={stock <= 0}
                    className="flex-1 min-w-[140px] h-12 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300"
                  >
                    <span>Buy Now</span>
                  </button>
                </div>
              </div>

              {/* Delivery Assurance Box */}
              <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>30-Minute Express Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Quality Replacement Guarantee</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* Related Products Grid */}
        {relatedProducts.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-4">
              Related Farm Products
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {relatedProducts.map((relProd) => {
                const relQuantity = cart.find((c) => c.productId === relProd.id)?.quantity || 0;
                return (
                  <ProductCard
                    key={relProd.id}
                    product={relProd}
                    quantity={relQuantity}
                    onAddToCart={() => addToCart(relProd, 1)}
                    onQuantityChange={(prodId, newQty) => {
                      const cartItem = cart.find((c) => c.productId === prodId);
                      if (cartItem) {
                        addToCart(relProd, newQty - cartItem.quantity);
                      } else {
                        addToCart(relProd, newQty);
                      }
                    }}
                    onToggleWishlist={toggleWishlist}
                    inWishlist={Array.isArray(wishlist) && wishlist.includes(relProd.id)}
                  />
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;
