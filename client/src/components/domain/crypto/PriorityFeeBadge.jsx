import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Zap } from 'lucide-react';

const LEVEL_STYLES = {
  none: 'bg-slate-100 text-slate-600 border-slate-200',
  low: 'bg-sky-50 text-sky-700 border-sky-200',
  medium: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  veryHigh: 'bg-rose-50 text-rose-700 border-rose-200',
};

const LEVEL_LABELS = {
  none: 'No Fee',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  veryHigh: 'Very High',
};

function classifyFee(microLamports) {
  const numeric = Number(microLamports) || 0;
  if (numeric === 0) {
    return 'none';
  }
  if (numeric <= 2000) {
    return 'low';
  }
  if (numeric <= 20000) {
    return 'medium';
  }
  if (numeric <= 100000) {
    return 'high';
  }
  return 'veryHigh';
}

const PriorityFeeBadge = forwardRef(function PriorityFeeBadge(
  { microLamports, level, size = 'sm', className = '', testId, ...rest },
  ref,
) {
  const resolvedLevel = level || classifyFee(microLamports);
  const style = LEVEL_STYLES[resolvedLevel] || LEVEL_STYLES.medium;
  const label = LEVEL_LABELS[resolvedLevel] || 'Medium';

  const sizeClass =
    size === 'md' ? 'text-xs px-2.5 py-1 gap-1' : 'text-[10px] px-2 py-0.5 gap-1';

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wide',
        style,
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <Zap size={size === 'md' ? 11 : 10} aria-hidden="true" />
      {label}
    </span>
  );
});

PriorityFeeBadge.propTypes = {
  microLamports: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  level: PropTypes.oneOf(['none', 'low', 'medium', 'high', 'veryHigh']),
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default PriorityFeeBadge;
export { classifyFee as classifyPriorityFee };