import React, { useRef, useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';
import { ChevronLeft, ChevronRight, X, LayoutGrid, Leaf, Sparkles, Coffee, Apple, Sun, Layers } from 'lucide-react';
import api from '../../services/api';

const MAIN_CATEGORIES_DATA = [
  {
    id: 'vegetables',
    name: 'Vegetables',
    backendCategory: 'Vegetables',
    image: 'https://cdn-icons-png.flaticon.com/512/2153/2153788.png',
  },
  {
    id: 'fruits',
    name: 'Fruits',
    backendCategory: 'Fruits',
    image: 'https://cdn-icons-png.flaticon.com/512/3194/3194766.png',
  },
  {
    id: 'leafy-greens',
    name: 'Leafy Greens',
    backendCategory: 'Leafy Vegetables',
    image: 'https://cdn-icons-png.flaticon.com/512/2909/2909761.png',
  },
  {
    id: 'dairy',
    name: 'Dairy',
    backendCategory: 'Dairy & Milk',
    image: 'https://cdn-icons-png.flaticon.com/512/3050/3050158.png',
  },
  {
    id: 'meat',
    name: 'Meat',
    backendCategory: 'Meat & Poultry',
    image: 'https://cdn-icons-png.flaticon.com/512/3143/3143643.png',
  },
  {
    id: 'fish-seafood',
    name: 'Fish & Seafood',
    backendCategory: 'Fish & Seafood',
    image: 'https://cdn-icons-png.flaticon.com/512/2927/2927347.png',
  },
  {
    id: 'groceries',
    name: 'Groceries',
    backendCategory: 'Groceries',
    image: 'https://cdn-icons-png.flaticon.com/512/3724/3724788.png',
  },
  {
    id: 'organic',
    name: 'Organic',
    backendCategory: 'Organic Products',
    image: 'https://cdn-icons-png.flaticon.com/512/2917/2917995.png',
  },
  {
    id: 'seeds',
    name: 'Seeds',
    backendCategory: 'Seeds & Grains',
    image: 'https://cdn-icons-png.flaticon.com/512/628/628283.png',
  },
  {
    id: 'more',
    name: 'More',
    backendCategory: 'ALL',
    image: null,
  },
];

const MORE_CATEGORIES_DATA = [
  { id: 'breakfast', name: 'Breakfast', backendCategory: 'Breakfast', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' },
  { id: 'sauces-pickles', name: 'Sauces & Pickles', backendCategory: 'Sauces & Spices', image: 'https://cdn-icons-png.flaticon.com/512/2829/2829828.png' },
  { id: 'eggs-poultry', name: 'Eggs & Poultry', backendCategory: 'Eggs', image: 'https://cdn-icons-png.flaticon.com/512/837/837543.png' },
  { id: 'dry-fruits', name: 'Dry Fruits & Nuts', backendCategory: 'Dry Fruits', image: 'https://cdn-icons-png.flaticon.com/512/2909/2909808.png' },
  { id: 'beverages', name: 'Beverages', backendCategory: 'Beverages', image: 'https://cdn-icons-png.flaticon.com/512/2405/2405479.png' },
  { id: 'farm-essentials', name: 'Farm Essentials', backendCategory: 'Farm Essentials', image: 'https://cdn-icons-png.flaticon.com/512/1518/1518861.png' },
];

const CategoryStrip = ({ selectedCategory, onSelectCategory, onOpenAllCategories }) => {
  const scrollContainerRef = useRef(null);
  const [categories, setCategories] = useState(MAIN_CATEGORIES_DATA);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);

  useEffect(() => {
    const fetchBackendCategories = async () => {
      try {
        const response = await api.get('/categories');
        const backendCats = response?.data?.data || response?.data || [];
        if (Array.isArray(backendCats) && backendCats.length > 0) {
          setCategories((prev) =>
            prev.map((cat) => {
              const matched = backendCats.find(
                (b) => (b.name || '').toLowerCase() === (cat.backendCategory || '').toLowerCase()
              );
              return matched ? { ...cat, backendId: matched.id } : cat;
            })
          );
        }
      } catch {
        // Fallback silently to predefined frontend mapping
      }
    };
    fetchBackendCategories();
  }, []);

  const handleScroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCategoryClick = (category) => {
    if (category.id === 'more') {
      if (onOpenAllCategories) {
        onOpenAllCategories();
      }
      setIsMoreModalOpen(true);
      return;
    }

    if (onSelectCategory) {
      onSelectCategory(category.backendCategory || category.name);
    }
  };

  const allCategoriesForModal = [...MAIN_CATEGORIES_DATA.filter((c) => c.id !== 'more'), ...MORE_CATEGORIES_DATA];

  return (
    <section className="relative max-w-[1340px] mx-auto px-4 sm:px-6 my-6">
      
      {/* Category Strip Container */}
      <div className="relative group">
        
        {/* Left Arrow Nav Button */}
        <button
          onClick={() => handleScroll('left')}
          className="hidden md:flex absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Scroll Left"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-[14px] overflow-x-auto scroll-smooth py-2.5 px-1 no-scrollbar"
          style={{
            display: 'flex',
            gap: '14px',
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            padding: '10px 4px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {categories.map((cat) => {
            const isSelected =
              selectedCategory &&
              (selectedCategory.toLowerCase() === (cat.backendCategory || '').toLowerCase() ||
                selectedCategory.toLowerCase() === cat.name.toLowerCase());

            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                isSelected={isSelected}
                onClick={handleCategoryClick}
              />
            );
          })}
        </div>

        {/* Right Arrow Nav Button */}
        <button
          onClick={() => handleScroll('right')}
          className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center text-slate-700 hover:text-emerald-600 hover:border-emerald-300 transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Scroll Right"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

      {/* "More" Categories Modal */}
      {isMoreModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">All Farm to Home Categories</h3>
                  <p className="text-xs text-slate-500 font-medium">Explore all 15 fresh produce & essential categories</p>
                </div>
              </div>
              <button
                onClick={() => setIsMoreModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-1">
              {allCategoriesForModal.map((cat) => (
                <button
                  key={`modal-${cat.id}`}
                  onClick={() => {
                    handleCategoryClick(cat);
                    setIsMoreModalOpen(false);
                  }}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all text-left group"
                >
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-10 h-10 object-contain shrink-0 group-hover:scale-105 transition-transform" />
                  ) : (
                    <LayoutGrid className="w-8 h-8 text-emerald-600 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-black text-slate-900 block group-hover:text-emerald-700">{cat.name}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">Browse Products</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  );
};

export default CategoryStrip;
