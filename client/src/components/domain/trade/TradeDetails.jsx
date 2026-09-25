import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import {
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Layers,
  Target,
  Shield,
  DollarSign,
  Calendar,
} from 'lucide-react';
import Card from '../../common/Card';
import Separator from '../../common/Separator';
import TradeStatusBadge from './TradeStatusBadge';
import TradeDirectionBadge from './TradeDirectionBadge';
import PnLIndicator from './PnLIndicator';
import TradeTimeline from './TradeTimeline';

const TradeDetails = forwardRef(function TradeDetails(
  {
    trade,
    timeline,
    actions,
    showTimeline = true,
    className = '',
    testId,
    ...rest
  },
  ref
) {
  if (!trade) {
    return null;
  }

  const {
    symbol,
    direction,
    volume,
    entryPrice,
    currentPrice,
    exitPrice,
    stopLoss,
    takeProfits = [],
    profit,
    profitPercent,
    commission,
    swap,
    status,
    openedAt,
    closedAt,
    duration,
    provider,
    ticket,
    magicNumber,
    platform,
    riskReward,
  } = trade;

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
                <TradeDirectionBadge direction={direction} size="md" />
              </div>

              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {volume !== undefined ? (
                  <span className="flex items-center gap-1">
                    <Layers size={12} aria-hidden="true" />
                    {volume} lots
                  </span>
                ) : null}
                {duration ? (
                  <span className="flex items-center gap-1">
                    <Clock size={12} aria-hidden="true" />
                    {duration}
                  </span>
                ) : null}
                {platform ? <span>{platform}</span> : null}
                {provider ? (
                  <span>
                    by <strong className="font-semibold text-slate-700">{provider}</strong>
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {status ? <TradeStatusBadge status={status} size="md" /> : null}
            {profit !== undefined ? (
              <PnLIndicator value={profit} percent={profitPercent} size="lg" align="right" />
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card padding="lg" className="lg:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Trade Information
          </h3>

          <Separator spacing="sm" />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Entry Price
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {entryPrice !== undefined && entryPrice !== null ? entryPrice : '—'}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Current / Exit Price
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {exitPrice !== undefined && exitPrice !== null
                  ? exitPrice
                  : currentPrice !== undefined && currentPrice !== null
                  ? currentPrice
                  : '—'}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Stop Loss
              </dt>
              <dd className="mt-1 flex items-center gap-1.5 text-base font-semibold text-rose-600">
                <Shield size={14} aria-hidden="true" />
                {stopLoss !== undefined && stopLoss !== null ? stopLoss : 'Not set'}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Risk to Reward
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {riskReward || '—'}
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
          </dl>

          <Separator spacing="md" />

          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Financial Breakdown
          </h4>

          <Separator spacing="sm" />

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Commission
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {commission !== undefined && commission !== null ? commission : '—'}
              </dd>
            </div>

            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                Swap
              </dt>
              <dd className="mt-1 text-base font-semibold text-slate-900">
                {swap !== undefined && swap !== null ? swap : '—'}
              </dd>
            </div>
          </dl>
        </Card>

        <Card padding="lg">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Execution Metadata
          </h3>

          <Separator spacing="sm" />

          <dl className="space-y-3">
            {ticket !== undefined ? (
              <div className="flex items-center justify-between">
                <dt className="text-xs text-slate-500">Ticket</dt>
                <dd className="font-mono text-sm font-medium text-slate-900">{ticket}</dd>
              </div>
            ) : null}

            {magicNumber !== undefined ? (
              <div className="flex items-center justify-between">
                <dt className="text-xs text-slate-500">Magic Number</dt>
                <dd className="font-mono text-sm font-medium text-slate-900">{magicNumber}</dd>
              </div>
            ) : null}

            {openedAt ? (
              <div className="flex items-start gap-2">
                <Calendar size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-500">Opened</p>
                  <p className="text-sm font-medium text-slate-900">{openedAt}</p>
                </div>
              </div>
            ) : null}

            {closedAt ? (
              <div className="flex items-start gap-2">
                <Calendar size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
                <div>
                  <p className="text-xs text-slate-500">Closed</p>
                  <p className="text-sm font-medium text-slate-900">{closedAt}</p>
                </div>
              </div>
            ) : null}
          </dl>
        </Card>
      </div>

      {showTimeline && timeline && timeline.length > 0 ? (
        <Card padding="lg">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Trade Lifecycle
          </h3>

          <Separator spacing="sm" />

          <TradeTimeline events={timeline} />
        </Card>
      ) : null}

      {actions ? <div>{actions}</div> : null}
    </div>
  );
});

TradeDetails.propTypes = {
  trade: PropTypes.object,
  timeline: PropTypes.array,
  actions: PropTypes.node,
  showTimeline: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeDetails;