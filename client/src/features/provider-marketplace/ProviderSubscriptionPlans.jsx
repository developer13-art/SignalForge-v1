import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CreditCard, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Button from '../../components/common/Button';
import ProviderSubscriptionCard from '../../components/domain/provider/ProviderSubscriptionCard';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const ProviderSubscriptionPlans = function ProviderSubscriptionPlans() {
  const { providerId } = useParams();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/marketplace/providers/${providerId}/plans`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load plans');
        return;
      }
      setPlans(payload.data || []);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  const handleSubscribe = useCallback(
    (plan) => {
      navigate(`/providers/${providerId}/subscribe?plan=${plan.id}`);
    },
    [navigate, providerId],
  );

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPlans}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-slate-200" />
            ))}
          </div>
        ) : error ? (
          <ErrorState title="Failed to load plans" description={error} onRetry={fetchPlans} />
        ) : plans.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="No subscription plans"
            description="This provider has not yet published any subscription plans."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <ProviderSubscriptionCard
                key={plan.id}
                plan={plan}
                featured={plan.featured}
                onSubscribe={() => handleSubscribe(plan)}
              />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
};

export default ProviderSubscriptionPlans;