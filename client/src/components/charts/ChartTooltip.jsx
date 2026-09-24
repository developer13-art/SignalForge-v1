import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const VARIANTS = {
  default: 'bg-white border-slate-200 text-slate-900',
  dark: 'bg-slate-900 border-slate-800 text-white',
  primary: 'bg-indigo-600 border-indigo-700 text-white',
  success: 'bg-emerald-600 border-emerald-700 text-white',
  warning: 'bg-amber-500 border-amber-600 text-white',
  danger: 'bg-rose-600 border-rose-700 text-white',
};

const ChartTooltip = forwardRef(function ChartTooltip(
  {
    active,
    payload,
    label,
    variant = 'default',
    labelFormatter,
    valueFormatter,
    nameFormatter,
    showLabel = true,
    showTotal = false,
    totalLabel = 'Total',
    className = '',
    testId,
    ...rest
  },
  ref,
) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const variantClass = VARIANTS[variant] || VARIANTS.default;

  const total = payload.reduce((sum, entry) => {
    const numeric = Number(entry.value);
    return Number.isFinite(numeric) ? sum + numeric : sum;
  }, 0);

  const formattedLabel = labelFormatter ? labelFormatter(label) : label;

  return (
    <div
      ref={ref}
      className={[
        'min-w-[160px] rounded-md border px-3 py-2 text-xs shadow-lg backdrop-blur-sm',
        variantClass,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      data-testid={testId}
      {...rest}
    >
      {showLabel && formattedLabel !== undefined && formattedLabel !== null ? (
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide opacity-70">
          {formattedLabel}
        </p>
      ) : null}

      <ul className="space-y-1">
        {payload.map((entry, index) => {
          const name = nameFormatter ? nameFormatter(entry.name, entry) : entry.name;
          const value = valueFormatter ? valueFormatter(entry.value, entry) : entry.value;

          return (
            <li
              key={`${entry.dataKey || entry.name || index}`}
              className="flex items-center justify-between gap-3"
            >
              <span className="flex items-center gap-1.5">
                {entry.color ? (
                  <span
                    className="inline-block h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: entry.color }}
                    aria-hidden="true"
                  />
                ) : null}
                <span className="opacity-80">{name}</span>
              </span>
              <span className="font-semibold">{value}</span>
            </li>
          );
        })}
      </ul>

      {showTotal && payload.length > 1 ? (
        <div className="mt-1.5 flex items-center justify-between gap-3 border-t border-current/20 pt-1.5">
          <span className="opacity-80">{totalLabel}</span>
          <span className="font-semibold">
            {valueFormatter ? valueFormatter(total, null) : total}
          </span>
        </div>
      ) : null}
    </div>
  );
});

ChartTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.array,
  label: PropTypes.any,
  variant: PropTypes.oneOf(['default', 'dark', 'primary', 'success', 'warning', 'danger']),
  labelFormatter: PropTypes.func,
  valueFormatter: PropTypes.func,
  nameFormatter: PropTypes.func,
  showLabel: PropTypes.bool,
  showTotal: PropTypes.bool,
  totalLabel: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ChartTooltip;
export { VARIANTS as CHART_TOOLTIP_VARIANTS };