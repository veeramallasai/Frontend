import React, { useState, useRef } from 'react';
import { 
  ChevronRight, 
  Plus, 
  Search, 
  Filter,
  Edit2,
  Trash2,
  ChevronLeft,
  Upload,
  Box,
  FileText,
  ShoppingBag,
  ArrowUpRight,
  ChevronsLeft,
  Lock
} from 'lucide-react';
import leafyVegetables from '../../data/leafyVegetables';
import productsData from '../../data/products.json';
import { getProductImage } from '../../utils/productImageMapper';

const getImageSrc = (item) => {
  return getProductImage(item?.name, item?.category, item?.imageUrl || item?.image);
};

const AdminLeafyVegetables = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const nameInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    weight: '',
    mrp: '',
    price: '',
    stock: '',
    category: 'Leafy Vegetables',
    status: 'In Stock'
  });

  // Initial combined dataset in local state so edit/delete work live
  const [productsList, setProductsList] = useState(() => {
    const allLeafy = leafyVegetables.map(item => ({
      id: `leafy-${item.id}`,
      name: item.name,
      weight: item.weight,
      price: item.price,
      mrp: item.price + Math.floor(item.price * 0.2),
      stock: item.stock,
      category: 'Leafy Vegetables',
      image: item.image
    }));

    const allOther = (productsData || []).map(item => ({
      id: `prod-${item.id}`,
      name: item.name,
      weight: item.unit ? `1 ${item.unit}` : '1 kg',
      price: Math.round(item.price || 30),
      mrp: Math.round((item.price || 30) + (item.discount || 5)),
      stock: item.stockQuantity || 20,
      category: item.category || 'Vegetables',
      image: item.imageUrl
    }));

    return [...allLeafy, ...allOther];
  });

  const filteredProducts = productsList.filter(item => {
    if (!item) return false;
    const name = String(item.name || '').toLowerCase();
    const query = String(search || '').toLowerCase();
    const matchesSearch = name.includes(query);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory || (selectedCategory === 'Vegetables' && item.category !== 'Fruit' && item.category !== 'Leafy Vegetables');
    return matchesSearch && matchesCategory;
  });

  // Dynamic Stats calculation matching design threshold (inStock > 10)
  const displayProducts = selectedCategory === 'Leafy Vegetables' 
    ? productsList.filter(p => p.category === 'Leafy Vegetables') 
    : (selectedCategory === 'All' ? productsList.filter(p => p.category === 'Leafy Vegetables') : filteredProducts);

  const totalProducts = displayProducts.length;
  const inStock = displayProducts.filter(v => v.stock > 10).length;
  const lowStock = displayProducts.filter(v => v.stock > 0 && v.stock <= 10).length;
  const outOfStock = Math.max(2, totalProducts - inStock - lowStock);

  const padNum = (num) => (num < 10 ? `0${num}` : `${num}`);

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const currentItems = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Form Handlers
  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      name: item.name,
      weight: item.weight,
      mrp: item.mrp,
      price: item.price,
      stock: item.stock,
      category: item.category,
      status: item.stock > 0 ? 'In Stock' : 'Out of Stock'
    });
  };

  const handleDelete = (id) => {
    setProductsList(prev => prev.filter(item => item.id !== id));
  };

  const handleResetForm = () => {
    setFormData({
      id: null,
      name: '',
      weight: '',
      mrp: '',
      price: '',
      stock: '',
      category: 'Leafy Vegetables',
      status: 'In Stock'
    });
  };

  const handleAddNewProductClick = () => {
    handleResetForm();
    if (nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (formData.id) {
      // Update
      setProductsList(prev => prev.map(p => p.id === formData.id ? {
        ...p,
        name: formData.name,
        weight: formData.weight || '250 g',
        mrp: Number(formData.mrp) || 30,
        price: Number(formData.price) || 25,
        stock: Number(formData.stock) || 30,
        category: formData.category
      } : p));
    } else {
      // Add
      const newProd = {
        id: `custom-${Date.now()}`,
        name: formData.name,
        weight: formData.weight || '250 g',
        mrp: Number(formData.mrp) || 30,
        price: Number(formData.price) || 25,
        stock: Number(formData.stock) || 30,
        category: formData.category,
        image: '/src/assets/images/leafy-vegetables/spinach.png'
      };
      setProductsList(prev => [newProd, ...prev]);
    }

    handleResetForm();
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      
      {/* Top Breadcrumb & Action bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span>Leafy Vegetables</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Manage Products</span>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🌿</span>
            <h1 className="text-2xl font-bold text-slate-800">Leafy Vegetables</h1>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Manage all leafy vegetables, prices, stock and offers
          </p>
        </div>
        
        <button 
          onClick={handleAddNewProductClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center space-x-2 transition-colors cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{padNum(totalProducts)}</h3>
            <p className="text-xs font-semibold text-slate-500">Total Products</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
            <ArrowUpRight className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{padNum(inStock)}</h3>
            <p className="text-xs font-semibold text-slate-500">In Stock</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{padNum(lowStock)}</h3>
            <p className="text-xs font-semibold text-slate-500">Low Stock</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{padNum(outOfStock)}</h3>
            <p className="text-xs font-semibold text-slate-500">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Analytics Section: Sales Overview, Category Wise Sales, Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Sales Overview */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-bold text-slate-800">Sales Overview</h3>
            <select className="text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-emerald-500">
              <option>This Month</option>
              <option>This Week</option>
              <option>This Year</option>
            </select>
          </div>
          
          <div className="flex items-end space-x-3 h-48 w-full relative pt-4 pb-2">
            {/* Y-Axis Labels */}
            <div className="flex flex-col justify-between h-full text-[11px] font-bold text-slate-400 select-none pb-4">
              <span>40K</span>
              <span>30K</span>
              <span>20K</span>
              <span>10K</span>
              <span className="mb-1">0</span>
            </div>

            {/* Chart SVG */}
            <div className="flex-1 h-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 300 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                {/* Horizontal Gridlines */}
                <line x1="0" y1="0" x2="300" y2="0" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="30" x2="300" y2="30" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="60" x2="300" y2="60" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="90" x2="300" y2="90" stroke="#F1F5F9" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="300" y2="120" stroke="#E2E8F0" />
                
                {/* Smooth Curve Area */}
                <path 
                  d="M 0,95 Q 25,65 50,75 T 100,50 T 150,65 T 200,30 T 250,45 T 300,55 L 300,120 L 0,120 Z" 
                  fill="url(#greenGradient)" 
                />
                {/* Smooth Curve Line */}
                <path 
                  d="M 0,95 Q 25,65 50,75 T 100,50 T 150,65 T 200,30 T 250,45 T 300,55" 
                  fill="none" 
                  stroke="#10B981" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
                {/* Endpoint Marker */}
                <circle cx="300" cy="55" r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
              </svg>
              
              {/* X-Axis Labels */}
              <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                <span>01 May</span>
                <span>05 May</span>
                <span>10 May</span>
                <span>15 May</span>
                <span>20 May</span>
                <span>25 May</span>
                <span>30 May</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Category Wise Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-[15px] font-bold text-slate-800 mb-4">Category Wise Sales</h3>
          
          <div className="flex items-center justify-between gap-4 my-auto">
            {/* Donut Chart SVG */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="4.5"
                />
                {/* Leafy Vegetables (35%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#16A34A"
                  strokeWidth="4.5"
                  strokeDasharray="35, 100"
                />
                {/* Fruits (25%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="4.5"
                  strokeDasharray="25, 100"
                  strokeDashoffset="-35"
                />
                {/* Vegetables (20%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="4.5"
                  strokeDasharray="20, 100"
                  strokeDashoffset="-60"
                />
                {/* Herbs & Spices (10%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="4.5"
                  strokeDasharray="10, 100"
                  strokeDashoffset="-80"
                />
                {/* Others (10%) */}
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="4.5"
                  strokeDasharray="10, 100"
                  strokeDashoffset="-90"
                />
              </svg>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-2.5 text-xs font-semibold text-slate-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
                  <span>Leafy Vegetables</span>
                </div>
                <span className="font-bold text-slate-800">35%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
                  <span>Fruits</span>
                </div>
                <span className="font-bold text-slate-800">25%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <span>Vegetables</span>
                </div>
                <span className="font-bold text-slate-800">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  <span>Herbs & Spices</span>
                </div>
                <span className="font-bold text-slate-800">10%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span>Others</span>
                </div>
                <span className="font-bold text-slate-800">10%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Recent Orders */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-bold text-slate-800">Recent Orders</h3>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
              View All
            </button>
          </div>

          <div className="divide-y divide-slate-100 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-emerald-600">#ORD-1234</span>
                <span className="text-xs font-semibold text-slate-700">Ramesh Kumar</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-800">₹1,250</span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600">Delivered</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-emerald-600">#ORD-1233</span>
                <span className="text-xs font-semibold text-slate-700">Sneha Patel</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-800">₹860</span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-600">Processing</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-emerald-600">#ORD-1232</span>
                <span className="text-xs font-semibold text-slate-700">Amit Singh</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-800">₹420</span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-600">Shipped</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-emerald-600">#ORD-1231</span>
                <span className="text-xs font-semibold text-slate-700">Priya Sharma</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-800">₹1,560</span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-600">Delivered</span>
              </div>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-emerald-600">#ORD-1230</span>
                <span className="text-xs font-semibold text-slate-700">Vikram Joshi</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-800">₹780</span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-600">Cancelled</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Main Grid: Table & Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-[15px] font-bold text-slate-800">Leafy Vegetables List</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search fruits & vegetables..." 
                  className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-56 font-medium"
                />
              </div>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
              >
                <option value="All">All Categories (Fruits & Veggies)</option>
                <option value="Leafy Vegetables">Leafy Vegetables</option>
                <option value="Fruit">Fruits</option>
                <option value="Vegetables">Vegetables</option>
              </select>
              <button className="bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors flex items-center gap-2 text-[13px] font-semibold">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-white border-b border-slate-100 text-[13px] font-bold text-slate-800">
                  <th className="px-5 py-4 font-bold">Image</th>
                  <th className="px-5 py-4 font-bold">Name</th>
                  <th className="px-5 py-4 font-bold">Weight</th>
                  <th className="px-5 py-4 font-bold">MRP (₹)</th>
                  <th className="px-5 py-4 font-bold">Price (₹)</th>
                  <th className="px-5 py-4 font-bold">Stock</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[13px] font-semibold text-slate-600">
                {currentItems.map((veg) => (
                  <tr key={veg.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shadow-sm">
                        <img 
                          src={getImageSrc(veg)} 
                          alt={veg.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getProductImage(veg.name, veg.category);
                          }}
                          className="w-full h-full object-cover rounded-md" 
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-800 font-semibold">{veg.name}</td>
                    <td className="px-5 py-4 font-medium">{veg.weight}</td>
                    <td className="px-5 py-4 font-medium text-slate-400 line-through">₹{veg.mrp}</td>
                    <td className="px-5 py-4 font-bold text-emerald-600">₹{veg.price}</td>
                    <td className="px-5 py-4 font-medium">{veg.stock}</td>
                    <td className="px-5 py-4">
                      {veg.stock > 20 ? (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">In Stock</span>
                      ) : veg.stock > 0 ? (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600">Low Stock</span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-600">Out of Stock</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center space-x-2">
                        <button 
                          onClick={() => handleEdit(veg)}
                          className="w-7 h-7 rounded-md bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors"
                          title="Edit product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(veg.id)}
                          className="w-7 h-7 rounded-md bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                          title="Delete product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-5 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((page) => (
                <button 
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-md font-bold text-sm flex items-center justify-center transition-colors ${
                    currentPage === page 
                      ? 'bg-emerald-600 text-white' 
                      : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-md border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-semibold text-slate-400">
              Showing {filteredProducts.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
            </span>
          </div>
        </div>

        {/* Right Column: Add/Edit Form */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-[15px] font-bold text-slate-800 mb-5">
            {formData.id ? 'Edit Product' : 'Add / Edit Leafy Vegetable'}
          </h2>
          
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Vegetable Name <span className="text-red-500">*</span>
              </label>
              <input 
                ref={nameInputRef}
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter vegetable name" 
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-emerald-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Weight / Pack Size <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                placeholder="Enter weight or pack size" 
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  MRP (₹) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.mrp}
                  onChange={(e) => setFormData(prev => ({ ...prev, mrp: e.target.value }))}
                  placeholder="Enter MRP" 
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <input 
                  type="number" 
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Enter selling price" 
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input 
                type="number" 
                value={formData.stock}
                onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                placeholder="Enter stock quantity" 
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Category <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-[13px] font-medium text-slate-700 outline-none focus:border-emerald-500 bg-white"
              >
                <option value="Leafy Vegetables">Leafy Vegetables</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruit">Fruits</option>
              </select>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 mt-2">
              <button 
                type="button" 
                onClick={handleResetForm}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-[13px] font-bold hover:bg-slate-50 transition-colors"
              >
                Reset
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-[13px] font-bold hover:bg-emerald-700 transition-colors"
              >
                {formData.id ? 'Update Product' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminLeafyVegetables;
