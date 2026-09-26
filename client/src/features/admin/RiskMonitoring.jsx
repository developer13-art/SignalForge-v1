import React, { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const RiskMonitoring = function RiskMonitoring() {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/risk/monitoring', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setEvents(payload.data?.items || []);
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
        <span
          className={[
            'rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
            value === 'blocked'
              ? 'bg-rose-50 text-rose-700'
              : value === 'warning'
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
      key: 'user',
      header: 'User',
      accessor: 'userEmail',
      render: (value) => (
        <span className="truncate text-xs text-slate-600">{value}</span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      accessor: 'reason',
      render: (value) => (
        <span className="truncate text-xs text-slate-700">{value}</span>
      ),
    },
    {
      key: 'symbol',
      header: 'Symbol',
      accessor: 'symbol',
      align: 'right',
      render: (value) => (
        <span className="text-xs font-medium text-slate-800">{value || '—'}</span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk Monitoring
            </Heading>
            <Text color="muted" className="text-xs">
              Live view of risk events and blocks across the platform
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
          label="Blocked Today"
          value={data?.blockedToday || 0}
          icon={ShieldAlert}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Warnings"
          value={data?.warningsToday || 0}
          icon={ShieldAlert}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Emergency Stops"
          value={data?.emergencyStops || 0}
          icon={ShieldAlert}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Active Risk Profiles"
          value={data?.activeProfiles || 0}
          icon={ShieldAlert}
          variant="primary"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={events}
          rowKey="id"
          loading={loading}
          searchable
          emptyState={
            <EmptyState
              icon={ShieldAlert}
              title="No risk events"
              description="Risk events will appear as they occur."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default RiskMonitoring;