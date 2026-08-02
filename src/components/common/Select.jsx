import React, { forwardRef } from 'react';

const Select = forwardRef(({
  label,
  name,
  options = [], // [{ value, label }]
  error,
  icon: Icon,
  className = '',
  id,
  placeholder = 'Select an option',
  ...props
}, ref) => {
  const selectId = id || name || `select-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className={`w-full text-left flex flex-col mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
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

        <select
          id={selectId}
          name={name}
          ref={ref}
          className={`w-full bg-white/70 backdrop-blur-md text-slate-800 text-sm font-medium rounded-xl border transition-all duration-300 outline-none appearance-none py-3
            ${Icon ? 'pl-11' : 'pl-4'} 
            pr-10
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10' 
              : 'border-slate-200 focus:border-primary focus:ring-1 focus:ring-primary bg-white/80'
            }
          `}
          {...props}
        >
          <option value="" disabled className="text-slate-400">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="text-slate-800">
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Caret */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-slate-400">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {error && (
        <span className="text-xs text-red-500 mt-1 font-medium tracking-wide">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
