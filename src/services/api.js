import axios from 'axios';

// Production API Base URL using VITE_API_BASE_URL
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://farmtohome-production-ca90.up.railway.app';
const baseURL = rawBaseUrl.replace(/\/+$/, '');

console.log('[API Config] Using baseURL:', baseURL);

export const normalizeEndpoint = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  let formatted = url.trim();
  if (!formatted.startsWith('/')) {
    formatted = '/' + formatted;
  }

  // Prevent duplicated /api or /api/v1 prefixes
  formatted = formatted.replace(/^\/api\/api\//, '/api/');
  formatted = formatted.replace(/^\/api\/v1\/api\/v1\//, '/api/v1/');

  // Route to Spring Boot /api/v1 prefix if not already starting with /api
  if (!formatted.startsWith('/api/')) {
    formatted = `/api/v1${formatted}`;
  }

  return formatted;
};

// Create Axios Instance with 30s timeout for cloud responsiveness
const api = axios.create({
  baseURL: baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token and normalize path
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.url) {
      config.url = normalizeEndpoint(config.url);
    }

    const fullUrl = `${(config.baseURL || baseURL).replace(/\/+$/, '')}${config.url}`;
    console.log(`[API Request] ${config.method?.toUpperCase()} ${fullUrl}`);

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors globally and format detailed error info
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    const statusText = status ? `HTTP ${status}` : 'Network Error';
    const message = error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Cannot connect to server';
    const requestedUrl = originalRequest ? `${(originalRequest.baseURL || baseURL).replace(/\/+$/, '')}${originalRequest.url || ''}` : 'Unknown URL';

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

    // Expire session only for true auth/token failures
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
