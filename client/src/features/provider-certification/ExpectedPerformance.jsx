import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ProgressBar from '../../components/common/ProgressBar';

const ExpectedPerformance = function ExpectedPerformance() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-certification/expected-performance', {
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

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Expected Performance
            </Heading>
            <Text color="muted" className="text-xs">
              Projected performance based on historical evaluation
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Projected Monthly"
            value={data?.projectedMonthly !== undefined ? `${data.projectedMonthly}%` : '—'}
            icon={TrendingUp}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Projected Win Rate"
            value={data?.projectedWinRate !== undefined ? `${data.projectedWinRate}%` : '—'}
            icon={TrendingUp}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Expected Drawdown"
            value={data?.expectedDrawdown !== undefined ? `${data.expectedDrawdown}%` : '—'}
            icon={TrendingUp}
            variant="warning"
            loading={loading}
          />
          <StatCard
            label="Confidence"
            value={data?.confidence !== undefined ? `${data.confidence}%` : '—'}
            icon={TrendingUp}
            variant="info"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Performance Breakdown
          </Heading>

          <div className="mt-4 space-y-4">
            {(data?.metrics || []).map((metric) => (
              <div key={metric.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{metric.label}</span>
                  <span className="font-semibold text-slate-900">{metric.value}</span>
                </div>
                {metric.score !== undefined ? (
                  <ProgressBar
                    value={metric.score}
                    max={100}
                    size="sm"
                    variant={
                      metric.score >= 80
                        ? 'success'
                        : metric.score >= 60
                        ? 'primary'
                        : metric.score >= 40
                        ? 'warning'
                        : 'danger'
                    }
                    className="mt-1.5"
                  />
                ) : null}
              </div>
            ))}
          </div>

          {data?.notes ? (
            <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-600">{data.notes}</p>
            </div>
          ) : null}
        </Card>
      </div>
    </Container>
  );
};

export default ExpectedPerformance;