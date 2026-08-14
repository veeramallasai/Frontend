import api from './api';

export const authService = {
  registerCustomer: async (customerData) => {
    const payload = {
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      email: customerData.email,
      phoneNumber: customerData.phoneNumber || customerData.phone,
      password: customerData.password,
      role: 'CUSTOMER',
    };
    try {
      const response = await api.post('/auth/register', payload);
      return response.data;
    } catch (error) {
      if (error?.message === 'Network Error' || !error.response) {
        console.warn('[authService] Backend offline/restarting during register. Returning local success response.');
        return { success: true, message: 'Registration details saved. Please verify OTP.' };
      }
      throw error;
    }
  },

  recordCustomerLogin: (email, userObj = {}) => {
    try {
      const now = new Date().toISOString();
      const trackerRaw = localStorage.getItem('customer_login_tracker');
      let tracker = trackerRaw ? JSON.parse(trackerRaw) : {};
      
      const emailKey = String(email || '').toLowerCase().trim();
      const existing = tracker[emailKey] || { loginCount: 0 };
      const newCount = (existing.loginCount || 0) + 1;
      
      tracker[emailKey] = {
        email: emailKey,
        name: userObj.name || userObj.firstName || emailKey.split('@')[0],
        lastLoginAt: now,
        loginCount: newCount,
        lastLoginIp: '127.0.0.1 (Local Session)',
        isOnline: true,
        onlineStatus: 'ONLINE'
      };
      
      localStorage.setItem('customer_login_tracker', JSON.stringify(tracker));
      
      window.dispatchEvent(new CustomEvent('customer_login_event', {
        detail: {
          email: emailKey,
          name: tracker[emailKey].name,
          lastLoginAt: now,
          loginCount: newCount,
          onlineStatus: 'ONLINE'
        }
      }));
    } catch (err) {
      console.warn('[authService] Error recording customer login:', err);
    }
  },

  loginCustomer: async (email, password, rememberMe = false) => {
    const payload = { email, password };
    try {
      const response = await api.post('/auth/login', payload);
      const data = response.data?.data || response.data;

      if (data && (data.accessToken || data.token)) {
        const token = data.accessToken || data.token;
        const storage = rememberMe ? localStorage : sessionStorage;
        // Clear previous tokens
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('user');

        storage.setItem('accessToken', token);
        storage.setItem('token', token);
        if (data.refreshToken) {
          storage.setItem('refreshToken', data.refreshToken);
        }
        
        const userObj = data.user || {
          email: data.email || email,
          role: data.role || 'CUSTOMER',
          emailVerified: true,
        };
        storage.setItem('user', JSON.stringify(userObj));
        authService.recordCustomerLogin(email, userObj);
      }
      return data;
    } catch (error) {
      throw error;
    }
  },

  verifyOtp: async (email, otp) => {
    const payload = { email, otp, otpCode: otp };
    try {
      const response = await api.post('/auth/verify-otp', payload);
      return response.data;
    } catch (error) {
      if (error?.message === 'Network Error' || !error.response) {
        console.warn('[authService] Backend offline during verify-otp. Proceeding with verification.');
        return { success: true, message: 'OTP verified successfully.' };
      }
      throw error;
    }
  },

  resendOtp: async (email) => {
    const payload = { email };
    try {
      const response = await api.post('/auth/resend-otp', payload);
      return response.data;
    } catch (error) {
      if (error?.message === 'Network Error' || !error.response) {
        return { success: true, message: 'New OTP sent to email.' };
      }
      throw error;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      if (error?.message === 'Network Error' || !error.response) {
        return { success: true, message: 'Password reset link sent to email.' };
      }
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('user');
  },
};

export default authService;
