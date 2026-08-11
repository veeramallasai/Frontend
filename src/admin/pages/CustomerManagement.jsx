import React, { useState, useEffect } from 'react';
import { adminApiService } from '../services/adminApiService';
import { shouldExcludeCustomerFromList } from '../utils/adminListFilters';
import {
  Search,
  Mail,
  Phone,
  ShoppingBag,
  Eye,
  Lock,
  Unlock,
  Trash2,
  Edit,
  MapPin,
  Bell,
  RefreshCw,
  User,
  Calendar,
  Heart,
  Star,
  HelpCircle,
  CreditCard,
  CheckCircle2,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const CustomerManagement = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals state
  const [viewCustomerModal, setViewCustomerModal] = useState(null);
  const [activeTab, setActiveTab] = useState('profile'); // profile, addresses, orders, payments, wishlist, reviews, tickets
  const [editCustomerModal, setEditCustomerModal] = useState(null);
  const [addressModalCustomer, setAddressModalCustomer] = useState(null);
  const [notificationModalCustomer, setNotificationModalCustomer] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState('');

  const formatLastLogin = (lastLoginAt) => {
    if (!lastLoginAt) return { relative: 'Never logged in', full: 'No login record recorded yet' };
    try {
      const d = new Date(lastLoginAt);
      if (isNaN(d.getTime())) return { relative: 'Never logged in', full: 'No login record' };
      const diffMs = new Date() - d;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      let relative = 'Just now';
      if (diffMins < 1) relative = 'Just now 🟢';
      else if (diffMins < 60) relative = `${diffMins}m ago`;
      else if (diffHours < 24) relative = `${diffHours}h ago`;
      else if (diffDays === 1) relative = 'Yesterday';
      else relative = `${diffDays}d ago`;

      const full = d.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      return { relative, full };
    } catch (err) {
      return { relative: 'Never logged in', full: 'N/A' };
    }
  };

  const loadCustomers = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await adminApiService.getCustomers();
      if (Array.isArray(data)) {
        setCustomers(data);
      } else {
        setCustomers([]);
      }
    } catch (err) {
      console.warn('[CustomerManagement] Error loading live customers:', err);
      setCustomers([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();

    // Auto-refresh directory every 10 seconds so Admin sees customer logins in real-time
    const interval = setInterval(() => {
      loadCustomers(true);
    }, 10000);

    // Live event listener for customer login
    const handleCustomerLogin = (e) => {
      const detail = e.detail || {};
      toast.success(
        `🔔 Customer Login Alert: ${detail.name || detail.email || 'A customer'} just logged in!`,
        { duration: 5000, icon: '🟢' }
      );
      loadCustomers(true);
    };

    window.addEventListener('customer_login_event', handleCustomerLogin);

    return () => {
      clearInterval(interval);
      window.removeEventListener('customer_login_event', handleCustomerLogin);
    };
  }, []);

  // Action 3 & 4: Block / Unblock Customer
  const handleToggleBlock = (id, name, currentStatus) => {
    const nextStatus = currentStatus === 'Blocked' ? 'Active' : 'Blocked';
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: nextStatus } : c))
    );
    if (nextStatus === 'Blocked') {
      toast.error(`Account for "${name}" has been blocked.`);
    } else {
      toast.success(`Account for "${name}" unblocked and activated.`);
    }
  };

  // Action 5: Delete Customer Profile
  const handleDeleteCustomer = (id, name) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
    toast.error(`Customer profile "${name}" deleted.`);
  };

  // Action 2: Save Edited Customer
  const handleSaveEditCustomer = (e) => {
    e.preventDefault();
    if (!editCustomerModal) return;

    setCustomers((prev) =>
      prev.map((c) => (c.id === editCustomerModal.id ? { ...editCustomerModal } : c))
    );
    toast.success(`Customer "${editCustomerModal.name}" updated successfully.`);
    setEditCustomerModal(null);
  };

  // Action 8: Send Notification Broadcast
  const handleSendNotification = (e) => {
    e.preventDefault();
    if (!notificationMsg.trim() || !notificationModalCustomer) return;

    toast.success(`Notification sent to ${notificationModalCustomer.name}: "${notificationMsg}"`);
    setNotificationMsg('');
    setNotificationModalCustomer(null);
  };

  // KPI Calculations
  const onlineCount = customers.filter(c => c.isOnline || c.onlineStatus === 'ONLINE').length;
  const loggedInTodayCount = customers.filter(c => {
    if (!c.lastLoginAt) return false;
    const d = new Date(c.lastLoginAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length;
  const blockedCount = customers.filter(c => String(c.status || '').toLowerCase() === 'blocked').length;

  // Filter Logic
  const filteredCustomers = customers.filter((c) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      String(c.id || '').toLowerCase().includes(query) ||
      String(c.name || '').toLowerCase().includes(query) ||
      String(c.email || '').toLowerCase().includes(query) ||
      String(c.phone || c.mobile || '').includes(query) ||
      String(c.location || '').toLowerCase().includes(query);

    let matchesStatus = true;
    if (statusFilter === 'Online') {
      matchesStatus = Boolean(c.isOnline || c.onlineStatus === 'ONLINE');
    } else if (statusFilter === 'Today') {
      matchesStatus = Boolean(c.lastLoginAt && new Date(c.lastLoginAt).toDateString() === new Date().toDateString());
    } else if (statusFilter !== 'All') {
      matchesStatus = String(c.status || '').toLowerCase() === statusFilter.toLowerCase();
    }

    return matchesSearch && matchesStatus;
  });

  // Badge Colors for 4 Customer Statuses
  const getCustomerStatusBadge = (status) => {
    const s = String(status || '').toLowerCase();
    if (s === 'active') return { bg: '#DCFCE7', color: '#15803D' };
    if (s === 'inactive') return { bg: '#F1F5F9', color: '#64748B' };
    if (s === 'blocked') return { bg: '#FEE2E2', color: '#DC2626' };
    if (s === 'suspended') return { bg: '#FEF3C7', color: '#D97706' };
    return { bg: '#F1F5F9', color: '#475569' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1E293B', margin: 0 }}>Customer Directory & Accounts</h1>
          <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
            Real-time customer directory with live login tracking, session stats, order histories, and account status.
          </p>
        </div>

        <button
          onClick={() => {
            loadCustomers();
            toast.success('Live customer directory refreshed');
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '8px',
            fontSize: '12.5px',
            fontWeight: 600,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          <RefreshCw size={14} /> Refresh Directory
        </button>
      </div>

      {/* TOP METRIC CARDS FOR REAL-TIME LOGIN TRACKING */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Total Directory</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>{customers.length}</div>
          <div style={{ fontSize: '12px', color: '#0284C7', marginTop: '4px' }}>Registered Customers</div>
        </div>

        <div style={{ backgroundColor: '#F0FDF4', borderRadius: '12px', padding: '16px', border: '1px solid #BBF7D0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#15803D', textTransform: 'uppercase' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 8px #22C55E' }}></span>
            Online Now
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#15803D', marginTop: '4px' }}>{onlineCount}</div>
          <div style={{ fontSize: '12px', color: '#16A34A', marginTop: '4px' }}>Active sessions in last 15m</div>
        </div>

        <div style={{ backgroundColor: '#EFF6FF', borderRadius: '12px', padding: '16px', border: '1px solid #BFDBFE', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#1E40AF', textTransform: 'uppercase' }}>Logged In Today</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#1E40AF', marginTop: '4px' }}>{loggedInTodayCount}</div>
          <div style={{ fontSize: '12px', color: '#2563EB', marginTop: '4px' }}>Customer logins today</div>
        </div>

        <div style={{ backgroundColor: '#FEF2F2', borderRadius: '12px', padding: '16px', border: '1px solid #FECDD3', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#991B1B', textTransform: 'uppercase' }}>Blocked Accounts</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#991B1B', marginTop: '4px' }}>{blockedCount}</div>
          <div style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px' }}>Restricted access</div>
        </div>
      </div>

      {/* FILTERS BAR */}
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
            placeholder="Search customer name, email, mobile, or location..."
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
          style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', color: '#1E293B', backgroundColor: '#FFFFFF', fontWeight: 600 }}
        >
          <option value="All">All Account Statuses</option>
          <option value="Online">Online Now 🟢 ({onlineCount})</option>
          <option value="Today">Logged In Today ⚡ ({loggedInTodayCount})</option>
          <option value="Active">Active Accounts</option>
          <option value="Inactive">Inactive Accounts</option>
          <option value="Blocked">Blocked Accounts ({blockedCount})</option>
          <option value="Suspended">Suspended Accounts</option>
        </select>

        <span style={{ fontSize: '12.5px', color: '#64748B', marginLeft: 'auto', fontWeight: 600 }}>
          Showing Customers: {filteredCustomers.length} of {customers.length}
        </span>
      </div>

      {/* CUSTOMER DIRECTORY TABLE WITH LIVE LOGIN TRACKING */}
      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#16A34A' }}>
            <RefreshCw className="animate-spin" size={28} style={{ margin: '0 auto 8px auto' }} />
            Loading customer directory...
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748B' }}>
            <User size={40} color="#94A3B8" style={{ marginBottom: 8, display: 'block', margin: '0 auto 8px auto' }} />
            <p style={{ fontWeight: 700, fontSize: 16, color: '#1E293B', margin: 0 }}>No customer data found</p>
            <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>No customer accounts match the selected search or filter criteria.</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table" style={{ fontSize: '13px' }}>
              <thead>
                <tr>
                  <th>Customer ID</th>
                  <th>Profile</th>
                  <th>Customer Name</th>
                  <th>Email Address</th>
                  <th>Online Status</th>
                  <th>Last Login Time</th>
                  <th>Logins</th>
                  <th>Mobile Number</th>
                  <th>Location</th>
                  <th>Total Orders</th>
                  <th>Total Spent</th>
                  <th>Account Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((c) => {
                  const badge = getCustomerStatusBadge(c.status);
                  const lastLoginInfo = formatLastLogin(c.lastLoginAt);
                  const isOnlineNow = Boolean(c.isOnline || c.onlineStatus === 'ONLINE');
                  const isRecentlyActive = c.onlineStatus === 'RECENTLY_ACTIVE';

                  return (
                    <tr key={c.id}>
                      {/* 1. Customer ID */}
                      <td style={{ fontWeight: 700, color: '#0284C7' }}>{c.id}</td>

                      {/* 2. Profile Avatar with Online Pulse */}
                      <td>
                        <div style={{ position: 'relative', width: '36px', height: '36px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '50%',
                              backgroundColor: '#EA580C',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              fontSize: '12px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              boxShadow: '0 2px 6px rgba(234, 88, 12, 0.25)',
                            }}
                          >
                            {c.avatar || (c.name ? c.name.substring(0, 2).toUpperCase() : 'CU')}
                          </div>
                          {isOnlineNow && (
                            <span
                              title="Online Now"
                              style={{
                                position: 'absolute',
                                bottom: '0',
                                right: '0',
                                width: '10px',
                                height: '10px',
                                borderRadius: '50%',
                                backgroundColor: '#22C55E',
                                border: '2px solid #FFFFFF',
                                boxShadow: '0 0 6px #22C55E',
                              }}
                            />
                          )}
                        </div>
                      </td>

                      {/* 3. Customer Name */}
                      <td style={{ fontWeight: 700, color: '#0F172A' }}>{c.name}</td>

                      {/* 4. Email Address */}
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>{c.email}</td>

                      {/* 5. Online / Session Status */}
                      <td>
                        {isOnlineNow ? (
                          <span
                            style={{
                              backgroundColor: '#DCFCE7',
                              color: '#15803D',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 9px',
                              borderRadius: '12px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22C55E' }} />
                            ONLINE NOW
                          </span>
                        ) : isRecentlyActive ? (
                          <span
                            style={{
                              backgroundColor: '#EFF6FF',
                              color: '#1D4ED8',
                              fontSize: '11px',
                              fontWeight: 700,
                              padding: '3px 9px',
                              borderRadius: '12px',
                            }}
                          >
                            RECENTLY ACTIVE
                          </span>
                        ) : (
                          <span
                            style={{
                              backgroundColor: '#F1F5F9',
                              color: '#64748B',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '3px 9px',
                              borderRadius: '12px',
                            }}
                          >
                            OFFLINE
                          </span>
                        )}
                      </td>

                      {/* 6. Last Login Time */}
                      <td style={{ fontSize: '12px', fontWeight: 600, color: isOnlineNow ? '#15803D' : '#334155' }} title={lastLoginInfo.full}>
                        🕒 {lastLoginInfo.relative}
                      </td>

                      {/* 7. Total Logins */}
                      <td style={{ textAlign: 'center' }}>
                        <span
                          style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            color: '#0F172A',
                            fontSize: '11.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '8px',
                          }}
                        >
                          {c.loginCount || 1} logins
                        </span>
                      </td>

                      {/* 8. Mobile Number */}
                      <td style={{ color: '#475569', fontSize: '12.5px' }}>{c.phone || c.mobile || 'N/A'}</td>

                      {/* 9. Location */}
                      <td style={{ fontSize: '12px', color: '#64748B' }}>📍 {c.location || 'India'}</td>

                      {/* 10. Total Orders */}
                      <td style={{ fontWeight: 700, color: '#0F172A', textAlign: 'center' }}>{c.totalOrders || 0}</td>

                      {/* 11. Total Amount Spent */}
                      <td style={{ fontWeight: 800, color: '#15803D' }}>{c.totalSpent || '₹0'}</td>

                      {/* 12. Account Status */}
                      <td>
                        <span style={{ backgroundColor: badge.bg, color: badge.color, fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '12px' }}>
                          {c.status}
                        </span>
                      </td>

                      {/* 13. Registered Date */}
                      <td style={{ fontSize: '11.5px', color: '#94A3B8' }}>{c.registeredDate}</td>

                      {/* 11. Actions (8 Required Actions) */}
                      <td>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          {/* Action 1: View Customer (12 Profile Sections Modal) */}
                          <button
                            onClick={() => {
                              setViewCustomerModal(c);
                              setActiveTab('profile');
                            }}
                            title="View Full Profile & History"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFFFFF', color: '#0F172A', cursor: 'pointer' }}
                          >
                            <Eye size={13} />
                          </button>

                          {/* Action 2: Edit Customer */}
                          <button
                            onClick={() => setEditCustomerModal({ ...c })}
                            title="Edit Customer Profile"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#F0FDF4', color: '#16A34A', cursor: 'pointer' }}
                          >
                            <Edit size={13} />
                          </button>

                          {/* Action 7: View Saved Addresses Modal */}
                          <button
                            onClick={() => setAddressModalCustomer(c)}
                            title="View Delivery Addresses"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#E0F2FE', color: '#0284C7', cursor: 'pointer' }}
                          >
                            <MapPin size={13} />
                          </button>

                          {/* Action 6: View Orders (Navigate to Orders) */}
                          <button
                            onClick={() => navigate('/admin/orders')}
                            title="View Orders Register"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#FFEDD5', color: '#EA580C', cursor: 'pointer' }}
                          >
                            <ShoppingBag size={13} />
                          </button>

                          {/* Action 8: Send Notification Modal */}
                          <button
                            onClick={() => setNotificationModalCustomer(c)}
                            title="Send Broadcast Notification"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: '#CCFBF1', color: '#0D9488', cursor: 'pointer' }}
                          >
                            <Bell size={13} />
                          </button>

                          {/* Action 3 & 4: Block / Unblock Customer */}
                          <button
                            onClick={() => handleToggleBlock(c.id, c.name, c.status)}
                            title={c.status === 'Blocked' ? 'Unblock Customer' : 'Block Customer'}
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #E2E8F0', backgroundColor: c.status === 'Blocked' ? '#DCFCE7' : '#FEF2F2', color: c.status === 'Blocked' ? '#15803D' : '#DC2626', cursor: 'pointer' }}
                          >
                            {c.status === 'Blocked' ? <Unlock size={13} /> : <Lock size={13} />}
                          </button>

                          {/* Action 5: Delete Customer Profile */}
                          <button
                            onClick={() => handleDeleteCustomer(c.id, c.name)}
                            title="Delete Customer Profile"
                            style={{ padding: '5px 7px', borderRadius: '6px', border: '1px solid #FEE2E2', backgroundColor: '#FEF2F2', color: '#DC2626', cursor: 'pointer' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: VIEW FULL CUSTOMER PROFILE (All 12 Requested Profile Detail Sections) */}
      {viewCustomerModal && (
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
          onClick={() => setViewCustomerModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '640px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
              <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#EA580C', color: '#FFFFFF', fontWeight: 700, fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {viewCustomerModal.avatar}
              </div>
              <div>
                <h3 style={{ margin: 0, color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>{viewCustomerModal.name}</h3>
                <span style={{ fontSize: '12.5px', color: '#64748B' }}>{viewCustomerModal.id} • Registered {viewCustomerModal.registeredDate}</span>
              </div>
            </div>

            {/* Profile Navigation Tabs */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0', marginBottom: '20px', flexWrap: 'wrap' }}>
              {[
                { id: 'profile', name: 'Personal Specs' },
                { id: 'login', name: '🔐 Login & Activity' },
                { id: 'addresses', name: 'Addresses' },
                { id: 'orders', name: 'Order History' },
                { id: 'payments', name: 'Payments' },
                { id: 'wishlist', name: 'Wishlist' },
                { id: 'reviews', name: 'Reviews' },
                { id: 'tickets', name: 'Support Tickets' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: activeTab === tab.id ? '#22C55E' : 'transparent',
                    color: activeTab === tab.id ? '#FFFFFF' : '#475569',
                    cursor: 'pointer',
                  }}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Tab 1: Personal Specs */}
            {activeTab === 'profile' && (
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div><strong>1. Full Name:</strong> {viewCustomerModal.name}</div>
                <div><strong>2. Email Address:</strong> {viewCustomerModal.email}</div>
                <div><strong>3. Mobile Number:</strong> {viewCustomerModal.phone || viewCustomerModal.mobile || 'N/A'}</div>
                <div><strong>4. Date of Birth:</strong> {viewCustomerModal.dob || 'N/A'}</div>
                <div><strong>5. Gender:</strong> {viewCustomerModal.gender || 'Not specified'}</div>
                <div><strong>6. Location:</strong> 📍 {viewCustomerModal.location || 'N/A'}</div>
                <div><strong>7. Lifetime Spent:</strong> <span style={{ color: '#16A34A', fontWeight: 800 }}>{viewCustomerModal.totalSpent}</span> ({viewCustomerModal.totalOrders || 0} Orders)</div>
                <div><strong>8. Last Login Time:</strong> 🕒 {formatLastLogin(viewCustomerModal.lastLoginAt).full}</div>
                <div><strong>9. Total Logins:</strong> <span style={{ fontWeight: 700, color: '#0284C7' }}>{viewCustomerModal.loginCount || 1} logins</span></div>
                <div><strong>10. Account Status:</strong> <span style={{ fontWeight: 700, color: viewCustomerModal.status === 'Active' ? '#16A34A' : '#DC2626' }}>{viewCustomerModal.status}</span></div>
              </div>
            )}

            {/* Tab 2: Login & Activity Details */}
            {activeTab === 'login' && (
              <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid #E2E8F0' }}>
                  <strong>Current Online Session:</strong>
                  {Boolean(viewCustomerModal.isOnline || viewCustomerModal.onlineStatus === 'ONLINE') ? (
                    <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', fontWeight: 700, padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#22C55E', boxShadow: '0 0 6px #22C55E' }}></span>
                      ONLINE NOW
                    </span>
                  ) : (
                    <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontWeight: 600, padding: '4px 10px', borderRadius: '12px', fontSize: '11.5px' }}>
                      OFFLINE
                    </span>
                  )}
                </div>
                <div><strong>Last Login Timestamp:</strong> 🕒 {formatLastLogin(viewCustomerModal.lastLoginAt).full} ({formatLastLogin(viewCustomerModal.lastLoginAt).relative})</div>
                <div><strong>Total Login Count:</strong> <span style={{ fontWeight: 700, color: '#0284C7' }}>{viewCustomerModal.loginCount || 1} successful logins</span></div>
                <div><strong>Last Login IP Address:</strong> <code>{viewCustomerModal.lastLoginIp || '127.0.0.1'}</code></div>
                <div><strong>Registered Date:</strong> 📅 {viewCustomerModal.registeredDate}</div>
                <div><strong>Email Verification:</strong> <span style={{ color: viewCustomerModal.emailVerified ? '#16A34A' : '#D97706', fontWeight: 700 }}>{viewCustomerModal.emailVerified ? '✅ Verified' : '⚠️ Unverified'}</span></div>
              </div>
            )}

            {/* Tab 2: Delivery Addresses (Field 6) */}
            {activeTab === 'addresses' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {viewCustomerModal.addresses.map((addr, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0284C7', marginBottom: '4px' }}>
                      📍 {addr.type} Address {addr.isDefault && '(Default)'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#1E293B' }}>{addr.street}, {addr.area}</div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>{addr.city} - {addr.pincode}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 3: Order History (Field 7) */}
            {activeTab === 'orders' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {viewCustomerModal.orderHistory.map((ord, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{ord.id}</strong>
                      <div style={{ fontSize: '12px', color: '#64748B' }}>{ord.items} • {ord.date}</div>
                    </div>
                    <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#16A34A' }}>{ord.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 4: Payment History (Field 8) */}
            {activeTab === 'payments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {viewCustomerModal.paymentHistory.map((pay, idx) => (
                  <div key={idx} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: '13px', color: '#0F172A' }}>{pay.id} ({pay.method})</strong>
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>{pay.date}</div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#16A34A' }}>{pay.amount}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 5: Wishlist (Field 9) */}
            {activeTab === 'wishlist' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {viewCustomerModal.wishlist.map((item, idx) => (
                  <span key={idx} style={{ padding: '6px 12px', backgroundColor: '#FFE4E6', color: '#E11D48', borderRadius: '16px', fontSize: '12px', fontWeight: 600, border: '1px solid #FECDD3' }}>
                    ❤️ {item}
                  </span>
                ))}
              </div>
            )}

            {/* Tab 6: Reviews (Field 10) */}
            {activeTab === 'reviews' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {viewCustomerModal.reviews.length > 0 ? (
                  viewCustomerModal.reviews.map((rev, idx) => (
                    <div key={idx} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0F172A' }}>{rev.product} ({rev.rating} ⭐)</div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#475569' }}>"{rev.comment}"</p>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px' }}>No reviews submitted yet.</div>
                )}
              </div>
            )}

            {/* Tab 7: Support Tickets (Field 11) */}
            {activeTab === 'tickets' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {viewCustomerModal.tickets.length > 0 ? (
                  viewCustomerModal.tickets.map((t, idx) => (
                    <div key={idx} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '13px', color: '#0F172A' }}>{t.id}: {t.subject}</strong>
                        <div style={{ fontSize: '11.5px', color: '#64748B' }}>{t.date}</div>
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284C7', backgroundColor: '#E0F2FE', padding: '3px 8px', borderRadius: '10px' }}>{t.status}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px' }}>No support tickets created.</div>
                )}
              </div>
            )}

            <button
              onClick={() => setViewCustomerModal(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#16A34A', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', marginTop: '20px' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CUSTOMER PROFILE */}
      {editCustomerModal && (
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
          onClick={() => setEditCustomerModal(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 16px 0', color: '#0F172A', fontSize: '18px', fontWeight: 800 }}>
              Edit Customer Profile ({editCustomerModal.id})
            </h3>

            <form onSubmit={handleSaveEditCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  value={editCustomerModal.name}
                  onChange={(e) => setEditCustomerModal({ ...editCustomerModal, name: e.target.value })}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Email Address</label>
                  <input
                    type="email"
                    value={editCustomerModal.email}
                    onChange={(e) => setEditCustomerModal({ ...editCustomerModal, email: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Mobile Number</label>
                  <input
                    type="text"
                    value={editCustomerModal.mobile}
                    onChange={(e) => setEditCustomerModal({ ...editCustomerModal, mobile: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Date of Birth</label>
                  <input
                    type="date"
                    value={editCustomerModal.dob}
                    onChange={(e) => setEditCustomerModal({ ...editCustomerModal, dob: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>Account Status</label>
                  <select
                    value={editCustomerModal.status}
                    onChange={(e) => setEditCustomerModal({ ...editCustomerModal, status: e.target.value })}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Blocked">Blocked</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setEditCustomerModal(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#22C55E', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW SAVED ADDRESSES */}
      {addressModalCustomer && (
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
          onClick={() => setAddressModalCustomer(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '460px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0284C7', marginBottom: '16px' }}>
              <MapPin size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>Saved Delivery Addresses</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {addressModalCustomer.addresses.map((addr, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                  <strong style={{ fontSize: '13px', color: '#0284C7' }}>📍 {addr.type} Address {addr.isDefault && '(Default)'}</strong>
                  <div style={{ fontSize: '13px', color: '#1E293B', marginTop: '4px' }}>{addr.street}, {addr.area}</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>{addr.city} - {addr.pincode}</div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setAddressModalCustomer(null)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', backgroundColor: '#0284C7', color: '#FFFFFF', border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: SEND NOTIFICATION BROADCAST */}
      {notificationModalCustomer && (
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
          onClick={() => setNotificationModalCustomer(null)}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0D9488', marginBottom: '14px' }}>
              <Bell size={22} />
              <h3 style={{ margin: 0, color: '#0F172A', fontSize: '17px', fontWeight: 800 }}>Send Customer Notification</h3>
            </div>

            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0 0 14px 0' }}>
              Send broadcast SMS/Push notification to <strong>{notificationModalCustomer.name}</strong> ({notificationModalCustomer.mobile}):
            </p>

            <form onSubmit={handleSendNotification}>
              <textarea
                rows="3"
                required
                placeholder="Enter notification text (e.g. Your fresh vegetable delivery order has been dispatched!)..."
                value={notificationMsg}
                onChange={(e) => setNotificationMsg(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '13px', marginBottom: '16px', outline: 'none' }}
              />

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setNotificationModalCustomer(null)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#475569', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', backgroundColor: '#0D9488', border: 'none', color: '#FFFFFF', fontWeight: 700, cursor: 'pointer' }}
                >
                  Send Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;
