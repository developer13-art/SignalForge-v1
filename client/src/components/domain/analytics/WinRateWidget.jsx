import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Target, CheckCircle2, XCircle } from 'lucide-react';
import Card from '../../common/Card';
import CircularProgress from '../../common/CircularProgress';
import Separator from '../../common/Separator';

const WinRateWidget = forwardRef(function WinRateWidget(
  {
    winRate,
    totalTrades,
    winningTrades,
    losingTrades,
    breakevenTrades,
    period = '30d',
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const numeric = Number(winRate) || 0;
  const color = numeric >= 60 ? 'success' : numeric >= 45 ? 'warning' : 'danger';

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Win Rate
          </h3>
          <p className="mt-1 text-xs text-slate-500">Over the last {period}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <Target size={16} aria-hidden="true" />
        </span>
      </div>

      <Separator spacing="md" />

      <div className="flex items-center justify-center py-3">
        <CircularProgress
          value={numeric}
          max={100}
          size="xl"
          color={color}
          showValue
          thickness={8}
        />
      </div>

      <Separator spacing="sm" />

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Total
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-900">
            {loading ? '—' : totalTrades || 0}
          </dd>
        </div>

        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
          <dt className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
            <CheckCircle2 size={10} aria-hidden="true" />
            Wins
          </dt>
          <dd className="mt-1 text-base font-semibold text-emerald-700">
            {loading ? '—' : winningTrades || 0}
          </dd>
        </div>

        <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
          <dt className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-rose-700">
            <XCircle size={10} aria-hidden="true" />
            Losses
          </dt>
          <dd className="mt-1 text-base font-semibold text-rose-700">
            {loading ? '—' : losingTrades || 0}
          </dd>
        </div>

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Breakeven
          </dt>
          <dd className="mt-1 text-base font-semibold text-slate-700">
            {loading ? '—' : breakevenTrades || 0}
          </dd>
        </div>
      </dl>
    </Card>
  );
});

WinRateWidget.propTypes = {
  winRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  totalTrades: PropTypes.number,
  winningTrades: PropTypes.number,
  losingTrades: PropTypes.number,
  breakevenTrades: PropTypes.number,
  period: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default WinRateWidget;