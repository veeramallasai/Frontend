import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { authService } from '../../services/authService';
import AuthLayout from '../../components/auth/AuthLayout';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

const VerifyOtp = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email =
    location.state?.email ||
    sessionStorage.getItem('pendingVerificationEmail') ||
    'customer@example.com';

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    const cleanValue = value.replace(/\D/g, '');
    if (!cleanValue && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = cleanValue.slice(-1);
    setOtp(newOtp);

    if (cleanValue && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
      const newOtp = [...otp];
      for (let i = 0; i < pasteData.length; i++) {
        newOtp[i] = pasteData[i];
      }
      setOtp(newOtp);
      const nextFocus = Math.min(pasteData.length, 5);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      toast.error('Please enter complete 6-digit OTP code.');
      return;
    }

    setLoading(true);
    try {
      await authService.verifyOtp(email, fullOtp);
      sessionStorage.removeItem('pendingVerificationEmail');
      toast.success('Email verified successfully!');
      navigate('/customer/login', { state: { email } });
    } catch (err) {
      console.error('[Verify OTP Error]:', err);
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Invalid or expired verification code.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (isResendDisabled || resending) return;

    setResending(true);
    try {
      await authService.resendOtp(email);
      toast.success('A new verification code has been sent to your email.');
      setOtp(['', '', '', '', '', '']);
      setTimer(60);
      setIsResendDisabled(true);
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Verify OTP" subtitle={`We sent a 6-digit authentication code to ${email}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6 Separate OTP Boxes matching screenshot */}
        <div className="flex justify-center items-center gap-2 sm:gap-3 my-4">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-11 h-12 sm:w-13 sm:h-14 text-center text-xl font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Resend Timer / Link */}
        <div className="text-center">
          {isResendDisabled ? (
            <p className="text-xs sm:text-sm font-semibold text-slate-500">
              Resend code in <span className="text-emerald-600 font-extrabold">{timer}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors cursor-pointer"
            >
              {resending ? 'Sending new code...' : 'Resend OTP Code'}
            </button>
          )}
        </div>

        {/* Submit Verify Code Button matching screenshot */}
        <Button
          type="submit"
          variant="gradient"
          className="w-full py-3.5 shadow-md flex items-center justify-center gap-2"
          isLoading={loading}
          disabled={!isOtpComplete || loading}
        >
          <ShieldCheck className="w-5 h-5" />
          Verify Code
        </Button>
      </form>
    </AuthLayout>
  );
};

export default VerifyOtp;
