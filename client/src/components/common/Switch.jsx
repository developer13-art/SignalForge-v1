/**
 * Switch
 *
 * Accessible toggle switch. Renders as a role="switch" button and
 * supports labels, descriptions, sizes, and loading state.
 *
 * @module client/src/components/common/Switch
 */

import { forwardRef, useId } from 'react';
import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

const SIZES = {
  sm: { track: 'h-5 w-9', thumb: 'h-3.5 w-3.5', translate: 'translate-x-[18px]' },
  md: { track: 'h-6 w-11', thumb: 'h-5 w-5', translate: 'translate-x-[22px]' },
  lg: { track: 'h-7 w-13', thumb: 'h-6 w-6', translate: 'translate-x-[26px]' },
};

const Switch = forwardRef(function Switch(
  {
    id,
    name,
    checked = false,
    defaultChecked,
    onChange,
    onBlur,
    disabled = false,
    loading = false,
    required = false,
    label,
    description,
    size = 'md',
    className = '',
    wrapperClassName = '',
    ariaDescribedBy,
    ...rest
  },
  ref,
) {
  const generatedId = useId();
  const switchId = id || `switch-${generatedId}`;
  const descriptionId = description ? `${switchId}-description` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(' ') || undefined;

  const dimensions = SIZES[size] || SIZES.md;
  const isInteractive = !disabled && !loading;

  return (
    <div className={clsx('flex items-start justify-between gap-3', wrapperClassName, className)}>
      {label || description ? (
        <label htmlFor={switchId} className={clsx('min-w-0 flex-1 cursor-pointer select-none', !isInteractive && 'cursor-not-allowed opacity-60')}>
          {label ? <span className="block text-small font-medium text-text-primary">{label}</span> : null}
          {description ? (
            <span id={descriptionId} className="mt-0.5 block text-caption text-text-secondary">
              {description}
            </span>
          ) : null}
        </label>
      ) : null}

      <button
        ref={ref}
        id={switchId}
        name={name}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        disabled={disabled || loading}
        onClick={() => {
          if (isInteractive && onChange) {
            onChange(!checked);
          }
        }}
        onBlur={onBlur}
        className={clsx(
          'relative inline-flex shrink-0 items-center rounded-full border-2 transition-all duration-200',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          checked
            ? 'bg-primary border-primary'
            : 'bg-surface-elevated border-surface-border hover:border-surface-hover',
          dimensions.track,
          disabled && 'opacity-60 cursor-not-allowed',
          loading && 'cursor-wait',
        )}
        {...rest}
      >
        <span
          className={clsx(
            'pointer-events-none inline-flex items-center justify-center rounded-full bg-white shadow-sm transition-transform duration-200',
            dimensions.thumb,
            checked ? dimensions.translate : 'translate-x-0.5',
          )}
        >
          {loading ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : null}
        </span>
      </button>
    </div>
  );
});

export default Switch;