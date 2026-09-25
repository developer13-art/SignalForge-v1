import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, Loader2, ArrowRight } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import AccountSummary from './AccountSummary';
import PortfolioOverview from './PortfolioOverview';
import LiveTradingStatus from './LiveTradingStatus';
import ActiveSignalsWidget from './ActiveSignalsWidget';
import OpenTradesWidget from './OpenTradesWidget';
import RecentTradesWidget from './RecentTradesWidget';
import ProfitLossWidget from './ProfitLossWidget';
import RiskOverviewWidget from './RiskOverviewWidget';
import AccountHealthWidget from './AccountHealthWidget';
import KycStatusWidget from './KycStatusWidget';
import SubscriptionStatusWidget from './SubscriptionStatusWidget';
import ReferralSummaryWidget from './ReferralSummaryWidget';

const DashboardOverview = function DashboardOverview() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/dashboard/overview', {
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load dashboard data');
        return;
      }

      setData(payload.data);
    } catch (_err) {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  if (loading && !data) {
    return (
      <Container size="xl" className="py-8">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 size={32} className="animate-spin" aria-hidden="true" />
            <p className="text-sm font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Heading level={1} size="text-2xl">
            Dashboard
          </Heading>
          <Text color="muted" className="mt-1">
            Real-time overview of your trading account, signals, and performance.
          </Text>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchDashboard}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {error ? (
        <Card padding="lg" className="mt-4 border-rose-200 bg-rose-50">
          <p className="text-sm font-medium text-rose-800">{error}</p>
        </Card>
      ) : null}

      <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <KycStatusWidget kyc={data?.kyc} />
          <SubscriptionStatusWidget subscription={data?.subscription} onManage={() => navigate('/subscriptions')} />
          <ReferralSummaryWidget referral={data?.referral} onViewMore={() => navigate('/referrals')} />
        </div>

        <AccountSummary account={data?.account} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <PortfolioOverview portfolio={data?.portfolio} />
          <LiveTradingStatus status={data?.liveTrading} onConfigure={() => navigate('/risk')} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ActiveSignalsWidget signals={data?.activeSignals} onViewAll={() => navigate('/signals')} />
          <OpenTradesWidget trades={data?.openTrades} onViewAll={() => navigate('/trading/open-positions')} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ProfitLossWidget performance={data?.performance} onViewAnalytics={() => navigate('/analytics')} />
          <RiskOverviewWidget risk={data?.risk} onConfigure={() => navigate('/risk')} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <RecentTradesWidget trades={data?.recentTrades} onViewAll={() => navigate('/trading/history')} />
          <AccountHealthWidget health={data?.accountHealth} />
        </div>

        <Card padding="lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <Heading level={3} size="text-base">
                Quick actions
              </Heading>
              <Text color="muted" className="mt-1 text-xs">
                Jump straight to what you need.
              </Text>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Add Signal Source', href: '/sources/add' },
              { label: 'Connect Broker', href: '/brokers/connect' },
              { label: 'View Signals', href: '/signals' },
              { label: 'Open Marketplace', href: '/providers' },
            ].map((action) => (
              <Button
                key={action.label}
                variant="outline"
                onClick={() => navigate(action.href)}
                trailingIcon={ArrowRight}
                className="justify-between"
              >
                {action.label}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default DashboardOverview;