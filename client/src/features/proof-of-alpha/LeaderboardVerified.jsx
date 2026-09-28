import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Trophy, Filter, RefreshCw } from 'lucide-react';

import VerifiedOnChainBadge from '../../components/domain/solana/VerifiedOnChainBadge';
import Pagination from '../../components/common/Pagination';
import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import { getLeaderboard } from '../../api/proof-of-alpha.api';

const WINDOWS = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: '7 days' },
  { key: 'month', label: '30 days' },
  { key: 'quarter', label: '90 days' },
  { key: 'year', label: '1 year' },
  { key: 'all', label: 'All time' },
];

const SORTS = [
  { key: 'total_pnl', label: 'Total PnL' },
  { key: 'win_rate', label: 'Win Rate' },
  { key: 'profit_factor', label: 'Profit Factor' },
  { key: 'average_rr', label: 'Average RR' },
  { key: 'consistency', label: 'Consistency' },
  { key: 'sharpe', label: 'Sharpe Ratio' },
  { key: 'verified_trades', label: 'Verified Trades' },
];

const PAGE_SIZE = 25;

export default function LeaderboardVerified() {
  const [window, setWindow] = useState('month');
  const [sortBy, setSortBy] = useState('total_pnl');
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeaderboard({
        window,
        sortBy,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
        verifiedOnly,
      });
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, [window, sortBy, verifiedOnly, page]);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(() => data?.rows || [], [data]);
  const total = data?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-amber-500" />
            <h1 className="text-xl font-semibold text-slate-900">Verified Leaderboard</h1>
          </div>
          <p className="text-sm text-slate-500">
            Rankings based on on-chain confirmed trades only. Updated every few minutes.
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

      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Filters
          </span>
        </div>

        <select
          value={window}
          onChange={(event) => {
            setPage(1);
            setWindow(event.target.value);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          {WINDOWS.map((entry) => (
            <option key={entry.key} value={entry.key}>
              {entry.label}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) => {
            setPage(1);
            setSortBy(event.target.value);
          }}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700"
        >
          {SORTS.map((entry) => (
            <option key={entry.key} value={entry.key}>
              {entry.label}
            </option>
          ))}
        </select>

        <label className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(event) => {
              setPage(1);
              setVerifiedOnly(event.target.checked);
            }}
            className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Verified only
        </label>
      </div>

      {loading ? (
        <LoadingState variant="skeleton" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No providers in this ranking"
          description="Try a wider window or disable the verified-only filter."
        />
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Rank
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                    Provider
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    Trades
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    Win Rate
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    PnL
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    PF
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide text-slate-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.providerId} className="hover:bg-slate-50">
                    <td className="px-4 py-2 text-sm font-semibold text-slate-700">
                      #{row.rank}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-sm font-medium text-slate-900">
                        {row.providerName || row.providerId}
                      </p>
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-slate-700">
                      {row.totalTrades}
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-slate-700">
                      {Number(row.winRate || 0).toFixed(2)}%
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-emerald-600">
                      {Number(row.totalPnlUsd || 0).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-4 py-2 text-right text-sm text-slate-700">
                      {Number(row.profitFactor || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <VerifiedOnChainBadge
                        level={row.verificationLevel || 'unverified'}
                        size="sm"
                      />
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
    </div>
  );
}