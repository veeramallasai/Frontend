import axios from 'axios';

// Approach A: VITE_API_BASE_URL is origin domain (e.g. https://farmtohome-production-ca90.up.railway.app)
const rawBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'https://farmtohome-production-ca90.up.railway.app').trim();
// Strip any trailing /api/v1, /api, or trailing slash from baseURL to ensure zero duplication
const baseURL = rawBaseUrl.replace(/\/+$/, '').replace(/\/api(\/v1)?$/, '');

console.log('[API Config] Clean Base URL set to:', baseURL);

// Helper function to check if a JWT token is expired
export const isTokenExpired = (token) => {
  if (!token || typeof token !== 'string') return true;
  const parts = token.split('.');
  if (parts.length !== 3) return true;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return false;
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (e) {
    return true;
  }
};

// Helper function to identify public authentication endpoints
const isPublicAuthEndpoint = (url) => {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  return (
    lowerUrl.includes('/auth/register') ||
    lowerUrl.includes('/auth/login') ||
    lowerUrl.includes('/auth/verify-email') ||
    lowerUrl.includes('/auth/verify-otp') ||
    lowerUrl.includes('/auth/forgot-password') ||
    lowerUrl.includes('/auth/reset-password')
  );
};

export const normalizeEndpoint = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  let formatted = url.trim();
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

  // Under Approach A, ensure path starts with /api/
  if (!formatted.startsWith('/api/')) {
    formatted = `/api/v1${formatted}`;
  }

  return formatted;
};

// Create Axios Instance
const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Path normalization, Token validation, and Auth header management
api.interceptors.request.use(
  (config) => {
    // 1. Ensure baseURL is clean domain origin
    config.baseURL = (config.baseURL || baseURL).replace(/\/+$/, '').replace(/\/api(\/v1)?$/, '');

    // 2. Normalize endpoint URL
    if (config.url) {
      config.url = normalizeEndpoint(config.url);
    }

    // 3. Handle Authorization token according to Requirements 7 & 8
    if (isPublicAuthEndpoint(config.url)) {
      delete config.headers.Authorization;
    } else {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
        if (isTokenExpired(token)) {
          console.warn('[API Request] Expired JWT token detected. Clearing from storage.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          delete config.headers.Authorization;
        } else {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        delete config.headers.Authorization;
      }
    }

    const fullUrl = `${config.baseURL}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth errors and format error messages
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const statusText = status ? `HTTP ${status}` : 'Network Error';
    const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Cannot connect to server';
    const reqBase = (originalRequest?.baseURL || baseURL).replace(/\/+$/, '').replace(/\/api(\/v1)?$/, '');
    const reqUrl = originalRequest?.url || '';
    const requestedUrl = `${reqBase}${reqUrl}`;

    error.customFormattedMessage = `${statusText}: ${message} | URL: ${requestedUrl}`;

    const isTokenErrorMessage =
      String(message).toLowerCase().includes('token')
      || String(message).toLowerCase().includes('jwt')
      || String(message).toLowerCase().includes('expired')
      || String(message).toLowerCase().includes('unauthorized')
      || String(message).toLowerCase().includes('invalid credentials')
      || String(message).toLowerCase().includes('signature');

    const isLoginEndpoint = String(originalRequest?.url || '').includes('/auth/login');
    const shouldExpireSession = status === 401 || (status === 403 && isTokenErrorMessage);

    if (error.response && shouldExpireSession && !isLoginEndpoint && !originalRequest?._retry) {
      originalRequest._retry = true;

      try {
        console.warn('[API] Token expired or invalid. Clearing session.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        
        window.dispatchEvent(new Event('auth_session_expired'));
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
