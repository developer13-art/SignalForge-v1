import React, { useState } from 'react';
import { X, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import DexBadge from '../../components/domain/crypto/DexBadge';
import MemoTransactionLink from '../../components/domain/solana/MemoTransactionLink';

export default function CryptoPositionDetails({ position, onClose, onRefresh }) {
  const [closing, setClosing] = useState(false);

  if (!position) {
    return null;
  }

  const pnl = Number(position.unrealizedPnl || 0);
  const pnlPositive = pnl >= 0;
  const PnlIcon = pnlPositive ? TrendingUp : TrendingDown;

  const handleClose = async () => {
    if (!onRefresh) {
      return;
    }
    setClosing(true);
    try {
      await onRefresh();
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">{position.symbol}</h2>
              <DexBadge gateway={position.gateway} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              {position.side} · {position.size} · {position.leverage || '1'}x
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </header>

        <div className="space-y-4 px-6 py-4">
          <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">Unrealized PnL</p>
              <p
                className={[
                  'mt-1 inline-flex items-center gap-1 text-xl font-semibold',
                  pnlPositive ? 'text-emerald-600' : 'text-rose-600',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <PnlIcon size={16} />
                {pnl.toFixed(4)}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-slate-500">Notional</p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {(
                  Number(position.markPrice || position.entryPrice || 0) * Number(position.size || 0)
                ).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Detail label="Entry Price" value={position.entryPrice} />
            <Detail label="Mark Price" value={position.markPrice} />
            <Detail label="Liquidation Price" value={position.liquidationPrice || '—'} />
            <Detail label="Margin Used" value={position.marginUsed || '—'} />
            <Detail label="Status" value={position.status} />
            <Detail label="Opened At" value={position.openedAt ? new Date(position.openedAt).toLocaleString() : '—'} />
          </div>

          {position.signature ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Signature</p>
              <div className="mt-1">
                <MemoTransactionLink signature={position.signature} showCopy />
              </div>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3">
          {position.signature ? (
            <a
              href={`https://explorer.solana.com/tx/${position.signature}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
            >
              Open in Explorer
              <ExternalLink size={10} />
            </a>
          ) : null}

          <button
            type="button"
            onClick={handleClose}
            disabled={closing}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
          >
            {closing ? 'Refreshing...' : 'Refresh'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-800">{value ?? '—'}</p>
    </div>
  );
}