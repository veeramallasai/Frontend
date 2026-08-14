import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary', // primary | secondary | accent | sky | outline | ghost
  size = 'md', // sm | md | lg
  isLoading = false,
  isDisabled = false,
  className = '',
  onClick,
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';
  
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const variantStyles = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-premium hover:shadow-lg focus:ring-primary',
    secondary: 'bg-secondary hover:bg-secondary-dark text-white shadow-premium hover:shadow-lg focus:ring-secondary',
    accent: 'bg-accent hover:bg-accent-dark text-white shadow-premium focus:ring-accent',
    sky: 'bg-skyBlue hover:bg-skyBlue-dark text-white shadow-premium focus:ring-skyBlue',
    outline: 'border border-slate-200 hover:bg-slate-50 text-[#1E293B] focus:ring-slate-300',
    ghost: 'hover:bg-slate-100 text-[#64748B] hover:text-[#1E293B]',
    gradient: 'gradient-btn focus:ring-primary',
  };

  return (
    <motion.button
      type={type}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
      disabled={isLoading || isDisabled}
      whileHover={!isDisabled && !isLoading ? { scale: 1.015, y: -1 } : {}}
      whileTap={!isDisabled && !isLoading ? { scale: 0.98 } : {}}
      {...props}
    >
      {isLoading && (
        <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      <span className="leading-none">{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </motion.button>
  );
};

export default Button;
