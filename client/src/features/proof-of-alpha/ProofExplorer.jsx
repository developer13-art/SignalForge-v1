import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, ExternalLink } from 'lucide-react';

import ProofSearchBar from './ProofSearchBar';
import ProofDetails from './ProofDetails';
import VerifiedOnChainBadge from '../../components/domain/solana/VerifiedOnChainBadge';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import { listPublicProofs } from '../../api/proof-of-alpha.api';

const PAGE_SIZE = 20;

export default function ProofExplorer() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listPublicProofs({ page, pageSize: PAGE_SIZE });
      setItems(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load proofs');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Database size={20} className="text-slate-700" />
          <h1 className="text-xl font-semibold text-slate-900">Proof Explorer</h1>
        </div>
        <p className="text-sm text-slate-500">
          Every proof recorded by SignalForge is anchored on the Solana Memo program. Anyone can
          verify.
        </p>
      </div>

      <ProofSearchBar onSearch={async (value) => {
        if (!value) {
          load();
          return;
        }
        setLoading(true);
        setError(null);
        try {
          setSelected(null);
          const result = await listPublicProofs({ page: 1, pageSize: PAGE_SIZE });
          const filtered = (result.items || []).filter((item) => {
            const haystack = [
              item.signature,
              item.provider_id,
              item.trade_id,
              item.memo_payload?.s,
            ]
              .filter(Boolean)
              .join(' ')
              .toLowerCase();
            return haystack.includes(value.toLowerCase());
          });
          setItems(filtered);
          setTotal(filtered.length);
          setPage(1);
        } catch (err) {
          setError(err?.response?.data?.message || err?.message || 'Failed to search');
        } finally {
          setLoading(false);
        }
      }} />

      {loading ? (
        <LoadingState variant="skeleton" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="No proofs found" description="No proofs matched your query." />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Signature
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Provider
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Trade
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    PnL
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="max-w-[200px] truncate px-4 py-2 font-mono text-xs text-slate-700">
                      {item.signature || 'pending'}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-700">{item.provider_id}</td>
                    <td className="px-4 py-2 text-xs text-slate-500">
                      {item.memo_payload?.s || '—'}
                      {item.memo_payload?.d ? ` · ${item.memo_payload.d}` : ''}
                    </td>
                    <td className="px-4 py-2 text-sm font-medium text-slate-800">
                      {Number(item.memo_payload?.r || 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2">
                      <VerifiedOnChainBadge
                        level={
                          item.status === 'confirmed'
                            ? 'on_chain_confirmed'
                            : item.status === 'failed'
                            ? 'broken'
                            : 'partial'
                        }
                        size="sm"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => setSelected(item)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800"
                      >
                        Details
                        <ExternalLink size={10} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 ? (
            <div className="flex justify-center pt-2">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          ) : null}
        </>
      )}

      {selected ? (
        <ProofDetails proof={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}