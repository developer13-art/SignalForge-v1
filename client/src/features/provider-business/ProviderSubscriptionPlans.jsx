import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowLeft, Loader2, RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ProviderSubscriptionPlans = function ProviderSubscriptionPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/plans', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setPlans(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/provider-business/plans/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchPlans();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchPlans]);

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPlans}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/provider/plans/new')}
            leadingIcon={Plus}
          >
            Create Plan
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CreditCard size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Subscription Plans
            </Heading>
            <Text color="muted" className="text-xs">
              Define the plans your subscribers can choose from
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : plans.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="No plans yet"
              description="Create a subscription plan to start monetizing your signals."
              action={
                <Button
                  variant="primary"
                  onClick={() => navigate('/provider/plans/new')}
                  leadingIcon={Plus}
                >
                  Create Plan
                </Button>
              }
            />
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <Card key={plan.id} padding="lg" variant="subtle">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-slate-900">{plan.name}</p>
                        {plan.featured ? (
                          <Badge variant="primary" size="xs">
                            Featured
                          </Badge>
                        ) : null}
                        <Badge variant={plan.active ? 'success' : 'neutral'} size="xs">
                          {plan.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-slate-600">
                        ${plan.price}/{plan.period} · {plan.subscribersCount || 0} subscribers
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/provider/plans/${plan.id}`)}
                        leadingIcon={Edit}
                      >
                        Edit
                      </Button>
                      <button
                        type="button"
                        onClick={() => setRemoving(plan)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        aria-label="Delete"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        variant="danger"
        title="Delete plan"
        description={
          removing
            ? `Are you sure you want to delete "${removing.name}"? Existing subscribers remain on their plan until it expires.`
            : ''
        }
        confirmLabel="Delete Plan"
      />
    </Container>
  );
};

export default ProviderSubscriptionPlans;