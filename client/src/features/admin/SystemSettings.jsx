import React, { useCallback, useEffect, useState } from 'react';
import { Settings2, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const SystemSettings = function SystemSettings() {
  const [settings, setSettings] = useState({
    referralRate: 0.001,
    referralSettlementCycle: 'monthly',
    kycRequiredForSubscription: true,
    kycRequiredForReferral: true,
    confidenceThreshold: 0.8,
    maxDailyLossDefault: 500,
    maxDrawdownDefault: 20,
    maxOpenTradesDefault: 10,
    maintenanceMode: false,
    signupEnabled: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setSettings((prev) => ({ ...prev, ...payload.data }));
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
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save settings');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const update = (field) => (value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Settings2 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              System Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Configure platform-wide behavior and defaults
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

      <Card padding="lg" className="mt-6">
        {error ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {success ? (
          <div className="mb-4">
            <Alert variant="success" size="sm">
              Settings saved successfully.
            </Alert>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Referral Reward Rate" description="e.g. 0.001 = 0.1%">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    step={0.0001}
                    min={0}
                    value={settings.referralRate}
                    onChange={(event) => update('referralRate')(Number(event.target.value))}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>

              <FormField label="Referral Settlement Cycle">
                {({ id }) => (
                  <select
                    id={id}
                    value={settings.referralSettlementCycle}
                    onChange={(event) => update('referralSettlementCycle')(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                  </select>
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="AI Confidence Threshold" description="0.8 = 80%">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    step={0.01}
                    min={0}
                    max={1}
                    value={settings.confidenceThreshold}
                    onChange={(event) =>
                      update('confidenceThreshold')(Number(event.target.value))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>

              <FormField label="Default Max Daily Loss">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    min={0}
                    value={settings.maxDailyLossDefault}
                    onChange={(event) =>
                      update('maxDailyLossDefault')(Number(event.target.value))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Default Max Drawdown (%)">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    min={0}
                    max={100}
                    value={settings.maxDrawdownDefault}
                    onChange={(event) =>
                      update('maxDrawdownDefault')(Number(event.target.value))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>

              <FormField label="Default Max Open Trades">
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    min={1}
                    value={settings.maxOpenTradesDefault}
                    onChange={(event) =>
                      update('maxOpenTradesDefault')(Number(event.target.value))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>
            </div>

            <Separator spacing="sm" />

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={settings.kycRequiredForSubscription}
                onChange={(event) => update('kycRequiredForSubscription')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  KYC required for subscriptions
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Users must complete KYC before subscribing to providers.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={settings.kycRequiredForReferral}
                onChange={(event) => update('kycRequiredForReferral')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  KYC required for referral rewards
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Users must complete KYC before earning referral rewards.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-rose-200 bg-rose-50 p-3">
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(event) => update('maintenanceMode')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-rose-600 focus:ring-rose-500"
              />
              <div>
                <p className="text-sm font-semibold text-rose-900">Maintenance mode</p>
                <p className="mt-0.5 text-xs text-rose-800">
                  Enable to restrict platform access for all non-admin users.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={settings.signupEnabled}
                onChange={(event) => update('signupEnabled')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  New user sign-ups enabled
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Allow new users to register on the platform.
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default SystemSettings;