import React, { useCallback, useEffect, useState } from 'react';
import { FileText, RefreshCw, Loader2, Search } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const KycAuditTrail = function KycAuditTrail() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('q', search);
      }
      const response = await fetch(
        `/api/compliance/audit-trail?${params.toString()}`,
        { credentials: 'include' },
      );
      const payload = await response.json();
      if (response.ok) {
        setLogs(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      accessor: 'timestamp',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'actor',
      header: 'Actor',
      accessor: 'actorEmail',
      render: (value) => (
        <span className="truncate text-xs text-slate-700">{value}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      accessor: 'action',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      accessor: 'targetEmail',
      render: (value) => (
        <span className="truncate text-xs text-slate-600">{value || '—'}</span>
      ),
    },
    {
      key: 'oldStatus',
      header: 'Old Status',
      accessor: 'oldStatus',
      render: (value) => (
        <span className="text-xs text-slate-500">{value || '—'}</span>
      ),
    },
    {
      key: 'newStatus',
      header: 'New Status',
      accessor: 'newStatus',
      align: 'right',
      render: (value) => (
        <span className="text-xs font-semibold text-slate-800">{value || '—'}</span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              KYC Audit Trail
            </Heading>
            <Text color="muted" className="text-xs">
              Immutable record of every KYC status change and action
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
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <div className="relative">
          <Search
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search audit trail by user, action, or status"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm"
          />
        </div>

        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={logs}
            rowKey="id"
            loading={loading}
            emptyState={
              <EmptyState
                icon={FileText}
                title="No audit logs"
                description="KYC audit trail entries will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default KycAuditTrail;