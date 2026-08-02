import React, { useState, useEffect } from 'react';
import { 
  Tags, 
  Plus, 
  Edit3, 
  Slash, 
  Search, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Percent, 
  Gift, 
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const initialCoupons = [
  {
    id: 1,
    code: 'FARM20',
    type: 'Percentage',
    value: '20% OFF',
    discountNum: 20,
    minOrder: 250,
    maxDiscount: 100,
    usedCount: 142,
    limit: 500,
    expiryDate: '2026-06-30',
    status: 'Active',
    description: 'Get 20% discount on all organic leafy vegetables.'
  },
  {
    id: 2,
    code: 'FRESH50',
    type: 'Flat Amount',
    value: '₹50 OFF',
    discountNum: 50,
    minOrder: 300,
    maxDiscount: 50,
    usedCount: 289,
    limit: 1000,
    expiryDate: '2026-07-15',
    status: 'Active',
    description: 'Flat ₹50 OFF on fresh vegetable orders above ₹300.'
  },
  {
    id: 3,
    code: 'WELCOME100',
    type: 'Flat Amount',
    value: '₹100 OFF',
    discountNum: 100,
    minOrder: 500,
    maxDiscount: 100,
    usedCount: 450,
    limit: 500,
    expiryDate: '2026-05-31',
    status: 'Active',
    description: 'Welcome offer for new customers on first checkout.'
  },
  {
    id: 4,
    code: 'ORGANIC10',
    type: 'Percentage',
    value: '10% OFF',
    discountNum: 10,
    minOrder: 200,
    maxDiscount: 50,
    usedCount: 98,
    limit: 300,
    expiryDate: '2026-08-01',
    status: 'Disabled',
    description: '10% discount on organic farm bundles.'
  }
];

const AdminOffersCoupons = () => {
  const [coupons, setCoupons] = useState(initialCoupons);
  const [search, setSearch] = useState('');
  
  // Modal States
  const [modalType, setModalType] = useState(null); // 'create' | 'edit' | 'disable'
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCoupons = async () => {
      const liveData = await adminService.getCoupons();
      if (isMounted && liveData && Array.isArray(liveData) && liveData.length > 0) {
        setCoupons(liveData);
      }
    };
    fetchCoupons();
    return () => { isMounted = false; };
  }, []);

  const [formData, setFormData] = useState({
    code: '',
    type: 'Percentage',
    discountVal: '',
    minOrder: '',
    maxDiscount: '',
    limit: 500,
    expiryDate: '2026-08-31',
    description: '',
    status: 'Active'
  });

  const filteredCoupons = coupons.filter(c => {
    if (!c) return false;
    const code = String(c.code || c.couponCode || '').toLowerCase();
    const desc = String(c.description || '').toLowerCase();
    const query = String(search || '').toLowerCase();
    return code.includes(query) || desc.includes(query);
  });

  const handleOpenCreate = () => {
    setModalType('create');
    setSelectedCoupon(null);
    setFormData({
      code: '',
      type: 'Percentage',
      discountVal: '15',
      minOrder: '200',
      maxDiscount: '75',
      limit: 500,
      expiryDate: '2026-08-31',
      description: '',
      status: 'Active'
    });
  };

  const handleOpenEdit = (c = null) => {
    const target = c || coupons[0];
    if (!target) return;
    setModalType('edit');
    setSelectedCoupon(target);
    setFormData({
      code: target.code || target.couponCode || '',
      type: target.type || 'Percentage',
      discountVal: String(target.discountNum ?? target.discountValue ?? ''),
      minOrder: String(target.minOrder ?? target.minimumOrderAmount ?? ''),
      maxDiscount: String(target.maxDiscount ?? target.maximumDiscount ?? ''),
      limit: target.limit ?? target.usageLimit ?? 500,
      expiryDate: target.expiryDate ? String(target.expiryDate).split('T')[0] : '',
      description: target.description || '',
      status: target.status || 'Active'
    });
  };

  const handleOpenDisableModal = (c = null) => {
    const target = c || coupons[0];
    if (!target) return;
    setSelectedCoupon(target);
    setModalType('disable');
  };

  const handleCloseModal = () => {
    setModalType(null);
    setSelectedCoupon(null);
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    if (!formData.code) return;

    if (modalType === 'create') {
      const created = {
        id: coupons.length + 1,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.type === 'Percentage' ? `${formData.discountVal}% OFF` : `₹${formData.discountVal} FLAT`,
        discountNum: Number(formData.discountVal) || 10,
        minOrder: Number(formData.minOrder) || 100,
        maxDiscount: Number(formData.maxDiscount) || 50,
        expiryDate: formData.expiryDate,
        status: formData.status,
        usedCount: 0,
        limit: Number(formData.limit) || 500,
        description: formData.description || 'Promotional coupon code.'
      };
      await adminService.saveCoupon(created);
      setCoupons(prev => [created, ...prev]);
      toast.success(`Coupon "${created.code}" created successfully!`);
    } else if (modalType === 'edit' && selectedCoupon) {
      await adminService.saveCoupon(formData, selectedCoupon.id);
      setCoupons(prev => prev.map(c => c.id === selectedCoupon.id ? {
        ...c,
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: formData.type === 'Percentage' ? `${formData.discountVal}% OFF` : `₹${formData.discountVal} FLAT`,
        discountNum: Number(formData.discountVal) || c.discountNum,
        minOrder: Number(formData.minOrder) || c.minOrder,
        maxDiscount: Number(formData.maxDiscount) || c.maxDiscount,
        expiryDate: formData.expiryDate,
        status: formData.status,
        description: formData.description
      } : c));
      toast.success(`Coupon "${formData.code}" updated!`);
    }

    handleCloseModal();
  };

  const handleToggleStatus = (id) => {
    setCoupons(prev => prev.map(c => {
      if (c.id === id) {
        const nextStatus = c.status === 'Active' ? 'Disabled' : 'Active';
        toast.success(`Coupon "${c.code}" is now ${nextStatus}`);
        return { ...c, status: nextStatus };
      }
      return c;
    }));
  };

  const handleConfirmDisable = () => {
    if (!selectedCoupon) return;
    handleToggleStatus(selectedCoupon.id);
    handleCloseModal();
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied to clipboard!`);
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Offers & Coupons</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Tags className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Offers & Coupons</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Manage discount coupons and promotional offers.
              </p>
            </div>
          </div>
        </div>

        {/* Top Header Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button 
            onClick={handleOpenCreate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </button>

          <button 
            onClick={() => handleOpenEdit()}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Coupon</span>
          </button>

          <button 
            onClick={() => handleOpenDisableModal()}
            className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95"
          >
            <Slash className="w-4 h-4" />
            <span>Disable Coupon</span>
          </button>
        </div>
      </div>

      {/* Featured Coupon Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {coupons.map(c => (
          <div 
            key={c.id} 
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-sm tracking-wider flex items-center gap-1.5">
                <Gift className="w-4 h-4 text-emerald-600" />
                {c.code}
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                c.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              }`}>
                {c.status}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-extrabold text-slate-800">{c.value}</h3>
              <p className="text-xs text-slate-500 font-medium line-clamp-2">{c.description}</p>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Min Order: ₹{c.minOrder}</span>
              <button 
                onClick={() => handleCopyCode(c.code)}
                className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Main Coupons Table Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-[15px] font-bold text-slate-800">All Promotional Coupons</h2>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search coupon code or offer..." 
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-emerald-500 w-64 font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[850px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[13px] font-bold text-slate-800">
                <th className="px-5 py-4">Coupon Code</th>
                <th className="px-5 py-4">Discount</th>
                <th className="px-5 py-4">Expiry Date</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[13px] font-semibold text-slate-600 divide-y divide-slate-100">
              {filteredCoupons.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                  
                  {/* Coupon Code */}
                  <td className="px-5 py-4 font-extrabold text-slate-800 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-800 font-mono tracking-wider">
                        {c.code}
                      </span>
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="px-5 py-4 font-bold text-emerald-600 text-sm">
                    {c.value} <span className="text-xs font-semibold text-slate-400 block">(Min Order: ₹{c.minOrder})</span>
                  </td>

                  {/* Expiry Date */}
                  <td className="px-5 py-4 text-xs font-medium text-slate-500">
                    {c.expiryDate}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {c.status === 'Active' ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-600">Active</span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-rose-50 text-rose-600">Disabled</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button 
                        onClick={() => handleOpenEdit(c)}
                        className="px-3 py-1.5 bg-amber-50 text-amber-600 hover:bg-amber-100 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>

                      <button 
                        onClick={() => handleToggleStatus(c.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors inline-flex items-center space-x-1 ${
                          c.status === 'Active' 
                            ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' 
                            : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {c.status === 'Active' ? <Slash className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        <span>{c.status === 'Active' ? 'Disable' : 'Enable'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {(modalType === 'create' || modalType === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-800">
                {modalType === 'create' ? 'Create New Coupon' : 'Edit Coupon'}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 text-lg font-bold">
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Coupon Code *</label>
                <input 
                  type="text" 
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. SUMMER25"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold tracking-wider text-slate-800 uppercase outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount Type</label>
                  <select 
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 bg-white outline-none focus:border-emerald-500"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat Amount">Flat Amount (₹)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Discount Value *</label>
                  <input 
                    type="number" 
                    value={formData.discountVal}
                    onChange={(e) => setFormData(prev => ({ ...prev, discountVal: e.target.value }))}
                    placeholder={formData.type === 'Percentage' ? '20 (%)' : '50 (₹)'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Order Value (₹)</label>
                  <input 
                    type="number" 
                    value={formData.minOrder}
                    onChange={(e) => setFormData(prev => ({ ...prev, minOrder: e.target.value }))}
                    placeholder="250"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Expiry Date</label>
                  <input 
                    type="date" 
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Offer Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the offer rules or terms..."
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
                  {modalType === 'create' ? 'Create Coupon' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Disable Coupon Confirmation Modal */}
      {modalType === 'disable' && selectedCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-left">
            <h3 className="text-lg font-bold text-slate-800">
              {selectedCoupon.status === 'Active' ? 'Disable Coupon' : 'Enable Coupon'}
            </h3>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              Are you sure you want to {selectedCoupon.status === 'Active' ? 'disable' : 'enable'} the coupon <span className="font-extrabold text-slate-800">"{selectedCoupon.code}"</span>?
            </p>
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
              <button 
                onClick={handleCloseModal}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDisable}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold transition-colors ${
                  selectedCoupon.status === 'Active' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {selectedCoupon.status === 'Active' ? 'Disable Coupon' : 'Enable Coupon'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminOffersCoupons;
