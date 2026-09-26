import React, { useCallback, useEffect, useState } from 'react';
import { MessageSquare, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const Support = function Support() {
  const [data, setData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/support/tickets', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setTickets(payload.data?.items || []);
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
  }, [fetchData]);

  const columns = [
    {
      key: 'subject',
      header: 'Subject',
      accessor: 'subject',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'user',
      header: 'User',
      accessor: 'userEmail',
      render: (value) => (
        <span className="truncate text-xs text-slate-600">{value}</span>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      accessor: 'priority',
      render: (value) => (
        <span
          className={[
            'rounded px-2 py-0.5 text-[10px] font-semibold uppercase',
            value === 'high'
              ? 'bg-rose-50 text-rose-700'
              : value === 'medium'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-sky-50 text-sky-700',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      align: 'right',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      accessor: 'status',
      align: 'right',
      render: (value) => (
        <span
          className={[
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
            value === 'open'
              ? 'bg-sky-50 text-sky-700'
              : value === 'resolved'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <MessageSquare size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Support Tickets
            </Heading>
            <Text color="muted" className="text-xs">
              Manage user support tickets
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
          label="Open"
          value={data?.open || 0}
          icon={MessageSquare}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="In Progress"
          value={data?.inProgress || 0}
          icon={MessageSquare}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Resolved Today"
          value={data?.resolvedToday || 0}
          icon={MessageSquare}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Avg Response"
          value={data?.avgResponse || '—'}
          icon={MessageSquare}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={tickets}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={MessageSquare}
              title="No support tickets"
              description="Support tickets will appear here when users open them."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default Support;