import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export default function CryptoPnLWidget({ positions = [], orders = [] }) {
  const summary = useMemo(() => {
    const unrealized = positions.reduce(
      (sum, position) => sum + Number(position.unrealizedPnl || 0),
      0,
    );
    const realized = positions.reduce(
      (sum, position) => sum + Number(position.realizedPnl || 0),
      0,
    );
    const total = unrealized + realized;

    const winning = positions.filter((position) => Number(position.unrealizedPnl || 0) > 0).length;
    const losing = positions.filter((position) => Number(position.unrealizedPnl || 0) < 0).length;

    return {
      unrealized,
      realized,
      total,
      winning,
      losing,
      openOrders: orders.length,
    };
  }, [positions, orders]);

  const TotalIcon = summary.total >= 0 ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">PnL Summary</h2>
        <Activity size={14} className="text-slate-400" />
      </header>

      <div className="flex items-center justify-between rounded-md bg-slate-50 px-4 py-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Total PnL</p>
          <p
            className={[
              'mt-1 inline-flex items-center gap-1 text-xl font-semibold',
              summary.total >= 0 ? 'text-emerald-600' : 'text-rose-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <TotalIcon size={16} />
            {summary.total.toFixed(4)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Tile label="Unrealized" value={summary.unrealized.toFixed(4)} />
        <Tile label="Realized" value={summary.realized.toFixed(4)} />
        <Tile label="Winning" value={summary.winning} tone="emerald" />
        <Tile label="Losing" value={summary.losing} tone="rose" />
      </div>
    </div>
  );
}

function Tile({ label, value, tone }) {
  const colorClass =
    tone === 'emerald'
      ? 'text-emerald-600'
      : tone === 'rose'
      ? 'text-rose-600'
      : 'text-slate-800';

  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${colorClass}`}>{value}</p>
    </div>
  );
}