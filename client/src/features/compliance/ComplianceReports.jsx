import React, { useCallback, useEffect, useState } from 'react';
import { BarChart3, RefreshCw, Loader2, Download } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import BarChart from '../../components/charts/BarChart';

const ComplianceReports = function ComplianceReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/compliance/reports?period=${period}`, {
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
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = useCallback(() => {
    window.open(`/api/compliance/reports/export?period=${period}`, '_blank');
  }, [period]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <BarChart3 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Compliance Reports
            </Heading>
            <Text color="muted" className="text-xs">
              Verification throughput, outcomes, and review metrics
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchData}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleExport}
            leadingIcon={Download}
          >
            Export
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Reviewed"
          value={data?.totalReviewed || 0}
          icon={BarChart3}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Approved"
          value={data?.approved || 0}
          icon={BarChart3}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Rejected"
          value={data?.rejected || 0}
          icon={BarChart3}
          variant="danger"
          loading={loading}
        />
        <StatCard
          label="Approval Rate"
          value={data?.approvalRate !== undefined ? `${data.approvalRate}%` : '—'}
          icon={BarChart3}
          variant="info"
          loading={loading}
        />
      </div>

      {data?.daily && data.daily.length > 0 ? (
        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            Daily Verification Volume
          </Heading>
          <div className="mt-4">
            <BarChart
              data={data.daily}
              bars={[{ dataKey: 'count', name: 'Verifications', color: '#4f46e5' }]}
              xKey="date"
              height={300}
            />
          </div>
        </Card>
      ) : null}

      {data?.breakdown && data.breakdown.length > 0 ? (
        <Card padding="lg" className="mt-4">
          <Heading level={3} size="text-base">
            Outcome Breakdown
          </Heading>
          <div className="mt-4">
            <BarChart
              data={data.breakdown}
              bars={[{ dataKey: 'count', name: 'Applications', color: '#10b981' }]}
              xKey="label"
              height={300}
            />
          </div>
        </Card>
      ) : null}
    </Container>
  );
};

export default ComplianceReports;