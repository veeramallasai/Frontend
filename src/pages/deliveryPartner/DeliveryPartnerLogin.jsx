import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Lock, Mail, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';
import deliveryPartnerAuthService from '../../services/deliveryPartnerAuthService';
import faceVerificationService from '../../services/faceVerificationService';
import { normalizeRole, ROLES } from '../../utils/roleUtils';
import '../../styles/deliveryPartnerAuthFlow.css';

const DeliveryPartnerLogin = () => {
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanIdentity = emailOrMobile.trim();
    if (!cleanIdentity) {
      setErrorMessage('Please enter your email or mobile number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8082";
      console.log("Delivery Partner API URL:", apiBaseUrl);
      console.log("Login endpoint:", `${apiBaseUrl}/api/delivery-partners/login`);
      console.log('Login payload:', { identifier: cleanIdentity });

      const payload = { identifier: cleanIdentity, emailOrMobile: cleanIdentity, email: cleanIdentity, password };
      const data = await deliveryPartnerAuthService.login(payload);
      const accessToken = data.accessToken || data.token;

      if (!accessToken) {
        throw new Error('Login response missing access token.');
      }

      const userObj = data.user || {
        id: data.id || data.userId,
        email: data.email || cleanIdentity,
        name: data.name || [data.firstName, data.lastName].filter(Boolean).join(' ').trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || data.phoneNumber,
        role: data.role || 'DELIVERY_PARTNER',
      };

      // Check all assigned roles for multi-role user accounts
      const responseRolesList = Array.isArray(data.roles) && data.roles.length > 0 ? data.roles : [data.role || 'DELIVERY_PARTNER'];
      const isDeliveryRole = responseRolesList.some(r => {
        const norm = normalizeRole(r);
        return norm === ROLES.DELIVERY_PARTNER || norm === 'DELIVERY' || String(r).toUpperCase().includes('DELIVERY');
      }) || normalizeRole(userObj.role) === ROLES.DELIVERY_PARTNER;

      if (!isDeliveryRole) {
        // Clear any saved tokens if non-DELIVERY_PARTNER tries to sign in
        localStorage.removeItem('token');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('user');

        const unauthorizedMsg = 'This account is not authorized as a Delivery Partner.';
        setErrorMessage(unauthorizedMsg);
        toast.error(unauthorizedMsg);
        setLoading(false);
        return;
      }

      const storage = rememberMe ? localStorage : sessionStorage;
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');

      storage.setItem('accessToken', accessToken);
      storage.setItem('token', accessToken);
      if (data.refreshToken) {
        storage.setItem('refreshToken', data.refreshToken);
      }

      // Save delivery partner ID, name, email/mobile, and backend-provided role.
      const responseRole = data.role || 'DELIVERY_PARTNER';
      const deliveryUser = {
        id: userObj.id || data.userId || null,
        name: userObj.name || null,
        email: userObj.email || cleanIdentity,
        phone: userObj.phone || userObj.phoneNumber || cleanIdentity,
        role: responseRole,
      };

      storage.setItem('user', JSON.stringify(deliveryUser));

      // Remove face verified flag until face verification passes
      sessionStorage.removeItem('deliveryPartnerFaceVerified');
      localStorage.removeItem('deliveryPartnerFaceVerified');

      // Check face registration status on backend
      try {
        const faceStatus = await faceVerificationService.getStatus();
        if (faceStatus?.faceRegistered || faceStatus?.enrolled) {
          toast.success('Credentials verified. Please complete face verification.');
          navigate('/delivery-partner/face-verification');
        } else {
          toast.success('Credentials verified. Please register your face to continue.');
          navigate('/delivery-partner/face-registration');
        }
      } catch (faceErr) {
        console.warn('[DeliveryPartnerLogin] Face status check failed, defaulting to registration:', faceErr);
        navigate('/delivery-partner/face-registration');
      }
    } catch (error) {
      const requestUrl = error.config?.url || `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'}/api/delivery-partners/login`;
      const requestMethod = (error.config?.method || 'POST').toUpperCase();
      const statusCode = error.response?.status;
      const responseBody = error.response?.data;
      const exceptionMessage = error.message;

      console.error('[DeliveryPartnerLogin] Error Details:', {
        requestUrl,
        requestMethod,
        statusCode,
        responseBody,
        exceptionMessage,
      });

      let finalDisplayMessage = '';
      const backendMessage =
        (responseBody && typeof responseBody === 'object' && (responseBody.message || responseBody.error || responseBody.detail)) ||
        error?.customFormattedMessage;

      const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || exceptionMessage === 'Network Error';

      if (isNetworkError) {
        finalDisplayMessage = 'Unable to connect to the server.';
      } else if (statusCode === 401) {
        finalDisplayMessage = backendMessage || 'Invalid email/mobile number or password.';
      } else if (statusCode === 403) {
        finalDisplayMessage = backendMessage || 'This account is not authorized as a Delivery Partner.';
      } else if (statusCode === 404) {
        finalDisplayMessage = backendMessage || 'Account not found.';
      } else if (statusCode === 500) {
        finalDisplayMessage = 'Server error. Please try again.';
      } else {
        finalDisplayMessage = backendMessage || 'Invalid email/mobile number or password.';
      }

      setErrorMessage(finalDisplayMessage);
      toast.error(finalDisplayMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="dp-method-icon-wrap"><Sprout size={18} /></span>
          <div>
            <div style={{ fontWeight: 800, color: '#065F46' }}>Farm to Home</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Delivery Partner</div>
          </div>
        </div>

        <h1>Welcome back!</h1>
        <p className="dp-auth-subtitle">Please login to continue</p>

        {errorMessage && <div className="dp-error-banner">{errorMessage}</div>}

        <form onSubmit={handleLoginSubmit}>
          <label className="dp-auth-subtitle" htmlFor="emailOrMobile">Email / Mobile Number</label>
          <div className="dp-method-option" style={{ marginBottom: 12 }}>
            <Mail size={18} color="#065F46" />
            <input
              id="emailOrMobile"
              type="text"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              placeholder="Enter email or mobile"
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14 }}
            />
          </div>

          <label className="dp-auth-subtitle" htmlFor="password">Password</label>
          <div className="dp-method-option" style={{ marginBottom: 8 }}>
            <Lock size={18} color="#065F46" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: 14 }}
            />
            <button type="button" className="dp-link-btn" onClick={() => setShowPassword((prev) => !prev)}>
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: 13, color: '#6B7280' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ marginRight: 6 }}
              />
              Remember me
            </label>
            <Link to="/delivery-partner/forgot-password" className="dp-link-btn">Forgot Password?</Link>
          </div>

          <button type="submit" className="dp-btn-primary" disabled={loading}>
            {loading ? <><Loader2 size={18} className="dp-spin" /> Logging in...</> : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 12, color: '#6B7280', fontSize: 14 }}>
          Don't have an account? <Link to="/delivery-partner/register" className="dp-link-btn">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default DeliveryPartnerLogin;
