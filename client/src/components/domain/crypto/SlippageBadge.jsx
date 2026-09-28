import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const TONES = {
  tight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  normal: 'bg-sky-50 text-sky-700 border-sky-200',
  relaxed: 'bg-amber-50 text-amber-700 border-amber-200',
  aggressive: 'bg-rose-50 text-rose-700 border-rose-200',
};

function classifySlippage(bps) {
  const numeric = Number(bps);
  if (!Number.isFinite(numeric)) {
    return 'normal';
  }
  if (numeric <= 10) {
    return 'tight';
  }
  if (numeric <= 50) {
    return 'normal';
  }
  if (numeric <= 200) {
    return 'relaxed';
  }
  return 'aggressive';
}

const SlippageBadge = forwardRef(function SlippageBadge(
  { slippageBps, label, size = 'sm', className = '', testId, ...rest },
  ref,
) {
  const tone = classifySlippage(slippageBps);
  const percent =
    Number.isFinite(Number(slippageBps)) ? (Number(slippageBps) / 100).toFixed(2) : '—';

  const sizeClass =
    size === 'md' ? 'text-xs px-2.5 py-1' : 'text-[10px] px-2 py-0.5';

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center rounded-full border font-semibold uppercase tracking-wide',
        TONES[tone],
        sizeClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {label ? <span className="mr-1">{label}</span> : null}
      {percent}%
    </span>
  );
});

SlippageBadge.propTypes = {
  slippageBps: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SlippageBadge;
export { classifySlippage as classifySlippageBps };