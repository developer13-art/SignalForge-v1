import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Loader2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProviderCertificationBadge from '../../components/domain/provider/ProviderCertificationBadge';

const CertificationResult = function CertificationResult() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-certification/result', {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = useCallback(() => navigate('/provider/certification'), [navigate]);

  const isApproved = data?.status === 'approved' || data?.status === 'certified';

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
        ) : (
          <Card padding="lg" className="text-center">
            <div
              className={[
                'mx-auto flex h-20 w-20 items-center justify-center rounded-full',
                isApproved ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isApproved ? (
                <CheckCircle2 size={40} aria-hidden="true" />
              ) : (
                <XCircle size={40} aria-hidden="true" />
              )}
            </div>

            <Heading level={1} className="mt-6">
              {isApproved ? 'Certification Approved' : 'Certification Pending'}
            </Heading>

            {data?.level ? (
              <div className="mt-4">
                <ProviderCertificationBadge level={data.level} size="lg" />
              </div>
            ) : null}

            <Text color="muted" className="mt-4 mx-auto max-w-lg">
              {data?.message ||
                (isApproved
                  ? 'Your provider profile is now certified and can display the verified badge.'
                  : 'Your certification is being evaluated. You will be notified when complete.')}
            </Text>

            {data?.score !== undefined ? (
              <>
                <Separator spacing="md" />
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Quality Score
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{data.score}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Parse Accuracy
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {data.parseAccuracy}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Consistency
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {data.consistency}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Risk Score
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{data.riskScore}</p>
                  </div>
                </div>
              </>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/provider/certification/history')}
              >
                View History
              </Button>
              <Button variant="primary" onClick={handleBack}>
                Back to Dashboard
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default CertificationResult;