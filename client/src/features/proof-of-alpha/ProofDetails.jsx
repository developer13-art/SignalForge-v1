import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { X, ExternalLink, ShieldCheck } from 'lucide-react';
import MemoTransactionLink from '../../components/domain/solana/MemoTransactionLink';
import VerifiedOnChainBadge from '../../components/domain/solana/VerifiedOnChainBadge';

const FIELDS = [
  { key: 'id', label: 'Proof ID' },
  { key: 'provider_id', label: 'Provider' },
  { key: 'trade_id', label: 'Trade' },
  { key: 'kind', label: 'Kind' },
  { key: 'status', label: 'Status' },
  { key: 'memo_version', label: 'Memo Version' },
  { key: 'block_slot', label: 'Block Slot' },
  { key: 'confirmed_at', label: 'Confirmed At' },
  { key: 'submitted_at', label: 'Submitted At' },
];

export default function ProofDetails({ proof, onClose }) {
  const memoPayload = useMemo(() => {
    if (!proof || !proof.memo_payload) {
      return null;
    }
    return typeof proof.memo_payload === 'string'
      ? safeParse(proof.memo_payload)
      : proof.memo_payload;
  }, [proof]);

  if (!proof) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-600" />
              <h2 className="text-base font-semibold text-slate-900">Proof Details</h2>
              <VerifiedOnChainBadge
                level={proof.status === 'confirmed' ? 'on_chain_confirmed' : 'partial'}
                size="sm"
              />
            </div>
            {proof.signature ? (
              <MemoTransactionLink signature={proof.signature} showCopy showIcon />
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </header>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {FIELDS.map(({ key, label }) => (
              <div key={key} className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
                <p className="text-sm text-slate-800">
                  {formatValue(proof[key])}
                </p>
              </div>
            ))}
          </div>

          {memoPayload ? (
            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-500">On-chain Payload</p>
              </div>
              <pre className="max-h-72 overflow-auto rounded-md bg-slate-900 p-4 font-mono text-[11px] leading-relaxed text-slate-100">
                {JSON.stringify(memoPayload, null, 2)}
              </pre>
            </div>
          ) : null}

          {proof.error_message ? (
            <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">
                Error
              </p>
              <p className="mt-1 text-sm text-rose-800">{proof.error_message}</p>
            </div>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3">
          {proof.signature ? (
            <a
              href={`https://explorer.solana.com/tx/${proof.signature}`}
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

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch (_error) {
    return null;
  }
}

function formatValue(value) {
  if (value === undefined || value === null || value === '') {
    return '—';
  }
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return String(value);
}

ProofDetails.propTypes = {
  proof: PropTypes.object,
  onClose: PropTypes.func,
};