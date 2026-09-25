import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SIZES = {
  xs: { text: 'text-[10px]', icon: 10, gap: 'gap-0.5' },
  sm: { text: 'text-xs', icon: 12, gap: 'gap-1' },
  md: { text: 'text-sm', icon: 14, gap: 'gap-1' },
  lg: { text: 'text-lg', icon: 18, gap: 'gap-1.5' },
  xl: { text: 'text-2xl', icon: 22, gap: 'gap-2' },
};

function formatValue(value, currency, showSign) {
  if (value === undefined || value === null) {
    return '—';
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }
  const sign = num > 0 && showSign ? '+' : '';
  const formatted = Math.abs(num).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${num < 0 ? '-' : sign}${currency ? `${currency}` : ''}${formatted}`;
}

const PnLIndicator = forwardRef(function PnLIndicator(
  {
    value,
    percent,
    currency = '$',
    size = 'md',
    align = 'left',
    showIcon = true,
    showPercent = true,
    showSign = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const numericValue = Number(value);
  const isPositive = numericValue > 0;
  const isNegative = numericValue < 0;
  const isNeutral = numericValue === 0 || Number.isNaN(numericValue);

  const colorClass = isPositive
    ? 'text-emerald-600'
    : isNegative
    ? 'text-rose-600'
    : 'text-slate-500';

  const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const sizeConfig = SIZES[size] || SIZES.md;

  const alignClass =
    align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start';

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center font-semibold',
        sizeConfig.text,
        sizeConfig.gap,
        colorClass,
        alignClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showIcon ? <Icon size={sizeConfig.icon} aria-hidden="true" /> : null}

      <span>{formatValue(value, currency, showSign)}</span>

      {showPercent && percent !== undefined && percent !== null ? (
        <span className="opacity-75">
          ({formatValue(percent, '', true).replace(currency, '')}%)
        </span>
      ) : null}

      {isNeutral && !showIcon ? null : null}
    </span>
  );
});

PnLIndicator.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  percent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currency: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  align: PropTypes.oneOf(['left', 'center', 'right']),
  showIcon: PropTypes.bool,
  showPercent: PropTypes.bool,
  showSign: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PnLIndicator;