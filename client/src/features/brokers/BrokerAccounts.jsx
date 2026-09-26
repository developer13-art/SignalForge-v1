import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Plus, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import BrokerAccountCard from '../../components/domain/broker/BrokerAccountCard';

const BrokerAccounts = function BrokerAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/brokers/accounts', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setAccounts(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
    const interval = setInterval(fetchAccounts, 30000);
    return () => clearInterval(interval);
  }, [fetchAccounts]);

  const handleRefresh = useCallback(
    async (account) => {
      try {
        await fetch(`/api/brokers/accounts/${account.id}/sync`, {
          method: 'POST',
          credentials: 'include',
        });
        fetchAccounts();
      } catch (_err) {
        // silent
      }
    },
    [fetchAccounts],
  );

  const handleConfigure = useCallback(
    (account) => {
      navigate(`/brokers/accounts/${account.id}`);
    },
    [navigate],
  );

  const handleDisconnect = useCallback(
    (account) => {
      navigate(`/brokers/accounts/${account.id}/disconnect`);
    },
    [navigate],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Server size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Broker Accounts
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your connected MT4 and MT5 accounts
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAccounts}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button variant="primary" onClick={() => navigate('/brokers/connect')} leadingIcon={Plus}>
            Connect Account
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {loading && accounts.length === 0 ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : accounts.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Server}
              title="No broker accounts connected"
              description="Connect your first MT4 or MT5 account to start automating signals."
              action={
                <Button
                  variant="primary"
                  onClick={() => navigate('/brokers/connect')}
                  leadingIcon={Plus}
                >
                  Connect Broker Account
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <BrokerAccountCard
                key={account.id}
                account={account}
                onRefresh={() => handleRefresh(account)}
                onConfigure={() => handleConfigure(account)}
                onDisconnect={() => handleDisconnect(account)}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default BrokerAccounts;