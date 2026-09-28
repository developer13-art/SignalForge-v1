import React from 'react';
import PropTypes from 'prop-types';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import TradeProofBadge from '../../components/domain/trade/TradeProofBadge';
import MemoTransactionLink from '../../components/domain/solana/MemoTransactionLink';

export default function TradeProofCard({ trade, onOpenProof }) {
  if (!trade) {
    return null;
  }

  const pnl = Number(trade.realized_profit || trade.pnl_percent || 0);
  const direction = trade.direction || trade.memo_payload?.d || 'BUY';

  const DirectionIcon =
    direction === 'BUY' ? ArrowUpRight : direction === 'SELL' ? ArrowDownRight : Minus;

  const directionColor =
    direction === 'BUY'
      ? 'text-emerald-600 bg-emerald-50'
      : direction === 'SELL'
      ? 'text-rose-600 bg-rose-50'
      : 'text-slate-500 bg-slate-100';

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span
            className={[
              'inline-flex h-9 w-9 items-center justify-center rounded-full',
              directionColor,
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <DirectionIcon size={16} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">{trade.symbol}</p>
            <p className="text-xs text-slate-500">
              {direction} · {trade.volume || 0} lots
            </p>
          </div>
        </div>

        <TradeProofBadge
          verificationLevel={trade.verification_level}
          hasProof={Boolean(trade.signature)}
          broken={trade.verification_broken}
          signature={trade.signature}
          onOpenProof={onOpenProof}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <Cell label="Entry" value={format(trade.entry_price)} />
        <Cell label="Exit" value={format(trade.exit_price)} />
        <Cell label="SL" value={format(trade.stop_loss)} />
        <Cell label="TP" value={format(trade.take_profit)} />
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Realized</p>
          <p
            className={[
              'text-sm font-semibold',
              pnl > 0 ? 'text-emerald-600' : pnl < 0 ? 'text-rose-600' : 'text-slate-700',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {pnl > 0 ? '+' : ''}
            {pnl.toFixed(2)}
          </p>
        </div>

        {trade.signature ? <MemoTransactionLink signature={trade.signature} truncate /> : null}
      </div>
    </div>
  );
}

function Cell({ label, value }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="text-sm text-slate-700">{value}</p>
    </div>
  );
}

function format(value) {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  return String(value);
}

TradeProofCard.propTypes = {
  trade: PropTypes.shape({
    symbol: PropTypes.string,
    direction: PropTypes.string,
    volume: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    entry_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    exit_price: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    stop_loss: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    take_profit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    realized_profit: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    pnl_percent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    verification_level: PropTypes.string,
    verification_broken: PropTypes.bool,
    signature: PropTypes.string,
  }),
  onOpenProof: PropTypes.func,
};