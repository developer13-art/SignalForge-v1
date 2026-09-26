import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import UserTable from '../../components/domain/admin/UserTable';
import StatCard from '../../components/data-display/StatCard';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const UserManagement = function UserManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suspending, setSuspending] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/users', { credentials: 'include' });
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
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = useCallback(async () => {
    if (!suspending) {
      return;
    }
    try {
      await fetch(`/api/admin/users/${suspending.id}/suspend`, {
        method: 'POST',
        credentials: 'include',
      });
      setSuspending(null);
      fetchUsers();
    } catch (_err) {
      // silent
    }
  }, [suspending, fetchUsers]);

  const handleActivate = useCallback(
    async (user) => {
      try {
        await fetch(`/api/admin/users/${user.id}/activate`, {
          method: 'POST',
          credentials: 'include',
        });
        fetchUsers();
      } catch (_err) {
        // silent
      }
    },
    [fetchUsers],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              User Management
            </Heading>
            <Text color="muted" className="text-xs">
              Manage platform users, statuses, and access
            </Text>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchUsers}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
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
          label="Suspended"
          value={data?.suspended || 0}
          icon={Users}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="New This Month"
          value={data?.newThisMonth || 0}
          icon={Users}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <UserTable
          users={users}
          loading={loading}
          onRowClick={(row) => navigate(`/admin/users/${row.id}`)}
          onViewDetails={(row) => navigate(`/admin/users/${row.id}`)}
          onSuspend={(row) => setSuspending(row)}
          onActivate={handleActivate}
          selectable
        />
      </Card>

      <ConfirmDialog
        open={Boolean(suspending)}
        onClose={() => setSuspending(null)}
        onConfirm={handleSuspend}
        variant="danger"
        title="Suspend user"
        description={
          suspending
            ? `Are you sure you want to suspend ${suspending.name}? The user will lose access to the platform.`
            : ''
        }
        confirmLabel="Suspend User"
      />
    </Container>
  );
};

export default UserManagement;