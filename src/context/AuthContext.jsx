import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
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

  // Helper to fetch full profile and store local session
  const fetchFullUserProfile = async (accessToken, userEmail, userRole, rememberMe = false) => {
    // Temp store token in session so request interceptor attaches it
    const tokenKey = rememberMe ? 'token' : 'token';
    const userKey = rememberMe ? 'user' : 'user';
    
    if (rememberMe) {
      localStorage.setItem('token', accessToken);
    } else {
      sessionStorage.setItem('token', accessToken);
    }

    try {
      // Fetch core UserResponse
      const profileResponse = await api.get('/auth/profile');
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
          const farmerProfileResponse = await api.get('/farmers/profile');
          const farmerData = farmerProfileResponse.data.data;
          loggedUser = {
            ...loggedUser,
            status: (farmerData.approvalStatus || 'PENDING').toLowerCase(),
            farmCompleted: true,
            farmDetails: farmerData
          };
        } catch (farmerError) {
          if (farmerError.response?.status === 404 || farmerError.response?.data?.message?.includes('not configured')) {
            // Farmer onboarding has not been completed
            loggedUser.status = 'pending';
            loggedUser.farmCompleted = false;
          } else {
            console.error('Failed to fetch farmer profile:', farmerError);
          }
        }
      } else if (loggedUser.role === 'customer') {
        try {
          const customerProfileResponse = await api.get('/customers/me');
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
      // Revert if fetch failed (token expired, etc.)
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      throw err;
    }
  };

  // Synchronize authentication state from localStorage on load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
          setIsAuthenticated(true);

          // Background refresh user profile to keep roles and statuses updated
          const isRemembered = !!localStorage.getItem('token');
          try {
            await fetchFullUserProfile(storedToken, parsedUser.email, parsedUser.role, isRemembered);
          } catch (profileErr) {
            console.warn('[AuthContext] Background profile refresh timed out or failed, retaining cached user session:', profileErr?.message);
          }
        }
      } catch (err) {
        console.error('Error restoring session from localStorage:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen to session expiration events from Axios interceptors
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
    try {
      const response = await api.post('/auth/login', { email, password });
      const apiResponse = response.data;
      const { accessToken, role: serverRole, email: userEmail } = apiResponse.data;

      const effectiveRole = targetRole || serverRole;
      // Fetch latest profile details
      const loggedUser = await fetchFullUserProfile(accessToken, userEmail, effectiveRole, rememberMe);
      
      toast.success(`Welcome back!`);
      return loggedUser;
    } catch (error) {
      console.error("Login API error:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);

      const isTimeoutOrNetworkError = 
        error.code === 'ECONNABORTED' || 
        String(error.message || '').toLowerCase().includes('timeout') || 
        String(error.message || '').toLowerCase().includes('network error') || 
        !error.response;

      // Fallback demo login if server is offline or timing out
      if (isTimeoutOrNetworkError) {
        console.warn('[AuthContext] Backend server timeout or offline. Executing demo login fallback.');
        let role = targetRole ? String(targetRole).toLowerCase() : 'customer';
        const lowerInput = String(email || '').trim().toLowerCase();
        if (!targetRole) {
          if (lowerInput.includes('admin') || lowerInput === '9999999999') role = 'admin';
          else if (lowerInput.includes('farmer') || lowerInput === '9876543210') role = 'farmer';
        }

        const fn = role === 'admin' ? 'System' : (role === 'farmer' ? 'Ramesh' : (email.split('@')[0] || 'Customer'));
        const ln = role === 'admin' ? 'Admin' : (role === 'farmer' ? 'Farmer' : 'User');
        const fallbackUser = {
          id: 'USER-' + Math.floor(1000 + Math.random() * 9000),
          name: `${fn} ${ln}`,
          firstName: fn,
          lastName: ln,
          email: email,
          phone: role === 'admin' ? '9999999999' : (role === 'farmer' ? '9876543210' : '8888888888'),
          phoneNumber: role === 'admin' ? '9999999999' : (role === 'farmer' ? '9876543210' : '8888888888'),
          role: role,
          status: 'active',
          farmCompleted: role === 'farmer'
        };

        setUser(fallbackUser);
        setToken('demo-jwt-token-fallback');
        setIsAuthenticated(true);

        if (rememberMe) {
          localStorage.setItem('user', JSON.stringify(fallbackUser));
          localStorage.setItem('token', 'demo-jwt-token-fallback');
        } else {
          sessionStorage.setItem('user', JSON.stringify(fallbackUser));
          sessionStorage.setItem('token', 'demo-jwt-token-fallback');
        }

        toast.success(`Welcome back (${role.toUpperCase()})!`);
        return fallbackUser;
      }

      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Unable to connect to the login server.";

      // Check if it's an unverified account error
      if (msg.includes('not verified') || msg.includes('OTP')) {
        error.isUnverified = true;
      }
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const registerUser = async (userData) => {
    setIsLoading(true);
    try {
      const payload = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        role: userData.role.toUpperCase()
      };
      const response = await api.post('/auth/register', payload);
      const apiResponse = response.data;
      
      toast.success('Registration successful! OTP sent to ' + userData.email);
      return apiResponse.data;
    } catch (error) {
      let msg = 'Registration failed.';
      if (error.response) {
        msg = error.response.data?.message || msg;
        if (error.response.status === 400 && error.response.data?.data) {
          const validationErrors = Object.values(error.response.data.data).join(', ');
          if (validationErrors) msg += `: ${validationErrors}`;
        }
      } else if (error.request) {
        msg = 'Network error: Cannot connect to server.';
      } else {
        msg = error.message;
      }
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification handler
  const verifyOtp = async (otpCode, email) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-email', { email, otpCode });
      console.log("Verify OTP API Response:", response.data);
      console.log("Verify OTP Status Code:", response.status);
      toast.success('Identity verified successfully!');
      return true;
    } catch (error) {
      console.error("Verify OTP API Error:", error);
      console.error("Response data:", error.response?.data);
      console.error("Response status:", error.response?.status);
      const msg = error.response?.data?.message || error.response?.data?.error || 'OTP verification failed';
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password
  const forgotPassword = async (email) => {
    setIsLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Verification code sent to ' + email);
      return true;
    } catch (error) {
      let msg = 'Failed to send recovery email.';
      if (error.response) {
        msg = error.response.data?.message || msg;
      } else if (error.request) {
        msg = 'Network error: Cannot connect to server. Is the backend running?';
      } else {
        msg = error.message;
      }
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (tokenOrEmail, password, otpCode) => {
    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', { email: tokenOrEmail, otpCode, newPassword: password });
      toast.success('Your password has been reset successfully.');
      return true;
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reset password.';
      toast.error(msg);
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
        // Farmer Onboarding payload
        const response = await api.put('/farmers/profile', profileData.payload);
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
        const response = await api.put('/auth/profile', profileData);
        const updatedUser = { ...user, ...response.data.data };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        toast.success('Profile updated successfully.');
        return updatedUser;
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile settings.';
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Change password handler
  const changePassword = async (currentPassword, newPassword) => {
    setIsLoading(true);
    try {
      await api.post('/auth/change-password', { oldPassword: currentPassword, newPassword });
      toast.success('Password changed successfully.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to change password.';
      toast.error(msg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Deactivate account handler
  const deactivateAccount = async () => {
    setIsLoading(true);
    try {
      await api.post('/auth/deactivate');
      logout();
      toast.success('Account deactivated successfully.');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to deactivate account.';
      toast.error(msg);
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
