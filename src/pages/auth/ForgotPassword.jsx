import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

// Validation Schema using Zod
const schema = z.object({
  email: z.string().min(1, 'Email or phone number is required'),
});

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await forgotPassword(data.email);
      // Success. Redirect to reset password page with email state
      navigate('/reset-password', { state: { email: data.email } });
    } catch (err) {
      console.error('Forgot password submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Recover Password" subtitle="Enter your email or phone number to verify identity and recover credentials">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email or Phone Number Field */}
        <Input
          label="Email Address or Phone Number"
          type="text"
          placeholder="e.g. farmer@field.com or 9876543210"
          icon={Mail}
          error={errors.email}
          {...register('email')}
        />

        {/* Submit */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full py-3.5"
          isLoading={loading}
          icon={Send}
        >
          Send Recovery Link
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

export default ForgotPassword;
