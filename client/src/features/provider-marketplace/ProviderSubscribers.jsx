import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';

const ProviderSubscribers = function ProviderSubscribers() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/providers/${providerId}/subscribers`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setSubscribers(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchSubscribers();
  }, [fetchSubscribers]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const columns = useMemo(
    () => [
      {
        key: 'name',
        header: 'Subscriber',
        accessor: 'name',
        render: (value, row) => (
          <div className="flex items-center gap-2.5">
            <Avatar size="sm" src={row.avatar} name={value} alt={value} />
            <span className="text-sm font-medium text-slate-800">{value}</span>
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
        accessor: 'plan',
        render: (value) => (
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
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
          onClick={fetchSubscribers}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <Heading level={1} size="text-2xl">
          Provider Subscribers
        </Heading>
        <Text color="muted" className="mt-1 text-xs">
          {subscribers.length} subscriber{subscribers.length !== 1 ? 's' : ''}
        </Text>

        <div className="mt-6">
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
                title="No subscribers"
                description="Subscribers will appear here once users follow this provider."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default ProviderSubscribers;