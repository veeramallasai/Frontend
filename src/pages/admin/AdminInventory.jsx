import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Minus, 
  RefreshCw, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  Edit2,
  Trash2,
  ChevronRight,
  TrendingUp,
  Package
} from 'lucide-react';
import leafyVegetables from '../../data/leafyVegetables';
import productsData from '../../data/products.json';
import toast from 'react-hot-toast';
import { getProductImage } from '../../utils/productImageMapper';

const getImageSrc = (item) => {
  return getProductImage(item?.name, item?.category, item?.imageUrl || item?.image);
};

const AdminInventory = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modal State for stock operations
  const [modalType, setModalType] = useState(null); // 'add' | 'remove' | 'update'
  const [activeItem, setActiveItem] = useState(null);
  const [quantityChange, setQuantityChange] = useState('');

  // Initial combined inventory dataset
  const [inventory, setInventory] = useState(() => {
    const leafy = leafyVegetables.map(item => ({
      id: `leafy-${item.id}`,
      name: item.name,
      category: 'Leafy Vegetables',
      stock: item.stock,
      minStock: 10,
      unit: item.weight,
      lastUpdated: 'Just now',
      image: item.image
    }));

    const other = (productsData || []).slice(0, 15).map(item => ({
      id: `prod-${item.id}`,
      name: item.name,
      category: item.category || 'Vegetables',
      stock: item.stockQuantity || 20,
      minStock: 10,
      unit: item.unit ? `1 ${item.unit}` : '1 kg',
      lastUpdated: 'Today, 10:30 AM',
      image: item.imageUrl
    }));

    return [...leafy, ...other];
  });

  const filteredInventory = inventory.filter(item => {
    if (!item) return false;
    const name = String(item.name || '').toLowerCase();
    const query = String(search || '').toLowerCase();
    const matchesSearch = name.includes(query);
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const itemStock = item.stock ?? 0;
    const matchesStatus = selectedStatus === 'All' 
      || (selectedStatus === 'In Stock' && itemStock > 10)
      || (selectedStatus === 'Low Stock' && itemStock > 0 && itemStock <= 10)
      || (selectedStatus === 'Out of Stock' && itemStock === 0);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Metrics
  const totalStockCount = inventory.reduce((sum, item) => sum + item.stock, 0);
  const inStockCount = inventory.filter(i => i.stock > 10).length;
  const lowStockCount = inventory.filter(i => i.stock > 0 && i.stock <= 10).length;
  const outOfStockCount = inventory.filter(i => i.stock === 0).length;

  // Actions
  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setActiveItem(item || (filteredInventory[0] || null));
    setQuantityChange('');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setActiveItem(null);
    setQuantityChange('');
  };

  const handleApplyStockAction = (e) => {
    e.preventDefault();
    if (!activeItem) return;

    const val = Number(quantityChange);
    if (isNaN(val) || val <= 0) {
      toast.error('Please enter a valid positive number');
      return;
    }

    setInventory(prev => prev.map(item => {
      if (item.id !== activeItem.id) return item;
      
      let newStock = item.stock;
      if (modalType === 'add') {
        newStock += val;
      } else if (modalType === 'remove') {
        newStock = Math.max(0, newStock - val);
      } else if (modalType === 'update') {
        newStock = val;
      }

      return {
        ...item,
        stock: newStock,
        lastUpdated: 'Just now'
      };
    }));

    const actionText = modalType === 'add' ? `Added ${val} kg to` : (modalType === 'remove' ? `Removed ${val} kg from` : `Set stock to ${val} kg for`);
    toast.success(`${actionText} ${activeItem.name}`);
    handleCloseModal();
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Inventory Management</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Inventory</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Overview &bull; Manage product stock levels.
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={() => handleOpenModal('update')}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Update Stock</span>
          </button>

          <button 
            onClick={() => handleOpenModal('add')}
            className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Inventory</span>
          </button>

          <button 
            onClick={() => handleOpenModal('remove')}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Minus className="w-4 h-4" />
            <span>Remove Inventory</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{totalStockCount.toLocaleString()} kg</h3>
            <p className="text-xs font-semibold text-slate-500">Total Stock (kg)</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{inStockCount}</h3>
            <p className="text-xs font-semibold text-slate-500">In-Stock Products</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{lowStockCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Low Stock Alerts</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center space-x-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{outOfStockCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Main Inventory Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-800">Stock Inventory List</h2>

          {/* Search & Filters */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inventory..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-52 font-medium"
              />
            </div>
            
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Leafy Vegetables">Leafy Vegetables</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruit">Fruits</option>
            </select>

            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Status</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Current Stock</th>
                <th className="px-5 py-4">Minimum Stock</th>
                <th className="px-5 py-4">Stock Status</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4 text-center">Quick Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              {filteredInventory.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  {/* Product */}
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center p-0.5 shrink-0">
                        <img 
                          src={getImageSrc(item)} 
                          alt={item.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = getProductImage(item.name, item.category);
                          }}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </div>
                      <div>
                        <span className="font-bold text-slate-800 block">{item.name}</span>
                        <span className="text-[11px] font-medium text-slate-400">{item.unit}</span>
                      </div>
                    </div>
                  </td>

                  {/* Current Stock */}
                  <td className="px-5 py-4 font-extrabold text-slate-800 text-sm">
                    {item.stock} kg
                  </td>

                  {/* Minimum Stock */}
                  <td className="px-5 py-4 text-slate-600 font-semibold">
                    {item.minStock || 10} kg
                  </td>

                  {/* Stock Status */}
                  <td className="px-5 py-4">
                    {item.stock > (item.minStock || 10) ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">In Stock</span>
                    ) : item.stock > 0 ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600">Low Stock</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-50 text-red-600">Out of Stock</span>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600">
                      {typeof item.category === 'object' ? item.category?.name || item.category?.slug || 'Vegetables' : (item.category || 'Vegetables')}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleOpenModal('add', item)}
                        className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-100 transition-colors"
                        title="Add Stock"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => handleOpenModal('remove', item)}
                        className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center hover:bg-rose-100 transition-colors"
                        title="Remove Stock"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <button 
                        onClick={() => handleOpenModal('update', item)}
                        className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                        title="Set Stock Level"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stock Action Modal */}
      {modalType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800 capitalize">
                {modalType === 'add' ? 'Add Inventory' : modalType === 'remove' ? 'Remove Inventory' : 'Update Stock Level'}
              </h3>
              <button 
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleApplyStockAction} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Product</label>
                <select 
                  value={activeItem?.id || ''}
                  onChange={(e) => setActiveItem(inventory.find(i => i.id === e.target.value) || null)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white outline-none focus:border-emerald-500"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.stock} kg in stock)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {modalType === 'add' ? 'Quantity to Add (kg)' : modalType === 'remove' ? 'Quantity to Remove (kg)' : 'New Stock Level (kg)'}
                </label>
                <input 
                  type="number" 
                  min="1"
                  value={quantityChange}
                  onChange={(e) => setQuantityChange(e.target.value)}
                  placeholder={modalType === 'update' ? 'Enter new stock in kg' : 'Enter quantity in kg'}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-colors ${
                    modalType === 'remove' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {modalType === 'add' ? 'Add (kg)' : modalType === 'remove' ? 'Remove (kg)' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminInventory;
