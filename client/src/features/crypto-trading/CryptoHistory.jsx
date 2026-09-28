import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Download } from 'lucide-react';

import Pagination from '../../components/common/Pagination';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import MemoTransactionLink from '../../components/domain/solana/MemoTransactionLink';
import DexBadge from '../../components/domain/crypto/DexBadge';
import { listCryptoHistory } from '../../api/crypto-trading.api';

const PAGE_SIZE = 25;

export default function CryptoHistory() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listCryptoHistory({ page, pageSize: PAGE_SIZE });
      setItems(result.items || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Crypto History</h1>
          <p className="text-sm text-slate-500">Closed positions and settled swaps.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingState variant="skeleton" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState title="No history yet" description="Closed positions will appear here." />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <Th>Symbol</Th>
                  <Th>Side</Th>
                  <Th>Size</Th>
                  <Th>Entry</Th>
                  <Th>Exit</Th>
                  <Th>PnL</Th>
                  <Th>Gateway</Th>
                  <Th>Signature</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <Td className="font-medium text-slate-900">{entry.symbol}</Td>
                    <Td
                      className={
                        entry.side === 'LONG' ? 'text-emerald-600' : 'text-rose-600'
                      }
                    >
                      {entry.side}
                    </Td>
                    <Td>{entry.size}</Td>
                    <Td>{entry.entryPrice}</Td>
                    <Td>{entry.exitPrice}</Td>
                    <Td
                      className={
                        Number(entry.pnl) > 0
                          ? 'text-emerald-600'
                          : Number(entry.pnl) < 0
                          ? 'text-rose-600'
                          : 'text-slate-700'
                      }
                    >
                      {Number(entry.pnl || 0).toFixed(4)}
                    </Td>
                    <Td>
                      <DexBadge gateway={entry.gateway} size="sm" showType={false} />
                    </Td>
                    <Td>
                      {entry.signature ? (
                        <MemoTransactionLink signature={entry.signature} truncate />
                      ) : (
                        '—'
                      )}
                    </Td>
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
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function Td({ children, className }) {
  return (
    <td className={['px-4 py-2 text-sm text-slate-700', className].filter(Boolean).join(' ')}>
      {children}
    </td>
  );
}