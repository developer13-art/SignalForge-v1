import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import SparklineChart from '../../components/charts/SparklineChart';
import ProgressBar from '../../components/common/ProgressBar';

const PlatformPerformance = function PlatformPerformance() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/platform-performance', {
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
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleBack = useCallback(() => navigate('/executive'), [navigate]);

  return (
    <Container size="xl" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Platform Performance
            </Heading>
            <Text color="muted" className="text-xs">
              Uptime, latency, error rates, and system performance
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Uptime (30d)"
            value={data?.uptime !== undefined ? `${data.uptime}%` : '—'}
            icon={BarChart3}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Avg Latency"
            value={data?.avgLatency !== undefined ? `${data.avgLatency} ms` : '—'}
            icon={BarChart3}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Error Rate"
            value={data?.errorRate !== undefined ? `${data.errorRate}%` : '—'}
            icon={BarChart3}
            variant={data?.errorRate > 2 ? 'danger' : 'success'}
            loading={loading}
          />
          <StatCard
            label="Requests Today"
            value={data?.requestsToday || 0}
            icon={BarChart3}
            variant="info"
            loading={loading}
          />
        </div>

        {data?.latencyTrend && data.latencyTrend.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Latency Trend
            </Heading>
            <div className="mt-4">
              <SparklineChart
                data={data.latencyTrend}
                dataKey="value"
                width={520}
                height={72}
                variant="area"
                color="#4f46e5"
                showLastDot
                className="w-full"
              />
            </div>
          </Card>
        ) : null}

        {data?.components && data.components.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Component Health
            </Heading>
            <div className="mt-4 space-y-4">
              {data.components.map((component) => (
                <div key={component.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{component.label}</span>
                    <span className="font-semibold text-slate-900">
                      {component.score !== undefined ? `${component.score}%` : '—'}
                    </span>
                  </div>
                  <ProgressBar
                    value={component.score || 0}
                    max={100}
                    size="sm"
                    variant={
                      component.score >= 90
                        ? 'success'
                        : component.score >= 75
                        ? 'primary'
                        : component.score >= 50
                        ? 'warning'
                        : 'danger'
                    }
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default PlatformPerformance;