import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import EquityCurveChart from '../../components/charts/EquityCurveChart';
import BarChart from '../../components/charts/BarChart';

const TraderGrowth = function TraderGrowth() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/growth/traders', {
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
              Trader Growth
            </Heading>
            <Text color="muted" className="text-xs">
              Manual trader registrations and follower growth
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Traders"
            value={data?.total || 0}
            icon={Users}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="New This Month"
            value={data?.newThisMonth || 0}
            icon={Users}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="With Followers"
            value={data?.withFollowers || 0}
            icon={Users}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Avg Followers"
            value={data?.avgFollowers !== undefined ? data.avgFollowers : '—'}
            icon={Users}
            variant="default"
            loading={loading}
          />
        </div>

        {data?.growth && data.growth.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Trader Growth Over Time
            </Heading>
            <div className="mt-4">
              <EquityCurveChart
                data={data.growth}
                xKey="date"
                dataKey="traders"
                height={300}
                color="#0ea5e9"
                valueFormatter={(value) => `${value}`}
              />
            </div>
          </Card>
        ) : null}

        {data?.monthly && data.monthly.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Monthly New Traders
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'count', name: 'New Traders', color: '#0ea5e9' }]}
                xKey="month"
                height={300}
              />
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default TraderGrowth;