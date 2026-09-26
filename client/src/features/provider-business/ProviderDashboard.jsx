import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  RefreshCw,
  Loader2,
  Users,
  TrendingUp,
  Wallet,
  Activity,
  ArrowRight,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const ProviderDashboard = function ProviderDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/dashboard', {
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
    { title: 'Profile Management', icon: Award, href: '/provider/profile' },
    { title: 'Subscribers', icon: Users, href: '/provider/subscribers' },
    { title: 'Revenue', icon: Wallet, href: '/provider/revenue' },
    { title: 'Analytics', icon: TrendingUp, href: '/provider/analytics' },
    { title: 'Signals', icon: Activity, href: '/provider/signals' },
    { title: 'Provider DNA', icon: Award, href: '/provider/dna' },
    { title: 'Certification', icon: Award, href: '/provider/certification' },
    { title: 'Subscription Plans', icon: Wallet, href: '/provider/plans' },
    { title: 'Withdrawals', icon: Wallet, href: '/provider/withdrawals' },
    { title: 'IB Management', icon: Users, href: '/provider/ib' },
    { title: 'Affiliate Management', icon: Users, href: '/provider/affiliate' },
    { title: 'Marketing Tools', icon: TrendingUp, href: '/provider/marketing' },
    { title: 'Promotions', icon: TrendingUp, href: '/provider/promotions' },
    { title: 'Reviews', icon: Award, href: '/provider/reviews' },
    { title: 'Settings', icon: Award, href: '/provider/settings' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Award size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Dashboard
            </Heading>
            <Text color="muted" className="text-xs">
              Overview of your provider business performance
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
          label="Active Subscribers"
          value={data?.activeSubscribers || 0}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Monthly Revenue"
          value={data?.monthlyRevenue !== undefined ? `$${data.monthlyRevenue}` : '—'}
          icon={Wallet}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Signals Sent"
          value={data?.signalsSent || 0}
          icon={Activity}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Win Rate"
          value={data?.winRate !== undefined ? `${data.winRate}%` : '—'}
          icon={TrendingUp}
          variant="success"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Quick Links
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

export default ProviderDashboard;