import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Sun, ShieldAlert, Focus, ArrowRight } from 'lucide-react';
import '../../styles/deliveryPartnerAuthFlow.css';

const tips = [
  { icon: Eye, text: 'Ensure your face is clearly visible' },
  { icon: Sun, text: 'Make sure you are in a well-lit area' },
  { icon: ShieldAlert, text: 'Remove sunglasses or anything covering your face' },
  { icon: Focus, text: 'Look straight into the camera' },
];

const FaceVerificationInstructions = () => {
  const navigate = useNavigate();

  return (
    <div className="dp-auth-page">
      <div className="dp-auth-card">
        <p className="dp-auth-kicker">Face Verification</p>
        <h1>Face Verification</h1>
        <p className="dp-auth-subtitle">For your security, please follow the instructions</p>

        <div className="dp-instruction-list">
          {tips.map(({ icon: Icon, text }) => (
            <div key={text} className="dp-instruction-row">
              <span className="dp-instruction-icon"><Icon size={18} /></span>
              <span>{text}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          className="dp-btn-primary"
          onClick={() => navigate('/delivery-partner/face-verification/camera')}
        >
          Start Verification <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};

export default FaceVerificationInstructions;
