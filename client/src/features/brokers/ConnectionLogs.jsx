import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, ArrowLeft, Loader2, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const ConnectionLogs = function ConnectionLogs() {
  const { accountId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/brokers/accounts/${accountId}/logs`, {
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
  }, [accountId]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const columns = useMemo(
    () => [
      {
        key: 'time',
        header: 'Time',
        accessor: 'time',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'event',
        header: 'Event',
        accessor: 'event',
        render: (value) => <span className="text-sm font-medium text-slate-800">{value}</span>,
      },
      {
        key: 'message',
        header: 'Message',
        accessor: 'message',
        render: (value) => <span className="text-xs text-slate-600">{value}</span>,
      },
      {
        key: 'status',
        header: 'Status',
        accessor: 'status',
        align: 'right',
        render: (value) => {
          const isSuccess = value === 'success';
          return (
            <span
              className={[
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
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
    ],
    [],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchLogs}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Connection Logs
            </Heading>
            <Text color="muted" className="text-xs">
              Detailed connection and deployment events for this account
            </Text>
          </div>
        </div>

        <div className="mt-6">
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
                title="No connection logs"
                description="Logs will appear as the platform connects and syncs your account."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default ConnectionLogs;