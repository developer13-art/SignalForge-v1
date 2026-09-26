import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Ban, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Avatar from '../../components/common/Avatar';
import KycStatusBadge from '../../components/domain/kyc/KycStatusBadge';
import SubscriptionStatusBadge from '../../components/domain/subscription/SubscriptionStatusBadge';
import ErrorState from '../../components/common/ErrorState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const UserDetails = function UserDetails() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load user');
        return;
      }
      setUser(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleAction = useCallback(async () => {
    if (!confirm) {
      return;
    }
    try {
      await fetch(`/api/admin/users/${userId}/${confirm.action}`, {
        method: 'POST',
        credentials: 'include',
      });
      setConfirm(null);
      fetchUser();
    } catch (_err) {
      // silent
    }
  }, [confirm, userId, fetchUser]);

  const handleBack = useCallback(() => navigate('/admin/users'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchUser}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : error ? (
          <Card padding="lg">
            <ErrorState title="Failed to load" description={error} onRetry={fetchUser} />
          </Card>
        ) : user ? (
          <>
            <Card padding="lg">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Avatar
                    size="xl"
                    src={user.avatarUrl}
                    name={`${user.firstName} ${user.lastName}`}
                  />
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Heading level={1} size="text-2xl">
                        {user.firstName} {user.lastName}
                      </Heading>
                      <KycStatusBadge status={user.kycStatus} size="sm" />
                    </div>
                    <Text color="muted" className="mt-1 text-sm">
                      {user.email}
                    </Text>
                    <p className="mt-1 text-xs text-slate-500">
                      User ID: {user.id} · Joined {user.createdAt}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {user.status === 'active' ? (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirm({ action: 'suspend', label: 'Suspend user' })}
                      leadingIcon={Ban}
                    >
                      Suspend
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setConfirm({ action: 'activate', label: 'Activate user' })}
                      leadingIcon={CheckCircle2}
                    >
                      Activate
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/admin/users/${userId}/restrictions`)}
                  >
                    Restrictions
                  </Button>
                </div>
              </div>

              <Separator spacing="md" />

              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Status
                  </p>
                  <p className="mt-1 text-sm font-semibold capitalize text-slate-900">
                    {user.status}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Subscription
                  </p>
                  <div className="mt-1">
                    <SubscriptionStatusBadge status={user.subscriptionStatus} size="xs" />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Broker Accounts
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {user.brokerAccountsCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Signal Sources
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    {user.signalSourcesCount || 0}
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="mt-4">
              <Heading level={3} size="text-base">
                Recent Activity
              </Heading>
              <ul className="mt-4 space-y-2">
                {(user.recentActivity || []).map((event, index) => (
                  <li
                    key={index}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
                  >
                    <div>
                      <p className="text-sm text-slate-800">{event.description}</p>
                      <p className="mt-0.5 text-[11px] text-slate-500">{event.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          </>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(confirm)}
        onClose={() => setConfirm(null)}
        onConfirm={handleAction}
        variant={confirm?.action === 'suspend' ? 'danger' : 'info'}
        title={confirm?.label || ''}
        description="Are you sure you want to proceed with this action?"
        confirmLabel={confirm?.action === 'suspend' ? 'Suspend' : 'Activate'}
      />
    </Container>
  );
};

export default UserDetails;