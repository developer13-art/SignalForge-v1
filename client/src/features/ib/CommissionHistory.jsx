import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';

const CommissionHistory = function CommissionHistory() {
  const navigate = useNavigate();
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCommissions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ib/commissions', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setCommissions(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommissions();
  }, [fetchCommissions]);

  const handleBack = useCallback(() => navigate('/ib'), [navigate]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      accessor: 'date',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'referral',
      header: 'Referral',
      accessor: 'referralAccount',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'broker',
      header: 'Broker',
      accessor: 'broker',
      render: (value) => <span className="text-xs text-slate-600">{value}</span>,
    },
    {
      key: 'volume',
      header: 'Volume',
      accessor: 'volume',
      align: 'right',
      render: (value) => (
        <span className="text-xs text-slate-600">${value || 0}</span>
      ),
    },
    {
      key: 'commission',
      header: 'Commission',
      accessor: 'commission',
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
            value === 'paid'
              ? 'bg-emerald-50 text-emerald-700'
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
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCommissions}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <History size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Commission History
            </Heading>
            <Text color="muted" className="text-xs">
              Full record of IB commissions earned
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={commissions}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            emptyState={
              <EmptyState
                icon={History}
                title="No commissions yet"
                description="Your IB commissions will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default CommissionHistory;