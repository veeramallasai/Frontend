import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAuthService } from '../services/adminAuthService';

const AdminAuthContext = createContext(null);

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = adminAuthService.getToken();
        const user = adminAuthService.getUser();
        if (token && user && adminAuthService.isAdminRole(user)) {
          setAdminToken(token);
          setAdminUser(user);
        } else {
          adminAuthService.logout();
          setAdminToken(null);
          setAdminUser(null);
        }
      } catch (err) {
        console.error('[AdminAuthContext] Init error:', err);
        adminAuthService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    const handleSessionExpired = () => {
      adminAuthService.logout();
      setAdminToken(null);
      setAdminUser(null);
    };

    window.addEventListener('admin_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('admin_session_expired', handleSessionExpired);
    };
  }, []);

  const initiateLogin = async (email, password) => {
    return await adminAuthService.initiateLogin(email, password);
  };

  const verifyOtp = async (email, otp, rememberMe = false) => {
    setIsLoading(true);
    try {
      const res = await adminAuthService.verifyOtp(email, otp, rememberMe);
      if (res && res.user && adminAuthService.isAdminRole(res.user)) {
        setAdminToken(res.token);
        setAdminUser(res.user);
        return res;
      } else {
        throw new Error('Access denied. Only users with role ADMIN or SUPER_ADMIN can access the Admin Panel.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resendOtp = async (email) => {
    return await adminAuthService.resendOtp(email);
  };

  const logout = () => {
    adminAuthService.logout();
    setAdminToken(null);
    setAdminUser(null);
  };

  const isAuthenticated = Boolean(adminToken && adminUser && adminAuthService.isAdminRole(adminUser));

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminToken,
        isAuthenticated,
        isLoading,
        initiateLogin,
        verifyOtp,
        resendOtp,
        login: initiateLogin,
        logout,
        isAdminRole: adminAuthService.isAdminRole(adminUser)
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export default AdminAuthContext;
