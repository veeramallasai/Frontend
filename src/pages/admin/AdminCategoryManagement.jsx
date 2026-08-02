import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  FolderPlus,
  Package,
  Eye,
  MoreVertical
} from 'lucide-react';
import toast from 'react-hot-toast';

const initialCategories = [
  {
    id: 1,
    name: 'Leafy Vegetables',
    slug: 'leafy-vegetables',
    productCount: 36,
    status: 'Active',
    description: 'Fresh organic greens, spinach, amaranth, coriander, and herbs.',
    icon: '🥬',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop',
    displayOrder: 1
  },
  {
    id: 2,
    name: 'Fruits',
    slug: 'fruits',
    productCount: 25,
    status: 'Active',
    description: 'Farm-fresh seasonal fruits, apples, bananas, and citrus.',
    icon: '🍎',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=300&auto=format&fit=crop',
    displayOrder: 2
  },
  {
    id: 3,
    name: 'Vegetables',
    slug: 'vegetables',
    productCount: 42,
    status: 'Active',
    description: 'Organic everyday vegetables like tomatoes, potatoes, and onions.',
    icon: '🥕',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop',
    displayOrder: 3
  },
  {
    id: 4,
    name: 'Herbs & Spices',
    slug: 'herbs-spices',
    productCount: 18,
    status: 'Active',
    description: 'Aromatic herbs, fresh ginger, garlic, and traditional spices.',
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop',
    displayOrder: 4
  },
  {
    id: 5,
    name: 'Others & Dairy',
    slug: 'others-dairy',
    productCount: 12,
    status: 'Active',
    description: 'Pure farm milk, ghee, paneer, and organic essentials.',
    icon: '🥛',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop',
    displayOrder: 5
  }
];

const AdminCategoryManagement = () => {
  const [categories, setCategories] = useState(initialCategories);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [modalType, setModalType] = useState(null); // 'add' | 'edit' | 'delete'
  const [selectedCat, setSelectedCat] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🥬',
    displayOrder: 1,
    status: 'Active'
  });

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setModalType('add');
    setSelectedCat(null);
    setFormData({
      name: '',
      description: '',
      icon: '🥬',
      displayOrder: categories.length + 1,
      status: 'Active'
    });
  };

  const handleOpenEdit = (cat = null) => {
    const target = cat || categories[0];
    if (!target) return;
    setModalType('edit');
    setSelectedCat(target);
    setFormData({
      name: target.name,
      description: target.description,
      icon: target.icon,
      displayOrder: target.displayOrder,
      status: target.status
    });
  };

  const handleOpenDelete = (cat = null) => {
    const target = cat || categories[0];
    if (!target) return;
    setModalType('delete');
    setSelectedCat(target);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedCat(null);
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (modalType === 'add') {
      const newCategory = {
        id: Date.now(),
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        productCount: 0,
        status: formData.status,
        description: formData.description || 'New farm product category.',
        icon: formData.icon || '📦',
        image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=300&auto=format&fit=crop',
        displayOrder: Number(formData.displayOrder) || categories.length + 1
      };
      setCategories(prev => [...prev, newCategory]);
      toast.success(`Category "${formData.name}" created successfully!`);
    } else if (modalType === 'edit' && selectedCat) {
      setCategories(prev => prev.map(c => c.id === selectedCat.id ? {
        ...c,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        description: formData.description,
        icon: formData.icon,
        displayOrder: Number(formData.displayOrder) || c.displayOrder,
        status: formData.status
      } : c));
      toast.success(`Category "${formData.name}" updated successfully!`);
    }
    handleCloseModal();
  };

  const handleConfirmDelete = () => {
    if (!selectedCat) return;
    setCategories(prev => prev.filter(c => c.id !== selectedCat.id));
    toast.success(`Category "${selectedCat.name}" deleted successfully!`);
    handleCloseModal();
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Category Management</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Category Management</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Organize farm products, set display ordering, and control product categories.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleOpenAdd}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>

          <button 
            onClick={() => handleOpenEdit()}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Category</span>
          </button>

          <button 
            onClick={() => handleOpenDelete()}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Category</span>
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {categories.map((cat) => (
          <div 
            key={cat.id} 
            className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl p-2 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 rounded-md">
                {cat.status}
              </span>
            </div>
            
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">{cat.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 font-medium">
                {cat.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-100 text-xs font-semibold">
              <span className="text-slate-400">{cat.productCount} Products</span>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                  title="Edit Category"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleOpenDelete(cat)}
                  className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Category List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-800">All Categories</h2>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search categories..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-64 font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-4">Category Name</th>
                <th className="px-5 py-4">Slug</th>
                <th className="px-5 py-4">Products</th>
                <th className="px-5 py-4">Display Order</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              {filteredCategories.map((cat) => (
                <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl p-1.5 bg-slate-100 rounded-lg">{cat.icon}</span>
                      <div>
                        <span className="font-bold text-slate-800 block">{cat.name}</span>
                        <span className="text-xs text-slate-400 font-medium line-clamp-1">{cat.description}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-500 font-mono text-xs">
                    /{cat.slug}
                  </td>

                  <td className="px-5 py-4 font-bold text-slate-800">
                    {cat.productCount} items
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-600">
                    #{cat.displayOrder}
                  </td>

                  <td className="px-5 py-4">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">
                      {cat.status}
                    </span>
                  </td>

                  <td className="px-5 py-3">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(cat)}
                        className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button 
                        onClick={() => handleOpenDelete(cat)}
                        className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-lg text-xs font-bold transition-colors flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Category Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {modalType === 'add' ? 'Add New Category' : 'Edit Category'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category Name *</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Exotic Fruits"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Icon / Emoji</label>
                <input 
                  type="text" 
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="e.g. 🥬, 🍎, 🥦"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the category..."
                  rows={3}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Display Order</label>
                  <input 
                    type="number" 
                    value={formData.displayOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Status</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
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
                  {modalType === 'add' ? 'Create Category' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {modalType === 'delete' && selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-left">
            <h3 className="text-lg font-bold text-slate-800">Delete Category</h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Are you sure you want to delete the category <span className="font-bold text-slate-800">"{selectedCat.name}"</span>? Products under this category will remain available.
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
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminCategoryManagement;
