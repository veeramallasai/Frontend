import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Heart, Leaf, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import leafyVegetables from '../data/leafyVegetables';
import leafyPlaceholderImg from '../assets/images/leafy-vegetables/leafy-placeholder.png';

const WISHLIST_STORAGE_KEY = 'f2h_leafy_wishlist';

const LeafyVegetableDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart = [], addToCart, updateCartItem } = useCustomer();
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const product = useMemo(
    () => leafyVegetables.find((item) => String(item.id) === String(id)),
    [id]
  );

  const cartItem = useMemo(
    () => cart.find((item) => String(item.productId || item.id) === String(id)),
    [cart, id]
  );

  const similarProducts = useMemo(() => {
    if (!product) return [];

    return leafyVegetables
      .filter((item) => item.id !== product.id)
      .sort((a, b) => {
        const sameOrganicA = a.organic === product.organic ? 0 : 1;
        const sameOrganicB = b.organic === product.organic ? 0 : 1;
        if (sameOrganicA !== sameOrganicB) return sameOrganicA - sameOrganicB;
        return Math.abs(a.price - product.price) - Math.abs(b.price - product.price);
      })
      .slice(0, 4);
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#f5f8fb] pt-8">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
          <div className="rounded-3xl border border-rose-200 bg-rose-50 p-8 text-center">
            <p className="text-lg font-black text-rose-700">Leafy vegetable not found</p>
            <Link
              to="/leafy-vegetables"
              className="mt-4 inline-flex rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white"
            >
              Back to Leafy Vegetables
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = async () => {
    if (product.stock <= 0) return;

    const cartPayload = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      weight: product.weight,
      image: product.image
    };

    console.log('Adding product to cart:', cartPayload);
    await addToCart({ ...product, unit: product.weight }, 1);
  };

  const handleIncreaseQuantity = async () => {
    if (product.stock <= 0) return;

    if (!cartItem) {
      await handleAddToCart();
      return;
    }

    const nextQuantity = Math.min(product.stock, cartItem.quantity + 1);
    await updateCartItem(cartItem.id, nextQuantity);
  };

  const handleDecreaseQuantity = async () => {
    if (!cartItem) return;
    const nextQuantity = Math.max(1, cartItem.quantity - 1);
    await updateCartItem(cartItem.id, nextQuantity);
  };

  const toggleWishlist = () => {
    const exists = wishlistIds.includes(product.id);
    const next = exists
      ? wishlistIds.filter((itemId) => itemId !== product.id)
      : [...wishlistIds, product.id];

    setWishlistIds(next);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(next));

    if (!exists) {
      toast.success(`${product.name} added to wishlist`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2fff7] via-[#f8fcff] to-[#f4fff8] pb-14 pt-4 sm:pt-6">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6">
        <button
          onClick={() => navigate('/leafy-vegetables')}
          className="mb-5 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Leafy Vegetables
        </button>

        <section className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-sm">
          <div className="grid gap-0 md:grid-cols-2">
            <div className="bg-gradient-to-br from-emerald-50 via-lime-50 to-cyan-50 p-6">
              <img
                src={product.image}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = leafyPlaceholderImg;
                }}
                className="h-[360px] w-full rounded-2xl object-cover shadow"
              />
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                {product.organic ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-800">
                    <Leaf className="h-3.5 w-3.5" />
                    Organic
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Conventional</span>
                )}
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    product.stock > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>

              <h1 className="text-3xl font-black text-slate-900">{product.name}</h1>
              <p className="mt-1 text-base font-bold text-slate-500">{product.localName}</p>
              <p className="mt-4 text-sm leading-6 text-slate-700">{product.description}</p>

              <div className="mt-6 rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Price</p>
                <div className="mt-1 flex items-end justify-between gap-3">
                  <p className="text-3xl font-black text-slate-900">Rs {product.price}</p>
                  <p className="text-sm font-semibold text-slate-500">{product.weight}</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  onClick={toggleWishlist}
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold text-slate-700"
                >
                  <Heart
                    className="h-4 w-4"
                    fill={wishlistIds.includes(product.id) ? '#f43f5e' : 'none'}
                    stroke={wishlistIds.includes(product.id) ? '#f43f5e' : 'currentColor'}
                  />
                  Wishlist
                </button>

                {quantity > 0 ? (
                  <div className="flex h-11 items-center overflow-hidden rounded-xl border border-emerald-300 bg-white">
                    <button
                      onClick={handleDecreaseQuantity}
                      disabled={quantity <= 1}
                      className="flex h-full w-10 items-center justify-center text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-base font-black text-slate-900">{quantity}</span>
                    <button
                      onClick={handleIncreaseQuantity}
                      disabled={quantity >= product.stock || product.stock <= 0}
                      className="flex h-full w-10 items-center justify-center text-emerald-700 hover:bg-emerald-50 disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-6 text-sm font-bold text-white disabled:cursor-not-allowed disabled:from-slate-300 disabled:to-slate-300"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-600">Stock available: {product.stock}</p>
            </div>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-900">Similar Leafy Vegetables</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {similarProducts.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/leafy-vegetables/${item.id}`)}
                className="overflow-hidden rounded-2xl border border-emerald-100 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  onError={(event) => {
                    event.currentTarget.src =
                      '/src/assets/images/leafy-vegetables/leafy-placeholder.png';
                  }}
                  className="h-36 w-full object-cover"
                />
                <div className="p-3">
                  <p className="text-sm font-black text-slate-800">{item.name}</p>
                  <p className="text-xs font-semibold text-slate-500">{item.localName}</p>
                  <p className="mt-1 text-sm font-black text-emerald-700">Rs {item.price}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default LeafyVegetableDetailsPage;
