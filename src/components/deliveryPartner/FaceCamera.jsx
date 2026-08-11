import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import '../../styles/deliveryPartnerAuthFlow.css';

const FaceCamera = ({
  onCapture,
  onCancel,
  autoCapture = true,
  title = "Face Verification",
  subtitle = "Please hold still",
  instructionText = "Keep your face inside the frame"
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [cameraState, setCameraState] = useState('loading'); // 'loading' | 'active' | 'error'
  const [errorMessage, setErrorMessage] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // Stop stream tracks on unmount
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setCameraState('loading');
    setErrorMessage('');
    setFaceDetected(false);
    setProgress(0);

    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Unable to access camera. Check browser permissions.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraState('active');
    } catch (err) {
      console.error('[FaceCamera] Access error:', err);
      setCameraState('error');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera permission is required for face verification.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('Unable to access camera. Check browser permissions.');
      } else {
        setErrorMessage(err.message || 'Unable to access camera. Check browser permissions.');
      }
    }
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Canvas image capture to blob
  const captureBlob = useCallback(() => {
    return new Promise((resolve) => {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');

      if (!video || video.readyState < 2) {
        resolve(null);
        return;
      }

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  }, []);

  // Frame detection & progress simulation for capture when active
  useEffect(() => {
    if (cameraState !== 'active' || isCapturing) {
      return;
    }

    let timerId = null;
    let currentProgress = 0;

    // Simulate active face presence inside frame
    setFaceDetected(true);

    const interval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress > 100) {
        currentProgress = 100;
      }
      setProgress(currentProgress);

      if (currentProgress === 100 && autoCapture && !isCapturing) {
        clearInterval(interval);
        setIsCapturing(true);

        captureBlob().then((blob) => {
          if (blob && onCapture) {
            onCapture(blob);
          } else {
            setIsCapturing(false);
            setProgress(0);
          }
        });
      }
    }, 400);

    return () => {
      clearInterval(interval);
    };
  }, [cameraState, autoCapture, isCapturing, captureBlob, onCapture]);

  const handleManualCapture = async () => {
    if (isCapturing || cameraState !== 'active') return;
    setIsCapturing(true);
    const blob = await captureBlob();
    if (blob && onCapture) {
      onCapture(blob);
    } else {
      setIsCapturing(false);
    }
  };

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card dp-center-card" style={{ maxWidth: 420 }}>
        <p className="dp-auth-kicker">Face Verification</p>
        <h1>{title}</h1>
        <p className="dp-auth-subtitle">{subtitle}</p>

        {cameraState === 'loading' && (
          <div className="dp-camera-shell" style={{ display: 'grid', placeItems: 'center', height: 320 }}>
            <div className="dp-inline-loader">Opening camera...</div>
          </div>
        )}

        {cameraState === 'error' && (
          <div className="dp-error-banner">
            <p>{errorMessage}</p>
            <button type="button" className="dp-btn-primary" onClick={startCamera}>
              <RefreshCw size={16} /> Allow & Retry Camera
            </button>
          </div>
        )}

        {cameraState === 'active' && (
          <>
            <div
              className="dp-camera-shell"
              style={{
                width: 280,
                height: 320,
                margin: '0 auto',
                borderRadius: '50% / 40%', // Oval shape frame
                position: 'relative',
                overflow: 'hidden',
                border: `4px solid ${faceDetected ? '#16A34A' : '#9CA3AF'}`,
                boxShadow: faceDetected ? '0 0 15px rgba(22, 163, 74, 0.4)' : 'none',
                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="dp-camera-video"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <p style={{ marginTop: 14, fontWeight: 600, color: '#374151', fontSize: 14 }}>
              {instructionText}
            </p>

            <div className="dp-progress-wrap" style={{ marginTop: 10 }}>
              <div className="dp-progress-label-row">
                <span>Capturing...</span>
                <span>{progress}%</span>
              </div>
              <div className="dp-progress-track">
                <div className="dp-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {!autoCapture && (
              <button
                type="button"
                className="dp-btn-primary"
                onClick={handleManualCapture}
                disabled={isCapturing || !faceDetected}
              >
                <Camera size={18} /> Capture Frame
              </button>
            )}
          </>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {onCancel && (
          <button
            type="button"
            className="dp-link-btn"
            style={{ marginTop: 16 }}
            onClick={() => {
              stopCamera();
              onCancel();
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default FaceCamera;
