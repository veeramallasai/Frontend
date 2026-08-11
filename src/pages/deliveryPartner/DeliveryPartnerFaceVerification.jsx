import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FaceCamera from '../../components/deliveryPartner/FaceCamera';

const DeliveryPartnerFaceVerification = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCapture = (imageBlob) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Save imageBlob into temporary state/session storage for processing page
    const reader = new FileReader();
    reader.readAsDataURL(imageBlob);
    reader.onloadend = () => {
      sessionStorage.setItem('dp_captured_face_data', reader.result);
      navigate('/delivery-partner/face-verification/processing');
    };
  };

  const handleCancel = () => {
    navigate('/delivery-partner/login');
  };

  return (
    <FaceCamera
      title="Face Verification"
      subtitle="Please hold still"
      instructionText="Keep your face inside the frame"
      autoCapture={true}
      onCapture={handleCapture}
      onCancel={handleCancel}
    />
  );
};

export default DeliveryPartnerFaceVerification;
