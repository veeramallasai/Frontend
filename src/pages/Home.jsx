import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Leaf, Search, User, ShoppingBag, ArrowRight, ShieldCheck, 
  Truck, Award, Sparkles, Heart, Star, ChevronDown, CheckCircle2 
} from 'lucide-react';
import CategoryStrip from '../components/categories/CategoryStrip';
import { useCustomer } from '../context/CustomerContext';
import toast from 'react-hot-toast';

const FEATURED_PRODUCTS = [
  {
    id: 'veg-1',
    name: 'Fresh Organic Red Tomatoes',
    category: 'Vegetables',
    price: 34,
    originalPrice: 48,
    unit: '1 kg',
    rating: 4.9,
    seller: 'GreenAcres Organic Farm',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'fruit-1',
    name: 'Premium Shimla Red Apples',
    category: 'Fruits',
    price: 149,
    originalPrice: 199,
    unit: '1 kg',
    rating: 4.9,
    seller: 'Himalayan Fruit Orchards',
    image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'leafy-1',
    name: 'Fresh Organic Spinach (Palak)',
    category: 'Leafy Vegetables',
    price: 24,
    originalPrice: 35,
    unit: '250 g Bunch',
    rating: 4.9,
    seller: 'Green Leaf Hydroponics',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'dairy-1',
    name: 'Pure Cow Milk (Pasteurized)',
    category: 'Dairy & Milk',
    price: 66,
    originalPrice: 75,
    unit: '1 Liter',
    rating: 4.9,
    seller: 'PureDairy Fresh',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600&auto=format&fit=crop&q=80',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { cart = [], addToCart } = useCustomer();
  const [selectedCategory, setSelectedCategory] = useState('All');

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const handleProductAdd = (product) => {
    if (addToCart) {
      addToCart(product, 1);
      toast.success(`Added ${product.name} to Cart`);
    } else {
      navigate('/customer/shop');
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ── TOP STICKY LUXURY NAVIGATION BAR ────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 px-6 py-4 transition-all">
        <div className="max-w-[1340px] mx-auto flex items-center justify-between">
          
          {/* Left Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-xs font-semibold tracking-wider text-slate-700 uppercase">
            <button onClick={() => navigate('/')} className="hover:text-emerald-600 transition-colors cursor-pointer">
              HOME
            </button>
            <button onClick={() => navigate('/customer/shop')} className="hover:text-emerald-600 transition-colors cursor-pointer flex items-center gap-1">
              <span>PRODUCTS</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>
            <a href="#about-us" className="hover:text-emerald-600 transition-colors">
              ABOUT US
            </a>
            <a href="#sustainability" className="hover:text-emerald-600 transition-colors">
              SUSTAINABILITY
            </a>
          </div>

          {/* Centered Brand Logo */}
          <div 
            onClick={() => navigate('/')}
            className="flex flex-col items-center justify-center cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-1 group-hover:scale-105 transition-transform">
              <Leaf className="w-4.5 h-4.5" />
            </div>
            <span className="font-black text-slate-900 text-lg tracking-[0.2em] uppercase leading-none">
              FARM TO HOME
            </span>
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-5">
            <button 
              onClick={() => navigate('/customer/shop')}
              className="p-2 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer" 
              title="Search Products"
            >
              <Search className="w-5 h-5" />
            </button>

            <button 
              onClick={() => navigate('/customer/profile')}
              className="p-2 text-slate-600 hover:text-emerald-600 transition-colors cursor-pointer" 
              title="Customer Account"
            >
              <User className="w-5 h-5" />
            </button>

            <button 
              onClick={() => navigate('/cart')}
              className="p-2 text-slate-600 hover:text-emerald-600 transition-colors relative cursor-pointer" 
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-emerald-600 text-white text-[10px] font-black rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </nav>

      {/* ── LUXURY HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[560px] flex items-center justify-center text-center overflow-hidden bg-slate-900 text-white px-4 py-20">
        
        {/* Background Image Overlay */}
        <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80" 
            alt="Farm Fresh Produce Background" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Ambient Radial Gradient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-600/20 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-950/60 backdrop-blur-md px-4 py-1.5 text-xs font-bold tracking-widest text-emerald-300 uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Direct Harvest • Zero Pesticides • 100% Organic</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Where Farm Fresh Quality <br />
            <span className="font-serif italic font-normal text-emerald-300">
              Meets Conscious Living
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
            Directly connecting verified local farmers with your household. Enjoy daily morning harvested vegetables, organic fruits, cold-pressed dairy, and sustainable farm essentials delivered to your door within 24 hours.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => navigate('/customer/shop')}
              className="flex items-center gap-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 text-xs tracking-wider uppercase shadow-xl shadow-emerald-600/30 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href="#sustainability"
              className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-7 py-4 text-xs tracking-wider uppercase backdrop-blur-md transition-all cursor-pointer"
            >
              <span>Our Sustainability Promise</span>
            </a>
          </div>
        </div>

      </section>

      {/* ── HORIZONTAL CATEGORY STRIP ───────────────────────────────────────────── */}
      <section className="my-8">
        <CategoryStrip
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            navigate(`/customer/shop?category=${encodeURIComponent(cat)}`);
          }}
        />
      </section>

      {/* ── FEATURED PRODUCTS COLLECTION ────────────────────────────────────────── */}
      <section className="max-w-[1340px] mx-auto px-4 sm:px-6 my-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600">Handpicked Harvest</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              Featured Farm Produce
            </h2>
          </div>

          <button
            onClick={() => navigate('/customer/shop')}
            className="mt-3 sm:mt-0 text-xs font-black uppercase text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All Products</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {FEATURED_PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 transition-all duration-300 hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1"
            >
              <div className="relative h-44 w-full overflow-hidden bg-slate-50 rounded-xl mb-3 flex items-center justify-center p-2">
                <img
                  src={product.image}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {product.category}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1 group-hover:text-emerald-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">{product.unit} • {product.seller}</p>
              </div>

              <div className="mt-4 flex items-center justify-between pt-3 border-t border-slate-100">
                <div>
                  <span className="text-xs text-slate-400 line-through font-bold">₹{product.originalPrice}</span>
                  <p className="text-lg font-black text-slate-900 leading-none">₹{product.price}</p>
                </div>

                <button
                  onClick={() => handleProductAdd(product)}
                  className="h-9 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                >
                  + Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SUSTAINABILITY & ABOUT US SECTION ───────────────────────────────────── */}
      <section id="sustainability" className="bg-slate-900 text-white py-20 px-4 sm:px-6 my-16 relative overflow-hidden">
        <div className="max-w-[1340px] mx-auto grid lg:grid-cols-12 gap-10 items-center">
          
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">Our Conscious Mission</span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-snug">
              Sustainable Farming & Zero Middleman Promise
            </h2>
            <p className="text-sm text-slate-300 font-medium leading-relaxed">
              At Farm to Home, we believe in a food ecosystem built on transparency, sustainability, and direct farmer empowerment. 100% of our produce comes directly from verified local farms using eco-friendly agricultural practices.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h4 className="text-sm font-black text-white">100% Organic</h4>
                <p className="text-xs text-slate-400 font-semibold">Verified soil & crop testing</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <Truck className="w-6 h-6 text-emerald-400" />
                <h4 className="text-sm font-black text-white">24-Hour Express</h4>
                <p className="text-xs text-slate-400 font-semibold">Morning harvest to your kitchen</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 flex justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl overflow-hidden shadow-2xl border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?w=800&auto=format&fit=crop&q=80"
                alt="Farmer picking fresh vegetables"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-white pt-16 pb-8 border-t border-slate-800">
        <div className="max-w-[1340px] mx-auto px-4 sm:px-6 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              <Leaf className="w-4 h-4" />
            </div>
            <span className="font-black text-white text-xl tracking-[0.2em] uppercase">FARM TO HOME</span>
          </div>
          <p className="text-xs text-slate-400 font-medium max-w-md mx-auto">
            Directly connecting local organic farmers with conscious households. Fresh, sustainable, and transparent.
          </p>
          <div className="h-px bg-slate-800 my-6" />
          <p className="text-xs text-slate-500 font-semibold">
            © {new Date().getFullYear()} Farm to Home Inc. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default Home;
