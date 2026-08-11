import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Settings,
  Shield,
  Bell,
  Save,
  User,
  Key,
  CreditCard,
  Truck,
  Percent,
  FileText,
  Database,
  Globe,
  Lock,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const { adminUser } = useAdminAuth();
  const [activeTab, setActiveTab] = useState('general'); // general, admin, payment, delivery, tax, notifications, security, legal, backup

  // Full 9-Section Settings State
  const [settings, setSettings] = useState({
    // 1. General Settings
    appName: 'FARM TO HOME Direct Platform',
    appLogo: '',
    favicon: 'favicon.ico',
    supportEmail: 'support@farmtohome.com',
    supportMobile: '+91 98765 00000',
    companyAddress: '42 Green Valley Road, Nashik, Maharashtra - 422003',
    currency: 'USD ($)',
    timeZone: 'Asia/Kolkata (GMT+5:30)',
    dateFormat: 'YYYY-MM-DD',
    language: 'English (US)',

    // 2. Admin Settings
    adminName: adminUser?.name || 'John Doe (Super Admin)',
    adminEmail: adminUser?.email || 'admin@farmtohome.com',
    adminMobile: '+91 98765 99999',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    profilePhoto: '',
    twoFactorAuth: true,

    // 3. Payment Settings
    enableRazorpay: true,
    enableStripe: true,
    enablePayPal: false,
    enableUPI: true,
    enableCOD: true,
    paymentGatewayKey: 'rzp_live_99887766554433',
    paymentSecretKey: 'sec_live_abcdef123456789',

    // 4. Delivery Settings
    minDeliveryCharge: 2.00,
    freeDeliveryAmount: 50.00,
    deliveryDistance: 25,
    deliveryTimeSlot: '60 Minutes',
    serviceAreas: 'Nashik Central, Panchavati, Kothrud Pune, Bandra Mumbai',

    // 5. Tax Settings
    gstPercentage: 5.0,
    farmerTax: 0.0,
    productTax: 5.0,
    deliveryTax: 5.0,
    autoTaxInvoice: true,

    // 6. Notification Settings
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    orderAlerts: true,
    farmerApprovalAlerts: true,
    deliveryAlerts: true,

    // 7. Security Settings
    jwtExpiry: '24 Hours',
    refreshTokenExpiry: '7 Days',
    sessionExpiry: '60 Minutes',
    adminRouteProtection: true,
    loginAttemptLimit: 5,
    passwordRules: 'Min 8 chars, 1 Number, 1 Special Char',
    roleBasedAccess: true,

    // 8. Legal Pages
    termsConditions: 'Welcome to Farm to Home. By accessing our platform, you agree to our organic sourcing guidelines and delivery terms...',
    privacyPolicy: 'We value your privacy. Personal information collected is strictly used for order fulfillment and farm verification...',
    refundPolicy: 'Refunds for damaged or non-fresh produce are processed within 24 hours back to original payment method...',
    cancellationPolicy: 'Orders can be cancelled free of charge up to 30 minutes before dispatch...',
    shippingPolicy: 'Fresh produce is harvested at dawn and delivered in cold-chain logistics within 2 hours of dispatch...',
    farmerAgreement: 'Farmer Partners agree to provide 100% authentic pesticide-tested produce verified by soil certificates...',
    customerAgreement: 'Customers agree to inspect fresh organic packages upon delivery...',

    // 9. Backup Settings
    autoBackup: true,
    backupFrequency: 'Daily at 12:00 AM',
    lastBackupTime: 'Jul 24, 2024 - 12:00:05 AM',
  });

  const handleSaveSettings = (e) => {
    e.preventDefault();
    toast.success('All platform configurations saved successfully!');
  };

  const handleCreateBackup = () => {
    toast.success('Database backup archive generated & saved to server cloud storage!');
  };

  const handleDownloadBackup = () => {
    toast.success('Downloading latest database backup (.sql archive)...');
  };

  const handleRestoreDatabase = () => {
    toast.success('Database restored successfully from backup image.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>System Settings & Control Center</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Manage general platform specs, admin security, payment gateways, delivery fees, taxes, notifications, legal agreements, and database backups.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
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
          <Save size={18} /> Save All Settings
        </button>
      </div>

      {/* 9 SETTINGS NAVIGATION TABS */}
      <div style={{ display: 'flex', gap: '6px', backgroundColor: '#FFFFFF', padding: '10px', borderRadius: '14px', border: '1px solid #E5E7EB', flexWrap: 'wrap' }}>
        {[
          { id: 'general', name: '1. General', icon: Globe },
          { id: 'admin', name: '2. Admin Profile', icon: User },
          { id: 'payment', name: '3. Payments', icon: CreditCard },
          { id: 'delivery', name: '4. Delivery', icon: Truck },
          { id: 'tax', name: '5. Taxes & GST', icon: Percent },
          { id: 'notifications', name: '6. Alerts', icon: Bell },
          { id: 'security', name: '7. Security', icon: Shield },
          { id: 'legal', name: '8. Legal Pages', icon: FileText },
          { id: 'backup', name: '9. DB Backups', icon: Database },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#0C3E26' : '#F8FAFC',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <Icon size={15} color={isActive ? '#22C55E' : '#64748B'} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* SETTINGS PANELS CONTAINER */}
      <form onSubmit={handleSaveSettings}>
        {/* PANEL 1: GENERAL SETTINGS */}
        {activeTab === 'general' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              🌐 1. General Application Settings
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Application Name</label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Support Mobile Number</label>
                <input
                  type="text"
                  value={settings.supportMobile}
                  onChange={(e) => setSettings({ ...settings, supportMobile: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Company Address</label>
                <input
                  type="text"
                  value={settings.companyAddress}
                  onChange={(e) => setSettings({ ...settings, companyAddress: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="USD ($)">USD ($)</option>
                  <option value="INR (₹)">INR (₹)</option>
                  <option value="EUR (€)">EUR (€)</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Time Zone</label>
                <input
                  type="text"
                  value={settings.timeZone}
                  onChange={(e) => setSettings({ ...settings, timeZone: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Date Format</label>
                <select
                  value={settings.dateFormat}
                  onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                >
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Default Language</label>
                <input
                  type="text"
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PANEL 2: ADMIN SETTINGS */}
        {activeTab === 'admin' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              👤 2. Admin Profile & Security
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Admin Name</label>
                <input
                  type="text"
                  value={settings.adminName}
                  onChange={(e) => setSettings({ ...settings, adminName: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Admin Email</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Admin Mobile</label>
                <input
                  type="text"
                  value={settings.adminMobile}
                  onChange={(e) => setSettings({ ...settings, adminMobile: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={settings.twoFactorAuth}
                    onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                    style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                  />
                  🔒 Enable Two-Factor Authentication (2FA)
                </label>
              </div>
            </div>

            <div style={{ borderTop: '1px solid #E2E8F0', marginTop: '20px', paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px' }}>Change Admin Password</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <input
                  type="password"
                  placeholder="Current Password"
                  value={settings.currentPassword}
                  onChange={(e) => setSettings({ ...settings, currentPassword: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={settings.newPassword}
                  onChange={(e) => setSettings({ ...settings, newPassword: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  value={settings.confirmPassword}
                  onChange={(e) => setSettings({ ...settings, confirmPassword: e.target.value })}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PANEL 3: PAYMENT SETTINGS */}
        {activeTab === 'payment' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              💳 3. Payment Gateways & API Keys
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enableRazorpay}
                  onChange={(e) => setSettings({ ...settings, enableRazorpay: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Enable Razorpay Payment Gateway
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enableStripe}
                  onChange={(e) => setSettings({ ...settings, enableStripe: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Enable Stripe Gateway
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enableUPI}
                  onChange={(e) => setSettings({ ...settings, enableUPI: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Enable Instant UPI Payments
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.enableCOD}
                  onChange={(e) => setSettings({ ...settings, enableCOD: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Enable Cash on Delivery (COD)
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Payment Gateway Key</label>
                <input
                  type="text"
                  value={settings.paymentGatewayKey}
                  onChange={(e) => setSettings({ ...settings, paymentGatewayKey: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Payment Secret Key</label>
                <input
                  type="password"
                  value={settings.paymentSecretKey}
                  onChange={(e) => setSettings({ ...settings, paymentSecretKey: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', fontFamily: 'monospace' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PANEL 4: DELIVERY SETTINGS */}
        {activeTab === 'delivery' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              🚚 4. Delivery & Logistics Configuration
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Minimum Delivery Charge ($)</label>
                <input
                  type="number"
                  step="0.5"
                  value={settings.minDeliveryCharge}
                  onChange={(e) => setSettings({ ...settings, minDeliveryCharge: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Free Delivery Amount ($)</label>
                <input
                  type="number"
                  step="1"
                  value={settings.freeDeliveryAmount}
                  onChange={(e) => setSettings({ ...settings, freeDeliveryAmount: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Max Delivery Distance (km)</label>
                <input
                  type="number"
                  value={settings.deliveryDistance}
                  onChange={(e) => setSettings({ ...settings, deliveryDistance: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Delivery Service Areas</label>
              <textarea
                rows="2"
                value={settings.serviceAreas}
                onChange={(e) => setSettings({ ...settings, serviceAreas: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
              />
            </div>
          </div>
        )}

        {/* PANEL 5: TAX SETTINGS */}
        {activeTab === 'tax' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              % 5. Tax & GST Invoice Settings
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>GST Percentage (%)</label>
                <input
                  type="number"
                  value={settings.gstPercentage}
                  onChange={(e) => setSettings({ ...settings, gstPercentage: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Farmer Tax (%)</label>
                <input
                  type="number"
                  value={settings.farmerTax}
                  onChange={(e) => setSettings({ ...settings, farmerTax: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Product Tax (%)</label>
                <input
                  type="number"
                  value={settings.productTax}
                  onChange={(e) => setSettings({ ...settings, productTax: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Delivery Tax (%)</label>
                <input
                  type="number"
                  value={settings.deliveryTax}
                  onChange={(e) => setSettings({ ...settings, deliveryTax: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={settings.autoTaxInvoice}
                onChange={(e) => setSettings({ ...settings, autoTaxInvoice: e.target.checked })}
                style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
              />
              📄 Automatically generate downloadable GST Tax Invoices for orders
            </label>
          </div>
        )}

        {/* PANEL 6: NOTIFICATION SETTINGS */}
        {activeTab === 'notifications' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              🔔 6. Notification & Broadcast Alerts
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Email Notifications
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.smsNotifications}
                  onChange={(e) => setSettings({ ...settings, smsNotifications: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                SMS Notifications
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) => setSettings({ ...settings, pushNotifications: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Push Notifications
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.orderAlerts}
                  onChange={(e) => setSettings({ ...settings, orderAlerts: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Instant Order Alerts
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.farmerApprovalAlerts}
                  onChange={(e) => setSettings({ ...settings, farmerApprovalAlerts: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Farmer Approval Alerts
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.deliveryAlerts}
                  onChange={(e) => setSettings({ ...settings, deliveryAlerts: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Delivery Dispatch Alerts
              </label>
            </div>
          </div>
        )}

        {/* PANEL 7: SECURITY SETTINGS */}
        {activeTab === 'security' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              🛡️ 7. Security, JWT & Session Rules
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>JWT Token Expiry</label>
                <input
                  type="text"
                  value={settings.jwtExpiry}
                  onChange={(e) => setSettings({ ...settings, jwtExpiry: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Refresh Token Duration</label>
                <input
                  type="text"
                  value={settings.refreshTokenExpiry}
                  onChange={(e) => setSettings({ ...settings, refreshTokenExpiry: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Session Idle Timeout</label>
                <input
                  type="text"
                  value={settings.sessionExpiry}
                  onChange={(e) => setSettings({ ...settings, sessionExpiry: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.adminRouteProtection}
                  onChange={(e) => setSettings({ ...settings, adminRouteProtection: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Strict Admin Route Guard (RBAC)
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.roleBasedAccess}
                  onChange={(e) => setSettings({ ...settings, roleBasedAccess: e.target.checked })}
                  style={{ accentColor: '#22C55E', width: '16px', height: '16px' }}
                />
                Enforce Password Complexity Rules
              </label>
            </div>
          </div>
        )}

        {/* PANEL 8: LEGAL PAGES */}
        {activeTab === 'legal' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              📜 8. Legal Pages & Agreements Editor
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Terms & Conditions</label>
                <textarea
                  rows="2"
                  value={settings.termsConditions}
                  onChange={(e) => setSettings({ ...settings, termsConditions: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Privacy Policy</label>
                <textarea
                  rows="2"
                  value={settings.privacyPolicy}
                  onChange={(e) => setSettings({ ...settings, privacyPolicy: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Refund & Cancellation Policy</label>
                <textarea
                  rows="2"
                  value={settings.refundPolicy}
                  onChange={(e) => setSettings({ ...settings, refundPolicy: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>Farmer Partner Agreement</label>
                <textarea
                  rows="2"
                  value={settings.farmerAgreement}
                  onChange={(e) => setSettings({ ...settings, farmerAgreement: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* PANEL 9: BACKUP SETTINGS */}
        {activeTab === 'backup' && (
          <div className="admin-card">
            <h3 className="admin-card-title" style={{ marginBottom: '16px', color: '#0F172A', fontSize: '17px' }}>
              🗄️ 9. Database Backup & Restore Management
            </h3>

            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div><strong>Automatic Cloud Backup:</strong> {settings.autoBackup ? '🟢 Active (Daily at 12:00 AM)' : 'Disabled'}</div>
              <div><strong>Last Successful Backup:</strong> {settings.lastBackupTime}</div>
              <div><strong>Database Engine:</strong> MySQL 8.0 / PostgreSQL Relational Cluster</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <button
                type="button"
                onClick={handleCreateBackup}
                style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#22C55E', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Database size={16} /> Generate Backup
              </button>

              <button
                type="button"
                onClick={handleDownloadBackup}
                style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Download size={16} /> Download .SQL Archive
              </button>

              <button
                type="button"
                onClick={handleRestoreDatabase}
                style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#EA580C', color: '#FFFFFF', border: 'none', fontWeight: 700, fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <Upload size={16} /> Restore Database
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default AdminSettings;
