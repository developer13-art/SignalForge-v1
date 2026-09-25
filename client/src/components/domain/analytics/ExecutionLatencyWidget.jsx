import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Zap, Clock, Gauge } from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import SparklineChart from '../../charts/SparklineChart';
import ProgressBar from '../../common/ProgressBar';

function getLatencyQuality(ms) {
  if (ms < 200) {
    return { label: 'Excellent', variant: 'success' };
  }
  if (ms < 500) {
    return { label: 'Good', variant: 'primary' };
  }
  if (ms < 1000) {
    return { label: 'Fair', variant: 'warning' };
  }
  return { label: 'Slow', variant: 'danger' };
}

const ExecutionLatencyWidget = forwardRef(function ExecutionLatencyWidget(
  {
    averageLatency,
    medianLatency,
    maxLatency,
    p95Latency,
    sparklineData,
    period = '24h',
    loading = false,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  const quality = getLatencyQuality(Number(averageLatency) || 0);

  return (
    <Card ref={ref} padding="lg" className={className} testId={testId} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Execution Latency
          </h3>
          <p className="mt-1 text-xs text-slate-500">Signal-to-broker round trip · {period}</p>
        </div>
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600">
          <Zap size={16} aria-hidden="true" />
        </span>
      </div>

      <Separator spacing="md" />

      <div className="text-center">
        <p className="text-4xl font-bold text-slate-900">
          {loading ? '—' : Math.round(Number(averageLatency) || 0)}
          <span className="ml-1 text-lg font-medium text-slate-500">ms</span>
        </p>
        <p
          className={[
            'mt-1 text-xs font-semibold',
            quality.variant === 'success'
              ? 'text-emerald-600'
              : quality.variant === 'primary'
              ? 'text-indigo-600'
              : quality.variant === 'warning'
              ? 'text-amber-600'
              : 'text-rose-600',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {quality.label}
        </p>
      </div>

      <Separator spacing="md" />

      {sparklineData && sparklineData.length > 0 ? (
        <>
          <SparklineChart
            data={sparklineData}
            dataKey="value"
            width={280}
            height={48}
            variant="area"
            color="#f59e0b"
            showLastDot
            className="w-full"
          />
          <Separator spacing="md" />
        </>
      ) : null}

      <dl className="grid grid-cols-3 gap-3">
        <div>
          <dt className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            <Clock size={10} aria-hidden="true" />
            Median
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {loading ? '—' : `${medianLatency || 0} ms`}
          </dd>
        </div>

        <div>
          <dt className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
            <Gauge size={10} aria-hidden="true" />
            P95
          </dt>
          <dd className="mt-1 text-sm font-semibold text-slate-900">
            {loading ? '—' : `${p95Latency || 0} ms`}
          </dd>
        </div>

        <div>
          <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Max
          </dt>
          <dd className="mt-1 text-sm font-semibold text-rose-600">
            {loading ? '—' : `${maxLatency || 0} ms`}
          </dd>
        </div>
      </dl>

      {averageLatency !== undefined ? (
        <div className="mt-4">
          <ProgressBar
            value={Math.min(Number(averageLatency) / 10, 100)}
            max={100}
            size="sm"
            variant={quality.variant}
          />
        </div>
      ) : null}
    </Card>
  );
});

ExecutionLatencyWidget.propTypes = {
  averageLatency: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  medianLatency: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  maxLatency: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  p95Latency: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sparklineData: PropTypes.array,
  period: PropTypes.string,
  loading: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default ExecutionLatencyWidget;