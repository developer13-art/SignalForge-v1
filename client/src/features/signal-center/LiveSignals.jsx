import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, RefreshCw, Loader2, Filter } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataGrid from '../../components/data-display/DataGrid';
import SignalCard from '../../components/domain/signal/SignalCard';
import EmptyState from '../../components/common/EmptyState';

const LiveSignals = function LiveSignals() {
  const navigate = useNavigate();
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchSignals = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`/api/signals/live?filter=${filter}`, {
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load signals');
        return;
      }

      setSignals(payload.data || []);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    fetchSignals();
    const interval = setInterval(fetchSignals, 10000);
    return () => clearInterval(interval);
  }, [fetchSignals]);

  const filters = [
    { value: 'all', label: 'All' },
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' },
    { value: 'high_confidence', label: 'High Confidence' },
    { value: 'executed', label: 'Executed' },
    { value: 'pending', label: 'Pending' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Live Signals
            </Heading>
            <Text color="muted" className="text-xs">
              Real-time signal stream across your connected sources
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSignals}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-slate-400" aria-hidden="true" />
        {filters.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={[
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              filter === f.value
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error ? (
        <Card padding="lg" className="mt-4 border-rose-200 bg-rose-50">
          <p className="text-sm text-rose-800">{error}</p>
        </Card>
      ) : null}

      <div className="mt-6">
        <DataGrid
          items={signals}
          loading={loading}
          error={error}
          columns="md"
          keyExtractor={(item) => item.id}
          renderItem={(signal) => (
            <SignalCard
              signal={signal}
              onClick={() => navigate(`/signals/${signal.id}`)}
            />
          )}
          emptyState={
            <EmptyState
              icon={Radio}
              title="No live signals"
              description="Signals will appear here as soon as your sources post them."
            />
          }
        />
      </div>
    </Container>
  );
};

export default LiveSignals;