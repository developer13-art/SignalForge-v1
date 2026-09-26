import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import KycQueueTable from '../../components/domain/admin/KycQueueTable';

const UnderReview = function UnderReview() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUnderReview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/kyc-queue?status=under_review', {
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
    fetchUnderReview();
  }, [fetchUnderReview]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <AlertTriangle size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Under Review
            </Heading>
            <Text color="muted" className="text-xs">
              Applications currently being reviewed by compliance officers
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchUnderReview}
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

export default UnderReview;