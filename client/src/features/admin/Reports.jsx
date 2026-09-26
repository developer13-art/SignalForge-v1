import React, { useCallback, useEffect, useState } from 'react';
import { FileText, RefreshCw, Loader2, Download } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';

const REPORTS = [
  { key: 'users', label: 'User Report', description: 'Registration, activity, and status' },
  { key: 'trades', label: 'Trading Report', description: 'Volume, profit, and execution metrics' },
  { key: 'revenue', label: 'Revenue Report', description: 'Subscriptions, payments, and revenue' },
  { key: 'kyc', label: 'KYC Report', description: 'Verification throughput and statuses' },
  { key: 'referrals', label: 'Referral Report', description: 'Referral rewards and settlements' },
  { key: 'risk', label: 'Risk Report', description: 'Risk events, blocks, and limits' },
];

const Reports = function Reports() {
  const [period, setPeriod] = useState('30d');
  const [generating, setGenerating] = useState(null);

  const handleGenerate = useCallback(
    async (report) => {
      setGenerating(report.key);
      try {
        const response = await fetch(
          `/api/admin/reports/${report.key}?period=${period}`,
          { credentials: 'include' },
        );
        const payload = await response.json();
        if (response.ok && payload.data?.downloadUrl) {
          window.open(payload.data.downloadUrl, '_blank');
        }
      } catch (_err) {
        // silent
      } finally {
        setGenerating(null);
      }
    },
    [period],
  );

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
          <FileText size={20} aria-hidden="true" />
        </span>
        <div>
          <Heading level={1} size="text-2xl">
            Reports
          </Heading>
          <Text color="muted" className="text-xs">
            Generate and download platform reports
          </Text>
        </div>
      </div>

      <Card padding="lg" className="mt-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-600">Period</span>
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
            <option value="all">All time</option>
          </select>
        </div>

        <Separator spacing="md" />

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {REPORTS.map((report) => (
            <div
              key={report.key}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">{report.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{report.description}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleGenerate(report)}
                disabled={generating === report.key}
                leadingIcon={generating === report.key ? Loader2 : Download}
              >
                {generating === report.key ? 'Generating...' : 'Generate'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </Container>
  );
};

export default Reports;