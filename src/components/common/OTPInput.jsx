import React, { useRef, useState, useEffect } from 'react';

const OTPInput = ({
  length = 6,
  value = '',
  onChange,
  error,
}) => {
  const [digits, setDigits] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  // Sync internal digits array when external value changes
  useEffect(() => {
    const valString = value || '';
    const newDigits = Array(length).fill('');
    for (let i = 0; i < length; i++) {
      newDigits[i] = valString[i] || '';
    }
    setDigits(newDigits);
  }, [value, length]);

  const handleChange = (e, index) => {
    const val = e.target.value;
    const digitValue = val.substring(val.length - 1); // Get last typed character
    
    // Allow digits only
    if (digitValue && !/^\d$/.test(digitValue)) return;

    const newDigits = [...digits];
    newDigits[index] = digitValue;
    setDigits(newDigits);

    const updatedValue = newDigits.join('');
    if (onChange) onChange(updatedValue);

    // Auto-focus next input
    if (digitValue !== '' && index < length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newDigits = [...digits];
      
      if (newDigits[index] === '') {
        // If current is empty, delete previous and focus it
        if (index > 0) {
          newDigits[index - 1] = '';
          setDigits(newDigits);
          if (onChange) onChange(newDigits.join(''));
          inputRefs.current[index - 1].focus();
        }
      } else {
        // If current has value, clear it
        newDigits[index] = '';
        setDigits(newDigits);
        if (onChange) onChange(newDigits.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, length);
    
    if (pastedData) {
      const newDigits = Array(length).fill('');
      for (let i = 0; i < length; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setDigits(newDigits);
      if (onChange) onChange(newDigits.join(''));

      // Focus last filled digit or first empty digit
      const focusIndex = Math.min(pastedData.length, length - 1);
      inputRefs.current[focusIndex].focus();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 sm:gap-3.5 justify-center mb-2" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            ref={(el) => (inputRefs.current[index] = el)}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`w-10 h-12 sm:w-12 sm:h-14 text-center font-bold text-lg sm:text-xl rounded-xl border transition-all duration-300 outline-none shadow-sm
              ${digit ? 'border-primary bg-primary/5 text-primary ring-1 ring-primary' : 'border-slate-200 bg-white/80 text-slate-800 focus:border-primary focus:ring-1 focus:ring-primary'}
              ${error ? 'border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500 bg-red-50/10 text-red-500' : ''}
            `}
          />
        ))}
      </div>
      {error && (
        <span className="text-xs text-red-500 font-medium mt-1">
          {error.message || error}
        </span>
      )}
    </div>
  );
};

export default OTPInput;
