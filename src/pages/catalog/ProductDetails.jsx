import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Leaf, MapPin, Star } from 'lucide-react';
import { productService } from '../../services/productService';
import { useCustomer } from '../../context/CustomerContext';
import { getProductImage } from '../../utils/productImageMapper';

const ProductDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCustomer();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await productService.getProductById(id);
        setProduct(response);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f1f4f7] pt-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="animate-pulse rounded-3xl bg-white p-6 shadow-sm">
            <div className="mb-4 h-7 w-1/3 rounded bg-slate-200" />
            <div className="grid gap-6 md:grid-cols-2">
              <div className="h-80 rounded-2xl bg-slate-200" />
              <div className="space-y-4">
                <div className="h-6 w-3/4 rounded bg-slate-200" />
                <div className="h-4 w-full rounded bg-slate-200" />
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-11 w-40 rounded bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f1f4f7] pt-24">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-lg font-bold text-red-700">{error || 'Product not available'}</p>
            <Link
              to="/catalog"
              className="mt-4 inline-flex rounded-xl bg-[#0b78b2] px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const discountedPrice = Number((product.price * (1 - product.discount / 100)).toFixed(2));

  return (
    <div className="min-h-screen bg-[#f1f4f7] pb-14 pt-24">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <Link
          to="/catalog"
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Catalog
        </Link>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="bg-gradient-to-br from-[#e9f8ff] to-[#fff3e8] p-6">
              <img
                src={getProductImage(product.name, product.category, product.imageUrl || product.image)}
                alt={product.name}
                className="h-[360px] w-full rounded-2xl object-cover shadow"
              />
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#ecf8ff] px-3 py-1 text-xs font-bold text-[#0b78b2]">
                  {typeof product.category === 'object' ? product.category?.name || product.category?.slug || 'Vegetables' : (product.category || 'Vegetables')}
                </span>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">{product.discount}% OFF</span>
                {product.organic ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-800">
                    <Leaf className="h-3.5 w-3.5" />
                    Organic
                  </span>
                ) : null}
              </div>

              <h1 className="text-3xl font-black text-slate-900">{product.name}</h1>

              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {product.rating.toFixed(1)} rating
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <MapPin className="h-4 w-4 text-slate-500" />
                {product.farmerName} - {product.location}
              </div>

              <p className="mt-4 text-sm leading-6 text-slate-700">{product.description}</p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
                <div className="mt-1 flex items-end gap-3">
                  <p className="text-3xl font-black text-slate-900">Rs {discountedPrice.toFixed(2)}</p>
                  <p className="text-sm font-semibold text-slate-400 line-through">Rs {product.price.toFixed(2)}</p>
                </div>
                <p className="mt-1 text-sm font-semibold text-emerald-700">You save Rs {(product.price - discountedPrice).toFixed(2)} per {product.unit}</p>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex h-11 items-center overflow-hidden rounded-xl border border-slate-300 bg-white">
                  <button
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="h-full w-10 text-xl font-black text-slate-700 hover:bg-slate-50"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-base font-black text-slate-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity((prev) => Math.min(product.stockQuantity, prev + 1))}
                    className="h-full w-10 text-xl font-black text-slate-700 hover:bg-slate-50"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  className="h-11 rounded-xl bg-[#0b78b2] px-6 text-sm font-bold text-white transition hover:bg-[#095f8d]"
                >
                  Add {quantity} to Cart
                </button>
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-600">Stock available: {product.stockQuantity} {product.unit}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProductDetails;
