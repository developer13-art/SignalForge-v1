import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ProviderTable from '../../components/domain/admin/ProviderTable';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ProviderManagement = function ProviderManagement() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/providers', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setProviders(payload.data?.items || []);
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

  const handleConfirm = useCallback(async () => {
    if (!confirm) {
      return;
    }
    try {
      await fetch(`/api/admin/providers/${confirm.id}/${confirm.action}`, {
        method: 'POST',
        credentials: 'include',
      });
      setConfirm(null);
      fetchData();
    } catch (_err) {
      // silent
    }
  }, [confirm, fetchData]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Award size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Management
            </Heading>
            <Text color="muted" className="text-xs">
              Manage signal providers, certifications, and statuses
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
          label="Total Providers"
          value={data?.total || 0}
          icon={Award}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Active"
          value={data?.active || 0}
          icon={Award}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Pending"
          value={data?.pending || 0}
          icon={Award}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Certified"
          value={data?.certified || 0}
          icon={Award}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <ProviderTable
          providers={providers}
          loading={loading}
          onRowClick={(row) => navigate(`/admin/providers/${row.id}`)}
          onView={(row) => navigate(`/admin/providers/${row.id}`)}
          onApprove={(row) => setConfirm({ id: row.id, action: 'approve', label: 'Approve provider' })}
          onSuspend={(row) => setConfirm({ id: row.id, action: 'suspend', label: 'Suspend provider' })}
          selectable
        />
      </Card>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        variant={confirm?.action === 'suspend' ? 'danger' : 'info'}
        title={confirm?.label || ''}
        description="Are you sure you want to proceed?"
        confirmLabel="Confirm"
      />
    </Container>
  );
};

export default ProviderManagement;