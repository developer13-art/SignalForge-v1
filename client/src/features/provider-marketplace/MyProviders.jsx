import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, RefreshCw, Loader2, ArrowRight, Settings2, X } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const MyProviders = function MyProviders() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/providers', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setProviders(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const handleCancel = useCallback(async () => {
    if (!cancelling) {
      return;
    }
    try {
      await fetch(`/api/subscriptions/providers/${cancelling.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setCancelling(null);
      fetchProviders();
    } catch (_err) {
      // silent
    }
  }, [cancelling, fetchProviders]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              My Providers
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your followed providers and subscriptions
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchProviders}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/providers')}
            leadingIcon={Users}
          >
            Browse Providers
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : providers.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Users}
              title="No active providers"
              description="Subscribe to a provider from the marketplace to see them here."
              action={
                <Button variant="primary" onClick={() => navigate('/providers')}>
                  Browse Marketplace
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="space-y-3">
            {providers.map((subscription) => (
              <Card key={subscription.id} padding="lg">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Avatar
                      size="md"
                      src={subscription.provider.avatar}
                      name={subscription.provider.name}
                      alt={subscription.provider.name}
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {subscription.provider.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {subscription.planName} · started {subscription.startedAt}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant={subscription.status === 'active' ? 'success' : 'neutral'} size="sm">
                      {subscription.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/providers/${subscription.providerId}`)}
                      leadingIcon={Settings2}
                    >
                      Manage
                    </Button>
                    <button
                      type="button"
                      onClick={() => setCancelling(subscription)}
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      aria-label="Cancel subscription"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(cancelling)}
        onClose={() => setCancelling(null)}
        onConfirm={handleCancel}
        variant="warning"
        title="Cancel subscription"
        description={
          cancelling
            ? `Are you sure you want to cancel your subscription to ${cancelling.provider.name}? Automated trades from this provider will stop immediately.`
            : ''
        }
        confirmLabel="Cancel Subscription"
      />
    </Container>
  );
};

export default MyProviders;