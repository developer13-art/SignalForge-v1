import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, RefreshCw, Loader2, Plus } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const MyTickets = function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/support/tickets', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setTickets(payload.data?.items || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const columns = [
    {
      key: 'id',
      header: 'Ticket',
      accessor: 'id',
      render: (value) => (
        <span className="font-mono text-xs text-slate-600">#{value}</span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      accessor: 'subject',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      accessor: 'category',
      render: (value) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
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
              My Tickets
            </Heading>
            <Text color="muted" className="text-xs">
              All support tickets you have created
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTickets}
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

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={tickets}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          onRowClick={(row) => navigate(`/support/tickets/${row.id}`)}
          emptyState={
            <EmptyState
              icon={MessageSquare}
              title="No tickets yet"
              description="Create a ticket if you need help."
              action={
                <Button
                  variant="primary"
                  onClick={() => navigate('/support/tickets/new')}
                  leadingIcon={Plus}
                >
                  Create Ticket
                </Button>
              }
            />
          }
        />
      </Card>
    </Container>
  );
};

export default MyTickets;