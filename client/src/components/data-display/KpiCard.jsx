import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

const SIZES = {
  sm: { container: 'p-3', value: 'text-lg', label: 'text-[10px]' },
  md: { container: 'p-4', value: 'text-2xl', label: 'text-xs' },
  lg: { container: 'p-6', value: 'text-4xl', label: 'text-sm' },
};

const STATUS = {
  neutral: 'text-slate-900 border-slate-200 bg-white',
  positive: 'text-emerald-700 border-emerald-200 bg-emerald-50',
  negative: 'text-rose-700 border-rose-200 bg-rose-50',
  warning: 'text-amber-700 border-amber-200 bg-amber-50',
};

const KpiCard = forwardRef(function KpiCard(
  {
    label,
    value,
    unit,
    status = 'neutral',
    change,
    changeLabel,
    changeDirection,
    icon: Icon,
    description,
    size = 'md',
    bordered = true,
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  const sizeConfig = SIZES[size] || SIZES.md;
  const statusClass = STATUS[status] || STATUS.neutral;

  let resolvedDirection = changeDirection;
  if (!resolvedDirection && change !== undefined) {
    resolvedDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  }

  const ChangeIcon =
    resolvedDirection === 'up' ? ArrowUpRight : resolvedDirection === 'down' ? ArrowDownRight : Minus;

  const changeColorClass =
    resolvedDirection === 'up'
      ? 'text-emerald-600'
      : resolvedDirection === 'down'
      ? 'text-rose-600'
      : 'text-slate-500';

  return (
    <div
      ref={ref}
      className={[
        'flex flex-col rounded-lg',
        bordered ? 'border' : '',
        statusClass,
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
          {label ? (
            <p
              className={[
                'font-medium uppercase tracking-wider text-slate-500',
                sizeConfig.label,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {label}
            </p>
          ) : null}

          <div className="mt-1 flex items-baseline gap-1">
            <span className={['font-bold', sizeConfig.value].join(' ')}>{value}</span>
            {unit ? (
              <span className="text-sm font-medium text-slate-400">{unit}</span>
            ) : null}
          </div>

          {change !== undefined ? (
            <div className="mt-2 flex items-center gap-1">
              <ChangeIcon size={14} className={changeColorClass} aria-hidden="true" />
              <span className={['text-xs font-semibold', changeColorClass].join(' ')}>
                {change > 0 ? '+' : ''}
                {change}%
              </span>
              {changeLabel ? (
                <span className="text-[11px] text-slate-500">{changeLabel}</span>
              ) : null}
            </div>
          ) : null}

          {description ? (
            <p className="mt-1 text-[11px] text-slate-500">{description}</p>
          ) : null}
        </div>

        {Icon ? (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/60 text-slate-600">
            <Icon size={18} aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </div>
  );
});

KpiCard.propTypes = {
  label: PropTypes.node,
  value: PropTypes.node,
  unit: PropTypes.string,
  status: PropTypes.oneOf(['neutral', 'positive', 'negative', 'warning']),
  change: PropTypes.number,
  changeLabel: PropTypes.node,
  changeDirection: PropTypes.oneOf(['up', 'down', 'flat']),
  icon: PropTypes.elementType,
  description: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  bordered: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default KpiCard;
export { SIZES as KPI_CARD_SIZES, STATUS as KPI_CARD_STATUS };