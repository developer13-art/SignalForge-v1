import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';

const ConsensusIndicator = forwardRef(function ConsensusIndicator(
  {
    direction,
    buyCount = 0,
    sellCount = 0,
    agreement,
    totalProviders,
    showCounts = true,
    showBar = true,
    size = 'md',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const total = buyCount + sellCount;
  const buyPercent = total === 0 ? 0 : (buyCount / total) * 100;
  const sellPercent = total === 0 ? 0 : (sellCount / total) * 100;

  const resolvedDirection =
    direction || (buyCount > sellCount ? 'BUY' : sellCount > buyCount ? 'SELL' : 'NEUTRAL');

  const directionConfig = {
    BUY: {
      label: 'Consensus Buy',
      icon: TrendingUp,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
    },
    SELL: {
      label: 'Consensus Sell',
      icon: TrendingDown,
      color: 'text-rose-700',
      bg: 'bg-rose-50 border-rose-200',
    },
    NEUTRAL: {
      label: 'No Consensus',
      icon: Minus,
      color: 'text-slate-600',
      bg: 'bg-slate-50 border-slate-200',
    },
  };

  const config = directionConfig[resolvedDirection] || directionConfig.NEUTRAL;
  const Icon = config.icon;

  const sizeClasses =
    size === 'sm' ? 'gap-2 px-2.5 py-1 text-xs' : size === 'lg' ? 'gap-3 px-4 py-2.5 text-base' : 'gap-2.5 px-3 py-1.5 text-sm';

  return (
    <div
      ref={ref}
      className={[
        'rounded-lg border',
        config.bg,
        sizeClasses,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} className={config.color} aria-hidden="true" />
          <span className={['font-semibold', config.color].filter(Boolean).join(' ')}>
            {config.label}
          </span>
        </div>

        {agreement !== undefined ? (
          <span className="text-xs font-medium opacity-75">
            {Math.round(agreement)}% agreement
          </span>
        ) : null}
      </div>

      {showBar && total > 0 ? (
        <div className="mt-2 flex h-1.5 overflow-hidden rounded-full bg-white/60">
          <div className="bg-emerald-500" style={{ width: `${buyPercent}%` }} />
          <div className="bg-rose-500" style={{ width: `${sellPercent}%` }} />
        </div>
      ) : null}

      {showCounts ? (
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-emerald-700">
            <Users size={10} aria-hidden="true" />
            {buyCount} buy
          </span>
          {totalProviders !== undefined ? (
            <span className="text-slate-500">of {totalProviders} providers</span>
          ) : null}
          <span className="flex items-center gap-1 text-rose-700">
            <Users size={10} aria-hidden="true" />
            {sellCount} sell
          </span>
        </div>
      ) : null}
    </div>
  );
});

ConsensusIndicator.propTypes = {
  direction: PropTypes.oneOf(['BUY', 'SELL', 'NEUTRAL']),
  buyCount: PropTypes.number,
  sellCount: PropTypes.number,
  agreement: PropTypes.number,
  totalProviders: PropTypes.number,
  showCounts: PropTypes.bool,
  showBar: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ConsensusIndicator;