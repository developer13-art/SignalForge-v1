import React, { useCallback, useEffect, useState } from 'react';
import { Copy, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import DuplicateSignalBadge from '../../components/domain/signal/DuplicateSignalBadge';
import StatCard from '../../components/data-display/StatCard';

const DuplicateDetection = function DuplicateDetection() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/duplicates', { credentials: 'include' });
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
            <Copy size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Duplicate Detection
            </Heading>
            <Text color="muted" className="text-xs">
              How the platform identifies equivalent signals across providers
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
          label="Duplicates Detected"
          value={data?.duplicatesDetected || 0}
          icon={Copy}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Prevented Trades"
          value={data?.preventedTrades || 0}
          icon={Copy}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Fingerprints"
          value={data?.fingerprints || 0}
          icon={Copy}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Detection Rate"
          value={data?.detectionRate !== undefined ? `${data.detectionRate}%` : '—'}
          icon={Copy}
          variant="info"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Recent Duplicate Groups
        </Heading>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (data?.groups || []).length === 0 ? (
          <EmptyState
            icon={Copy}
            title="No duplicates detected"
            description="Duplicate signals will be grouped here when detected."
          />
        ) : (
          <ul className="space-y-3">
            {data.groups.map((group) => (
              <li
                key={group.id}
                className="rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {group.symbol} · {group.direction}
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Detected {group.detectedAt}
                    </p>
                  </div>
                  <DuplicateSignalBadge count={group.count} size="sm" />
                </div>
                <ul className="mt-2 space-y-1">
                  {group.signals.slice(0, 3).map((signal) => (
                    <li key={signal.id} className="text-xs text-slate-600">
                      · {signal.providerName} — {signal.receivedAt}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default DuplicateDetection;