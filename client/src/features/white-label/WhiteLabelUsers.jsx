import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';

const WhiteLabelUsers = function WhiteLabelUsers() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/users', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setUsers(payload.data?.items || []);
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

  const handleBack = useCallback(() => navigate('/white-label'), [navigate]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'User',
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
        key: 'joinedAt',
        header: 'Joined',
        accessor: 'joinedAt',
        render: (value) => <span className="text-xs text-slate-500">{value}</span>,
      },
      {
        key: 'plan',
        header: 'Plan',
        accessor: 'planName',
        render: (value) => (
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
            {value}
          </span>
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
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Users"
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
          label="New This Month"
          value={data?.newThisMonth || 0}
          icon={Users}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Subscribers"
          value={data?.subscribers || 0}
          icon={Users}
          variant="default"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Users
        </Heading>

        <div className="mt-4">
          <DataTable
            columns={columns}
            rows={users}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            emptyState={
              <EmptyState
                icon={Users}
                title="No users yet"
                description="Users of your branded platform will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default WhiteLabelUsers;