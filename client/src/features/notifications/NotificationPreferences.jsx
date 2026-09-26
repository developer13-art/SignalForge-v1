import React, { useCallback, useEffect, useState } from 'react';
import { Settings2, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';

const CATEGORIES = [
  { key: 'trade', label: 'Trade Notifications', description: 'Opens, closes, SL, TP' },
  { key: 'signal', label: 'Signal Notifications', description: 'New signals from providers' },
  { key: 'kyc', label: 'KYC Notifications', description: 'Verification status updates' },
  { key: 'referral', label: 'Referral Notifications', description: 'Rewards and settlements' },
  { key: 'payment', label: 'Payment Notifications', description: 'Subscription charges' },
  { key: 'security', label: 'Security Notifications', description: 'Sign-ins and device alerts' },
  { key: 'system', label: 'System Notifications', description: 'Platform announcements' },
];

const CHANNELS = [
  { key: 'inApp', label: 'In-App' },
  { key: 'email', label: 'Email' },
  { key: 'push', label: 'Push' },
];

const NotificationPreferences = function NotificationPreferences() {
  const [preferences, setPreferences] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/notifications/preferences', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setPreferences(payload.data || {});
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const handleToggle = (category, channel) => {
    setPreferences((prev) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [channel]: !(prev[category]?.[channel] ?? true),
      },
    }));
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save preferences');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [preferences]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Settings2 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Notification Preferences
            </Heading>
            <Text color="muted" className="text-xs">
              Choose which notifications you receive and how
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchPreferences}
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
              Preferences saved successfully.
            </Alert>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>
                  {CHANNELS.map((channel) => (
                    <th
                      key={channel.key}
                      className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {channel.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {CATEGORIES.map((category) => (
                  <tr key={category.key}>
                    <td className="px-3 py-3">
                      <p className="text-sm font-medium text-slate-800">{category.label}</p>
                      <p className="text-[11px] text-slate-500">{category.description}</p>
                    </td>
                    {CHANNELS.map((channel) => (
                      <td key={channel.key} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={preferences[category.key]?.[channel.key] ?? true}
                          onChange={() => handleToggle(category.key, channel.key)}
                          className="h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Separator spacing="md" />

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default NotificationPreferences;