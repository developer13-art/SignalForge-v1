import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import SignalRiskAnalysis from '../../components/domain/signal/SignalRiskAnalysis';
import ErrorState from '../../components/common/ErrorState';

const ProviderRiskAnalysis = function ProviderRiskAnalysis() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/marketplace/providers/${providerId}/risk`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load risk analysis');
        return;
      }
      setData(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
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

      <div className="mt-4">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <ErrorState title="Failed to load" description={error} onRetry={fetchData} />
          </Card>
        ) : (
          <SignalRiskAnalysis
            riskScore={data?.riskScore}
            riskLevel={data?.riskLevel}
            checks={data?.checks || []}
            warnings={data?.warnings || []}
            notes={data?.notes}
          />
        )}
      </div>
    </Container>
  );
};

export default ProviderRiskAnalysis;