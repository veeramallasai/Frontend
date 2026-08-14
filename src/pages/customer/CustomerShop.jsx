import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Leaf,
  Heart,
  Search,
  ShoppingBag,
  ShoppingCart,
  Apple,
  Sparkles,
  SlidersHorizontal,
  Gift,
  Package,
  MapPin,
  Bell,
  LifeBuoy,
  Settings,
  Plus,
  Trash2,
  ShieldCheck,
  Link as LinkIcon,
  Upload,
  X,
  Menu,
  Image as ImageIcon,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCustomer } from '../../context/CustomerContext';
import { useAuth } from '../../context/AuthContext';
import { productService, resolveImageUrl, FALLBACK_IMAGE } from '../../services/productService';
import { getProductImage } from '../../utils/productImageMapper';
import PromoBannersStage from '../../components/common/PromoBannersStage';
import CustomerSidebar from '../../components/layout/CustomerSidebar';
import {
  aiFruitBasket,
  aiVegBasket,
  catDairyAi,
  catGroceriesAi,
  catGrainsAi,
  catBeveragesAi,
  catDryfruitsAi,
  catSnacksAi,
} from '../../assets/images/aiImageAssets';
import cabbageImg from '../../assets/images/cabbage.png';
import leafyPlaceholderImg from '../../assets/images/leafy-vegetables/leafy-placeholder.png';
import './CustomerShop.css';

const LEAFY_PLACEHOLDER_IMAGE = leafyPlaceholderImg;

const IMAGE_DIMENSIONS = {
  heroBanner: { width: 1600, height: 900 },
  dashboardBanner: { width: 1400, height: 600 },
  productCard: { width: 400, height: 400 },
  categoryCard: { width: 300, height: 300 },
  customerProfile: { width: 200, height: 200 },
};

const withImageSize = (url, size) => {
  if (!url || typeof url !== 'string' || !size) return url;
  if (url.startsWith('/') || url.startsWith('data:')) return url;

  try {
    const parsed = new URL(url);
    parsed.searchParams.set('w', String(size.width));
    parsed.searchParams.set('h', String(size.height));
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('q', '85');
    return parsed.toString();
  } catch {
    return url;
  }
};

const promoBanners = [
  {
    id: 'fresh-deals',
    title: 'Big Savings on',
    subTitle: 'Fresh Fruits',
    subText: 'Up to 30% OFF',
    cta: 'Shop Now',
    accent: 'customer-shop-banner-accent-fresh',
    artImage: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=720&q=80',
    cardClass: 'customer-shop-banner-fresh',
    buttonClass: 'customer-shop-banner-btn customer-shop-banner-btn-fresh',
  },
  {
    id: 'festive-sale',
    title: 'Weekend Special',
    subTitle: 'Vegetables Combo',
    subText: 'Up to 25% OFF',
    cta: 'Shop Now',
    accent: 'customer-shop-banner-accent-veg',
    artImage: 'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=560&q=80',
    cardClass: 'customer-shop-banner-veg',
    buttonClass: 'customer-shop-banner-btn customer-shop-banner-btn-veg',
  },
  {
    id: 'clean-home',
    title: 'Free Delivery',
    subTitle: 'On orders above ₹499',
    subText: '',
    cta: 'Shop Now',
    accent: 'customer-shop-banner-accent-delivery',
    artImage: 'https://images.unsplash.com/photo-1622037022824-0c71d511ef3c?auto=format&fit=crop&w=900&q=80',
    cardClass: 'customer-shop-banner-delivery',
    buttonClass: 'customer-shop-banner-btn customer-shop-banner-btn-delivery',
  },
];

const quickCategories = [
  { id: 'all', icon: Grid3X3, label: 'All Items', category: 'All' },
  { id: 'fruits', icon: Apple, label: 'Fruits', category: 'Fruit', image: aiFruitBasket },
  { id: 'vegetables', icon: ShoppingBag, label: 'Vegetables', category: 'Vegetables', image: aiVegBasket },
  { id: 'leafy', icon: Leaf, label: 'Leafy Vegetables', category: 'Leafy Vegetables', image: cabbageImg },
  { id: 'dairy', icon: Sparkles, label: 'Dairy & Eggs', category: 'Dairy Products', image: catDairyAi },
  { id: 'groceries', icon: Sparkles, label: 'Groceries', category: 'Groceries', image: catGroceriesAi },
  { id: 'grains', icon: Sparkles, label: 'Pulses & Grains', category: 'Grains and Rice', image: catGrainsAi },
  { id: 'beverages', icon: Sparkles, label: 'Beverages', category: 'Beverages', image: catBeveragesAi },
  { id: 'dry-fruits', icon: Sparkles, label: 'Dry Fruits', category: 'Dry Fruits and Nuts', image: catDryfruitsAi },
  { id: 'snacks', icon: Sparkles, label: 'Snacks', category: 'Snacks', image: catSnacksAi },
];

