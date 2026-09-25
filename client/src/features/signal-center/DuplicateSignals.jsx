import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import DuplicateSignalBadge from '../../components/domain/signal/DuplicateSignalBadge';

const DuplicateSignals = function DuplicateSignals() {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDuplicates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/signals/duplicates', {
        credentials: 'include',
      });
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
    fetchDuplicates();
  }, [fetchDuplicates]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Copy size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Duplicate Signals
            </Heading>
            <Text color="muted" className="text-xs">
              Groups of equivalent signals detected across providers
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchDuplicates}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6 space-y-4">
        {groups.length === 0 && !loading ? (
          <Card padding="lg">
            <EmptyState
              icon={Copy}
              title="No duplicate signals detected"
              description="The platform has not found equivalent signals across your sources."
            />
          </Card>
        ) : (
          groups.map((group, index) => (
            <Card key={group.key || index} padding="lg">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <Heading level={3} size="text-base">
                    {group.symbol} · {group.direction}
                  </Heading>
                  <Text color="muted" className="mt-1 text-xs">
                    {group.signals.length} equivalent signal
                    {group.signals.length !== 1 ? 's' : ''} detected
                  </Text>
                </div>
                <DuplicateSignalBadge count={group.signals.length} size="sm" />
              </div>

              <div className="mt-4 space-y-2">
                {group.signals.map((signal) => (
                  <button
                    key={signal.id}
                    type="button"
                    onClick={() => navigate(`/signals/${signal.id}`)}
                    className="flex w-full items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-800">
                        {signal.providerName || 'Unknown provider'}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {signal.entry || 'Market'} · SL {signal.stopLoss || '—'} ·{' '}
                        {signal.createdAt}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-indigo-600">
                      View
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

export default DuplicateSignals;