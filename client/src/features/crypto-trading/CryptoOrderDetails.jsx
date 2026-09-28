import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import DexBadge from '../../components/domain/crypto/DexBadge';
import MemoTransactionLink from '../../components/domain/solana/MemoTransactionLink';

export default function CryptoOrderDetails({ order, onClose }) {
  if (!order) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">{order.symbol}</h2>
              <DexBadge gateway={order.gateway} size="sm" />
            </div>
            <p className="text-xs text-slate-500">
              {String(order.side).toUpperCase()} · {order.orderType || order.order_type || 'market'}
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
          <div className="grid grid-cols-2 gap-4">
            <Detail label="Size" value={order.size} />
            <Detail label="Price" value={order.price || '—'} />
            <Detail label="Leverage" value={order.leverage ? `${order.leverage}x` : '—'} />
            <Detail
              label="Reduce Only"
              value={order.reduceOnly || order.reduce_only ? 'Yes' : 'No'}
            />
            <Detail label="Status" value={order.status} />
            <Detail
              label="Submitted"
              value={order.submittedAt ? new Date(order.submittedAt).toLocaleString() : '—'}
            />
          </div>

          {order.signature ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-500">Signature</p>
              <div className="mt-1">
                <MemoTransactionLink signature={order.signature} showCopy />
              </div>
            </div>
          ) : null}

          {order.errorMessage ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Error</p>
              <p className="mt-1 text-sm text-rose-800">{order.errorMessage}</p>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3">
          {order.signature ? (
            <a
              href={`https://explorer.solana.com/tx/${order.signature}`}
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
            onClick={onClose}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
          >
            Close
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