const sidebarMenuItems = [
  { id: 'shop', label: 'Shop', icon: ShoppingBag, action: 'reset' },
  { id: 'categories', label: 'Categories', icon: Grid3X3, action: 'scroll-categories' },
  { id: 'fruits', label: 'Fruits', icon: Apple, action: 'category', value: 'Fruit' },
  { id: 'vegetables', label: 'Vegetables', icon: Leaf, action: 'category', value: 'Vegetables' },
  { id: 'leafy', label: 'Leafy Vegetables', icon: Leaf, action: 'category', value: 'Leafy Vegetables' },
  { id: 'dairy', label: 'Dairy & Eggs', icon: Sparkles, action: 'category', value: 'Dairy Products' },
  { id: 'groceries', label: 'Groceries', icon: Package, action: 'category', value: 'Groceries' },
  { id: 'offers', label: 'Offers & Coupons', icon: Gift, action: 'discount' },
  { id: 'orders', label: 'My Orders', icon: Package, action: 'coming-soon' },
  { id: 'wishlist', label: 'My Wishlist', icon: Heart, action: 'coming-soon' },
  { id: 'cart', label: 'My Cart', icon: ShoppingBag, badge: 3, action: 'coming-soon' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, action: 'coming-soon' },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5, action: 'coming-soon' },
  { id: 'support', label: 'Support', icon: LifeBuoy, action: 'coming-soon' },
  { id: 'settings', label: 'Settings', icon: Settings, action: 'coming-soon' },
];

const QUICK_CATEGORY_KEYWORDS = {
  'dairy products': ['dairy', 'egg', 'eggs', 'milk', 'paneer', 'curd', 'yogurt', 'cheese', 'butter', 'ghee'],
  groceries: ['grocery', 'staple', 'atta', 'flour', 'oil', 'salt', 'sugar', 'masala', 'spice'],
  'grains and rice': ['grain', 'grains', 'rice', 'dal', 'dals', 'pulse', 'pulses', 'lentil', 'millet'],
  beverages: ['beverage', 'beverages', 'juice', 'drink', 'drinks', 'tea', 'coffee'],
  'dry fruits and nuts': ['dry fruit', 'dry fruits', 'nut', 'nuts', 'almond', 'cashew', 'pista', 'walnut', 'raisin', 'date', 'dates'],
  snacks: ['snack', 'snacks', 'chips', 'namkeen', 'biscuit', 'biscuits', 'cookie', 'cookies'],
};

const getStableBadge = (name) => {
  const seed = String(name || '')
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return 5 + (seed % 24);
};

