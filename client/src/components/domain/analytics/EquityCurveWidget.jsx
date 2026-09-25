import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import EquityCurveChart from '../../charts/EquityCurveChart';

function formatCurrency(value, currency = 'USD') {
  if (value === undefined || value === null) {
    return '—';
  }
  const num = Number(value);
  if (Number.isNaN(num)) {
    return String(value);
  }
  return `${currency} ${num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const EquityCurveWidget = forwardRef(function EquityCurveWidget(
  {
    data = [],
    startEquity,
    currentEquity,
    totalReturn,
    totalReturnPercent,
    period = '30d',
    currency = 'USD',
    loading = false,
    variant = 'area',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const isPositive = Number(totalReturn) >= 0;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Equity Curve
          </h3>
          <p className="mt-1 text-xs text-slate-500">Track your account equity over {period}</p>
        </div>

        {totalReturn !== undefined ? (
          <div className="text-right">
            <p
              className={[
                'flex items-center justify-end gap-1 text-lg font-bold',
                isPositive ? 'text-emerald-600' : 'text-rose-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isPositive ? (
                <TrendingUp size={16} aria-hidden="true" />
              ) : (
                <TrendingDown size={16} aria-hidden="true" />
              )}
              {isPositive ? '+' : ''}
              {totalReturnPercent !== undefined ? `${totalReturnPercent}%` : formatCurrency(totalReturn, currency)}
            </p>
          </div>
        ) : null}
      </div>

      <Separator spacing="md" />

      <div className="grid grid-cols-2 gap-4">
        {startEquity !== undefined ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Starting Equity
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {loading ? '—' : formatCurrency(startEquity, currency)}
            </p>
          </div>
        ) : null}

        {currentEquity !== undefined ? (
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Current Equity
            </p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {loading ? '—' : formatCurrency(currentEquity, currency)}
            </p>
          </div>
        ) : null}
      </div>

      <Separator spacing="md" />

      <div className="w-full">
        <EquityCurveChart
          data={data}
          xKey="date"
          dataKey="equity"
          height={240}
          variant={variant}
          showGrid
          valueFormatter={(value) => formatCurrency(value, currency)}
        />
      </div>
    </Card>
  );
});

EquityCurveWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  startEquity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  currentEquity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalReturn: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalReturnPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  period: PropTypes.string,
  currency: PropTypes.string,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['area', 'line']),
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default EquityCurveWidget;