import React, { useCallback, useEffect, useState } from 'react';
import { authenticatedFetch as fetch } from '../../api/authenticated-fetch.js';
import { Shield, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const SecurityCenter = function SecurityCenter() {
  const [data, setData] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/security', { credentials: 'include' });
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
  }, [fetchData]);

  const columns = [
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
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'actor',
      header: 'Actor',
      accessor: 'actorEmail',
      render: (value) => (
        <span className="truncate text-xs text-slate-600">{value || 'System'}</span>
      ),
    },
    {
      key: 'ip',
      header: 'IP',
      accessor: 'ip',
      align: 'right',
      render: (value) => (
        <span className="font-mono text-xs text-slate-500">{value || '—'}</span>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      accessor: 'severity',
      align: 'right',
      render: (value) => (
        <span
          className={[
            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize',
            value === 'critical'
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
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Security Center
            </Heading>
            <Text color="muted" className="text-xs">
              Monitor threats, sessions, and security events
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
          label="Active Sessions"
          value={data?.activeSessions ?? '—'}
          icon={Shield}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Failed Logins (24h)"
          value={data?.failedLogins24h ?? '—'}
          icon={Shield}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Suspicious Events"
          value={data?.suspiciousEvents ?? '—'}
          icon={Shield}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="2FA Enabled Users"
          value={data?.twoFactorUsers ?? '—'}
          icon={Shield}
          variant="success"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Recent Security Events
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={events}
            rowKey="id"
            loading={loading}
            searchable
            emptyState={
              <EmptyState
                icon={Shield}
                title="No security events"
                description="Security events will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default SecurityCenter;