import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

function resolveConfidence(confidence) {
  const value = Number(confidence);
  if (Number.isNaN(value)) {
    return { label: 'Unknown', variant: 'neutral' };
  }
  const percent = value <= 1 ? value * 100 : value;

  if (percent >= 90) {
    return { label: 'Very High', variant: 'success', percent };
  }
  if (percent >= 75) {
    return { label: 'High', variant: 'success', percent };
  }
  if (percent >= 55) {
    return { label: 'Medium', variant: 'warning', percent };
  }
  if (percent >= 35) {
    return { label: 'Low', variant: 'danger', percent };
  }
  return { label: 'Very Low', variant: 'danger', percent };
}

const VARIANTS = {
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  neutral: 'bg-slate-100 text-slate-600 border-slate-200',
};

const SignalConfidenceBadge = forwardRef(function SignalConfidenceBadge(
  {
    confidence,
    size = 'sm',
    showPercent = true,
    showLabel = false,
    showIcon = true,
    bordered = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const config = resolveConfidence(confidence);
  const sizeConfig = SIZES[size] || SIZES.sm;
  const variantClass = VARIANTS[config.variant] || VARIANTS.neutral;

  const Icon =
    config.variant === 'success'
      ? TrendingUp
      : config.variant === 'danger'
      ? TrendingDown
      : Minus;

  const content = [];

  if (showPercent && config.percent !== undefined) {
    content.push(`${Math.round(config.percent)}%`);
  }

  if (showLabel) {
    content.push(config.label);
  }

  return (
    <span
      ref={ref}
      role="status"
      aria-label={`Confidence ${config.percent !== undefined ? `${Math.round(config.percent)}%` : 'unknown'}`}
      className={[
        'inline-flex items-center font-semibold',
        bordered ? 'border' : '',
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
      {content.join(' · ')}
    </span>
  );
});

SignalConfidenceBadge.propTypes = {
  confidence: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showPercent: PropTypes.bool,
  showLabel: PropTypes.bool,
  showIcon: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalConfidenceBadge;
export { resolveConfidence as resolveSignalConfidence };