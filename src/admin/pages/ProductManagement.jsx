import React, { useEffect, useMemo, useState } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Leaf,
  Filter,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  FileSpreadsheet,
  FileText,
  CheckSquare,
  Square,
  ShoppingBag,
  DollarSign,
  Tag,
  MapPin,
  Layers,
  Percent
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';
import { getProductImage } from '../../utils/productImageMapper';

const CATEGORY_OPTIONS = ['All', 'Fruits', 'Vegetables', 'Leafy Vegetables', 'Herbs', 'Organic', 'Dairy', 'Grains', 'Pulses', 'Spices', 'Dry Fruits'];
const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Low Stock', 'Out of Stock', 'Pending Approval', 'Rejected'];
const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Name A-Z', value: 'name-asc' },
  { label: 'Name Z-A', value: 'name-desc' },
  { label: 'Price Low-High', value: 'price-asc' },
  { label: 'Price High-Low', value: 'price-desc' },
  { label: 'Stock Low-High', value: 'stock-asc' },
  { label: 'Stock High-Low', value: 'stock-desc' }
];

const DEFAULT_FORM_STATE = {
  id: '',
  productName: '',
  category: 'Vegetables',
  description: '',
  price: '',
  quantity: '',
  unit: 'kg',
  imageUrl: '',
  farmerName: '',
  farmerLocation: '',
};

const normalizeCategory = (category) => {
  if (!category) return 'Vegetables';
  if (typeof category === 'object') return category.name || category.value || category.slug || 'Vegetables';
  return String(category);
};

const normalizeStatus = (status, stock) => {
  const normalized = String(status || '').trim().toLowerCase();
  if (normalized === 'available' || normalized === 'active') return 'Active';
  if (normalized === 'inactive') return 'Inactive';
  if (normalized === 'pending' || normalized === 'pending approval') return 'Pending Approval';
  if (normalized === 'rejected') return 'Rejected';
  if (normalized === 'low_stock' || normalized === 'low stock') return 'Low Stock';
  if (normalized === 'out_of_stock' || normalized === 'out of stock') return 'Out of Stock';
  const safeStock = Number(stock || 0);
  if (safeStock <= 0) return 'Out of Stock';
  if (safeStock < 10) return 'Low Stock';
  return 'Active';
};

