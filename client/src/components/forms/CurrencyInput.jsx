import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  sm: 'h-8 text-xs px-2.5',
  md: 'h-10 text-sm px-3',
  lg: 'h-12 text-base px-4',
};

const VARIANTS = {
  default: 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500',
  error: 'border-rose-400 bg-white focus:border-rose-500 focus:ring-rose-500',
};

const DEFAULT_CURRENCIES = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  NGN: '₦',
  JPY: '¥',
  INR: '₹',
  ZAR: 'R',
  CAD: 'C$',
  AUD: 'A$',
  BRL: 'R$',
  CNY: '¥',
  AED: 'د.إ',
};

function sanitizeNumeric(value) {
  if (value === '' || value === null || value === undefined) {
    return '';
  }
  const cleaned = String(value).replace(/[^\d.\-]/g, '');
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    return `${parts[0]}.${parts.slice(1).join('')}`;
  }
  return cleaned;
}

const CurrencyInput = forwardRef(function CurrencyInput(
  {
    value = '',
    onChange,
    onBlur,
    currency = 'USD',
    symbol,
    placeholder = '0.00',
    size = 'md',
    error = false,
    disabled = false,
    required = false,
    min,
    max,
    allowNegative = false,
    thousandSeparator = true,
    name,
    id,
    className = '',
    inputClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const [focused, setFocused] = useState(false);

  const resolvedSymbol = symbol || DEFAULT_CURRENCIES[currency] || currency;

  const formatDisplay = (raw) => {
    if (raw === '' || raw === null || raw === undefined) {
      return '';
    }
    const numeric = Number(raw);
    if (Number.isNaN(numeric)) {
      return String(raw);
    }
    if (!thousandSeparator) {
      return String(numeric);
    }
    return numeric.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const displayValue = focused ? value : formatDisplay(value);

  const handleFocus = (event) => {
    setFocused(true);
    if (rest.onFocus) {
      rest.onFocus(event);
    }
  };

  const handleBlur = (event) => {
    setFocused(false);
    if (onBlur) {
      onBlur(event);
    }
  };

  const handleChange = (event) => {
    let sanitized = sanitizeNumeric(event.target.value);

    if (!allowNegative && sanitized.startsWith('-')) {
      sanitized = sanitized.slice(1);
    }

    if (sanitized !== '' && sanitized !== '-') {
      const numeric = Number(sanitized);
      if (min !== undefined && numeric < min) {
        sanitized = String(min);
      }
      if (max !== undefined && numeric > max) {
        sanitized = String(max);
      }
    }

    if (onChange) {
      onChange(sanitized, sanitized === '' ? null : Number(sanitized), event);
    }
  };

  const sizeClass = SIZES[size] || SIZES.md;
  const variantClass = error ? VARIANTS.error : VARIANTS.default;

  return (
    <div className={['relative w-full', className].filter(Boolean).join(' ')}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
        {resolvedSymbol}
      </span>

      <input
        ref={ref}
        id={id}
        name={name}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        className={[
          'w-full rounded-md border text-right font-medium text-slate-900 transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          sizeClass,
          variantClass,
          'pl-8',
          inputClassName,
        ]
          .filter(Boolean)
          .join(' ')}
        data-testid={testId}
        {...rest}
      />
    </div>
  );
});

CurrencyInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  currency: PropTypes.string,
  symbol: PropTypes.string,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  min: PropTypes.number,
  max: PropTypes.number,
  allowNegative: PropTypes.bool,
  thousandSeparator: PropTypes.bool,
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default CurrencyInput;
export { DEFAULT_CURRENCIES as CURRENCY_INPUT_SYMBOLS };