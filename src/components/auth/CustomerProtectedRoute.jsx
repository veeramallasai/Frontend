import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { normalizeRole, getHomePathForRole, ROLES } from '../../utils/roleUtils';

const CustomerProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token');

  const storedUser =
    localStorage.getItem('user') || sessionStorage.getItem('user');

  const user = storedUser ? JSON.parse(storedUser) : null;
  const userRole = user?.role || '';
  const normalized = normalizeRole(userRole);

  if (!token) {
    return <Navigate to="/customer/login" replace />;
  }

  // Redirect non-customer roles to their assigned dashboard
  if (userRole && normalized !== ROLES.CUSTOMER) {
    console.warn(`[CustomerProtectedRoute] Role '${userRole}' redirected to ${getHomePathForRole(userRole)}`);
    return <Navigate to={getHomePathForRole(userRole)} replace />;
  }

  return children ? children : <Outlet />;
};

export default CustomerProtectedRoute;
