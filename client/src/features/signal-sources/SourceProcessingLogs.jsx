import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, Loader2, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const SourceProcessingLogs = function SourceProcessingLogs() {
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId');

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sourceId) {
        params.append('sourceId', sourceId);
      }

      const response = await fetch(`/api/sources/logs?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setLogs(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [sourceId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = useMemo(
    () => [
      {
        key: 'timestamp',
        header: 'Time',
        accessor: 'timestamp',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'source',
        header: 'Source',
        accessor: 'sourceName',
        render: (value) => <span className="text-sm text-slate-700">{value}</span>,
      },
      {
        key: 'event',
        header: 'Event',
        accessor: 'event',
        render: (value) => (
          <span className="text-sm font-medium text-slate-800">{value}</span>
        ),
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        render: (value) => {
          const isSuccess = value === 'success';
          return (
            <span
              className={[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                isSuccess ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isSuccess ? (
                <CheckCircle2 size={10} aria-hidden="true" />
              ) : (
                <AlertCircle size={10} aria-hidden="true" />
              )}
              {value}
            </span>
          );
        },
      },
      {
        key: 'duration',
        header: 'Duration',
        accessor: 'duration',
        align: 'right',
        render: (value) => <span className="font-mono text-xs text-slate-600">{value}</span>,
      },
      {
        key: 'message',
        header: 'Message',
        accessor: 'message',
        render: (value) => (
          <span className="truncate text-xs text-slate-500">{value || '—'}</span>
        ),
      },
    ],
    [],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Source Processing Logs
            </Heading>
            <Text color="muted" className="text-xs">
              Detailed events for every message processed
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={logs}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={FileText}
              title="No logs"
              description="Processing logs will appear here as messages are received."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default SourceProcessingLogs;