import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { TrendingDown, TrendingUp } from 'lucide-react';

const SIZES = {
  sm: { container: 'p-3', value: 'text-xl', label: 'text-[11px]', sub: 'text-[10px]' },
  md: { container: 'p-4', value: 'text-2xl', label: 'text-xs', sub: 'text-[11px]' },
  lg: { container: 'p-6', value: 'text-3xl', label: 'text-sm', sub: 'text-xs' },
};

const VARIANTS = {
  default: 'border-slate-200 bg-white',
  primary: 'border-indigo-200 bg-indigo-50',
  success: 'border-emerald-200 bg-emerald-50',
  warning: 'border-amber-200 bg-amber-50',
  danger: 'border-rose-200 bg-rose-50',
  dark: 'border-slate-700 bg-slate-900 text-white',
};

const MetricCard = forwardRef(function MetricCard(
  {
    title,
    value,
    subValue,
    unit,
    prefix,
    trend,
    trendDirection,
    trendLabel,
    sparkline,
    icon: Icon,
    variant = 'default',
    size = 'md',
    description,
    footer,
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const variantClass = VARIANTS[variant] || VARIANTS.default;

  let resolvedDirection = trendDirection;
  if (!resolvedDirection && trend !== undefined) {
    resolvedDirection = trend > 0 ? 'up' : trend < 0 ? 'down' : 'flat';
  }

  const trendColorClass =
    variant === 'dark'
      ? resolvedDirection === 'up'
        ? 'text-emerald-400'
        : resolvedDirection === 'down'
        ? 'text-rose-400'
        : 'text-slate-400'
      : resolvedDirection === 'up'
      ? 'text-emerald-600'
      : resolvedDirection === 'down'
      ? 'text-rose-600'
      : 'text-slate-500';

  const TrendIcon =
    resolvedDirection === 'up' ? TrendingUp : resolvedDirection === 'down' ? TrendingDown : null;

  return (
    <div
      ref={ref}
      className={[
        'rounded-lg border shadow-sm transition-shadow hover:shadow-md',
        variantClass,
        sizeConfig.container,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {title ? (
            <p
              className={[
                'font-medium uppercase tracking-wide',
                variant === 'dark' ? 'text-slate-300' : 'text-slate-500',
                sizeConfig.label,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {title}
            </p>
          ) : null}

          <div className="mt-1 flex items-baseline gap-1">
            {prefix ? (
              <span
                className={[
                  'font-semibold',
                  variant === 'dark' ? 'text-slate-300' : 'text-slate-500',
                  sizeConfig.value,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {prefix}
              </span>
            ) : null}
            <span
              className={[
                'font-semibold',
                variant === 'dark' ? 'text-white' : 'text-slate-900',
                sizeConfig.value,
                loading ? 'animate-pulse text-slate-300' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {loading ? '——' : value}
            </span>
            {unit ? (
              <span
                className={[
                  'font-medium',
                  variant === 'dark' ? 'text-slate-400' : 'text-slate-400',
                  'text-sm',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {unit}
              </span>
            ) : null}
          </div>

          {subValue ? (
            <p
              className={[
                'mt-0.5',
                variant === 'dark' ? 'text-slate-400' : 'text-slate-500',
                sizeConfig.sub,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {subValue}
            </p>
          ) : null}
        </div>

        {Icon ? (
          <div
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
              variant === 'dark' ? 'bg-slate-800 text-slate-200' : 'bg-white/60 text-slate-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Icon size={18} aria-hidden="true" />
          </div>
        ) : null}
      </div>

      {sparkline ? <div className="mt-3">{sparkline}</div> : null}

      {trend !== undefined || trendLabel ? (
        <div className="mt-3 flex items-center justify-between gap-2">
          {trend !== undefined && TrendIcon ? (
            <span className={['inline-flex items-center gap-1 text-xs font-semibold', trendColorClass].join(' ')}>
              <TrendIcon size={14} aria-hidden="true" />
              {trend > 0 ? '+' : ''}
              {trend}%
            </span>
          ) : null}
          {trendLabel ? (
            <span
              className={[
                'text-[11px]',
                variant === 'dark' ? 'text-slate-400' : 'text-slate-500',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {trendLabel}
            </span>
          ) : null}
        </div>
      ) : null}

      {description ? (
        <p
          className={[
            'mt-2 text-xs',
            variant === 'dark' ? 'text-slate-400' : 'text-slate-500',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {description}
        </p>
      ) : null}

      {footer ? <div className="mt-3 border-t border-current/10 pt-3">{footer}</div> : null}
    </div>
  );
});

MetricCard.propTypes = {
  title: PropTypes.node,
  value: PropTypes.node,
  subValue: PropTypes.node,
  unit: PropTypes.string,
  prefix: PropTypes.string,
  trend: PropTypes.number,
  trendDirection: PropTypes.oneOf(['up', 'down', 'flat']),
  trendLabel: PropTypes.node,
  sparkline: PropTypes.node,
  icon: PropTypes.elementType,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'warning', 'danger', 'dark']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  description: PropTypes.node,
  footer: PropTypes.node,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default MetricCard;
export { VARIANTS as METRIC_CARD_VARIANTS, SIZES as METRIC_CARD_SIZES };