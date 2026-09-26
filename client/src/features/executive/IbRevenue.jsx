import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const IbRevenue = function IbRevenue() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/revenue/ib', {
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
            <Briefcase size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Introducing Broker Revenue
            </Heading>
            <Text color="muted" className="text-xs">
              Broker rebates and IB revenue attributed to the platform
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={data?.total !== undefined ? `$${data.total}` : '—'}
            icon={Briefcase}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="This Month"
            value={data?.monthly !== undefined ? `$${data.monthly}` : '—'}
            icon={Briefcase}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="IB Payouts"
            value={data?.payouts !== undefined ? `$${data.payouts}` : '—'}
            icon={Briefcase}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Active IBs"
            value={data?.activeIbs || 0}
            icon={Briefcase}
            variant="default"
            loading={loading}
          />
        </div>

        {data?.monthly && data.monthly.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Monthly IB Revenue
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'revenue', name: 'Revenue', color: '#8b5cf6' }]}
                xKey="month"
                height={300}
                tooltipFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default IbRevenue;