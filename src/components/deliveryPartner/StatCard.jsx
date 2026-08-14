import React from 'react';

const StatCard = ({ icon, label, value, tint = '#16A34A', bg = '#ECFDF5' }) => {
  return (
    <div className="dp-stat-card">
      <div className="dp-stat-icon" style={{ backgroundColor: bg, color: tint }}>
        {icon}
      </div>
      <div>
        <div className="dp-stat-value">{value}</div>
        <div className="dp-stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
