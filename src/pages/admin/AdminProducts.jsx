import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  Layers,
  ArrowUpDown
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { getProductImage } from '../../utils/productImageMapper';

const initialProducts = [
  {
    id: 'PROD-101',
    name: 'Organic Spinach (Palak)',
    category: 'Leafy Vegetables',
    price: 45,
    unit: 'kg',
    stock: 50,
    status: 'In Stock',
    image: getProductImage('Organic Spinach (Palak)', 'Leafy Vegetables'),
    description: 'Fresh farm-picked organic spinach rich in iron and minerals.'
  },
  {
    id: 'PROD-102',
    name: 'Fresh Mint (Pudina)',
    category: 'Herbs & Spices',
    price: 30,
    unit: 'kg',
    stock: 8,
    status: 'Low Stock',
    image: getProductImage('Fresh Mint (Pudina)', 'Herbs & Spices'),
    description: 'Aromatic garden mint leaves harvested daily.'
  },
  {
    id: 'PROD-103',
    name: 'Fresh Coriander (Kothmir)',
    category: 'Herbs & Spices',
    price: 40,
    unit: 'kg',
    stock: 25,
    status: 'In Stock',
    image: getProductImage('Fresh Coriander (Kothmir)', 'Herbs & Spices'),
    description: 'Crisp green coriander bunches for fragrant seasoning.'
  },
  {
    id: 'PROD-104',
    name: 'Red Amaranth (Thotakura)',
    category: 'Leafy Vegetables',
    price: 55,
    unit: 'kg',
    stock: 0,
    status: 'Out of Stock',
    image: getProductImage('Red Amaranth (Thotakura)', 'Leafy Vegetables'),
    description: 'Nutritious red amaranth greens packed with vitamins.'
  },
  {
    id: 'PROD-105',
    name: 'Fenugreek Leaves (Methi)',
    category: 'Leafy Vegetables',
    price: 50,
    unit: 'kg',
    stock: 65,
    status: 'In Stock',
    image: getProductImage('Fenugreek Leaves (Methi)', 'Leafy Vegetables'),
    description: 'Tender methi leaves grown using natural compost.'
  }
];

const categoriesList = ['Leafy Vegetables', 'Herbs & Spices', 'Fruits', 'Vegetables', 'Others'];

