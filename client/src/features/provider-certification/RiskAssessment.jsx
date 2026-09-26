import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import RiskAnalysisWidget from '../../components/domain/analytics/RiskAnalysisWidget';
import ErrorState from '../../components/common/ErrorState';

const RiskAssessment = function RiskAssessment() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/provider-certification/risk', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load risk assessment');
        return;
      }
      setData(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => navigate('/provider/certification'), [navigate]);

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
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk Assessment
            </Heading>
            <Text color="muted" className="text-xs">
              Evaluate the risk profile of your historical signals
            </Text>
          </div>
        </div>

        <div className="mt-6">
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
            <RiskAnalysisWidget
              riskScore={data?.riskScore || 0}
              riskLevel={data?.riskLevel}
              metrics={data?.metrics || []}
              flags={data?.flags || []}
            />
          )}
        </div>
      </div>
    </Container>
  );
};

export default RiskAssessment;