import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import RiskChecksList from '../../components/domain/risk/RiskChecksList';

const RiskDecisionReplay = function RiskDecisionReplay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signalId = searchParams.get('signalId');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReplay = useCallback(async () => {
    if (!signalId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/replay/risk/${signalId}`, {
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
  }, [signalId]);

  useEffect(() => {
    fetchReplay();
  }, [fetchReplay]);

  const handleBack = useCallback(() => navigate('/replay'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchReplay}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk Decision Replay
            </Heading>
            <Text color="muted" className="text-xs">
              {signalId ? `Signal #${signalId}` : 'No signal selected'}
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {!signalId ? (
            <EmptyState
              icon={Shield}
              title="No signal selected"
              description="Return to the Replay Center and select a signal to inspect its risk decision."
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : !data ? (
            <EmptyState
              icon={Shield}
              title="No risk decision data"
              description="The signal does not have a risk decision record."
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Outcome
                  </p>
                  <p
                    className={[
                      'mt-1 text-sm font-semibold capitalize',
                      data.outcome === 'approved' ? 'text-emerald-600' : 'text-rose-600',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {data.outcome}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Risk Profile
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.riskProfile}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Decision Time
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.decidedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Latency
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.latency} ms
                  </p>
                </div>
              </div>

              <Separator spacing="md" />

              <RiskChecksList
                checks={data.checks || []}
                overallResult={data.outcome}
                title="Risk Checks"
                description="Every risk check evaluated for this signal"
              />
            </div>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default RiskDecisionReplay;