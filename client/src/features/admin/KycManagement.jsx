import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import KycQueueTable from '../../components/domain/admin/KycQueueTable';

const KycManagement = function KycManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/kyc', { credentials: 'include' });
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
    fetchData();
  }, [fetchData]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              KYC Management
            </Heading>
            <Text color="muted" className="text-xs">
              Review and process identity verification applications
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
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Pending"
          value={data?.pending || 0}
          icon={Shield}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Under Review"
          value={data?.underReview || 0}
          icon={Shield}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Verified"
          value={data?.verified || 0}
          icon={Shield}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Rejected"
          value={data?.rejected || 0}
          icon={Shield}
          variant="danger"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          KYC Queue
        </Heading>

        <div className="mt-4">
          <KycQueueTable
            applications={applications}
            loading={loading}
            onRowClick={(row) => navigate(`/admin/kyc/${row.id}`)}
            onReview={(row) => navigate(`/admin/kyc/${row.id}`)}
            selectable
          />
        </div>
      </Card>
    </Container>
  );
};

export default KycManagement;