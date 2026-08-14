import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import { CreditCard, Save } from 'lucide-react';
import toast from 'react-hot-toast';

const bankSchema = z.object({
  accHolderName: z.string().min(1, 'Account holder name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accNumber: z.string().min(8, 'Account number must be at least 8 digits'),
  ifscCode: z.string().min(11, 'IFSC must be exactly 11 characters').max(11, 'IFSC must be 11 characters'),
});

const FarmerBankDetails = () => {
  const [loading, setLoading] = useState(false);
  const { user, updateProfile } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accHolderName: user?.farmDetails?.bankDetails?.accountHolderName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || '',
      bankName: user?.farmDetails?.bankDetails?.bankName || '',
      accNumber: user?.farmDetails?.bankDetails?.accountNumber || '',
      ifscCode: user?.farmDetails?.bankDetails?.ifscCode || '',
    }
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const bankDetails = {
        bankName: data.bankName,
        accountHolderName: data.accHolderName,
        accountNumber: data.accNumber,
        ifscCode: data.ifscCode,
        branchName: user?.farmDetails?.village || 'Branch',
        upiId: user?.farmDetails?.bankDetails?.upiId || `${user?.phone || '9876543210'}@upi`
      };

      const payload = {
        farmName: user?.farmDetails?.farmName || 'My Farm',
        ownerName: user?.farmDetails?.ownerName || `${user?.firstName} ${user?.lastName}`,
        address: user?.farmDetails?.address || 'Default Address',
        village: user?.farmDetails?.village || 'Village',
        district: user?.farmDetails?.district || 'District',
        state: user?.farmDetails?.state || 'State',
        pincode: user?.farmDetails?.pincode || '500001',
        farmSize: user?.farmDetails?.farmSize || 1.0,
        farmingType: user?.farmDetails?.farmingType || 'ORGANIC',
        yearsExperience: user?.farmDetails?.yearsExperience || 1,
        aadhaarNumber: user?.farmDetails?.aadhaarNumber || '222222222222',
        profilePhotoUrl: user?.farmDetails?.profilePhotoUrl || '',
        bankDetails: bankDetails
      };

      await updateProfile({
        onboarding: true,
        payload: payload
      });
      toast.success('Payout bank details updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update bank details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto text-left space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight">
          Financial Settlements Bank
        </h1>
        <p className="text-xs font-semibold text-slate-400 mt-1">
          Update the bank account receiving weekly direct deposits.
        </p>
      </div>

      {!user?.bankDetails && (
        <Alert
          type="warning"
          message="No Settlement Bank Configured"
          description="Please add details below so our audits can clear your weekly payouts."
        />
      )}

      <Card className="bg-white border-0 shadow-premium p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-primary" />
            Active Settlement Bank
          </h3>

          <Input
            label="Account Holder Name"
            error={errors.accHolderName}
            {...register('accHolderName')}
          />

          <Input
            label="Bank Name"
            placeholder="e.g. HDFC Bank"
            error={errors.bankName}
            {...register('bankName')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Account Number"
              error={errors.accNumber}
              {...register('accNumber')}
            />
            <Input
              label="IFSC Code"
              placeholder="11-character code"
              error={errors.ifscCode}
              {...register('ifscCode')}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full mt-4 py-3"
            isLoading={loading}
            icon={Save}
          >
            Save Account Details
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default FarmerBankDetails;
