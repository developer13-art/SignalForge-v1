import React, { useCallback, useEffect, useState } from 'react';
import { Activity, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import RiskAnalysisWidget from '../../components/domain/analytics/RiskAnalysisWidget';
import StatCard from '../../components/data-display/StatCard';

const RiskBehaviorAnalysis = function RiskBehaviorAnalysis() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics/risk-behavior', {
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
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Activity size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Risk Behavior Analysis
            </Heading>
            <Text color="muted" className="text-xs">
              Behavioral patterns detected in your trading history
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

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Discipline Score"
          value={data?.disciplineScore !== undefined ? `${data.disciplineScore}%` : '—'}
          icon={Activity}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Risk Consistency"
          value={data?.consistencyScore !== undefined ? `${data.consistencyScore}%` : '—'}
          icon={Activity}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Revenge Trades"
          value={data?.revengeTrades || 0}
          icon={Activity}
          variant="warning"
          loading={loading}
        />
        <StatCard
          label="Overtrading Days"
          value={data?.overtradingDays || 0}
          icon={Activity}
          variant="danger"
          loading={loading}
        />
      </div>

      <div className="mt-6">
        <RiskAnalysisWidget
          riskScore={data?.riskScore || 0}
          riskLevel={data?.riskLevel}
          metrics={data?.metrics || []}
          flags={data?.flags || []}
          loading={loading}
        />
      </div>
    </Container>
  );
};

export default RiskBehaviorAnalysis;