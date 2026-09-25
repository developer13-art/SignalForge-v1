import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const SIZES = {
  xs: { container: 'h-3.5 min-w-[14px] px-1 text-[9px]', dot: 'h-1.5 w-1.5' },
  sm: { container: 'h-4 min-w-[16px] px-1 text-[10px]', dot: 'h-2 w-2' },
  md: { container: 'h-5 min-w-[20px] px-1.5 text-xs', dot: 'h-2.5 w-2.5' },
  lg: { container: 'h-6 min-w-[24px] px-2 text-sm', dot: 'h-3 w-3' },
};

const VARIANTS = {
  primary: 'bg-indigo-600 text-white',
  danger: 'bg-rose-600 text-white',
  warning: 'bg-amber-500 text-white',
  success: 'bg-emerald-600 text-white',
  neutral: 'bg-slate-700 text-white',
};

const NotificationBadge = forwardRef(function NotificationBadge(
  {
    count,
    max = 99,
    dot = false,
    variant = 'danger',
    size = 'sm',
    pulse = false,
    showZero = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const numeric = Number(count) || 0;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const variantClass = VARIANTS[variant] || VARIANTS.danger;

  if (dot) {
    return (
      <span
        ref={ref}
        className={[
          'inline-block rounded-full',
          sizeConfig.dot,
          variantClass,
          pulse ? 'animate-pulse' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
        data-testid={testId}
        {...rest}
      />
    );
  }

  if (numeric === 0 && !showZero) {
    return null;
  }

  const display = numeric > max ? `${max}+` : String(numeric);

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center justify-center rounded-full font-bold',
        sizeConfig.container,
        variantClass,
        pulse ? 'animate-pulse' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      aria-label={`${numeric} notifications`}
      data-testid={testId}
      {...rest}
    >
      {display}
    </span>
  );
});

NotificationBadge.propTypes = {
  count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  max: PropTypes.number,
  dot: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'danger', 'warning', 'success', 'neutral']),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  pulse: PropTypes.bool,
  showZero: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default NotificationBadge;