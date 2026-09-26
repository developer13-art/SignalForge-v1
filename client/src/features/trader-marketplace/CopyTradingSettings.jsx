import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Settings2, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import NumberInput from '../../components/forms/NumberInput';
import Alert from '../../components/feedback/Alert';

const CopyTradingSettings = function CopyTradingSettings() {
  const { traderId } = useParams();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    copyMode: 'proportional',
    copyRatio: 100,
    maxOpenTrades: 10,
    stopCopyOnLoss: false,
    maxDailyLoss: 500,
    reverseCopy: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/marketplace/traders/${traderId}/copy-settings`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setSettings(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [traderId]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/marketplace/traders/${traderId}/copy-settings`, {
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

      navigate('/traders/following');
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [traderId, settings, navigate]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Settings2 size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Copy Trading Settings
              </Heading>
              <Text color="muted" className="text-xs">
                Adjust how this trader's positions are copied to your account
              </Text>
            </div>
          </div>

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

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <Separator spacing="md" />

            <div className="space-y-4">
              <FormField label="Copy Mode">
                {({ id }) => (
                  <select
                    id={id}
                    value={settings.copyMode}
                    onChange={(event) =>
                      setSettings((prev) => ({ ...prev, copyMode: event.target.value }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="proportional">Proportional</option>
                    <option value="fixed">Fixed Lot</option>
                    <option value="multiplier">Multiplier</option>
                  </select>
                )}
              </FormField>

              <FormField label="Copy Ratio (%)">
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={settings.copyRatio}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, copyRatio: Number(value) || 0 }))
                    }
                    min={1}
                    max={200}
                    step={1}
                    precision={0}
                  />
                )}
              </FormField>

              <FormField label="Max Open Trades">
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={settings.maxOpenTrades}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, maxOpenTrades: Number(value) || 0 }))
                    }
                    min={1}
                    max={100}
                    step={1}
                    precision={0}
                  />
                )}
              </FormField>

              <FormField label="Max Daily Loss">
                {({ id }) => (
                  <NumberInput
                    id={id}
                    value={settings.maxDailyLoss}
                    onChange={(value) =>
                      setSettings((prev) => ({ ...prev, maxDailyLoss: Number(value) || 0 }))
                    }
                    min={0}
                    max={100000}
                    step={50}
                    precision={2}
                  />
                )}
              </FormField>

              <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
                <input
                  type="checkbox"
                  checked={settings.stopCopyOnLoss}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, stopCopyOnLoss: event.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Stop copying when daily loss is reached
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Prevents further trades once the configured loss limit is hit.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
                <input
                  type="checkbox"
                  checked={settings.reverseCopy}
                  onChange={(event) =>
                    setSettings((prev) => ({ ...prev, reverseCopy: event.target.checked }))
                  }
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Reverse copy</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Take the opposite direction of every trade.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-8 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default CopyTradingSettings;