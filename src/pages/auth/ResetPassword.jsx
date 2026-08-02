import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// Validation Schema using Zod
const schema = z.object({
  otpCode: z.string().length(6, 'OTP must be exactly 6 digits'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || 'your-email@example.com';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      otpCode: '',
      password: '',
      confirmPassword: '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPassword(email, data.password, data.otpCode);
      // Success. Redirect to Login
      navigate('/login');
    } catch (err) {
      console.error('Reset password submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Reset Password" subtitle={`Create a secure new password for ${email}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* OTP Code */}
        <Input
          label="Verification OTP"
          type="text"
          placeholder="6-digit code"
          icon={KeyRound}
          error={errors.otpCode}
          {...register('otpCode')}
        />

        {/* Password Fields */}
        <Input
          label="New Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.password}
          {...register('password')}
        />

        <Input
          label="Confirm New Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          error={errors.confirmPassword}
          {...register('confirmPassword')}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full py-3.5 mt-6"
          isLoading={loading}
          icon={KeyRound}
        >
          Update Password
        </Button>
      </form>

      {/* Redirect back to Login */}
      <p className="text-sm font-semibold text-center mt-8">
        <Link
          to="/login"
          className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </p>
    </AuthLayout>
  );
};

export default ResetPassword;
