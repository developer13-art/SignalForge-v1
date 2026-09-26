import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, RefreshCw, Loader2, Plus, Download } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const PerformanceReports = function PerformanceReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/reports', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setReports(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownload = useCallback(async (report) => {
    window.open(`/api/analytics/reports/${report.id}/download`, '_blank');
  }, []);

  const columns = [
    {
      key: 'name',
      header: 'Report',
      accessor: 'name',
      render: (value) => <span className="text-sm font-medium text-slate-800">{value}</span>,
    },
    {
      key: 'period',
      header: 'Period',
      accessor: 'period',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'format',
      header: 'Format',
      accessor: 'format',
      render: (value) => (
        <Badge variant="neutral" size="xs">
          {value}
        </Badge>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      align: 'right',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (value, row) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleDownload(row);
          }}
          className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600"
          aria-label="Download"
        >
          <Download size={14} aria-hidden="true" />
        </button>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Performance Reports
            </Heading>
            <Text color="muted" className="text-xs">
              Generate, download, and manage performance reports
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchReports}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/analytics/reports/export')}
            leadingIcon={Plus}
          >
            New Report
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={reports}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={FileText}
              title="No reports yet"
              description="Generate a report to see it here."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default PerformanceReports;