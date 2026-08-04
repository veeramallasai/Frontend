import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { isTokenExpired } from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

const splitDisplayName = (value) => {
  const normalized = String(value || '').trim();
  if (!normalized) {
    return { firstName: '', lastName: '', name: '' };
  }

  const parts = normalized.split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
    name: normalized,
  };
};

const normalizeUserProfile = (profileData, fallbackRole) => {
  const resolvedName = String(profileData?.name || '').trim()
    || [profileData?.firstName, profileData?.lastName].filter(Boolean).join(' ').trim();
  const nameParts = splitDisplayName(resolvedName || profileData?.email || 'User');
  const phoneNumber = profileData?.phoneNumber || profileData?.phone || '';

  const rawRole = String(profileData?.role || fallbackRole || 'customer').toLowerCase();
  let role = 'customer';
  if (rawRole.includes('admin')) {
    role = 'admin';
  } else if (rawRole.includes('farmer')) {
    role = 'farmer';
  }

  return {
    id: profileData?.userId || profileData?.id,
    name: resolvedName || nameParts.name,
    firstName: profileData?.firstName || nameParts.firstName,
    lastName: profileData?.lastName || nameParts.lastName,
    email: profileData?.email || '',
    phone: phoneNumber,
    phoneNumber,
    role,
  };
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const getBaseApiUrl = () => {
    return (import.meta.env.VITE_API_BASE_URL || 'https://farmtohome-production-ca90.up.railway.app').replace(/\/+$/, '');
  };

  // Helper to fetch full profile and store local session
  const fetchFullUserProfile = async (accessToken, userEmail, userRole, rememberMe = false) => {
    if (rememberMe) {
      localStorage.setItem('token', accessToken);
    } else {
      sessionStorage.setItem('token', accessToken);
    }

    try {
      // Fetch core UserResponse
      const profileResponse = await api.get('/api/v1/auth/profile');
      const profileData = profileResponse.data.data;

      let loggedUser = {
        ...normalizeUserProfile(profileData, userRole),
        role: String(userRole || profileData?.role || 'customer').toLowerCase(),
        status: 'active',
        farmCompleted: false
      };

      // Role-specific detailed profiles
      if (loggedUser.role === 'farmer') {
        try {
          const farmerProfileResponse = await api.get('/api/v1/farmers/profile');
          const farmerData = farmerProfileResponse.data.data;
          loggedUser = {
            ...loggedUser,
            status: (farmerData.approvalStatus || 'PENDING').toLowerCase(),
            farmCompleted: true,
            farmDetails: farmerData
          };
        } catch (farmerError) {
          if (farmerError.response?.status === 404 || farmerError.response?.data?.message?.includes('not configured')) {
            loggedUser.status = 'pending';
            loggedUser.farmCompleted = false;
          } else {
            console.error('Failed to fetch farmer profile:', farmerError);
          }
        }
      } else if (loggedUser.role === 'customer') {
        try {
          const customerProfileResponse = await api.get('/api/v1/customers/me');
          const customerData = customerProfileResponse.data.data;
          loggedUser = {
            ...loggedUser,
            customerDetails: customerData
          };
        } catch (customerError) {
          if (customerError.response?.status === 404 || customerError.response?.data?.message?.includes('not configured')) {
            loggedUser.customerDetails = null;
          } else {
            console.error('Failed to fetch customer profile:', customerError);
          }
        }
      }

      setUser(loggedUser);
      setToken(accessToken);
      setIsAuthenticated(true);

      if (rememberMe) {
        localStorage.setItem('user', JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem('user', JSON.stringify(loggedUser));
      }

      return loggedUser;
    } catch (err) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      throw err;
    }
  };

  // Synchronize authentication state on load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedToken) {
          if (isTokenExpired(storedToken)) {
            console.warn('[AuthContext] Initializing: Stored token is expired or invalid. Clearing auth session.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
            setIsAuthenticated(true);

            const isRemembered = !!localStorage.getItem('token');
            try {
              await fetchFullUserProfile(storedToken, parsedUser.email, parsedUser.role, isRemembered);
            } catch (profileErr) {
              console.warn('[AuthContext] Profile refresh warning:', profileErr?.message);
            }
          }
        }
      } catch (err) {
        console.error('Error restoring session from storage:', err);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const handleSessionExpired = () => {
      logout(false);
      toast.error('Your session has expired. Please login again.', { id: 'session-expired' });
    };

    window.addEventListener('auth_session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('auth_session_expired', handleSessionExpired);
    };
  }, []);

  // Login handler
  const login = async (email, password, rememberMe = false, targetRole = null) => {
    setIsLoading(true);
    const fullUrl = `${getBaseApiUrl()}/api/v1/auth/login`;

    try {
      const response = await api.post('/api/v1/auth/login', { email, password });
      const apiResponse = response.data;
      const { accessToken, role: serverRole, email: userEmail } = apiResponse.data;

      const effectiveRole = targetRole || serverRole;
      const loggedUser = await fetchFullUserProfile(accessToken, userEmail, effectiveRole, rememberMe);
      
      toast.success('Welcome back!');
      return loggedUser;
    } catch (error) {
      const httpStatus = error.response?.status ? `[HTTP ${error.response.status}]` : '[Network Error]';
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Cannot connect to server';
      const actualRequestedUrl = error.config?.url ? `${(error.config.baseURL || getBaseApiUrl()).replace(/\/+$/, '')}${error.config.url}` : fullUrl;

      const formattedMsg = `${httpStatus} ${backendMessage} | URL: ${actualRequestedUrl}`;
      console.error('[Login Error]', {
        httpStatus,
        backendMessage,
        actualRequestedUrl,
        error
      });

      if (backendMessage.includes('not verified') || backendMessage.includes('OTP')) {
        error.isUnverified = true;
      }

      toast.error(formattedMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const registerUser = async (userData) => {
    setIsLoading(true);
    const targetUrl = `${getBaseApiUrl()}/api/v1/auth/register`;
    console.log('[Registration] Final Request URL:', targetUrl);

    try {
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role.toUpperCase()
      };
      const response = await api.post('/api/v1/auth/register', payload);
      const apiResponse = response.data;
      
      toast.success('Registration successful! OTP sent to ' + userData.email);
      return apiResponse.data;
    } catch (error) {
      const httpStatus = error.response?.status ? `[HTTP ${error.response.status}]` : '[Network Error]';
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Cannot connect to server';
      const actualRequestedUrl = error.config?.url ? `${(error.config.baseURL || getBaseApiUrl()).replace(/\/+$/, '')}${error.config.url}` : targetUrl;

      let msg = `${httpStatus} ${backendMessage} | URL: ${actualRequestedUrl}`;
      if (error.response?.status === 400 && error.response?.data?.data && typeof error.response.data.data === 'object') {
        const validationErrors = Object.values(error.response.data.data).join(', ');
        if (validationErrors) msg += ` | Details: ${validationErrors}`;
      }

      console.error('[Registration Error]', {
        httpStatus,
        backendMessage,
        actualRequestedUrl,
        error
      });

      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification handler
  const verifyOtp = async (otpCode, email) => {
    setIsLoading(true);
    const targetUrl = `${getBaseApiUrl()}/api/v1/auth/verify-email`;

    try {
      const response = await api.post('/api/v1/auth/verify-email', { email, otpCode });
      console.log('Verify OTP API Response:', response.data);
      toast.success('Identity verified successfully!');
      return true;
    } catch (error) {
      const httpStatus = error.response?.status ? `[HTTP ${error.response.status}]` : '[Network Error]';
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'OTP verification failed';
      const actualRequestedUrl = error.config?.url ? `${(error.config.baseURL || getBaseApiUrl()).replace(/\/+$/, '')}${error.config.url}` : targetUrl;

      const formattedMsg = `${httpStatus} ${backendMessage} | URL: ${actualRequestedUrl}`;
      console.error('[Verify OTP Error]', {
        httpStatus,
        backendMessage,
        actualRequestedUrl,
        error
      });

      toast.error(formattedMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setIsLoading(true);
    const targetUrl = `${getBaseApiUrl()}/api/v1/auth/forgot-password`;

    try {
      await api.post('/api/v1/auth/forgot-password', { email });
      toast.success('Verification code sent to ' + email);
      return true;
    } catch (error) {
      const httpStatus = error.response?.status ? `[HTTP ${error.response.status}]` : '[Network Error]';
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to send recovery email.';
      const actualRequestedUrl = error.config?.url ? `${(error.config.baseURL || getBaseApiUrl()).replace(/\/+$/, '')}${error.config.url}` : targetUrl;

      const formattedMsg = `${httpStatus} ${backendMessage} | URL: ${actualRequestedUrl}`;
      toast.error(formattedMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (tokenOrEmail, password, otpCode) => {
    setIsLoading(true);
    const targetUrl = `${getBaseApiUrl()}/api/v1/auth/reset-password`;

    try {
      await api.post('/api/v1/auth/reset-password', { email: tokenOrEmail, otpCode, newPassword: password });
      toast.success('Your password has been reset successfully.');
      return true;
    } catch (error) {
      const httpStatus = error.response?.status ? `[HTTP ${error.response.status}]` : '[Network Error]';
      const backendMessage = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to reset password.';
      const actualRequestedUrl = error.config?.url ? `${(error.config.baseURL || getBaseApiUrl()).replace(/\/+$/, '')}${error.config.url}` : targetUrl;

      const formattedMsg = `${httpStatus} ${backendMessage} | URL: ${actualRequestedUrl}`;
      toast.error(formattedMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update Profile details
  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      if (profileData && profileData.onboarding) {
        const response = await api.put('/api/v1/farmers/profile', profileData.payload);
        const updatedUser = {
          ...user,
          status: 'pending',
          farmCompleted: true,
          farmDetails: response.data.data
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Onboarding details submitted successfully.');
        return updatedUser;
      } else {
        const response = await api.put('/api/v1/auth/profile', profileData);
        const updatedUser = { ...user, ...response.data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully.');
        return updatedUser;
      }
    } catch (error) {
      const httpStatus = error.response?.status ? `[HTTP ${error.response.status}]` : '[Network Error]';
      const backendMessage = error.response?.data?.message || 'Failed to update profile settings.';
      const actualRequestedUrl = error.config?.url ? `${(error.config.baseURL || getBaseApiUrl()).replace(/\/+$/, '')}${error.config.url}` : '';
      toast.error(`${httpStatus} ${backendMessage} | URL: ${actualRequestedUrl}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password handler
  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/auth/change-password', { oldPassword: currentPassword, newPassword });
      toast.success('Password changed successfully.');
    } catch (error) {
      const httpStatus = error.response?.status ? `[HTTP ${error.response.status}]` : '[Network Error]';
      const backendMessage = error.response?.data?.message || 'Failed to change password.';
      const actualRequestedUrl = error.config?.url ? `${(error.config.baseURL || getBaseApiUrl()).replace(/\/+$/, '')}${error.config.url}` : '';
      toast.error(`${httpStatus} ${backendMessage} | URL: ${actualRequestedUrl}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate account handler
  const deactivateAccount = async () => {
    setIsLoading(true);
    try {
      await api.post('/api/v1/auth/deactivate');
      logout();
      toast.success('Account deactivated successfully.');
    } catch (error) {
      const httpStatus = error.response?.status ? `[HTTP ${error.response.status}]` : '[Network Error]';
      const backendMessage = error.response?.data?.message || 'Failed to deactivate account.';
      const actualRequestedUrl = error.config?.url ? `${(error.config.baseURL || getBaseApiUrl()).replace(/\/+$/, '')}${error.config.url}` : '';
      toast.error(`${httpStatus} ${backendMessage} | URL: ${actualRequestedUrl}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = (showToast = true) => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    if (showToast) {
      toast.success('Logged out successfully.');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        registerUser,
        verifyOtp,
        forgotPassword,
        resetPassword,
        updateProfile,
        changePassword,
        deactivateAccount,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
