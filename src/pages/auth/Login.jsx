import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const prefillEmail = location.state?.email || sessionStorage.getItem('pendingVerificationEmail');
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      toast.error('Please enter email and password.');
      return;
    }

    setLoading(true);
    try {
      try {
        await login(email.trim(), password.trim(), rememberMe, 'customer');
      } catch (authContextErr) {
        if (authContextErr.response) {
          throw authContextErr;
        }
        console.warn('[Login] Fallback to authService for local sign in:', authContextErr?.message);
        const data = await authService.loginCustomer(email.trim(), password.trim(), rememberMe);
        if (data && (data.accessToken || data.token)) {
          toast.success('Signed in successfully!');
          window.location.href = location.state?.from || '/customer/shop';
          return;
        }
      }
      toast.success('Signed in successfully!');
      const redirectPath = location.state?.from || '/customer/shop';
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const requestUrl = err.config?.url || '/api/v1/auth/login';
      const requestMethod = (err.config?.method || 'POST').toUpperCase();
      const statusCode = err.response?.status;
      const responseBody = err.response?.data;
      const exceptionMessage = err.message;

      console.error('[Customer Login] Complete Error Details:', {
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

      const displayMsg = backendMessage || STATUS_MESSAGES[statusCode] || 'Invalid email or password.';

      if (displayMsg.toLowerCase().includes('verify') || displayMsg.toLowerCase().includes('unverified')) {
        sessionStorage.setItem('pendingVerificationEmail', email.trim());
        toast.error('Please verify your email first.');
        navigate('/customer/verify-otp', { state: { email: email.trim() } });
      } else {
        toast.error(displayMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Sign In" subtitle="Access your Farm to Home dashboard">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address Field */}
        <Input
          label="EMAIL ADDRESS"
          type="email"
          placeholder="e.g. customer@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password Field with Eye Toggle */}
        <div className="relative">
          <Input
            label="PASSWORD"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            icon={Lock}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            className="absolute right-3.5 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
            onClick={() => setShowPassword(!showPassword)}
            title={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold select-none pt-1">
          <label className="flex items-center text-slate-500 hover:text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            Remember Me
          </label>
          <Link
            to="/forgot-password"
            className="text-primary hover:text-primary-dark transition-colors"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Sign In Button */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full py-3.5 mt-6 shadow-md"
          isLoading={loading}
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      {/* Create Portal Account link matching screenshot */}
      <p className="mt-6 text-sm font-medium text-slate-500 text-center select-none">
        Don't have an account?{' '}
        <Link
          to="/customer/register"
          className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
        >
          Create Portal Account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
