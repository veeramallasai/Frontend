import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Grid,
  Users,
  UserCheck,
  Truck,
  Star,
  Ticket,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sprout,
  ShieldAlert,
  Ban,
  FileText
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'Orders', path: '/admin/orders', icon: ShoppingBag },
  { name: 'Products', path: '/admin/products', icon: Package },
  { name: 'Categories', path: '/admin/categories', icon: Grid },
  { name: 'Customers', path: '/admin/customers', icon: Users },
  { name: 'Farmers', path: '/admin/farmers', icon: UserCheck },
  { name: 'Blocked Users', path: '/admin/blocked-users', icon: Ban },
  { name: 'Pre-Order List', path: '/admin/pre-order-list', icon: FileText },
  { name: 'Delivery Partners', path: '/admin/deliveries', icon: Truck },
  { name: 'Partner Approvals', path: '/admin/delivery-partner-approvals', icon: UserCheck },
  { name: 'Reviews', path: '/admin/reviews', icon: Star },
  { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
  { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { name: 'Security Logs', path: '/admin/security-logs', icon: ShieldAlert },
  { name: 'Settings', path: '/admin/settings', icon: Settings },
];

const AdminSidebar = ({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className={`admin-drawer-overlay ${isMobileOpen ? 'active' : ''}`}
        onClick={onCloseMobile}
      />

      <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        <div className="admin-sidebar-header">
          <NavLink to="/admin/dashboard" className="admin-sidebar-brand">
            <div className="admin-sidebar-logo">
              <Sprout size={24} color="#4ADE80" />
            </div>
            {!isCollapsed && (
              <span className="admin-sidebar-brand-text">
                FARM TO HOME
              </span>
            )}
          </NavLink>

          <button
            className="admin-sidebar-toggle"
            onClick={onToggleCollapse}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="admin-sidebar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) => `admin-menu-item ${isActive ? 'active' : ''}`}
                title={isCollapsed ? item.name : undefined}
              >
                <span className="admin-menu-icon">
                  <Icon size={19} />
                </span>
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <button className="admin-logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={19} />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
