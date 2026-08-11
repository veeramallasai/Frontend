import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, ScanFace, Smartphone, ArrowRight } from 'lucide-react';
import '../../styles/deliveryPartnerAuthFlow.css';

const VerificationMethod = () => {
  const [selectedMethod, setSelectedMethod] = useState('face');
  const navigate = useNavigate();

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card">
        <p className="dp-auth-kicker">Delivery Partner</p>
        <h1>Verify Your Identity</h1>
        <p className="dp-auth-subtitle">Choose a verification method to continue</p>

        <div className="dp-method-grid">
          <button
            type="button"
            className={`dp-method-option ${selectedMethod === 'otp' ? 'active' : ''}`}
            onClick={() => setSelectedMethod('otp')}
          >
            <div className="dp-method-icon-wrap"><Smartphone size={20} /></div>
            <div className="dp-method-content">
              <strong>OTP Verification</strong>
              <span>Verify using One Time Password sent to your mobile number</span>
            </div>
            {selectedMethod === 'otp' && <CheckCircle2 size={20} className="dp-method-check" />}
          </button>

          <button
            type="button"
            className={`dp-method-option ${selectedMethod === 'face' ? 'active' : ''}`}
            onClick={() => setSelectedMethod('face')}
          >
            <div className="dp-method-icon-wrap"><ScanFace size={20} /></div>
            <div className="dp-method-content">
              <strong>Face Verification</strong>
              <span>Verify using your face for secure login</span>
            </div>
            {selectedMethod === 'face' && <CheckCircle2 size={20} className="dp-method-check" />}
          </button>
        </div>

        <button
          type="button"
          className="dp-btn-primary"
          onClick={() => navigate('/delivery-partner/face-verification/instructions')}
        >
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default VerificationMethod;
