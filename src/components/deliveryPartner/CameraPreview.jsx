import React from 'react';
import FaceGuide from './FaceGuide';

const CameraPreview = ({ videoRef, activeFace }) => {
  return (
    <div className="dp-camera-shell">
      <video ref={videoRef} autoPlay playsInline muted className="dp-camera-video" />
      <FaceGuide active={activeFace} />
    </div>
  );
};

export default CameraPreview;
