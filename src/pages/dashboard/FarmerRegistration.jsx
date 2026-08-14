import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  MapPin, 
  Sprout, 
  CreditCard, 
  UploadCloud, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  ShieldCheck,
  FileCheck,
  Building
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import Input from '../../components/common/Input';

import Select from '../../components/common/Select';
import Textarea from '../../components/common/Textarea';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';

// ----------------- ZOD SCHEMAS FOR INDIVIDUAL STEPS -----------------
const personalSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Valid email required'),
  phone: z.string().min(10, 'Phone must be at least 10 digits'),
  alternatePhone: z.string().optional(),
});

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipCode: z.string().min(6, 'ZIP code must be 6 digits'),
});

const farmSchema = z.object({
  farmName: z.string().min(1, 'Farm name is required'),
  farmSize: z.string().min(1, 'Farm size is required'),
  primaryCrops: z.string().min(1, 'Primary crop types are required'),
  organicStatus: z.enum(['certified', 'in-conversion', 'non-certified'], {
    required_error: 'Organic status is required',
  }),
});

const bankSchema = z.object({
  accHolderName: z.string().min(1, 'Account holder name is required'),
  bankName: z.string().min(1, 'Bank name is required'),
  accNumber: z.string().min(8, 'Account number must be at least 8 digits'),
  ifscCode: z.string().min(11, 'IFSC code must be exactly 11 characters').max(11, 'IFSC code must be 11 characters'),
});

const documentSchema = z.object({
  aadhaarNumber: z.string().min(12, 'Aadhaar must be 12 digits').max(12, 'Aadhaar must be 12 digits'),
  landRegistryDeed: z.any().optional(),
  organicCertDoc: z.any().optional(),
});

const STEPS = [
  { id: 1, name: 'Personal Details', icon: User },
  { id: 2, name: 'Address Details', icon: MapPin },
  { id: 3, name: 'Farm Details', icon: Sprout },
  { id: 4, name: 'Bank Details', icon: CreditCard },
  { id: 5, name: 'Documents', icon: UploadCloud },
  { id: 6, name: 'Review & Submit', icon: CheckCircle },
];

