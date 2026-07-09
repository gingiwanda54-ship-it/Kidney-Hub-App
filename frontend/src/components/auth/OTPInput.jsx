import { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, value, onChange, error }) => {
  const [otp, setOtp] = useState(value ? value.split('') : Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (value) {
      setOtp(value.split(''));
    }
  }, [value]);

  const handleChange = (index, e) => {
    const val = e.target.value;
    
    // Handle paste
    if (val.length > 1) {
      const chars = val.slice(0, length - index).split('');
      const newOtp = [...otp];
      chars.forEach((char, i) => {
        if (index + i < length) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      onChange(newOtp.join(''));
      
      // Focus last filled input
      const nextIndex = Math.min(index + chars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();
      return;
    }

    // Handle single character
    if (/^[0-9]?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      onChange(newOtp.join(''));

      // Auto-advance to next input
      if (val && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleFocus = (index) => {
    inputRefs.current[index]?.select();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-2 sm:gap-3">
        {Array(length).fill('').map((_, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[index] || ''}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onFocus={() => handleFocus(index)}
            className={`
              w-10 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold
              border-2 rounded-lg transition-all duration-200
              ${error
                ? 'border-kidney-red focus:ring-kidney-red'
                : otp[index]
                  ? 'border-kidney-green bg-kidney-cream'
                  : 'border-gray-300 focus:border-kidney-green'
              }
              focus:ring-2 focus:ring-kidney-green focus:border-transparent
              outline-none
            `}
          />
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-kidney-red">{error}</p>
      )}
    </div>
  );
};

export default OTPInput;
