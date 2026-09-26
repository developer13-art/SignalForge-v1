import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader2, CheckCircle2, Server, Shield } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const SubscribeToProvider = function SubscribeToProvider() {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planId = searchParams.get('plan');

  const [provider, setProvider] = useState(null);
  const [plans, setPlans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(planId || '');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [riskProfile, setRiskProfile] = useState('default');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [providerRes, accountsRes] = await Promise.all([
        fetch(`/api/marketplace/providers/${providerId}`, { credentials: 'include' }),
        fetch('/api/brokers/accounts', { credentials: 'include' }),
      ]);

      const providerPayload = await providerRes.json();
      const accountsPayload = await accountsRes.json();

      if (providerRes.ok) {
        setProvider(providerPayload.data?.provider);
        setPlans(providerPayload.data?.plans || []);
        if (!planId && providerPayload.data?.plans?.[0]) {
          setSelectedPlan(providerPayload.data.plans[0].id);
        }
      }

      if (accountsRes.ok) {
        setAccounts(accountsPayload.data || []);
        if (accountsPayload.data?.[0]) {
          setSelectedAccount(accountsPayload.data[0].id);
        }
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [providerId, planId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!selectedPlan) {
      setError('Please select a plan');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/subscriptions/provider', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          providerId,
          planId: selectedPlan,
          brokerAccountId: selectedAccount || null,
          riskProfile,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to subscribe');
        return;
      }

      navigate('/subscriptions', { replace: true });
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSubmitting(false);
    }
  }, [providerId, selectedPlan, selectedAccount, riskProfile, navigate]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Subscribe to {provider?.name || 'Provider'}
            </Heading>
            <Text color="muted" className="text-xs">
              Choose a plan and configure how signals will be applied
            </Text>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <Separator spacing="md" />

            <div className="space-y-6">
              <div>
                <Heading level={3} size="text-base">
                  Select a plan
                </Heading>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {plans.map((plan) => {
                    const isSelected = selectedPlan === plan.id;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPlan(plan.id)}
                        className={[
                          'rounded-lg border-2 p-4 text-left transition-colors',
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 bg-white hover:border-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-900">{plan.name}</p>
                          {isSelected ? (
                            <CheckCircle2
                              size={16}
                              className="text-indigo-600"
                              aria-hidden="true"
                            />
                          ) : null}
                        </div>
                        <p className="mt-1 text-lg font-bold text-slate-900">
                          ${plan.price}
                          <span className="text-xs font-normal text-slate-500">
                            /{plan.period}
                          </span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Heading level={3} size="text-base">
                  Trading account
                </Heading>
                <Text color="muted" className="mt-1 text-xs">
                  Choose which broker account will execute signals from this provider.
                </Text>

                {accounts.length === 0 ? (
                  <Alert variant="warning" size="sm" className="mt-3">
                    <p className="text-xs">
                      You have no broker accounts connected. You can still subscribe and connect
                      an account later.
                    </p>
                  </Alert>
                ) : (
                  <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {accounts.map((account) => {
                      const isSelected = selectedAccount === account.id;
                      return (
                        <button
                          key={account.id}
                          type="button"
                          onClick={() => setSelectedAccount(account.id)}
                          className={[
                            'flex items-center gap-3 rounded-lg border-2 p-3 text-left transition-colors',
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-slate-200 bg-white hover:border-slate-300',
                          ]
                            .filter(Boolean)
                            .join(' ')}
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            <Server size={14} aria-hidden="true" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {account.nickname || account.broker}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {account.platform} · {account.login}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <FormField label="Risk Profile" description="Risk settings to apply to this subscription">
                {({ id }) => (
                  <select
                    id={id}
                    value={riskProfile}
                    onChange={(event) => setRiskProfile(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="default">Default Risk Profile</option>
                    <option value="conservative">Conservative</option>
                    <option value="balanced">Balanced</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                )}
              </FormField>
            </div>

            <div className="mt-8 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting || !selectedPlan}
              >
                {submitting ? 'Subscribing...' : 'Confirm Subscription'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default SubscribeToProvider;