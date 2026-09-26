import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ArrowUp, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/feedback/Alert';

const UpgradePlan = function UpgradePlan() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, currentRes] = await Promise.all([
        fetch('/api/subscriptions/plans', { credentials: 'include' }),
        fetch('/api/subscriptions/current', { credentials: 'include' }),
      ]);

      const plansPayload = await plansRes.json();
      const currentPayload = await currentRes.json();

      if (plansRes.ok) {
        setPlans(plansPayload.data || []);
      }
      if (currentRes.ok) {
        setCurrent(currentPayload.data);
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

  const handleUpgrade = useCallback(
    async (plan) => {
      setUpgrading(true);
      setError(null);
      try {
        const response = await fetch('/api/subscriptions/upgrade', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ planId: plan.id }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Failed to upgrade plan');
          return;
        }

        if (payload.data?.redirectUrl) {
          window.location.href = payload.data.redirectUrl;
          return;
        }

        navigate('/subscriptions');
      } catch (_err) {
        setError('Unable to reach the server');
      } finally {
        setUpgrading(false);
      }
    },
    [navigate],
  );

  const handleBack = useCallback(() => navigate('/subscriptions'), [navigate]);

  const availablePlans = plans.filter((p) => p.id !== current?.planId);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <ArrowUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Upgrade Your Plan
            </Heading>
            <Text color="muted" className="text-xs">
              Move to a higher tier with more features and capacity
            </Text>
          </div>
        </div>

        {current ? (
          <Alert variant="info" size="sm" className="mt-4">
            <p className="text-xs">
              You are currently on the <strong>{current.planName}</strong> plan. Upgrades take
              effect immediately and the difference is prorated.
            </p>
          </Alert>
        ) : null}

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : (
            availablePlans.map((plan) => (
              <Card key={plan.id} padding="lg" variant="subtle">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
                      {plan.featured ? (
                        <Badge variant="primary" size="xs">
                          Recommended
                        </Badge>
                      ) : null}
                    </div>
                    <Text color="muted" className="mt-1 text-xs">
                      {plan.description}
                    </Text>
                    <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {(plan.features || []).slice(0, 6).map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-1.5 text-xs text-slate-600"
                        >
                          <Check
                            size={12}
                            className="mt-0.5 shrink-0 text-emerald-600"
                            aria-hidden="true"
                          />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <p className="text-2xl font-bold text-slate-900">${plan.monthlyPrice}</p>
                    <p className="text-[11px] text-slate-500">per month</p>
                    <Button
                      variant="primary"
                      onClick={() => handleUpgrade(plan)}
                      disabled={upgrading}
                    >
                      Upgrade
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </Container>
  );
};

export default UpgradePlan;