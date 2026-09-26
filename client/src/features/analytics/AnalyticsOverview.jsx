import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  RefreshCw,
  Loader2,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
  Clock,
  Activity,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const AnalyticsOverview = function AnalyticsOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/overview', { credentials: 'include' });
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
    { title: 'Performance Dashboard', icon: BarChart3, href: '/analytics/performance' },
    { title: 'Equity Curve', icon: TrendingUp, href: '/analytics/equity' },
    { title: 'Profit Analysis', icon: TrendingUp, href: '/analytics/profit' },
    { title: 'Drawdown Analysis', icon: TrendingDown, href: '/analytics/drawdown' },
    { title: 'Win Rate', icon: Target, href: '/analytics/win-rate' },
    { title: 'Risk/Reward Analysis', icon: Percent, href: '/analytics/risk-reward' },
    { title: 'Sharpe Ratio', icon: Activity, href: '/analytics/sharpe' },
    { title: 'Sortino Ratio', icon: Activity, href: '/analytics/sortino' },
    { title: 'Best Symbols', icon: TrendingUp, href: '/analytics/best-symbols' },
    { title: 'Worst Symbols', icon: TrendingDown, href: '/analytics/worst-symbols' },
    { title: 'Execution Latency', icon: Clock, href: '/analytics/latency' },
    { title: 'Risk Behavior', icon: Activity, href: '/analytics/risk-behavior' },
    { title: 'Trading Calendar', icon: BarChart3, href: '/analytics/calendar' },
    { title: 'Reports', icon: BarChart3, href: '/analytics/reports' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Analytics and Performance
            </Heading>
            <Text color="muted" className="text-xs">
              Real-time metrics computed from your trades and executions
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
          label="Total Profit"
          value={data?.totalProfit !== undefined ? `$${data.totalProfit}` : '—'}
          icon={TrendingUp}
          variant={Number(data?.totalProfit) >= 0 ? 'success' : 'danger'}
          loading={loading}
        />
        <StatCard
          label="Win Rate"
          value={data?.winRate !== undefined ? `${data.winRate}%` : '—'}
          icon={Target}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Profit Factor"
          value={data?.profitFactor !== undefined ? data.profitFactor : '—'}
          icon={Percent}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Max Drawdown"
          value={data?.maxDrawdown !== undefined ? `${data.maxDrawdown}%` : '—'}
          icon={TrendingDown}
          variant="warning"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Analytics Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-700">{link.title}</span>
                </div>
                <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default AnalyticsOverview;