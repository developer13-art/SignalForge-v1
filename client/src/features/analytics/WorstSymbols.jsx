import React, { useCallback, useEffect, useState } from 'react';
import { TrendingDown, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SymbolPerformanceWidget from '../../components/domain/analytics/SymbolPerformanceWidget';

const WorstSymbols = function WorstSymbols() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/symbols?sort=worst', {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <TrendingDown size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Worst Symbols
            </Heading>
            <Text color="muted" className="text-xs">
              Your lowest performing instruments
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
        <SymbolPerformanceWidget
          symbols={data?.symbols || []}
          maxItems={20}
          currency={data?.currency || 'USD'}
          loading={loading}
        />
      </div>
    </Container>
  );
};

export default WorstSymbols;