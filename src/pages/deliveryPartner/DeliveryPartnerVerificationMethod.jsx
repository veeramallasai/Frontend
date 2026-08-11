import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShieldCheck,
  Smartphone,
  ScanFace,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { isTokenExpired } from '../../services/api';
import { normalizeRole, ROLES } from '../../utils/roleUtils';
import '../../styles/deliveryPartner.css';

const DeliveryPartnerVerificationMethod = () => {
  const [selectedMethod, setSelectedMethod] = useState('face');
  const navigate = useNavigate();

  useEffect(() => {
    const token =
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('accessToken') ||
      sessionStorage.getItem('token');

    const rawUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    let user = null;
    try {
      user = rawUser ? JSON.parse(rawUser) : null;
    } catch (e) {
      user = null;
    }

    const role = normalizeRole(user?.role || user?.userRole || '');

    if (!token || isTokenExpired(token) || role !== ROLES.DELIVERY_PARTNER) {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('deliveryPartnerFaceVerified');
      localStorage.removeItem('deliveryPartnerFaceVerified');
      toast.error('Session invalid. Please log in first.');
      navigate('/delivery-partner/login', { replace: true });
    }
  }, [navigate]);

  const handleContinue = () => {
    if (selectedMethod === 'face') {
      navigate('/delivery-partner/face-verification');
      return;
    }

    toast('OTP verification for Delivery Partner login will be available soon. Please continue with Face Verification.', {
      icon: 'ℹ️',
    });
  };

  return (
    <div className="dp-page-wrapper">
      <div className="dp-card dp-verify-method-card">
        <button
          type="button"
          className="dp-back-link"
          style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
          onClick={() => navigate('/delivery-partner/login')}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div className="dp-brand-header" style={{ textAlign: 'center', marginBottom: '18px' }}>
          <div className="dp-logo-badge" style={{ width: '52px', height: '52px', borderRadius: '14px', margin: '0 auto 10px auto' }}>
            <ShieldCheck size={28} />
          </div>
          <h1 className="dp-brand-title" style={{ fontSize: '24px' }}>Verify Your Identity</h1>
          <p className="dp-welcome-text" style={{ marginTop: '4px' }}>Choose a verification method to continue</p>
        </div>

        <div className="dp-method-list">
          <button
            type="button"
            className={`dp-method-card ${selectedMethod === 'otp' ? 'active' : ''}`}
            onClick={() => setSelectedMethod('otp')}
          >
            <div className="dp-method-icon">
              <Smartphone size={20} />
            </div>
            <div className="dp-method-content">
              <h4>OTP Verification</h4>
              <p>Verify using One Time Password sent to your mobile number</p>
            </div>
            {selectedMethod === 'otp' && <CheckCircle2 size={18} className="dp-method-check" />}
          </button>

          <button
            type="button"
            className={`dp-method-card ${selectedMethod === 'face' ? 'active' : ''}`}
            onClick={() => setSelectedMethod('face')}
          >
            <div className="dp-method-icon">
              <ScanFace size={20} />
            </div>
            <div className="dp-method-content">
              <h4>Face Verification</h4>
              <p>Verify using your live face for secure login</p>
            </div>
            {selectedMethod === 'face' && <CheckCircle2 size={18} className="dp-method-check" />}
          </button>
        </div>

        <button type="button" className="dp-btn-primary" onClick={handleContinue} style={{ marginTop: '16px' }}>
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default DeliveryPartnerVerificationMethod;
