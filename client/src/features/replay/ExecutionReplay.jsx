import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Zap, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import CodeBlock from '../../components/data-display/CodeBlock';

const ExecutionReplay = function ExecutionReplay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tradeId = searchParams.get('tradeId');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReplay = useCallback(async () => {
    if (!tradeId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/replay/execution/${tradeId}`, {
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
  }, [tradeId]);

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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Zap size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Execution Replay
            </Heading>
            <Text color="muted" className="text-xs">
              {tradeId ? `Trade #${tradeId}` : 'No trade selected'}
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {!tradeId ? (
            <EmptyState
              icon={Zap}
              title="No trade selected"
              description="Return to the Replay Center and select a trade to inspect execution."
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : !data ? (
            <EmptyState
              icon={Zap}
              title="No execution data"
              description="The trade does not have execution records."
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Symbol
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{data.symbol}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Direction
                  </p>
                  <p className="mt-1 text-sm font-medium uppercase text-slate-900">
                    {data.direction}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Requested Price
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.requestedPrice}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Executed Price
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.executedPrice}
                  </p>
                </div>
              </div>

              <Separator spacing="md" />

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Volume
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.volume}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Latency
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.latency} ms</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Retries
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.retries || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Ticket
                  </p>
                  <p className="mt-1 font-mono text-xs font-medium text-slate-900">
                    {data.ticket || '—'}
                  </p>
                </div>
              </div>

              {data.brokerResponse ? (
                <>
                  <Separator spacing="md" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Broker Response
                    </p>
                    <CodeBlock
                      code={JSON.stringify(data.brokerResponse, null, 2)}
                      language="json"
                      size="sm"
                      showCopy
                      className="mt-2"
                    />
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

export default ExecutionReplay;