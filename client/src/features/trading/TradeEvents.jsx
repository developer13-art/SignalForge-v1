import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ListChecks, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const TradeEvents = function TradeEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trading/events', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setEvents(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const columns = useMemo(
    () => [
      {
        key: 'time',
        header: 'Time',
        accessor: 'time',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'trade',
        header: 'Trade',
        accessor: 'symbol',
        render: (value, row) => (
          <span className="font-medium text-slate-900">
            {value} · {row.direction}
          </span>
        ),
      },
      {
        key: 'event',
        header: 'Event',
        accessor: 'event',
        render: (value) => (
          <Badge variant="info" size="xs">
            {value}
          </Badge>
        ),
      },
      {
        key: 'actor',
        header: 'Actor',
        accessor: 'actor',
        render: (value) => (
          <span className="text-xs font-medium uppercase tracking-wide text-slate-600">
            {value}
          </span>
        ),
      },
      {
        key: 'details',
        header: 'Details',
        accessor: 'details',
        render: (value) => <span className="text-xs text-slate-600">{value || '—'}</span>,
      },
    ],
    [],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <ListChecks size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trade Events
            </Heading>
            <Text color="muted" className="text-xs">
              Every lifecycle event across your trades with actor attribution
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchEvents}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={events}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={ListChecks}
              title="No events"
              description="Trade events will appear here as your trades progress."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default TradeEvents;