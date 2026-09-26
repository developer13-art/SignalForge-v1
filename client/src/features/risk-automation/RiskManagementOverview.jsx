import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  RefreshCw,
  Loader2,
  ArrowRight,
  AlertTriangle,
  Activity,
  TrendingDown,
  Lock,
  Bell,
  Users,
  Layers,
  Zap,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ProgressBar from '../../components/common/ProgressBar';

const RiskManagementOverview = function RiskManagementOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/overview', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const quickLinks = [
    { title: 'Risk Profile', icon: Shield, href: '/risk/profile' },
    { title: 'Daily Loss Limits', icon: TrendingDown, href: '/risk/daily-loss' },
    { title: 'Drawdown Protection', icon: AlertTriangle, href: '/risk/drawdown' },
    { title: 'Trading Sessions', icon: Lock, href: '/risk/sessions' },
    { title: 'Trailing Stop', icon: Activity, href: '/risk/trailing-stop' },
    { title: 'Break Even', icon: Activity, href: '/risk/break-even' },
    { title: 'News Filter', icon: Bell, href: '/risk/news-filter' },
    { title: 'Emergency Stop', icon: AlertTriangle, href: '/risk/emergency-stop' },
    { title: 'Automation Rules', icon: Zap, href: '/risk/automation' },
    { title: 'Risk Events', icon: Activity, href: '/risk/events' },
  ];

  const dailyLossPercent = data?.dailyLossMax
    ? Math.min(100, (data.dailyLossUsed / data.dailyLossMax) * 100)
    : 0;

  const drawdownPercent = data?.drawdownMax
    ? Math.min(100, (data.drawdownUsed / data.drawdownMax) * 100)
    : 0;

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk and Automation
            </Heading>
            <Text color="muted" className="text-xs">
              Configure how the platform validates, protects, and executes your trades
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
          label="Daily Loss Used"
          value={
            data?.dailyLossUsed !== undefined
              ? `$${data.dailyLossUsed} / $${data.dailyLossMax || 0}`
              : '—'
          }
          icon={TrendingDown}
          variant={dailyLossPercent > 70 ? 'danger' : 'warning'}
          loading={loading}
        />
        <StatCard
          label="Max Drawdown"
          value={
            data?.drawdownUsed !== undefined
              ? `${data.drawdownUsed}% / ${data.drawdownMax || 0}%`
              : '—'
          }
          icon={AlertTriangle}
          variant={drawdownPercent > 70 ? 'danger' : 'warning'}
          loading={loading}
        />
        <StatCard
          label="Open Trades"
          value={
            data?.openTrades !== undefined
              ? `${data.openTrades} / ${data.maxOpenTrades || 0}`
              : '—'
          }
          icon={Layers}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Emergency Stop"
          value={data?.emergencyStop ? 'Active' : 'Ready'}
          icon={Shield}
          variant={data?.emergencyStop ? 'danger' : 'success'}
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <div className="flex items-center justify-between gap-3">
            <Heading level={3} size="text-base">
              Daily Loss Limit
            </Heading>
            <span className="text-xs font-medium text-slate-500">
              {Math.round(dailyLossPercent)}% used
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={dailyLossPercent}
              max={100}
              size="md"
              variant={dailyLossPercent > 70 ? 'danger' : dailyLossPercent > 40 ? 'warning' : 'success'}
            />
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between gap-3">
            <Heading level={3} size="text-base">
              Drawdown Protection
            </Heading>
            <span className="text-xs font-medium text-slate-500">
              {Math.round(drawdownPercent)}% used
            </span>
          </div>
          <div className="mt-3">
            <ProgressBar
              value={drawdownPercent}
              max={100}
              size="md"
              variant={drawdownPercent > 70 ? 'danger' : drawdownPercent > 40 ? 'warning' : 'success'}
            />
          </div>
        </Card>
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Quick Configuration
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                <span className="text-xs font-medium text-slate-700">{link.title}</span>
              </button>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default RiskManagementOverview;