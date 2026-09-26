import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import BrokerLogoutDialog from '../../components/domain/broker/BrokerLogoutDialog';

const DisconnectBroker = function DisconnectBroker() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

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
  }, [fetchAccount]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleDisconnect = useCallback(async () => {
    setDisconnecting(true);
    try {
      await fetch(`/api/brokers/accounts/${accountId}/disconnect`, {
        method: 'POST',
        credentials: 'include',
      });
      navigate('/brokers/accounts', { replace: true });
    } catch (_err) {
      // silent
    } finally {
      setDisconnecting(false);
    }
  }, [accountId, navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <Heading level={1} size="text-2xl">
          Disconnect Broker Account
        </Heading>
        <Text color="muted" className="mt-2">
          Disconnecting will stop automated trading on this account immediately. Your existing
          positions on the broker side will remain open and must be managed manually.
        </Text>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : account ? (
          <>
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-slate-900">
                {account.nickname || account.broker}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {account.broker} · {account.platform} · {account.login}
              </p>
            </div>

            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-amber-900">
                <AlertTriangle size={14} aria-hidden="true" />
                Before you disconnect
              </p>
              <ul className="mt-2 space-y-1 text-xs text-amber-800">
                <li>· All automated trading for this account will stop immediately.</li>
                <li>· Open positions will NOT be closed automatically.</li>
                <li>· Subscription following this account remains active for other accounts.</li>
                <li>· You can reconnect at any time.</li>
              </ul>
            </div>

            <div className="mt-8 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => setConfirmOpen(true)}
                disabled={disconnecting}
              >
                Disconnect Account
              </Button>
            </div>
          </>
        ) : null}
      </Card>

      <BrokerLogoutDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDisconnect}
        account={account}
        loading={disconnecting}
      />
    </Container>
  );
};

export default DisconnectBroker;