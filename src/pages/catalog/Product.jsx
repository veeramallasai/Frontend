import React, { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import ProductList from '../../components/products/ProductList';
import { productService } from '../../services/productService';
import { useCustomer } from '../../context/CustomerContext';

const categoryOptions = ['All', 'Fruit', 'Vegetable'];

const Product = () => {
  const { cart = [], wishlist = [], addToCart, updateCartItem, toggleWishlist } = useCustomer();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [organic, setOrganic] = useState('all');

  const activeFilters = useMemo(() => ({
    page,
    pageSize: 12,
    keyword,
    category,
    minPrice,
    maxPrice,
    organic,
  }), [page, keyword, category, minPrice, maxPrice, organic]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await productService.getProducts(activeFilters);
        setProducts(response.items);
        setTotalPages(response.totalPages);
      } catch (fetchError) {
        setError(fetchError.message || 'Unable to load catalog products.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeFilters]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPage(1);
    setKeyword(searchInput.trim());
  };

  const handleFilterReset = () => {
    setKeyword('');
    setSearchInput('');
    setCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setOrganic('all');
    setPage(1);
  };

  const cartQuantities = useMemo(() => {
    return cart.reduce((acc, item) => {
      const key = String(item.productId || item.id || '');
      if (!key) return acc;
      acc[key] = Number(item.quantity || 0);
      return acc;
    }, {});
  }, [cart]);

  const wishlistSet = useMemo(() => new Set(wishlist), [wishlist]);

  const handleAddToCart = async (productId) => {
    const product = products.find((entry) => String(entry.id) === String(productId));
    if (!product) return;
    await addToCart(product, 1);
  };

  const handleQuantityChange = async (productId, quantity) => {
    const cartItem = cart.find((item) => String(item.productId || item.id) === String(productId));

    if (!cartItem) {
      if (quantity > 0) {
        const product = products.find((entry) => String(entry.id) === String(productId));
        if (product) {
          await addToCart(product, quantity);
        }
      }
      return;
    }

    await updateCartItem(cartItem.id, quantity);
  };

  const handleToggleWishlist = async (productId) => {
    await toggleWishlist(productId);
  };

  return (
    <div className="min-h-screen bg-[#f1f4f7] pb-12 pt-20">
      <div className="mx-auto w-full max-w-[1280px] px-3 sm:px-4">
        <section className="mb-4 overflow-hidden rounded-[12px] bg-gradient-to-r from-[#0b78b2] via-[#18a0d8] to-[#3ac48f] p-4 text-white shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-white/90">Farm to Home Catalog</p>
          <h1 className="mt-1 max-w-[24ch] text-[24px] font-black leading-tight">
            Fresh fruits and vegetables from local farmers
          </h1>
          <p className="mt-1 text-xs font-medium text-white/90">
            Discover hand-picked products with seasonal offers and same-day delivery support.
          </p>
        </section>

        <section className="mb-4 rounded-[12px] bg-white p-3 shadow-xs border border-slate-200/60 sm:p-4">
          <form onSubmit={handleSearchSubmit} className="mb-3 grid gap-2.5 md:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Search by name, farmer, or description"
                className="h-[40px] w-full rounded-[12px] border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#0b78b2] focus:bg-white"
              />
            </div>
            <button
              type="submit"
              className="h-[40px] rounded-[12px] bg-[#0b78b2] px-5 text-xs font-bold text-white transition hover:bg-[#095f8d]"
            >
              Search
            </button>
          </form>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-5">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Category</label>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
                className="h-[36px] w-full rounded-[12px] border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0b78b2]"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Min Price</label>
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(event) => {
                  setMinPrice(event.target.value);
                  setPage(1);
                }}
                placeholder="0"
                className="h-[36px] w-full rounded-[12px] border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0b78b2]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Max Price</label>
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(event) => {
                  setMaxPrice(event.target.value);
                  setPage(1);
                }}
                placeholder="1000"
                className="h-[36px] w-full rounded-[12px] border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0b78b2]"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500">Organic</label>
              <select
                value={organic}
                onChange={(event) => {
                  setOrganic(event.target.value);
                  setPage(1);
                }}
                className="h-[36px] w-full rounded-[12px] border border-slate-200 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#0b78b2]"
              >
                <option value="all">All</option>
                <option value="true">Organic Only</option>
                <option value="false">Non-Organic</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handleFilterReset}
                className="h-[36px] w-full rounded-[12px] border border-slate-300 bg-white px-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </section>

        {error ? (
          <div className="mb-4 rounded-[12px] border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">
            {error}
          </div>
        ) : null}

        <ProductList
          products={products}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          cartQuantities={cartQuantities}
          onAddToCart={handleAddToCart}
          onQuantityChange={handleQuantityChange}
          wishlist={wishlistSet}
          onToggleWishlist={handleToggleWishlist}
        />
      </div>
    </div>
  );
};

export default Product;
