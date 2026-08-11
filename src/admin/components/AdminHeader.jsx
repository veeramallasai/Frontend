import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Bell, Menu, LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = ({ title = 'Dashboard', onToggleMobileSidebar }) => {
  const { adminUser, logout } = useAdminAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getInitials = (name) => {
    if (!name) return 'JD';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = adminUser?.name || 'John Doe';
  const displayInitials = getInitials(displayName);

  return (
    <header className="admin-header">
      <div className="admin-header-left">
        <button
          className="admin-mobile-menu-btn"
          onClick={onToggleMobileSidebar}
          title="Toggle Navigation"
          style={{ display: 'flex', alignItems: 'center', color: '#16A34A', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
        >
          <Menu size={22} />
        </button>
        <h1 className="admin-page-title">{title}</h1>
      </div>

      <div className="admin-header-right" style={{ gap: '20px' }}>
        {/* Notifications Button */}
        <div style={{ position: 'relative' }}>
          <button
            className="admin-icon-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            title="Notifications"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22C55E',
              padding: '6px'
            }}
          >
            <Bell size={21} />
            <span
              style={{
                position: 'absolute',
                top: '4px',
                right: '4px',
                width: '8px',
                height: '8px',
                backgroundColor: '#EF4444',
                borderRadius: '50%',
                border: '1.5px solid #FFFFFF'
              }}
            />
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '44px',
                width: '300px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1px solid #E2E8F0',
                padding: '16px',
                zIndex: 100,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: '#0F172A' }}>Notifications</span>
                <span style={{ fontSize: '12px', color: '#16A34A', cursor: 'pointer', fontWeight: 600 }}>Mark all as read</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#F8FAFC', fontSize: '12.5px' }}>
                  <strong style={{ color: '#0F172A' }}>New Order #ORD12350</strong>
                  <p style={{ margin: '2px 0 0 0', color: '#64748B' }}>Placed by John Smith ($45.00)</p>
                </div>
                <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#F8FAFC', fontSize: '12.5px' }}>
                  <strong style={{ color: '#0F172A' }}>Low Stock Alert</strong>
                  <p style={{ margin: '2px 0 0 0', color: '#64748B' }}>Fresh Spinach stock is below 120 kg</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div style={{ position: 'relative' }}>
          <div
            className="admin-user-profile"
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          >
            <span style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
              Hi, {displayName}
            </span>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: '#22C55E',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(34, 197, 94, 0.25)'
              }}
            >
              {displayInitials}
            </div>
          </div>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '48px',
                width: '180px',
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                border: '1px solid #E2E8F0',
                padding: '8px',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#334155',
                  cursor: 'pointer',
                  borderRadius: '6px',
                }}
                onClick={() => {
                  setShowProfileMenu(false);
                  navigate('/admin/settings');
                }}
              >
                <User size={16} /> Admin Settings
              </div>
              <div style={{ height: '1px', backgroundColor: '#E2E8F0', margin: '4px 0' }} />
              <div
                style={{
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '13px',
                  color: '#DC2626',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  fontWeight: 600,
                }}
                onClick={handleLogout}
              >
                <LogOut size={16} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
