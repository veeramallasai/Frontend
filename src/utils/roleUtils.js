/**
 * Role helpers — single source of truth for role normalization and home paths.
 * Used by Login, ProtectedRoute, PublicRoute, and Navbar redirects.
 */

export const ROLES = {
  ADMIN: 'admin',
  FARMER: 'farmer',
  CUSTOMER: 'customer',
};

/** Normalize backend role strings (e.g. "ADMIN", "ROLE_FARMER") to admin | farmer | customer */
export const normalizeRole = (role) => {
  const raw = String(role || ROLES.CUSTOMER).toLowerCase();
  if (raw.includes('admin')) return ROLES.ADMIN;
  if (raw.includes('farmer')) return ROLES.FARMER;
  return ROLES.CUSTOMER;
};

/** Home path each role should land on after login or when blocked from another area */
export const getHomePathForRole = (role) => {
  const normalized = normalizeRole(role);
  switch (normalized) {
    case ROLES.ADMIN:
      return '/admin';
    case ROLES.FARMER:
      return '/dashboard';
    case ROLES.CUSTOMER:
    default:
      return '/customer';
  }
};

/** Check if user role is allowed (supports partial match like backend "ROLE_ADMIN") */
export const hasRole = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  const normalized = normalizeRole(userRole);
  return allowedRoles.some((r) => normalizeRole(r) === normalized);
};
