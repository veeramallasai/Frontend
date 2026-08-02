import React, { forwardRef } from 'react';

const Textarea = forwardRef(({
  label,
  name,
  error,
  className = '',
  id,
  placeholder,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || name || `textarea-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full text-left flex flex-col mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={textareaId}
          className="text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wider select-none"
        >
          {label}
        </label>
      )}

      <div className="relative rounded-xl overflow-hidden shadow-sm">
        <textarea
          id={textareaId}
          name={name}
          ref={ref}
          rows={rows}
          placeholder={placeholder}
          className={`w-full bg-white/70 backdrop-blur-md text-slate-800 placeholder-slate-400 text-sm font-medium rounded-xl border transition-all duration-300 outline-none px-4 py-3 resize-none
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' 
              : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary bg-white/80'
            }
          `}
          {...props}
        />
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-1 font-medium tracking-wide">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
