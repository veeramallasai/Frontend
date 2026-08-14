import React, { useState } from 'react';
import { X, Store, Plus, Package, DollarSign, TrendingUp, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const SellerDashboardModal = ({ isOpen, onClose, onAddProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    price: '',
    originalPrice: '',
    seller: 'TechNova Store',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
    description: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price) {
      toast.error('Please enter product name and price');
      return;
    }

    const newProd = {
      id: `prod-seller-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      originalPrice: Number(formData.originalPrice || formData.price * 1.25),
      rating: 4.9,
      seller: formData.seller,
      image: formData.image,
      description: formData.description,
    };

    onAddProduct(newProd);
    toast.success(`Listing "${formData.name}" added to marketplace!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-indigo-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black">Seller Dashboard & Catalog Portal</h2>
              <p className="text-xs text-indigo-200 font-medium">Manage listings & dispatch inventory</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-indigo-200 hover:text-white rounded-xl hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Seller Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
              <span className="text-[10px] font-extrabold uppercase text-indigo-700">Total Sales</span>
              <p className="text-xl font-black text-indigo-950 mt-0.5">₹1,48,200</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-[10px] font-extrabold uppercase text-emerald-700">Orders Fulfilled</span>
              <p className="text-xl font-black text-emerald-950 mt-0.5">342 Units</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <span className="text-[10px] font-extrabold uppercase text-amber-700">Seller Score</span>
              <p className="text-xl font-black text-amber-950 mt-0.5">99.4%</p>
            </div>
          </div>

          {/* Add Product Form */}
          <form onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-600" />
              <span>List New Product on Marketplace</span>
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Smart Fitness Band 5"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
                >
                  <option value="Electronics">Tech & Gadgets</option>
                  <option value="Fashion">Fashion & Apparel</option>
                  <option value="Home">Home & Living</option>
                  <option value="Beauty">Beauty & Skincare</option>
                  <option value="Fitness">Sports & Fitness</option>
                  <option value="Books">Books & Stationery</option>
                  <option value="Handmade">Artisanal Handmade</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">Offer Selling Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 1999"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-slate-700 block mb-1">MRP / Strikethrough Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 2999"
                  value={formData.originalPrice}
                  onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Product Image URL</label>
              <input
                type="text"
                placeholder="https://images.unsplash.com/..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full h-10 bg-slate-50 border border-slate-200 rounded-xl px-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 block mb-1">Product Specifications & Description</label>
              <textarea
                rows={2}
                placeholder="Short description of features and specs..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:outline-none focus:bg-white focus:border-indigo-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="h-11 px-5 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Publish Product Listing
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
};

export default SellerDashboardModal;
