import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getHomePathForRole } from '../../utils/roleUtils';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

// Validation Schema using Zod
const loginSchema = z.object({
  email: z.string().min(1, 'Email or phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  portalRole: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleHint = location.state?.roleHint || 'customer';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      portalRole: roleHint,
      rememberMe: false,
    }
  });

  useEffect(() => {
    if (roleHint) {
      setValue('portalRole', roleHint);
    }
  }, [roleHint, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');

      const loggedUser = await login(data.email, data.password, data.rememberMe, data.portalRole);
      
      // Navigate to chosen portal or user's assigned role
      const chosenRole = String(data.portalRole || loggedUser?.role || 'customer').toLowerCase();
      if (chosenRole === 'admin' || chosenRole.includes('admin')) {
        navigate('/admin');
      } else if (chosenRole === 'farmer' || chosenRole.includes('farmer')) {
        navigate('/dashboard');
      } else {
        navigate('/customer');
      }
    } catch (err) {
      console.error("Login API error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);

      if (err.isUnverified) {
        navigate('/verify-otp', { state: { email: data.email, role: 'farmer', step: 'login' } });
      }
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'customer', label: '🛒 Customer / Consumer Portal' },
    { value: 'farmer', label: '🌾 Farmer / Producer Portal' },
    { value: 'admin', label: '🔑 Administrator Portal' },
  ];

  return (
    <AuthLayout title="Sign In" subtitle="Access your Farm to Home dashboard">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role / Portal Selection Dropdown */}
        <Select
          label="Sign In To Portal / Role"
          icon={ShieldCheck}
          options={roleOptions}
          error={errors.portalRole}
          {...register('portalRole')}
        />

        {/* Email or Phone Number Field */}
        <Input
          label="Email Address or Phone Number"
          type="text"
          placeholder="e.g. farmer@field.com or 9876543210"
          icon={Mail}
          error={errors.email}
          {...register('email')}
        />

        {/* Password Field */}
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
          {...register('password')}
        />

        {/* Remember Me and Forgot Password links */}
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold select-none pt-1">
          <label className="flex items-center text-slate-500 hover:text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              className="mr-2 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4"
              {...register('rememberMe')}
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

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full py-3.5 mt-6"
          isLoading={loading}
          icon={LogIn}
        >
          Sign In
        </Button>
      </form>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative px-3 bg-white text-xs font-bold text-slate-400 uppercase select-none z-10">
          Quick Demo Accounts
        </span>
      </div>

      {/* Quick Demo Access Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          type="button"
          onClick={() => onSubmit({ email: 'admin@farmtohome.com', password: 'password123', portalRole: 'admin', rememberMe: true })}
          className="px-2 py-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-lg border border-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          🔑 Admin Demo
        </button>
        <button
          type="button"
          onClick={() => onSubmit({ email: 'farmer@farmtohome.com', password: 'password123', portalRole: 'farmer', rememberMe: true })}
          className="px-2 py-2 text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg border border-emerald-200 transition-colors cursor-pointer"
        >
          🌾 Farmer Demo
        </button>
        <button
          type="button"
          onClick={() => onSubmit({ email: 'customer@farmtohome.com', password: 'password123', portalRole: 'customer', rememberMe: true })}
          className="px-2 py-2 text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-lg border border-blue-200 transition-colors cursor-pointer"
        >
          🛒 Customer Demo
        </button>
      </div>

      {/* Register Redirect link */}
      <p className="text-sm font-medium text-slate-500 text-center select-none">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-primary hover:text-primary-dark font-semibold transition-colors"
        >
          Create Portal Account
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
