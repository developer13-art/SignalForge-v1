import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Loader2, RefreshCw, ArrowRight } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ProviderCertificationBadge from '../../components/domain/provider/ProviderCertificationBadge';
import ProgressBar from '../../components/common/ProgressBar';

const ProviderCertificationManagement = function ProviderCertificationManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/certification', {
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

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/provider/certification/apply')}
          >
            Apply for Certification
          </Button>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Award size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Certification
            </Heading>
            <Text color="muted" className="text-xs">
              Build verifiable reputation on SignalForge
            </Text>
          </div>
        </div>

        {loading ? (
          <Card padding="lg" className="mt-6">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : (
          <>
            <Card padding="lg" className="mt-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Current Certification</p>
                  <div className="mt-2">
                    {data?.level ? (
                      <ProviderCertificationBadge level={data.level} size="md" />
                    ) : (
                      <Text color="muted" className="text-sm">
                        No certification yet
                      </Text>
                    )}
                  </div>
                </div>
                {data?.score !== undefined ? (
                  <div className="text-right">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Quality Score
                    </p>
                    <p className="text-3xl font-bold text-indigo-600">{data.score}</p>
                  </div>
                ) : null}
              </div>

              {data?.metrics ? (
                <div className="mt-6 space-y-4">
                  {Object.entries(data.metrics).map(([key, metric]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium capitalize text-slate-600">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="font-semibold text-slate-900">{metric}%</span>
                      </div>
                      <ProgressBar
                        value={metric}
                        max={100}
                        size="sm"
                        variant={
                          metric >= 80 ? 'success' : metric >= 60 ? 'warning' : 'danger'
                        }
                        className="mt-1.5"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </Card>

            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => navigate('/provider/certification/history')}
                trailingIcon={ArrowRight}
              >
                View Certification History
              </Button>
            </div>
          </>
        )}
      </div>
    </Container>
  );
};

export default ProviderCertificationManagement;