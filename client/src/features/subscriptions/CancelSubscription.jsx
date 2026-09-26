import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const CancelSubscription = function CancelSubscription() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/current', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setSubscription(payload.data);
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

  const handleCancel = useCallback(async () => {
    setCancelling(true);
    try {
      await fetch('/api/subscriptions/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason }),
      });
      setConfirmOpen(false);
      navigate('/subscriptions');
    } catch (_err) {
      // silent
    } finally {
      setCancelling(false);
    }
  }, [reason, navigate]);

  const handleBack = useCallback(() => navigate('/subscriptions'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <XCircle size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Cancel Subscription
            </Heading>
            <Text color="muted" className="text-xs">
              We are sorry to see you go
            </Text>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <Separator spacing="md" />

            <Alert variant="warning" size="sm">
              <p className="flex items-start gap-2 text-xs">
                <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  When your subscription ends, automated trading will be disabled. You will
                  still have access to your accounts, history, and analytics.
                </span>
              </p>
            </Alert>

            <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Current Plan
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                {subscription?.planName}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Active until {subscription?.renewsAt}
              </p>
            </div>

            <div className="mt-6">
              <label className="text-sm font-medium text-slate-700">
                Why are you cancelling? (optional)
              </label>
              <textarea
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Let us know how we can improve..."
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="mt-8 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={handleBack}>
                Keep Subscription
              </Button>
              <Button variant="danger" onClick={() => setConfirmOpen(true)} disabled={cancelling}>
                Cancel Subscription
              </Button>
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleCancel}
        variant="danger"
        title="Cancel subscription"
        description="Your subscription will remain active until the end of the current period. After that, automated trading will stop."
        confirmLabel="Confirm Cancellation"
        confirmLoading={cancelling}
      />
    </Container>
  );
};

export default CancelSubscription;