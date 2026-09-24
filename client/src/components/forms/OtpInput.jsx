import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: { box: 'h-9 w-9 text-base', gap: 'gap-1.5' },
  md: { box: 'h-11 w-11 text-lg', gap: 'gap-2' },
  lg: { box: 'h-14 w-14 text-2xl', gap: 'gap-3' },
};

const VARIANTS = {
  default: 'border-slate-300 bg-white text-slate-900 focus:border-indigo-500 focus:ring-indigo-500',
  error: 'border-rose-400 bg-rose-50 text-rose-900 focus:border-rose-500 focus:ring-rose-500',
};

function sanitize(value, type) {
  if (type === 'numeric') {
    return String(value || '').replace(/\D/g, '');
  }
  if (type === 'alphanumeric') {
    return String(value || '').replace(/[^a-zA-Z0-9]/g, '');
  }
  return String(value || '');
}

const OtpInput = forwardRef(function OtpInput(
  {
    length = 6,
    value = '',
    onChange,
    onComplete,
    onBlur,
    type = 'numeric',
    size = 'md',
    variant = 'default',
    error = false,
    disabled = false,
    autoFocus = false,
    mask = false,
    placeholder = '',
    separator,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const inputsRef = useRef([]);
  const digits = useMemo(() => {
    const chars = sanitize(value, type).slice(0, length).split('');
    while (chars.length < length) {
      chars.push('');
    }
    return chars;
  }, [value, length, type]);

  const [localValue, setLocalValue] = useState(digits);

  useEffect(() => {
    setLocalValue(digits);
  }, [digits]);

  const emitChange = useCallback(
    (next) => {
      const joined = next.join('');
      if (onChange) {
        onChange(joined);
      }
      if (joined.length === length && !joined.includes('') && onComplete) {
        onComplete(joined);
      }
    },
    [onChange, onComplete, length],
  );

  const focusIndex = (index) => {
    if (inputsRef.current[index]) {
      inputsRef.current[index].focus();
      inputsRef.current[index].select?.();
    }
  };

  const handleChange = (index, event) => {
    const raw = sanitize(event.target.value, type);
    const current = [...localValue];
    const lastChar = raw.slice(-1);
    current[index] = lastChar;
    setLocalValue(current);
    emitChange(current);
    if (lastChar && index < length - 1) {
      focusIndex(index + 1);
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace') {
      event.preventDefault();
      const current = [...localValue];
      if (current[index]) {
        current[index] = '';
      } else if (index > 0) {
        current[index - 1] = '';
        focusIndex(index - 1);
      }
      setLocalValue(current);
      emitChange(current);
    } else if (event.key === 'ArrowLeft' && index > 0) {
      event.preventDefault();
      focusIndex(index - 1);
    } else if (event.key === 'ArrowRight' && index < length - 1) {
      event.preventDefault();
      focusIndex(index + 1);
    } else if (event.key === 'Delete') {
      const current = [...localValue];
      current[index] = '';
      setLocalValue(current);
      emitChange(current);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = sanitize(event.clipboardData?.getData('text') || '', type).slice(0, length);
    if (!pasted) {
      return;
    }
    const current = pasted.split('');
    while (current.length < length) {
      current.push('');
    }
    setLocalValue(current);
    emitChange(current);
    const lastIndex = Math.min(pasted.length - 1, length - 1);
    focusIndex(lastIndex);
  };

  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = variant === 'error' || error ? VARIANTS.error : VARIANTS.default;

  return (
    <div
      ref={ref}
      role="group"
      aria-label="One-time password"
      className={['flex items-center', sizeConfig.gap, className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {localValue.map((char, index) => (
        <React.Fragment key={index}>
          <input
            ref={(node) => {
              inputsRef.current[index] = node;
            }}
            type="text"
            inputMode={type === 'numeric' ? 'numeric' : 'text'}
            value={mask ? (char ? '•' : '') : char}
            onChange={(event) => handleChange(index, event)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
            onBlur={onBlur}
            maxLength={1}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete="one-time-code"
            autoFocus={autoFocus && index === 0}
            className={[
              'rounded-md border text-center font-semibold transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              sizeConfig.box,
              variantClass,
            ]
              .filter(Boolean)
              .join(' ')}
          />
          {separator && index < length - 1 && (index + 1) % separator.every === 0 ? (
            <span className="text-slate-400">{separator.char || '-'}</span>
          ) : null}
        </React.Fragment>
      ))}
    </div>
  );
});

OtpInput.propTypes = {
  length: PropTypes.number,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onComplete: PropTypes.func,
  onBlur: PropTypes.func,
  type: PropTypes.oneOf(['numeric', 'alphanumeric', 'text']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['default', 'error']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  autoFocus: PropTypes.bool,
  mask: PropTypes.bool,
  placeholder: PropTypes.string,
  separator: PropTypes.shape({
    every: PropTypes.number,
    char: PropTypes.string,
  }),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default OtpInput;