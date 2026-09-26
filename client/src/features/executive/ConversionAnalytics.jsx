import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const ConversionAnalytics = function ConversionAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/conversion', {
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
            <Target size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Conversion Analytics
            </Heading>
            <Text color="muted" className="text-xs">
              Funnel conversion rates from sign-up to paying customer
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Signup Rate"
            value={data?.signupRate !== undefined ? `${data.signupRate}%` : '—'}
            icon={Target}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="KYC Rate"
            value={data?.kycRate !== undefined ? `${data.kycRate}%` : '—'}
            icon={Target}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Trial to Paid"
            value={data?.trialToPaid !== undefined ? `${data.trialToPaid}%` : '—'}
            icon={Target}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Broker Connect Rate"
            value={data?.brokerConnectRate !== undefined ? `${data.brokerConnectRate}%` : '—'}
            icon={Target}
            variant="default"
            loading={loading}
          />
        </div>

        {data?.funnel && data.funnel.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Conversion Funnel
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.funnel}
                bars={[{ dataKey: 'value', name: 'Users', color: '#4f46e5' }]}
                xKey="stage"
                height={300}
              />
            </div>
          </Card>
        ) : null}

        {data?.monthly && data.monthly.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Monthly Conversion Rate
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.monthly}
                bars={[{ dataKey: 'rate', name: 'Conversion %', color: '#10b981' }]}
                xKey="month"
                height={300}
                tooltipFormatter={(value) => `${value}%`}
              />
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default ConversionAnalytics;