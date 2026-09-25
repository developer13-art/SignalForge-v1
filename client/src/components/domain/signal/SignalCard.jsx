import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight, Clock, Users } from 'lucide-react';
import Card from '../../common/Card';
import SignalConfidenceBadge from './SignalConfidenceBadge';
import SignalStatusBadge from './SignalStatusBadge';
import SignalSourceBadge from './SignalSourceBadge';

const SignalCard = forwardRef(function SignalCard(
  {
    signal,
    onClick,
    compact = false,
    showProvider = true,
    showSource = true,
    showConfidence = true,
    showStatus = true,
    showMetrics = true,
    actions,
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
    takeProfits,
    confidence,
    status,
    provider,
    source,
    time,
    subscribers,
    riskReward,
  } = signal;

  const isBuy = direction === 'BUY' || direction === 'LONG';

  return (
    <Card
      ref={ref}
      variant="default"
      padding={compact ? 'sm' : 'md'}
      hoverable={Boolean(onClick)}
      clickable={Boolean(onClick)}
      onClick={onClick}
      className={className}
      testId={testId}
      {...rest}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              'flex h-9 w-9 items-center justify-center rounded-md',
              isBuy ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {isBuy ? (
              <ArrowUpRight size={18} aria-hidden="true" />
            ) : (
              <ArrowDownRight size={18} aria-hidden="true" />
            )}
          </span>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-slate-900">{symbol}</h3>
              <span
                className={[
                  'rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                  isBuy ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {direction}
              </span>
              {entryType ? (
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
                  {entryType}
                </span>
              ) : null}
            </div>

            {time ? (
              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-slate-400">
                <Clock size={10} aria-hidden="true" />
                {time}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          {showStatus && status ? <SignalStatusBadge status={status} size="xs" /> : null}
          {showConfidence && confidence !== undefined ? (
            <SignalConfidenceBadge confidence={confidence} size="xs" />
          ) : null}
        </div>
      </div>

      {showProvider && provider ? (
        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-700">{provider.name}</p>
            {provider.verified ? (
              <p className="text-[10px] text-emerald-600">Verified provider</p>
            ) : null}
          </div>

          {showSource && source ? <SignalSourceBadge source={source} size="xs" /> : null}
        </div>
      ) : null}

      {showMetrics ? (
        <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Entry
            </p>
            <p className="mt-0.5 text-sm font-semibold text-slate-900">
              {entry !== undefined && entry !== null ? entry : 'Market'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Stop Loss
            </p>
            <p className="mt-0.5 text-sm font-semibold text-rose-600">
              {stopLoss !== undefined && stopLoss !== null ? stopLoss : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Take Profit
            </p>
            <p className="mt-0.5 text-sm font-semibold text-emerald-600">
              {Array.isArray(takeProfits) && takeProfits.length > 0
                ? takeProfits[0]
                : takeProfits || '—'}
            </p>
          </div>
        </div>
      ) : null}

      {(subscribers !== undefined || riskReward !== undefined) ? (
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          {subscribers !== undefined ? (
            <span className="flex items-center gap-1">
              <Users size={12} aria-hidden="true" />
              {subscribers} subscribers
            </span>
          ) : null}
          {riskReward !== undefined ? (
            <span>
              R:R <strong className="font-semibold text-slate-700">{riskReward}</strong>
            </span>
          ) : null}
        </div>
      ) : null}

      {actions ? <div className="mt-3 border-t border-slate-100 pt-3">{actions}</div> : null}
    </Card>
  );
});

SignalCard.propTypes = {
  signal: PropTypes.shape({
    symbol: PropTypes.string,
    direction: PropTypes.string,
    entry: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    entryType: PropTypes.string,
    stopLoss: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    takeProfits: PropTypes.oneOfType([PropTypes.array, PropTypes.string, PropTypes.number]),
    confidence: PropTypes.number,
    status: PropTypes.string,
    provider: PropTypes.shape({
      name: PropTypes.string,
      verified: PropTypes.bool,
    }),
    source: PropTypes.string,
    time: PropTypes.string,
    subscribers: PropTypes.number,
    riskReward: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  onClick: PropTypes.func,
  compact: PropTypes.bool,
  showProvider: PropTypes.bool,
  showSource: PropTypes.bool,
  showConfidence: PropTypes.bool,
  showStatus: PropTypes.bool,
  showMetrics: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default SignalCard;