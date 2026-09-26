import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import ProviderCertificationBadge from '../../components/domain/provider/ProviderCertificationBadge';
import EmptyState from '../../components/common/EmptyState';

const CertificationHistory = function CertificationHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-certification/history', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setHistory(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleBack = useCallback(() => navigate('/provider/certification'), [navigate]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      accessor: 'date',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'level',
      header: 'Level',
      accessor: 'level',
      render: (value) => <ProviderCertificationBadge level={value} size="xs" />,
    },
    {
      key: 'score',
      header: 'Quality Score',
      accessor: 'score',
      align: 'right',
      render: (value) => (
        <span className="text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      key: 'validUntil',
      header: 'Valid Until',
      accessor: 'validUntil',
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
            value === 'active'
              ? 'bg-emerald-50 text-emerald-700'
              : value === 'expired'
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
          onClick={fetchHistory}
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
              Certification History
            </Heading>
            <Text color="muted" className="text-xs">
              Full history of your certification attempts and results
            </Text>
          </div>
        </div>

        <div className="mt-6">
          <DataTable
            columns={columns}
            rows={history}
            rowKey="id"
            loading={loading}
            searchable
            sortable
            emptyState={
              <EmptyState
                icon={History}
                title="No certification history"
                description="Your certification attempts will appear here."
              />
            }
          />
        </div>
      </Card>
    </Container>
  );
};

export default CertificationHistory;