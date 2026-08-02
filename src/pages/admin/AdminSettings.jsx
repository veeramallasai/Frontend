import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Key, 
  Truck, 
  Receipt, 
  Building2, 
  Sliders, 
  ChevronRight, 
  Save, 
  ShieldCheck, 
  Lock, 
  CheckCircle2,
  Globe,
  Bell,
  Mail,
  Phone
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../../services/adminService';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');

  // Option 1: Admin Profile State
  const [profile, setProfile] = useState({
    name: 'System Admin',
    email: 'admin@farmtohome.com',
    phone: '+91 98765 43210',
    role: 'Super Administrator'
  });

  // Option 2: Change Password State
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Option 3: Delivery Charges State
  const [deliverySettings, setDeliverySettings] = useState({
    flatFee: '40',
    freeDeliveryThreshold: '500',
    expressFee: '70',
    maxRadiusKm: '25'
  });

  // Option 4: Tax Settings State
  const [taxSettings, setTaxSettings] = useState({
    gstRate: '5',
    hsnCode: '0709',
    taxInclusive: true,
    gstinNumber: '36AAAAA0000A1Z5'
  });

  // Option 5: Business Details State
  const [businessDetails, setBusinessDetails] = useState({
    storeName: 'Farm2Home Fresh Marketplace',
    fssaiLicense: '10021047000189',
    registeredAddress: 'Plot 42, Green Agro Hub, Hitech City, Hyderabad - 500081',
    supportEmail: 'support@farmtohome.com',
    supportPhone: '+91 1800 123 4567'
  });

  // Option 6: App Configuration State
  const [appConfig, setAppConfig] = useState({
    maintenanceMode: false,
    autoConfirmOrders: true,
    pushNotifications: true,
    currencySymbol: '₹',
    minOrderAmount: '100'
  });

  const settingTabs = [
    { id: 'profile', name: 'Admin Profile', icon: User },
    { id: 'password', name: 'Change Password', icon: Key },
    { id: 'delivery', name: 'Delivery Charges', icon: Truck },
    { id: 'tax', name: 'Tax Settings', icon: Receipt },
    { id: 'business', name: 'Business Details', icon: Building2 },
    { id: 'config', name: 'App Configuration', icon: Sliders },
  ];

  const handleSaveTab = async (tabName) => {
    await adminService.saveSettings(tabName, {
      profile,
      deliverySettings,
      taxSettings,
      businessDetails,
      appConfig
    });
    toast.success(`"${tabName}" settings updated successfully!`);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    toast.success("Password changed successfully!");
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 text-left">
      
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center text-xs font-semibold text-slate-500 mb-2">
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5 mx-1" />
            <span className="text-slate-400">Settings</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-emerald-100 rounded-xl text-emerald-700">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Configure your marketplace preferences, store policies, tax rules, and system settings.
              </p>
            </div>
          </div>
        </div>

        {/* Global Save Button */}
        <button 
          onClick={() => handleSaveTab('Global System')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center space-x-2 transition-all shadow-sm cursor-pointer active:scale-95 w-fit"
        >
          <Save className="w-4 h-4" />
          <span>Save All Changes</span>
        </button>
      </div>

      {/* 6 Settings Option Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200">
        {settingTabs.map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Option 1: Admin Profile */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-emerald-600" />
              Admin Profile Settings
            </h3>
            <p className="text-xs text-slate-500 font-medium">Update your account administrator details and contact email.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Administrator Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address</label>
                <input 
                  type="email" 
                  value={profile.email}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone Number</label>
                <input 
                  type="text" 
                  value={profile.phone}
                  onChange={(e) => setProfile(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">System Role</label>
              <input 
                type="text" 
                value={profile.role}
                disabled 
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 bg-slate-50 cursor-not-allowed"
              />
            </div>

            <div className="pt-2">
              <button 
                onClick={() => handleSaveTab('Admin Profile')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option 2: Change Password */}
      {activeTab === 'password' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-600" />
              Change Account Password
            </h3>
            <p className="text-xs text-slate-500 font-medium">Ensure your admin account is secured with a strong password.</p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Password *</label>
              <input 
                type="password" 
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password *</label>
              <input 
                type="password" 
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password *</label>
              <input 
                type="password" 
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Option 3: Delivery Charges */}
      {activeTab === 'delivery' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-600" />
              Delivery Charges & Thresholds
            </h3>
            <p className="text-xs text-slate-500 font-medium">Configure shipping fees, free delivery minimums, and delivery radius.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Standard Flat Delivery Fee (₹)</label>
                <input 
                  type="number" 
                  value={deliverySettings.flatFee}
                  onChange={(e) => setDeliverySettings(prev => ({ ...prev, flatFee: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Free Delivery Threshold (₹)</label>
                <input 
                  type="number" 
                  value={deliverySettings.freeDeliveryThreshold}
                  onChange={(e) => setDeliverySettings(prev => ({ ...prev, freeDeliveryThreshold: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Express Priority Fee (₹)</label>
                <input 
                  type="number" 
                  value={deliverySettings.expressFee}
                  onChange={(e) => setDeliverySettings(prev => ({ ...prev, expressFee: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Delivery Radius (km)</label>
                <input 
                  type="number" 
                  value={deliverySettings.maxRadiusKm}
                  onChange={(e) => setDeliverySettings(prev => ({ ...prev, maxRadiusKm: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-purple-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => handleSaveTab('Delivery Charges')}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save Delivery Rules
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option 4: Tax Settings */}
      {activeTab === 'tax' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-blue-600" />
              Tax & GST Configuration
            </h3>
            <p className="text-xs text-slate-500 font-medium">Set up GST tax rates and invoice tax rules for fresh produce.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">GST Rate (%)</label>
                <input 
                  type="number" 
                  value={taxSettings.gstRate}
                  onChange={(e) => setTaxSettings(prev => ({ ...prev, gstRate: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Vegetables HSN Code</label>
                <input 
                  type="text" 
                  value={taxSettings.hsnCode}
                  onChange={(e) => setTaxSettings(prev => ({ ...prev, hsnCode: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">GSTIN Registration Number</label>
              <input 
                type="text" 
                value={taxSettings.gstinNumber}
                onChange={(e) => setTaxSettings(prev => ({ ...prev, gstinNumber: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 uppercase outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2">
              <button 
                onClick={() => handleSaveTab('Tax Settings')}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save Tax Configuration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option 5: Business Details */}
      {activeTab === 'business' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Business & Legal Information
            </h3>
            <p className="text-xs text-slate-500 font-medium">Store brand name, FSSAI food safety license, and registered address.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Marketplace Store Name</label>
              <input 
                type="text" 
                value={businessDetails.storeName}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, storeName: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">FSSAI License Number</label>
              <input 
                type="text" 
                value={businessDetails.fssaiLicense}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, fssaiLicense: e.target.value }))}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Registered Office Address</label>
              <textarea 
                value={businessDetails.registeredAddress}
                onChange={(e) => setBusinessDetails(prev => ({ ...prev, registeredAddress: e.target.value }))}
                rows={2}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Email</label>
                <input 
                  type="email" 
                  value={businessDetails.supportEmail}
                  onChange={(e) => setBusinessDetails(prev => ({ ...prev, supportEmail: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Support Phone</label>
                <input 
                  type="text" 
                  value={businessDetails.supportPhone}
                  onChange={(e) => setBusinessDetails(prev => ({ ...prev, supportPhone: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => handleSaveTab('Business Details')}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save Business Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Option 6: App Configuration */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-indigo-600" />
              App System Configuration
            </h3>
            <p className="text-xs text-slate-500 font-medium">System toggles, maintenance mode, and automated workflow switches.</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Maintenance Mode</h4>
                <p className="text-[11px] text-slate-400">Temporarily pause customer orders for site updates</p>
              </div>
              <button 
                onClick={() => setAppConfig(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  appConfig.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {appConfig.maintenanceMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Auto-Confirm Incoming Orders</h4>
                <p className="text-[11px] text-slate-400">Automatically accept orders upon successful payment</p>
              </div>
              <button 
                onClick={() => setAppConfig(prev => ({ ...prev, autoConfirmOrders: !prev.autoConfirmOrders }))}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  appConfig.autoConfirmOrders ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {appConfig.autoConfirmOrders ? 'Active' : 'Off'}
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <h4 className="text-xs font-bold text-slate-800">Push Notifications & SMS</h4>
                <p className="text-[11px] text-slate-400">Send automatic SMS updates on order dispatch</p>
              </div>
              <button 
                onClick={() => setAppConfig(prev => ({ ...prev, pushNotifications: !prev.pushNotifications }))}
                className={`px-3 py-1 rounded-lg text-xs font-extrabold cursor-pointer transition-colors ${
                  appConfig.pushNotifications ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {appConfig.pushNotifications ? 'Active' : 'Off'}
              </button>
            </div>

            <div className="pt-2">
              <button 
                onClick={() => handleSaveTab('App Configuration')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Save App Configuration
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminSettings;
