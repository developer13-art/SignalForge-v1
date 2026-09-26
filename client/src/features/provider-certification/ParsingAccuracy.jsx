import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import SparklineChart from '../../components/charts/SparklineChart';

const ParsingAccuracy = function ParsingAccuracy() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-certification/accuracy', {
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Parsing Accuracy
            </Heading>
            <Text color="muted" className="text-xs">
              How accurately the AI parses your historical signals
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Overall Accuracy"
            value={data?.overallAccuracy !== undefined ? `${data.overallAccuracy}%` : '—'}
            icon={BarChart3}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Signal Detection"
            value={data?.signalDetection !== undefined ? `${data.signalDetection}%` : '—'}
            icon={BarChart3}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Trade Management"
            value={data?.tradeManagement !== undefined ? `${data.tradeManagement}%` : '—'}
            icon={BarChart3}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Symbol Detection"
            value={data?.symbolDetection !== undefined ? `${data.symbolDetection}%` : '—'}
            icon={BarChart3}
            variant="success"
            loading={loading}
          />
        </div>

        {data?.trend && data.trend.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Accuracy Over Time
            </Heading>
            <div className="mt-4">
              <SparklineChart
                data={data.trend}
                dataKey="value"
                width={520}
                height={72}
                variant="area"
                color="#10b981"
                showLastDot
                className="w-full"
              />
            </div>
          </Card>
        ) : null}

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Detailed Metrics
          </Heading>

          <div className="mt-4 space-y-4">
            {(data?.metrics || []).map((metric) => (
              <div key={metric.key}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{metric.label}</span>
                  <span className="font-semibold text-slate-900">{metric.value}%</span>
                </div>
                <ProgressBar
                  value={metric.value}
                  max={100}
                  size="sm"
                  variant={
                    metric.value >= 90
                      ? 'success'
                      : metric.value >= 75
                      ? 'primary'
                      : metric.value >= 60
                      ? 'warning'
                      : 'danger'
                  }
                  className="mt-1.5"
                />
                {metric.description ? (
                  <p className="mt-1 text-[11px] text-slate-500">{metric.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default ParsingAccuracy;