import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Check, Camera, Loader2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import faceVerificationService from '../../services/faceVerificationService';
import FaceCamera from '../../components/deliveryPartner/FaceCamera';
import '../../styles/deliveryPartnerAuthFlow.css';

const FaceRegistration = () => {
  const [consent, setConsent] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleStartCamera = () => {
    if (!consent) return;
    setCameraActive(true);
  };

  const handleCapturedImage = async (imageBlob) => {
    if (isRegistering) return;
    setIsRegistering(true);

    try {
      toast.loading('Registering your face template...', { id: 'face-register' });
      const res = await faceVerificationService.registerFace(imageBlob);
      toast.dismiss('face-register');

      if (res?.success || res?.enrolled) {
        toast.success('Face registered successfully!');
        sessionStorage.setItem('deliveryPartnerFaceEnrolled', 'true');
        navigate('/delivery-partner/face-verification', { replace: true });
      } else {
        toast.error(res?.message || 'Face registration failed. Please try again.');
        setCameraActive(false);
      }
    } catch (err) {
      toast.dismiss('face-register');
      console.error('[FaceRegistration] Error:', err);
      const msg = err?.response?.data?.message || err?.message || 'Face registration failed. Please try again.';
      toast.error(msg);
      setCameraActive(false);
    } finally {
      setIsRegistering(false);
    }
  };

  if (cameraActive) {
    return (
      <FaceCamera
        title="Face Registration"
        subtitle="Align your face to register"
        instructionText="Keep your face inside the frame"
        onCapture={handleCapturedImage}
        onCancel={() => setCameraActive(false)}
      />
    );
  }

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card" style={{ maxWidth: 460 }}>
        <button
          type="button"
          className="dp-link-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 12 }}
          onClick={() => navigate('/delivery-partner/login')}
        >
          <ArrowLeft size={16} /> Back to Login
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div className="dp-method-icon-wrap" style={{ width: 44, height: 44 }}>
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="dp-auth-kicker" style={{ margin: 0 }}>Step 2 of 3</p>
            <h1 style={{ fontSize: 24, margin: 0 }}>Register Your Face</h1>
          </div>
        </div>

        <p className="dp-auth-subtitle" style={{ marginBottom: 16 }}>
          We need to register your face for secure delivery partner login.
        </p>

        <div className="dp-instruction-list">
          <div className="dp-instruction-row">
            <span className="dp-instruction-icon">1</span>
            <span style={{ fontSize: 14, color: '#374151' }}>Look directly at the camera.</span>
          </div>
          <div className="dp-instruction-row">
            <span className="dp-instruction-icon">2</span>
            <span style={{ fontSize: 14, color: '#374151' }}>Make sure your face is clearly visible.</span>
          </div>
          <div className="dp-instruction-row">
            <span className="dp-instruction-icon">3</span>
            <span style={{ fontSize: 14, color: '#374151' }}>Use good lighting.</span>
          </div>
          <div className="dp-instruction-row">
            <span className="dp-instruction-icon">4</span>
            <span style={{ fontSize: 14, color: '#374151' }}>Remove mask, sunglasses or anything covering your face.</span>
          </div>
          <div className="dp-instruction-row">
            <span className="dp-instruction-icon">5</span>
            <span style={{ fontSize: 14, color: '#374151' }}>Keep only one person in front of the camera.</span>
          </div>
        </div>

        <div style={{ marginTop: 20, paddingTop: 14, borderTop: '1px solid #E5E7EB' }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', fontSize: 13, color: '#4B5563' }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ marginTop: 2, width: 16, height: 16, accentColor: '#16A34A' }}
            />
            <span>I consent to using my facial data for identity verification.</span>
          </label>
        </div>

        <button
          type="button"
          className="dp-btn-primary"
          onClick={handleStartCamera}
          disabled={!consent || isRegistering}
          style={{ marginTop: 18 }}
        >
          {isRegistering ? (
            <><Loader2 size={18} className="dp-spin" /> Registering...</>
          ) : (
            <><Camera size={18} /> Start Face Registration</>
          )}
        </button>
      </div>
    </div>
  );
};

export default FaceRegistration;
