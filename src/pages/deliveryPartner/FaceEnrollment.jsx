import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import faceVerificationService from '../../services/faceVerificationService';
import CameraPreview from '../../components/deliveryPartner/CameraPreview';
import '../../styles/deliveryPartnerAuthFlow.css';

const FaceEnrollment = () => {
  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  const allowCamera = async () => {
    setCameraError('');
    try {
      const media = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      setStream(media);
      if (videoRef.current) {
        videoRef.current.srcObject = media;
      }
    } catch (error) {
      setCameraError('Camera permission is required for face verification.');
    }
  };

  const captureAsBase64 = () => {
    if (!videoRef.current || !canvasRef.current) {
      return '';
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.92);
  };

  const handleEnroll = async () => {
    const imageBase64 = captureAsBase64();
    if (!imageBase64) {
      toast.error('Unable to capture face image.');
      return;
    }

    try {
      setLoading(true);
      await faceVerificationService.enroll(imageBase64);
      toast.success('Face enrollment successful. Please continue verification.');
      navigate('/delivery-partner/face-verification/instructions');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Face enrollment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card">
        <p className="dp-auth-kicker">Face Enrollment</p>
        <h1>Register Your Face</h1>
        <p className="dp-auth-subtitle">Capture a clear reference face for secure verification.</p>

        {!stream && (
          <button type="button" className="dp-btn-primary" onClick={allowCamera}>
            Allow Camera
          </button>
        )}

        {cameraError && <p className="dp-error-text">{cameraError}</p>}

        {stream && <CameraPreview videoRef={videoRef} activeFace />}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {stream && (
          <button type="button" className="dp-btn-primary" onClick={handleEnroll} disabled={loading}>
            {loading ? <><Loader2 size={18} className="dp-spin" /> Enrolling...</> : <><Camera size={18} /> Capture & Enroll</>}
          </button>
        )}
      </div>
    </div>
  );
};

export default FaceEnrollment;
