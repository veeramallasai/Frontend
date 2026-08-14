import React from 'react';
import { motion } from 'framer-motion';

// Centered Spinner Loader
export const SpinnerLoader = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="text-sm font-medium text-slate-500 animate-pulse">{text}</p>
      )}
    </div>
  );
};

// Full-screen loading overlay
export const FullScreenLoader = ({ text = 'Preparing fresh harvest...' }) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/90 backdrop-blur-md">
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer pulsating ring */}
        <div className="absolute w-20 h-20 border border-primary/20 rounded-full animate-ping" />
        {/* Inner spinner */}
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 tracking-wide">{text}</h3>
      <p className="text-xs text-slate-400 mt-2 font-medium tracking-wider uppercase">Farm to Home</p>
    </div>
  );
};

// Pulsating Skeleton card placeholders
export const SkeletonCard = () => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm animate-pulse space-y-4">
      <div className="h-40 bg-slate-200 rounded-xl w-full" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
        <div className="h-3 bg-slate-200 rounded-md w-1/2" />
      </div>
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-slate-200 rounded-md w-20" />
        <div className="h-8 bg-slate-200 rounded-md w-12" />
      </div>
    </div>
  );
};

// Generic Pulsating Skeleton elements
export const SkeletonElement = ({ type = 'text', className = '' }) => {
  const baseClasses = 'bg-slate-200 animate-pulse rounded-md';
  const typeClasses = {
    title: 'h-6 w-2/3',
    text: 'h-4 w-full',
    avatar: 'h-12 w-12 rounded-full',
    thumbnail: 'h-24 w-24 rounded-xl',
    button: 'h-10 w-28 rounded-xl',
  };

  return <div className={`${baseClasses} ${typeClasses[type]} ${className}`} />;
};
