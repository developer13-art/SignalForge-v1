import React, { forwardRef, useMemo } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
  xl: 'h-4',
};

const VARIANTS = {
  primary: 'bg-indigo-600',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger: 'bg-rose-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-500',
  gradient: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
};

const SEGMENTED_COLORS = {
  low: 'bg-rose-500',
  medium: 'bg-amber-500',
  high: 'bg-emerald-500',
};

function getSegmentedColor(value) {
  if (value < 33) {
    return SEGMENTED_COLORS.low;
  }
  if (value < 66) {
    return SEGMENTED_COLORS.medium;
  }
  return SEGMENTED_COLORS.high;
}

const ProgressBar = forwardRef(function ProgressBar(
  {
    value = 0,
    max = 100,
    size = 'md',
    variant = 'primary',
    showLabel = false,
    showValue = false,
    label,
    labelPosition = 'top',
    animated = false,
    striped = false,
    segmented = false,
    indeterminate = false,
    className = '',
    barClassName = '',
    labelClassName = '',
    testId,
    ...rest
  },
  ref,
) {
  const clampedValue = Math.max(0, Math.min(value, max));
  const percent = max === 0 ? 0 : (clampedValue / max) * 100;

  const sizeClass = SIZES[size] || SIZES.md;

  const variantClass = useMemo(() => {
    if (segmented) {
      return getSegmentedColor(percent);
    }
    return VARIANTS[variant] || VARIANTS.primary;
  }, [segmented, percent, variant]);

  const stripedClass = striped
    ? 'bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]'
    : '';

  const animatedClass = animated
    ? striped
      ? 'animate-[progress-stripes_1s_linear_infinite]'
      : 'transition-[width] duration-300 ease-out'
    : 'transition-[width] duration-300 ease-out';

  return (
    <div
      ref={ref}
      className={['w-full', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showLabel || showValue ? (
        <div
          className={[
            'mb-1.5 flex items-center justify-between text-xs font-medium text-slate-700',
            labelPosition === 'bottom' ? 'order-2 mt-1.5 mb-0' : '',
            labelClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span>{label || ''}</span>
          {showValue ? <span>{Math.round(percent)}%</span> : null}
        </div>
      ) : null}

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-label={label || 'Progress'}
        className={[
          'relative w-full overflow-hidden rounded-full bg-slate-200',
          sizeClass,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {indeterminate ? (
          <div
            className={[
              'absolute inset-y-0 left-0 w-1/3 rounded-full',
              variantClass,
              'animate-[indeterminate_1.5s_ease-in-out_infinite]',
            ]
              .filter(Boolean)
              .join(' ')}
          />
        ) : (
          <div
            className={[
              'h-full rounded-full',
              variantClass,
              stripedClass,
              animatedClass,
              barClassName,
            ]
              .filter(Boolean)
              .join(' ')}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
});

ProgressBar.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  variant: PropTypes.oneOf([
    'primary',
    'success',
    'warning',
    'danger',
    'info',
    'neutral',
    'gradient',
  ]),
  showLabel: PropTypes.bool,
  showValue: PropTypes.bool,
  label: PropTypes.string,
  labelPosition: PropTypes.oneOf(['top', 'bottom']),
  animated: PropTypes.bool,
  striped: PropTypes.bool,
  segmented: PropTypes.bool,
  indeterminate: PropTypes.bool,
  className: PropTypes.string,
  barClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  testId: PropTypes.string,
};

export default ProgressBar;
export { SIZES as PROGRESS_SIZES, VARIANTS as PROGRESS_VARIANTS };