import React, { useCallback, useEffect, useState } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import StatCard from '../../components/data-display/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import SparklineChart from '../../components/charts/SparklineChart';

const AiModelPerformance = function AiModelPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/performance', { credentials: 'include' });
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

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              AI Model Performance
            </Heading>
            <Text color="muted" className="text-xs">
              Parsing accuracy, latency, and reliability metrics
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Parse Accuracy"
          value={data?.parseAccuracy !== undefined ? `${data.parseAccuracy}%` : '—'}
          icon={Sparkles}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Avg Latency"
          value={data?.avgLatency !== undefined ? `${data.avgLatency} ms` : '—'}
          icon={Sparkles}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Requests Today"
          value={data?.requestsToday || 0}
          icon={Sparkles}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Error Rate"
          value={data?.errorRate !== undefined ? `${data.errorRate}%` : '—'}
          icon={Sparkles}
          variant="warning"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Accuracy Over Time
        </Heading>
        <Separator spacing="sm" />

        {data?.accuracyTrend && data.accuracyTrend.length > 0 ? (
          <SparklineChart
            data={data.accuracyTrend}
            dataKey="value"
            width={420}
            height={64}
            variant="area"
            color="#4f46e5"
            showLastDot
            className="w-full"
          />
        ) : (
          <p className="text-sm text-slate-400">No trend data available yet.</p>
        )}

        <Separator spacing="md" />

        <Heading level={3} size="text-base">
          Model Benchmarks
        </Heading>

        <div className="mt-4 space-y-4">
          {(data?.benchmarks || []).map((benchmark) => (
            <div key={benchmark.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{benchmark.label}</span>
                <span className="font-semibold text-slate-900">{benchmark.value}</span>
              </div>
              <ProgressBar
                value={benchmark.score || 0}
                max={100}
                size="sm"
                variant="primary"
                className="mt-1.5"
              />
            </div>
          ))}
        </div>
      </Card>
    </Container>
  );
};

export default AiModelPerformance;