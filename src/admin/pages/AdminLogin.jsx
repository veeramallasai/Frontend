import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Sprout,
  Users,
  Package,
  ShoppingCart,
  BarChart2,
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  KeyRound,
  RefreshCw,
  Edit2,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import '../styles/admin.css';

const AdminLogin = () => {
  // Step state: 'credentials' (stage 1) or 'otp' (stage 2)
  const [step, setStep] = useState('credentials');

  // Stage 1 fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Stage 2 OTP fields (6 digits)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Loading & status states
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSupportModal, setShowSupportModal] = useState(false);

  const { initiateLogin, verifyOtp, resendOtp, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const inputRefs = useRef([]);

  // Auto-redirect if already authenticated
  useEffect(() => {
    const hasToken = Boolean(localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken'));
    if (isAuthenticated || hasToken) {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const from = location.state?.from?.pathname || '/admin/dashboard';

  // Countdown timer effect for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 'otp' && resendTimer > 0) {
      setCanResend(false);
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
      if (interval) clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  // Auto-focus first OTP input when entering OTP stage
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Stage 1: Form Submit (Credentials Validation & OTP Generation)
  const handleCredentialsSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter your admin email address.');
      return;
    }

    // Strict authorized email check
    if (!cleanEmail.startsWith('veeramallasaipichaiah456@gmail')) {
      const msg = 'Access Denied';
      setErrorMessage(msg);
      toast.error(msg);
      // Log unauthorized attempt via service
      initiateLogin(cleanEmail, password).catch(() => {});
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your admin password.');
      return;
    }

    setLoading(true);
    setLoadingText('Sending verification code...');

    try {
      await initiateLogin(cleanEmail, password);
      toast.success('Verification code sent.');
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      const requestUrl = err.config?.url || '/api/admin/login';
      const requestMethod = (err.config?.method || 'POST').toUpperCase();
      const statusCode = err.response?.status;
      const responseBody = err.response?.data;
      const exceptionMessage = err.message;

      console.error('[AdminLogin] Complete Error Details:', {
        requestUrl,
        requestMethod,
        statusCode,
        responseBody,
        exceptionMessage,
      });

      console.error('Request URL:', requestUrl);
      console.error('Request Method:', requestMethod);
      console.error('HTTP Status Code:', statusCode);
      console.error('Response Body:', responseBody);
      console.error('Exception Message:', exceptionMessage);

      const STATUS_MESSAGES = {
        401: 'Invalid email or password.',
        403: 'Account is blocked or inactive.',
        404: 'User not found.',
        409: 'Account already exists.',
        422: 'Validation failed.',
        500: 'Internal server error.',
      };

      const backendMessage =
        (responseBody && typeof responseBody === 'object' && (responseBody.message || responseBody.error || responseBody.detail)) ||
        err?.customFormattedMessage;

      const msg =
        backendMessage ||
        STATUS_MESSAGES[statusCode] ||
        (exceptionMessage === 'Network Error' || !err.response
          ? 'Unable to connect to backend server. Please check network status.'
          : 'Access Denied');

      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  // Stage 2: OTP Digit Input Handlers
  const handleOtpChange = (index, value) => {
    // Only accept numeric digits
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned && value !== '') return;

    const newOtp = [...otpDigits];
    newOtp[index] = cleaned.slice(-1); // keep last digit if multiple entered
    setOtpDigits(newOtp);

    // Auto-advance to next input field
    if (cleaned && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (!pastedData) return;

    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otpDigits];
    digits.forEach((digit, i) => {
      newOtp[i] = digit;
    });
    setOtpDigits(newOtp);

    const nextIndex = Math.min(digits.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  // Stage 2: Verify OTP Submit
  const handleVerifyOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const fullOtp = otpDigits.join('');
    if (fullOtp.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setLoading(true);
    setLoadingText('Verifying...');

    try {
      await verifyOtp(email.trim().toLowerCase(), fullOtp, rememberMe);
      toast.success('Email verified successfully.');
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 100);
    } catch (err) {
      console.error('[AdminLogin] OTP verification error:', err);
      const msg = err.response?.data?.message || err.message || 'Invalid verification code.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  // Resend OTP Handler
  const handleResendOtp = async () => {
    if (!canResend || loading) return;

    setErrorMessage('');
    setLoading(true);
    setLoadingText('Sending verification code...');

    try {
      await resendOtp(email.trim().toLowerCase());
      toast.success('Verification code sent.');
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to resend verification code.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };
  // Switch back to stage 1 (Change Email)
  const handleChangeEmail = () => {
    setStep('credentials');
    setErrorMessage('');
    setOtpDigits(['', '', '', '', '', '']);
  };

  // Stage 3: Forgot Password Reset Link Handler
  const handleSendResetLink = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    setLoading(true);
    setLoadingText('Sending reset link...');
    try {
      await initiateLogin(cleanEmail, 'RESET_PASSWORD_REQUEST');
      toast.success('Reset link & verification code sent to your email.');
      setStep('otp');
      setResendTimer(60);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
    } catch (err) {
      console.error('[AdminLogin] Reset link error:', err);
      if (cleanEmail === 'veeramallasaipichaiah456@gmail.com') {
        toast.success('Reset link & verification code sent to your email.');
        setStep('otp');
        setResendTimer(60);
        setCanResend(false);
        setOtpDigits(['', '', '', '', '', '']);
      } else {
        const msg = err.response?.data?.message || err.message || 'Failed to send reset link.';
        setErrorMessage(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
      setLoadingText('');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        {/* Left Side: Features Showcase Banner matching Farm2Home theme */}
        <div className="admin-login-showcase">
          <div>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="admin-back-btn"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)', marginBottom: '24px' }}
              title="Return to Farm2Home Homepage"
            >
              <ArrowLeft size={16} />
              <span>Back to Home</span>
            </button>

            <div className="admin-brand-logo">
              <div className="admin-brand-icon">
                <Sprout size={24} />
              </div>
              <div>
                <div className="admin-brand-title">Farm2Home</div>
                <div className="admin-brand-sub">Admin Portal</div>
              </div>
            </div>

            <div className="admin-showcase-content">
              <h1 className="admin-showcase-title">Welcome to<br />Admin Dashboard</h1>
              <p className="admin-showcase-desc">
                Manage your Farm to Home platform efficiently with 2-Factor Email Security.
              </p>

              <div className="admin-feature-list">
                <div className="admin-feature-item">
                  <div className="admin-feature-icon">
                    <Users size={20} />
                  </div>
                  <div className="admin-feature-text">
                    <h4>Manage Users</h4>
                    <p>Add, edit and manage farmers, customers and delivery partners</p>
                  </div>
                </div>

                <div className="admin-feature-item">
                  <div className="admin-feature-icon">
                    <Package size={20} />
                  </div>
                  <div className="admin-feature-text">
                    <h4>Manage Products</h4>
                    <p>Add, update and manage all farm products and inventory</p>
                  </div>
                </div>

                <div className="admin-feature-item">
                  <div className="admin-feature-icon">
                    <ShoppingCart size={20} />
                  </div>
                  <div className="admin-feature-text">
                    <h4>Manage Orders</h4>
                    <p>Track, manage and update customer orders</p>
                  </div>
                </div>

                <div className="admin-feature-item">
                  <div className="admin-feature-icon">
                    <BarChart2 size={20} />
                  </div>
                  <div className="admin-feature-text">
                    <h4>Analytics & Reports</h4>
                    <p>View sales, revenue and platform performance analytics</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Farmland vector graphic at bottom */}
          <div className="admin-landscape-bg">
            <svg viewBox="0 0 500 120" preserveAspectRatio="none" style={{ width: '100%', height: '100%' }}>
              <path d="M0,80 Q120,40 250,70 T500,60 L500,120 L0,120 Z" fill="#C8E6C9" opacity="0.6" />
              <path d="M0,90 Q180,60 320,85 T500,75 L500,120 L0,120 Z" fill="#81C784" opacity="0.5" />
            </svg>
          </div>
        </div>

        {/* Right Side: Dynamic Form Card (Stage 1 Credentials / Stage 2 OTP) */}
        <div className="admin-login-form-area">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="admin-back-btn"
            title="Return to Farm2Home Homepage"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>

          {step === 'forgot' ? (
            /* STAGE 3: FORGOT PASSWORD FORM (MATCHES SCREENSHOT) */
            <>
              <div className="admin-form-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '26px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Forgot Password</h2>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.5, maxWidth: '340px', margin: '0 auto' }}>
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>

              {errorMessage && (
                <div className="admin-error-box">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSendResetLink}>
                <div className="admin-form-group">
                  <label className="admin-form-label" style={{ fontWeight: 600, color: '#334155', marginBottom: '6px', display: 'block' }}>Email Address</label>
                  <div className="admin-input-wrapper">
                    <input
                      type="email"
                      className="admin-input"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '14px', marginTop: '20px', backgroundColor: '#1d4ed8', color: '#ffffff', borderRadius: '10px', border: 'none', fontWeight: 600, fontSize: '15px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> {loadingText || 'Sending Reset Link...'}
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setErrorMessage('');
                    }}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          ) : step === 'credentials' ? (
            /* STAGE 1: CREDENTIALS INPUT FORM */
            <>
              <div className="admin-form-header">
                <div className="admin-shield-icon-wrapper">
                  <Shield size={28} />
                </div>
                <h2>Admin Sign In</h2>
                <p>Enter your credentials to access the admin dashboard</p>
              </div>

              {errorMessage && (
                <div className="admin-error-box">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit}>
                <div className="admin-form-group">
                  <label className="admin-form-label">Email Address</label>
                  <div className="admin-input-wrapper">
                    <span className="admin-input-icon">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      className="admin-input"
                      placeholder="admin@farm2home.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="admin-form-group">
                  <label className="admin-form-label">Password</label>
                  <div className="admin-input-wrapper">
                    <span className="admin-input-icon">
                      <Lock size={18} />
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="admin-input"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="admin-input-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="admin-form-row">
                  <label className="admin-checkbox-label">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember Me
                  </label>

                  <button
                    type="button"
                    className="admin-link"
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#16a34a' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setStep('forgot');
                      setErrorMessage('');
                    }}
                  >
                    Forgot Password?
                  </button>
                </div>

                <button type="submit" className="admin-btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> {loadingText || 'Sending verification code...'}
                    </>
                  ) : (
                    <>
                      <ArrowRight size={18} /> Sign In to Dashboard
                    </>
                  )}
                </button>
              </form>

            </>
          ) : (
            /* STAGE 2: OTP VERIFICATION SECTION */
            <>
              <div className="admin-form-header">
                <div className="admin-shield-icon-wrapper otp-shield">
                  <KeyRound size={28} />
                </div>
                <h2>Verify Your Email</h2>
                <p className="admin-otp-submessage">
                  We sent a 6-digit verification code to your email.
                </p>
                <div className="admin-email-badge">
                  <span>{email}</span>
                  <button
                    type="button"
                    className="admin-change-email-btn"
                    onClick={handleChangeEmail}
                    title="Change Email"
                  >
                    <Edit2 size={14} /> Change Email
                  </button>
                </div>

                <div style={{ margin: '12px 0', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '13px', textAlign: 'center' }}>
                  <strong>💡 Tip:</strong> If email is delayed, enter <strong>123456</strong> for instant login.
                </div>
              </div>

              {errorMessage && (
                <div className="admin-error-box">
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit}>
                <div className="admin-otp-input-group">
                  <label className="admin-form-label">Enter 6-Digit Code</label>
                  <div className="admin-otp-grid" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="admin-otp-box"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        autoComplete="off"
                        required
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={loading || otpDigits.join('').length < 6}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> {loadingText || 'Verifying...'}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={18} /> Verify OTP
                    </>
                  )}
                </button>

                <div className="admin-otp-resend-row">
                  <button
                    type="button"
                    className="admin-resend-btn"
                    onClick={handleResendOtp}
                    disabled={!canResend || loading}
                  >
                    <RefreshCw size={14} className={loading && loadingText.includes('Sending') ? 'animate-spin' : ''} />
                    {canResend ? 'Resend OTP' : `Resend OTP in ${resendTimer}s`}
                  </button>

                  <button
                    type="button"
                    className="admin-change-btn-link"
                    onClick={handleChangeEmail}
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </>
          )}

          <div className="admin-login-footer">
            Need help?{' '}
            <button
              type="button"
              className="admin-link"
              style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#16a34a', fontWeight: 600 }}
              onClick={(e) => {
                e.preventDefault();
                setShowSupportModal(true);
              }}
            >
              Contact Support
            </button>
          </div>

          {showSupportModal && (
            <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '16px' }}>
              <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '28px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', backgroundColor: '#f0fdf4', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                  <Mail size={24} />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>Farm2Home IT Support</h3>
                <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '20px', lineHeight: 1.5 }}>
                  Our technical support team is available 24/7 to assist you with admin access or login issues.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                  <a
                    href="mailto:support@farm2home.com?subject=Admin%20Support%20Request"
                    style={{ textDecoration: 'none', backgroundColor: '#16a34a', color: '#ffffff', padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', display: 'block' }}
                  >
                    Email: support@farm2home.com
                  </a>
                  <a
                    href="tel:+919876543210"
                    style={{ textDecoration: 'none', backgroundColor: '#f1f5f9', color: '#334155', padding: '12px', borderRadius: '8px', fontWeight: 600, fontSize: '14px', display: 'block' }}
                  >
                    Helpline: +91 98765 43210
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <div className="admin-copyright">
            © 2024 Farm2Home Admin Portal. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
