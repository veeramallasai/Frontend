import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';

// Validation Schema using Zod
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Phone number must be 10-15 digits without spaces or hyphens'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
  role: z.enum(['farmer', 'customer', 'admin'], { required_error: 'Please select a role' }),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the terms & conditions' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Register = () => {
  const [loading, setLoading] = useState(false);
  const { registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'farmer',
      acceptTerms: false,
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      // Success. Redirect to OTP verification for new accounts
      navigate('/verify-otp', { state: { email: data.email, role: data.role, step: 'register' } });
    } catch (err) {
      console.error('Registration submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'farmer', label: 'Farmer / Producer' },
    { value: 'customer', label: 'Customer / Consumer' },
    { value: 'admin', label: 'Administrator' }
  ];

  return (
    <AuthLayout title="Create Account" subtitle="Join our farm-to-table network">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="e.g. John"
            icon={User}
            error={errors.firstName}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="e.g. Doe"
            icon={User}
            error={errors.lastName}
            {...register('lastName')}
          />
        </div>

        {/* Contact Fields */}
        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. johndoe@farm.com"
          icon={Mail}
          error={errors.email}
          {...register('email')}
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="e.g. 555-123-4567"
          icon={Phone}
          error={errors.phone}
          {...register('phone')}
        />

        {/* Role dropdown */}
        <Select
          label="Register As"
          icon={ClipboardCheck}
          options={roleOptions}
          error={errors.role}
          {...register('role')}
        />

        {/* Passwords */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.password}
            {...register('password')}
          />
          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            icon={Lock}
            error={errors.confirmPassword}
            {...register('confirmPassword')}
          />
        </div>

        {/* Accept terms checkbox */}
        <div className="flex flex-col text-left py-1.5 select-none">
          <label className="flex items-start text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              className="mr-2.5 rounded border-slate-300 text-primary focus:ring-primary w-4 h-4 mt-0.5"
              {...register('acceptTerms')}
            />
            <span>
              I accept the{' '}
              <a href="#" className="text-primary hover:underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-primary hover:underline">
                Privacy Policies
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <span className="text-xs text-red-500 mt-1 font-medium">
              {errors.acceptTerms.message}
            </span>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full py-3.5 mt-4"
          isLoading={loading}
        >
          Sign Up
        </Button>
      </form>

      {/* Redirect back to Login */}
      <p className="text-sm font-medium text-slate-500 text-center select-none mt-6">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary hover:text-primary-dark font-semibold transition-colors"
        >
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
