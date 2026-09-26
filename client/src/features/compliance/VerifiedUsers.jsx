import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataTable from '../../components/data-display/DataTable';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';

const VerifiedUsers = function VerifiedUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVerified = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/compliance/verified-users', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setUsers(payload.data?.items || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVerified();
  }, [fetchVerified]);

  const columns = [
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
      key: 'documentType',
      header: 'Document',
      accessor: 'documentType',
      render: (value) => (
        <span className="text-xs text-slate-700">{value}</span>
      ),
    },
    {
      key: 'verifiedAt',
      header: 'Verified',
      accessor: 'verifiedAt',
      render: (value) => <span className="text-xs text-slate-500">{value}</span>,
    },
    {
      key: 'expiresAt',
      header: 'Expires',
      accessor: 'expiresAt',
      align: 'right',
      render: (value) => (
        <span className="text-xs text-slate-500">{value || 'Never'}</span>
      ),
    },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Verified Users
            </Heading>
            <Text color="muted" className="text-xs">
              All users with completed KYC verification
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchVerified}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <DataTable
          columns={columns}
          rows={users}
          rowKey="id"
          loading={loading}
          searchable
          sortable
          emptyState={
            <EmptyState
              icon={CheckCircle2}
              title="No verified users"
              description="Verified users will appear here."
            />
          }
        />
      </Card>
    </Container>
  );
};

export default VerifiedUsers;