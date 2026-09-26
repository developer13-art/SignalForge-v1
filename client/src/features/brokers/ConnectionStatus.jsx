import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import BrokerConnectionStatus from '../../components/domain/broker/BrokerConnectionStatus';

const ConnectionStatus = function ConnectionStatus() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/brokers/accounts/${accountId}/status`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setStatus(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <Heading level={1} size="text-2xl">
            Connection Status
          </Heading>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
        </div>

        <Separator spacing="md" />

        {loading && !status ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : status ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Connection</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Updated {status.updatedAt || 'just now'}
                </p>
              </div>
              <BrokerConnectionStatus status={status.connection} size="md" />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Deployment</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Cloud terminal deployment on MetaApi
                </p>
              </div>
              <BrokerConnectionStatus status={status.deployment} size="md" />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Synchronization</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Account, positions, and orders
                </p>
              </div>
              <BrokerConnectionStatus status={status.synchronization} size="md" />
            </div>

            <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">Latency</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Round trip signal-to-broker average
                </p>
              </div>
              <span className="text-sm font-bold text-slate-900">
                {status.latency || '—'} ms
              </span>
            </div>
          </div>
        ) : null}
      </Card>
    </Container>
  );
};

export default ConnectionStatus;