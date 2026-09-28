import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';

import CryptoOrderCard from '../../components/domain/crypto/CryptoOrderCard';
import CryptoOrderDetails from './CryptoOrderDetails';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { listCryptoOrders, cancelCryptoOrder } from '../../api/crypto-trading.api';

const STATUSES = ['open', 'filled', 'cancelled', 'failed', 'all'];

export default function CryptoOrders() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('open');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listCryptoOrders({ status: status === 'all' ? undefined : status });
      setItems(result.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => items, [items]);

  const handleCancel = useCallback(
    async (order) => {
      try {
        await cancelCryptoOrder(order.id);
        load();
      } catch (_error) {
        // Errors are surfaced via the API layer toast.
      }
    },
    [load],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Crypto Orders</h1>
          <p className="text-sm text-slate-500">All orders submitted across DEX and perp gateways.</p>
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

      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-3">
        {STATUSES.map((entry) => (
          <button
            key={entry}
            type="button"
            onClick={() => setStatus(entry)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              status === entry
                ? 'bg-indigo-100 text-indigo-700'
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {entry.charAt(0).toUpperCase() + entry.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState variant="skeleton-cards" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No orders"
          description="Orders will appear here once submitted through a gateway."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((order) => (
            <CryptoOrderCard
              key={order.id}
              order={order}
              onCancel={handleCancel}
              onDetails={setSelected}
            />
          ))}
        </div>
      )}

      {selected ? (
        <CryptoOrderDetails order={selected} onClose={() => setSelected(null)} onRefresh={load} />
      ) : null}
    </div>
  );
}