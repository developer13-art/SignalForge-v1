import React, { forwardRef, useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Minus, Plus } from 'lucide-react';

const SIZES = {
  sm: { input: 'h-8 text-xs px-2.5', button: 'w-8 h-8', icon: 12 },
  md: { input: 'h-10 text-sm px-3', button: 'w-10 h-10', icon: 14 },
  lg: { input: 'h-12 text-base px-4', button: 'w-12 h-12', icon: 16 },
};

const VARIANTS = {
  default: 'border-slate-300 bg-white focus:border-indigo-500 focus:ring-indigo-500',
  error: 'border-rose-400 bg-white focus:border-rose-500 focus:ring-rose-500',
};

const NumberInput = forwardRef(function NumberInput(
  {
    value = '',
    onChange,
    onBlur,
    min,
    max,
    step = 1,
    precision,
    placeholder = '0',
    size = 'md',
    error = false,
    disabled = false,
    required = false,
    showControls = true,
    align = 'left',
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

  const clamp = useCallback(
    (numeric) => {
      let result = numeric;
      if (min !== undefined && result < min) {
        result = min;
      }
      if (max !== undefined && result > max) {
        result = max;
      }
      if (precision !== undefined) {
        result = Number(result.toFixed(precision));
      }
      return result;
    },
    [min, max, precision],
  );

  const emitChange = (nextValue, event) => {
    if (onChange) {
      onChange(nextValue, nextValue === '' ? null : Number(nextValue), event);
    }
  };

  const handleInputChange = (event) => {
    const raw = event.target.value;
    if (raw === '') {
      emitChange('', event);
      return;
    }
    const numeric = Number(raw);
    if (Number.isNaN(numeric)) {
      return;
    }
    emitChange(clamp(numeric), event);
  };

  const increment = () => {
    const current = value === '' ? 0 : Number(value);
    emitChange(clamp(current + step));
  };

  const decrement = () => {
    const current = value === '' ? 0 : Number(value);
    emitChange(clamp(current - step));
  };

  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = error ? VARIANTS.error : VARIANTS.default;

  const alignClass =
    align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';

  return (
    <div className={['w-full', className].filter(Boolean).join(' ')}>
      <div className="flex items-stretch overflow-hidden rounded-md">
        {showControls ? (
          <button
            type="button"
            onClick={decrement}
            disabled={disabled || (min !== undefined && Number(value) <= min)}
            aria-label="Decrease"
            className={[
              'flex shrink-0 items-center justify-center border border-r-0 border-slate-300 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
              sizeConfig.button,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Minus size={sizeConfig.icon} aria-hidden="true" />
          </button>
        ) : null}

        <input
          ref={ref}
          id={id}
          name={name}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            setFocused(false);
            if (onBlur) {
              onBlur(event);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete="off"
          className={[
            'w-full border font-medium text-slate-900 transition-colors focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            sizeConfig.input,
            variantClass,
            alignClass,
            focused ? 'ring-1' : '',
            inputClassName,
          ]
            .filter(Boolean)
            .join(' ')}
          data-testid={testId}
          {...rest}
        />

        {showControls ? (
          <button
            type="button"
            onClick={increment}
            disabled={disabled || (max !== undefined && Number(value) >= max)}
            aria-label="Increase"
            className={[
              'flex shrink-0 items-center justify-center border border-l-0 border-slate-300 bg-slate-50 text-slate-600 transition-colors hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50',
              sizeConfig.button,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Plus size={sizeConfig.icon} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  );
});

NumberInput.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  precision: PropTypes.number,
  placeholder: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  error: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  showControls: PropTypes.bool,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  name: PropTypes.string,
  id: PropTypes.string,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default NumberInput;