const normalizeProduct = (product) => {
  const category = normalizeCategory(product?.category);
  const stock = Number(product?.stock ?? product?.quantity ?? 0);
  const sellingPrice = Number(product?.sellingPrice ?? product?.price ?? 0);
  const originalPrice = Number(product?.originalPrice ?? product?.mrp ?? sellingPrice);
  const discount = Number(
    product?.discountPercentage ??
    product?.discount ??
    (originalPrice > 0 ? Math.max(0, Math.round((1 - sellingPrice / originalPrice) * 100)) : 0)
  );

  return {
    id: String(product?.id || product?.productId || ''),
    productName: product?.productName || product?.name || 'Unnamed Product',
    category,
    farmerName: product?.farmerName || product?.farmer || 'Farm Direct',
    farmerLocation: product?.farmerLocation || product?.location || 'N/A',
    quantity: Number(product?.quantity ?? 1),
    unit: product?.unit || 'kg',
    originalPrice,
    sellingPrice,
    discount,
    stock,
    status: normalizeStatus(product?.status || product?.stockStatus, stock),
    description: product?.description || 'Fresh produce from the shared catalog.',
    imageUrl: getProductImage(product?.productName || product?.name || 'Product', category, product?.imageUrl || product?.image),
    stockStatus: product?.stockStatus || (stock > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'),
    createdAt: product?.createdAt || product?.createdDate || product?.date || null,
    raw: product
  };
};

const formatCurrency = (value) => `₹${Number(value || 0).toLocaleString()}`;

const getStatusBadge = (status) => {
  switch (status) {
    case 'Active': return { bg: '#DCFCE7', color: '#15803D' };
    case 'Inactive': return { bg: '#F1F5F9', color: '#64748B' };
    case 'Low Stock': return { bg: '#FEF3C7', color: '#D97706' };
    case 'Out of Stock': return { bg: '#FEE2E2', color: '#DC2626' };
    case 'Pending Approval': return { bg: '#F3E8FF', color: '#9333EA' };
    case 'Rejected': return { bg: '#FFE4E6', color: '#E11D48' };
    default: return { bg: '#F1F5F9', color: '#475569' };
  }
};

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(500);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [formData, setFormData] = useState(DEFAULT_FORM_STATE);
  const [submitting, setSubmitting] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await adminService.getProducts();
      const rawList = Array.isArray(data) ? data : (data?.content || data?.items || []);
      setProducts(rawList.map(normalizeProduct).filter((item) => item.id));
    } catch (err) {
      console.error('Failed to fetch products:', err);
      toast.error('Unable to load product catalog from backend');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleProductsChanged = () => fetchProducts();
    window.addEventListener('admin_products_changed', handleProductsChanged);
    return () => window.removeEventListener('admin_products_changed', handleProductsChanged);
  }, []);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.id.toLowerCase().includes(query) ||
        product.productName.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.farmerName.toLowerCase().includes(query);

      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesStatus = statusFilter === 'All' || product.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, searchQuery, categoryFilter, statusFilter]);

  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    const byNumber = (a, b, key) => Number(a[key] || 0) - Number(b[key] || 0);
    list.sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        case 'name-asc': return a.productName.localeCompare(b.productName);
        case 'name-desc': return b.productName.localeCompare(a.productName);
        case 'price-asc': return byNumber(a, b, 'sellingPrice');
        case 'price-desc': return byNumber(b, a, 'sellingPrice');
        case 'stock-asc': return byNumber(a, b, 'stock');
        case 'stock-desc': return byNumber(b, a, 'stock');
        case 'newest':
        default: return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      }
    });
    return list;
  }, [filteredProducts, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / itemsPerPage));
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
    setSelectedIds([]);
  }, [searchQuery, categoryFilter, statusFilter, sortBy, itemsPerPage]);

  const summary = useMemo(() => ({
    total: products.length,
    active: products.filter((item) => item.status === 'Active').length,
    lowStock: products.filter((item) => item.status === 'Low Stock').length,
    outOfStock: products.filter((item) => item.status === 'Out of Stock').length,
  }), [products]);

  const openAddModal = () => {
    setFormMode('add');
    setSelectedProduct(null);
    setFormData(DEFAULT_FORM_STATE);
    setShowFormModal(true);
  };

  const openEditModal = (product) => {
    setFormMode('edit');
    setSelectedProduct(product);
    setFormData({
      id: product.id,
      productName: product.productName,
      category: product.category,
      description: product.description,
      price: String(product.sellingPrice),
      quantity: String(product.quantity),
      unit: product.unit,
      imageUrl: product.imageUrl,
      farmerName: product.farmerName,
      farmerLocation: product.farmerLocation,
    });
    setShowFormModal(true);
  };

  const handleSaveProduct = async (event) => {
    event.preventDefault();
    if (!formData.productName.trim() || !formData.price) return;

    setSubmitting(true);
    try {
      const payload = {
        productName: formData.productName.trim(),
        category: formData.category,
        description: formData.description.trim(),
        price: Number(formData.price),
        quantity: Number(formData.quantity || 0),
        unit: formData.unit,
        imageUrl: formData.imageUrl.trim(),
        farmerName: formData.farmerName.trim() || 'Farm Direct',
        farmerLocation: formData.farmerLocation.trim() || 'N/A',
        stockStatus: Number(formData.quantity || 0) > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK'
      };

      if (formMode === 'edit' && selectedProduct?.id) {
        await adminService.saveProduct(payload, selectedProduct.id);
        toast.success(`Product "${payload.productName}" updated successfully.`);
      } else {
        await adminService.saveProduct(payload);
        toast.success(`Product "${payload.productName}" added successfully.`);
      }

      setShowFormModal(false);
      window.dispatchEvent(new CustomEvent('admin_products_changed'));
      fetchProducts();
    } catch (err) {
      toast.error(err?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product) => {
    try {
      await adminService.deleteProduct(product.id);
      toast.success(`Product "${product.productName}" deleted.`);
      setShowDeleteModal(false);
      setSelectedProduct(null);
      setSelectedIds((prev) => prev.filter((id) => id !== product.id));
      window.dispatchEvent(new CustomEvent('admin_products_changed'));
      fetchProducts();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete product');
    }
  };

  const handleToggleSelection = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleToggleVisibleSelection = () => {
    const visibleIds = paginatedProducts.map((product) => product.id);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? selectedIds.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...selectedIds, ...visibleIds])));
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => adminService.deleteProduct(id)));
      toast.success(`${selectedIds.length} products deleted.`);
      setSelectedIds([]);
      window.dispatchEvent(new CustomEvent('admin_products_changed'));
      fetchProducts();
    } catch (err) {
      toast.error(err?.message || 'Bulk delete failed');
    }
  };

  const bulkSetStock = async (nextStock) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => adminService.updateStock(id, nextStock)));
      toast.success(`${selectedIds.length} products updated.`);
      window.dispatchEvent(new CustomEvent('admin_products_changed'));
      fetchProducts();
    } catch (err) {
      toast.error(err?.message || 'Bulk stock update failed');
    }
  };

  const exportProducts = (list, mode = 'csv') => {
    const exportList = list.length > 0 ? list : sortedProducts;
    const rows = exportList.map((item) => [
      item.id,
      item.productName,
      item.category,
      item.farmerName,
      item.quantity,
      item.unit,
      item.originalPrice,
      item.sellingPrice,
      item.discount,
      item.stock,
      item.status
    ]);

    if (mode === 'csv') {
      const header = ['Product ID', 'Product Name', 'Category', 'Farmer', 'Quantity', 'Unit', 'Original Price', 'Selling Price', 'Discount %', 'Stock', 'Status'];
      const csvContent = [header, ...rows].map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
      const link = document.createElement('a');
      link.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`;
      link.download = `product_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Catalog exported to Excel/CSV');
      return;
    }

    const popup = window.open('', '_blank', 'width=1200,height=800');
    if (!popup) {
      toast.error('Popup blocked. Allow popups to export PDF.');
      return;
    }

    popup.document.write(`
      <html>
        <head>
          <title>Product Catalog</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; color: #111827; }
            h1 { margin: 0 0 16px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #f8fafc; }
          </style>
        </head>
        <body>
          <h1>Product Catalog</h1>
          <table>
            <thead>
              <tr>
                <th>Product ID</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Farmer</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Original Price</th>
                <th>Selling Price</th>
                <th>Discount %</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map((row) => `<tr>${row.map((cell) => `<td>${String(cell)}</td>`).join('')}</tr>`).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
    toast.success('Catalog exported to PDF');
  };

  const visibleSelected = paginatedProducts.length > 0 && paginatedProducts.every((product) => selectedIds.includes(product.id));

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left bg-slate-50 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Product Catalog</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100 rounded-2xl text-emerald-700 shadow-xs">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">Product Catalog</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Live backend product inventory shared with the customer shop.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => exportProducts(paginatedProducts, 'csv')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </button>
          <button onClick={() => exportProducts(paginatedProducts, 'pdf')} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs">
            <FileText className="w-4 h-4 text-blue-600" />
            <span>Export PDF</span>
          </button>
          <button onClick={fetchProducts} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition shadow-2xs">
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>Refresh</span>
          </button>
          <button onClick={openAddModal} className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-2xs">
            <Plus className="w-4 h-4" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {[
          { title: 'Total Products', value: summary.total, icon: ShoppingBag, color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
          { title: 'Active', value: summary.active, icon: CheckCircle2, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { title: 'Low Stock', value: summary.lowStock, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-100' },
          { title: 'Out of Stock', value: summary.outOfStock, icon: XCircle, color: 'text-rose-600 bg-rose-50 border-rose-100' }
        ].map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
              <div>
                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{card.title}</h3>
                <p className="text-xl font-black text-slate-800 mt-1">{card.value}</p>
              </div>
              <div className={`p-2 rounded-lg border ${card.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Filters</h3>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button onClick={() => bulkSetStock(0)} disabled={selectedIds.length === 0} className="px-3 py-2 rounded-xl text-xs font-bold border border-rose-200 bg-rose-50 text-rose-700 disabled:opacity-50">Bulk Out of Stock</button>
            <button onClick={() => bulkSetStock(20)} disabled={selectedIds.length === 0} className="px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 disabled:opacity-50">Bulk Active</button>
            <button onClick={bulkDelete} disabled={selectedIds.length === 0} className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-white text-slate-700 disabled:opacity-50">Bulk Delete</button>
            <button onClick={() => exportProducts(products.filter((item) => selectedIds.includes(item.id)), 'csv')} disabled={selectedIds.length === 0} className="px-3 py-2 rounded-xl text-xs font-bold border border-blue-200 bg-blue-50 text-blue-700 disabled:opacity-50">Export Selected</button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_auto_auto_auto] gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by ID, name, category, or farmer" className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500" />
          </div>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            {CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category === 'All' ? 'All Categories' : category}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
            {STATUS_OPTIONS.map((status) => <option key={status} value={status}>{status === 'All' ? 'All Statuses' : status}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700">
              {SORT_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <button onClick={() => setSortBy((prev) => (prev.endsWith('asc') ? prev.replace('asc', 'desc') : prev.replace('desc', 'asc')))} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700" title="Toggle sort order">
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-slate-500 font-medium">
          <span>Showing {sortedProducts.length} products</span>
          <span>{selectedIds.length} selected</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
            <p className="text-xs font-bold">Loading live catalog...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 min-w-[1500px]">
              <thead className="bg-slate-100 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3.5 w-10">
                    <button onClick={handleToggleVisibleSelection} className="text-slate-600" title="Select visible rows">
                      {visibleSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-3.5">Product ID</th>
                  <th className="px-4 py-3.5">Image</th>
                  <th className="px-4 py-3.5">Product Name</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Farmer</th>
                  <th className="px-4 py-3.5">Quantity</th>
                  <th className="px-4 py-3.5">Unit</th>
                  <th className="px-4 py-3.5">Original Price</th>
                  <th className="px-4 py-3.5">Selling Price</th>
                  <th className="px-4 py-3.5">Discount</th>
                  <th className="px-4 py-3.5">Stock</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {paginatedProducts.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="px-6 py-12 text-center text-slate-400">
                      <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      <p className="font-bold text-slate-700">No products found.</p>
                      <p className="text-[11px] text-slate-400 mt-1">Try changing filters or refreshing the catalog.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedProducts.map((product) => {
                    const badge = getStatusBadge(product.status);
                    const isSelected = selectedIds.includes(product.id);
                    return (
                      <tr key={product.id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3.5">
                          <button onClick={() => handleToggleSelection(product.id)} className="text-slate-600" title="Select row">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-emerald-600" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="px-4 py-3.5 font-mono font-bold text-emerald-700">{product.id}</td>
                        <td className="px-4 py-3.5">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                            {product.imageUrl ? <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-contain p-1" /> : <Package className="w-5 h-5 text-slate-400" />}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-900 font-bold max-w-[220px]">
                          <div>{product.productName}</div>
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 font-bold">
                            <Leaf className="w-3 h-3" />
                            <span>Live in shared catalog</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-700">{product.category}</td>
                        <td className="px-4 py-3.5 text-slate-700">{product.farmerName}</td>
                        <td className="px-4 py-3.5 text-slate-700">{product.quantity}</td>
                        <td className="px-4 py-3.5 text-slate-700">{product.unit}</td>
                        <td className="px-4 py-3.5 text-slate-500 line-through">{formatCurrency(product.originalPrice)}</td>
                        <td className="px-4 py-3.5 font-black text-emerald-700">{formatCurrency(product.sellingPrice)}</td>
                        <td className="px-4 py-3.5"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">{product.discount}% OFF</span></td>
                        <td className="px-4 py-3.5">
                          <button onClick={() => openEditModal(product)} className="font-bold text-slate-700 underline underline-offset-2">{product.stock} units</button>
                        </td>
                        <td className="px-4 py-3.5">
                          <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setSelectedProduct(product)} className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1">
                              <Eye className="w-3.5 h-3.5 text-emerald-600" />
                              <span>View</span>
                            </button>
                            <button onClick={() => openEditModal(product)} className="px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition flex items-center gap-1">
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                            <button onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }} className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition flex items-center gap-1">
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-500">
          <span>Showing {paginatedProducts.length} of {sortedProducts.length} products</span>
          <div className="flex items-center gap-2">
            <select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))} className="px-2 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700">
              {[10, 20, 50, 100, 200, 500].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 font-bold">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-slate-700">Page {currentPage} of {totalPages}</span>
            <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(page + 1, totalPages))} className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-50 font-bold">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {showFormModal && (
        <ModalShell title={formMode === 'edit' ? 'Edit Product' : 'Add Product'} onClose={() => setShowFormModal(false)}>
          <form onSubmit={handleSaveProduct} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Field label="Product Name" value={formData.productName} onChange={(value) => setFormData((prev) => ({ ...prev, productName: value }))} required />
              <Field label="Farmer Name" value={formData.farmerName} onChange={(value) => setFormData((prev) => ({ ...prev, farmerName: value }))} />
              <Field label="Farmer Location" value={formData.farmerLocation} onChange={(value) => setFormData((prev) => ({ ...prev, farmerLocation: value }))} />
              <SelectField label="Category" value={formData.category} onChange={(value) => setFormData((prev) => ({ ...prev, category: value }))} options={CATEGORY_OPTIONS.filter((item) => item !== 'All')} />
              <Field label="Selling Price" type="number" value={formData.price} onChange={(value) => setFormData((prev) => ({ ...prev, price: value }))} required />
              <Field label="Quantity" type="number" value={formData.quantity} onChange={(value) => setFormData((prev) => ({ ...prev, quantity: value }))} />
              <SelectField label="Unit" value={formData.unit} onChange={(value) => setFormData((prev) => ({ ...prev, unit: value }))} options={['kg', 'g', 'bunch', 'pcs', 'litre', 'pack']} />
              <Field label="Image URL" value={formData.imageUrl} onChange={(value) => setFormData((prev) => ({ ...prev, imageUrl: value }))} />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
              <textarea value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} rows={3} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowFormModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">Cancel</button>
              <button type="submit" disabled={submitting} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold disabled:opacity-60">{submitting ? 'Saving...' : formMode === 'edit' ? 'Save Changes' : 'Create Product'}</button>
            </div>
          </form>
        </ModalShell>
      )}

      {selectedProduct && !showDeleteModal && (
        <ModalShell title={`Product Details: ${selectedProduct.productName}`} onClose={() => setSelectedProduct(null)} maxWidth="max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Detail label="Product ID" value={selectedProduct.id} icon={Tag} />
            <Detail label="Category" value={selectedProduct.category} icon={Layers} />
            <Detail label="Farmer" value={selectedProduct.farmerName} icon={MapPin} />
            <Detail label="Quantity" value={`${selectedProduct.quantity} ${selectedProduct.unit}`} icon={ShoppingBag} />
            <Detail label="Original Price" value={formatCurrency(selectedProduct.originalPrice)} icon={DollarSign} />
            <Detail label="Selling Price" value={formatCurrency(selectedProduct.sellingPrice)} icon={DollarSign} />
            <Detail label="Discount" value={`${selectedProduct.discount}%`} icon={Percent} />
            <Detail label="Stock" value={`${selectedProduct.stock}`} icon={Package} />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-slate-700 mt-4">
            <div className="font-bold text-slate-900 mb-1">Description</div>
            <div>{selectedProduct.description}</div>
          </div>
          <div className="flex justify-end pt-4">
            <button onClick={() => setSelectedProduct(null)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold">Close</button>
          </div>
        </ModalShell>
      )}

      {showDeleteModal && selectedProduct && (
        <ModalShell title="Delete Product" onClose={() => setShowDeleteModal(false)} maxWidth="max-w-lg">
          <p className="text-slate-600 text-sm leading-6">
            Delete <strong>{selectedProduct.productName}</strong> from the shared catalog? This removes it from both Admin and Customer Shop because they use the same backend database.
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold">Cancel</button>
            <button onClick={() => handleDeleteProduct(selectedProduct)} className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold">Delete</button>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', required = false }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</label>
    <input type={type} required={required} value={value} onChange={(event) => onChange(event.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500" />
  </div>
);

const SelectField = ({ label, value, onChange, options }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</label>
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500">
      {options.map((option) => <option key={option} value={option}>{option}</option>)}
    </select>
  </div>
);

const ModalShell = ({ title, onClose, children, maxWidth = 'max-w-3xl' }) => (
  <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
    <div className={`bg-white rounded-2xl w-full ${maxWidth} p-6 space-y-4 shadow-2xl border border-slate-200 text-xs max-h-[90vh] overflow-y-auto`}>
      <div className="flex justify-between items-center border-b pb-3 font-bold text-slate-900 text-sm">
        <span>{title}</span>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">✕</button>
      </div>
      {children}
    </div>
  </div>
);

const Detail = ({ label, value, icon: Icon }) => (
  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
    <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">
      <Icon className="w-3.5 h-3.5" />
      <span>{label}</span>
    </div>
    <div className="font-semibold text-slate-900 text-sm">{value}</div>
  </div>
);

export default ProductManagement;