import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  RefreshCw,
  Loader2,
  ArrowRight,
  Users,
  Wallet,
  Link2,
  History,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const IbDashboard = function IbDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ib/dashboard', { credentials: 'include' });
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
    { title: 'Broker Referral Links', icon: Link2, href: '/ib/links' },
    { title: 'IB Referrals', icon: Users, href: '/ib/referrals' },
    { title: 'IB Revenue', icon: Wallet, href: '/ib/revenue' },
    { title: 'Commission History', icon: History, href: '/ib/commissions' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Briefcase size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Introducing Broker Dashboard
            </Heading>
            <Text color="muted" className="text-xs">
              Track broker referrals and IB revenue
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
          label="Active"
          value={data?.activeReferrals || 0}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Total Revenue"
          value={data?.totalRevenue !== undefined ? `$${data.totalRevenue}` : '—'}
          icon={Wallet}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="This Month"
          value={data?.monthlyRevenue !== undefined ? `$${data.monthlyRevenue}` : '—'}
          icon={Wallet}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          IB Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
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

      {data?.recentReferrals && data.recentReferrals.length > 0 ? (
        <Card padding="lg" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <Heading level={3} size="text-base">
              Recent IB Referrals
            </Heading>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/ib/referrals')}
              trailingIcon={ArrowRight}
            >
              View all
            </Button>
          </div>

          <ul className="mt-4 space-y-2">
            {data.recentReferrals.slice(0, 5).map((referral) => (
              <li
                key={referral.id}
                className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    {referral.accountName}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {referral.broker} · {referral.joinedAt}
                  </p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">
                  ${referral.revenue || 0}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </Container>
  );
};

export default IbDashboard;