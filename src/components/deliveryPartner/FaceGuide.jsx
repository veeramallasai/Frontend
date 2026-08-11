import React from 'react';

const FaceGuide = ({ active = false }) => {
  return (
    <div className="dp-face-guide-wrap" aria-hidden="true">
      <div className={`dp-face-guide ${active ? 'active' : ''}`} />
    </div>
  );
};

export default FaceGuide;
