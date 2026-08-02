import React from 'react';
import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'glass', // glass | flat | gradient
  isHoverable = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseStyles = 'rounded-2xl p-6 transition-all duration-300 overflow-hidden';
  
  const variantStyles = {
    glass: 'glassmorphism-card shadow-premium',
    flat: 'bg-white border border-slate-100 shadow-sm',
    gradient: 'bg-gradient-to-br from-primary-50 to-skyBlue-light border border-primary-100/30 shadow-premium',
  };

  const hoverVariants = isHoverable ? {
    hover: {
      y: -5,
      boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
      borderColor: 'rgba(46, 125, 50, 0.15)'
    }
  } : {};

  return (
    <motion.div
      onClick={onClick}
      className={`${baseStyles} ${variantStyles[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      variants={hoverVariants}
      whileHover={isHoverable ? 'hover' : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;
