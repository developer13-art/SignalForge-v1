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

const AdminOverview = function AdminOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, healthRes] = await Promise.all([
        fetch('/api/admin/overview', { credentials: 'include' }),
        fetch('/api/admin/system-health', { credentials: 'include' }),
      ]);

      const statsPayload = await statsRes.json();
      const healthPayload = await healthRes.json();

      if (statsRes.ok) {
        setData(statsPayload.data);
      }
      if (healthRes.ok) {
        setHealth(healthPayload.data);
      }
    } catch (_err) {
      // silent
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

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={data?.totalUsers || 0}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active Providers"
          value={data?.activeProviders || 0}
          icon={Users}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Signals Today"
          value={data?.signalsToday || 0}
          icon={Radio}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Trades Today"
          value={data?.tradesToday || 0}
          icon={TrendingUp}
          variant="default"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pending KYC"
          value={data?.pendingKyc || 0}
          icon={Shield}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Active Broker Accounts"
          value={data?.activeBrokerAccounts || 0}
          icon={Server}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Monthly Revenue"
          value={data?.monthlyRevenue !== undefined ? `$${data.monthlyRevenue}` : '—'}
          icon={TrendingUp}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Open Incidents"
          value={data?.openIncidents || 0}
          icon={Activity}
          variant={data?.openIncidents > 0 ? 'danger' : 'success'}
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