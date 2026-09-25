import React, { useCallback, useEffect, useState } from 'react';
import { ShieldCheck, RefreshCw, Loader2, TrendingUp } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';
import StatCard from '../../components/data-display/StatCard';

const ConfidenceEngine = function ConfidenceEngine() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/confidence', { credentials: 'include' });
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
            <ShieldCheck size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Confidence Engine
            </Heading>
            <Text color="muted" className="text-xs">
              Understand how the platform assigns confidence scores
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
          label="Average Confidence"
          value={data?.avgConfidence !== undefined ? `${data.avgConfidence}%` : '—'}
          icon={ShieldCheck}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Messages Today"
          value={data?.messagesToday || 0}
          icon={TrendingUp}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Below Threshold"
          value={data?.belowThreshold || 0}
          icon={ShieldCheck}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Threshold"
          value={data?.threshold !== undefined ? `${data.threshold}%` : '80%'}
          icon={ShieldCheck}
          variant="default"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Confidence Factors
        </Heading>
        <Text color="muted" className="mt-1 text-xs">
          Confidence is composed from multiple signals of quality.
        </Text>

        <Separator spacing="md" />

        <div className="space-y-4">
          {(data?.factors || []).map((factor) => (
            <div key={factor.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">{factor.label}</span>
                <span className="font-semibold text-slate-900">{factor.weight}% weight</span>
              </div>
              <ProgressBar
                value={factor.score || 0}
                max={100}
                size="sm"
                variant="primary"
                className="mt-1.5"
              />
              {factor.description ? (
                <p className="mt-1 text-[11px] text-slate-500">{factor.description}</p>
              ) : null}
            </div>
          ))}
        </div>

        <Separator spacing="md" />

        <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs text-slate-600">
            A confidence score is a decision input, not a guarantee of profitability. Messages
            below the configured threshold are flagged for review and never auto-executed.
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default ConfidenceEngine;