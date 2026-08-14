import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Loader2,
  UserPlus,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  VenetianMask,
  CreditCard,
  Bike,
  Hash,
  MapPin,
  Building2,
  Landmark,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import deliveryPartnerRegistrationService from '../../services/deliveryPartnerRegistrationService';
import '../../styles/deliveryPartnerRegister.css';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialValues = {
  fullName: '',
  mobileNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
  gender: '',
  aadhaarNumber: '',
  drivingLicenseNumber: '',
  vehicleType: '',
  vehicleNumber: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  emergencyContactNumber: '',
};

const DeliveryPartnerRegister = () => {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSentToEmail, setOtpSentToEmail] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyOtpLoading, setVerifyOtpLoading] = useState(false);
  const [resendOtpLoading, setResendOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpMessage, setOtpMessage] = useState('');
  const [otpMessageType, setOtpMessageType] = useState('');

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const normalizedEmail = String(formValues.email || '').trim().toLowerCase();

  useEffect(() => {
    if (resendCooldown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');

  const getValidationErrors = (values) => {
    const errors = {};

    if (!values.fullName.trim()) errors.fullName = 'Full name is required.';

    const mobile = normalizeDigits(values.mobileNumber);
    if (mobile.length !== 10) {
      errors.mobileNumber = 'Mobile number must contain exactly 10 digits.';
    }

    const email = String(values.email || '').trim().toLowerCase();
    if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!values.password || values.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Password and confirm password must match.';
    }

    if (!values.dateOfBirth) errors.dateOfBirth = 'Date of birth is required.';
    if (!values.gender) errors.gender = 'Gender is required.';

    const aadhaar = normalizeDigits(values.aadhaarNumber);
    if (aadhaar.length !== 12) {
      errors.aadhaarNumber = 'Aadhaar number must contain exactly 12 digits.';
    }

    if (!values.drivingLicenseNumber.trim()) errors.drivingLicenseNumber = 'Driving license number is required.';
    if (!values.vehicleType) errors.vehicleType = 'Vehicle type is required.';
    if (!values.vehicleNumber.trim()) errors.vehicleNumber = 'Vehicle number is required.';
    if (!values.address.trim()) errors.address = 'Address is required.';
    if (!values.city.trim()) errors.city = 'City is required.';
    if (!values.state.trim()) errors.state = 'State is required.';

    const pincode = normalizeDigits(values.pincode);
    if (pincode.length !== 6) {
      errors.pincode = 'Pincode must contain exactly 6 digits.';
    }

    const emergency = normalizeDigits(values.emergencyContactNumber);
    if (emergency.length !== 10) {
      errors.emergencyContactNumber = 'Emergency contact number must contain exactly 10 digits.';
    }

    return errors;
  };

  const isFormReadyForSubmit = Object.keys(getValidationErrors(formValues)).length === 0;
  const canCreateAccount = isFormReadyForSubmit && emailVerified && !loading;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }

    if (name === 'email') {
      const nextEmail = String(value || '').trim().toLowerCase();
      if (nextEmail !== verifiedEmail) {
        if (emailVerified) {
          setOtpMessage('Email changed. Please verify OTP for the new email.');
          setOtpMessageType('error');
        }
        setEmailVerified(false);
      }

      if (nextEmail !== otpSentToEmail) {
        setOtpCode('');
      }
    }
  };

  const validate = () => {
    const errors = getValidationErrors(formValues);
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendOtp = async () => {
    const email = normalizedEmail;

    if (!email) {
      setFieldErrors((prev) => ({ ...prev, email: 'Email is required before sending OTP.' }));
      setOtpMessage('Failed to send OTP');
      setOtpMessageType('error');
      return;
    }

    if (!emailRegex.test(email)) {
      setFieldErrors((prev) => ({ ...prev, email: 'Please enter a valid email address.' }));
      setOtpMessage('Failed to send OTP');
      setOtpMessageType('error');
      return;
    }

    setOtpLoading(true);
    setOtpMessage('');

    try {
      const response = await deliveryPartnerRegistrationService.sendOtp(email);
      const devOtp = response?.data?.otpCode;
      setOtpSentToEmail(email);
      setEmailVerified(false);
      setVerifiedEmail('');
      setOtpCode('');
      setResendCooldown(60);
      setOtpMessage(devOtp ? `OTP sent successfully. Dev OTP: ${devOtp}` : (response?.message || 'OTP sent successfully'));
      setOtpMessageType('success');
      toast.success(devOtp ? `OTP sent. Use OTP: ${devOtp}` : 'OTP sent successfully');
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to send OTP';

      const normalized = backendMessage.toLowerCase();
      if (normalized.includes('already registered')) {
        setFieldErrors((prev) => ({ ...prev, email: 'Email already registered.' }));
      }

      setOtpMessage(backendMessage);
      setOtpMessageType('error');
      toast.error(backendMessage);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpSentToEmail || otpSentToEmail !== normalizedEmail) {
      setOtpMessage('Please send OTP for the current email address first.');
      setOtpMessageType('error');
      return;
    }

    if (!/^\d{6}$/.test(String(otpCode || '').trim())) {
      setOtpMessage('Please enter a valid 6-digit OTP.');
      setOtpMessageType('error');
      return;
    }

    setVerifyOtpLoading(true);
    try {
      const response = await deliveryPartnerRegistrationService.verifyOtp(normalizedEmail, otpCode);
      setEmailVerified(true);
      setVerifiedEmail(normalizedEmail);
      setOtpMessage(response?.message || 'Email verified successfully');
      setOtpMessageType('success');
      toast.success('Email Verified Successfully');
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Invalid OTP';
      setEmailVerified(false);
      setOtpMessage(backendMessage);
      setOtpMessageType('error');
      toast.error(backendMessage);
    } finally {
      setVerifyOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !normalizedEmail || otpSentToEmail !== normalizedEmail) {
      return;
    }

    setResendOtpLoading(true);
    try {
      const response = await deliveryPartnerRegistrationService.resendOtp(normalizedEmail);
      const devOtp = response?.data?.otpCode;
      setEmailVerified(false);
      setVerifiedEmail('');
      setOtpCode('');
      setResendCooldown(60);
      setOtpMessage(devOtp ? `OTP sent successfully. Dev OTP: ${devOtp}` : (response?.message || 'OTP sent successfully'));
      setOtpMessageType('success');
      toast.success(devOtp ? `OTP resent. Use OTP: ${devOtp}` : 'OTP sent successfully');
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Failed to send OTP';
      setOtpMessage(backendMessage);
      setOtpMessageType('error');
      toast.error(backendMessage);
    } finally {
      setResendOtpLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) {
      toast.error('Please fix validation errors before submitting.');
      return;
    }

    if (!emailVerified || normalizedEmail !== verifiedEmail) {
      setOtpMessage('Please verify your email using OTP before creating account.');
      setOtpMessageType('error');
      toast.error('Please verify your email first.');
      return;
    }

    setLoading(true);
    setServerMessage('');

    try {
      const payload = {
        ...formValues,
        email: formValues.email.trim().toLowerCase(),
        mobileNumber: normalizeDigits(formValues.mobileNumber),
        aadhaarNumber: normalizeDigits(formValues.aadhaarNumber),
        pincode: normalizeDigits(formValues.pincode),
        emergencyContactNumber: normalizeDigits(formValues.emergencyContactNumber),
      };

      const response = await deliveryPartnerRegistrationService.register(payload);
      const message = response?.message || response?.data?.message || 'Registration submitted.';

      setIsSuccess(true);
      setServerMessage(message);
      toast.success('Registration Submitted Successfully.');

      setTimeout(() => {
        navigate('/delivery-partner/login');
      }, 2200);
    } catch (error) {
      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.customFormattedMessage ||
        error?.message ||
        'Registration failed. Please try again.';

      const normalized = backendMessage.toLowerCase();
      if (normalized.includes('email') && (normalized.includes('already') || normalized.includes('exists'))) {
        setFieldErrors((prev) => ({ ...prev, email: 'Email is already registered.' }));
      }
      if ((normalized.includes('mobile') || normalized.includes('phone')) && (normalized.includes('already') || normalized.includes('exists'))) {
        setFieldErrors((prev) => ({ ...prev, mobileNumber: 'Mobile number is already registered.' }));
      }

      setServerMessage(backendMessage);
      toast.error(backendMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (config) => {
    const { name, label, type = 'text', placeholder, icon: IconComponent, isTextArea = false } = config;
    const hasError = Boolean(fieldErrors[name]);

    return (
      <div className={`dpr-field ${config.fullWidth ? 'dpr-field-full' : ''} ${hasError ? 'dpr-field-error' : ''}`}>
        <label htmlFor={name}>
          {label} <span className="dpr-required">*</span>
        </label>
        <div className="dpr-input-wrap">
          {isTextArea ? (
            <textarea
              id={name}
              name={name}
              className="dpr-textarea"
              placeholder={placeholder}
              value={formValues[name]}
              onChange={handleChange}
            />
          ) : (
            <>
              <span className="dpr-input-icon">
                <IconComponent size={17} />
              </span>
              <input
                id={name}
                name={name}
                type={type}
                className="dpr-input"
                placeholder={placeholder}
                value={formValues[name]}
                onChange={handleChange}
                max={type === 'date' ? today : undefined}
              />
            </>
          )}
        </div>
        {hasError && <p className="dpr-error-text">{fieldErrors[name]}</p>}
      </div>
    );
  };

  return (
    <div className="dpr-page">
      <div className="dpr-wrapper">
        <div className="dpr-top-row">
          <Link to="/delivery-partner/login" className="dpr-back-link">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

        <div className="dpr-card">
          <div className="dpr-header">
            <div className="dpr-header-icon">
              <UserPlus size={30} />
            </div>
            <div>
              <h1>Delivery Partner Registration</h1>
              <p>Create your account to start delivering fresh Farm2Home orders.</p>
            </div>
          </div>

          {isSuccess ? (
            <div className="dpr-success-state">
              <CheckCircle2 size={56} color="#16A34A" />
              <h2>Registration Submitted Successfully.</h2>
              <p>Your email has been verified and your account is under Admin Verification.</p>
              {serverMessage && <p style={{ marginTop: '10px' }}>{serverMessage}</p>}
              <p style={{ marginTop: '12px', fontWeight: 700, color: '#166534' }}>Redirecting to Login...</p>
            </div>
          ) : (
            <form className="dpr-form" onSubmit={handleSubmit}>
              {serverMessage && (
                <div className="dpr-alert dpr-alert-error">
                  <AlertCircle size={18} />
                  <span>{serverMessage}</span>
                </div>
              )}

              <section className="dpr-section">
                <div className="dpr-section-title">
                  <ShieldCheck size={18} /> Personal Details
                </div>
                <div className="dpr-grid">
                  {renderField({ name: 'fullName', label: 'Full Name', placeholder: 'Enter your full name', icon: User })}
                  {renderField({ name: 'mobileNumber', label: 'Mobile Number', placeholder: '9876543210', icon: Phone })}

                  <div className={`dpr-field ${fieldErrors.email ? 'dpr-field-error' : ''}`}>
                    <label htmlFor="email">Email Address <span className="dpr-required">*</span></label>
                    <div className="dpr-input-wrap">
                      <span className="dpr-input-icon"><Mail size={17} /></span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        className="dpr-input"
                        placeholder="name@example.com"
                        value={formValues.email}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="dpr-otp-actions-row">
                      <button
                        type="button"
                        className="dpr-otp-btn"
                        onClick={handleSendOtp}
                        disabled={otpLoading || loading}
                      >
                        {otpLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                        {otpLoading ? 'Sending...' : 'Send OTP'}
                      </button>

                      {otpSentToEmail === normalizedEmail && !emailVerified && (
                        <button
                          type="button"
                          className="dpr-otp-link-btn"
                          onClick={handleResendOtp}
                          disabled={resendCooldown > 0 || resendOtpLoading}
                        >
                          {resendOtpLoading ? 'Resending...' : resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                        </button>
                      )}

                      {emailVerified && normalizedEmail === verifiedEmail && (
                        <span className="dpr-otp-verified">Email Verified Successfully</span>
                      )}
                    </div>

                    {otpSentToEmail === normalizedEmail && !emailVerified && (
                      <div className="dpr-otp-verify-row">
                        <input
                          type="text"
                          inputMode="numeric"
                          className="dpr-otp-input"
                          placeholder="Enter 6-digit OTP"
                          value={otpCode}
                          onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                        />
                        <button
                          type="button"
                          className="dpr-otp-btn"
                          onClick={handleVerifyOtp}
                          disabled={verifyOtpLoading || otpCode.length !== 6}
                        >
                          {verifyOtpLoading ? <Loader2 size={15} className="animate-spin" /> : null}
                          {verifyOtpLoading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                      </div>
                    )}

                    {otpMessage && (
                      <p className={`dpr-otp-message ${otpMessageType === 'success' ? 'dpr-otp-success' : 'dpr-otp-error'}`}>
                        {otpMessage}
                      </p>
                    )}

                    {fieldErrors.email && <p className="dpr-error-text">{fieldErrors.email}</p>}
                  </div>

                  <div className={`dpr-field ${fieldErrors.password ? 'dpr-field-error' : ''}`}>
                    <label htmlFor="password">Password <span className="dpr-required">*</span></label>
                    <div className="dpr-input-wrap">
                      <span className="dpr-input-icon"><Lock size={17} /></span>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        className="dpr-input"
                        placeholder="At least 8 characters"
                        value={formValues.password}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="dpr-password-toggle"
                        onClick={() => setShowPassword((prev) => !prev)}
                        title={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.password && <p className="dpr-error-text">{fieldErrors.password}</p>}
                  </div>

                  <div className={`dpr-field ${fieldErrors.confirmPassword ? 'dpr-field-error' : ''}`}>
                    <label htmlFor="confirmPassword">Confirm Password <span className="dpr-required">*</span></label>
                    <div className="dpr-input-wrap">
                      <span className="dpr-input-icon"><Lock size={17} /></span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="dpr-input"
                        placeholder="Re-enter password"
                        value={formValues.confirmPassword}
                        onChange={handleChange}
                      />
                      <button
                        type="button"
                        className="dpr-password-toggle"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        title={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && <p className="dpr-error-text">{fieldErrors.confirmPassword}</p>}
                  </div>

                  {renderField({ name: 'dateOfBirth', label: 'Date of Birth', type: 'date', icon: Calendar })}

                  <div className={`dpr-field ${fieldErrors.gender ? 'dpr-field-error' : ''}`}>
                    <label htmlFor="gender">Gender <span className="dpr-required">*</span></label>
                    <div className="dpr-input-wrap">
                      <span className="dpr-input-icon"><VenetianMask size={17} /></span>
                      <select id="gender" name="gender" className="dpr-select" value={formValues.gender} onChange={handleChange}>
                        <option value="">Select gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    {fieldErrors.gender && <p className="dpr-error-text">{fieldErrors.gender}</p>}
                  </div>

                  {renderField({ name: 'aadhaarNumber', label: 'Aadhaar Number', placeholder: '12-digit Aadhaar', icon: CreditCard })}
                  {renderField({ name: 'drivingLicenseNumber', label: 'Driving License Number', placeholder: 'DL Number', icon: CreditCard })}

                  <div className={`dpr-field ${fieldErrors.vehicleType ? 'dpr-field-error' : ''}`}>
                    <label htmlFor="vehicleType">Vehicle Type <span className="dpr-required">*</span></label>
                    <div className="dpr-input-wrap">
                      <span className="dpr-input-icon"><Bike size={17} /></span>
                      <select id="vehicleType" name="vehicleType" className="dpr-select" value={formValues.vehicleType} onChange={handleChange}>
                        <option value="">Select vehicle type</option>
                        <option value="BIKE">Bike</option>
                        <option value="SCOOTER">Scooter</option>
                        <option value="EV">EV</option>
                        <option value="BICYCLE">Bicycle</option>
                      </select>
                    </div>
                    {fieldErrors.vehicleType && <p className="dpr-error-text">{fieldErrors.vehicleType}</p>}
                  </div>

                  {renderField({ name: 'vehicleNumber', label: 'Vehicle Number', placeholder: 'TS09AB1234', icon: Hash })}
                  {renderField({ name: 'city', label: 'City', placeholder: 'City', icon: Building2 })}
                  {renderField({ name: 'state', label: 'State', placeholder: 'State', icon: Landmark })}
                  {renderField({ name: 'pincode', label: 'Pincode', placeholder: '6-digit pincode', icon: MapPin })}
                  {renderField({ name: 'emergencyContactNumber', label: 'Emergency Contact Number', placeholder: '10-digit emergency number', icon: Phone })}
                  {renderField({ name: 'address', label: 'Address', placeholder: 'Enter complete current address', icon: MapPin, isTextArea: true, fullWidth: true })}
                </div>
              </section>

              <div className="dpr-action-row">
                <Link to="/delivery-partner/login" className="dpr-link-login">
                  Already have an account? Sign In
                </Link>

                <button type="submit" className="dpr-submit-btn" disabled={!canCreateAccount}>
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight size={17} />
                    </>
                  )}
                </button>
              </div>

              {!emailVerified && (
                <p className="dpr-submit-note">Complete OTP verification to enable Create Account.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeliveryPartnerRegister;
