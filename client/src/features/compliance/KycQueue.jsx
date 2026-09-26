import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import KycQueueTable from '../../components/domain/admin/KycQueueTable';

const KycQueue = function KycQueue() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/kyc-queue', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setApplications(payload.data?.items || []);
        setData(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              KYC Queue
            </Heading>
            <Text color="muted" className="text-xs">
              All pending, in-progress, and completed KYC applications
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchQueue}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total in Queue"
          value={data?.total || 0}
          icon={Clock}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Waiting > 24h"
          value={data?.waitingOver24h || 0}
          icon={Clock}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Reviewed Today"
          value={data?.reviewedToday || 0}
          icon={Clock}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Avg Wait"
          value={data?.avgWait || '—'}
          icon={Clock}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <KycQueueTable
          applications={applications}
          loading={loading}
          onRowClick={(row) => navigate(`/compliance/kyc/${row.id}`)}
          onReview={(row) => navigate(`/compliance/kyc/${row.id}`)}
          selectable
        />
      </Card>
    </Container>
  );
};

export default KycQueue;