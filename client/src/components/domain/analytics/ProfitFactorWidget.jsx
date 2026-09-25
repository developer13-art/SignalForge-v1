import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { BarChart3, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import ProgressBar from '../../common/ProgressBar';

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

const ProfitFactorWidget = forwardRef(function ProfitFactorWidget(
  {
    profitFactor,
    grossProfit,
    grossLoss,
    netProfit,
    avgWin,
    avgLoss,
    period = '30d',
    currency = 'USD',
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const numeric = Number(profitFactor) || 0;
  const color =
    numeric >= 2 ? 'success' : numeric >= 1.5 ? 'primary' : numeric >= 1 ? 'warning' : 'danger';

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Profit Factor
          </h3>
          <p className="mt-1 text-xs text-slate-500">Gross profit ÷ gross loss · {period}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <BarChart3 size={16} aria-hidden="true" />
        </span>
      </div>

      <Separator spacing="md" />

      <div className="text-center">
        <p
          className={[
            'text-4xl font-bold',
            numeric >= 1.5
              ? 'text-emerald-600'
              : numeric >= 1
              ? 'text-amber-600'
              : 'text-rose-600',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {loading ? '—' : numeric.toFixed(2)}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          {numeric >= 2
            ? 'Excellent'
            : numeric >= 1.5
            ? 'Good'
            : numeric >= 1
            ? 'Acceptable'
            : 'Below breakeven'}
        </p>
      </div>

      <div className="mt-4">
        <ProgressBar
          value={Math.min(numeric * 33, 100)}
          max={100}
          variant={color}
          size="sm"
        />
      </div>

      <Separator spacing="md" />

      <dl className="grid grid-cols-2 gap-3">
        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Gross Profit
          </dt>
          <dd className="mt-1 flex items-center gap-1 text-sm font-semibold text-emerald-600">
            <TrendingUp size={12} aria-hidden="true" />
            {loading ? '—' : formatCurrency(grossProfit, currency)}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Gross Loss
          </dt>
          <dd className="mt-1 flex items-center gap-1 text-sm font-semibold text-rose-600">
            <TrendingDown size={12} aria-hidden="true" />
            {loading ? '—' : formatCurrency(grossLoss, currency)}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Avg Win
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-800">
            {loading ? '—' : formatCurrency(avgWin, currency)}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Avg Loss
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-800">
            {loading ? '—' : formatCurrency(avgLoss, currency)}
          </dd>
        </div>
      </dl>

      {netProfit !== undefined ? (
        <>
          <Separator spacing="sm" />
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
              <Activity size={12} aria-hidden="true" />
              Net Profit
            </span>
            <span
              className={[
                'text-sm font-bold',
                Number(netProfit) >= 0 ? 'text-emerald-600' : 'text-rose-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {formatCurrency(netProfit, currency)}
            </span>
          </div>
        </>
      ) : null}
    </Card>
  );
});

ProfitFactorWidget.propTypes = {
  profitFactor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  grossProfit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  grossLoss: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  netProfit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  avgWin: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  avgLoss: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  period: PropTypes.string,
  currency: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ProfitFactorWidget;