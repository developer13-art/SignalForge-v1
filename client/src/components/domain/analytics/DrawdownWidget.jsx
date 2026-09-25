import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { AlertTriangle, TrendingDown } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import DrawdownChart from '../../charts/DrawdownChart';
import ProgressBar from '../../common/ProgressBar';

const DrawdownWidget = forwardRef(function DrawdownWidget(
  {
    data = [],
    currentDrawdown,
    maxDrawdown,
    maxDrawdownDate,
    recoveryDays,
    riskLevel = 'medium',
    period = '30d',
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const riskConfig = {
    low: { label: 'Low Risk', color: 'text-emerald-600', bg: 'bg-emerald-50' },
    medium: { label: 'Moderate Risk', color: 'text-amber-600', bg: 'bg-amber-50' },
    high: { label: 'High Risk', color: 'text-rose-600', bg: 'bg-rose-50' },
  };

  const config = riskConfig[riskLevel] || riskConfig.medium;

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Drawdown Analysis
          </h3>
          <p className="mt-1 text-xs text-slate-500">Peak-to-trough decline over {period}</p>
        </div>

        <span
          className={[
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
            config.bg,
            config.color,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <AlertTriangle size={12} aria-hidden="true" />
          {config.label}
        </span>
      </div>

      <Separator spacing="md" />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Current Drawdown
          </p>
          <p className="mt-1 flex items-center gap-1 text-lg font-bold text-rose-600">
            <TrendingDown size={14} aria-hidden="true" />
            {loading ? '—' : `${currentDrawdown || 0}%`}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Maximum Drawdown
          </p>
          <p className="mt-1 text-lg font-bold text-rose-700">
            {loading ? '—' : `${maxDrawdown || 0}%`}
          </p>
        </div>
      </div>

      {maxDrawdown !== undefined ? (
        <div className="mt-3">
          <ProgressBar
            value={Math.abs(Number(maxDrawdown))}
            max={100}
            variant={riskLevel === 'high' ? 'danger' : riskLevel === 'medium' ? 'warning' : 'success'}
            size="sm"
          />
        </div>
      ) : null}

      {maxDrawdownDate || recoveryDays !== undefined ? (
        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          {maxDrawdownDate ? (
            <span>
              Worst period: <strong className="font-semibold text-slate-700">{maxDrawdownDate}</strong>
            </span>
          ) : null}
          {recoveryDays !== undefined ? (
            <span>
              Recovery:{' '}
              <strong className="font-semibold text-slate-700">{recoveryDays} days</strong>
            </span>
          ) : null}
        </div>
      ) : null}

      <Separator spacing="md" />

      <div className="w-full">
        <DrawdownChart
          data={data}
          xKey="date"
          dataKey="drawdown"
          height={220}
          showThresholdLine={maxDrawdown !== undefined}
          threshold={-Math.abs(Number(maxDrawdown) || 10)}
        />
      </div>
    </Card>
  );
});

DrawdownWidget.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  currentDrawdown: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxDrawdown: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxDrawdownDate: PropTypes.string,
  recoveryDays: PropTypes.number,
  riskLevel: PropTypes.oneOf(['low', 'medium', 'high']),
  period: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default DrawdownWidget;