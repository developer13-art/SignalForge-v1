import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import Avatar from '../../components/common/Avatar';
import StatCard from '../../components/data-display/StatCard';
import EmptyState from '../../components/common/EmptyState';

const ProviderSubscribers = function ProviderSubscribers() {
  const navigate = useNavigate();
  const [subscribers, setSubscribers] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/subscribers', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setSubscribers(payload.data?.items || []);
        setSummary(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Subscriber',
        accessor: 'name',
        render: (value, row) => (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" src={row.avatar} name={value} alt={value} />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">{value}</p>
              <p className="truncate text-xs text-slate-500">{row.email}</p>
            </div>
          </div>
        ),
      },
      {
        key: 'plan',
        header: 'Plan',
        accessor: 'planName',
        render: (value) => (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
            {value}
          </span>
        ),
      },
      {
        key: 'startedAt',
        header: 'Started',
        accessor: 'startedAt',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'monthlyRevenue',
        header: 'Monthly',
        accessor: 'monthlyRevenue',
        align: 'right',
        render: (value) => (
          <span className="text-sm font-semibold text-emerald-600">${value || 0}</span>
        ),
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
              value === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {value}
          </span>
        ),
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
          onClick={fetchSubscribers}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Subscribers"
          value={summary?.total || 0}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={summary?.active || 0}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Churned"
          value={summary?.churned || 0}
          icon={Users}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="MRR"
          value={summary?.mrr !== undefined ? `$${summary.mrr}` : '—'}
          icon={Users}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Subscribers
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={subscribers}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            emptyState={
              <EmptyState
                icon={Users}
                title="No subscribers yet"
                description="Subscribers will appear as users follow your provider profile."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default ProviderSubscribers;