import axios from 'axios';

// Centralized API Base URL Configuration
// In local development, use relative path ('') to leverage Vite's dev proxy (/api -> http://localhost:8082).
// This completely eliminates cross-origin CORS preflight OPTIONS blocking in browsers.
const getInitialBaseUrl = () => {
  const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/+$/, '').replace(/\/api(\/v1)?$/, '');
  }
  return '';
};

const API_BASE_URL = getInitialBaseUrl();

console.log('[API Config] Base URL initialized as:', API_BASE_URL || '(relative proxy mode)');

// Helper function to check if a JWT token is expired
export const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  if (
    token.startsWith('super_admin_jwt_') ||
    token.startsWith('jwt_admin_session_') ||
    token.startsWith('mock_') ||
    token.includes('mock')
  ) {
    return false;
  }
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (e) {
    return false;
  }
};

// Helper function to identify public authentication endpoints
const isPublicAuthEndpoint = (url) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('/auth/register') ||
    lowerUrl.includes('/auth/login') ||
    lowerUrl.includes('/delivery-partner/login') ||
    lowerUrl.includes('/delivery-partners/login') ||
    lowerUrl.includes('/delivery-partner/auth/login') ||
    lowerUrl.includes('/delivery-partners/auth/login') ||
    lowerUrl.includes('/auth/verify-email') ||
    lowerUrl.includes('/auth/verify-otp') ||
    lowerUrl.includes('/auth/forgot-password') ||
    lowerUrl.includes('/auth/reset-password') ||
    lowerUrl.includes('/delivery-partner/auth/send-otp') ||
    lowerUrl.includes('/delivery-partner/auth/resend-otp') ||
    lowerUrl.includes('/delivery-partner/auth/verify-otp') ||
    lowerUrl.includes('/delivery-partner/auth/register') ||
    lowerUrl.includes('/delivery-partners/send-otp') ||
    lowerUrl.includes('/delivery-partners/resend-otp') ||
    lowerUrl.includes('/delivery-partners/verify-otp') ||
    lowerUrl.includes('/delivery-partners/register')
  );
};

export const normalizeEndpoint = (url) => {
  if (!url) return '';
  let formatted = url.trim();
  if (formatted.startsWith('https://localhost') || formatted.startsWith('https://127.0.0.1')) {
    formatted = formatted.replace('https://', 'http://');
  }
  if (formatted.startsWith('http://') || formatted.startsWith('https://')) {
    return formatted;
  }
  if (!formatted.startsWith('/')) {
    formatted = '/' + formatted;
  }

  // Remove any duplicate /api/v1/api/v1 or /api/api
  while (formatted.includes('/api/v1/api/v1/')) {
    formatted = formatted.replace('/api/v1/api/v1/', '/api/v1/');
  }
  while (formatted.includes('/api/api/')) {
    formatted = formatted.replace('/api/api/', '/api/');
  }

  // Ensure path starts with /api/v1/
  if (!formatted.startsWith('/api/v1/')) {
    if (formatted.startsWith('/api/')) {
      formatted = formatted.replace(/^\/api\//, '/api/v1/');
    } else {
      formatted = `/api/v1${formatted}`;
    }
  }

  return formatted;
};

// Create Shared Axios Instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Path normalization, Token validation, and Auth header management
api.interceptors.request.use(
  (config) => {
    // 1. Ensure baseURL is clean domain origin
    config.baseURL = typeof config.baseURL === 'string' ? config.baseURL.replace(/\/+$/, '').replace(/\/api(\/v1)?$/, '') : API_BASE_URL;

    // 2. Normalize endpoint URL
    if (config.url) {
      config.url = normalizeEndpoint(config.url);
    }

    // 3. Handle Authorization token automatically for authenticated APIs
    if (isPublicAuthEndpoint(config.url)) {
      delete config.headers.Authorization;
      delete config.headers.authorization;
    } else {
      const isAdminEndpoint = Boolean(config.url && (config.url.includes('/admin') || config.url.includes('/admin/')));
      const adminToken = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
      const standardToken =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token') ||
        sessionStorage.getItem('accessToken') ||
        sessionStorage.getItem('token');

      const token = (isAdminEndpoint && adminToken) ? adminToken : (standardToken || adminToken);

      if (token) {
        if (isTokenExpired(token)) {
          console.warn('[API Request] Expired JWT token detected.');
          if (!isAdminEndpoint) {
            localStorage.removeItem('token');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('accessToken');
            sessionStorage.removeItem('user');
          } else {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminUser');
            sessionStorage.removeItem('adminToken');
            sessionStorage.removeItem('adminUser');
          }
          delete config.headers.Authorization;
          delete config.headers.authorization;
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        delete config.headers.Authorization;
        delete config.headers.authorization;
      }
    }

    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Detailed Error Diagnostics & Session Expiry
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error?.response?.status;
    const url = originalRequest?.url || '';
    const method = (originalRequest?.method || 'GET').toUpperCase();
    const responseData = error?.response?.data;
    const errorMessage = error?.message || 'Network Error';

    // Status code to default meaningful message mapping
    const STATUS_MESSAGES = {
      400: 'Invalid request.',
      401: 'Invalid email or password.',
      403: 'Access denied.',
      404: 'API not found.',
      409: 'Resource already exists.',
      422: 'Validation failed.',
      500: 'Internal server error.',
    };

    // Extract specific backend JSON "message" or "error" field if present
    const backendMessage =
      (responseData && typeof responseData === 'object' && (responseData.message || responseData.error || responseData.detail)) ||
      null;

    // Requirement 7: Print detailed API CONNECTION ERROR object in browser console
    console.error('API CONNECTION ERROR', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      response: error.response?.data,
      baseURL: originalRequest?.baseURL || API_BASE_URL,
      url: url,
    });

    console.error('error.message:', error.message);
    console.error('error.response.status:', error.response?.status);
    console.error('error.response.data:', error.response?.data);
    console.error('error.config.url:', error.config?.url);

    // Requirement 8: Do not show "Invalid email or password" when backend cannot be reached.
    // For network failure show: "Unable to connect to the server. Please check that the backend is running."
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    const statusDefaultMsg = isNetworkError
      ? 'Unable to connect to the server. Please check that the backend is running.'
      : (status ? (STATUS_MESSAGES[status] || `HTTP Error ${status}`) : 'Unable to connect to the server. Please check that the backend is running.');

    const displayMessage = backendMessage || statusDefaultMsg;
    error.customFormattedMessage = displayMessage;

    // Handle token expiration / session expiry
    const isLoginEndpoint = String(originalRequest?.url || '').includes('/auth/login');
    const isAdminEndpoint = String(originalRequest?.url || '').includes('/admin');

    // Only expire user session on explicit 401 Unauthorized on non-admin endpoints
    const shouldExpireSession = status === 401 && !isLoginEndpoint && !isAdminEndpoint;

    if (error.response && shouldExpireSession && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        console.warn('[API] Session expired or unauthorized. Clearing stored session.');
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');

        window.dispatchEvent(new Event('auth_session_expired'));
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    // Do not swallow exceptions: propagate error to caller
    return Promise.reject(error);
  }
);

export default api;

