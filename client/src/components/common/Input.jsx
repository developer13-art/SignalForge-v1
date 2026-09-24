/**
 * Input
 *
 * Accessible text input with label, helper text, error state,
 * prefix/suffix slots, right-aligned action slot, and clear button.
 * Uses a stable id generated from React's `useId` so that
 * server-rendered and client-rendered markup align.
 *
 * @module client/src/components/common/Input
 */

import { forwardRef, useId, useState, useCallback } from 'react';
import clsx from 'clsx';
import { Eye, EyeOff, X } from 'lucide-react';

const SIZES = {
  sm: 'h-9 px-3 text-small rounded-lg',
  md: 'h-11 px-3.5 text-small rounded-xl',
  lg: 'h-12 px-4 text-body rounded-xl',
};

const Input = forwardRef(function Input(
  {
    id,
    name,
    type = 'text',
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    label,
    helperText,
    error,
    success,
    disabled = false,
    readOnly = false,
    required = false,
    autoFocus = false,
    autoComplete,
    maxLength,
    minLength,
    pattern,
    size = 'md',
    fullWidth = true,
    prefix,
    suffix,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    onClear,
    hideNumberSpinners = true,
    className = '',
    wrapperClassName = '',
    inputClassName = '',
    ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const inputId = id || `input-${generatedId}`;
  const helperId = helperText ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ') || undefined;

  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const [isFocused, setIsFocused] = useState(false);

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const resolvedType = type === 'password' && showPassword ? 'text' : type;

  const handleChange = useCallback(
    (event) => {
      if (!isControlled) {
        setInternalValue(event.target.value);
      }
      if (onChange) {
        onChange(event);
      }
    },
    [isControlled, onChange],
  );

  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }
    if (onClear) {
      onClear();
    }
    if (onChange) {
      onChange({ target: { name, value: '' } });
    }
  }, [isControlled, name, onChange, onClear]);

  const showClear = Boolean(onClear) && String(currentValue || '').length > 0 && !disabled && !readOnly;

  const dimensions = SIZES[size] || SIZES.md;

  return (
    <div className={clsx(fullWidth && 'w-full', wrapperClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-1.5 flex items-center gap-1 text-small font-medium text-text-secondary"
        >
          {label}
          {required ? <span className="text-error" aria-hidden="true">*</span> : null}
        </label>
      ) : null}

      <div
        className={clsx(
          'relative flex items-center gap-2 border bg-surface transition-all duration-150',
          dimensions,
          error
            ? 'border-error/60 focus-within:border-error focus-within:ring-2 focus-within:ring-error/25'
            : success
            ? 'border-success/60 focus-within:border-success focus-within:ring-2 focus-within:ring-success/25'
            : isFocused
            ? 'border-primary-500 ring-2 ring-primary-500/25'
            : 'border-surface-border hover:border-surface-hover focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/25',
          disabled && 'opacity-60 cursor-not-allowed',
          readOnly && 'bg-background-subtle',
        )}
      >
        {prefix ? <span className="shrink-0 text-caption text-text-tertiary">{prefix}</span> : null}
        {!prefix && LeftIcon ? <LeftIcon className="shrink-0 h-4 w-4 text-text-tertiary" /> : null}

        <input
          ref={ref}
          id={inputId}
          name={name}
          type={resolvedType}
          value={isControlled ? value : internalValue}
          onChange={handleChange}
          onBlur={(event) => {
            setIsFocused(false);
            if (onBlur) {
              onBlur(event);
            }
          }}
          onFocus={(event) => {
            setIsFocused(true);
            if (onFocus) {
              onFocus(event);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          className={clsx(
            'min-w-0 flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary',
            'focus:outline-none',
            type === 'password' && 'pr-9',
            hideNumberSpinners && type === 'number' && 'appearance-none',
            inputClassName,
          )}
          {...rest}
        />

        {hideNumberSpinners && type === 'number' ? (
          <style>{`
            #${inputId}::-webkit-outer-spin-button,
            #${inputId}::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
          `}</style>
        ) : null}

        {showClear ? (
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary transition hover:text-text-primary"
            aria-label="Clear input"
            tabIndex={-1}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}

        {type === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="shrink-0 inline-flex h-6 w-6 items-center justify-center rounded-md text-text-tertiary transition hover:text-text-primary"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}

        {suffix ? <span className="shrink-0 text-caption text-text-tertiary">{suffix}</span> : null}
        {!suffix && RightIcon && type !== 'password' ? (
          <RightIcon className="shrink-0 h-4 w-4 text-text-tertiary" />
        ) : null}
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

export default Input;