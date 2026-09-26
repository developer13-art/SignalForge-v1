import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';

const TraderManagement = function TraderManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [traders, setTraders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/traders', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setTraders(payload.data?.items || []);
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
      key: 'name',
      header: 'Trader',
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
      key: 'style',
      header: 'Style',
      accessor: 'style',
      render: (value) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] capitalize text-slate-600">
          {value?.replace('_', ' ') || '—'}
        </span>
      ),
    },
    {
      key: 'followers',
      header: 'Followers',
      accessor: 'followers',
      align: 'right',
      render: (value) => <span className="text-sm text-slate-800">{value || 0}</span>,
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
            value === 'active'
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
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trader Management
            </Heading>
            <Text color="muted" className="text-xs">
              Manage manual traders and their marketplace presence
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
          label="Total Traders"
          value={data?.total || 0}
          icon={Users}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={data?.active || 0}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="With Followers"
          value={data?.withFollowers || 0}
          icon={Users}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Flagged"
          value={data?.flagged || 0}
          icon={Users}
          variant="warning"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={traders}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          onRowClick={(row) => navigate(`/admin/traders/${row.id}`)}
          emptyState={
            <EmptyState
              icon={Users}
              title="No traders found"
              description="Traders will appear here as they register."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default TraderManagement;