import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const Input = forwardRef(({
  label,
  name,
  type = 'text',
  error,
  icon: Icon,
  className = '',
  id,
  placeholder,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || `input-${Math.random().toString(36).substring(2, 9)}`;
  const isPassword = type === 'password';

  return (
    <div className={`w-full text-left flex flex-col mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider select-none"
        >
          {label}
        </label>
      )}
      
      <div className="relative rounded-xl overflow-hidden shadow-sm">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-5 h-5" />
          </div>
        )}
        
        <input
          id={inputId}
          name={name}
          ref={ref}
          type={isPassword ? (showPassword ? 'text' : 'password') : type}
          placeholder={placeholder}
          className={`w-full bg-white/70 backdrop-blur-md text-slate-800 placeholder-slate-400 text-sm font-medium rounded-xl border transition-all duration-300 outline-none
            ${Icon ? 'pl-11' : 'pl-4'} 
            ${isPassword ? 'pr-11' : 'pr-4'} 
            py-3
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' 
              : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary bg-white/80'
            }
          `}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            tabIndex="-1"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        )}
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-1 font-medium tracking-wide">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
