import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  RefreshCw,
  Loader2,
  ArrowRight,
  DollarSign,
  Users,
  BarChart3,
  Award,
  Wallet,
  Gift,
  Activity,
  Target,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import RevenueOverview from '../../components/domain/admin/RevenueOverview';

const ExecutiveDashboard = function ExecutiveDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/dashboard', {
        credentials: 'include',
      });
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
    { title: 'Subscription Revenue', icon: DollarSign, href: '/executive/revenue/subscriptions' },
    { title: 'Marketplace Revenue', icon: DollarSign, href: '/executive/revenue/marketplace' },
    { title: 'Provider Revenue', icon: Award, href: '/executive/revenue/providers' },
    { title: 'Affiliate Revenue', icon: Users, href: '/executive/revenue/affiliate' },
    { title: 'IB Revenue', icon: Users, href: '/executive/revenue/ib' },
    { title: 'Referral Cost', icon: Gift, href: '/executive/referral-cost' },
    { title: 'Net Revenue', icon: Wallet, href: '/executive/net-revenue' },
    { title: 'User Growth', icon: TrendingUp, href: '/executive/growth/users' },
    { title: 'Provider Growth', icon: Award, href: '/executive/growth/providers' },
    { title: 'Trader Growth', icon: Users, href: '/executive/growth/traders' },
    { title: 'Trading Volume', icon: Activity, href: '/executive/trading-volume' },
    { title: 'Platform Performance', icon: BarChart3, href: '/executive/platform-performance' },
    { title: 'Retention', icon: Target, href: '/executive/retention' },
    { title: 'Conversion', icon: Target, href: '/executive/conversion' },
    { title: 'Financial Reports', icon: BarChart3, href: '/executive/financial-reports' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-900 text-white">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Executive Dashboard
            </Heading>
            <Text color="muted" className="text-xs">
              Platform-wide revenue, growth, and performance insights
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
          label="Net Revenue (MTD)"
          value={data?.netRevenue !== undefined ? `$${data.netRevenue}` : '—'}
          icon={DollarSign}
          variant="success"
          loading={loading}
        />
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
          icon={Award}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Monthly Growth"
          value={data?.growthPercent !== undefined ? `${data.growthPercent}%` : '—'}
          icon={TrendingUp}
          variant={data?.growthPercent >= 0 ? 'success' : 'danger'}
          loading={loading}
        />
      </div>

      <div className="mt-6">
        <RevenueOverview
          subscriptionRevenue={data?.subscriptionRevenue}
          marketplaceRevenue={data?.marketplaceRevenue}
          providerRevenue={data?.providerRevenue}
          affiliateRevenue={data?.affiliateRevenue}
          referralCost={data?.referralCost}
          netRevenue={data?.netRevenue}
          growthPercent={data?.growthPercent}
          sparklineData={data?.revenueTrend}
          currency="USD"
          period="30d"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Executive Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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

export default ExecutiveDashboard;