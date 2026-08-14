import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, Eye, EyeOff, UserCheck, ShieldCheck } from 'lucide-react';
import { authService } from '../../services/authService';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'CUSTOMER',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must contain at least 2 characters.';
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must contain at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    const phoneClean = formData.phoneNumber.trim().replace(/\D/g, '');
    if (!phoneClean || phoneClean.length !== 10) {
      errors.phoneNumber = 'Phone number must contain exactly 10 digits.';
    }

    // Password validation: >= 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const pwd = formData.password;
    if (!pwd || pwd.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(pwd)) {
      errors.password = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(pwd)) {
      errors.password = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(pwd)) {
      errors.password = 'Password must contain at least one number.';
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      errors.password = 'Password must contain at least one special character.';
    }

    if (formData.confirmPassword !== formData.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (!formData.termsAccepted) {
      errors.termsAccepted = 'You must accept the Terms of Service and Privacy Policies.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.phoneNumber.trim().replace(/\D/g, ''),
        password: formData.password,
        role: formData.role || 'CUSTOMER',
      };

      await authService.registerCustomer(payload);
      sessionStorage.setItem('pendingVerificationEmail', payload.email);
      toast.success('Registration successful. OTP sent to your email.');
      navigate('/customer/verify-otp', { state: { email: payload.email } });
    } catch (err) {
      console.error('[Registration Error]:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Registration failed. Please try again.';

      if (message.toLowerCase().includes('email')) {
        setFieldErrors((prev) => ({ ...prev, email: 'Email is already registered.' }));
      } else if (message.toLowerCase().includes('phone')) {
        setFieldErrors((prev) => ({ ...prev, phoneNumber: 'Phone number is already registered.' }));
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'CUSTOMER', label: 'Customer' },
    { value: 'FARMER', label: 'Farmer / Producer' },
  ];

  return (
    <AuthLayout title="Create Account" subtitle="Join our farm-to-table network">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* First & Last Name (2 columns matching screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <Input
              label="FIRST NAME"
              type="text"
              name="firstName"
              placeholder="e.g. John"
              icon={User}
              value={formData.firstName}
              onChange={handleChange}
              error={fieldErrors.firstName}
              required
            />
          </div>
          <div>
            <Input
              label="LAST NAME"
              type="text"
              name="lastName"
              placeholder="e.g. Doe"
              icon={User}
              value={formData.lastName}
              onChange={handleChange}
              error={fieldErrors.lastName}
              required
            />
          </div>
        </div>

        {/* Email Address */}
        <Input
          label="EMAIL ADDRESS"
          type="email"
          name="email"
          placeholder="e.g. johndoe@farm.com"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
        />

        {/* Phone Number */}
        <Input
          label="PHONE NUMBER"
          type="tel"
          name="phoneNumber"
          placeholder="e.g. 9876543210"
          icon={Phone}
          value={formData.phoneNumber}
          onChange={handleChange}
          error={fieldErrors.phoneNumber}
          required
        />

        {/* Register As Dropdown */}
        <Select
          label="REGISTER AS"
          name="role"
          icon={UserCheck}
          options={roleOptions}
          value={formData.role}
          onChange={handleChange}
        />

        {/* Password & Confirm Password (2 columns matching screenshot) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Input
              label="PASSWORD"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="••••••••"
              icon={Lock}
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="CONFIRM PASSWORD"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              placeholder="••••••••"
              icon={Lock}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
              required
            />
            <button
              type="button"
              className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 focus:outline-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Terms Checkbox */}
        <div className="pt-2">
          <label className="flex items-start text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              name="termsAccepted"
              className="mt-0.5 mr-2 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 shrink-0"
              checked={formData.termsAccepted}
              onChange={handleChange}
            />
            <span>
              I accept the{' '}
              <a href="#terms" className="text-emerald-600 font-bold hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#privacy" className="text-emerald-600 font-bold hover:underline">
                Privacy Policies
              </a>
            </span>
          </label>
          {fieldErrors.termsAccepted && (
            <p className="text-xs text-rose-500 mt-1 font-semibold">{fieldErrors.termsAccepted}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full py-3.5 mt-6 shadow-md"
          isLoading={loading}
        >
          Sign Up
        </Button>
      </form>

      {/* Login Redirect */}
      <p className="text-sm font-medium text-slate-500 text-center select-none mt-6">
        Already have an account?{' '}
        <Link
          to="/customer/login"
          className="text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
