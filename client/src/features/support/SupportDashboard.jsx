import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Plus, RefreshCw, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const SupportDashboard = function SupportDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/support/tickets', { credentials: 'include' });
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
      key: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      accessor: 'updatedAt',
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
            value === 'resolved'
              ? 'bg-emerald-50 text-emerald-700'
              : value === 'open'
              ? 'bg-sky-50 text-sky-700'
              : 'bg-amber-50 text-amber-700',
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
              Support Dashboard
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your support tickets
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/support/tickets/new')}
            leadingIcon={Plus}
          >
            New Ticket
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Open Tickets"
          value={data?.open || 0}
          icon={MessageSquare}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="In Progress"
          value={data?.inProgress || 0}
          icon={Clock}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Resolved"
          value={data?.resolved || 0}
          icon={CheckCircle2}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Avg Response"
          value={data?.avgResponse || '—'}
          icon={Clock}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Your Tickets
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={tickets}
            rowKey="id"
            loading={loading}
            searchable
            onRowClick={(row) => navigate(`/support/tickets/${row.id}`)}
            emptyState={
              <EmptyState
                icon={MessageSquare}
                title="No tickets yet"
                description="Open a ticket if you need help."
                action={
                  <Button
                    variant="primary"
                    onClick={() => navigate('/support/tickets/new')}
                    leadingIcon={Plus}
                  >
                    Open Ticket
                  </Button>
                }
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default SupportDashboard;