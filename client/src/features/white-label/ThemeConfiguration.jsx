import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, ArrowLeft, Loader2, Save, RefreshCw, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const PRESETS = [
  { id: 'default', name: 'Default', primary: '#4f46e5', accent: '#10b981' },
  { id: 'dark', name: 'Dark Pro', primary: '#1e293b', accent: '#10b981' },
  { id: 'ocean', name: 'Ocean', primary: '#0284c7', accent: '#06b6d4' },
  { id: 'forest', name: 'Forest', primary: '#15803d', accent: '#84cc16' },
  { id: 'crimson', name: 'Crimson', primary: '#be123c', accent: '#f97316' },
  { id: 'royal', name: 'Royal', primary: '#7c3aed', accent: '#ec4899' },
];

const FONT_OPTIONS = [
  { value: 'inter', label: 'Inter (Default)' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'poppins', label: 'Poppins' },
  { value: 'manrope', label: 'Manrope' },
  { value: 'ibm-plex', label: 'IBM Plex Sans' },
];

const ThemeConfiguration = function ThemeConfiguration() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    preset: 'default',
    font: 'inter',
    darkModeEnabled: true,
    roundedCorners: 'medium',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/theme', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setData((prev) => ({ ...prev, ...payload.data }));
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
      const response = await fetch('/api/white-label/theme', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save theme');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [data]);

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
            <Palette size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Theme Configuration
            </Heading>
            <Text color="muted" className="text-xs">
              Choose a visual theme and typography for your brand
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
              Theme saved.
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
            <div>
              <p className="text-sm font-semibold text-slate-800">Theme Preset</p>
              <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3">
                {PRESETS.map((preset) => {
                  const isActive = data.preset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setData((prev) => ({ ...prev, preset: preset.id }))}
                      className={[
                        'rounded-lg border-2 p-3 text-left transition-colors',
                        isActive
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 bg-white hover:border-slate-300',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">{preset.name}</p>
                        {isActive ? (
                          <Check size={14} className="text-indigo-600" aria-hidden="true" />
                        ) : null}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <span
                          className="h-5 w-5 rounded"
                          style={{ backgroundColor: preset.primary }}
                        />
                        <span
                          className="h-5 w-5 rounded"
                          style={{ backgroundColor: preset.accent }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <FormField label="Font Family">
              {({ id }) => (
                <select
                  id={id}
                  value={data.font}
                  onChange={(event) => setData((prev) => ({ ...prev, font: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  {FONT_OPTIONS.map((font) => (
                    <option key={font.value} value={font.value}>
                      {font.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <FormField label="Corner Style">
              {({ id }) => (
                <select
                  id={id}
                  value={data.roundedCorners}
                  onChange={(event) =>
                    setData((prev) => ({ ...prev, roundedCorners: event.target.value }))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="sharp">Sharp</option>
                  <option value="medium">Medium</option>
                  <option value="rounded">Rounded</option>
                  <option value="pill">Pill</option>
                </select>
              )}
            </FormField>

            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={data.darkModeEnabled}
                onChange={(event) =>
                  setData((prev) => ({ ...prev, darkModeEnabled: event.target.checked }))
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Enable dark mode</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Users can toggle between light and dark themes.
                </p>
              </div>
            </label>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Theme'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default ThemeConfiguration;