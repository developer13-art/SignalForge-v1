import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Activity,
  Shield,
  Target,
  Zap,
  TrendingUp,
  Users,
} from 'lucide-react';
import Card from '../../common/Card';
import SignalConfidenceBadge from './SignalConfidenceBadge';
import SignalStatusBadge from './SignalStatusBadge';
import SignalSourceBadge from './SignalSourceBadge';
import Separator from '../../common/Separator';

const SignalDetails = forwardRef(function SignalDetails(
  {
    signal,
    timeline,
    actions,
    showTimeline = true,
    showAnalysis = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!signal) {
    return null;
  }

  const {
    symbol,
    direction,
    entry,
    entryType,
    stopLoss,
    takeProfits = [],
    confidence,
    status,
    provider,
    source,
    time,
    riskReward,
    subscribers,
    aiAnalysis,
    riskNotes,
    leverage,
    timeframe,
  } = signal;

  const isBuy = direction === 'BUY' || direction === 'LONG';

  return (
    <div
      ref={ref}
      className={['flex flex-col gap-4', className].filter(Boolean).join(' ')}
      data-testid={testId}
      {...rest}
    >
      <Card padding="lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={[
                'flex h-12 w-12 items-center justify-center rounded-lg',
                isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isBuy ? (
                <ArrowUpRight size={24} aria-hidden="true" />
              ) : (
                <ArrowDownRight size={24} aria-hidden="true" />
              )}
            </span>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-slate-900">{symbol}</h1>
                <span
                  className={[
                    'rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide',
                    isBuy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {direction}
                </span>
                {entryType ? (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-slate-600">
                    {entryType}
                  </span>
                ) : null}
                {timeframe ? (
                  <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-medium uppercase tracking-wide text-indigo-700">
                    {timeframe}
                  </span>
                ) : null}
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {time ? (
                  <span className="flex items-center gap-1">
                    <Clock size={12} aria-hidden="true" />
                    {time}
                  </span>
                ) : null}
                {subscribers !== undefined ? (
                  <span className="flex items-center gap-1">
                    <Users size={12} aria-hidden="true" />
                    {subscribers} subscribers
                  </span>
                ) : null}
                {provider ? (
                  <span>
                    by <strong className="font-semibold text-slate-700">{provider.name}</strong>
                  </span>
                ) : null}
                {source ? <SignalSourceBadge source={source} size="xs" /> : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {status ? <SignalStatusBadge status={status} size="sm" /> : null}
            {confidence !== undefined ? (
              <SignalConfidenceBadge confidence={confidence} size="sm" showLabel />
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Trade Parameters
          </h3>

          <Separator spacing="sm" />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Entry Price
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {entry !== undefined && entry !== null ? entry : 'Market'}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Stop Loss
              </dt>
              <dd className="mt-1 text-base font-semibold text-rose-600">
                {stopLoss !== undefined && stopLoss !== null ? stopLoss : 'Not set'}
              </dd>
            </div>

            <div className="col-span-2">
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Take Profit Levels
              </dt>
              <dd className="mt-1 flex flex-wrap gap-2">
                {Array.isArray(takeProfits) && takeProfits.length > 0 ? (
                  takeProfits.map((tp, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-sm font-semibold text-emerald-700"
                    >
                      <Target size={12} aria-hidden="true" />
                      TP{index + 1}: {tp}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-slate-400">No take profit set</span>
                )}
              </dd>
            </div>

            {riskReward !== undefined ? (
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Risk to Reward
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">{riskReward}</dd>
              </div>
            ) : null}

            {leverage !== undefined ? (
              <div>
                <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Leverage
                </dt>
                <dd className="mt-1 text-base font-semibold text-slate-900">{leverage}</dd>
              </div>
            ) : null}
          </dl>
        </Card>

        {showAnalysis ? (
          <Card padding="lg">
            <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
              <Activity size={14} aria-hidden="true" />
              AI Analysis
            </h3>

            <Separator spacing="sm" />

            {aiAnalysis ? (
              <p className="text-sm leading-relaxed text-slate-700">{aiAnalysis}</p>
            ) : (
              <p className="text-sm italic text-slate-400">No AI analysis available</p>
            )}

            {riskNotes ? (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
                  <Shield size={12} aria-hidden="true" />
                  Risk Notes
                </p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">{riskNotes}</p>
              </div>
            ) : null}
          </Card>
        ) : null}
      </div>

      {showTimeline && timeline && timeline.length > 0 ? (
        <Card padding="lg">
          <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            <Zap size={14} aria-hidden="true" />
            Processing Timeline
          </h3>

          <Separator spacing="sm" />

          <ol className="relative flex flex-col gap-4">
            {timeline.map((event, index) => (
              <li key={event.key || index} className="flex items-start gap-3">
                <span
                  className={[
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
                    event.complete
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-500',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-medium text-slate-900">{event.title}</p>
                    {event.time ? (
                      <time className="text-[11px] text-slate-400">{event.time}</time>
                    ) : null}
                  </div>
                  {event.description ? (
                    <p className="mt-0.5 text-xs text-slate-500">{event.description}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Card>
      ) : null}

      {actions ? <div>{actions}</div> : null}
    </div>
  );
});

SignalDetails.propTypes = {
  signal: PropTypes.shape({
    symbol: PropTypes.string,
    direction: PropTypes.string,
    entry: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    entryType: PropTypes.string,
    stopLoss: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    takeProfits: PropTypes.array,
    confidence: PropTypes.number,
    status: PropTypes.string,
    provider: PropTypes.shape({ name: PropTypes.string }),
    source: PropTypes.string,
    time: PropTypes.string,
    riskReward: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subscribers: PropTypes.number,
    aiAnalysis: PropTypes.string,
    riskNotes: PropTypes.string,
    leverage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    timeframe: PropTypes.string,
  }),
  timeline: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.node,
      description: PropTypes.node,
      time: PropTypes.string,
      complete: PropTypes.bool,
    })
  ),
  actions: PropTypes.node,
  showTimeline: PropTypes.bool,
  showAnalysis: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalDetails;