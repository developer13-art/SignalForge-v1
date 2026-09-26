import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';

const PrivacySettings = function PrivacySettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    showProfilePublicly: true,
    showPerformancePublicly: false,
    showTradesPublicly: false,
    allowMarketplaceContact: true,
    allowAnalyticsTracking: true,
    shareAnonymousStats: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/privacy', { credentials: 'include' });
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
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/users/privacy', {
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

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  const toggle = (key) => (value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const rows = [
    {
      key: 'showProfilePublicly',
      label: 'Show profile publicly',
      description: 'Your profile is visible to other users.',
    },
    {
      key: 'showPerformancePublicly',
      label: 'Show performance publicly',
      description: 'Your trading performance is visible on your public profile.',
    },
    {
      key: 'showTradesPublicly',
      label: 'Show trades publicly',
      description: 'Your individual trades are visible to other users.',
    },
    {
      key: 'allowMarketplaceContact',
      label: 'Allow marketplace contact',
      description: 'Providers and traders can contact you through the marketplace.',
    },
    {
      key: 'allowAnalyticsTracking',
      label: 'Allow analytics tracking',
      description: 'Help us improve the platform by allowing anonymous usage analytics.',
    },
    {
      key: 'shareAnonymousStats',
      label: 'Share anonymous statistics',
      description: 'Contribute anonymized data to platform-wide analytics.',
    },
  ];

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchSettings}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Eye size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Privacy Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Control what information is visible and how it is used
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
              Privacy settings saved.
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
            {rows.map((row) => (
              <label
                key={row.key}
                className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
              >
                <input
                  type="checkbox"
                  checked={settings[row.key]}
                  onChange={(event) => toggle(row.key)(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{row.description}</p>
                </div>
              </label>
            ))}
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

export default PrivacySettings;