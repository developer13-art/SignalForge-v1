import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, ArrowLeft, Loader2, CheckCircle2, Lock } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';
import PaymentMethodSelector from '../../components/domain/payment/PaymentMethodSelector';
import StripePaymentForm from '../../components/domain/payment/StripePaymentForm';
import PaystackPaymentForm from '../../components/domain/payment/PaystackPaymentForm';
import SolanaPaymentForm from '../../components/domain/payment/SolanaPaymentForm';

const PAYMENT_METHODS = [
  { id: 'stripe', label: 'Card (Stripe)', description: 'Global card payment', type: 'stripe' },
  { id: 'paystack', label: 'Card (Paystack)', description: 'Nigeria and Africa', type: 'paystack' },
  { id: 'solana', label: 'Solana', description: 'Pay with SOL or USDC', type: 'solana' },
];

const SubscriptionCheckout = function SubscriptionCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planId = searchParams.get('plan');
  const cycle = searchParams.get('cycle') || 'monthly';

  const [plan, setPlan] = useState(null);
  const [method, setMethod] = useState('stripe');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchPlan = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/subscriptions/plans/${planId}?cycle=${cycle}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setPlan(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [planId, cycle]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  const handleSubmit = useCallback(
    async (paymentData) => {
      setError(null);
      setSubmitting(true);

      try {
        const response = await fetch('/api/subscriptions/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            planId,
            cycle,
            method,
            paymentData,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Payment failed');
          return;
        }

        if (payload.data?.redirectUrl) {
          window.location.href = payload.data.redirectUrl;
          return;
        }

        setSuccess(true);
      } catch (_err) {
        setError('Unable to reach the server');
      } finally {
        setSubmitting(false);
      }
    },
    [planId, cycle, method],
  );

  const handleBack = useCallback(() => navigate('/subscriptions/plans'), [navigate]);

  if (success) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={1} className="mt-6">
            Payment successful
          </Heading>
          <Text color="muted" className="mt-2">
            Your subscription is now active. You can start trading immediately.
          </Text>
          <div className="mt-8">
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Continue to Dashboard
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <Card padding="lg">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Lock size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Complete Your Subscription
              </Heading>
              <Text color="muted" className="text-xs">
                Choose a payment method to activate your plan
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

          <Separator spacing="md" />

          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold text-slate-800">Payment Method</p>
                <div className="mt-3">
                  <PaymentMethodSelector
                    methods={PAYMENT_METHODS}
                    value={method}
                    onChange={setMethod}
                    columns={3}
                  />
                </div>
              </div>

              <Separator spacing="md" />

              {method === 'stripe' ? (
                <StripePaymentForm
                  amount={plan?.price}
                  currency={plan?.currency || 'USD'}
                  onSubmit={handleSubmit}
                  onCancel={handleBack}
                  submitting={submitting}
                  error={error}
                />
              ) : method === 'paystack' ? (
                <PaystackPaymentForm
                  amount={plan?.price}
                  currency="NGN"
                  onSubmit={handleSubmit}
                  onCancel={handleBack}
                  submitting={submitting}
                  error={error}
                />
              ) : (
                <SolanaPaymentForm
                  amount={plan?.price}
                  currency={plan?.currency || 'USD'}
                  treasuryWallet={plan?.treasuryWallet}
                  tokenPrices={plan?.tokenPrices}
                  onSubmit={handleSubmit}
                  onCancel={handleBack}
                  submitting={submitting}
                  error={error}
                />
              )}
            </>
          )}
        </Card>

        <Card padding="lg" className="h-fit">
          <Heading level={3} size="text-base">
            Order Summary
          </Heading>

          {plan ? (
            <>
              <Separator spacing="sm" />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Plan</span>
                  <span className="text-sm font-medium text-slate-900">{plan.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Billing</span>
                  <span className="text-sm font-medium capitalize text-slate-900">{cycle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Amount</span>
                  <span className="text-lg font-bold text-slate-900">
                    ${plan.price}
                  </span>
                </div>
              </div>

              <Separator spacing="sm" />

              <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                <p className="text-xs font-semibold text-emerald-900">
                  7-day free trial included
                </p>
                <p className="mt-1 text-[11px] text-emerald-800">
                  Cancel anytime during the trial for a full refund.
                </p>
              </div>
            </>
          ) : null}
        </Card>
      </div>
    </Container>
  );
};

export default SubscriptionCheckout;