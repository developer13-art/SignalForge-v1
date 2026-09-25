import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Copy, AlertCircle } from 'lucide-react';

const VARIANTS = {
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  info: 'bg-sky-50 text-sky-700 border-sky-200',
};

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
};

const DuplicateSignalBadge = forwardRef(function DuplicateSignalBadge(
  {
    variant = 'warning',
    label = 'Duplicate',
    size = 'sm',
    showIcon = true,
    showLabel = true,
    count,
    tooltip,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const sizeConfig = SIZES[size] || SIZES.sm;
  const variantClass = VARIANTS[variant] || VARIANTS.warning;
  const Icon = variant === 'danger' ? AlertCircle : Copy;

  return (
    <span
      ref={ref}
      title={tooltip}
      className={[
        'inline-flex items-center border font-semibold',
        variantClass,
        sizeConfig.container,
        'rounded-full',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? <Icon size={sizeConfig.icon} aria-hidden="true" /> : null}
      {showLabel ? label : null}
      {count !== undefined ? <span className="ml-0.5 opacity-75">({count})</span> : null}
    </span>
  );
});

DuplicateSignalBadge.propTypes = {
  variant: PropTypes.oneOf(['warning', 'danger', 'info']),
  label: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  count: PropTypes.number,
  tooltip: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default DuplicateSignalBadge;