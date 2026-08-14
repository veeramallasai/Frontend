import React from 'react';
import { Navigate } from 'react-router-dom';
import { isTokenExpired } from '../../services/api';
import { normalizeRole, ROLES } from '../../utils/roleUtils';

/**
 * DeliveryPartnerProtectedRoute
 * Encapsulates and protects the Delivery Partner Module routes.
 * Validates:
 * 1. Active, non-expired authentication token exists.
 * 2. User role is strictly DELIVERY_PARTNER. If logged in as ADMIN, FARMER, or CUSTOMER,
 *    redirects them away to their own dedicated panel home.
 * 3. Face verification is completed (deliveryPartnerFaceVerified === 'true').
 */
const DeliveryPartnerProtectedRoute = ({ children }) => {
  // 1. Retrieve token from storage
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

  // If token is missing or expired, send user to Delivery Partner login
  if (!token || isTokenExpired(token)) {
    console.warn('[DeliveryPartnerProtectedRoute] Unauthenticated session. Redirecting to delivery partner login.');
    return <Navigate to="/delivery-partner/login" replace />;
  }

  // 2. Validate role matches DELIVERY_PARTNER (supports multi-role accounts)
  const userRole = user?.role || user?.userRole || '';
  const rolesList = Array.isArray(user?.roles) && user.roles.length > 0 ? user.roles : [userRole];
  const hasDeliveryRole = rolesList.some(r => {
    const norm = normalizeRole(r);
    return norm === ROLES.DELIVERY_PARTNER || String(r).toUpperCase().includes('DELIVERY');
  }) || normalizeRole(userRole) === ROLES.DELIVERY_PARTNER;

  if (!hasDeliveryRole) {
    console.warn(`[DeliveryPartnerProtectedRoute] Access blocked for role: ${userRole}. Redirecting to delivery partner login.`);
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('deliveryPartnerFaceVerified');
    localStorage.removeItem('deliveryPartnerFaceVerified');
    return <Navigate to="/delivery-partner/login" replace />;
  }

  // 3. Validate face verification completed
  const faceVerified =
    sessionStorage.getItem('deliveryPartnerFaceVerified') === 'true' ||
    localStorage.getItem('deliveryPartnerFaceVerified') === 'true';

  if (!faceVerified) {
    console.warn('[DeliveryPartnerProtectedRoute] Face verification required. Redirecting to face verification.');
    return <Navigate to="/delivery-partner/face-verification" replace />;
  }

  return children;
};

export default DeliveryPartnerProtectedRoute;
