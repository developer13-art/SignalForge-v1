import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import CircularProgress from '../../components/common/CircularProgress';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';

const ConsistencyScore = function ConsistencyScore() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-certification/consistency', {
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

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Consistency Score
            </Heading>
            <Text color="muted" className="text-xs">
              How consistent your historical signals have been
            </Text>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between gap-6">
              <CircularProgress
                value={data?.overallScore || 0}
                max={100}
                size="xl"
                color={
                  data?.overallScore >= 80
                    ? 'success'
                    : data?.overallScore >= 60
                    ? 'primary'
                    : data?.overallScore >= 40
                    ? 'warning'
                    : 'danger'
                }
                showValue
                thickness={8}
              />
              <div className="flex-1">
                <p className="text-sm text-slate-600">
                  {data?.summary || 'Consistency is evaluated across multiple dimensions.'}
                </p>
              </div>
            </div>

            <Separator spacing="md" />

            <Heading level={3} size="text-base">
              Consistency Factors
            </Heading>

            <div className="mt-3 space-y-4">
              {(data?.factors || []).map((factor) => (
                <div key={factor.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{factor.label}</span>
                    <span className="font-semibold text-slate-900">{factor.value}%</span>
                  </div>
                  <ProgressBar
                    value={factor.value}
                    max={100}
                    size="sm"
                    variant={
                      factor.value >= 80
                        ? 'success'
                        : factor.value >= 60
                        ? 'primary'
                        : factor.value >= 40
                        ? 'warning'
                        : 'danger'
                    }
                    className="mt-1.5"
                  />
                  {factor.description ? (
                    <p className="mt-1 text-[11px] text-slate-500">{factor.description}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default ConsistencyScore;