import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SignalRiskAnalysisComp from '../../components/domain/signal/SignalRiskAnalysis';

const SignalRiskAnalysis = function SignalRiskAnalysis() {
  const { signalId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchRisk = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/signals/${signalId}/risk`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [signalId]);

  useEffect(() => {
    fetchRisk();
  }, [fetchRisk]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="md" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <div className="mt-4">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : (
          <SignalRiskAnalysisComp
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

export default SignalRiskAnalysis;