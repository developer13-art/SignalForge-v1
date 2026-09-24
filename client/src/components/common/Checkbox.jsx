/**
 * Checkbox
 *
 * Accessible checkbox with a custom indicator, indeterminate state,
 * label description, and validation styling. The native input is
 * preserved for form integration but visually replaced.
 *
 * @module client/src/components/common/Checkbox
 */

import { forwardRef, useId, useRef, useEffect } from 'react';
import { Check, Minus } from 'lucide-react';
import clsx from 'clsx';

const SIZES = {
  sm: { box: 'h-4 w-4', icon: 'h-3 w-3' },
  md: { box: 'h-5 w-5', icon: 'h-3.5 w-3.5' },
  lg: { box: 'h-6 w-6', icon: 'h-4 w-4' },
};

const Checkbox = forwardRef(function Checkbox(
  {
    id,
    name,
    checked,
    defaultChecked,
    indeterminate = false,
    onChange,
    onBlur,
    disabled = false,
    required = false,
    label,
    description,
    helperText,
    error,
    size = 'md',
    className = '',
    wrapperClassName = '',
    ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const checkboxId = id || `checkbox-${generatedId}`;
  const descriptionId = description ? `${checkboxId}-description` : undefined;
  const helperId = helperText ? `${checkboxId}-helper` : undefined;
  const errorId = error ? `${checkboxId}-error` : undefined;
  const describedBy = [ariaDescribedBy, errorId, helperId, descriptionId].filter(Boolean).join(' ') || undefined;

  const localRef = useRef(null);

  const setRefs = (node) => {
    localRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  };

  useEffect(() => {
    if (localRef.current) {
      localRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const dimensions = SIZES[size] || SIZES.md;

  return (
    <div className={clsx('flex flex-col gap-1.5', wrapperClassName, className)}>
      <label
        htmlFor={checkboxId}
        className={clsx(
          'group inline-flex items-start gap-3 cursor-pointer select-none',
          disabled && 'cursor-not-allowed opacity-60',
        )}
      >
        <span className="relative flex-shrink-0 pt-0.5">
          <input
            ref={setRefs}
            id={checkboxId}
            name={name}
            type="checkbox"
            checked={checked}
            defaultChecked={defaultChecked}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy}
            aria-required={required || undefined}
            className="peer sr-only"
            {...rest}
          />
          <span
            aria-hidden="true"
            className={clsx(
              'flex items-center justify-center rounded-md border transition-all duration-150',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background',
              'peer-checked:bg-primary peer-checked:border-primary peer-checked:text-white',
              indeterminate && 'bg-primary border-primary text-white',
              dimensions.box,
              error
                ? 'border-error/60 group-hover:border-error'
                : 'border-surface-border group-hover:border-primary-500',
            )}
          >
            {indeterminate ? (
              <Minus className={dimensions.icon} />
            ) : (
              <Check className={clsx(dimensions.icon, 'opacity-0 peer-checked:opacity-100 transition-opacity')} />
            )}
          </span>
        </span>

        {label || description ? (
          <span className="min-w-0 flex-1">
            {label ? (
              <span className="block text-small font-medium text-text-primary">{label}</span>
            ) : null}
            {description ? (
              <span id={descriptionId} className="block text-caption text-text-secondary">
                {description}
              </span>
            ) : null}
          </span>
        ) : null}
      </label>

      {error ? (
        <p id={errorId} role="alert" className="ml-8 text-caption text-error">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="ml-8 text-caption text-text-tertiary">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Checkbox;