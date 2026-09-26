import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Server, ArrowLeft, RefreshCw, Loader2, Activity, Layers, Zap } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Badge from '../../components/common/Badge';
import EnvironmentBadge from '../../components/domain/broker/EnvironmentBadge';
import BrokerConnectionStatus from '../../components/domain/broker/BrokerConnectionStatus';

const AccountDetails = function AccountDetails() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAccount = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/brokers/accounts/${accountId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setAccount(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchAccount();
    const interval = setInterval(fetchAccount, 15000);
    return () => clearInterval(interval);
  }, [fetchAccount]);

  const handleBack = useCallback(() => navigate('/brokers/accounts'), [navigate]);

  const handleSync = useCallback(async () => {
    try {
      await fetch(`/api/brokers/accounts/${accountId}/sync`, {
        method: 'POST',
        credentials: 'include',
      });
      fetchAccount();
    } catch (_err) {
      // silent
    }
  }, [accountId, fetchAccount]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAccount}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      {loading && !account ? (
        <Card padding="lg" className="mt-4">
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        </Card>
      ) : account ? (
        <>
          <Card padding="lg" className="mt-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Server size={22} aria-hidden="true" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Heading level={1} size="text-2xl">
                      {account.nickname || account.broker}
                    </Heading>
                    <EnvironmentBadge environment={account.accountType} size="sm" />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {account.broker} · {account.platform} · {account.login}
                  </p>
                  <div className="mt-2">
                    <BrokerConnectionStatus status={account.status || 'connected'} size="sm" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleSync} leadingIcon={RefreshCw}>
                  Sync Now
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/brokers/accounts/${accountId}/disconnect`)}
                >
                  Disconnect
                </Button>
              </div>
            </div>

            <Separator spacing="md" />

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Balance
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {account.currency} {account.balance}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Equity
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {account.currency} {account.equity}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Margin
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {account.currency} {account.margin}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Free Margin
                </p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {account.currency} {account.freeMargin}
                </p>
              </div>
            </div>
          </Card>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card padding="lg">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-600" aria-hidden="true" />
                <Heading level={3} size="text-base">
                  Account Health
                </Heading>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Connection Quality</span>
                  <Badge variant="success" size="xs">
                    {account.connectionQuality || 'Excellent'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Last Sync</span>
                  <span className="font-medium text-slate-800">
                    {account.lastSync || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Server Time</span>
                  <span className="font-medium text-slate-800">
                    {account.serverTime || '—'}
                  </span>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-indigo-600" aria-hidden="true" />
                <Heading level={3} size="text-base">
                  Positions
                </Heading>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Open Positions</span>
                  <span className="font-semibold text-slate-900">
                    {account.openPositions || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Pending Orders</span>
                  <span className="font-semibold text-slate-900">
                    {account.pendingOrders || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Floating P/L</span>
                  <span
                    className={[
                      'font-semibold',
                      Number(account.floatingProfit) >= 0
                        ? 'text-emerald-600'
                        : 'text-rose-600',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {account.currency} {account.floatingProfit || 0}
                  </span>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-indigo-600" aria-hidden="true" />
                <Heading level={3} size="text-base">
                  Automation
                </Heading>
              </div>
              <div className="mt-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Automation Status</span>
                  <Badge variant={account.automationEnabled ? 'success' : 'neutral'} size="xs">
                    {account.automationEnabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Followed Providers</span>
                  <span className="font-semibold text-slate-900">
                    {account.followedProviders || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Risk Profile</span>
                  <span className="font-medium text-slate-800">
                    {account.riskProfile || 'Default'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </>
      ) : null}
    </Container>
  );
};

export default AccountDetails;