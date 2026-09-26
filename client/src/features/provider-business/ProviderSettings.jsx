import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const ProviderSettings = function ProviderSettings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    allowDirectMessages: true,
    publicEmail: true,
    autoAcceptSubscribers: true,
    notifyOnSubscribe: true,
    notifyOnReview: true,
    defaultPlanId: '',
    timezone: 'UTC',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/settings', {
        credentials: 'include',
      });
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
      const response = await fetch('/api/provider-business/settings', {
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

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  const toggle = (key) => (value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

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
            <Award size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Configure notifications and subscription behavior
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
              Settings saved successfully.
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
            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={settings.allowDirectMessages}
                onChange={(event) => toggle('allowDirectMessages')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Allow direct messages</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Subscribers can send you private messages.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={settings.publicEmail}
                onChange={(event) => toggle('publicEmail')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Show email publicly</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Your email appears on your public provider profile.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={settings.autoAcceptSubscribers}
                onChange={(event) => toggle('autoAcceptSubscribers')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Auto-accept subscribers</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  New subscribers start immediately without manual approval.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={settings.notifyOnSubscribe}
                onChange={(event) => toggle('notifyOnSubscribe')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Notify on new subscriber</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Receive a notification whenever someone subscribes.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={settings.notifyOnReview}
                onChange={(event) => toggle('notifyOnReview')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Notify on new review</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Receive a notification whenever a review is posted.
                </p>
              </div>
            </label>

            <FormField label="Timezone" description="Used for analytics and settlement displays">
              {({ id }) => (
                <select
                  id={id}
                  value={settings.timezone}
                  onChange={(event) => toggle('timezone')(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="UTC">UTC</option>
                  <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
                  <option value="Europe/London">Europe/London (GMT/BST)</option>
                  <option value="America/New_York">America/New_York (ET)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                </select>
              )}
            </FormField>
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

export default ProviderSettings;