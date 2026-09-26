import React, { useCallback, useEffect, useState } from 'react';
import { Clock, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ExecutionLatencyWidget from '../../components/domain/analytics/ExecutionLatencyWidget';
import DataTable from '../../components/data-display/DataTable';

const ExecutionLatency = function ExecutionLatency() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/latency', { credentials: 'include' });
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

  const columns = [
    {
      key: 'time',
      header: 'Time',
      accessor: 'time',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'symbol',
      header: 'Symbol',
      accessor: 'symbol',
      render: (value) => <span className="text-sm font-medium text-slate-800">{value}</span>,
    },
    {
      key: 'latency',
      header: 'Latency',
      accessor: 'latency',
      align: 'right',
      render: (value) => <span className="font-mono text-xs font-semibold text-slate-900">{value} ms</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => (
        <span className="text-xs font-medium capitalize text-slate-600">{value}</span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Execution Latency
            </Heading>
            <Text color="muted" className="text-xs">
              Signal-to-broker round trip times
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

      <div className="mt-6">
        <ExecutionLatencyWidget
          averageLatency={data?.averageLatency}
          medianLatency={data?.medianLatency}
          maxLatency={data?.maxLatency}
          p95Latency={data?.p95Latency}
          sparklineData={data?.trend}
          period={data?.period || '24h'}
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Recent Executions
        </Heading>
        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={data?.recent || []}
            rowKey="id"
            loading={loading}
            searchable
            sortable
          />
        </div>
      </Card>
    </Container>
  );
};

export default ExecutionLatency;