const FarmerRegistration = () => {
  const { user, updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState({ deed: null, cert: null });
  const navigate = useNavigate();

  // Pre-populate fields once user resolves
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);


  // Pick schema based on step
  const getStepSchema = () => {
    switch (currentStep) {
      case 1: return personalSchema;
      case 2: return addressSchema;
      case 3: return farmSchema;
      case 4: return bankSchema;
      case 5: return documentSchema;
      default: return z.object({});
    }
  };

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(getStepSchema()),
    values: formData, // Sync state back to hook-form fields
  });

  const handleNext = async () => {
    const isStepValid = await trigger();
    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      toast.error('Please correct errors in current step fields.');
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const onStepSubmit = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    handleNext();
  };

  const handleFileUpload = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const uploadForm = new FormData();
      uploadForm.append('file', file);
      try {
        toast.loading('Uploading file...', { id: 'file-upload' });
        const response = await api.post('/files/upload', uploadForm, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        const fileUrl = response.data.data;
        setFiles((prev) => ({ ...prev, [type]: { name: file.name, url: fileUrl } }));
        toast.success(`${file.name} uploaded successfully!`, { id: 'file-upload' });
      } catch (err) {
        toast.error('File upload failed.', { id: 'file-upload' });
      }
    }
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    try {
      const bankDetails = {
        bankName: formData.bankName || 'Default Bank',
        accountHolderName: formData.accHolderName || `${formData.firstName} ${formData.lastName}`,
        accountNumber: formData.accNumber || '',
        ifscCode: formData.ifscCode || '',
        branchName: formData.city || 'Branch',
        upiId: `${formData.phone || '9876543210'}@upi`
      };

      const payload = {
        farmName: formData.farmName,
        ownerName: `${formData.firstName} ${formData.lastName}`,
        address: formData.street,
        village: formData.city,
        district: formData.city,
        state: formData.state,
        pincode: formData.zipCode,
        farmSize: parseFloat(formData.farmSize) || 1.0,
        farmingType: formData.organicStatus === 'non-certified' ? 'NON_ORGANIC' : 'ORGANIC',
        yearsExperience: 1,
        aadhaarNumber: formData.aadhaarNumber,
        profilePhotoUrl: files.cert?.url || '',
        bankDetails: bankDetails
      };

      await updateProfile({
        onboarding: true,
        payload: payload
      });

      toast.success('Registration completed! Awaiting Audit review.');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      toast.error('Submission failed. Please check details and try again.');
    } finally {
      setLoading(false);
    }
  };


  // State Options list
  const stateOptions = [
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Page Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Farmer Portal Onboarding
          </h1>
          <p className="text-sm font-medium text-slate-500 max-w-md mx-auto">
            Complete the compliance audits to secure direct-to-bank settlements.
          </p>
        </div>

        {/* Dynamic Progress Indicator Stepper */}
        <div className="hidden md:flex justify-between items-center relative px-4 select-none">
          {/* Background Connecting line */}
          <div className="absolute top-[22px] left-[50px] right-[50px] h-0.5 bg-slate-200 -z-10" />
          {/* Active green connecting line */}
          <div 
            className="absolute top-[22px] left-[50px] h-0.5 bg-primary transition-all duration-500 -z-10"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 88}%` }}
          />

          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center flex-1">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-semibold text-sm
                  ${isCompleted 
                    ? 'bg-primary border-primary text-white' 
                    : isActive 
                    ? 'bg-white border-primary text-primary shadow-sm ring-4 ring-primary/10' 
                    : 'bg-white border-slate-200 text-slate-400'
                  }
                `}>
                  {isCompleted ? <FileCheck className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={`text-[10px] font-bold mt-2 tracking-wide uppercase text-center
                  ${isActive ? 'text-primary' : isCompleted ? 'text-slate-700' : 'text-slate-400'}
                `}>
                  {step.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Small mobile step tag */}
        <div className="md:hidden text-center select-none bg-white p-3 border border-slate-100 rounded-xl">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Step {currentStep} of {STEPS.length}:{' '}
            <strong className="text-primary">{STEPS[currentStep - 1].name}</strong>
          </span>
        </div>

        {/* Multi-step form panel content */}
        <Card className="bg-white p-8 border border-slate-100/80 shadow-premium relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              transition={{ duration: 0.25 }}
            >
              {/* Form submit wraps first 5 steps */}
              {currentStep < 6 ? (
                <form onSubmit={handleSubmit(onStepSubmit)} className="space-y-6">
                  
                  {/* STEP 1: PERSONAL DETAILS */}
                  {currentStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-primary" />
                        Personal Information
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="First Name"
                          error={errors.firstName}
                          {...register('firstName')}
                        />
                        <Input
                          label="Last Name"
                          error={errors.lastName}
                          {...register('lastName')}
                        />
                      </div>
                      <Input
                        label="Email Address"
                        type="email"
                        error={errors.email}
                        {...register('email')}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Mobile Phone"
                          type="tel"
                          error={errors.phone}
                          {...register('phone')}
                        />
                        <Input
                          label="Alternate Phone (Optional)"
                          type="tel"
                          error={errors.alternatePhone}
                          {...register('alternatePhone')}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ADDRESS DETAILS */}
                  {currentStep === 2 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        Residential & Farm Address
                      </h3>
                      <Input
                        label="Street / Door Number / Block"
                        error={errors.street}
                        {...register('street')}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        <Input
                          label="City / Town"
                          className="col-span-2"
                          error={errors.city}
                          {...register('city')}
                        />
                        <Input
                          label="ZIP / Pin Code"
                          error={errors.zipCode}
                          {...register('zipCode')}
                        />
                      </div>
                      <Select
                        label="State / Province"
                        options={stateOptions}
                        error={errors.state}
                        {...register('state')}
                      />
                    </div>
                  )}

                  {/* STEP 3: FARM DETAILS */}
                  {currentStep === 3 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-primary" />
                        Agricultural Land Profile
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Farm / Orchard Name"
                          placeholder="e.g. Green Valley Farm"
                          error={errors.farmName}
                          {...register('farmName')}
                        />
                        <Input
                          label="Total Land Size (Acres)"
                          placeholder="e.g. 15"
                          error={errors.farmSize}
                          {...register('farmSize')}
                        />
                      </div>
                      <Input
                        label="Primary Crop Types Produced"
                        placeholder="e.g. Organic Apples, Carrots, Wheat"
                        error={errors.primaryCrops}
                        {...register('primaryCrops')}
                      />
                      <Select
                        label="Organic Certification Status"
                        options={[
                          { value: 'certified', label: 'Certified Organic (FSSAI/NPOP)' },
                          { value: 'in-conversion', label: 'In Transition/Organic Conversion' },
                          { value: 'non-certified', label: 'Non-Certified Natural Farming' },
                        ]}
                        error={errors.organicStatus}
                        {...register('organicStatus')}
                      />
                    </div>
                  )}

                  {/* STEP 4: BANK DETAILS */}
                  {currentStep === 4 && (
                    <div className="space-y-4">
                      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-primary" />
                        Financial Settlement Profile
                      </h3>
                      <Input
                        label="Account Holder Name"
                        placeholder="Must match name in registry"
                        error={errors.accHolderName}
                        {...register('accHolderName')}
                      />
                      <Input
                        label="Bank / Financial Institution Name"
                        placeholder="e.g. State Bank of India"
                        error={errors.bankName}
                        {...register('bankName')}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                          label="Bank Account Number"
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
                    </div>
                  )}

                  {/* STEP 5: DOCUMENT UPLOAD */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UploadCloud className="w-5 h-5 text-primary" />
                        Verification Documents Upload
                      </h3>
                      
                      <Input
                        label="Aadhaar Card Number"
                        placeholder="12-digit UIDAI identity code"
                        error={errors.aadhaarNumber}
                        {...register('aadhaarNumber')}
                      />

                      {/* Document Dropzone simulation */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        {/* Land Deed file */}
                        <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors p-6 rounded-2xl flex flex-col items-center justify-center text-center relative bg-slate-50">
                          <input 
                            type="file" 
                            id="deed-upload"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFileUpload(e, 'deed')}
                          />
                          <UploadCloud className="w-8 h-8 text-slate-400 mb-2.5" />
                          <h5 className="text-xs font-bold text-slate-700">Land Registry Deed</h5>
                          <p className="text-[10px] text-slate-400 mt-1 select-none">PDF or JPG formats up to 5MB</p>
                          {files.deed && (
                            <span className="text-[10px] text-primary font-semibold mt-2 truncate max-w-full">
                              ✓ {files.deed.name}
                            </span>
                          )}
                        </div>

                        {/* Organic Cert file */}
                        <div className="border-2 border-dashed border-slate-200 hover:border-primary/50 transition-colors p-6 rounded-2xl flex flex-col items-center justify-center text-center relative bg-slate-50">
                          <input 
                            type="file" 
                            id="cert-upload"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            onChange={(e) => handleFileUpload(e, 'cert')}
                          />
                          <UploadCloud className="w-8 h-8 text-slate-400 mb-2.5" />
                          <h5 className="text-xs font-bold text-slate-700">Organic Certification</h5>
                          <p className="text-[10px] text-slate-400 mt-1 select-none">PDF or JPG formats up to 5MB</p>
                          {files.cert && (
                            <span className="text-[10px] text-primary font-semibold mt-2 truncate max-w-full">
                              ✓ {files.cert.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons for standard pages */}
                  <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">
                    {currentStep > 1 && (
                      <Button variant="outline" onClick={handleBack} icon={ArrowLeft}>
                        Back
                      </Button>
                    )}
                    <Button
                      type="submit"
                      variant="primary"
                      className="ml-auto"
                      icon={ArrowRight}
                      iconPosition="right"
                    >
                      Continue
                    </Button>
                  </div>

                </form>
              ) : (
                /* STEP 6: SUMMARY REVIEW SCREEN */
                <div className="space-y-6">
                  <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2 select-none">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Review Summary Details
                  </h3>
                  <p className="text-xs font-medium text-slate-400 mb-6">
                    Please review all parameters before launching the auditing compliance review request.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                    {/* Column 1: Personal + Address */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                          Personal Details
                        </h4>
                        <p className="font-semibold text-slate-700">{formData.firstName} {formData.lastName}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{formData.email}</p>
                        <p className="text-slate-500 text-xs">{formData.phone}</p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                          Address details
                        </h4>
                        <p className="text-slate-600 text-xs leading-normal">
                          {formData.street}, <br />
                          {formData.city}, {formData.state} - {formData.zipCode}
                        </p>
                      </div>
                    </div>

                    {/* Column 2: Farm + Bank */}
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                          Farm Profile
                        </h4>
                        <p className="font-semibold text-slate-700">{formData.farmName}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{formData.farmSize} Acres • {formData.primaryCrops}</p>
                        <p className="text-slate-500 text-xs mt-1 font-semibold uppercase text-primary">
                          Certification: {formData.organicStatus}
                        </p>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-2.5">
                          Settlement Bank
                        </h4>
                        <p className="font-semibold text-slate-700">{formData.accHolderName}</p>
                        <p className="text-slate-500 text-xs mt-0.5">{formData.bankName}</p>
                        <p className="text-slate-500 text-xs">A/C: {formData.accNumber} • IFSC: {formData.ifscCode}</p>
                      </div>
                    </div>
                  </div>

                  {/* Submission buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-slate-100 mt-8">
                    <Button variant="outline" onClick={handleBack} icon={ArrowLeft} isDisabled={loading}>
                      Back
                    </Button>
                    <Button
                      variant="gradient"
                      className="ml-auto px-8"
                      onClick={handleFinalSubmit}
                      isLoading={loading}
                      icon={ShieldCheck}
                    >
                      Submit Application
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>
      </div>
    </div>
  );
};

export default FarmerRegistration;
