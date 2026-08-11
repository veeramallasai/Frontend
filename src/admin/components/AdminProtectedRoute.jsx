import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import { normalizeRole, getHomePathForRole, ROLES } from '../../utils/roleUtils';
import { Loader2 } from 'lucide-react';

const AdminProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, adminUser } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        color: '#2E7D32',
        fontFamily: 'Inter, sans-serif'
      }}>
        <Loader2 className="animate-spin" size={40} style={{ marginBottom: '12px' }} />
        <p style={{ fontWeight: 600, fontSize: '15px' }}>Verifying Admin Credentials...</p>
      </div>
    );
  }

  const hasAdminSession = Boolean(
    localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken')
  );

  // Check general user role in localStorage to prevent cross-role leaks
  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  let userObj = null;
  try {
    userObj = rawUser ? JSON.parse(rawUser) : null;
  } catch (e) {
    userObj = null;
  }

  const userRole = userObj?.role || adminUser?.role || '';
  const normalized = normalizeRole(userRole);

  // If logged in as another non-admin role (e.g. DELIVERY_PARTNER, FARMER, CUSTOMER), redirect to their panel
  if (userRole && normalized !== ROLES.ADMIN && !hasAdminSession) {
    console.warn(`[AdminProtectedRoute] Non-admin role '${userRole}' blocked from admin area. Redirecting to ${getHomePathForRole(userRole)}`);
    return <Navigate to={getHomePathForRole(userRole)} replace />;
  }

  if (!isAuthenticated && !hasAdminSession) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default AdminProtectedRoute;
