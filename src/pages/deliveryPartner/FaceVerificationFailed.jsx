import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import '../../styles/deliveryPartnerAuthFlow.css';

const FaceVerificationFailed = () => {
  const navigate = useNavigate();

  const failureMessage = useMemo(() => {
    const raw = sessionStorage.getItem('dp_face_verify_result');
    if (!raw) {
      return "We couldn't verify your face. Please try again.";
    }

    try {
      const parsed = JSON.parse(raw);
      return parsed?.message || "We couldn't verify your face. Please try again.";
    } catch (e) {
      return "We couldn't verify your face. Please try again.";
    }
  }, []);

  const handleTryAgain = () => {
    // Clear captured image payload
    sessionStorage.removeItem('dp_captured_face_data');
    sessionStorage.removeItem('dp_face_verify_result');

    // Keep auth session valid, restart face verification camera
    navigate('/delivery-partner/face-verification', { replace: true });
  };

  const handleBackToLogin = () => {
    sessionStorage.removeItem('dp_captured_face_data');
    sessionStorage.removeItem('dp_face_verify_result');
    navigate('/delivery-partner/login', { replace: true });
  };

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card dp-center-card" style={{ maxWidth: 420 }}>
        <p className="dp-auth-kicker">Face Verification</p>

        <div
          className="dp-result-icon failed"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            backgroundColor: '#FEE2E2',
            color: '#DC2626',
            margin: '20px auto 16px',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '0 0 16px rgba(220, 38, 38, 0.25)',
          }}
        >
          <X size={48} strokeWidth={3} />
        </div>

        <h1 style={{ fontSize: 24, margin: '8px 0', color: '#111827' }}>Verification Failed</h1>
        <p className="dp-auth-subtitle" style={{ fontSize: 14, color: '#4B5563', marginBottom: 6 }}>
          We couldn't verify your face.
        </p>
        <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>
          {failureMessage}
        </p>

        <div style={{ display: 'grid', gap: 10 }}>
          <button
            type="button"
            className="dp-btn-primary"
            onClick={handleTryAgain}
            style={{ height: 46 }}
          >
            Try Again
          </button>

          <button
            type="button"
            className="dp-link-btn"
            onClick={handleBackToLogin}
            style={{ fontSize: 14, padding: '8px 0' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default FaceVerificationFailed;
