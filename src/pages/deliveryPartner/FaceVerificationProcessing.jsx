import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ScanFace } from 'lucide-react';
import faceVerificationService from '../../services/faceVerificationService';
import '../../styles/deliveryPartnerAuthFlow.css';

const dataURLtoBlob = (dataurl) => {
  if (!dataurl) return null;
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

const FaceVerificationProcessing = () => {
  const navigate = useNavigate();
  const [statusMessage, setStatusMessage] = useState('Verifying...');

  useEffect(() => {
    let active = true;

    const executeVerification = async () => {
      const capturedDataUrl = sessionStorage.getItem('dp_captured_face_data');
      if (!capturedDataUrl) {
        navigate('/delivery-partner/face-verification', { replace: true });
        return;
      }

      try {
        const imageBlob = dataURLtoBlob(capturedDataUrl);
        if (!imageBlob) {
          throw new Error('No face image captured');
        }

        setStatusMessage('Matching facial features with server...');

        const result = await faceVerificationService.verifyFace(imageBlob);

        if (!active) return;

        if (result?.matched === true || result?.verified === true) {
          sessionStorage.setItem('deliveryPartnerFaceVerified', 'true');
          localStorage.setItem('deliveryPartnerFaceVerified', 'true');
          sessionStorage.setItem('dp_face_verify_result', JSON.stringify(result));
          navigate('/delivery-partner/face-verification/success', { replace: true });
        } else {
          sessionStorage.removeItem('deliveryPartnerFaceVerified');
          localStorage.removeItem('deliveryPartnerFaceVerified');
          sessionStorage.setItem('dp_face_verify_result', JSON.stringify(result || { matched: false, message: 'Face verification failed' }));
          navigate('/delivery-partner/face-verification/failed', { replace: true });
        }
      } catch (err) {
        if (!active) return;
        console.error('[FaceVerificationProcessing] Error:', err);

        sessionStorage.removeItem('deliveryPartnerFaceVerified');
        localStorage.removeItem('deliveryPartnerFaceVerified');
        const errMsg = err?.response?.data?.message || err?.message || "We couldn't verify your face. Please try again.";
        sessionStorage.setItem('dp_face_verify_result', JSON.stringify({ matched: false, message: errMsg }));

        navigate('/delivery-partner/face-verification/failed', { replace: true });
      }
    };

    executeVerification();

    return () => {
      active = false;
    };
  }, [navigate]);

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card dp-center-card" style={{ maxWidth: 420 }}>
        <p className="dp-auth-kicker">Face Verification</p>
        <h1>Face Verification</h1>
        <p className="dp-auth-subtitle">Please wait while we verify your identity</p>

        <div
          className="dp-processing-loader"
          style={{
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #DCFCE7 0%, #F0FDF4 70%)',
            boxShadow: '0 0 20px rgba(22, 163, 74, 0.25)',
            margin: '24px auto',
            display: 'grid',
            placeItems: 'center',
            position: 'relative',
          }}
        >
          <ScanFace size={48} color="#16A34A" />
          <Loader2
            size={80}
            color="#16A34A"
            className="dp-spin"
            style={{ position: 'absolute', opacity: 0.6 }}
          />
        </div>

        <div className="dp-processing-text">
          <strong style={{ fontSize: 18, color: '#111827' }}>Verifying...</strong>
          <span style={{ fontSize: 14, color: '#4B5563' }}>This may take a few seconds.</span>
          <span style={{ fontSize: 13, color: '#16A34A', marginTop: 4 }}>{statusMessage}</span>
        </div>
      </div>
    </div>
  );
};

export default FaceVerificationProcessing;
