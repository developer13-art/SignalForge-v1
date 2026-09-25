import React, { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import StatCard from '../../components/data-display/StatCard';

const RiskIntelligence = function RiskIntelligence() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/risk-intelligence', { credentials: 'include' });
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
            <ShieldAlert size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk Intelligence
            </Heading>
            <Text color="muted" className="text-xs">
              AI-detected risk signals across your providers and messages
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
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="High-Risk Messages"
          value={data?.highRiskMessages || 0}
          icon={AlertTriangle}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Flagged Providers"
          value={data?.flaggedProviders || 0}
          icon={ShieldAlert}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Cleared Today"
          value={data?.clearedToday || 0}
          icon={CheckCircle2}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Risk Score"
          value={data?.riskScore !== undefined ? `${data.riskScore}/100` : '—'}
          icon={ShieldAlert}
          variant="default"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Detected Risk Flags
        </Heading>

        <Separator spacing="md" />

        <ul className="space-y-3">
          {(data?.flags || []).map((flag, index) => (
            <li
              key={index}
              className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
            >
              <AlertTriangle
                size={16}
                className={[
                  'mt-0.5 shrink-0',
                  flag.severity === 'high'
                    ? 'text-rose-600'
                    : flag.severity === 'medium'
                    ? 'text-amber-600'
                    : 'text-sky-600',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{flag.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{flag.description}</p>
                {flag.provider ? (
                  <p className="mt-1 text-[11px] text-slate-500">
                    Provider: <strong className="font-medium">{flag.provider}</strong>
                  </p>
                ) : null}
              </div>
              <span
                className={[
                  'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                  flag.severity === 'high'
                    ? 'bg-rose-50 text-rose-700'
                    : flag.severity === 'medium'
                    ? 'bg-amber-50 text-amber-700'
                    : 'bg-sky-50 text-sky-700',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {flag.severity}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </Container>
  );
};

export default RiskIntelligence;