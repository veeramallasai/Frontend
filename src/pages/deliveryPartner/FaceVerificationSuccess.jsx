import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import '../../styles/deliveryPartnerAuthFlow.css';

const FaceVerificationSuccess = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    // Ensure face verified flag is stored
    sessionStorage.setItem('deliveryPartnerFaceVerified', 'true');
    localStorage.setItem('deliveryPartnerFaceVerified', 'true');

    // Clean up temporary capture payload
    sessionStorage.removeItem('dp_captured_face_data');

    // Redirect ONLY to /delivery-partner/dashboard
    navigate('/delivery-partner/dashboard', { replace: true });
  };

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card dp-center-card" style={{ maxWidth: 420 }}>
        <p className="dp-auth-kicker">Face Verification</p>

        <div
          className="dp-result-icon success"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#16A34A',
            margin: '20px auto 16px',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 16px rgba(22, 163, 74, 0.3)',
          }}
        >
          <Check size={48} strokeWidth={3} />
        </div>

        <h1 style={{ fontSize: 24, margin: '8px 0', color: '#111827' }}>Verification Successful</h1>
        <p className="dp-auth-subtitle" style={{ fontSize: 14, color: '#4B5563', marginBottom: 24 }}>
          Your identity has been verified successfully.
        </p>

        <button
          type="button"
          className="dp-btn-primary"
          onClick={handleContinue}
          style={{ height: 48, fontSize: 16 }}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default FaceVerificationSuccess;
