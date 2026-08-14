import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import '../styles/admin.css';

const titleMap = {
  '/admin/dashboard': 'Admin Dashboard Overview',
  '/admin/farmers': 'Farmer Management',
  '/admin/customers': 'Customer Directory & Accounts',
  '/admin/products': 'Product Catalog & Inventory',
  '/admin/categories': 'Product Categories',
  '/admin/orders': 'Customer Orders Management',
  '/admin/deliveries': 'Logistics & Delivery Partners',
  '/admin/payments': 'Payment Transactions & Payouts',
  '/admin/reports': 'Analytics & Platform Reports',
  '/admin/notifications': 'System Notifications & Broadcasts',
  '/admin/settings': 'Admin Portal Settings',
};

const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const location = useLocation();

  const currentTitle = titleMap[location.pathname] || 'Admin Portal';

  return (
    <div className="admin-app-layout admin-body">
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="admin-main-wrapper">
        <AdminHeader
          title={currentTitle}
          onToggleMobileSidebar={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="admin-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