const AdminProducts = () => {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'stock' | 'delete'
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    let isMounted = true;
    const fetchProducts = async () => {
      const liveData = await adminService.getProducts();
      if (isMounted && liveData && Array.isArray(liveData) && liveData.length > 0) {
        const mapped = liveData.map(p => {
          const categoryStr = typeof p.category === 'object' ? (p.category?.name || 'Vegetables') : (p.category || 'Vegetables');
          const resolvedImg = getProductImage(p.name, categoryStr, p.image || p.imageUrl);
          return {
            ...p,
            id: p.id,
            name: p.name,
            category: categoryStr,
            price: p.price ?? 0,
            stock: p.stock ?? p.stockQuantity ?? 0,
            image: resolvedImg
          };
        });
        setProducts(mapped);
      }
    };
    fetchProducts();
    return () => { isMounted = false; };
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Leafy Vegetables',
    price: '',
    stock: '',
    unit: 'kg',
    image: '',
    description: ''
  });

  const [stockInput, setStockInput] = useState('');

  const filteredProducts = products.filter(p => {
    if (!p) return false;
    const name = String(p.name || '').toLowerCase();
    const category = String(p.category || '').toLowerCase();
    const pid = String(p.id || '').toLowerCase();
    const query = String(search || '').toLowerCase();

    const matchesSearch = name.includes(query) || category.includes(query) || pid.includes(query);
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedProduct(null);
  };

  const handleOpenAdd = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    setFormData({
      name: '',
      category: 'Leafy Vegetables',
      price: '45',
      stock: '20',
      unit: 'kg',
      image: '',
      description: ''
    });
    setModalType('add');
  };

  const handleOpenEdit = (p) => {
    setSelectedProduct(p);
    setFormData({
      name: p.name,
      category: p.category,
      price: String(p.price),
      stock: String(p.stock),
      unit: p.unit || 'kg',
      image: p.image,
      description: p.description
    });
    setModalType('edit');
  };

  const handleOpenStock = (p) => {
    setSelectedProduct(p);
    setStockInput(String(p.stock));
    setModalType('stock');
  };

  const handleOpenDelete = (p) => {
    setSelectedProduct(p);
    setModalType('delete');
  };

  const calculateStatus = (stock) => {
    if (stock > 10) return 'In Stock';
    if (stock > 0) return 'Low Stock';
    return 'Out of Stock';
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setFormData(prev => ({ ...prev, image: url }));
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) return;

    const numStock = Number(formData.stock) || 0;
    const numPrice = Number(formData.price) || 0;
    const computedStatus = calculateStatus(numStock);

    if (modalType === 'add') {
      const formDataPayload = new FormData();
      formDataPayload.append('name', formData.name);
      formDataPayload.append('category', formData.category);
      formDataPayload.append('categoryName', formData.category);
      formDataPayload.append('price', numPrice);
      formDataPayload.append('stock', numStock);
      formDataPayload.append('availableStock', numStock);
      formDataPayload.append('unit', formData.unit || 'kg');
      formDataPayload.append('description', formData.description || 'Fresh farm produce');
      if (selectedFile) {
        formDataPayload.append('imageFile', selectedFile);
        formDataPayload.append('file', selectedFile);
      } else if (formData.image) {
        formDataPayload.append('image', formData.image);
      }

      const apiResult = await adminService.saveProduct(formDataPayload);

      const returnedImageUrl = apiResult?.imageUrl || apiResult?.image || previewUrl || formData.image;
      const resolvedDisplayImg = getProductImage(formData.name, formData.category, returnedImageUrl);

      const created = {
        id: apiResult?.id || `PROD-${100 + products.length + 1}`,
        name: formData.name,
        category: formData.category,
        price: numPrice,
        stock: numStock,
        unit: 'kg',
        status: computedStatus,
        image: resolvedDisplayImg,
        imageUrl: returnedImageUrl,
        description: formData.description || 'Fresh organic product picked directly from partner farms.'
      };
      setProducts(prev => [created, ...prev]);
      toast.success(`Product "${created.name}" added successfully with image!`);
    } else if (modalType === 'edit' && selectedProduct) {
      await adminService.saveProduct(formData, selectedProduct.id);
      setProducts(prev => prev.map(p => p.id === selectedProduct.id ? {
        ...p,
        name: formData.name,
        category: formData.category,
        price: numPrice,
        stock: numStock,
        status: computedStatus,
        image: getProductImage(formData.name, formData.category, formData.image || p.image),
        description: formData.description
      } : p));
      toast.success(`Product "${formData.name}" updated!`);
    }

    handleCloseModal();
  };

  const handleUpdateStockSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;

    const newStock = Number(stockInput) || 0;
    const computedStatus = calculateStatus(newStock);

    await adminService.updateStock(selectedProduct.id, newStock);

    setProducts(prev => prev.map(p => p.id === selectedProduct.id ? {
      ...p,
      stock: newStock,
      status: computedStatus
    } : p));

    toast.success(`Stock for "${selectedProduct.name}" updated to ${newStock} kg!`);
    handleCloseModal();
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    await adminService.deleteProduct(selectedProduct.id);
    setProducts(prev => prev.filter(p => p.id !== selectedProduct.id));
    toast.success(`Product "${selectedProduct.name}" deleted.`);
    handleCloseModal();
  };

  // Metrics
  const totalCount = products.length;
  const inStockCount = products.filter(p => p.stock > 10).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Header & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Product Management</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Product Management</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage all products available in the marketplace.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <button 
          onClick={handleOpenAdd}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95 w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{totalCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Total Products</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{inStockCount}</h3>
            <p className="text-xs font-semibold text-slate-500">In Stock Products</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{lowStockCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Low Stock Alert</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800">{outOfStockCount}</h3>
            <p className="text-xs font-semibold text-slate-500">Out of Stock</p>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-800">Marketplace Product Catalog</h2>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product name, category..." 
                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-64 font-medium"
              />
            </div>

            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-slate-200 rounded-lg text-[13px] py-2 px-3 outline-none focus:border-emerald-500 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Categories</option>
              {categoriesList.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-4">Product</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Price</th>
                <th className="px-5 py-4">Current Stock</th>
                <th className="px-5 py-4">Stock Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              {filteredProducts.map(p => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Product Details */}
                  <td className="px-5 py-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={getProductImage(p.name, p.category, p.image || p.imageUrl)} 
                        alt={p.name} 
                        onError={(e) => { e.target.src = getProductImage(p.name, p.category); }}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 shrink-0 bg-slate-100" 
                      />
                      <div>
                        <span className="font-bold text-slate-800 block text-sm">{p.name}</span>
                        <span className="text-[11px] text-emerald-600 font-bold">#{p.id}</span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-700 text-xs font-semibold">
                      {typeof p.category === 'object' ? p.category?.name || p.category?.slug || 'Vegetables' : (p.category || 'Vegetables')}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-5 py-4 font-extrabold text-slate-800 text-sm">
                    ₹{p.price} <span className="text-xs text-slate-400 font-normal">/ kg</span>
                  </td>

                  {/* Current Stock */}
                  <td className="px-5 py-4 font-bold text-slate-800">
                    {p.stock} kg
                  </td>

                  {/* Stock Status */}
                  <td className="px-5 py-4">
                    {p.status === 'In Stock' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100">
                        In Stock
                      </span>
                    )}
                    {p.status === 'Low Stock' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100">
                        Low Stock
                      </span>
                    )}
                    {p.status === 'Out of Stock' && (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-100">
                        Out of Stock
                      </span>
                    )}
                  </td>

                  {/* Actions: Edit Product, Delete Product, Update Stock */}
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      
                      {/* Update Stock Button */}
                      <button 
                        onClick={() => handleOpenStock(p)}
                        className="px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                        title="Update Stock"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Update Stock</span>
                      </button>

                      {/* Edit Product */}
                      <button 
                        onClick={() => handleOpenEdit(p)}
                        className="px-2.5 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                        title="Edit Product"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      {/* Delete Product */}
                      <button 
                        onClick={() => handleOpenDelete(p)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {modalType === 'add' ? 'Add New Product' : 'Edit Product'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Organic Spinach (Palak)"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Category *</label>
                  <select 
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:border-emerald-500"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Price per kg (₹) *</label>
                  <input 
                    type="number" 
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="45"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Initial Stock (kg) *</label>
                <input 
                  type="number" 
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  placeholder="50"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Product Image (File Upload) *</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 cursor-pointer file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 transition-all"
                />
                {previewUrl ? (
                  <div className="mt-2.5 flex items-center space-x-3 bg-emerald-50 border border-emerald-200 p-2 rounded-xl">
                    <img src={previewUrl} alt="Upload Preview" className="w-12 h-12 object-cover rounded-lg shadow-xs" />
                    <div>
                      <span className="text-xs font-extrabold text-emerald-800 block">File Selected!</span>
                      <span className="text-[10px] font-medium text-emerald-600">Will be sent via multipart/form-data</span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <input 
                      type="text" 
                      value={formData.image}
                      onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                      placeholder="Or enter direct Image URL (e.g. https://...)"
                      className="w-full px-3.5 py-2 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter fresh vegetable product description..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 resize-none"
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {modalType === 'add' ? 'Save Product' : 'Update Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Stock Modal */}
      {modalType === 'stock' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-extrabold text-slate-800">Update Stock Level</h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleUpdateStockSubmit} className="space-y-4">
              <div>
                <span className="text-xs text-slate-500 font-medium block">Product Name</span>
                <span className="text-sm font-bold text-slate-800 block">{selectedProduct.name}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">New Stock Amount (kg) *</label>
                <input 
                  type="number" 
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-base font-extrabold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {modalType === 'delete' && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-left">
            <h3 className="text-lg font-bold text-slate-800">Delete Product</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Are you sure you want to delete <span className="font-extrabold text-slate-800">"{selectedProduct.name}"</span>?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminProducts;
