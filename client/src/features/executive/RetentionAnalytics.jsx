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
import ProgressBar from '../../components/common/ProgressBar';

const RetentionAnalytics = function RetentionAnalytics() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/executive/retention', {
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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <Target size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Retention Analytics
            </Heading>
            <Text color="muted" className="text-xs">
              User retention and churn metrics
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Day 1 Retention"
            value={data?.day1 !== undefined ? `${data.day1}%` : '—'}
            icon={Target}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Day 7 Retention"
            value={data?.day7 !== undefined ? `${data.day7}%` : '—'}
            icon={Target}
            variant="success"
            loading={loading}
          />
          <StatCard
            label="Day 30 Retention"
            value={data?.day30 !== undefined ? `${data.day30}%` : '—'}
            icon={Target}
            variant="info"
            loading={loading}
          />
          <StatCard
            label="Churn Rate"
            value={data?.churnRate !== undefined ? `${data.churnRate}%` : '—'}
            icon={Target}
            variant="warning"
            loading={loading}
          />
        </div>

        {data?.cohorts && data.cohorts.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Retention by Cohort
            </Heading>
            <div className="mt-4">
              <BarChart
                data={data.cohorts}
                bars={[{ dataKey: 'retention', name: 'Retention %', color: '#10b981' }]}
                xKey="cohort"
                height={300}
                tooltipFormatter={(value) => `${value}%`}
              />
            </div>
          </Card>
        ) : null}

        {data?.metrics && data.metrics.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Key Retention Metrics
            </Heading>
            <div className="mt-4 space-y-4">
              {data.metrics.map((metric) => (
                <div key={metric.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{metric.label}</span>
                    <span className="font-semibold text-slate-900">{metric.value}</span>
                  </div>
                  {metric.percent !== undefined ? (
                    <ProgressBar
                      value={metric.percent}
                      max={100}
                      size="sm"
                      variant="primary"
                      className="mt-1.5"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default RetentionAnalytics;