const CustomerShop = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist, wishlist = [], cart = [], updateCartItem, addProduct, deleteProduct } = useCustomer();
  const [searchParams, setSearchParams] = useSearchParams();

  const isAdmin = Boolean(
    user &&
    user.role &&
    (String(user.role).toLowerCase() === 'admin' ||
      String(user.role).toLowerCase() === 'role_admin' ||
      String(user.role).toLowerCase().includes('admin'))
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [quickSort, setQuickSort] = useState('all');
  const [priceSort, setPriceSort] = useState('none');
  const [sortBy, setSortBy] = useState('relevance');
  const [currentBanner, setCurrentBanner] = useState(0);
  const [imageErrors, setImageErrors] = useState({});
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [isCatalogLoading, setIsCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState('');
  const [activeSidebarItem, setActiveSidebarItem] = useState('shop');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const bannerScrollRef = useRef(null);
  const categoriesSectionRef = useRef(null);
  const productsSectionRef = useRef(null);

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
    if (searchParams.toString()) {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const loadCatalogProducts = async () => {
    setIsCatalogLoading(true);
    setCatalogError('');
    setImageErrors({});

    try {
      const products = await productService.getAllActiveProducts();
      if (Array.isArray(products) && products.length > 0) {
        setCatalogProducts(products);
      } else {
        const fallback = await productService.getAllActiveProducts();
        setCatalogProducts(Array.isArray(fallback) ? fallback : []);
      }
    } catch (error) {
      console.warn('Network error encountered when loading products:', error?.message);
      // Fallback gracefully so the UI renders clean products
      try {
        const fallback = await productService.getAllActiveProducts();
        setCatalogProducts(Array.isArray(fallback) ? fallback : []);
      } catch {
        setCatalogError('');
      }
    } finally {
      setIsCatalogLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % promoBanners.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    loadCatalogProducts();

    const handleProductsChanged = () => {
      loadCatalogProducts();
    };

    window.addEventListener('admin_products_changed', handleProductsChanged);
    return () => {
      window.removeEventListener('admin_products_changed', handleProductsChanged);
    };
  }, []);

  const shopProducts = useMemo(() => catalogProducts, [catalogProducts]);
  const hasCatalogProducts = shopProducts.length > 0;

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
        const prodName = String(product.name || '').toLowerCase();
        if (activeLower.includes('fruit')) {
          matchesCategory = prodCat.includes('fruit');
        } else if (activeLower.includes('leafy')) {
          matchesCategory = prodCat.includes('leafy');
        } else if (activeLower.includes('veg')) {
          matchesCategory = prodCat.includes('veg') && !prodCat.includes('leafy');
        } else if (QUICK_CATEGORY_KEYWORDS[activeLower]) {
          const keywords = QUICK_CATEGORY_KEYWORDS[activeLower];
          matchesCategory = keywords.some((keyword) => prodCat.includes(keyword) || prodName.includes(keyword));
        } else {
          matchesCategory = prodCat === activeLower;
        }
      }

      return matchesSearch && matchesCategory;
    });
  }, [shopProducts, searchQuery, activeCategory]);

  const displayProducts = useMemo(() => {
    const products = [...filteredProducts];

    const getDiscountPercent = (product) => {
      const originalPrice = Number(product.originalPrice ?? product.marketPrice ?? product.price ?? 0);
      const sellingPrice = Number(product.sellingPrice ?? product.price ?? 0);
      if (originalPrice <= 0) return Number(product.discount ?? 0);
      return Math.max(0, Math.round((1 - (sellingPrice / originalPrice)) * 100));
    };

    if (quickSort === 'best') {
      products.sort((a, b) => Number(b.totalSold ?? b.orderCount ?? b.salesCount ?? 0) - Number(a.totalSold ?? a.orderCount ?? a.salesCount ?? 0));
    } else if (quickSort === 'new') {
      products.sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime());
    } else if (quickSort === 'discount') {
      products.sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a));
    }

    if (priceSort === 'low-high') {
      products.sort((a, b) => Number(a.sellingPrice ?? a.price ?? 0) - Number(b.sellingPrice ?? b.price ?? 0));
    } else if (priceSort === 'high-low') {
      products.sort((a, b) => Number(b.sellingPrice ?? b.price ?? 0) - Number(a.sellingPrice ?? a.price ?? 0));
    }

    if (sortBy === 'name') {
      products.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
    }

    return products;
  }, [filteredProducts, quickSort, priceSort, sortBy]);

  const groupedProducts = useMemo(() => {
    const grouped = displayProducts.reduce((acc, product) => {
      const key = product.category || 'Fresh Picks';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(product);
      return acc;
    }, {});

    return Object.entries(grouped).sort((a, b) => b[1].length - a[1].length);
  }, [displayProducts]);

  const clearFilters = () => {
    setActiveCategory('All');
    setSearchQuery('');
    setSearchParams({});
  };

  const handleCategorySelect = (category) => {
    if (category === 'All') {
      clearFilters();
      return;
    }

    setActiveCategory(category);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    setSearchQuery((currentQuery) => currentQuery.trim());
  };

  const handleSidebarAction = (item) => {
    setActiveSidebarItem(item.id);

    if (item.action === 'reset') {
      clearFilters();
      setQuickSort('all');
      setPriceSort('none');
      setSortBy('relevance');
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (item.action === 'scroll-categories') {
      categoriesSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (item.action === 'category' && item.value) {
      setActiveCategory(item.value);
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (item.action === 'discount') {
      setQuickSort('discount');
      productsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    if (item.id === 'dashboard') {
      navigate('/dashboard');
      return;
    }

    if (item.id === 'cart' || item.action === 'cart') {
      navigate('/cart');
      return;
    }

    if (item.id === 'orders' || item.action === 'orders') {
      navigate('/customer/orders');
      return;
    }

    if (item.id === 'wishlist' || item.action === 'wishlist') {
      navigate('/customer/profile?tab=wishlist');
      return;
    }

    if (item.id === 'addresses' || item.action === 'addresses') {
      navigate('/customer/profile?tab=addresses');
      return;
    }

    if (item.id === 'support' || item.action === 'support') {
      navigate('/customer/profile?tab=help');
      return;
    }

    toast('This section will be available soon.');
  };

  const renderCartControl = (product) => {
    if (!product) return null;
    const availableStock = Number(product.stockQuantity ?? product.stock ?? product.availableStock ?? 50);
    const cartItem = Array.isArray(cart) ? cart.find((item) => item?.productId === product.id || item?.id === product.id) : null;

    if (availableStock <= 0) {
      return (
        <span className="inline-flex h-8 items-center rounded-xl bg-rose-50 px-3 text-[11px] font-black text-rose-600">
          Sold out
        </span>
      );
    }

    if (!cartItem) {
      return (
        <button
          type="button"
          onClick={() => addToCart(product)}
          className="h-[36px] w-[110px] rounded-[12px] border border-[#a7f3d0] bg-[#f0fdf4] px-2 text-xs font-black text-[#009b5a] transition-all hover:bg-[#dcfce7] flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          <span>Add to Cart</span>
        </button>
      );
    }

    return (
      <div className="flex h-[36px] items-center overflow-hidden rounded-[12px] border border-[#a7f3d0] bg-[#f0fdf4] p-0.5">
        <button
          type="button"
          onClick={() => updateCartItem(cartItem.id, cartItem.quantity - 1)}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-base font-black text-[#009b5a] hover:bg-[#dcfce7] transition-colors cursor-pointer"
        >
          -
        </button>
        <span className="w-6 text-center text-xs font-black text-slate-900">{cartItem.quantity}</span>
        <button
          type="button"
          onClick={() => updateCartItem(cartItem.id, cartItem.quantity + 1)}
          disabled={cartItem.quantity >= availableStock}
          className="flex h-[32px] w-[32px] items-center justify-center rounded-[8px] text-base font-black text-[#009b5a] hover:bg-[#dcfce7] transition-colors disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300 cursor-pointer"
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

  const storedUser = localStorage.getItem("user") || sessionStorage.getItem("user");
  const customerUser = user || (storedUser ? JSON.parse(storedUser) : null);

  return (
    <div className="customer-shop-shell">
      {/* Reusable Responsive Left Sidebar */}
      <CustomerSidebar
        activeItem={activeSidebarItem}
        onItemClick={handleSidebarAction}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="customer-shop-main">
        <div className="customer-shop-page min-h-screen pb-12 pt-3 lg:pt-4">
      <div className="customer-shop-container mx-auto max-w-[1280px] px-2 sm:px-4">
        {/* Customer Welcome Greeting Bar with Mobile Hamburger Menu Button */}
        <div className="customer-shop-title-wrap mb-4 px-1 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button (< 768px) */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open Navigation Sidebar"
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs hover:bg-slate-50 hover:text-emerald-700 cursor-pointer active:scale-95"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h1 className="customer-shop-title text-[28px] sm:text-[34px] font-black tracking-tight text-slate-800">
                Customer Shop
              </h1>
              <p className="customer-shop-subtitle text-xs sm:text-sm font-semibold text-slate-500">Handpicked fresh produce, delivered to your doorstep</p>
            </div>
          </div>
        </div>
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

        {/* Quick Categories Bar (1070px max-width, 116px/110px/96px/86px responsive height) */}
        <section ref={categoriesSectionRef} className="customer-shop-categories mb-5 w-full max-w-[1070px] mx-auto h-[86px] sm:h-[96px] lg:h-[110px] xl:h-[116px] flex items-center">
          <div className="flex items-center justify-between gap-3 sm:gap-5 lg:gap-6 w-full overflow-x-auto h-full py-1 scrollbar-none">
            {quickCategories.map(({ id, icon: Icon, label, category, image }) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className="flex shrink-0 flex-col items-center justify-center gap-1.5 group cursor-pointer border-none bg-transparent transition-all duration-200 hover:-translate-y-0.5"
                >
                  <div
                    className={`flex h-[52px] w-[52px] sm:h-[60px] sm:w-[60px] lg:h-[68px] lg:w-[68px] items-center justify-center overflow-hidden rounded-full transition-all duration-300 ${
                      id === 'all'
                        ? 'bg-[#009b5a] text-white shadow-md shadow-emerald-600/25 group-hover:bg-[#00874e]'
                        : isActive
                        ? 'bg-[#e8f8f0] border-2 border-[#009b5a] shadow-md shadow-emerald-500/20'
                        : 'bg-[#fafafa] border border-slate-200/70 shadow-2xs group-hover:border-[#009b5a] group-hover:bg-white'
                    }`}
                  >
                    {id === 'all' ? (
                      <Grid3X3 className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                    ) : (
                      <img
                        src={image}
                        alt={label}
                        className="h-full w-full object-contain p-2 lg:p-2.5 transition-transform duration-300 group-hover:scale-110"
                      />
                    )}
                  </div>
                  <span
                    className={`whitespace-nowrap text-[11px] sm:text-[12px] lg:text-[13px] font-extrabold transition-colors ${
                      isActive ? 'text-[#009b5a] font-black' : 'text-slate-700 group-hover:text-[#009b5a]'
                    }`}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Promo Banners Stage Section */}
        <section className="mb-5">
          <PromoBannersStage />
        </section>

        {/* Search & Category Filter Section */}
        <section ref={productsSectionRef} className="customer-shop-toolbar-wrap mb-4 rounded-[16px] bg-white p-3 shadow-sm border border-slate-200/60">
          <div className="mb-3 flex flex-col gap-2.5">
            <div className="flex flex-col gap-2 xl:flex-row xl:items-center xl:justify-between">
              <form onSubmit={handleSearch} className="customer-shop-search-form relative w-full xl:max-w-[330px]">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search fruits, dairy, snacks..."
                  className="customer-shop-search-input h-[44px] w-full rounded-[14px] border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
                />
              </form>

              <div className="customer-shop-sort-row flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setQuickSort('all');
                    setPriceSort('none');
                    setSortBy('relevance');
                  }}
                  className={`h-[32px] rounded-[8px] border px-3 text-xs font-black transition ${quickSort === 'all' ? 'border-emerald-200 bg-emerald-500 text-white' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setQuickSort('best')}
                  className={`h-[32px] rounded-[8px] border px-3 text-xs font-black transition ${quickSort === 'best' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  Best Sellers
                </button>
                <button
                  onClick={() => setQuickSort('new')}
                  className={`h-[32px] rounded-[8px] border px-3 text-xs font-black transition ${quickSort === 'new' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  New Arrivals
                </button>
                <button
                  onClick={() => setQuickSort('discount')}
                  className={`h-[32px] rounded-[8px] border px-3 text-xs font-black transition ${quickSort === 'discount' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                >
                  Discount
                </button>
                <select
                  value={priceSort}
                  onChange={(event) => setPriceSort(event.target.value)}
                  className="h-[32px] rounded-[8px] border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none"
                >
                  <option value="none">Price</option>
                  <option value="low-high">Price: Low to High</option>
                  <option value="high-low">Price: High to Low</option>
                </select>
              </div>
            </div>

            <div className="customer-shop-filter-row flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`shrink-0 h-[36px] rounded-[10px] border px-3.5 text-xs font-black transition-all ${
                    activeCategory === category
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 shadow-xs'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2">
              <span className="text-xs font-bold text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="h-[32px] rounded-[8px] border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none"
              >
                <option value="relevance">Relevance</option>
                <option value="name">Name</option>
              </select>
              <button className="inline-flex h-[32px] items-center gap-1.5 rounded-[8px] border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filter
              </button>
            </div>
          </div>

          {isCatalogLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[240px] rounded-[12px] border border-slate-200 bg-slate-50 p-2 animate-pulse">
                  <div className="h-[120px] rounded-[10px] bg-slate-200" />
                  <div className="mt-3 h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-2 h-3 w-1/2 rounded bg-slate-200" />
                  <div className="mt-4 h-5 w-2/3 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : catalogError ? (
            <div className="rounded-[12px] border border-rose-200 bg-rose-50 px-4 py-8 text-center">
              <p className="text-base font-black text-rose-700">Unable to load products</p>
              <p className="mt-1 text-xs font-semibold text-rose-600">{catalogError}</p>
              <button
                onClick={loadCatalogProducts}
                className="mt-4 h-10 rounded-xl bg-rose-600 px-4 text-xs font-black text-white transition hover:bg-rose-700"
              >
                Retry
              </button>
            </div>
          ) : !hasCatalogProducts ? (
            <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <p className="text-base font-black text-slate-800">No Products Found</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">The backend returned an empty catalog.</p>
            </div>
          ) : groupedProducts.length === 0 ? (
            <div className="rounded-[12px] border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
              <p className="text-base font-black text-slate-800">No matching products</p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">Your current search or category filter is hiding the available items.</p>
              <button
                onClick={clearFilters}
                className="mt-4 h-10 rounded-xl bg-[#14b8ff] px-4 text-xs font-black text-white transition hover:bg-[#0284c7]"
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {groupedProducts.map(([section, sectionProducts]) => (
                <div key={section} className="mb-5 last:mb-0">
                  <div className="mb-2.5 flex items-center justify-between">
                    <h3 className="text-[30px] font-black text-slate-900 leading-tight">{section}</h3>
                    {activeCategory === 'All' && (
                      <button
                        onClick={() => setActiveCategory(section)}
                        className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        View all
                      </button>
                    )}
                  </div>

                  <div className="customer-shop-products-grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-[12px]">
                    {sectionProducts.map((product) => {
                      if (!product) return null;
                      const inWishlist = Array.isArray(wishlist) && wishlist.includes(product.id);
                      const badge = getStableBadge(product.name || 'Produce');
                      const hasImageError = Boolean(imageErrors[product.id]);
                      const originalPrice = Number(product.originalPrice ?? product.marketPrice ?? product.price ?? 0);
                      const sellingPrice = Number(product.sellingPrice ?? product.price ?? 0);
                      const discountPercent = originalPrice > 0
                        ? Math.max(0, Math.round((1 - (sellingPrice / originalPrice)) * 100))
                        : Number(product.discount ?? 0);
                      const stockQuantity = Number(product.stockQuantity ?? product.stock ?? product.availableStock ?? 50);
                      const preferredImage = product.imageUrl || product.imagePath || product.image;

                      return (
                        <article
                          key={product.id}
                          className="customer-shop-product-card relative w-full shrink-0 overflow-hidden rounded-[14px] border border-emerald-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                        >
                          <div className="customer-shop-product-image-wrap relative aspect-[4/3] w-full bg-white p-2">
                            {discountPercent > 0 && (
                              <span className="customer-shop-discount-badge absolute left-2 top-2 z-20 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">
                                {discountPercent}% OFF
                              </span>
                            )}

                            <button
                              onClick={() => toggleWishlist(product.id)}
                              className="customer-shop-wishlist-btn absolute right-2 top-2 z-20 rounded-full border border-slate-200 bg-white p-1 text-slate-400 shadow-xs hover:text-rose-500"
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
                                className="absolute right-2 top-10 z-20 rounded-full bg-rose-500 p-1.5 text-white shadow-md hover:bg-rose-600 transition-colors"
                                title="Delete Material (Admin)"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}

                            <img
                              src={getProductImage(product.name, product.category, product.imageUrl || preferredImage) || FALLBACK_IMAGE}
                              alt={product.imageAltText || product.name || 'Product image'}
                              loading="lazy"
                              onError={(event) => {
                                handleImageError(product.id);
                                if (!event.currentTarget.dataset.fallbackApplied) {
                                  event.currentTarget.dataset.fallbackApplied = 'true';
                                  event.currentTarget.src = getProductImage(product.name, product.category) || FALLBACK_IMAGE;
                                }
                              }}
                              className="h-full w-full object-contain rounded-[8px]"
                            />
                          </div>

                          <div className="customer-shop-product-body flex flex-col justify-between p-2.5">
                            <div>
                              <p className="customer-shop-product-name line-clamp-1 text-[15px] font-extrabold text-slate-800 leading-tight">{product.name}</p>
                              <p className="customer-shop-product-unit mt-0.5 text-[11px] font-semibold text-slate-500">{product.unit || '1 unit'}</p>
                            </div>

                            <div className="mt-1.5 flex items-end justify-between gap-1">
                              <div>
                                <p className="customer-shop-product-original text-[11px] font-semibold text-slate-400 line-through">₹{Math.round(originalPrice)}</p>
                                <p className="customer-shop-product-price text-[24px] font-black text-emerald-700 leading-none">₹{Math.round(sellingPrice)}</p>
                              </div>
                              {renderCartControl(product)}
                            </div>

                            <div className="mt-1 flex items-center justify-between text-[10px] font-bold text-slate-500">
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                                {discountPercent > 0 ? `${discountPercent}% off` : 'Fresh'}
                              </span>
                              <span className={`rounded-full px-2 py-0.5 ${stockQuantity > 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                                {stockQuantity > 0 ? `${stockQuantity} in stock` : 'Out of stock'}
                              </span>
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
    </div>
  );
};

export default CustomerShop;
