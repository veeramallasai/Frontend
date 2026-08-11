import React from 'react';
import { 
  Laptop, Shirt, Home, Sparkles, Smartphone, Dumbbell, BookOpen, Brush, 
  ChevronRight, Apple, ShoppingBag 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'Electronics', title: 'Tech & Gadgets', icon: Laptop, color: 'bg-blue-50 text-blue-600 border-blue-200', count: '1,240 Items' },
  { id: 'Fashion', title: 'Fashion & Apparel', icon: Shirt, color: 'bg-purple-50 text-purple-600 border-purple-200', count: '3,890 Items' },
  { id: 'Home', title: 'Home & Living', icon: Home, color: 'bg-emerald-50 text-emerald-600 border-emerald-200', count: '2,150 Items' },
  { id: 'Beauty', title: 'Beauty & Skincare', icon: Sparkles, color: 'bg-rose-50 text-rose-600 border-rose-200', count: '1,420 Items' },
  { id: 'Mobiles', title: 'Smartphones & Accs', icon: Smartphone, color: 'bg-amber-50 text-amber-600 border-amber-200', count: '980 Items' },
  { id: 'Fitness', title: 'Sports & Fitness', icon: Dumbbell, color: 'bg-teal-50 text-teal-600 border-teal-200', count: '760 Items' },
  { id: 'Books', title: 'Books & Stationery', icon: BookOpen, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', count: '1,110 Items' },
  { id: 'Handmade', title: 'Artisanal Handmade', icon: Brush, color: 'bg-orange-50 text-orange-600 border-orange-200', count: '640 Items' },
];

const CategoryGrid = ({ selectedCategory, onSelectCategory }) => {
  return (
    <section className="max-w-[1340px] mx-auto px-4 sm:px-6 my-8">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Shop by Category
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">Explore popular collections across top categories</p>
        </div>

        {selectedCategory !== 'All' && (
          <button
            onClick={() => onSelectCategory('All')}
            className="text-xs font-black text-indigo-600 hover:text-indigo-700 underline cursor-pointer"
          >
            Clear Filter (Show All)
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative rounded-2xl p-4 text-center cursor-pointer transition-all duration-300 border flex flex-col items-center justify-between ${
                isActive
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20 -translate-y-1'
                  : 'bg-white hover:bg-slate-50 border-slate-200/80 hover:border-indigo-300 shadow-2xs hover:shadow-md hover:-translate-y-1'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                  isActive ? 'bg-white/20 text-white' : cat.color
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>

              <div className="space-y-0.5">
                <h3 className={`text-xs font-black truncate max-w-full ${isActive ? 'text-white' : 'text-slate-900 group-hover:text-indigo-600'}`}>
                  {cat.title}
                </h3>
                <p className={`text-[10px] font-semibold ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {cat.count}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryGrid;
