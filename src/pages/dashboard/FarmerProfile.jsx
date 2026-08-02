import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { User, Phone, Mail, Save } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  email: z.string().email('Please enter a valid email address'),
});

const FarmerProfile = () => {
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      email: user?.email || '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await updateProfile(data);
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
          Farmer Profile Settings
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Review and update your contact settings and basic credentials.
        </p>
      </div>

      <Card className="bg-white border-0 shadow-premium p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center space-x-4 mb-6 select-none bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-base">
              {user?.firstName?.[0] || 'F'}{user?.lastName?.[0] || ''}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                {user?.firstName} {user?.lastName}
              </h4>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                ID: {user?.id}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              icon={User}
              error={errors.firstName}
              {...register('firstName')}
            />
            <Input
              label="Last Name"
              icon={User}
              error={errors.lastName}
              {...register('lastName')}
            />
          </div>

          <Input
            label="Email Address"
            type="email"
            icon={Mail}
            error={errors.email}
            disabled // prevent changing key account email in mockup
            {...register('email')}
          />

          <Input
            label="Phone Number"
            type="tel"
            icon={Phone}
            error={errors.phone}
            {...register('phone')}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4 py-3"
            isLoading={loading}
            icon={Save}
          >
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default FarmerProfile;
