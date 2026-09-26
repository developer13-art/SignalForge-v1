import React, { useCallback, useEffect, useState } from 'react';
import { Radio, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import SignalMonitorTable from '../../components/domain/admin/SignalMonitorTable';

const LiveSignalMonitor = function LiveSignalMonitor() {
  const [data, setData] = useState(null);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/signals/live', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setSignals(payload.data?.items || []);
        setData(payload.data?.summary);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Live Signal Monitor
            </Heading>
            <Text color="muted" className="text-xs">
              Real-time view of signals processed across the platform
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

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Signals Today"
          value={data?.signalsToday || 0}
          icon={Radio}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Executed"
          value={data?.executed || 0}
          icon={Radio}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Rejected"
          value={data?.rejected || 0}
          icon={Radio}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Failed Parse"
          value={data?.failedParse || 0}
          icon={Radio}
          variant="danger"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <SignalMonitorTable
          signals={signals}
          loading={loading}
          showProvider
          showSource
          showConfidence
        />
      </Card>
    </Container>
  );
};

export default LiveSignalMonitor;