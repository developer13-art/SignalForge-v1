import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import ConsensusIndicator from '../../components/domain/signal/ConsensusIndicator';

const ProviderConsensus = function ProviderConsensus() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConsensus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/consensus', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setGroups(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsensus();
  }, [fetchConsensus]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Layers size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Consensus
            </Heading>
            <Text color="muted" className="text-xs">
              Multi-provider agreement analysis across active signals
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchConsensus}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <Card padding="lg">
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          </Card>
        ) : groups.length === 0 ? (
          <Card padding="lg">
            <EmptyState
              icon={Layers}
              title="No consensus signals"
              description="When multiple providers signal the same symbol, consensus will appear here."
            />
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group.symbol} padding="lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Heading level={3} size="text-base">
                    {group.symbol}
                  </Heading>
                  <Text color="muted" className="mt-1 text-xs">
                    {group.providersCount} providers active
                  </Text>
                </div>
              </div>

              <div className="mt-4">
                <ConsensusIndicator
                  direction={group.direction}
                  buyCount={group.buyCount}
                  sellCount={group.sellCount}
                  agreement={group.agreement}
                  totalProviders={group.providersCount}
                />
              </div>

              <div className="mt-4 space-y-2">
                {group.providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => navigate(`/providers/${provider.id}`)}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-2.5 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {provider.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Confidence {provider.confidence}%
                      </p>
                    </div>
                    <span
                      className={[
                        'shrink-0 rounded px-2 py-0.5 text-[10px] font-bold uppercase',
                        provider.direction === 'BUY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {provider.direction}
                    </span>
                  </button>
                ))}
              </div>
            </Card>
          ))
        )}
      </div>
    </Container>
  );
};

export default ProviderConsensus;