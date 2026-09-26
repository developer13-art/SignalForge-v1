import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  RefreshCw,
  Loader2,
  ArrowRight,
  Wallet,
  TrendingUp,
  Link2,
  DollarSign,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const AffiliateDashboard = function AffiliateDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/affiliate/dashboard', { credentials: 'include' });
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
    { title: 'Affiliate Links', icon: Link2, href: '/affiliate/links' },
    { title: 'Referrals', icon: Users, href: '/affiliate/referrals' },
    { title: 'Commissions', icon: Wallet, href: '/affiliate/commissions' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Affiliate Dashboard
            </Heading>
            <Text color="muted" className="text-xs">
              Track your affiliate referrals and commissions
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
          label="Total Commissions"
          value={data?.totalCommissions !== undefined ? `$${data.totalCommissions}` : '—'}
          icon={DollarSign}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Pending Commissions"
          value={data?.pendingCommissions !== undefined ? `$${data.pendingCommissions}` : '—'}
          icon={Wallet}
          variant="warning"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Affiliate Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="text-sm font-medium text-slate-700">{link.title}</span>
                </div>
                <ArrowRight size={14} className="text-slate-300" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Card>

      {data?.recentActivity && data.recentActivity.length > 0 ? (
        <Card padding="lg" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <Heading level={3} size="text-base">
              Recent Activity
            </Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/affiliate/commissions')}
              trailingIcon={ArrowRight}
            >
              View all
            </Button>
          </div>

          <ul className="mt-4 space-y-2">
            {data.recentActivity.slice(0, 5).map((activity) => (
              <li
                key={activity.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{activity.description}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">{activity.time}</p>
                </div>
                <span
                  className={[
                    'text-sm font-semibold',
                    Number(activity.amount) >= 0 ? 'text-emerald-600' : 'text-rose-600',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {Number(activity.amount) >= 0 ? '+' : ''}${activity.amount}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </Container>
  );
};

export default AffiliateDashboard;