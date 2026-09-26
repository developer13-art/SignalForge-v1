import React, { useCallback, useEffect, useState } from 'react';
import { Store, RefreshCw, Loader2, Check, X } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const MarketplaceModeration = function MarketplaceModeration() {
  const [data, setData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/marketplace/reviews', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setReviews(payload.data?.items || []);
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

  const handleAction = useCallback(async () => {
    if (!confirm) {
      return;
    }
    try {
      await fetch(`/api/admin/marketplace/reviews/${confirm.id}/${confirm.action}`, {
        method: 'POST',
        credentials: 'include',
      });
      setConfirm(null);
      fetchData();
    } catch (_err) {
      // silent
    }
  }, [confirm, fetchData]);

  const columns = [
    {
      key: 'author',
      header: 'Author',
      accessor: 'authorName',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      accessor: 'targetName',
      render: (value) => <span className="text-xs text-slate-600">{value}</span>,
    },
    {
      key: 'rating',
      header: 'Rating',
      accessor: 'rating',
      render: (value) => (
        <span className="text-sm font-semibold text-amber-600">{value}★</span>
      ),
    },
    {
      key: 'body',
      header: 'Content',
      accessor: 'body',
      render: (value) => (
        <span className="line-clamp-2 text-xs text-slate-600">{value}</span>
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
            value === 'approved'
              ? 'bg-emerald-50 text-emerald-700'
              : value === 'flagged'
              ? 'bg-rose-50 text-rose-700'
              : 'bg-amber-50 text-amber-700',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (value, row) =>
        row.status === 'pending' ? (
          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setConfirm({ id: row.id, action: 'approve', label: 'Approve review' });
              }}
              className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
              aria-label="Approve"
            >
              <Check size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setConfirm({ id: row.id, action: 'reject', label: 'Reject review' });
              }}
              className="rounded p-1.5 text-rose-600 hover:bg-rose-50"
              aria-label="Reject"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        ) : null,
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Store size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Marketplace Moderation
            </Heading>
            <Text color="muted" className="text-xs">
              Moderate reviews, listings, and marketplace content
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
          label="Pending Reviews"
          value={data?.pendingReviews || 0}
          icon={Store}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Approved Today"
          value={data?.approvedToday || 0}
          icon={Store}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Flagged"
          value={data?.flagged || 0}
          icon={Store}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Total Reviews"
          value={data?.totalReviews || 0}
          icon={Store}
          variant="primary"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={reviews}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={Store}
              title="No reviews to moderate"
              description="Reviews will appear here for moderation."
            />
          }
        />
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        variant={confirm?.action === 'reject' ? 'danger' : 'info'}
        title={confirm?.label || ''}
        description="Are you sure you want to proceed?"
        confirmLabel="Confirm"
      />
    </Container>
  );
};

export default MarketplaceModeration;