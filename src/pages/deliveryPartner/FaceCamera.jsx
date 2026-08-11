import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as faceapi from 'face-api.js';
import { Camera, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import CameraPreview from '../../components/deliveryPartner/CameraPreview';
import VerificationProgress from '../../components/deliveryPartner/VerificationProgress';
import faceVerificationService from '../../services/faceVerificationService';
import '../../styles/deliveryPartnerAuthFlow.css';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model';
const LIVENESS_ACTIONS = ['Look straight', 'Turn your head slightly left', 'Turn your head slightly right', 'Blink your eyes'];

const randomActions = () => {
  const list = [...LIVENESS_ACTIONS].sort(() => Math.random() - 0.5);
  return list.slice(0, 3);
};

const FaceCamera = () => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [modelsReady, setModelsReady] = useState(false);
  const [activeFace, setActiveFace] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Align your face in the frame');
  const [actions] = useState(() => randomActions());
  const [currentActionIdx, setCurrentActionIdx] = useState(0);
  const [completedActions, setCompletedActions] = useState([]);

  const currentAction = useMemo(() => actions[currentActionIdx], [actions, currentActionIdx]);

  useEffect(() => {
    let mounted = true;
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
        ]);
        if (mounted) {
          setModelsReady(true);
        }
      } catch (error) {
        if (mounted) {
          setCameraError('Unable to load face detection models. Please check your network and try again.');
        }
      }
    };

    loadModels();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream && stream.getTracks) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const allowCamera = async () => {
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user' },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setPermissionGranted(true);
      setMessage('Align your face in the frame');
    } catch (error) {
      setCameraError('Camera permission is required for face verification.');
    }
  };

  const getFaceQuality = (imageData, width, height) => {
    const data = imageData.data;
    let sum = 0;
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      sum += gray;
    }
    const brightness = sum / (width * height);

    let edgeSum = 0;
    for (let y = 1; y < height - 1; y += 2) {
      for (let x = 1; x < width - 1; x += 2) {
        const idx = (y * width + x) * 4;
        const center = data[idx];
        const right = data[idx + 4];
        const down = data[idx + width * 4];
        edgeSum += Math.abs(center - right) + Math.abs(center - down);
      }
    }
    const sharpness = edgeSum / (width * height);

    return { brightness, sharpness };
  };

  const eyeAspectRatio = (points) => {
    const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
    const A = d(points[1], points[5]);
    const B = d(points[2], points[4]);
    const C = d(points[0], points[3]);
    return (A + B) / (2.0 * C || 1);
  };

  const checkAction = (result, box, frameSize) => {
    const landmarks = result.landmarks;
    if (!landmarks) {
      return false;
    }

    const nose = landmarks.getNose()[3];
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const eyeCenterX = (leftEye[0].x + rightEye[3].x) / 2;
    const yaw = (nose.x - eyeCenterX) / box.width;

    switch (currentAction) {
      case 'Look straight':
        return Math.abs(yaw) < 0.08 && isFaceCentered(box, frameSize);
      case 'Turn your head slightly left':
        return yaw < -0.06;
      case 'Turn your head slightly right':
        return yaw > 0.06;
      case 'Blink your eyes': {
        const leftEAR = eyeAspectRatio(leftEye);
        const rightEAR = eyeAspectRatio(rightEye);
        return leftEAR < 0.2 || rightEAR < 0.2;
      }
      default:
        return false;
    }
  };

  const isFaceCentered = (box, frameSize) => {
    const cx = box.x + box.width / 2;
    const cy = box.y + box.height / 2;
    const tx = frameSize.width / 2;
    const ty = frameSize.height / 2;

    return Math.abs(cx - tx) < frameSize.width * 0.15 && Math.abs(cy - ty) < frameSize.height * 0.18;
  };

  useEffect(() => {
    if (!permissionGranted || !modelsReady || !videoRef.current) {
      return;
    }

    let stopped = false;

    const loop = async () => {
      while (!stopped) {
        const video = videoRef.current;
        if (!video || video.readyState < 2) {
          await new Promise((resolve) => setTimeout(resolve, 200));
          continue;
        }

        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.45 }))
          .withFaceLandmarks(true);

        if (!detections.length) {
          setActiveFace(false);
          setMessage('No face detected. Please position your face inside the frame.');
          await new Promise((resolve) => setTimeout(resolve, 220));
          continue;
        }

        if (detections.length > 1) {
          setActiveFace(false);
          setMessage('Multiple faces detected. Only one person should be visible.');
          await new Promise((resolve) => setTimeout(resolve, 220));
          continue;
        }

        const result = detections[0];
        const frame = { width: video.videoWidth, height: video.videoHeight };
        const box = result.detection.box;
        const centered = isFaceCentered(box, frame);

        setActiveFace(centered);
        if (!centered) {
          setMessage('Move closer and center your face in the guide.');
          await new Promise((resolve) => setTimeout(resolve, 220));
          continue;
        }

        setMessage(currentAction || 'Capturing your face...');
        const actionPassed = checkAction(result, box, frame);

        if (actionPassed && currentAction) {
          setCompletedActions((prev) => {
            if (prev.includes(currentAction)) return prev;
            const next = [...prev, currentAction];
            const progressValue = Math.floor((next.length / actions.length) * 100);
            setProgress(progressValue);
            return next;
          });
          setCurrentActionIdx((prev) => Math.min(prev + 1, actions.length));
          await new Promise((resolve) => setTimeout(resolve, 700));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 220));
        }

        if (completedActions.length + 1 >= actions.length) {
          break;
        }
      }

      if (!stopped) {
        setMessage('Capturing your face...');
      }
    };

    loop();

    return () => {
      stopped = true;
    };
  }, [permissionGranted, modelsReady, actions.length, completedActions.length, currentAction]);

  const captureToBase64 = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      return null;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const quality = getFaceQuality(imageData, canvas.width, canvas.height);

    if (quality.brightness < 40) {
      throw new Error('Image is too dark. Please move to a brighter area.');
    }

    if (quality.sharpness < 5) {
      throw new Error('Image is too blurry. Hold your phone steady and try again.');
    }

    return {
      imageBase64: canvas.toDataURL('image/jpeg', 0.92),
      quality,
    };
  };

  const completeAndProceed = async () => {
    if (completedActions.length < actions.length) {
      toast.error('Please complete all liveness actions before continuing.');
      return;
    }

    try {
      setLoading(true);
      const status = await faceVerificationService.getStatus();
      if (!status?.enrolled) {
        navigate('/delivery-partner/face-enrollment');
        return;
      }

      const capture = captureToBase64();
      sessionStorage.setItem('dp_face_capture_payload', JSON.stringify({
        imageBase64: capture.imageBase64,
        completedActions,
        livenessScore: completedActions.length / actions.length,
      }));
      navigate('/delivery-partner/face-verification/processing');
    } catch (error) {
      toast.error(error?.message || 'Unable to capture face. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card">
        <p className="dp-auth-kicker">Face Verification</p>
        <h1>Face Verification</h1>
        <p className="dp-auth-subtitle">Align your face in the frame</p>

        {!permissionGranted && (
          <>
            <p className="dp-auth-subtitle">Allow Farm to Home to use your camera to verify your identity</p>
            <button type="button" className="dp-btn-primary" onClick={allowCamera}>
              Allow Camera
            </button>
          </>
        )}

        {cameraError && (
          <div className="dp-error-banner">
            <span>{cameraError}</span>
            <button type="button" className="dp-link-btn" onClick={allowCamera}>Try Again</button>
          </div>
        )}

        {permissionGranted && (
          <>
            {!modelsReady ? (
              <div className="dp-inline-loader"><Loader2 size={20} className="dp-spin" /> Loading face detection...</div>
            ) : (
              <CameraPreview videoRef={videoRef} activeFace={activeFace} />
            )}

            <VerificationProgress value={progress} label={message} />

            <div className="dp-actions-card">
              <strong>Liveness checks</strong>
              <ul>
                {actions.map((action) => (
                  <li key={action} className={completedActions.includes(action) ? 'done' : ''}>{action}</li>
                ))}
              </ul>
            </div>

            <button type="button" className="dp-btn-primary" disabled={loading || !modelsReady} onClick={completeAndProceed}>
              {loading ? <><Loader2 size={18} className="dp-spin" /> Processing...</> : <><Camera size={18} /> Capture & Continue</>}
            </button>
          </>
        )}

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default FaceCamera;
