import React, { useCallback, useEffect, useState } from 'react';
import { Shield, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';
import StatCard from '../../components/data-display/StatCard';

const RiskBehavior = function RiskBehavior() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader-intelligence/risk-behavior', {
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk Behavior
            </Heading>
            <Text color="muted" className="text-xs">
              How you manage risk and position sizing
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
          label="Avg Risk/Trade"
          value={data?.avgRiskPerTrade !== undefined ? `${data.avgRiskPerTrade}%` : '—'}
          icon={Shield}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Risk Consistency"
          value={data?.riskConsistency !== undefined ? `${data.riskConsistency}%` : '—'}
          icon={Shield}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Position Sizing Errors"
          value={data?.sizingErrors || 0}
          icon={Shield}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Max Risk Used"
          value={data?.maxRiskUsed !== undefined ? `${data.maxRiskUsed}%` : '—'}
          icon={Shield}
          variant="danger"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Risk Metrics
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
            </div>
          ))}
        </div>

        {data?.assessment ? (
          <>
            <Separator spacing="md" />
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-700">{data.assessment}</p>
            </div>
          </>
        ) : null}
      </Card>
    </Container>
  );
};

export default RiskBehavior;