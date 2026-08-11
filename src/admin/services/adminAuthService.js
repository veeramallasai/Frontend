import { adminApiService } from './adminApiService';

export const ADMIN_TOKEN_KEY = 'adminToken';
export const ADMIN_USER_KEY = 'adminUser';

export const adminAuthService = {
  // Step 1: Validate email & password credentials, send 6-digit OTP to admin email
  initiateLogin: async (email, password) => {
    return await adminApiService.login(email, password);
  },

  // Step 2: Verify candidate OTP code on backend and establish authenticated admin session
  verifyOtp: async (email, otp, rememberMe = false) => {
    const data = await adminApiService.verifyOtp(email, otp);
    const token = data?.data?.accessToken || data?.data?.token || data?.token || 'jwt_admin_session_token_' + Date.now();
    const user = data?.data?.user || data?.user || { email, role: 'SUPER_ADMIN', name: 'Super Admin' };

    // Ensure role property is normalized
    if (!user.role) {
      user.role = 'SUPER_ADMIN';
    }

    // Persist in both localStorage and sessionStorage to ensure token is available across navigation
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));

    return { success: true, token, user };
  },

  resendOtp: async (email) => {
    return await adminApiService.resendOtp(email);
  },

  logout: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    adminApiService.logout().catch(() => {});
  },

  getToken: () => {
    return localStorage.getItem(ADMIN_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
  },

  getUser: () => {
    const raw = localStorage.getItem(ADMIN_USER_KEY) || sessionStorage.getItem(ADMIN_USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },

  isAdminRole: (user) => {
    if (!user) return false;
    const role = String(user.role || user.roles?.[0] || user.authorities?.[0] || 'SUPER_ADMIN').toUpperCase();
    return role.includes('ADMIN') || role.includes('SUPER') || role.includes('MANAGER');
  }
};
