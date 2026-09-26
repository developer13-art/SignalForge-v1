import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft, Loader2, RefreshCw, Settings2, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EnvironmentBadge from '../../components/domain/broker/EnvironmentBadge';
import BrokerConnectionStatus from '../../components/domain/broker/BrokerConnectionStatus';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const BrokerSettings = function BrokerSettings() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

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
  }, [fetchAccounts]);

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/brokers/accounts/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchAccounts();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchAccounts]);

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAccounts}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/brokers/connect')}>
            Add Broker
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Server size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Broker Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your connected broker accounts
            </Text>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={Server}
              title="No broker accounts"
              description="Connect your first broker account to start automating signals."
              action={
                <Button variant="primary" onClick={() => navigate('/brokers/connect')}>
                  Connect Broker
                </Button>
              }
            />
          ) : (
            accounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <Server size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {account.nickname || account.broker}
                      </p>
                      <EnvironmentBadge environment={account.accountType} size="xs" />
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {account.broker} · {account.platform} · {account.login}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <BrokerConnectionStatus status={account.status} size="xs" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/brokers/accounts/${account.id}`)}
                    leadingIcon={Settings2}
                  >
                    Manage
                  </Button>
                  <button
                    type="button"
                    onClick={() => setRemoving(account)}
                    aria-label="Remove"
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        variant="danger"
        title="Disconnect broker account"
        description={
          removing
            ? `Are you sure you want to disconnect ${removing.nickname || removing.broker}? Automated trading on this account will stop.`
            : ''
        }
        confirmLabel="Disconnect"
      />
    </Container>
  );
};

export default BrokerSettings;