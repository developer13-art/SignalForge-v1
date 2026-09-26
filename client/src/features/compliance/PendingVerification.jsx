import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import KycQueueTable from '../../components/domain/admin/KycQueueTable';

const PendingVerification = function PendingVerification() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/kyc-queue?status=pending', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setApplications(payload.data?.items || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Pending Verification
            </Heading>
            <Text color="muted" className="text-xs">
              Applications waiting to be reviewed
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPending}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <KycQueueTable
          applications={applications}
          loading={loading}
          onRowClick={(row) => navigate(`/compliance/kyc/${row.id}`)}
          onReview={(row) => navigate(`/compliance/kyc/${row.id}`)}
        />
      </Card>
    </Container>
  );
};

export default PendingVerification;