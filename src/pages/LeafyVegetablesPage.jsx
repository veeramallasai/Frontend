import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Leaf, Sparkles } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import LeafyVegetableCard from '../components/LeafyVegetableCard';
import LeafyVegetableFilters from '../components/LeafyVegetableFilters';
import leafyVegetables from '../data/leafyVegetables';

const WISHLIST_STORAGE_KEY = 'f2h_leafy_wishlist';
const CART_STORAGE_KEY = 'f2h_leafy_cart';

const getPriceRangeMatch = (price, priceRange) => {
  if (priceRange === '0-30') return price <= 30;
  if (priceRange === '31-60') return price >= 31 && price <= 60;
  if (priceRange === '61-200') return price >= 61;
  return true;
};

const LeafyVegetablesPage = () => {
  const navigate = useNavigate();
  const { cart = [], addToCart, updateCartItem } = useCustomer();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState('all');
  const [selectedWeight, setSelectedWeight] = useState('all');
  const [availability, setAvailability] = useState('all');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistIds));
  }, [wishlistIds]);

  useEffect(() => {
    const compactCart = cart.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      unit: item.unit,
      image: item.image
    }));
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(compactCart));
  }, [cart]);

  const cartQuantityByProductId = useMemo(() => {
    return cart.reduce((acc, item) => {
      const key = String(item.productId || item.id || '');
      if (!key) return acc;
      acc[key] = Number(item.quantity || 0);
      return acc;
    }, {});
  }, [cart]);

  const weightOptions = useMemo(() => {
    return Array.from(new Set(leafyVegetables.map((product) => product.weight))).sort((a, b) =>
      a.localeCompare(b)
    );
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = leafyVegetables.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        String(product.localName || '').toLowerCase().includes(query);

      const matchesPrice = getPriceRangeMatch(product.price, priceRange);
      const matchesWeight = selectedWeight === 'all' || product.weight === selectedWeight;
      const matchesAvailability =
        availability === 'all' ||
        (availability === 'in-stock' && product.stock > 0) ||
        (availability === 'out-of-stock' && product.stock <= 0);
      const matchesOrganic = !organicOnly || product.organic;

      return matchesSearch && matchesPrice && matchesWeight && matchesAvailability && matchesOrganic;
    });

    const sorted = [...filtered];
    if (sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price);
    if (sortBy === 'name-asc') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'stock-desc') sorted.sort((a, b) => b.stock - a.stock);

    return sorted;
  }, [availability, organicOnly, priceRange, searchQuery, selectedWeight, sortBy]);

  const handleAddToCart = async (product) => {
    if (product.stock <= 0) return;

    const cartItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      weight: product.weight,
      image: product.image
    };

    console.log('Adding product to cart:', cartItem);
    await addToCart({ ...product, unit: product.weight }, 1);
  };

  const handleIncreaseQuantity = async (product) => {
    if (product.stock <= 0) return;

    const existingCartItem = cart.find((item) => String(item.productId || item.id) === String(product.id));

    if (!existingCartItem) {
      await handleAddToCart(product);
      return;
    }

    const nextQuantity = Math.min(product.stock, existingCartItem.quantity + 1);
    await updateCartItem(existingCartItem.id, nextQuantity);
  };

  const handleDecreaseQuantity = async (product) => {
    const existingCartItem = cart.find((item) => String(item.productId || item.id) === String(product.id));
    if (!existingCartItem) return;
    const nextQuantity = Math.max(1, existingCartItem.quantity - 1);
    await updateCartItem(existingCartItem.id, nextQuantity);
  };

  const handleToggleWishlist = (product) => {
    const exists = wishlistIds.includes(product.id);
    if (exists) {
      setWishlistIds((prev) => prev.filter((id) => id !== product.id));
      return;
    }

    setWishlistIds((prev) => [...prev, product.id]);
    toast.success(`${product.name} added to wishlist`);
  };

  const handleViewDetails = (product) => {
    navigate(`/leafy-vegetables/${product.id}`);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSortBy('featured');
    setPriceRange('all');
    setSelectedWeight('all');
    setAvailability('all');
    setOrganicOnly(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f2fff6] via-[#f7fcff] to-[#f5fff8] pb-14 pt-4 sm:pt-6">
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        <section className="mb-6 overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-r from-emerald-600 via-green-500 to-cyan-500 p-6 text-white shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">
                <Sparkles className="h-3.5 w-3.5" />
                New Category
              </p>
              <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Leafy Vegetables</h1>
              <p className="mt-2 max-w-[70ch] text-sm font-semibold text-white/90 sm:text-base">
                Fresh greens sourced from trusted local farmers. Healthy, colorful, and delivered with care.
              </p>
            </div>
            <div className="rounded-2xl bg-white/15 px-4 py-3 text-sm font-bold">
              <p className="inline-flex items-center gap-2">
                <Leaf className="h-4 w-4" />
                Products available: {filteredProducts.length}
              </p>
            </div>
          </div>
        </section>

        <LeafyVegetableFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          priceRange={priceRange}
          onPriceRangeChange={setPriceRange}
          selectedWeight={selectedWeight}
          onWeightChange={setSelectedWeight}
          availability={availability}
          onAvailabilityChange={setAvailability}
          organicOnly={organicOnly}
          onOrganicToggle={setOrganicOnly}
          weightOptions={weightOptions}
          onResetFilters={resetFilters}
        />

        {filteredProducts.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-dashed border-emerald-200 bg-white p-10 text-center">
            <h2 className="text-xl font-black text-slate-800">No leafy vegetables found</h2>
            <p className="mt-1 text-sm font-semibold text-slate-500">Try changing search terms or resetting filters.</p>
          </div>
        ) : (
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {filteredProducts.map((product) => (
              <LeafyVegetableCard
                key={product.id}
                product={product}
                quantity={cartQuantityByProductId[String(product.id)] || 0}
                inWishlist={wishlistIds.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onViewDetails={handleViewDetails}
                onAddToCart={handleAddToCart}
                onIncreaseQuantity={handleIncreaseQuantity}
                onDecreaseQuantity={handleDecreaseQuantity}
              />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};

export default LeafyVegetablesPage;
