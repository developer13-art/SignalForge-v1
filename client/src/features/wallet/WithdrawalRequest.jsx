import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownToLine, ArrowLeft, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import WithdrawalForm from '../../components/domain/wallet/WithdrawalForm';

const WithdrawalRequest = function WithdrawalRequest() {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wallet/balance', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setBalance(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const handleSubmit = useCallback(
    async (values) => {
      setError(null);
      setSubmitting(true);

      try {
        const response = await fetch('/api/wallet/withdrawals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(values),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Failed to submit withdrawal request');
          return;
        }

        navigate('/wallet/withdrawals/status');
      } catch (_err) {
        setError('Unable to reach the server');
      } finally {
        setSubmitting(false);
      }
    },
    [navigate],
  );

  const handleBack = useCallback(() => navigate('/wallet'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <ArrowDownToLine size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Request Withdrawal
            </Heading>
            <Text color="muted" className="text-xs">
              Withdraw funds to your bank or crypto wallet
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : (
            <WithdrawalForm
              available={balance?.availableBalance || 0}
              currency={balance?.currency || 'USD'}
              kycVerified={balance?.kycVerified !== false}
              onSubmit={handleSubmit}
              onCancel={handleBack}
              submitting={submitting}
              error={error}
            />
          )}
        </div>
      </Card>
    </Container>
  );
};

export default WithdrawalRequest;