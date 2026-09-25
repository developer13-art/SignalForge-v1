import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { TrendingUp, TrendingDown, Target, Activity, Percent, Clock } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import SparklineChart from '../../charts/SparklineChart';

const TraderPerformance = forwardRef(function TraderPerformance(
  {
    metrics = {},
    sparklineData,
    period = '30d',
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const items = [
    {
      key: 'winRate',
      label: 'Win Rate',
      value: metrics.winRate,
      format: (v) => `${v}%`,
      icon: Target,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      key: 'avgReturn',
      label: 'Avg Return',
      value: metrics.avgReturn,
      format: (v) => `${v}%`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
    },
    {
      key: 'maxDrawdown',
      label: 'Max Drawdown',
      value: metrics.maxDrawdown,
      format: (v) => `${v}%`,
      icon: TrendingDown,
      color: 'text-rose-600',
      iconBg: 'bg-rose-50',
    },
    {
      key: 'totalTrades',
      label: 'Total Trades',
      value: metrics.totalTrades,
      icon: Activity,
      color: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
    },
    {
      key: 'avgRR',
      label: 'Avg R:R',
      value: metrics.avgRR,
      icon: Percent,
      color: 'text-sky-600',
      iconBg: 'bg-sky-50',
    },
    {
      key: 'avgDuration',
      label: 'Avg Duration',
      value: metrics.avgDuration,
      icon: Clock,
      color: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
  ].filter((item) => item.value !== undefined && item.value !== null);

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Performance
          </h3>
          <p className="mt-1 text-xs text-slate-500">Aggregated metrics over {period}</p>
        </div>
      </div>

      {sparklineData && sparklineData.length > 0 ? (
        <>
          <Separator spacing="md" />
          <SparklineChart
            data={sparklineData}
            dataKey="value"
            width={280}
            height={48}
            variant="area"
            color="#4f46e5"
            showLastDot
            className="w-full"
          />
        </>
      ) : null}

      <Separator spacing="md" />

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.key}>
              <div
                className={[
                  'inline-flex h-8 w-8 items-center justify-center rounded-md',
                  item.iconBg,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <Icon size={14} className={item.color} aria-hidden="true" />
              </div>
              <dt className="mt-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                {item.label}
              </dt>
              <dd className={['mt-0.5 text-base font-semibold', item.color].filter(Boolean).join(' ')}>
                {item.format ? item.format(item.value) : item.value}
              </dd>
            </div>
          );
        })}
      </dl>
    </Card>
  );
});

TraderPerformance.propTypes = {
  metrics: PropTypes.shape({
    winRate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    avgReturn: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    maxDrawdown: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    totalTrades: PropTypes.number,
    avgRR: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    avgDuration: PropTypes.string,
  }),
  sparklineData: PropTypes.array,
  period: PropTypes.string,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TraderPerformance;