import React, { useCallback, useEffect, useState } from 'react';
import { Hand, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const ManualInterventions = function ManualInterventions() {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterventions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trading/manual-interventions', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setInterventions(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterventions();
  }, [fetchInterventions]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Hand size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Manual Interventions
            </Heading>
            <Text color="muted" className="text-xs">
              Trades you modified or closed manually — diverging from the provider
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchInterventions}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : interventions.length === 0 ? (
          <EmptyState
            icon={Hand}
            title="No manual interventions"
            description="When you manually modify or close a trade, it will be logged here."
          />
        ) : (
          <ul className="space-y-3">
            {interventions.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {item.symbol} · {item.action}
                      </p>
                      <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                        Manual
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Provider recommended: <strong className="font-medium">{item.providerAction}</strong>
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      You performed: <strong className="font-medium">{item.userAction}</strong>
                    </p>
                  </div>
                  <time className="shrink-0 text-[11px] text-slate-400">{item.time}</time>
                </div>

                {item.impact ? (
                  <div className="mt-3 flex items-start gap-2 rounded-md border border-sky-200 bg-sky-50 p-2.5">
                    <AlertCircle
                      size={12}
                      className="mt-0.5 shrink-0 text-sky-600"
                      aria-hidden="true"
                    />
                    <p className="text-[11px] text-sky-800">{item.impact}</p>
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

export default ManualInterventions;