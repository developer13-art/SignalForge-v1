import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard,
  RefreshCw,
  Loader2,
  ArrowRight,
  Calendar,
  Activity,
  XCircle,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import SubscriptionStatusBadge from '../../components/domain/subscription/SubscriptionStatusBadge';
import ProgressBar from '../../components/common/ProgressBar';

const MySubscription = function MySubscription() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/current', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
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

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <CreditCard size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              My Subscription
            </Heading>
            <Text color="muted" className="text-xs">
              Details about your current plan and usage
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : data ? (
          <div className="space-y-4">
            <Card padding="lg">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Heading level={3} size="text-xl">
                      {data.planName}
                    </Heading>
                    <SubscriptionStatusBadge status={data.status} size="sm" />
                  </div>
                  <Text color="muted" className="mt-1">
                    {data.description}
                  </Text>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Amount
                  </p>
                  <p className="text-2xl font-bold text-slate-900">${data.price}</p>
                  <p className="text-[11px] text-slate-500">per {data.cycle}</p>
                </div>
              </div>

              <Separator spacing="md" />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    <Calendar size={10} aria-hidden="true" />
                    Started
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.startedAt}</p>
                </div>
                <div>
                  <p className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    <Calendar size={10} aria-hidden="true" />
                    Renews
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.renewsAt}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Days Remaining
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.daysRemaining}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Auto Renew
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.autoRenew ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="lg">
              <Heading level={3} size="text-base">
                Usage
              </Heading>

              <div className="mt-4 space-y-4">
                {(data.usage || []).map((item) => (
                  <div key={item.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">{item.label}</span>
                      <span className="font-semibold text-slate-900">
                        {item.used} / {item.limit}
                      </span>
                    </div>
                    <ProgressBar
                      value={item.used}
                      max={item.limit}
                      size="sm"
                      variant={
                        item.used / item.limit > 0.9
                          ? 'danger'
                          : item.used / item.limit > 0.7
                          ? 'warning'
                          : 'success'
                      }
                      className="mt-1.5"
                    />
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/subscriptions/usage')}
                leadingIcon={Activity}
              >
                View Usage
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/subscriptions/upgrade')}
                leadingIcon={ArrowRight}
              >
                Upgrade Plan
              </Button>
              <Button
                variant="danger"
                onClick={() => navigate('/subscriptions/cancel')}
                leadingIcon={XCircle}
              >
                Cancel Subscription
              </Button>
            </div>
          </div>
        ) : (
          <Card padding="lg">
            <Text color="muted">No active subscription.</Text>
            <div className="mt-4">
              <Button variant="primary" onClick={() => navigate('/subscriptions/plans')}>
                View Plans
              </Button>
            </div>
          </Card>
        )}
      </div>
    </Container>
  );
};

export default MySubscription;