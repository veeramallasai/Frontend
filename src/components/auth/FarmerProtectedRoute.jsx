import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../../services/api';
import { normalizeRole, getHomePathForRole, ROLES } from '../../utils/roleUtils';

/**
 * FarmerProtectedRoute
 * Encapsulates and protects the Farmer Workspace module.
 * Ensures:
 * 1. User has an active, valid authentication token.
 * 2. User role is strictly FARMER. Redirects non-farmers (Admin, Delivery Partner, Customer)
 *    to their own assigned panel home.
 */
const FarmerProtectedRoute = ({ children }) => {
  const token =
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('accessToken') ||
    sessionStorage.getItem('token');

  const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
  let user = null;
  try {
    user = rawUser ? JSON.parse(rawUser) : null;
  } catch (e) {
    user = null;
  }

  if (!token || isTokenExpired(token)) {
    console.warn('[FarmerProtectedRoute] Unauthenticated session. Redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role || user?.userRole || '';
  const normalized = normalizeRole(userRole);

  if (normalized !== ROLES.FARMER) {
    console.warn(`[FarmerProtectedRoute] Access blocked for role: ${userRole}. Redirecting to ${getHomePathForRole(userRole)}`);
    return <Navigate to={getHomePathForRole(userRole)} replace />;
  }

  return children;
};

export default FarmerProtectedRoute;
