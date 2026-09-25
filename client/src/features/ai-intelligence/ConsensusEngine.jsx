import React, { useCallback, useEffect, useState } from 'react';
import { Layers, RefreshCw, Loader2, Users } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import ConsensusIndicator from '../../components/domain/signal/ConsensusIndicator';
import StatCard from '../../components/data-display/StatCard';

const ConsensusEngine = function ConsensusEngine() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/consensus', { credentials: 'include' });
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Layers size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Consensus Engine
            </Heading>
            <Text color="muted" className="text-xs">
              Multi-provider agreement analysis
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
          label="Consensus Today"
          value={data?.consensusToday || 0}
          icon={Layers}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Avg Agreement"
          value={data?.avgAgreement !== undefined ? `${data.avgAgreement}%` : '—'}
          icon={Users}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Conflicts"
          value={data?.conflicts || 0}
          icon={Layers}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Resolved"
          value={data?.resolved || 0}
          icon={Layers}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Recent Consensus Events
        </Heading>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (data?.events || []).length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No consensus events"
            description="Consensus events will appear here as providers overlap."
          />
        ) : (
          <ul className="space-y-3">
            {data.events.map((event) => (
              <li key={event.id}>
                <ConsensusIndicator
                  direction={event.direction}
                  buyCount={event.buyCount}
                  sellCount={event.sellCount}
                  agreement={event.agreement}
                  totalProviders={event.totalProviders}
                  size="md"
                />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default ConsensusEngine;