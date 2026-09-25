import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Zap, Target, TrendingUp, Repeat, Anchor, Wind } from 'lucide-react';

const STYLES = {
  scalper: { label: 'Scalper', icon: Zap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  day_trader: { label: 'Day Trader', icon: Target, color: 'bg-sky-50 text-sky-700 border-sky-200' },
  swing: { label: 'Swing Trader', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  swing_trader: { label: 'Swing Trader', icon: TrendingUp, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  position: { label: 'Position Trader', icon: Anchor, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  position_trader: { label: 'Position Trader', icon: Anchor, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  grid: { label: 'Grid Trader', icon: Repeat, color: 'bg-violet-50 text-violet-700 border-violet-200' },
  news: { label: 'News Trader', icon: Wind, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  news_trader: { label: 'News Trader', icon: Wind, color: 'bg-rose-50 text-rose-700 border-rose-200' },
};

const SIZES = {
  xs: { container: 'gap-1 px-1.5 py-0.5 text-[10px]', icon: 10 },
  sm: { container: 'gap-1.5 px-2 py-0.5 text-xs', icon: 12 },
  md: { container: 'gap-2 px-2.5 py-1 text-sm', icon: 14 },
  lg: { container: 'gap-2 px-3 py-1.5 text-base', icon: 16 },
};

const TraderStyleBadge = forwardRef(function TraderStyleBadge(
  {
    style = 'day_trader',
    size = 'sm',
    showIcon = true,
    showLabel = true,
    bordered = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const key = String(style).toLowerCase().replace(/\s+/g, '_');
  const config = STYLES[key] || STYLES.day_trader;
  const sizeConfig = SIZES[size] || SIZES.sm;
  const Icon = config.icon;

  return (
    <span
      ref={ref}
      className={[
        'inline-flex items-center font-semibold rounded-full',
        bordered ? 'border' : '',
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
      {showLabel ? config.label : null}
    </span>
  );
});

TraderStyleBadge.propTypes = {
  style: PropTypes.string,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  showIcon: PropTypes.bool,
  showLabel: PropTypes.bool,
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TraderStyleBadge;
export { STYLES as TRADER_STYLES };