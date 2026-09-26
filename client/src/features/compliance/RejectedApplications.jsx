import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';

const RejectedApplications = function RejectedApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRejected = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/kyc-queue?status=rejected', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setApplications(payload.data?.items || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRejected();
  }, [fetchRejected]);

  const columns = [
    {
      key: 'applicant',
      header: 'Applicant',
      accessor: 'applicantName',
      render: (value, row) => (
        <div className="flex items-center gap-2.5">
          <Avatar size="sm" src={row.avatar} name={value} alt={value} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-900">{value}</p>
            <p className="truncate text-xs text-slate-500">{row.applicantEmail}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'reason',
      header: 'Rejection Reason',
      accessor: 'rejectionReason',
      render: (value) => (
        <span className="text-xs text-rose-700">{value}</span>
      ),
    },
    {
      key: 'rejectedAt',
      header: 'Rejected',
      accessor: 'rejectedAt',
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
            navigate(`/compliance/kyc/${row.id}`);
          }}
          className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
        >
          Review
        </button>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <XCircle size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Rejected Applications
            </Heading>
            <Text color="muted" className="text-xs">
              All rejected KYC applications with reasons
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchRejected}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={applications}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          onRowClick={(row) => navigate(`/compliance/kyc/${row.id}`)}
          emptyState={
            <EmptyState
              icon={XCircle}
              title="No rejected applications"
              description="Rejected applications will appear here."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default RejectedApplications;