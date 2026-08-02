import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import OTPInput from '../../components/common/OTPInput';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { verifyOtp } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve user payload passed from Login/Register state
  const email = location.state?.email || 'your-email@example.com';
  const role = location.state?.role || 'farmer';
  const step = location.state?.step || 'login';

  // Countdown timer logic
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    setTimer(60);
    setCanResend(false);
    setOtp('');
    setError('');
    toast.success('A new verification code has been sent to ' + email);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await verifyOtp(otp, email);
      
      // Verification succeeded. Set success animation active
      setIsSuccess(true);
      
      // Delay redirection to show off checkmark animation
      setTimeout(() => {
        toast.success('Account activated! Please sign in to continue.');
        navigate('/login');
      }, 1800);
    } catch (err) {
      console.error("Verify OTP error in component:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      setError(err.response?.data?.message || err.response?.data?.error || 'Invalid verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`We sent a 6-digit authentication code to ${email}`}>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form
            key="otp-form"
            onSubmit={handleVerify}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 text-center"
          >
            {/* OTP input digits block */}
            <OTPInput
              length={6}
              value={otp}
              onChange={(val) => {
                setOtp(val);
                if (error) setError('');
              }}
              error={error}
            />

            {/* Countdown timer feedback */}
            <div className="text-sm font-semibold select-none flex items-center justify-center gap-1.5 text-slate-500">
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  Resend Verification Code
                </button>
              ) : (
                <span>
                  Resend code in <strong className="text-primary">{timer}s</strong>
                </span>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              variant="gradient"
              className="w-full py-3.5 mt-2"
              isLoading={loading}
              icon={ShieldCheck}
            >
              Verify Code
            </Button>
          </motion.form>
        ) : (
          <motion.div
            key="success-screen"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-6 text-center"
          >
            {/* Checkmark motion scale */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5, times: [0, 0.7, 1] }}
              className="bg-primary/10 p-5 rounded-full text-primary mb-6"
            >
              <CheckCircle2 className="w-16 h-16" />
            </motion.div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Identity Verified
            </h3>
            <p className="text-sm font-semibold text-slate-500">
              Securing connection and redirecting to portal...
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
};

export default VerifyOtp;
