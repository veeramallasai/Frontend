import React from 'react';

const VerificationProgress = ({ value = 0, label = 'Progress' }) => {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div className="dp-progress-wrap">
      <div className="dp-progress-label-row">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>
      <div className="dp-progress-track" role="progressbar" aria-valuenow={safeValue} aria-valuemin={0} aria-valuemax={100}>
        <div className="dp-progress-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  );
};

export default VerificationProgress;
