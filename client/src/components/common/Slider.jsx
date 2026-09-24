/**
 * Slider
 *
 * Range input with a visually custom track and dual-thumb support.
 * Handles keyboard arrows, Home/End, and step increments as defined
 * by the native input semantics.
 *
 * @module client/src/components/common/Slider
 */

import { forwardRef, useCallback, useId, useState } from 'react';
import clsx from 'clsx';

const Slider = forwardRef(function Slider(
  {
    id,
    name,
    value,
    defaultValue,
    onChange,
    onBlur,
    min = 0,
    max = 100,
    step = 1,
    label,
    helperText,
    error,
    disabled = false,
    showValue = true,
    formatValue,
    suffix,
    prefix,
    className = '',
    wrapperClassName = '',
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const sliderId = id || `slider-${generatedId}`;
  const helperId = helperText ? `${sliderId}-helper` : undefined;
  const errorId = error ? `${sliderId}-error` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(' ') || undefined;

  const [internalValue, setInternalValue] = useState(defaultValue ?? min);
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const range = Math.max(1, max - min);
  const percent = Math.round(((currentValue - min) / range) * 100);

  const handleChange = useCallback(
    (event) => {
      const next = Number(event.target.value);
      if (!isControlled) {
        setInternalValue(next);
      }
      if (onChange) {
        onChange(next);
      }
    },
    [isControlled, onChange],
  );

  const displayValue = formatValue ? formatValue(currentValue) : currentValue;

  return (
    <div className={clsx('w-full', wrapperClassName, className)}>
      {label || showValue ? (
        <div className="mb-2 flex items-center justify-between">
          {label ? (
            <label htmlFor={sliderId} className="text-small font-medium text-text-secondary">
              {label}
            </label>
          ) : <span />}
          {showValue ? (
            <span className="inline-flex items-center gap-1 rounded-md border border-surface-border bg-surface px-2 py-0.5 text-caption font-medium text-text-primary">
              {prefix ? <span className="text-text-tertiary">{prefix}</span> : null}
              {displayValue}
              {suffix ? <span className="text-text-tertiary">{suffix}</span> : null}
            </span>
          ) : null}
        </div>
      ) : null}

      <div className="relative">
        <input
          ref={ref}
          id={sliderId}
          name={name}
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className="sr-only"
          {...rest}
        />
        <div
          aria-hidden="true"
          className={clsx(
            'relative h-2 w-full overflow-hidden rounded-full bg-surface-elevated',
            disabled && 'opacity-60',
          )}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-primary transition-all duration-100"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div
          aria-hidden="true"
          className={clsx(
            'pointer-events-none absolute top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-background shadow-glow-primary transition-all duration-100',
            disabled && 'opacity-60',
          )}
          style={{ left: `calc(${percent}% - 10px)` }}
        >
          <span className="h-2 w-2 rounded-full bg-primary" />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>

      <div className="mt-1 flex items-center justify-between text-caption text-text-tertiary">
        <span>{prefix ? `${prefix}${min}` : min}{suffix || ''}</span>
        <span>{prefix ? `${prefix}${max}` : max}{suffix || ''}</span>
      </div>

      {error ? (
        <p id={errorId} role="alert" className="mt-1.5 text-caption text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="mt-1.5 text-caption text-text-tertiary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Slider;