import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowLeft, Loader2, Save, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';

const DomainConfiguration = function DomainConfiguration() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/domain', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
        setDomain(payload.data?.domain || '');
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

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/white-label/domain', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ domain }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save domain');
        return;
      }

      setSuccess(true);
      fetchData();
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [domain, fetchData]);

  const handleVerify = useCallback(async () => {
    setVerifying(true);
    try {
      await fetch('/api/white-label/domain/verify', {
        method: 'POST',
        credentials: 'include',
      });
      fetchData();
    } catch (_err) {
      // silent
    } finally {
      setVerifying(false);
    }
  }, [fetchData]);

  const handleBack = useCallback(() => navigate('/white-label'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
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

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Globe size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Domain Configuration
            </Heading>
            <Text color="muted" className="text-xs">
              Point your custom domain to your branded platform
            </Text>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {success ? (
          <div className="mt-4">
            <Alert variant="success" size="sm">
              Domain saved. Proceed to verification.
            </Alert>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-6">
            <FormField label="Custom Domain" description="e.g. app.yourbrand.com" required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={domain}
                  onChange={(event) => setDomain(event.target.value)}
                  placeholder="app.yourbrand.com"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                />
              )}
            </FormField>

            {data?.dnsRecords && data.dnsRecords.length > 0 ? (
              <div>
                <p className="text-sm font-semibold text-slate-800">DNS Records</p>
                <p className="mt-1 text-xs text-slate-500">
                  Add these records to your DNS provider, then verify.
                </p>

                <div className="mt-3 overflow-hidden rounded-md border border-slate-200">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Type</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Name</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-600">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.dnsRecords.map((record, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 font-mono">{record.type}</td>
                          <td className="px-3 py-2 font-mono">{record.name}</td>
                          <td className="px-3 py-2 font-mono">{record.value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}

            {data?.status ? (
              <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  {data.status === 'verified' ? (
                    <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-600" aria-hidden="true" />
                  )}
                  <span className="text-xs font-medium text-slate-700">
                    DNS Status: <strong className="capitalize">{data.status}</strong>
                  </span>
                </div>
                <Badge variant={data.status === 'verified' ? 'success' : 'warning'} size="xs">
                  {data.status}
                </Badge>
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            onClick={handleVerify}
            disabled={verifying || !domain}
            leadingIcon={verifying ? Loader2 : RefreshCw}
          >
            {verifying ? 'Verifying...' : 'Verify Domain'}
          </Button>

          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Domain'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default DomainConfiguration;