import React from 'react';

const SectionCard = ({ title, action, children }) => {
  return (
    <section className="dp-section-card">
      <div className="dp-section-head">
        <h3>{title}</h3>
        {action}
      </div>
      <div>{children}</div>
    </section>
  );
};

export default SectionCard;
