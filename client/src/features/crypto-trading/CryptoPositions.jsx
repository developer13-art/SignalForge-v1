import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';

import CryptoPositionCard from '../../components/domain/crypto/CryptoPositionCard';
import CryptoPositionDetails from './CryptoPositionDetails';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoadingState from '../../components/common/LoadingState';
import { listCryptoPositions, closeCryptoPosition } from '../../api/crypto-trading.api';

const STATUS_FILTERS = [
  { key: 'open', label: 'Open' },
  { key: 'closed', label: 'Closed' },
  { key: 'all', label: 'All' },
];

export default function CryptoPositions() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('open');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listCryptoPositions({
        status: status === 'all' ? undefined : status,
      });
      setItems(result.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load positions');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (!search) {
      return items;
    }
    const term = search.toUpperCase();
    return items.filter((position) => (position.symbol || '').toUpperCase().includes(term));
  }, [items, search]);

  const handleClose = useCallback(
    async (position) => {
      try {
        await closeCryptoPosition(position.id);
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
          <h1 className="text-xl font-semibold text-slate-900">Crypto Positions</h1>
          <p className="text-sm text-slate-500">Live and historical positions across gateways.</p>
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

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by symbol"
            className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatus(filter.key)}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                status === filter.key
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <LoadingState variant="skeleton-cards" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No positions match the current filters"
          description="Try changing the status filter or the search term."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((position) => (
            <CryptoPositionCard
              key={position.id}
              position={position}
              onClose={handleClose}
              onDetails={setSelected}
            />
          ))}
        </div>
      )}

      {selected ? (
        <CryptoPositionDetails
          position={selected}
          onClose={() => setSelected(null)}
          onRefresh={load}
        />
      ) : null}
    </div>
  );
}