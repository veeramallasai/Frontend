import React, { useState, useMemo } from 'react';
import MarketplaceNavbar from '../components/marketplace/MarketplaceNavbar';
import MarketplaceHero from '../components/marketplace/MarketplaceHero';
import CategoryStrip from '../components/categories/CategoryStrip';
import CategoryGrid from '../components/marketplace/CategoryGrid';
import MarketplaceProductCard from '../components/marketplace/MarketplaceProductCard';
import ProductDetailsModal from '../components/marketplace/ProductDetailsModal';
import CartDrawer from '../components/marketplace/CartDrawer';
import CheckoutModal from '../components/marketplace/CheckoutModal';
import SellerDashboardModal from '../components/marketplace/SellerDashboardModal';
import MarketplaceFooter from '../components/marketplace/MarketplaceFooter';
import { SlidersHorizontal, Sparkles, Store, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_PRODUCTS = [
  // VEGETABLES
  {
    id: 'veg-1',
    name: 'Fresh Organic Red Tomatoes',
    category: 'Vegetables',
    price: 34,
    originalPrice: 48,
    unit: '1 kg',
    stock: 150,
    rating: 4.9,
    seller: 'GreenAcres Organic Farm',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
    description: 'Farm-fresh, vine-ripened organic red tomatoes harvested daily. Packed with Antioxidants and Vitamin C.',
  },
  {
    id: 'veg-2',
    name: 'Farm Fresh Potatoes',
    category: 'Vegetables',
    price: 28,
    originalPrice: 38,
    unit: '1 kg',
    stock: 200,
    rating: 4.8,
    seller: 'Surya Agri Farms',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80',
    description: 'Clean, naturally grown farm potatoes. Perfect for curry, frying, or boiling.',
  },
  {
    id: 'veg-3',
    name: 'Fresh Red Onions',
    category: 'Vegetables',
    price: 35,
    originalPrice: 50,
    unit: '1 kg',
    stock: 180,
    rating: 4.7,
    seller: 'Deccan Produce Co',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cf?w=600&auto=format&fit=crop&q=80',
    description: 'Crisp, flavorful red onions harvested directly from local fields.',
  },
  {
    id: 'veg-4',
    name: 'Crunchy Orange Carrots',
    category: 'Vegetables',
    price: 42,
    originalPrice: 60,
    unit: '500 g',
    stock: 90,
    rating: 4.9,
    seller: 'Valley Organics',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=600&auto=format&fit=crop&q=80',
    description: 'Sweet and crunchy farm carrots rich in Beta-Carotene and Vitamin A.',
  },
  {
    id: 'veg-5',
    name: 'Fresh Green Capsicum (Bell Pepper)',
    category: 'Vegetables',
    price: 45,
    originalPrice: 65,
    unit: '500 g',
    stock: 80,
    rating: 4.8,
    seller: 'GreenAcres Organic Farm',
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600&auto=format&fit=crop&q=80',
    description: 'Crisp green capsicum freshly picked from greenhouse farms.',
  },

  // FRUITS
  {
    id: 'fruit-1',
    name: 'Premium Shimla Red Apples',
    category: 'Fruits',
    price: 149,
    originalPrice: 199,
    unit: '1 kg',
    stock: 100,
    rating: 4.9,
    seller: 'Himalayan Fruit Orchards',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
    description: 'Crisp, sweet, and juicy Shimla apples delivered fresh from Himalayan orchards.',
  },
  {
    id: 'fruit-2',
    name: 'Fresh Robusta Bananas',
    category: 'Fruits',
    price: 48,
    originalPrice: 65,
    unit: '1 Dozen',
    stock: 140,
    rating: 4.8,
    seller: 'Kaveri Valley Farms',
    image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&auto=format&fit=crop&q=80',
    description: 'Naturally ripened Robusta bananas packed with Potassium and Energy.',
  },
  {
    id: 'fruit-3',
    name: 'Sweet Nagpur Oranges',
    category: 'Fruits',
    price: 89,
    originalPrice: 120,
    unit: '1 kg',
    stock: 110,
    rating: 4.9,
    seller: 'Nagpur Citrus Farm',
    image: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=600&auto=format&fit=crop&q=80',
    description: 'Juicy, Vitamin-C rich Nagpur oranges with natural sweetness.',
  },

  // LEAFY GREENS
  {
    id: 'leafy-1',
    name: 'Fresh Organic Spinach (Palak)',
    category: 'Leafy Vegetables',
    price: 24,
    originalPrice: 35,
    unit: '250 g Bunch',
    stock: 120,
    rating: 4.9,
    seller: 'Green Leaf Hydroponics',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
    description: 'Iron-rich, tender green spinach leaves harvested early morning.',
  },
  {
    id: 'leafy-2',
    name: 'Fresh Aromatic Coriander (Kothmir)',
    category: 'Leafy Vegetables',
    price: 18,
    originalPrice: 25,
    unit: '100 g Bunch',
    stock: 150,
    rating: 4.8,
    seller: 'Surya Agri Farms',
    image: 'https://images.unsplash.com/photo-1628773822503-930a8586f4a8?w=600&auto=format&fit=crop&q=80',
    description: 'Aromatic, fresh green coriander leaves perfect for garnishing.',
  },

  // DAIRY
  {
    id: 'dairy-1',
    name: 'Pure Cow Milk (Pasteurized)',
    category: 'Dairy & Milk',
    price: 66,
    originalPrice: 75,
    unit: '1 Liter',
    stock: 250,
    rating: 4.9,
    seller: 'PureDairy Fresh',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80',
    description: '100% pure, farm-fresh cow milk delivered chilled every morning.',
  },
  {
    id: 'dairy-2',
    name: 'Fresh Farm Malai Paneer',
    category: 'Dairy & Milk',
    price: 95,
    originalPrice: 120,
    unit: '200 g',
    stock: 90,
    rating: 4.9,
    seller: 'PureDairy Fresh',
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop&q=80',
    description: 'Soft, creamy malai paneer crafted from pure cow milk.',
  },

  // MEAT & POULTRY
  {
    id: 'meat-1',
    name: 'Fresh Farm Chicken Curry Cut',
    category: 'Meat & Poultry',
    price: 220,
    originalPrice: 280,
    unit: '500 g',
    stock: 60,
    rating: 4.8,
    seller: 'Country Farms Poultry',
    image: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&auto=format&fit=crop&q=80',
    description: 'Antibiotic-free fresh farm chicken, tender curry cut pieces.',
  },

  // FISH & SEAFOOD
  {
    id: 'fish-1',
    name: 'Fresh Tiger Prawns (Cleaned)',
    category: 'Fish & Seafood',
    price: 450,
    originalPrice: 599,
    unit: '500 g',
    stock: 40,
    rating: 4.9,
    seller: 'Coastal Catch Traders',
    image: 'https://images.unsplash.com/photo-1534483509719-3feaee7c30da?w=600&auto=format&fit=crop&q=80',
    description: 'De-veined and cleaned fresh sea tiger prawns.',
  },

  // GROCERIES
  {
    id: 'groc-1',
    name: 'Royal Aged Basmati Rice',
    category: 'Groceries',
    price: 185,
    originalPrice: 240,
    unit: '1 kg Pack',
    stock: 120,
    rating: 4.9,
    seller: 'Heritage Grains',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80',
    description: 'Long-grain aromatic aged basmati rice for biryani and pulao.',
  },

  // ORGANIC
  {
    id: 'org-1',
    name: '100% Pure Organic Raw Honey',
    category: 'Organic Products',
    price: 320,
    originalPrice: 420,
    unit: '500 g Jar',
    stock: 75,
    rating: 5.0,
    seller: 'Forest Bloom Organics',
    image: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?w=600&auto=format&fit=crop&q=80',
    description: 'Unfiltered, raw forest honey harvested from wild beehives.',
  },

  // SEEDS
  {
    id: 'seed-1',
    name: 'Organic Tomato Seeds (Desi Variety)',
    category: 'Seeds & Grains',
    price: 65,
    originalPrice: 99,
    unit: '1 Pack (50 Seeds)',
    stock: 300,
    rating: 4.8,
    seller: 'Kisan Seed Store',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600&auto=format&fit=crop&q=80',
    description: 'High-germination desi organic tomato seeds for home gardening.',
  },
];

const MarketplaceApp = () => {
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('relevance');
  const [priceSort, setPriceSort] = useState('none');
  const [activeRole, setActiveRole] = useState('customer');

  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [selectedProductModal, setSelectedProductModal] = useState(null);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || (p.seller && p.seller.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    if (priceSort === 'low-high') {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'high-low') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, searchQuery, selectedCategory, priceSort]);

  // Cart Operations
  const handleAddToCart = (product, qty = 1) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + qty } : item));
      }
      return [...prev, { ...product, quantity: qty }];
    });
    toast.success(`Added "${product.name}" to Cart`);
  };

  const handleUpdateQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCartItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item)));
  };

  const handleRemoveFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast('Item removed from cart');
  };

  const handleToggleWishlist = (id) => {
    setWishlist((prev) => {
      if (prev.includes(id)) {
        toast('Removed from wishlist');
        return prev.filter((item) => item !== id);
      }
      toast.success('Added to wishlist');
      return [...prev, id];
    });
  };

  const handleAddProductFromSeller = (newProd) => {
    setProducts((prev) => [newProd, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white">
      
      <div>
        {/* Navbar */}
        <MarketplaceNavbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
          wishlistCount={wishlist.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenSellerDashboard={() => setIsSellerModalOpen(true)}
          activeRole={activeRole}
          onRoleChange={(role) => {
            setActiveRole(role);
            if (role === 'seller') setIsSellerModalOpen(true);
          }}
        />

        {/* Hero Section */}
        <MarketplaceHero
          onExplore={() => {
            const catalogEl = document.getElementById('catalog-section');
            if (catalogEl) catalogEl.scrollIntoView({ behavior: 'smooth' });
          }}
          onBecomeSeller={() => setIsSellerModalOpen(true)}
        />

        {/* Horizontal Category Strip */}
        <CategoryStrip
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Main Product Catalog Section */}
        <section id="catalog-section" className="max-w-[1340px] mx-auto px-4 sm:px-6 my-10">
          
          {/* Section Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {selectedCategory === 'All' ? 'All Products' : `${selectedCategory} Collection`}
              </h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Showing {filteredProducts.length} verified listings
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Price Sort Filter */}
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 outline-none hover:border-indigo-300 transition-colors"
              >
                <option value="none">Sort by Price</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
              </select>

              {activeRole === 'seller' && (
                <button
                  onClick={() => setIsSellerModalOpen(true)}
                  className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl text-xs shadow-md shadow-indigo-600/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  <span>+ List New Product</span>
                </button>
              )}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-300 my-6">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="text-base font-black text-slate-900">No Products Found</h3>
              <p className="text-xs text-slate-500 font-medium mt-1">Try resetting your search or category filter.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setPriceSort('none');
                }}
                className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-extrabold shadow-sm hover:bg-indigo-700"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
              {filteredProducts.map((prod) => {
                const qty = cartItems.find((item) => item.id === prod.id)?.quantity || 0;
                return (
                  <MarketplaceProductCard
                    key={prod.id}
                    product={prod}
                    quantity={qty}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onQuantityChange={handleUpdateQuantity}
                    onQuickView={(p) => setSelectedProductModal(p)}
                    onToggleWishlist={handleToggleWishlist}
                    inWishlist={wishlist.includes(prod.id)}
                  />
                );
              })}
            </div>
          )}

        </section>
      </div>

      {/* Footer */}
      <MarketplaceFooter />

      {/* Slide-over Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Quick View Product Details Modal */}
      <ProductDetailsModal
        product={selectedProductModal}
        isOpen={Boolean(selectedProductModal)}
        onClose={() => setSelectedProductModal(null)}
        onAddToCart={handleAddToCart}
        onToggleWishlist={handleToggleWishlist}
        inWishlist={selectedProductModal ? wishlist.includes(selectedProductModal.id) : false}
      />

      {/* Multi-step Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderComplete={() => {
          setCartItems([]);
        }}
      />

      {/* Seller Dashboard Modal */}
      <SellerDashboardModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
        onAddProduct={handleAddProductFromSeller}
      />

    </div>
  );
};

export default MarketplaceApp;
