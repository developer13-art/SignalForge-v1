import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const REPORT_TYPES = [
  { value: 'performance', label: 'Performance Summary', description: 'Full P/L and metrics overview' },
  { value: 'trades', label: 'Trade History', description: 'All executed trades with details' },
  { value: 'equity', label: 'Equity Report', description: 'Equity curve and snapshots' },
  { value: 'risk', label: 'Risk Report', description: 'Risk events and limits compliance' },
  { value: 'provider', label: 'Provider Performance', description: 'Results by provider' },
  { value: 'tax', label: 'Tax Report', description: 'Realized P/L for tax purposes' },
];

const EXPORT_FORMATS = [
  { value: 'pdf', label: 'PDF' },
  { value: 'csv', label: 'CSV' },
  { value: 'xlsx', label: 'Excel' },
];

const ExportReports = function ExportReports() {
  const navigate = useNavigate();
  const [reportType, setReportType] = useState('performance');
  const [format, setFormat] = useState('pdf');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = useCallback(async () => {
    setError(null);
    setExporting(true);

    try {
      const response = await fetch('/api/analytics/reports/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reportType, format, dateFrom, dateTo }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to generate report');
        return;
      }

      setSuccess(true);
      if (payload.data?.downloadUrl) {
        window.open(payload.data.downloadUrl, '_blank');
      }
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setExporting(false);
    }
  }, [reportType, format, dateFrom, dateTo]);

  const handleBack = useCallback(() => navigate('/analytics/reports'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Download size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Export Reports
            </Heading>
            <Text color="muted" className="text-xs">
              Generate and download custom performance reports
            </Text>
          </div>
        </div>

        {success ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600">
              <CheckCircle2 size={26} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-semibold text-emerald-900">Report generated</p>
            <p className="mt-1 text-xs text-emerald-800">
              Your report is ready. Check your downloads folder.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Generate Another
              </Button>
              <Button variant="primary" onClick={handleBack}>
                Back to Reports
              </Button>
            </div>
          </div>
        ) : (
          <>
            {error ? (
              <div className="mt-4">
                <Alert variant="danger" size="sm">
                  {error}
                </Alert>
              </div>
            ) : null}

            <Separator spacing="md" />

            <div className="space-y-4">
              <FormField label="Report Type" required>
                {({ id }) => (
                  <select
                    id={id}
                    value={reportType}
                    onChange={(event) => setReportType(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {REPORT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} — {type.description}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Date From">
                  {({ id }) => (
                    <input
                      id={id}
                      type="date"
                      value={dateFrom}
                      onChange={(event) => setDateFrom(event.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}
                </FormField>

                <FormField label="Date To">
                  {({ id }) => (
                    <input
                      id={id}
                      type="date"
                      value={dateTo}
                      onChange={(event) => setDateTo(event.target.value)}
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}
                </FormField>
              </div>

              <FormField label="Format" required>
                <div className="flex gap-2">
                  {EXPORT_FORMATS.map((f) => {
                    const isActive = format === f.value;
                    return (
                      <button
                        key={f.value}
                        type="button"
                        onClick={() => setFormat(f.value)}
                        className={[
                          'rounded-md border-2 px-4 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {f.label}
                      </button>
                    );
                  })}
                </div>
              </FormField>
            </div>

            <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
              <Button
                variant="primary"
                onClick={handleExport}
                disabled={exporting}
                leadingIcon={exporting ? Loader2 : Download}
              >
                {exporting ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default ExportReports;