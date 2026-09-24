import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowDownRight, ArrowUpRight, Minus, TrendingDown, TrendingUp } from 'lucide-react';

const SIZES = {
  sm: { container: 'p-3', label: 'text-[10px]', value: 'text-lg', icon: 'h-7 w-7', iconSize: 14 },
  md: { container: 'p-4', label: 'text-xs', value: 'text-2xl', icon: 'h-9 w-9', iconSize: 16 },
  lg: { container: 'p-5', label: 'text-sm', value: 'text-3xl', icon: 'h-11 w-11', iconSize: 20 },
};

const VARIANTS = {
  default: { icon: 'bg-slate-100 text-slate-600', accent: 'text-slate-900' },
  primary: { icon: 'bg-indigo-100 text-indigo-600', accent: 'text-indigo-700' },
  success: { icon: 'bg-emerald-100 text-emerald-600', accent: 'text-emerald-700' },
  warning: { icon: 'bg-amber-100 text-amber-600', accent: 'text-amber-700' },
  danger: { icon: 'bg-rose-100 text-rose-600', accent: 'text-rose-700' },
  info: { icon: 'bg-sky-100 text-sky-600', accent: 'text-sky-700' },
};

const TREND_STYLES = {
  up: { color: 'text-emerald-600', bg: 'bg-emerald-50', icon: ArrowUpRight },
  down: { color: 'text-rose-600', bg: 'bg-rose-50', icon: ArrowDownRight },
  flat: { color: 'text-slate-500', bg: 'bg-slate-100', icon: Minus },
};

const StatCard = forwardRef(function StatCard(
  {
    label,
    value,
    unit,
    prefix,
    suffix,
    icon: Icon,
    variant = 'default',
    size = 'md',
    trend,
    trendLabel,
    trendDirection,
    trendValue,
    compareLabel,
    description,
    loading = false,
    onClick,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const variantConfig = VARIANTS[variant] || VARIANTS.default;

  let resolvedDirection = trendDirection;
  if (!resolvedDirection && trend) {
    if (trend > 0) {
      resolvedDirection = 'up';
    } else if (trend < 0) {
      resolvedDirection = 'down';
    } else {
      resolvedDirection = 'flat';
    }
  }

  const trendConfig = resolvedDirection ? TREND_STYLES[resolvedDirection] : null;
  const TrendIcon = trendConfig ? trendConfig.icon : null;

  const isInteractive = Boolean(onClick);

  const handleKeyDown = (event) => {
    if (!isInteractive) {
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick(event);
    }
  };

  return (
    <div
      ref={ref}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      className={[
        'flex flex-col rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow',
        sizeConfig.container,
        isInteractive ? 'cursor-pointer hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {label ? (
            <p
              className={[
                'font-medium uppercase tracking-wide text-slate-500',
                sizeConfig.label,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {label}
            </p>
          ) : null}

          <div className="mt-1 flex items-baseline gap-1">
            {prefix ? (
              <span className={['font-semibold text-slate-500', sizeConfig.value].join(' ')}>
                {prefix}
              </span>
            ) : null}
            <span
              className={[
                'font-semibold',
                sizeConfig.value,
                variantConfig.accent,
                loading ? 'animate-pulse text-slate-300' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {loading ? '——' : value}
            </span>
            {unit ? (
              <span className={['text-sm font-medium text-slate-400'].join(' ')}>{unit}</span>
            ) : null}
            {suffix ? (
              <span className={['text-sm font-medium text-slate-500'].join(' ')}>{suffix}</span>
            ) : null}
          </div>

          {trendConfig ? (
            <div className="mt-2 flex items-center gap-2">
              <span
                className={[
                  'inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
                  trendConfig.bg,
                  trendConfig.color,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {TrendIcon ? <TrendIcon size={12} aria-hidden="true" /> : null}
                {trendValue !== undefined ? trendValue : trend !== undefined ? `${trend > 0 ? '+' : ''}${trend}%` : null}
              </span>
              {trendLabel || compareLabel ? (
                <span className="text-[11px] text-slate-500">
                  {trendLabel || compareLabel}
                </span>
              ) : null}
            </div>
          ) : null}

          {description ? (
            <p className="mt-1 text-[11px] text-slate-500">{description}</p>
          ) : null}
        </div>

        {Icon ? (
          <div
            className={[
              'flex shrink-0 items-center justify-center rounded-lg',
              sizeConfig.icon,
              variantConfig.icon,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Icon size={sizeConfig.iconSize} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
});

StatCard.propTypes = {
  label: PropTypes.node,
  value: PropTypes.node,
  unit: PropTypes.string,
  prefix: PropTypes.string,
  suffix: PropTypes.string,
  icon: PropTypes.elementType,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'info']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  trend: PropTypes.number,
  trendLabel: PropTypes.string,
  trendDirection: PropTypes.oneOf(['up', 'down', 'flat']),
  trendValue: PropTypes.node,
  compareLabel: PropTypes.string,
  description: PropTypes.node,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default StatCard;
export { SIZES as STAT_CARD_SIZES, VARIANTS as STAT_CARD_VARIANTS, TREND_STYLES as STAT_CARD_TRENDS };