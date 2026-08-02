import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { Lock, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
  confirmNewPassword: z.string().min(8, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

const FarmerSettings = () => {
  const [loading, setLoading] = useState(false);
  const { changePassword, deactivateAccount } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      reset();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (!window.confirm('Are you sure you want to permanently deactivate your account? This action cannot be reversed.')) {
      return;
    }
    setLoading(true);
    try {
      await deactivateAccount();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-left space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Security Settings
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Manage your credentials, login settings, and account data deletion.
        </p>
      </div>

      {/* Change Password Card */}
      <Card className="bg-white border-0 shadow-premium p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            Update Password
          </h3>

          <Input
            label="Current Password"
            type="password"
            placeholder="••••••••"
            error={errors.currentPassword}
            {...register('currentPassword')}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="••••••••"
            error={errors.newPassword}
            {...register('newPassword')}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="••••••••"
            error={errors.confirmNewPassword}
            {...register('confirmNewPassword')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4 py-3"
            isLoading={loading}
            icon={Save}
          >
            Save Password
          </Button>
        </form>
      </Card>

      {/* Danger Zone Card */}
      <Card className="bg-white border border-red-100 p-6">
        <h3 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4" />
          Danger Zone
        </h3>
        
        <Alert
          type="error"
          message="Permanent Account Deactivation"
          description="Once deactivated, all organic listings, farm data history, and pending cash payouts will be permanently wiped out. This action cannot be reversed."
          className="mb-4"
        />

        <Button 
          variant="ghost" 
          onClick={handleDeactivate}
          isLoading={loading}
          className="text-red-500 border border-red-200 hover:bg-red-50 hover:text-red-600 font-semibold w-full py-3"
        >
          Deactivate Profile
        </Button>
      </Card>
    </div>
  );
};

export default FarmerSettings;
