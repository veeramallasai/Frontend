import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Phone,
  MapPin,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  ShieldCheck,
  Clock,
  RotateCcw,
  Lock,
  X,
  Building2,
  Home as HomeIcon,
  Map,
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import CustomerSidebar from '../../components/layout/CustomerSidebar';
import toast from 'react-hot-toast';

const DEFAULT_ADDRESSES = [
  {
    id: 'addr-1',
    type: 'HOME',
    name: 'Sai Veeramalla',
    phone: '+91 98765 43210',
    line1: 'H.No 12-3-45, Street No. 5, Hitech City, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    isDefault: true,
  },
  {
    id: 'addr-2',
    type: 'WORK',
    name: 'Office Address',
    phone: '+91 99876 54321',
    line1: 'GSS Infotech, 4th Floor, Software Units Layout, Madhapur',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
    isDefault: false,
  },
  {
    id: 'addr-3',
    type: 'OTHER',
    name: 'Parents Home',
    phone: '+91 91234 56789',
    line1: 'H.No 8-2-156/1, Near Main Road, Uppal',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500039',
    isDefault: false,
  },
];

const SelectDeliveryAddress = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { addresses = [], selectedAddressId, setSelectedAddressId, addAddress, deleteAddress } = useCustomer();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [addressList, setAddressList] = useState(
    addresses && addresses.length > 0 ? addresses : DEFAULT_ADDRESSES
  );
  const [selectedId, setSelectedId] = useState(
    selectedAddressId || (addressList[0] ? addressList[0].id : 'addr-1')
  );

  // Add Address Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    type: 'HOME',
    name: '',
    phone: '',
    line1: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500081',
  });

  const handleSelect = (id) => {
    setSelectedId(id);
    if (setSelectedAddressId) {
      setSelectedAddressId(id);
    }
    toast.success('Delivery address selected');
    setTimeout(() => {
      navigate('/checkout', { state: location.state });
    }, 400);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    setAddressList((prev) => prev.filter((a) => a.id !== id));
    if (deleteAddress) {
      deleteAddress(id);
    }
    toast.success('Address deleted');
  };

  const handleOpenAddModal = (e, addressToEdit = null) => {
    if (e) e.stopPropagation();
    if (addressToEdit) {
      setEditingAddress(addressToEdit);
      setFormData({
        type: addressToEdit.type || 'HOME',
        name: addressToEdit.name || '',
        phone: addressToEdit.phone || '',
        line1: addressToEdit.line1 || '',
        city: addressToEdit.city || 'Hyderabad',
        state: addressToEdit.state || 'Telangana',
        pincode: addressToEdit.pincode || '',
      });
    } else {
      setEditingAddress(null);
      setFormData({
        type: 'HOME',
        name: '',
        phone: '',
        line1: '',
        city: 'Hyderabad',
        state: 'Telangana',
        pincode: '',
      });
    }
    setIsAddModalOpen(true);
  };

  const handleSaveAddress = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.line1.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (editingAddress) {
      setAddressList((prev) =>
        prev.map((a) => (a.id === editingAddress.id ? { ...a, ...formData } : a))
      );
      toast.success('Address updated!');
    } else {
      const newAddr = {
        id: `addr-${Date.now()}`,
        ...formData,
        isDefault: addressList.length === 0,
      };
      setAddressList((prev) => [...prev, newAddr]);
      if (addAddress) {
        addAddress(newAddr);
      }
      setSelectedId(newAddr.id);
      toast.success('New address added!');
    }

    setIsAddModalOpen(false);
  };

  return (
    <div className="customer-shop-shell bg-[#f8fafc]">
      {/* Left Navigation Sidebar */}
      <CustomerSidebar
        activeItem="addresses"
        onItemClick={(item) => {
          if (item.id === 'shop') navigate('/customer/shop');
          if (item.id === 'cart') navigate('/cart');
          if (item.id === 'dashboard') navigate('/dashboard');
        }}
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Address View */}
      <div className="customer-shop-main min-h-screen pb-6 pt-3 px-3 sm:px-4">
        <div className="mx-auto max-w-[780px] space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 border-b border-slate-200/80 pb-2.5">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 cursor-pointer active:scale-95 transition-all shadow-2xs"
                title="Go Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-800">
                  Select Delivery Address
                </h1>
                <p className="text-xs font-semibold text-slate-400">
                  Choose where you want your order to be delivered
                </p>
              </div>
            </div>

            {/* Top Right Add New Address Button */}
            <button
              type="button"
              onClick={(e) => handleOpenAddModal(e)}
              className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-emerald-50 text-[#009b5a] border-1.5 border-[#009b5a] px-3 py-1.5 rounded-lg text-xs font-black transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {/* Address Cards List */}
          <div className="space-y-2.5">
            {addressList.map((addr) => {
              const isSelected = selectedId === addr.id;

              return (
                <div
                  key={addr.id}
                  onClick={() => handleSelect(addr.id)}
                  className={`rounded-xl p-3.5 sm:p-4 transition-all duration-150 cursor-pointer relative border-1.5 ${
                    isSelected
                      ? 'bg-[#f0fdf4] border-[#009b5a] shadow-xs'
                      : 'bg-white border-slate-200 hover:border-emerald-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Address Information */}
                    <div className="space-y-1 flex-1 min-w-0 pr-4">
                      {/* Name & Type Tag */}
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-black px-2 py-0.2 rounded-md uppercase tracking-wider ${
                            addr.type === 'HOME'
                              ? 'bg-emerald-100 text-emerald-800'
                              : addr.type === 'WORK'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {addr.type || 'HOME'}
                        </span>
                        <h3 className="text-sm sm:text-base font-black text-slate-800 truncate">
                          {addr.name}
                        </h3>
                      </div>

                      {/* Phone Number */}
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span>{addr.phone}</span>
                      </div>

                      {/* Address Line */}
                      <div className="flex items-start gap-1.5 text-xs font-medium text-slate-500 leading-snug">
                        <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {addr.line1}, {addr.city}, {addr.state} - {addr.pincode}
                        </span>
                      </div>

                      {/* Default Address Tag */}
                      {addr.isDefault && (
                        <div className="pt-0.5">
                          <span className="inline-block bg-emerald-200/80 text-emerald-900 text-[10px] font-extrabold px-2 py-0.2 rounded-md">
                            Default Address
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Actions & Radio Selector */}
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Edit & Delete Action Links */}
                      <div className="flex items-center gap-2 text-xs font-bold">
                        <button
                          type="button"
                          onClick={(e) => handleOpenAddModal(e, addr)}
                          className="flex items-center gap-0.5 text-emerald-700 hover:text-emerald-900 hover:underline cursor-pointer"
                        >
                          <Pencil className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(e, addr.id)}
                          className="flex items-center gap-0.5 text-rose-600 hover:text-rose-800 hover:underline cursor-pointer"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </div>

                      {/* Selection Radio Circle */}
                      <div className="pl-1">
                        {isSelected ? (
                          <div className="h-5 w-5 rounded-full bg-[#009b5a] text-white flex items-center justify-center shadow-2xs">
                            <span className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-slate-300 bg-white" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Add New Address Dash Card */}
          <div
            onClick={(e) => handleOpenAddModal(e)}
            className="bg-white border-1.5 border-dashed border-slate-300 hover:border-[#009b5a] hover:bg-emerald-50/40 rounded-xl py-2.5 px-4 text-center cursor-pointer transition-all flex items-center justify-center gap-2 font-black text-slate-700 hover:text-[#009b5a] text-xs shadow-2xs group"
          >
            <div className="h-6 w-6 rounded-full bg-slate-100 group-hover:bg-[#009b5a] group-hover:text-white text-slate-600 flex items-center justify-center transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <span>Add New Address</span>
          </div>

          {/* Bottom Trust Badges Strip */}
          <div className="bg-[#f0fdf4] border border-[#c6f0da] rounded-xl p-3 grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white text-[#009b5a] flex items-center justify-center shrink-0 shadow-2xs">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-black text-emerald-900 leading-tight">Secure Delivery</h5>
                <p className="text-[9px] text-emerald-700 font-bold">Your orders are safe</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white text-[#009b5a] flex items-center justify-center shrink-0 shadow-2xs">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-black text-emerald-900 leading-tight">On-time Delivery</h5>
                <p className="text-[9px] text-emerald-700 font-bold">We deliver on time</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white text-[#009b5a] flex items-center justify-center shrink-0 shadow-2xs">
                <RotateCcw className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-black text-emerald-900 leading-tight">Easy Returns</h5>
                <p className="text-[9px] text-emerald-700 font-bold">Quick & hassle free</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-white text-[#009b5a] flex items-center justify-center shrink-0 shadow-2xs">
                <Lock className="h-4 w-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-black text-emerald-900 leading-tight">100% Safe Payments</h5>
                <p className="text-[9px] text-emerald-700 font-bold">Secure & trusted</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add / Edit Address Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-[20px] max-w-md w-full p-5 shadow-xl border border-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-base font-black text-slate-800">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3 text-xs">
              {/* Type Selection */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Address Type</label>
                <div className="flex gap-2">
                  {['HOME', 'WORK', 'OTHER'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-black border transition-all ${
                        formData.type === t
                          ? 'bg-[#009b5a] text-white border-[#009b5a]'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sai Veeramalla"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full h-9 px-3 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full h-9 px-3 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Street Address / Flat / House No. *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. H.No 12-3-45, Street No. 5, Madhapur"
                  value={formData.line1}
                  onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                  className="w-full p-2.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full h-9 px-2.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#009b5a] hover:bg-[#00874e] text-white text-xs font-black shadow-md cursor-pointer"
                >
                  Save & Use Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectDeliveryAddress;
