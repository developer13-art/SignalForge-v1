import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const TradeDirectionBadge = forwardRef(function TradeDirectionBadge(
  {
    direction,
    size = 'sm',
    showIcon = true,
    bordered = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const isBuy = String(direction).toUpperCase() === 'BUY' || String(direction).toUpperCase() === 'LONG';

  const config = isBuy
    ? { label: 'BUY', color: 'bg-emerald-100 text-emerald-800', icon: ArrowUpRight }
    : { label: 'SELL', color: 'bg-rose-100 text-rose-800', icon: ArrowDownRight };

  const sizeConfig = SIZES[size] || SIZES.sm;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center font-bold uppercase tracking-wide rounded',
        bordered ? 'border border-current' : '',
        config.color,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? <Icon size={sizeConfig.icon} aria-hidden="true" /> : null}
      {config.label}
    </span>
  );
});

TradeDirectionBadge.propTypes = {
  direction: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeDirectionBadge;