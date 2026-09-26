import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import EquityCurveChart from '../../components/charts/EquityCurveChart';
import BarChart from '../../components/charts/BarChart';

const UserGrowth = function UserGrowth() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/growth/users', {
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
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              User Growth
            </Heading>
            <Text color="muted" className="text-xs">
              New user registrations and growth trends
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={data?.total || 0}
            icon={TrendingUp}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="New This Month"
            value={data?.newThisMonth || 0}
            icon={TrendingUp}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Growth Rate"
            value={data?.growthRate !== undefined ? `${data.growthRate}%` : '—'}
            icon={TrendingUp}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="KYC Verified"
            value={data?.kycVerified || 0}
            icon={TrendingUp}
            variant="default"
            loading={loading}
          />
        </div>

        {data?.growth && data.growth.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              User Growth Over Time
            </Heading>
            <div className="mt-4">
              <EquityCurveChart
                data={data.growth}
                xKey="date"
                dataKey="users"
                height={300}
                color="#4f46e5"
                valueFormatter={(value) => `${value}`}
              />
            </div>
          </Card>
        ) : null}

        {data?.monthly && data.monthly.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Monthly New Users
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'count', name: 'New Users', color: '#0ea5e9' }]}
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

export default UserGrowth;