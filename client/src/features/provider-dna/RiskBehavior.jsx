import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const RiskBehavior = function RiskBehavior() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/risk', { credentials: 'include' });
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

  const handleBack = useCallback(() => navigate('/ai/provider-dna'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Activity size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Risk Behavior
              </Heading>
              <Text color="muted" className="text-xs">
                Aggregated risk patterns observed across providers
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

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : !data || (data.providers || []).length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No risk behavior data"
            description="Risk behavior is computed from provider trade history."
          />
        ) : (
          <ul className="space-y-4">
            {data.providers.map((provider) => (
              <li
                key={provider.providerId}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{provider.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {provider.tradesAnalyzed || 0} trades analyzed
                    </p>
                  </div>
                  {provider.riskLevel ? (
                    <Badge
                      variant={
                        provider.riskLevel === 'high'
                          ? 'danger'
                          : provider.riskLevel === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                      size="xs"
                    >
                      {provider.riskLevel} risk
                    </Badge>
                  ) : null}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Risk per Trade
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {provider.riskPerTrade || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Avg R:R
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {provider.avgRR || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Max Drawdown
                    </p>
                    <p className="mt-1 text-sm font-semibold text-rose-600">
                      {provider.maxDrawdown || '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Recovery Rate
                    </p>
                    <p className="mt-1 text-sm font-semibold text-emerald-600">
                      {provider.recoveryRate || '—'}
                    </p>
                  </div>
                </div>

                {provider.warning ? (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2.5">
                    <AlertTriangle
                      size={12}
                      className="mt-0.5 shrink-0 text-amber-600"
                      aria-hidden="true"
                    />
                    <p className="text-[11px] text-amber-800">{provider.warning}</p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default RiskBehavior;