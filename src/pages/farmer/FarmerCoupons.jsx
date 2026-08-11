import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Percent,
  Clock,
  Sparkles,
  Tag,
  Gift
} from 'lucide-react';
import toast from 'react-hot-toast';

const FarmerCoupons = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    discountType: 'Percentage',
    discountValue: 20,
    minOrderAmount: 250,
    startDate: '2024-07-20',
    expiryDate: '2024-08-31',
    usageLimit: 500,
    status: 'Active',
  });

  const initialCoupons = [
    {
      id: 1,
      code: 'FARM20',
      discountType: 'Percentage',
      discountValue: '20% OFF',
      discountNum: 20,
      minOrderAmount: '₹250.00',
      numericMinOrder: 250,
      startDate: 'Jul 20, 2024',
      expiryDate: 'Aug 31, 2024',
      usageLimit: 500,
      usedCount: 142,
      status: 'Active',
    },
    {
      id: 2,
      code: 'FRESH50',
      discountType: 'Fixed Amount',
      discountValue: '₹50 OFF',
      discountNum: 50,
      minOrderAmount: '₹300.00',
      numericMinOrder: 300,
      startDate: 'Jul 15, 2024',
      expiryDate: 'Aug 15, 2024',
      usageLimit: 1000,
      usedCount: 289,
      status: 'Active',
    },
    {
      id: 3,
      code: 'ORGANIC10',
      discountType: 'Percentage',
      discountValue: '10% OFF',
      discountNum: 10,
      minOrderAmount: '₹200.00',
      numericMinOrder: 200,
      startDate: 'Jun 01, 2024',
      expiryDate: 'Jul 01, 2024',
      usageLimit: 300,
      usedCount: 300,
      status: 'Expired',
    },
    {
      id: 4,
      code: 'HARVEST100',
      discountType: 'Fixed Amount',
      discountValue: '₹100 OFF',
      discountNum: 100,
      minOrderAmount: '₹500.00',
      numericMinOrder: 500,
      startDate: 'Jul 01, 2024',
      expiryDate: 'Dec 31, 2024',
      usageLimit: 200,
      usedCount: 45,
      status: 'Active',
    },
  ];

  const [coupons, setCoupons] = useState(initialCoupons);

  // Stats Counters
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter((c) => c.status === 'Active').length;
  const expiredCoupons = coupons.filter((c) => c.status === 'Expired').length;

  const handleOpenAddModal = () => {
    setEditingCoupon(null);
    setFormData({
      code: '',
      discountType: 'Percentage',
      discountValue: 20,
      minOrderAmount: 250,
      startDate: '2024-07-20',
      expiryDate: '2024-08-31',
      usageLimit: 500,
      status: 'Active',
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (cpn) => {
    setEditingCoupon(cpn);
    setFormData({
      code: cpn.code,
      discountType: cpn.discountType,
      discountValue: cpn.discountNum,
      minOrderAmount: cpn.numericMinOrder,
      startDate: '2024-07-20',
      expiryDate: '2024-08-31',
      usageLimit: cpn.usageLimit,
      status: cpn.status,
    });
    setShowAddModal(true);
  };

  const handleSaveCoupon = (e) => {
    e.preventDefault();
    if (!formData.code) {
      toast.error('Please enter a Coupon Code.');
      return;
    }

    const valueStr =
      formData.discountType === 'Percentage'
        ? `${formData.discountValue}% OFF`
        : `₹${formData.discountValue} OFF`;

    if (editingCoupon) {
      setCoupons((prev) =>
        prev.map((c) =>
          c.id === editingCoupon.id
            ? {
                ...c,
                code: formData.code.toUpperCase(),
                discountType: formData.discountType,
                discountValue: valueStr,
                discountNum: Number(formData.discountValue),
                minOrderAmount: `₹${formData.minOrderAmount}.00`,
                numericMinOrder: Number(formData.minOrderAmount),
                usageLimit: Number(formData.usageLimit),
                status: formData.status,
              }
            : c
        )
      );
      toast.success(`Coupon "${formData.code}" updated.`);
    } else {
      const newCpn = {
        id: Date.now(),
        code: formData.code.toUpperCase(),
        discountType: formData.discountType,
        discountValue: valueStr,
        discountNum: Number(formData.discountValue),
        minOrderAmount: `₹${formData.minOrderAmount}.00`,
        numericMinOrder: Number(formData.minOrderAmount),
        startDate: 'Jul 24, 2024',
        expiryDate: 'Aug 31, 2024',
        usageLimit: Number(formData.usageLimit),
        usedCount: 0,
        status: formData.status,
      };
      setCoupons([newCpn, ...coupons]);
      toast.success(`Coupon "${newCpn.code}" created successfully.`);
    }

    setShowAddModal(false);
  };

  const handleToggleStatus = (id, code, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Expired' : 'Active';
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );
    if (nextStatus === 'Active') {
      toast.success(`Coupon "${code}" activated.`);
    } else {
      toast.info(`Coupon "${code}" deactivated.`);
    }
  };

  const handleDeleteCoupon = (id, code) => {
    setCoupons((prev) => prev.filter((c) => c.id !== id));
    toast.error(`Coupon "${code}" deleted.`);
  };

  const filteredCoupons = coupons.filter((c) => {
    const matchesSearch =
      !searchQuery ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase().trim());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 text-left">
      {/* Top Header & Add New Coupon Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Offers & Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your farm promotional discount codes, usage limits, and active sales campaigns.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-sm shadow-emerald-900/20 transition-all duration-200"
        >
          <Plus className="w-4 h-4" /> Add New Coupon
        </button>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Coupons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Coupons</span>
            <div className="text-2xl font-black text-slate-800 mt-1">{totalCoupons}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Ticket className="w-5 h-5" />
          </div>
        </div>

        {/* Active Coupons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Coupons</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{activeCoupons}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Expired Coupons */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expired Coupons</span>
            <div className="text-2xl font-black text-rose-600 mt-1">{expiredCoupons}</div>
          </div>
          <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <XCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupon code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Coupons List Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {filteredCoupons.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">
            No coupons found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-4 py-3">Coupon Code</th>
                  <th className="px-4 py-3">Discount Type</th>
                  <th className="px-4 py-3">Discount Value</th>
                  <th className="px-4 py-3">Min Order Amount</th>
                  <th className="px-4 py-3">Start Date</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3 text-center">Usage Limit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCoupons.map((cpn) => (
                  <tr key={cpn.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Coupon Code */}
                    <td className="px-4 py-3.5">
                      <span className="font-mono font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        {cpn.code}
                      </span>
                    </td>

                    {/* Discount Type */}
                    <td className="px-4 py-3.5 text-slate-600 font-semibold">{cpn.discountType}</td>

                    {/* Discount Value */}
                    <td className="px-4 py-3.5 font-extrabold text-amber-600">{cpn.discountValue}</td>

                    {/* Min Order Amount */}
                    <td className="px-4 py-3.5 font-semibold text-slate-800">{cpn.minOrderAmount}</td>

                    {/* Start Date */}
                    <td className="px-4 py-3.5 text-slate-500">{cpn.startDate}</td>

                    {/* Expiry Date */}
                    <td className="px-4 py-3.5 text-rose-600 font-semibold">{cpn.expiryDate}</td>

                    {/* Usage Limit */}
                    <td className="px-4 py-3.5 text-center font-bold text-slate-800">
                      {cpn.usedCount} / {cpn.usageLimit}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          cpn.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cpn.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Button */}
                        <button
                          onClick={() => handleOpenEditModal(cpn)}
                          title="Edit Coupon"
                          className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 text-slate-600 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Activate / Deactivate Button */}
                        <button
                          onClick={() => handleToggleStatus(cpn.id, cpn.code, cpn.status)}
                          title={cpn.status === 'Active' ? 'Deactivate Coupon' : 'Activate Coupon'}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            cpn.status === 'Active'
                              ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                              : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                          }`}
                        >
                          {cpn.status === 'Active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteCoupon(cpn.id, cpn.code)}
                          title="Delete Coupon"
                          className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
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
        )}
      </div>

      {/* ADD / EDIT COUPON MODAL */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-800">
              {editingCoupon ? `Edit Coupon (${formData.code})` : 'Add New Promotional Coupon'}
            </h3>

            <form onSubmit={handleSaveCoupon} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="HARVEST20"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold uppercase focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Fixed Amount">Fixed Amount (₹)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Order Amount (₹)</label>
                  <input
                    type="number"
                    value={formData.minOrderAmount}
                    onChange={(e) => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl font-medium focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm shadow-emerald-900/20 transition-colors"
                >
                  {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerCoupons;
