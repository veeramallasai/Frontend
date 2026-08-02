import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Leaf,
  Heart,
  Search,
  ShoppingBag,
  Apple,
  Sparkles,
  Plus,
  Trash2,
  ShieldCheck,
  Link as LinkIcon,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import leafyVegetables from '../../data/leafyVegetables';
import { getProductImage } from '../../utils/productImageMapper';

const LEAFY_PLACEHOLDER_IMAGE = '/src/assets/images/leafy-vegetables/leafy-placeholder.png';

const promoBanners = [
  {
    id: 'fresh-deals',
    title: 'Bite into fresh goodness',
    subText: 'Farm-fresh picks delivered in hours',
    cta: 'Shop Now',
    bg: 'from-[#ff5f1f] to-[#ff1f6b]',
  },
  {
    id: 'festive-sale',
    title: 'Festival essentials sale',
    subText: 'Up to 50% off on daily needs',
    cta: 'Explore',
    bg: 'from-[#ff9f1c] to-[#ffcf33]',
  },
  {
    id: 'clean-home',
    title: 'Removes 7-day stains',
    subText: 'Save up to 33% on household care',
    cta: 'Grab Deals',
    bg: 'from-[#00b894] to-[#00d4ff]',
  },
];

const quickCategories = [
  { id: 'all', icon: Sparkles, label: 'All Items', category: 'All' },
  { id: 'fruits', icon: Apple, label: 'Fruits', category: 'Fruit' },
  { id: 'vegetables', icon: ShoppingBag, label: 'Vegetables', category: 'Vegetables' },
  { id: 'leafy', icon: Leaf, label: 'Leafy Vegetables', category: 'Leafy Vegetables' },
];

const getStableBadge = (name) => {
  const seed = String(name || '')
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return 5 + (seed % 24);
};

