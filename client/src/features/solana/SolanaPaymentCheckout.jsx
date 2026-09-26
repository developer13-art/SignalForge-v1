import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Coins, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SolanaPaymentWidget from '../../components/domain/solana/SolanaPaymentWidget';

const SolanaPaymentCheckout = function SolanaPaymentCheckout() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('plan');
  const amount = searchParams.get('amount');
  const cycle = searchParams.get('cycle') || 'monthly';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/solana/payment-intent?plan=${planId}&amount=${amount}&cycle=${cycle}`,
        { credentials: 'include' },
      );
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [planId, amount, cycle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMarkPaid = useCallback(async () => {
    setProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/solana/payment/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          paymentIntentId: data?.paymentIntentId,
          planId,
          cycle,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to confirm payment');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/subscriptions', { replace: true });
      }, 2000);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setProcessing(false);
    }
  }, [data, planId, cycle, navigate]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  if (success) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            Payment submitted
          </Heading>
          <Text color="muted" className="mt-2">
            We are verifying your on-chain payment. Your subscription will be activated once
            confirmed.
          </Text>
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
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white">
              <Coins size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Pay with Solana
              </Heading>
              <Text color="muted" className="text-xs">
                Send SOL or USDC to the treasury wallet to complete your subscription
              </Text>
            </div>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            ) : data ? (
              <SolanaPaymentWidget
                amount={data.amount}
                token={data.token || 'USDC'}
                treasuryWallet={data.treasuryWallet}
                tokenPrice={data.tokenPrice}
                onMarkPaid={handleMarkPaid}
                onViewExplorer={() =>
                  window.open(
                    `https://explorer.solana.com/address/${data.treasuryWallet}`,
                    '_blank',
                  )
                }
                paid={success}
              />
            ) : (
              <Text color="muted">Unable to load payment details.</Text>
            )}
          </div>
        </Card>

        <Card padding="lg" className="h-fit">
          <Heading level={3} size="text-base">
            Order Summary
          </Heading>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Amount</span>
              <span className="text-lg font-bold text-slate-900">${amount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Billing</span>
              <span className="text-sm font-medium capitalize text-slate-900">{cycle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Network</span>
              <span className="text-sm font-medium text-slate-900">Solana</span>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-violet-200 bg-violet-50 p-3">
            <p className="text-xs text-violet-800">
              Your subscription activates automatically after the on-chain transaction is
              confirmed. This usually takes a few seconds.
            </p>
          </div>
        </Card>
      </div>
    </Container>
  );
};

export default SolanaPaymentCheckout;