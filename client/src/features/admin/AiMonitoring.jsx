import React, { useCallback, useEffect, useState } from 'react';
import { Brain, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import SparklineChart from '../../components/charts/SparklineChart';
import EmptyState from '../../components/common/EmptyState';

const AiMonitoring = function AiMonitoring() {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/ai/monitoring', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setLogs(payload.data?.items || []);
        setData(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const columns = [
    {
      key: 'time',
      header: 'Time',
      accessor: 'time',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'type',
      header: 'Type',
      accessor: 'type',
      render: (value) => (
        <span className="rounded bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
          {value}
        </span>
      ),
    },
    {
      key: 'provider',
      header: 'Provider',
      accessor: 'providerName',
      render: (value) => (
        <span className="truncate text-xs text-slate-700">{value || '—'}</span>
      ),
    },
    {
      key: 'confidence',
      header: 'Confidence',
      accessor: 'confidence',
      align: 'right',
      render: (value) =>
        value !== undefined ? (
          <span className="text-xs font-semibold text-slate-800">
            {Math.round(value * 100)}%
          </span>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      key: 'latency',
      header: 'Latency',
      accessor: 'latency',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-xs text-slate-600">{value}</span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Brain size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              AI Monitoring
            </Heading>
            <Text color="muted" className="text-xs">
              Monitor the AI parsing engine, confidence, and latency
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
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Requests Today"
          value={data?.requestsToday || 0}
          icon={Brain}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Avg Confidence"
          value={data?.avgConfidence !== undefined ? `${data.avgConfidence}%` : '—'}
          icon={Brain}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Avg Latency"
          value={data?.avgLatency !== undefined ? `${data.avgLatency} ms` : '—'}
          icon={Brain}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Error Rate"
          value={data?.errorRate !== undefined ? `${data.errorRate}%` : '—'}
          icon={Brain}
          variant={data?.errorRate > 5 ? 'danger' : 'success'}
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
              color="#8b5cf6"
              showLastDot
              className="w-full"
            />
          </div>
        </Card>
      ) : null}

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Recent AI Requests
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={logs}
            rowKey="id"
            loading={loading}
            searchable
            emptyState={
              <EmptyState
                icon={Brain}
                title="No AI requests"
                description="AI request logs will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default AiMonitoring;