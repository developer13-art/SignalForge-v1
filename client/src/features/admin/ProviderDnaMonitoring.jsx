import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import DataTable from '../../components/data-display/DataTable';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';

const ProviderDnaMonitoring = function ProviderDnaMonitoring() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [dnas, setDnas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/provider-dna', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setDnas(payload.data?.items || []);
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
      key: 'provider',
      header: 'Provider',
      accessor: 'providerName',
      render: (value) => (
        <span className="text-sm font-medium text-slate-800">{value}</span>
      ),
    },
    {
      key: 'language',
      header: 'Language',
      accessor: 'language',
      render: (value) => <span className="text-xs text-slate-600">{value}</span>,
    },
    {
      key: 'rulesCount',
      header: 'Rules',
      accessor: 'rulesCount',
      align: 'right',
      render: (value) => <span className="text-sm text-slate-800">{value || 0}</span>,
    },
    {
      key: 'confidence',
      header: 'Confidence',
      accessor: 'confidence',
      align: 'right',
      render: (value) => (
        <div className="flex items-center justify-end gap-2">
          <div className="w-20">
            <ProgressBar
              value={value || 0}
              max={100}
              size="xs"
              variant={value >= 80 ? 'success' : value >= 60 ? 'warning' : 'danger'}
            />
          </div>
          <span className="text-xs font-semibold text-slate-800">
            {Math.round(value || 0)}%
          </span>
        </div>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      accessor: 'version',
      align: 'right',
      render: (value) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
          {value || 'v1'}
        </span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Dna size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider DNA Monitoring
            </Heading>
            <Text color="muted" className="text-xs">
              Monitor learned patterns across all providers
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
          label="Providers Profiled"
          value={data?.providersProfiled || 0}
          icon={Dna}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Total Rules"
          value={data?.totalRules || 0}
          icon={Dna}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Avg Confidence"
          value={data?.avgConfidence !== undefined ? `${data.avgConfidence}%` : '—'}
          icon={Dna}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Fast Path Rate"
          value={data?.fastPathRate !== undefined ? `${data.fastPathRate}%` : '—'}
          icon={Dna}
          variant="default"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={dnas}
          rowKey="providerId"
          loading={loading}
          searchable
          sortable
          onRowClick={(row) => navigate(`/ai/provider-dna/${row.providerId}/rules`)}
          emptyState={
            <EmptyState
              icon={Dna}
              title="No Provider DNA yet"
              description="Provider DNA will appear as providers send signals."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default ProviderDnaMonitoring;