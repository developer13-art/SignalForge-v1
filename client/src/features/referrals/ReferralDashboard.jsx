import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Gift,
  RefreshCw,
  Loader2,
  Users,
  TrendingUp,
  Wallet,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ReferralLinkCard from '../../components/domain/referral/ReferralLinkCard';
import ReferralStatsCard from '../../components/domain/referral/ReferralStatsCard';

const ReferralDashboard = function ReferralDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/referrals/dashboard', { credentials: 'include' });
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
    { title: 'Referral Network', icon: Users, href: '/referrals/network' },
    { title: 'Referred Users', icon: Users, href: '/referrals/users' },
    { title: 'Earnings', icon: TrendingUp, href: '/referrals/earnings' },
    { title: 'Pending Rewards', icon: Clock, href: '/referrals/pending' },
    { title: 'Available Rewards', icon: Wallet, href: '/referrals/available' },
    { title: 'Wallet', icon: Wallet, href: '/referrals/wallet' },
    { title: 'Reward History', icon: TrendingUp, href: '/referrals/history' },
    { title: 'Monthly Settlement', icon: Clock, href: '/referrals/settlements' },
    { title: 'Leaderboard', icon: TrendingUp, href: '/referrals/leaderboard' },
    { title: 'Terms', icon: Gift, href: '/referrals/terms' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Gift size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Referral Program
            </Heading>
            <Text color="muted" className="text-xs">
              Earn rewards based on the trading performance of users you refer
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
          label="Total Referrals"
          value={data?.totalReferrals || 0}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active Referrals"
          value={data?.activeReferrals || 0}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Available Rewards"
          value={data?.availableRewards !== undefined ? `$${data.availableRewards}` : '—'}
          icon={Wallet}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Lifetime Earned"
          value={data?.lifetimeEarned !== undefined ? `$${data.lifetimeEarned}` : '—'}
          icon={TrendingUp}
          variant="info"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ReferralLinkCard
          referralCode={data?.referralCode}
          referralLink={data?.referralLink}
        />

        <ReferralStatsCard
          stats={{
            totalReferrals: data?.totalReferrals,
            activeReferrals: data?.activeReferrals,
            monthlyPerformance: data?.monthlyPerformance,
            pendingRewards: data?.pendingRewards,
            availableRewards: data?.availableRewards,
            lifetimeEarned: data?.lifetimeEarned,
          }}
          columns={2}
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Referral Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-violet-400 hover:bg-violet-50"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0 text-violet-600" aria-hidden="true" />
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

export default ReferralDashboard;