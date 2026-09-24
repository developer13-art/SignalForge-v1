/**
 * Radio
 *
 * Accessible radio input. Supports plain radio usage and can also
 * render a group wrapper when given an `options` array. Keyboard
 * arrows move selection within the native radiogroup behaviour.
 *
 * @module client/src/components/common/Radio
 */

import { forwardRef, useId } from 'react';
import clsx from 'clsx';

const SIZES = {
  sm: { circle: 'h-4 w-4', dot: 'h-1.5 w-1.5' },
  md: { circle: 'h-5 w-5', dot: 'h-2 w-2' },
  lg: { circle: 'h-6 w-6', dot: 'h-2.5 w-2.5' },
};

export const RadioGroup = forwardRef(function RadioGroup(
  {
    name,
    value,
    defaultValue,
    onChange,
    options = [],
    orientation = 'vertical',
    label,
    helperText,
    error,
    disabled = false,
    size = 'md',
    className = '',
    wrapperClassName = '',
    ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const groupId = `radio-group-${generatedId}`;
  const helperId = helperText ? `${groupId}-helper` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId].filter(Boolean).join(' ') || undefined;

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-labelledby={label ? `${groupId}-label` : undefined}
      aria-describedby={describedBy}
      className={clsx('flex flex-col gap-2', wrapperClassName, className)}
      {...rest}
    >
      {label ? (
        <p id={`${groupId}-label`} className="text-small font-medium text-text-secondary">
          {label}
        </p>
      ) : null}

      <div className={clsx('flex gap-3', orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col')}>
        {options.map((option) => {
          const optValue = typeof option === 'object' ? option.value : option;
          const optLabel = typeof option === 'object' ? option.label : String(option);
          const optDescription = typeof option === 'object' ? option.description : undefined;
          const optDisabled = typeof option === 'object' ? option.disabled : false;
          const checked = value !== undefined ? value === optValue : undefined;

          return (
            <Radio
              key={optValue}
              name={name}
              value={optValue}
              checked={checked}
              defaultChecked={defaultValue === optValue}
              onChange={onChange}
              label={optLabel}
              description={optDescription}
              disabled={disabled || optDisabled}
              size={size}
            />
          );
        })}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-caption text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-caption text-text-tertiary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

const Radio = forwardRef(function Radio(
  {
    id,
    name,
    value,
    checked,
    defaultChecked,
    onChange,
    onBlur,
    disabled = false,
    required = false,
    label,
    description,
    size = 'md',
    className = '',
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const radioId = id || `radio-${generatedId}`;
  const descriptionId = description ? `${radioId}-description` : undefined;

  const dimensions = SIZES[size] || SIZES.md;

  return (
    <label
      htmlFor={radioId}
      className={clsx(
        'group inline-flex items-start gap-3 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-60',
        className,
      )}
    >
      <span className="relative flex-shrink-0 pt-0.5">
        <input
          ref={ref}
          id={radioId}
          name={name}
          type="radio"
          value={value}
          checked={checked}
          defaultChecked={defaultChecked}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          aria-describedby={descriptionId}
          className="peer sr-only"
          {...rest}
        />
        <span
          aria-hidden="true"
          className={clsx(
            'flex items-center justify-center rounded-full border transition-all duration-150',
            'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
            'peer-checked:border-primary',
            dimensions.circle,
            'border-surface-border group-hover:border-primary-500',
          )}
        >
          <span
            className={clsx(
              'rounded-full bg-primary transition-transform duration-150',
              dimensions.dot,
              'scale-0 peer-checked:scale-100',
            )}
          />
        </span>
      </span>

      {label || description ? (
        <span className="min-w-0 flex-1">
          {label ? <span className="block text-small font-medium text-text-primary">{label}</span> : null}
          {description ? (
            <span id={descriptionId} className="block text-caption text-text-secondary">
              {description}
            </span>
          ) : null}
        </span>
      ) : null}
    </label>
  );
});

export { Radio };
export default RadioGroup;