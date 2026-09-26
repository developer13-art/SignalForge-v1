import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const TradingVolume = function TradingVolume() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/trading-volume', {
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

  const handleBack = useCallback(() => navigate('/executive'), [navigate]);

  return (
    <Container size="xl" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trading Volume
            </Heading>
            <Text color="muted" className="text-xs">
              Total trading volume executed through the platform
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Volume"
            value={data?.totalVolume !== undefined ? `$${data.totalVolume}` : '—'}
            icon={Activity}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="This Month"
            value={data?.monthlyVolume !== undefined ? `$${data.monthlyVolume}` : '—'}
            icon={Activity}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Total Trades"
            value={data?.totalTrades || 0}
            icon={Activity}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Avg Trade Size"
            value={data?.avgTradeSize !== undefined ? `$${data.avgTradeSize}` : '—'}
            icon={Activity}
            variant="default"
            loading={loading}
          />
        </div>

        {data?.monthly && data.monthly.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Monthly Volume
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'volume', name: 'Volume', color: '#4f46e5' }]}
                xKey="month"
                height={300}
                tooltipFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </div>
          </Card>
        ) : null}

        {data?.symbols && data.symbols.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Volume by Symbol
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.symbols}
                bars={[{ dataKey: 'volume', name: 'Volume', color: '#10b981' }]}
                xKey="symbol"
                height={300}
                horizontal
                tooltipFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default TradingVolume;