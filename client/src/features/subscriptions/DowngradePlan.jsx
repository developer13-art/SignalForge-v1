import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, ArrowDown, Check, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const DowngradePlan = function DowngradePlan() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [current, setCurrent] = useState(null);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downgrading, setDowngrading] = useState(false);
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

  const handleDowngrade = useCallback(async () => {
    if (!selected) {
      return;
    }

    setDowngrading(true);
    setError(null);

    try {
      const response = await fetch('/api/subscriptions/downgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ planId: selected.id }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to downgrade');
        return;
      }

      setSelected(null);
      navigate('/subscriptions');
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setDowngrading(false);
    }
  }, [selected, navigate]);

  const handleBack = useCallback(() => navigate('/subscriptions'), [navigate]);

  const availablePlans = plans.filter(
    (p) => p.id !== current?.planId && p.monthlyPrice < (current?.price || Infinity),
  );

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <ArrowDown size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Downgrade Your Plan
            </Heading>
            <Text color="muted" className="text-xs">
              Move to a lower tier to reduce your monthly cost
            </Text>
          </div>
        </div>

        <Alert variant="warning" size="sm" className="mt-4">
          <p className="flex items-start gap-2 text-xs">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Downgrades take effect at the end of the current billing period. Your current plan
              remains active until then.
            </span>
          </p>
        </Alert>

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
          ) : availablePlans.length === 0 ? (
            <p className="text-sm text-slate-400">
              No lower-tier plans available for downgrade.
            </p>
          ) : (
            availablePlans.map((plan) => (
              <Card key={plan.id} padding="lg" variant="subtle">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-slate-900">{plan.name}</h3>
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
                      variant="outline"
                      onClick={() => setSelected(plan)}
                      disabled={downgrading}
                    >
                      Downgrade
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        onConfirm={handleDowngrade}
        variant="warning"
        title="Confirm Downgrade"
        description={
          selected
            ? `You will move to ${selected.name} at the end of the current period. Some features will no longer be available.`
            : ''
        }
        confirmLabel="Confirm Downgrade"
        confirmLoading={downgrading}
      />
    </Container>
  );
};

export default DowngradePlan;