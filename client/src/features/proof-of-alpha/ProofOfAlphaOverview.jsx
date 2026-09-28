import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Activity, Database, TrendingUp, RefreshCw } from 'lucide-react';

import LoadingState from '../../components/common/LoadingState';
import ErrorState from '../../components/common/ErrorState';
import VerifiedOnChainBadge from '../../components/domain/solana/VerifiedOnChainBadge';
import ProofStatsWidget from './ProofStatsWidget';
import { getLeaderboard } from '../../api/proof-of-alpha.api';

const WINDOWS = [
  { key: 'day', label: 'Today' },
  { key: 'week', label: '7 days' },
  { key: 'month', label: '30 days' },
  { key: 'year', label: '1 year' },
  { key: 'all', label: 'All time' },
];

export default function ProofOfAlphaOverview() {
  const [window, setWindow] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getLeaderboard({ window, sortBy: 'total_pnl', limit: 10 });
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  }, [window]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary || {};
  const cache = data?.cache || {};

  const topRows = useMemo(() => data?.rows || [], [data]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            <h1 className="text-xl font-semibold text-slate-900">Proof of Alpha</h1>
            <VerifiedOnChainBadge level="on_chain_confirmed" compact />
          </div>
          <p className="text-sm text-slate-500">
            Every closed provider trade is anchored on-chain, so performance is verifiable by
            anyone.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={window}
            onChange={(event) => setWindow(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
          >
            {WINDOWS.map((entry) => (
              <option key={entry.key} value={entry.key}>
                {entry.label}
              </option>
            ))}
          </select>

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
      </div>

      {loading ? (
        <LoadingState label="Loading on-chain data" />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <ShieldCheck size={12} />
                Providers
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {summary.totalProviders || 0}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {summary.verifiedProviders || 0} verified on-chain
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <TrendingUp size={12} />
                Total PnL
              </div>
              <p className="mt-2 text-2xl font-semibold text-emerald-600">
                {Number(summary.totalPnlUsd || 0).toLocaleString(undefined, {
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="mt-1 text-xs text-slate-400">Cumulative verified trades</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Activity size={12} />
                Avg. Win Rate
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {Number(summary.averageWinRate || 0).toFixed(2)}%
              </p>
              <p className="mt-1 text-xs text-slate-400">Across all listed providers</p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500">
                <Database size={12} />
                Cache
              </div>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {cache.fresh ? 'Fresh' : 'Stale'}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {cache.lastRefreshedAt
                  ? `Refreshed ${new Date(cache.lastRefreshedAt).toLocaleTimeString()}`
                  : 'Not yet refreshed'}
              </p>
            </div>
          </div>

          <ProofStatsWidget />

          <section className="rounded-lg border border-slate-200 bg-white">
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-600" />
                <h2 className="text-sm font-semibold text-slate-900">Top verified providers</h2>
              </div>
              <Link
                to="/proof-of-alpha/leaderboard"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                View full leaderboard
              </Link>
            </header>

            {topRows.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                No verified providers in this window yet
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {topRows.map((row) => (
                  <div
                    key={row.providerId}
                    className="flex items-center justify-between gap-4 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {row.rank}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {row.providerName || row.providerId}
                        </p>
                        <p className="text-xs text-slate-500">
                          {row.totalTrades} trades · {row.winRate}% win rate
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <VerifiedOnChainBadge
                        level={row.verificationLevel || 'unverified'}
                        size="sm"
                      />
                      <span className="text-sm font-semibold text-emerald-600">
                        {Number(row.totalPnlUsd || 0).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}