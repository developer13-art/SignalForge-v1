import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import StatCard from '../../components/data-display/StatCard';

const SubscriptionUsage = function SubscriptionUsage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscriptions/usage', { credentials: 'include' });
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

  const handleBack = useCallback(() => navigate('/subscriptions'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
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

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Subscription Usage
            </Heading>
            <Text color="muted" className="text-xs">
              Track how much of your plan you've used this period
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Plan"
            value={data?.planName || '—'}
            icon={Activity}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Period Start"
            value={data?.periodStart || '—'}
            icon={Activity}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Period End"
            value={data?.periodEnd || '—'}
            icon={Activity}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Days Remaining"
            value={data?.daysRemaining || 0}
            icon={Activity}
            variant="success"
            loading={loading}
          />
        </div>

        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Usage Breakdown
          </Heading>

          <div className="mt-4 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            ) : (
              (data?.metrics || []).map((metric) => {
                const percent = metric.limit
                  ? Math.min(100, (metric.used / metric.limit) * 100)
                  : 0;
                return (
                  <div key={metric.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-600">{metric.label}</span>
                      <span className="font-semibold text-slate-900">
                        {metric.used} / {metric.limit} {metric.unit || ''}
                      </span>
                    </div>
                    <ProgressBar
                      value={percent}
                      max={100}
                      size="sm"
                      variant={
                        percent > 90
                          ? 'danger'
                          : percent > 70
                          ? 'warning'
                          : 'success'
                      }
                      className="mt-1.5"
                    />
                  </div>
                );
              })
            )}
          </div>

          {data?.metrics?.some((m) => m.used >= m.limit) ? (
            <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-semibold text-amber-900">
                You have reached a plan limit
              </p>
              <p className="mt-1 text-xs text-amber-800">
                Consider upgrading to unlock additional capacity.
              </p>
              <div className="mt-3">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/subscriptions/upgrade')}
                >
                  Upgrade Plan
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </Container>
  );
};

export default SubscriptionUsage;