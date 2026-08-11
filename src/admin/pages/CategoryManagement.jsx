import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  FolderPlus,
  Search,
  Tag,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

import tomatoImg from '../../assets/images/tomato.png';
import potatoImg from '../../assets/images/potato.png';
import onionImg from '../../assets/images/onion.png';
import spinachImg from '../../assets/images/leafy-vegetables/spinach.png';
import appleImg from '../../assets/images/apple.svg';

const CategoryManagement = () => {
  // Search query
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [viewCategoryModal, setViewCategoryModal] = useState(null);
  const [addSubcatModalCategory, setAddSubcatModalCategory] = useState(null);
  const [newSubcatName, setNewSubcatName] = useState('');

  // 4-Field Category Form State
  const defaultFormState = {
    id: '',
    name: '',
    image: '',
    description: '',
    status: 'Active',
  };

  const [formData, setFormData] = useState(defaultFormState);

  // Initial 10 Example Categories dataset with 8 columns & subcategories
  const initialCategories = [
    {
      id: '#CAT-101',
      name: 'Vegetables',
      image: tomatoImg,
      description: 'Fresh farm-picked root, green, and seasonal vegetables.',
      totalProducts: 120,
      status: 'Active',
      createdDate: 'Jul 20, 2024',
      subcategories: ['Root Vegetables', 'Green Vegetables', 'Seasonal Vegetables', 'Exotic Vegetables'],
    },
    {
      id: '#CAT-102',
      name: 'Fruits',
      image: appleImg,
      description: 'Orchard-fresh citrus, tropical, and imported fruits.',
      totalProducts: 85,
      status: 'Active',
      createdDate: 'Jul 19, 2024',
      subcategories: ['Citrus Fruits', 'Tropical Fruits', 'Seasonal Fruits', 'Imported Fruits'],
    },
    {
      id: '#CAT-103',
      name: 'Leafy Vegetables',
      image: spinachImg,
      description: 'Nutrient-rich organic spinach, amaranth, and herbs.',
      totalProducts: 45,
      status: 'Active',
      createdDate: 'Jul 18, 2024',
      subcategories: ['Fresh Greens', 'Herbs & Microgreens', 'Spinach Varieties'],
    },
    {
      id: '#CAT-104',
      name: 'Grains',
      image: potatoImg,
      description: 'Unpolished whole wheat, organic rice, and healthy millets.',
      totalProducts: 64,
      status: 'Active',
      createdDate: 'Jul 15, 2024',
      subcategories: ['Whole Wheat', 'Organic Rice', 'Millets & Quinoa', 'Maize'],
    },
    {
      id: '#CAT-105',
      name: 'Pulses',
      image: onionImg,
      description: 'High-protein unpolished dals and organic lentils.',
      totalProducts: 52,
      status: 'Active',
      createdDate: 'Jul 14, 2024',
      subcategories: ['Toor Dal', 'Moong Dal', 'Chana Dal', 'Rajma & Beans'],
    },
    {
      id: '#CAT-106',
      name: 'Dairy Products',
      image: '',
      description: 'Pure A2 cow milk, Vedic ghee, paneer, and fresh eggs.',
      totalProducts: 38,
      status: 'Active',
      createdDate: 'Jul 12, 2024',
      subcategories: ['A2 Milk', 'Pure Desi Ghee', 'Cottage Cheese Paneer', 'Country Eggs'],
    },
    {
      id: '#CAT-107',
      name: 'Organic Products',
      image: '',
      description: 'Certified organic vegetables, raw honey, and cold-pressed oils.',
      totalProducts: 90,
      status: 'Active',
      createdDate: 'Jul 10, 2024',
      subcategories: ['Certified Organic Veggies', 'Raw Honey', 'Cold-Pressed Oils'],
    },
    {
      id: '#CAT-108',
      name: 'Spices',
      image: '',
      description: 'Aromatic whole spices, pure turmeric, and natural herb powders.',
      totalProducts: 40,
      status: 'Active',
      createdDate: 'Jul 08, 2024',
      subcategories: ['Whole Spices', 'Ground Powders', 'Organic Herbs'],
    },
    {
      id: '#CAT-109',
      name: 'Dry Fruits',
      image: '',
      description: 'Premium almonds, walnuts, cashews, raisins, and dates.',
      totalProducts: 30,
      status: 'Active',
      createdDate: 'Jul 05, 2024',
      subcategories: ['Almonds & Walnuts', 'Cashews & Raisins', 'Dates & Figs'],
    },
    {
      id: '#CAT-110',
      name: 'Flowers',
      image: '',
      description: 'Fresh morning-harvested puja flowers and decorative garlands.',
      totalProducts: 22,
      status: 'Inactive',
      createdDate: 'Jul 01, 2024',
      subcategories: ['Fresh Puja Flowers', 'Decorative Garlands', 'Edible Organic Flowers'],
    },
  ];

  const [categories, setCategories] = useState(initialCategories);

  // Action 1: Open Add Category Modal
  const handleOpenAddModal = () => {
    setIsEditing(false);
    setFormData(defaultFormState);
    setShowAddEditModal(true);
  };

  // Action 2: Open Edit Category Modal
  const handleOpenEditModal = (cat) => {
    setIsEditing(true);
    setFormData({
      id: cat.id,
      name: cat.name,
      image: typeof cat.image === 'string' ? cat.image : '',
      description: cat.description,
      status: cat.status,
    });
    setShowAddEditModal(true);
  };

  // Save Category (Submit Form)
  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter Category Name.');
      return;
    }

    if (isEditing) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === formData.id
            ? {
                ...c,
                name: formData.name,
                image: formData.image,
                description: formData.description,
                status: formData.status,
              }
            : c
        )
      );
      toast.success(`Category "${formData.name}" updated successfully.`);
    } else {
      const newCat = {
        id: `#CAT-${Date.now().toString().slice(-3)}`,
        name: formData.name,
        image: formData.image || tomatoImg,
        description: formData.description || 'Fresh agricultural produce category.',
        totalProducts: 0,
        status: formData.status,
        createdDate: 'Today',
        subcategories: ['General Subcategory'],
      };
      setCategories([newCat, ...categories]);
      toast.success(`Category "${newCat.name}" created successfully.`);
    }

    setShowAddEditModal(false);
  };

  // Action 3: Delete Category
  const handleDeleteCategory = (id, name) => {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    toast.error(`Category "${name}" deleted.`);
  };

  // Action 5 & 6: Activate / Deactivate Category
  const handleToggleStatus = (id, currentStatus, name) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );
    toast.success(`Category "${name}" status updated to "${nextStatus}"`);
  };

  // Action 7: Add Subcategory
  const handleAddSubcategory = (e) => {
    e.preventDefault();
    if (!newSubcatName.trim() || !addSubcatModalCategory) return;

    setCategories((prev) =>
      prev.map((c) =>
        c.id === addSubcatModalCategory.id
          ? { ...c, subcategories: [...c.subcategories, newSubcatName.trim()] }
          : c
      )
    );

    toast.success(`Subcategory "${newSubcatName}" added to ${addSubcatModalCategory.name}`);
    setNewSubcatName('');
    setAddSubcatModalCategory(null);
  };

  // Filter Logic
  const filteredCategories = categories.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      c.id.toLowerCase().includes(query) ||
      c.name.toLowerCase().includes(query) ||
      c.description.toLowerCase().includes(query);

    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Category Structure & Subcategories</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Organize Farm to Home store products into customer navigation categories and subcategories.
          </p>
        </div>

        {/* Action 1: Add Category Button */}
        <button
          onClick={handleOpenAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 16px',
            backgroundColor: '#22C55E',
            color: '#FFFFFF',
            borderRadius: '10px',
            border: 'none',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
          }}
        >
          <Plus size={18} /> Create New Category
        </button>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ position: 'relative', flex: 1, minWidth: '260px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            type="text"
            placeholder="Search category name, ID, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF' }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <span style={{ fontSize: '12.5px', color: '#64748B', marginLeft: 'auto', fontWeight: 600 }}>
          Total Categories: {filteredCategories.length}
        </span>
      </div>

      {/* 8-COLUMN CATEGORY TABLE */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredCategories.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            No categories found matching your search.
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Category ID</th>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Total Products</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCategories.map((cat) => (
                  <tr key={cat.id}>
                    {/* 1. Category ID */}
                    <td style={{ fontWeight: 700, color: '#16A34A' }}>{cat.id}</td>

                    {/* 2. Category Image */}
                    <td>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: '#F8FAFC',
                          border: '1px solid #E2E8F0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          overflow: 'hidden',
                        }}
                      >
                        {typeof cat.image === 'string' && cat.image ? (
                          <img src={cat.image} alt={cat.name} style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                        ) : (
                          <Layers size={18} color="#22C55E" />
                        )}
                      </div>
                    </td>

                    {/* 3. Category Name */}
                    <td>
                      <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '14px' }}>{cat.name}</div>
                      <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {cat.subcategories.slice(0, 2).map((sub, idx) => (
                          <span key={idx} style={{ backgroundColor: '#F1F5F9', padding: '1px 5px', borderRadius: '4px' }}>
                            {sub}
                          </span>
                        ))}
                        {cat.subcategories.length > 2 && (
                          <span style={{ color: '#0284C7', fontWeight: 600 }}>+{cat.subcategories.length - 2} more</span>
                        )}
                      </div>
                    </td>

                    {/* 4. Description */}
                    <td style={{ color: '#475569', fontSize: '12.5px', maxWidth: '240px' }}>
                      {cat.description}
                    </td>

                    {/* 5. Total Products */}
                    <td style={{ fontWeight: 700, color: '#0284C7' }}>{cat.totalProducts} items</td>

                    {/* 6. Status */}
                    <td>
                      <span
                        style={{
                          backgroundColor: cat.status === 'Active' ? '#DCFCE7' : '#F1F5F9',
                          color: cat.status === 'Active' ? '#15803D' : '#64748B',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '3px 10px',
                          borderRadius: '12px',
                        }}
                      >
                        {cat.status}
                      </span>
                    </td>

                    {/* 7. Created Date */}
                    <td style={{ fontSize: '11.5px', color: '#94A3B8' }}>{cat.createdDate}</td>

                    {/* 8. Actions (7 Required Actions) */}
                    <td>
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                        {/* View Category Modal */}
                        <button
                          onClick={() => setViewCategoryModal(cat)}
                          title="View Details & Subcategories"
                          style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', cursor: 'pointer' }}
                        >
                          <Eye size={13} />
                        </button>

                        {/* Edit Category Modal */}
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          title="Edit Category"
                          style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F0FDF4', color: '#16A34A', cursor: 'pointer' }}
                        >
                          <Edit size={13} />
                        </button>

                        {/* Action 7: Add Subcategory Modal */}
                        <button
                          onClick={() => setAddSubcatModalCategory(cat)}
                          title="Add Subcategory"
                          style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#E0F2FE', color: '#0284C7', cursor: 'pointer' }}
                        >
                          <FolderPlus size={13} />
                        </button>

                        {/* Action 5 & 6: Activate / Deactivate Toggle */}
                        <button
                          onClick={() => handleToggleStatus(cat.id, cat.status, cat.name)}
                          title={cat.status === 'Active' ? 'Deactivate Category' : 'Activate Category'}
                          style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: cat.status === 'Active' ? '#FEF2F2' : '#DCFCE7', color: cat.status === 'Active' ? '#DC2626' : '#15803D', cursor: 'pointer' }}
                        >
                          {cat.status === 'Active' ? <XCircle size={13} /> : <CheckCircle2 size={13} />}
                        </button>

                        {/* Action 3: Delete Category */}
                        <button
                          onClick={() => handleDeleteCategory(cat.id, cat.name)}
                          title="Delete Category"
                          style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: 4-FIELD ADD / EDIT CATEGORY FORM */}
      {showAddEditModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setShowAddEditModal(false)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>
              {isEditing ? `Edit Category (${formData.id})` : 'Create New Category (4 Fields)'}
            </h3>

            <form onSubmit={handleSaveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Field 1: Category Name */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>1. Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Organic Pulses & Spices"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              {/* Field 2: Category Image URL */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>2. Category Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              {/* Field 3: Category Description */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>3. Category Description</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of products included..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              {/* Field 4: Category Status */}
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>4. Category Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddEditModal(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#22C55E', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  {isEditing ? 'Save Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: VIEW CATEGORY & SUBCATEGORIES */}
      {viewCategoryModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setViewCategoryModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '480px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>{viewCategoryModal.name}</h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>{viewCategoryModal.id} • {viewCategoryModal.totalProducts} Total Products</span>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#475569', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', border: '1px solid #E2E8F0', margin: '0 0 16px 0' }}>
              {viewCategoryModal.description}
            </p>

            {/* Subcategories List */}
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', margin: '0 0 10px 0' }}>Listed Subcategories ({viewCategoryModal.subcategories.length})</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {viewCategoryModal.subcategories.map((sub, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#E0F2FE',
                      color: '#0369A1',
                      fontSize: '12px',
                      fontWeight: 600,
                      borderRadius: '16px',
                      border: '1px solid #BAE6FD',
                    }}
                  >
                    🌿 {sub}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setViewCategoryModal(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD SUBCATEGORY TO CATEGORY */}
      {addSubcatModalCategory && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 200,
            padding: '20px',
          }}
          onClick={() => setAddSubcatModalCategory(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '440px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284C7', marginBottom: '14px' }}>
              <FolderPlus size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>Add Subcategory to {addSubcatModalCategory.name}</h3>
            </div>

            <form onSubmit={handleAddSubcategory}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  New Subcategory Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exotic Vegetables / Citrus Fruits"
                  value={newSubcatName}
                  onChange={(e) => setNewSubcatName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setAddSubcatModalCategory(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#0284C7', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Add Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryManagement;
