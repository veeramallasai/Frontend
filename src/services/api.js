import axios from 'axios';

export const baseURL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '/api/v1';
console.log('[API Config] Using baseURL:', baseURL);

// Create Axios Instance with 30s timeout for cloud responsiveness
const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const message = String(error?.response?.data?.message || '').toLowerCase();

    const isTokenErrorMessage =
      message.includes('token')
      || message.includes('jwt')
      || message.includes('expired')
      || message.includes('unauthorized')
      || message.includes('invalid credentials')
      || message.includes('signature');

    const isLoginEndpoint = String(originalRequest?.url || '').includes('/auth/login');
    const shouldExpireSession = status === 401 || (status === 403 && isTokenErrorMessage);

    // Expire session only for true auth/token failures, not generic authorization/permissions errors or initial login attempts.
    if (error.response && shouldExpireSession && !isLoginEndpoint && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        console.warn('[API] Token expired or invalid. Clearing session.');
        
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        // Trigger page redirect or local custom event if needed
        window.dispatchEvent(new Event('auth_session_expired'));
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }


    return Promise.reject(error);
  }
);

export default api;
