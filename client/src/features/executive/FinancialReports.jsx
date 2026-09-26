import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, Loader2, RefreshCw, Download } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import EquityCurveChart from '../../components/charts/EquityCurveChart';

const FinancialReports = function FinancialReports() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('12m');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/executive/financial-reports?period=${period}`, {
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

  const handleBack = useCallback(() => navigate('/executive'), [navigate]);

  const handleExport = useCallback(() => {
    window.open(`/api/executive/financial-reports/export?period=${period}`, '_blank');
  }, [period]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="all">All time</option>
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

      <div className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <FileText size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Financial Reports
            </Heading>
            <Text color="muted" className="text-xs">
              Revenue, costs, and profitability reports for finance and leadership
            </Text>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Gross Revenue"
            value={data?.grossRevenue !== undefined ? `$${data.grossRevenue}` : '—'}
            icon={FileText}
            variant="primary"
            loading={loading}
          />
          <StatCard
            label="Total Costs"
            value={data?.totalCosts !== undefined ? `$${data.totalCosts}` : '—'}
            icon={FileText}
            variant="warning"
            loading={loading}
          />
          <StatCard
            label="Net Profit"
            value={data?.netProfit !== undefined ? `$${data.netProfit}` : '—'}
            icon={FileText}
            variant={Number(data?.netProfit) >= 0 ? 'success' : 'danger'}
            loading={loading}
          />
          <StatCard
            label="Margin"
            value={data?.margin !== undefined ? `${data.margin}%` : '—'}
            icon={FileText}
            variant="info"
            loading={loading}
          />
        </div>

        {data?.trend && data.trend.length > 0 ? (
          <Card padding="lg" className="mt-6">
            <Heading level={3} size="text-base">
              Revenue and Costs Over Time
            </Heading>
            <div className="mt-4">
              <EquityCurveChart
                data={data.trend}
                xKey="date"
                dataKey="net"
                baselineKey="gross"
                height={320}
                color="#10b981"
                baselineColor="#94a3b8"
                showBaseline
                valueFormatter={(value) => `$${Number(value).toLocaleString()}`}
              />
            </div>
          </Card>
        ) : null}

        {data?.breakdown && data.breakdown.length > 0 ? (
          <Card padding="lg" className="mt-4">
            <Heading level={3} size="text-base">
              Financial Breakdown
            </Heading>
            <ul className="mt-4 space-y-3">
              {data.breakdown.map((item) => (
                <li
                  key={item.label}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0"
                >
                  <span className="text-sm text-slate-600">{item.label}</span>
                  <span
                    className={[
                      'text-sm font-semibold',
                      Number(item.amount) >= 0 ? 'text-slate-900' : 'text-rose-600',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    ${item.amount}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        ) : null}
      </div>
    </Container>
  );
};

export default FinancialReports;