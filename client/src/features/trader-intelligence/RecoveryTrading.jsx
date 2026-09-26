import React, { useCallback, useEffect, useState } from 'react';
import { Zap, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import StatCard from '../../components/data-display/StatCard';
import ProgressBar from '../../components/common/ProgressBar';

const RecoveryTrading = function RecoveryTrading() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader-intelligence/recovery', {
        credentials: 'include',
      });
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Zap size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Recovery Trading
            </Heading>
            <Text color="muted" className="text-xs">
              Detects aggressive trading after losses
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

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Recovery Events"
          value={data?.recoveryEvents || 0}
          icon={Zap}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Avg Lot Increase"
          value={data?.avgLotIncrease !== undefined ? `${data.avgLotIncrease}%` : '—'}
          icon={Zap}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Recovery Success"
          value={data?.recoverySuccess !== undefined ? `${data.recoverySuccess}%` : '—'}
          icon={Zap}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Behavior Score"
          value={data?.behaviorScore !== undefined ? `${data.behaviorScore}%` : '—'}
          icon={Zap}
          variant="success"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Metrics
        </Heading>

        <Separator spacing="md" />

        <div className="space-y-4">
          {(data?.metrics || []).map((metric) => (
            <div key={metric.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{metric.label}</span>
                <span className="font-semibold text-slate-900">{metric.value}%</span>
              </div>
              <ProgressBar
                value={metric.value}
                max={100}
                size="sm"
                variant={
                  metric.value >= 80
                    ? 'success'
                    : metric.value >= 60
                    ? 'primary'
                    : metric.value >= 40
                    ? 'warning'
                    : 'danger'
                }
                className="mt-1.5"
              />
              {metric.description ? (
                <p className="mt-1 text-[11px] text-slate-500">{metric.description}</p>
              ) : null}
            </div>
          ))}
        </div>

        {data?.recommendation ? (
          <>
            <Separator spacing="md" />
            <div className="rounded-md border border-sky-200 bg-sky-50 p-3">
              <p className="text-xs font-semibold text-sky-900">Recommendation</p>
              <p className="mt-1 text-xs text-sky-800">{data.recommendation}</p>
            </div>
          </>
        ) : null}
      </Card>
    </Container>
  );
};

export default RecoveryTrading;