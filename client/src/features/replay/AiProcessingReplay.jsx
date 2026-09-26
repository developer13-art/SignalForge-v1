import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Brain, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import CodeBlock from '../../components/data-display/CodeBlock';
import EmptyState from '../../components/common/EmptyState';
import SignalConfidenceBadge from '../../components/domain/signal/SignalConfidenceBadge';

const AiProcessingReplay = function AiProcessingReplay() {
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
      const response = await fetch(`/api/replay/ai/${signalId}`, {
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Brain size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              AI Processing Replay
            </Heading>
            <Text color="muted" className="text-xs">
              {signalId ? `Signal #${signalId}` : 'No signal selected'}
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {!signalId ? (
            <EmptyState
              icon={Brain}
              title="No signal selected"
              description="Return to the Replay Center and select a signal to inspect AI processing."
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : !data ? (
            <EmptyState
              icon={Brain}
              title="No AI processing data"
              description="The signal does not have AI processing records."
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Model
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.model}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Version
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.version}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Confidence
                  </p>
                  <div className="mt-1">
                    <SignalConfidenceBadge confidence={data.confidence} size="sm" showLabel />
                  </div>
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

              {data.input ? (
                <>
                  <Separator spacing="md" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Input
                    </p>
                    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="whitespace-pre-wrap text-sm text-slate-700">
                        {data.input}
                      </p>
                    </div>
                  </div>
                </>
              ) : null}

              {data.output ? (
                <>
                  <Separator spacing="md" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Parsed Output
                    </p>
                    <CodeBlock
                      code={JSON.stringify(data.output, null, 2)}
                      language="json"
                      size="sm"
                      showCopy
                      className="mt-2"
                    />
                  </div>
                </>
              ) : null}

              {data.reasoning ? (
                <>
                  <Separator spacing="md" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Reasoning
                    </p>
                    <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-sm text-slate-700">{data.reasoning}</p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default AiProcessingReplay;