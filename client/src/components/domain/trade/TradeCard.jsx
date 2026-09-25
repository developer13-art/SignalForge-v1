import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight, Clock, Layers } from 'lucide-react';
import Card from '../../common/Card';
import TradeStatusBadge from './TradeStatusBadge';
import TradeDirectionBadge from './TradeDirectionBadge';
import PnLIndicator from './PnLIndicator';

const TradeCard = forwardRef(function TradeCard(
  {
    trade,
    onClick,
    compact = false,
    showSymbol = true,
    showStatus = true,
    showPnL = true,
    showVolume = true,
    actions,
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
    stopLoss,
    takeProfit,
    profit,
    profitPercent,
    status,
    openedAt,
    duration,
    provider,
  } = trade;

  const isBuy = direction === 'BUY' || direction === 'LONG';
  const isPositive = Number(profit) >= 0;

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
            <div className="flex flex-wrap items-center gap-2">
              {showSymbol ? (
                <h3 className="text-base font-semibold text-slate-900">{symbol}</h3>
              ) : null}
              <TradeDirectionBadge direction={direction} size="xs" />
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              {showVolume && volume !== undefined ? (
                <span className="flex items-center gap-1">
                  <Layers size={10} aria-hidden="true" />
                  {volume} lots
                </span>
              ) : null}
              {duration ? (
                <span className="flex items-center gap-1">
                  <Clock size={10} aria-hidden="true" />
                  {duration}
                </span>
              ) : null}
              {openedAt ? <span>{openedAt}</span> : null}
            </div>
          </div>
        </div>

        {showStatus && status ? <TradeStatusBadge status={status} size="xs" /> : null}
      </div>

      {showPnL && (profit !== undefined || profitPercent !== undefined) ? (
        <div className="mt-3">
          <PnLIndicator
            value={profit}
            percent={profitPercent}
            size="md"
            align="left"
          />
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Entry
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {entryPrice !== undefined && entryPrice !== null ? entryPrice : '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            Current
          </p>
          <p className="mt-0.5 text-sm font-semibold text-slate-900">
            {currentPrice !== undefined && currentPrice !== null ? currentPrice : '—'}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
            {stopLoss ? 'SL' : takeProfit ? 'TP' : 'R:R'}
          </p>
          <p
            className={[
              'mt-0.5 text-sm font-semibold',
              stopLoss ? 'text-rose-600' : takeProfit ? 'text-emerald-600' : 'text-slate-900',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {stopLoss || takeProfit || '—'}
          </p>
        </div>
      </div>

      {provider ? (
        <div className="mt-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          Provider: <strong className="font-medium text-slate-700">{provider}</strong>
          {isPositive ? (
            <span className="ml-2 text-emerald-600">· winning</span>
          ) : (
            <span className="ml-2 text-rose-600">· losing</span>
          )}
        </div>
      ) : null}

      {actions ? <div className="mt-3 border-t border-slate-100 pt-3">{actions}</div> : null}
    </Card>
  );
});

TradeCard.propTypes = {
  trade: PropTypes.shape({
    symbol: PropTypes.string,
    direction: PropTypes.string,
    volume: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    entryPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    currentPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    stopLoss: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    takeProfit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    profit: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    profitPercent: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    openedAt: PropTypes.string,
    duration: PropTypes.string,
    provider: PropTypes.string,
  }),
  onClick: PropTypes.func,
  compact: PropTypes.bool,
  showSymbol: PropTypes.bool,
  showStatus: PropTypes.bool,
  showPnL: PropTypes.bool,
  showVolume: PropTypes.bool,
  actions: PropTypes.node,
  className: PropTypes.string,
  testId: PropTypes.string,
};

export default TradeCard;