import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, RefreshCw, Loader2, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const PricingPlans = function PricingPlans() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState('monthly');

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/plans', { credentials: 'include' });
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

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CreditCard size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Subscription Plans
            </Heading>
            <Text color="muted" className="text-xs">
              Choose the plan that fits your trading needs
            </Text>
          </div>
        </div>

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

      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setCycle('monthly')}
            className={[
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              cycle === 'monthly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setCycle('yearly')}
            className={[
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              cycle === 'yearly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            Yearly
            <span className="ml-1.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
              Save 17%
            </span>
          </button>
        </div>
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 animate-pulse rounded-lg bg-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {plans.map((plan) => {
              const price = cycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
              const period = cycle === 'monthly' ? 'month' : 'year';

              return (
                <Card
                  key={plan.id}
                  padding="lg"
                  variant={plan.featured ? 'elevated' : 'default'}
                  className={[
                    'relative flex flex-col',
                    plan.featured ? 'ring-2 ring-indigo-500' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {plan.featured ? (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="primary" size="sm">
                        Most Popular
                      </Badge>
                    </div>
                  ) : null}

                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                    <p className="mt-1 text-xs text-slate-500">{plan.description}</p>
                  </div>

                  <div className="mt-6">
                    {plan.customPrice ? (
                      <p className="text-3xl font-bold text-slate-900">Custom</p>
                    ) : (
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold text-slate-900">
                          ${price}
                        </span>
                        <span className="text-sm font-medium text-slate-500">/{period}</span>
                      </div>
                    )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {(plan.features || []).map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check
                          size={14}
                          className="mt-0.5 shrink-0 text-emerald-600"
                          aria-hidden="true"
                        />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <Button
                      variant={plan.featured ? 'primary' : 'outline'}
                      onClick={() =>
                        navigate(
                          plan.customPrice
                            ? '/contact'
                            : `/subscriptions/checkout?plan=${plan.id}&cycle=${cycle}`,
                        )
                      }
                      className="w-full"
                    >
                      {plan.customPrice ? 'Contact Sales' : 'Choose Plan'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
};

export default PricingPlans;