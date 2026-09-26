import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, ArrowLeft, Loader2, RefreshCw, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const STATUS_ICONS = {
  pending: Clock,
  processing: Loader2,
  completed: CheckCircle2,
  failed: XCircle,
  rejected: XCircle,
  review: AlertTriangle,
};

const STATUS_COLORS = {
  pending: 'text-amber-600 bg-amber-50',
  processing: 'text-sky-600 bg-sky-50',
  completed: 'text-emerald-600 bg-emerald-50',
  failed: 'text-rose-600 bg-rose-50',
  rejected: 'text-rose-600 bg-rose-50',
  review: 'text-amber-600 bg-amber-50',
};

const WithdrawalStatus = function WithdrawalStatus() {
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWithdrawals = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/wallet/withdrawals?status=active', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setWithdrawals(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWithdrawals();
    const interval = setInterval(fetchWithdrawals, 20000);
    return () => clearInterval(interval);
  }, [fetchWithdrawals]);

  const handleBack = useCallback(() => navigate('/wallet'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchWithdrawals}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Clock size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Withdrawal Status
            </Heading>
            <Text color="muted" className="text-xs">
              Track your pending and processing withdrawals
            </Text>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <Card padding="lg">
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            </Card>
          ) : withdrawals.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={Clock}
                title="No active withdrawals"
                description="Your withdrawals will appear here."
              />
            </Card>
          ) : (
            withdrawals.map((withdrawal) => {
              const Icon = STATUS_ICONS[withdrawal.status] || Clock;
              const colorClass = STATUS_COLORS[withdrawal.status] || STATUS_COLORS.pending;

              return (
                <Card key={withdrawal.id} padding="lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span
                        className={[
                          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                          colorClass,
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <Icon
                          size={16}
                          className={withdrawal.status === 'processing' ? 'animate-spin' : ''}
                          aria-hidden="true"
                        />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900">
                          {withdrawal.method === 'bank' ? 'Bank Transfer' : 'Crypto'}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Requested {withdrawal.requestedAt}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-lg font-bold text-slate-900">
                        ${withdrawal.amount}
                      </p>
                      <p className="text-[11px] font-semibold capitalize text-slate-500">
                        {withdrawal.status}
                      </p>
                    </div>
                  </div>

                  {withdrawal.destination ? (
                    <div className="mt-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
                      Destination: <strong className="font-medium text-slate-700">{withdrawal.destination}</strong>
                    </div>
                  ) : null}

                  {withdrawal.estimatedArrival ? (
                    <div className="mt-1 text-xs text-slate-500">
                      Estimated arrival:{' '}
                      <strong className="font-medium text-slate-700">
                        {withdrawal.estimatedArrival}
                      </strong>
                    </div>
                  ) : null}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Container>
  );
};

export default WithdrawalStatus;