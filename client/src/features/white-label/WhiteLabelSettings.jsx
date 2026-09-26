import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings2, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const WhiteLabelSettings = function WhiteLabelSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    allowUserRegistration: true,
    requireEmailVerification: true,
    requireKycForTrading: true,
    marketplaceEnabled: true,
    referralsEnabled: true,
    supportEmail: '',
    defaultLanguage: 'en',
    defaultCurrency: 'USD',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/settings', { credentials: 'include' });
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
      const response = await fetch('/api/white-label/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [settings]);

  const handleBack = useCallback(() => navigate('/white-label'), [navigate]);

  const toggle = (key) => (value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const ToggleRow = ({ label, description, checked, onChange }) => (
    <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
      />
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
    </label>
  );

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
            <Settings2 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              White-Label Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Configure platform-wide settings for your brand
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
              Settings saved.
            </Alert>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-3">
            <ToggleRow
              label="Allow user registration"
              description="New users can sign up directly on your branded platform."
              checked={settings.allowUserRegistration}
              onChange={toggle('allowUserRegistration')}
            />

            <ToggleRow
              label="Require email verification"
              description="Users must verify their email before using the platform."
              checked={settings.requireEmailVerification}
              onChange={toggle('requireEmailVerification')}
            />

            <ToggleRow
              label="Require KYC for trading"
              description="Users must complete KYC verification before trading."
              checked={settings.requireKycForTrading}
              onChange={toggle('requireKycForTrading')}
            />

            <ToggleRow
              label="Enable marketplace"
              description="Allow provider and trader marketplaces."
              checked={settings.marketplaceEnabled}
              onChange={toggle('marketplaceEnabled')}
            />

            <ToggleRow
              label="Enable referrals"
              description="Allow the referral rewards program."
              checked={settings.referralsEnabled}
              onChange={toggle('referralsEnabled')}
            />

            <FormField label="Support Email">
              {({ id }) => (
                <input
                  id={id}
                  type="email"
                  value={settings.supportEmail}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, supportEmail: event.target.value }))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Default Language">
                {({ id }) => (
                  <select
                    id={id}
                    value={settings.defaultLanguage}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, defaultLanguage: event.target.value }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="pt">Portuguese</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                )}
              </FormField>

              <FormField label="Default Currency">
                {({ id }) => (
                  <select
                    id={id}
                    value={settings.defaultCurrency}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, defaultCurrency: event.target.value }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="NGN">NGN</option>
                  </select>
                )}
              </FormField>
            </div>
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

export default WhiteLabelSettings;