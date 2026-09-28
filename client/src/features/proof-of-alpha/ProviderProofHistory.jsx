import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, RefreshCw } from 'lucide-react';

import ProofTimeline from './ProofTimeline';
import VerifiedOnChainBadge from '../../components/domain/solana/VerifiedOnChainBadge';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import Pagination from '../../components/common/Pagination';
import { listProviderProofs, getProviderVerification } from '../../api/proof-of-alpha.api';

const PAGE_SIZE = 15;

export default function ProviderProofHistory() {
  const { providerId } = useParams();

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!providerId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [proofs, verificationData] = await Promise.all([
        listProviderProofs(providerId, { page, pageSize: PAGE_SIZE }),
        getProviderVerification(providerId),
      ]);
      setItems(proofs.items || []);
      setTotal(proofs.total || 0);
      setVerification(verificationData);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load provider proofs');
    } finally {
      setLoading(false);
    }
  }, [providerId, page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <FileText size={20} className="text-slate-700" />
            <h1 className="text-xl font-semibold text-slate-900">Provider Proof History</h1>
            {verification ? (
              <VerifiedOnChainBadge
                level={verification.verificationLevel || 'unverified'}
                size="sm"
              />
            ) : null}
          </div>
          <p className="text-sm text-slate-500">
            On-chain record for provider <span className="font-mono">{providerId}</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {verification ? (
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-4">
          <Stat label="Checked Proofs" value={verification.checkedProofs || 0} />
          <Stat label="Verified" value={verification.verifiedProofs || 0} tone="emerald" />
          <Stat label="Broken" value={verification.brokenProofs || 0} tone="rose" />
          <Stat
            label="Last Verified"
            value={
              verification.lastVerifiedAt
                ? new Date(verification.lastVerifiedAt).toLocaleString()
                : '—'
            }
          />
        </div>
      ) : null}

      {loading ? (
        <LoadingState variant="skeleton" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState
          title="No proofs yet"
          description="This provider has no on-chain proofs in the selected window."
        />
      ) : (
        <>
          <ProofTimeline items={items} />
          {totalPages > 1 ? (
            <div className="flex justify-center pt-2">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }) {
  const colorClass =
    tone === 'emerald'
      ? 'text-emerald-600'
      : tone === 'rose'
      ? 'text-rose-600'
      : 'text-slate-900';

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}