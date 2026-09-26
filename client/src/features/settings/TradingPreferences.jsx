import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const TradingPreferences = function TradingPreferences() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState({
    autoExecute: false,
    defaultAccountType: 'demo',
    confirmManualTrades: true,
    notifyOnExecution: true,
    defaultEntryType: 'MARKET',
    maxSlippage: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchPrefs = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/trading-preferences', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setPrefs((prev) => ({ ...prev, ...payload.data }));
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrefs();
  }, [fetchPrefs]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/users/trading-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(prefs),
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
  }, [prefs]);

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  const toggle = (key) => (value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
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
          onClick={fetchPrefs}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trading Preferences
            </Heading>
            <Text color="muted" className="text-xs">
              Default settings applied to your trading activity
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
              Preferences updated.
            </Alert>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-4">
            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={prefs.autoExecute}
                onChange={(event) => toggle('autoExecute')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Automatically execute signals
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  When enabled, validated signals will execute automatically.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={prefs.confirmManualTrades}
                onChange={(event) => toggle('confirmManualTrades')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Confirm manual trades
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Show a confirmation dialog before executing manual trades.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={prefs.notifyOnExecution}
                onChange={(event) => toggle('notifyOnExecution')(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Notify on execution
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Receive a notification whenever a trade is executed.
                </p>
              </div>
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Default Account Type">
                {({ id }) => (
                  <select
                    id={id}
                    value={prefs.defaultAccountType}
                    onChange={(event) =>
                      toggle('defaultAccountType')(event.target.value)
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="demo">Demo</option>
                    <option value="live">Live</option>
                  </select>
                )}
              </FormField>

              <FormField label="Default Entry Type">
                {({ id }) => (
                  <select
                    id={id}
                    value={prefs.defaultEntryType}
                    onChange={(event) => toggle('defaultEntryType')(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="MARKET">Market</option>
                    <option value="LIMIT">Limit</option>
                    <option value="STOP">Stop</option>
                  </select>
                )}
              </FormField>
            </div>

            <FormField
              label="Maximum Slippage (points)"
              description="Reject execution if slippage exceeds this threshold"
            >
              {({ id }) => (
                <input
                  id={id}
                  type="number"
                  min={0}
                  max={100}
                  value={prefs.maxSlippage}
                  onChange={(event) => toggle('maxSlippage')(Number(event.target.value))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default TradingPreferences;