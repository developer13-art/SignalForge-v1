import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const AffiliateRevenue = function AffiliateRevenue() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/revenue/affiliate', {
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
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Affiliate Revenue
            </Heading>
            <Text color="muted" className="text-xs">
              Revenue generated through affiliate partnerships
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={data?.total !== undefined ? `$${data.total}` : '—'}
            icon={Users}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="This Month"
            value={data?.monthly !== undefined ? `$${data.monthly}` : '—'}
            icon={Users}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Commissions Paid"
            value={data?.commissions !== undefined ? `$${data.commissions}` : '—'}
            icon={Users}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Active Affiliates"
            value={data?.activeAffiliates || 0}
            icon={Users}
            variant="default"
            loading={loading}
          />
        </div>

        {data?.monthly && data.monthly.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Monthly Revenue
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'revenue', name: 'Revenue', color: '#0ea5e9' }]}
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

export default AffiliateRevenue;