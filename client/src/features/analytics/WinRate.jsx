import React, { useCallback, useEffect, useState } from 'react';
import { Target, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import WinRateWidget from '../../components/domain/analytics/WinRateWidget';

const WinRate = function WinRate() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/win-rate', { credentials: 'include' });
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Target size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Win Rate
            </Heading>
            <Text color="muted" className="text-xs">
              Detailed win, loss, and breakeven analysis
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

      <div className="mt-6">
        <WinRateWidget
          winRate={data?.winRate}
          totalTrades={data?.totalTrades}
          winningTrades={data?.winningTrades}
          losingTrades={data?.losingTrades}
          breakevenTrades={data?.breakevenTrades}
          period={data?.period || '30d'}
          loading={loading}
        />
      </div>
    </Container>
  );
};

export default WinRate;