const CustomerShop = () => {
  const { user } = useAuth();
  const { products = [], addToCart, toggleWishlist, wishlist = [], cart = [], updateCartItem, addProduct, deleteProduct } = useCustomer();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const isAdmin = Boolean(
    user &&
    user.role &&
    (String(user.role).toLowerCase() === 'admin' ||
      String(user.role).toLowerCase() === 'role_admin' ||
      String(user.role).toLowerCase().includes('admin'))
  );

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeCategory, setActiveCategory] = useState('All');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const bannerScrollRef = useRef(null);

  // Admin Add Material state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [imageInputMode, setImageInputMode] = useState('url'); // 'url' | 'upload'
  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    description: '',
    imageUrl: '',
    previewUrl: '',
  });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMaterial((prev) => ({
          ...prev,
          previewUrl: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!newMaterial.name.trim()) {
      toast.error('Please enter a material name');
      return;
    }
    if (!newMaterial.price || Number(newMaterial.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    const finalImage = imageInputMode === 'upload' ? newMaterial.previewUrl : newMaterial.imageUrl;

    await addProduct({
      name: newMaterial.name.trim(),
      category: newMaterial.category,
      price: Number(newMaterial.price),
      unit: newMaterial.unit,
      description: newMaterial.description,
      image: finalImage,
    });

    setIsAddModalOpen(false);
    setNewMaterial({
      name: '',
      category: 'Vegetables',
      price: '',
      unit: 'kg',
      description: '',
      imageUrl: '',
      previewUrl: '',
    });
  };

  const handlePrevBanner = () => {
    setCurrentBanner((prev) => {
      const next = prev === 0 ? promoBanners.length - 1 : prev - 1;
      if (bannerScrollRef.current) {
        const container = bannerScrollRef.current;
        container.scrollTo({ left: next * (container.clientWidth / 3), behavior: 'smooth' });
      }
      return next;
    });
  };

  const handleNextBanner = () => {
    setCurrentBanner((prev) => {
      const next = (prev + 1) % promoBanners.length;
      if (bannerScrollRef.current) {
        const container = bannerScrollRef.current;
        container.scrollTo({ left: next * (container.clientWidth / 3), behavior: 'smooth' });
      }
      return next;
    });
  };

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [searchParams]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % promoBanners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  const shopProducts = useMemo(() => {
    const nonLeafyProducts = products.filter(
      (product) => String(product.category || '').toLowerCase() !== 'leafy vegetables'
    );

    const leafyCategoryProducts = leafyVegetables.map((product) => ({
      ...product,
      id: `leafy-${product.id}`,
      category: 'Leafy Vegetables',
      unit: product.weight,
    }));

    return [...nonLeafyProducts, ...leafyCategoryProducts];
  }, [products]);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(shopProducts.map((p) => p.category).filter(Boolean)));
    return ['All', ...unique];
  }, [shopProducts]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const activeLower = activeCategory.toLowerCase();

    return shopProducts.filter((product) => {
      if (!product) return false;
      const nameMatches = String(product.name || '').toLowerCase().includes(query);
      const categoryMatches = String(product.category || '').toLowerCase().includes(query);
      const matchesSearch = !query || nameMatches || categoryMatches;

      let matchesCategory = true;
      if (activeCategory !== 'All') {
        const prodCat = String(product.category || '').toLowerCase();
        if (activeLower.includes('fruit')) {
          matchesCategory = prodCat.includes('fruit');
        } else if (activeLower.includes('leafy')) {
          matchesCategory = prodCat.includes('leafy');
        } else if (activeLower.includes('veg')) {
          matchesCategory = prodCat.includes('veg') && !prodCat.includes('leafy');
        } else {
          matchesCategory = prodCat === activeLower;
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [shopProducts, searchQuery, activeCategory]);

  const groupedProducts = useMemo(() => {
    const grouped = filteredProducts.reduce((acc, product) => {
      const key = product.category || 'Fresh Picks';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(product);
      return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  }, [filteredProducts]);

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
      return;
    }
    setSearchParams({});
  };

  const renderCartControl = (product) => {
    const cartItem = cart.find((item) => item.productId === product.id || item.id === product.id);

    if (!cartItem) {
      return (
        <button
          onClick={() => addToCart(product)}
          className="h-8 min-w-[64px] rounded-xl border border-[#14b8ff] bg-[#e6f7ff] px-4 text-sm font-bold text-[#0ea5e9] transition-colors hover:bg-[#d7f0ff]"
        >
          Add
        </button>
      );
    }

    return (
      <div className="flex h-8 items-center overflow-hidden rounded-xl border border-[#14b8ff] bg-white">
        <button
          onClick={() => updateCartItem(cartItem.id, cartItem.quantity - 1)}
          className="flex h-full w-8 items-center justify-center text-lg font-bold text-[#0ea5e9] hover:bg-[#e6f7ff]"
        >
          -
        </button>
        <span className="w-6 text-center text-xs font-bold text-slate-900">{cartItem.quantity}</span>
        <button
          onClick={() => updateCartItem(cartItem.id, cartItem.quantity + 1)}
          className="flex h-full w-8 items-center justify-center text-lg font-bold text-[#0ea5e9] hover:bg-[#e6f7ff]"
        >
          +
        </button>
      </div>
    );
  };

  const handleImageError = (productId) => {
    setImageErrors((prev) => ({
      ...prev,
      [productId]: true,
    }));
  };

  return (
    <div className="min-h-screen bg-[#eef7ff] pb-16 pt-3 lg:pt-4">
      <div className="mx-auto max-w-[1280px] px-2 sm:px-4">
        {/* Admin Privilege Banner */}
        {isAdmin && (
          <div className="mb-4 rounded-[12px] bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold leading-tight">Admin Privilege Active</h3>
                <p className="text-xs text-emerald-100 font-medium">You can add new materials or remove existing ones directly in the Customer Shop.</p>
              </div>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex shrink-0 items-center justify-center gap-1.5 h-9 rounded-lg bg-white px-4 text-xs font-black text-emerald-800 shadow-sm transition hover:bg-emerald-50 active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4 text-emerald-700" />
              Add Material to Shop
            </button>
          </div>
        )}

        {/* Quick Categories Bar */}
        <section className="mb-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {quickCategories.map(({ id, icon: Icon, label, category }) => (
            <button
              key={id}
              onClick={() => setActiveCategory(category)}
              className={`flex shrink-0 items-center gap-1.5 h-[36px] rounded-[12px] px-3.5 text-xs font-bold transition-all ${
                activeCategory === category
                  ? 'bg-[#14b8ff] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </section>

        {/* Banner Section */}
        <section className="relative mb-5 px-1 sm:px-2">
          <div
            ref={bannerScrollRef}
            className="flex gap-3 overflow-x-auto scroll-smooth py-1 px-1 md:grid md:grid-cols-3 md:overflow-visible scrollbar-none"
          >
            {promoBanners.map((banner, index) => (
              <article
                key={banner.id}
                className={`relative min-w-[240px] sm:min-w-[270px] flex-1 overflow-hidden rounded-[12px] bg-gradient-to-r ${banner.bg} p-4 pl-6 text-white shadow-xs transition-all duration-300 ${
                  index === currentBanner ? 'ring-2 ring-white/90 scale-[1.01]' : 'opacity-95'
                }`}
              >
                <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-white/80">Featured Deal</p>
                <h2 className="mb-1 max-w-[15ch] text-[18px] sm:text-[20px] font-black leading-tight text-white">{banner.title}</h2>
                <p className="mb-3 text-xs font-medium text-white/90 truncate">{banner.subText}</p>
                <button className="h-[30px] rounded-[12px] bg-white px-3 text-[11px] font-black text-slate-900 shadow-xs transition hover:bg-slate-100">
                  {banner.cta}
                </button>
              </article>
            ))}
          </div>

          <button
            onClick={handlePrevBanner}
            aria-label="Previous Banner"
            className="absolute -left-2 sm:-left-4 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 text-slate-700 transition-all hover:bg-slate-50 hover:scale-110 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleNextBanner}
            aria-label="Next Banner"
            className="absolute -right-2 sm:-right-4 top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-md border border-slate-100 text-slate-700 transition-all hover:bg-slate-50 hover:scale-110 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </section>

        {/* Search & Category Filter Section */}
        <section className="mb-4 rounded-[12px] bg-white p-3 shadow-xs border border-slate-200/60">
          <div className="mb-3 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search fruits, dairy, snacks..."
                className="h-[40px] w-full rounded-[12px] border border-slate-200 bg-slate-50 pl-10 pr-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-[#14b8ff] focus:bg-white"
              />
            </form>

            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`shrink-0 h-[36px] rounded-[12px] px-3.5 text-xs font-black transition-all ${
                    activeCategory === category
                      ? 'bg-[#14b8ff] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {groupedProducts.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <p className="text-base font-black text-slate-800">No products found</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">Try another search term or switch category.</p>
            </div>
          ) : (
            <>
              {groupedProducts.map(([section, sectionProducts]) => (
                <div key={section} className="mb-5 last:mb-0">
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-[24px] font-black text-slate-900 leading-tight">{section}</h3>
                    {activeCategory === 'All' && (
                      <button
                        onClick={() => setActiveCategory(section)}
                        className="text-[16px] font-bold text-[#14b8ff] hover:text-[#0284c7]"
                      >
                        View all
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[12px]">
                    {sectionProducts.map((product) => {
                      const inWishlist = wishlist.includes(product.id);
                      const badge = getStableBadge(product.name);
                      const hasImageError = Boolean(imageErrors[product.id]);

                      return (
                        <article
                          key={product.id}
                          className="relative w-[180px] h-[240px] shrink-0 flex flex-col justify-between overflow-hidden rounded-[12px] border border-slate-200 bg-white shadow-xs transition-all hover:shadow-md"
                        >
                          <button
                            onClick={() => toggleWishlist(product.id)}
                            className="absolute left-2 top-2 z-10 rounded-full bg-white/90 p-1 text-slate-400 shadow-xs hover:text-rose-500"
                          >
                            <Heart
                              className="h-3.5 w-3.5"
                              fill={inWishlist ? '#f43f5e' : 'none'}
                              stroke={inWishlist ? '#f43f5e' : 'currentColor'}
                            />
                          </button>

                          {/* Admin Delete Button */}
                          {isAdmin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Are you sure you want to delete "${product.name}" from the shop?`)) {
                                  deleteProduct(product.id);
                                }
                              }}
                              className="absolute right-2 top-2 z-20 rounded-full bg-rose-500 p-1.5 text-white shadow-md hover:bg-rose-600 transition-colors"
                              title="Delete Material (Admin)"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}

                          <div className="h-[120px] w-full bg-[#f9fafb] p-2">
                            <img
                              src={getProductImage(product.name, product.category, hasImageError ? '' : (product.image || product.imageUrl))}
                              alt={product.name}
                              onError={() => handleImageError(product.id)}
                              className="h-full w-full object-cover rounded-[8px]"
                            />
                          </div>

                          <div className="flex flex-col justify-between flex-1 p-2.5">
                            <div>
                              <p className="line-clamp-1 text-[15px] font-extrabold text-slate-800 leading-tight">{product.name}</p>
                              <p className="mt-0.5 text-[11px] font-semibold text-slate-500">{product.unit || '1 unit'}</p>
                            </div>

                            <div className="mt-1 flex items-center justify-between gap-1">
                              <div>
                                <p className="text-[10px] font-semibold text-slate-400 line-through">₹{Math.round(product.price * (1 + badge / 100))}</p>
                                <p className="text-[16px] font-black text-slate-900 leading-none">₹{product.price}</p>
                              </div>
                              {renderCartControl(product)}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </section>
      </div>

      {/* Admin Add Material Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                  <Plus className="h-4 w-4" />
                </div>
                <h3 className="text-lg font-black text-slate-800">Add Material to Shop</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">Material Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Fresh Alphonso Mango"
                  value={newMaterial.name}
                  onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Category</label>
                  <select
                    value={newMaterial.category}
                    onChange={(e) => setNewMaterial({ ...newMaterial, category: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-800 outline-none focus:border-emerald-500"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Leafy Vegetables">Leafy Vegetables</option>
                    <option value="Herbs & Spices">Herbs & Spices</option>
                    <option value="Organic Grains">Organic Grains</option>
                    <option value="Dairy & Eggs">Dairy & Eggs</option>
                    <option value="Others">Others</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 60"
                    value={newMaterial.price}
                    onChange={(e) => setNewMaterial({ ...newMaterial, price: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="e.g. kg, 500g, bunch"
                    value={newMaterial.unit}
                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-700 mb-1">Description</label>
                  <input
                    type="text"
                    placeholder="Fresh material summary..."
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial({ ...newMaterial, description: e.target.value })}
                    className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Image Input Options */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <label className="block text-xs font-extrabold text-slate-800">Material Image Source</label>
                
                {/* Mode Selector Tabs */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setImageInputMode('url')}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-bold transition-all ${
                      imageInputMode === 'url'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5" />
                    Image Link (URL)
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageInputMode('upload')}
                    className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-bold transition-all ${
                      imageInputMode === 'upload'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload File
                  </button>
                </div>

                {/* URL Input */}
                {imageInputMode === 'url' ? (
                  <div>
                    <input
                      type="url"
                      placeholder="Paste image web link (e.g. https://images.unsplash.com/...)"
                      value={newMaterial.imageUrl}
                      onChange={(e) => setNewMaterial({ ...newMaterial, imageUrl: e.target.value, previewUrl: e.target.value })}
                      className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                ) : (
                  /* File Upload Input */
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                    />
                  </div>
                )}

                {/* Image Preview Box */}
                {(newMaterial.previewUrl || newMaterial.imageUrl) && (
                  <div className="mt-2 flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
                    <img
                      src={newMaterial.previewUrl || newMaterial.imageUrl}
                      alt="Preview"
                      className="h-14 w-14 object-cover rounded-md border border-slate-100"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                    <div className="text-[11px] font-semibold text-slate-600">
                      Image Preview Ready
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-extrabold text-xs text-white shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add Material to Shop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerShop;
