import React from 'react';
import PropTypes from 'prop-types';
import { CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import MemoTransactionLink from '../../components/domain/solana/MemoTransactionLink';

const KIND_LABELS = {
  trade_closed: 'Trade Closed',
  provider_certified: 'Provider Certified',
  provider_milestone: 'Milestone',
  performance_period: 'Performance Period',
};

function resolveIcon(status) {
  if (status === 'confirmed') {
    return { Icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' };
  }
  if (status === 'failed' || status === 'expired') {
    return { Icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-100' };
  }
  if (status === 'submitted') {
    return { Icon: ShieldCheck, color: 'text-sky-600', bg: 'bg-sky-100' };
  }
  return { Icon: Clock, color: 'text-slate-500', bg: 'bg-slate-100' };
}

export default function ProofTimeline({ items }) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => {
        const { Icon, color, bg } = resolveIcon(item.status);
        const payload = item.memo_payload || {};
        const pnl = payload.r !== undefined ? Number(payload.r) : null;

        return (
          <li
            key={item.id}
            className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4"
          >
            <div
              className={[
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                bg,
                color,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Icon size={16} aria-hidden="true" />
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">
                    {KIND_LABELS[item.kind] || item.kind}
                  </span>
                  <span className="text-xs text-slate-400">
                    {item.confirmed_at
                      ? new Date(item.confirmed_at).toLocaleString()
                      : item.created_at
                      ? new Date(item.created_at).toLocaleString()
                      : ''}
                  </span>
                </div>

                {pnl !== null ? (
                  <span
                    className={[
                      'text-sm font-semibold',
                      pnl > 0 ? 'text-emerald-600' : pnl < 0 ? 'text-rose-600' : 'text-slate-600',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {pnl > 0 ? '+' : ''}
                    {pnl.toFixed(2)}%
                  </span>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                {payload.s ? <span>Symbol: {payload.s}</span> : null}
                {payload.d ? <span>Direction: {payload.d}</span> : null}
                {payload.t ? <span>Trade: {payload.t}</span> : null}
              </div>

              {item.signature ? (
                <MemoTransactionLink signature={item.signature} showCopy />
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

ProofTimeline.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      kind: PropTypes.string,
      status: PropTypes.string,
      signature: PropTypes.string,
      created_at: PropTypes.string,
      confirmed_at: PropTypes.string,
      memo_payload: PropTypes.object,
    }),
  ),
};