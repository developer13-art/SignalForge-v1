import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  RefreshCw,
} from 'lucide-react';

import CryptoPositionCard from '../../components/domain/crypto/CryptoPositionCard';
import CryptoOrderCard from '../../components/domain/crypto/CryptoOrderCard';
import DexBadge from '../../components/domain/crypto/DexBadge';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import { listCryptoPositions, listCryptoOrders } from '../../api/crypto-trading.api';

export default function CryptoTradingOverview() {
  const [positions, setPositions] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [positionsResult, ordersResult] = await Promise.all([
        listCryptoPositions({ status: 'open' }),
        listCryptoOrders({ status: 'open' }),
      ]);
      setPositions(positionsResult.items || []);
      setOrders(ordersResult.items || []);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load crypto trading data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => {
    const totalUnrealized = positions.reduce(
      (sum, position) => sum + Number(position.unrealizedPnl || 0),
      0,
    );
    const notional = positions.reduce(
      (sum, position) =>
        sum + Number(position.markPrice || position.entryPrice || 0) * Number(position.size || 0),
      0,
    );
    const byGateway = positions.reduce((acc, position) => {
      const key = position.gateway || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    return {
      positionCount: positions.length,
      openOrderCount: orders.length,
      totalUnrealized,
      notional,
      byGateway,
    };
  }, [positions, orders]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-slate-700" />
            <h1 className="text-xl font-semibold text-slate-900">Crypto Trading</h1>
          </div>
          <p className="text-sm text-slate-500">
            Executed through Solana DEX aggregators and perpetuals venues.
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Stat
          icon={Wallet}
          iconClass="text-indigo-600"
          label="Open Positions"
          value={summary.positionCount}
        />
        <Stat
          icon={Zap}
          iconClass="text-amber-600"
          label="Open Orders"
          value={summary.openOrderCount}
        />
        <Stat
          icon={summary.totalUnrealized >= 0 ? TrendingUp : TrendingDown}
          iconClass={summary.totalUnrealized >= 0 ? 'text-emerald-600' : 'text-rose-600'}
          label="Unrealized PnL"
          value={summary.totalUnrealized.toFixed(2)}
        />
        <Stat
          icon={Activity}
          iconClass="text-sky-600"
          label="Notional"
          value={summary.notional.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        />
      </div>

      {Object.keys(summary.byGateway).length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Positions by gateway
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(summary.byGateway).map(([gateway, count]) => (
              <span
                key={gateway}
                className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700"
              >
                <DexBadge gateway={gateway} size="sm" showType={false} />
                <span className="font-semibold">{count}</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState description={error} onRetry={load} />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Open positions</h2>
              <Link
                to="/crypto-trading/positions"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                View all
              </Link>
            </header>

            {positions.length === 0 ? (
              <EmptyState
                title="No open positions"
                description="Crypto positions will appear here once trades are executed."
                size="sm"
              />
            ) : (
              <div className="space-y-3">
                {positions.slice(0, 5).map((position) => (
                  <CryptoPositionCard key={position.id} position={position} showActions={false} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Open orders</h2>
              <Link
                to="/crypto-trading/orders"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                View all
              </Link>
            </header>

            {orders.length === 0 ? (
              <EmptyState
                title="No open orders"
                description="Pending and partially filled orders will appear here."
                size="sm"
              />
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <CryptoOrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, iconClass, label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span
          className={[
            'inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-100',
            iconClass,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Icon size={16} aria-hidden="true" />
        </span>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}