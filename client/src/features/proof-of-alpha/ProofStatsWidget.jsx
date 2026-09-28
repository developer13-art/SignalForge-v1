import React, { useEffect, useMemo, useState } from 'react';
import { Activity, CheckCircle2, Clock, XCircle } from 'lucide-react';
import LoadingState from '../../components/common/LoadingState';
import { getLeaderboardSummary } from '../../api/proof-of-alpha.api';

const WINDOWS = ['day', 'week', 'month'];

export default function ProofStatsWidget() {
  const [window, setWindow] = useState('month');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await getLeaderboardSummary({ window });
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err?.response?.data?.message || err?.message || 'Failed to load stats');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [window]);

  const stats = useMemo(() => data?.summary || {}, [data]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-slate-500" />
          <h2 className="text-sm font-semibold text-slate-900">On-chain statistics</h2>
        </div>

        <div className="flex items-center gap-1">
          {WINDOWS.map((entry) => (
            <button
              key={entry}
              type="button"
              onClick={() => setWindow(entry)}
              className={[
                'rounded-md px-3 py-1 text-xs font-medium transition-colors',
                window === entry
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {entry.charAt(0).toUpperCase() + entry.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <LoadingState size="sm" label="Loading" />
      ) : error ? (
        <p className="px-4 py-6 text-sm text-rose-600">{error}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 px-4 py-4 md:grid-cols-3">
          <Stat
            icon={CheckCircle2}
            iconClass="text-emerald-500"
            label="Verified providers"
            value={stats.verifiedProviders || 0}
          />
          <Stat
            icon={Clock}
            iconClass="text-sky-500"
            label="Average win rate"
            value={`${Number(stats.averageWinRate || 0).toFixed(2)}%`}
          />
          <Stat
            icon={XCircle}
            iconClass="text-amber-500"
            label="Average profit factor"
            value={Number(stats.averageProfitFactor || 0).toFixed(2)}
          />
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, iconClass, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={[
          'inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100',
          iconClass,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <Icon size={18} aria-hidden="true" />
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className="text-lg font-semibold text-slate-900">{value}</p>
      </div>
    </div>
  );
}