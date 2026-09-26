import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const ReferralCost = function ReferralCost() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/referral-cost', {
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Gift size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Referral Cost
            </Heading>
            <Text color="muted" className="text-xs">
              Total referral rewards paid out from the platform reward pool
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total Paid"
            value={data?.totalPaid !== undefined ? `$${data.totalPaid}` : '—'}
            icon={Gift}
            variant="warning"
            loading={loading}
          />
          <StatCard
            label="This Month"
            value={data?.monthly !== undefined ? `$${data.monthly}` : '—'}
            icon={Gift}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Pending"
            value={data?.pending !== undefined ? `$${data.pending}` : '—'}
            icon={Gift}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Active Referrers"
            value={data?.activeReferrers || 0}
            icon={Gift}
            variant="default"
            loading={loading}
          />
        </div>

        {data?.monthly && data.monthly.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Monthly Referral Cost
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'cost', name: 'Referral Cost', color: '#f59e0b' }]}
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

export default ReferralCost;