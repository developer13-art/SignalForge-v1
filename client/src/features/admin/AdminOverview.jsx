import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  RefreshCw,
  Loader2,
  Users,
  Radio,
  Server,
  TrendingUp,
  Shield,
  Activity,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import SystemHealthPanel from '../../components/domain/admin/SystemHealthPanel';
import { get } from '../../api/client.js';

const HEALTH_COMPONENT_LABELS = {
  database: 'Database',
  jobs: 'Background jobs',
  telegram: 'Telegram',
  brokers: 'Broker connections',
  withdrawals: 'Withdrawals',
  solana: 'Solana indexer',
};

function normalizeSystemHealth(health) {
  const entries = Array.isArray(health?.components)
    ? health.components.map((component) => [component.key, component])
    : Object.entries(health?.components || {});

  return {
    overallStatus: health?.status?.toLowerCase() === 'degraded' ? 'degraded' : 'healthy',
    components: entries.map(([key, details]) => {
      const metrics = Object.entries(details || {})
        .filter(([, value]) => typeof value === 'number')
        .map(([name, value]) => `${name}: ${value}`);

      return {
        key,
        label: HEALTH_COMPONENT_LABELS[key] || key,
        status: details?.healthy === false ? 'degraded' : 'healthy',
        description: details?.error || metrics.join(' · '),
      };
    }),
  };
}

const AdminOverview = function AdminOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, healthRes] = await Promise.all([
        get('/admin/overview'),
        get('/admin/system/health'),
      ]);

      setData(statsRes.data?.overview);
      setHealth(normalizeSystemHealth(healthRes.data?.health));
    } catch (requestError) {
      setError(requestError.message || 'Unable to load admin overview.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
            <LayoutDashboard size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Admin Overview
            </Heading>
            <Text color="muted" className="text-xs">
              Platform-wide metrics, monitoring, and system health
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {error ? (
        <div role="alert" className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={data?.users?.total_users ?? '—'}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active Providers"
          value={data?.providers?.active_providers ?? '—'}
          icon={Users}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Signals (30d)"
          value={data?.signals?.recent_signals ?? '—'}
          icon={Radio}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Open Trades"
          value={data?.trades?.open ?? '—'}
          icon={TrendingUp}
          variant="default"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="New Users (30d)"
          value={data?.users?.new_users ?? '—'}
          icon={Shield}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Verified KYC"
          value={data?.users?.kyc_verified ?? '—'}
          icon={Server}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Realized Profit"
          value={
            data?.trades?.totalRealizedProfit !== undefined
              ? `$${Number(data.trades.totalRealizedProfit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'
          }
          icon={TrendingUp}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Revenue (30d)"
          value={
            data?.revenue?.total !== undefined
              ? `$${Number(data.revenue.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'
          }
          icon={Activity}
          variant="success"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SystemHealthPanel
          components={health?.components || []}
          overallStatus={health?.overallStatus}
          uptime={health?.uptime}
          lastIncident={health?.lastIncident}
        />

        <Card padding="lg">
          <Heading level={3} size="text-base">
            Quick Actions
          </Heading>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Manage Users', href: '/admin/users', icon: Users },
              { label: 'KYC Queue', href: '/admin/kyc', icon: Shield },
              { label: 'Providers', href: '/admin/providers', icon: Users },
              { label: 'Live Trades', href: '/admin/trades', icon: TrendingUp },
              { label: 'Signals Monitor', href: '/admin/signals', icon: Radio },
              { label: 'Brokers', href: '/admin/brokers', icon: Server },
              { label: 'Audit Logs', href: '/admin/audit-logs', icon: Shield },
              { label: 'System Settings', href: '/admin/settings', icon: LayoutDashboard },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => navigate(action.href)}
                  className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-700">{action.label}</span>
                </button>
              );
            })}
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default AdminOverview;