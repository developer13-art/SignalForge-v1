import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Loader2, Save } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import NumberInput from '../../components/forms/NumberInput';

const IMPACTS = [
  { value: 'high', label: 'High Impact Only' },
  { value: 'medium', label: 'Medium and High' },
  { value: 'all', label: 'All News Events' },
];

const NewsFilter = function NewsFilter() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    enabled: true,
    impact: 'high',
    beforeMinutes: 5,
    afterMinutes: 5,
    currencies: [],
  });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/news-filter', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setConfig(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/risk/news-filter', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(config),
      });
      navigate('/risk');
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [config, navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Bell size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              News Filter
            </Heading>
            <Text color="muted" className="text-xs">
              Pause automated trading during high-impact economic events
            </Text>
          </div>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <label className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(event) =>
                  setConfig((prev) => ({ ...prev, enabled: event.target.checked }))
                }
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Enable news filter</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Blocks new trades during selected news events.
                </p>
              </div>
            </label>

            {config.enabled ? (
              <div className="mt-6 space-y-4">
                <FormField label="News Impact Level">
                  {({ id }) => (
                    <select
                      id={id}
                      value={config.impact}
                      onChange={(event) =>
                        setConfig((prev) => ({ ...prev, impact: event.target.value }))
                      }
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {IMPACTS.map((impact) => (
                        <option key={impact.value} value={impact.value}>
                          {impact.label}
                        </option>
                      ))}
                    </select>
                  )}
                </FormField>

                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Block Before (minutes)">
                    {({ id }) => (
                      <NumberInput
                        id={id}
                        value={config.beforeMinutes}
                        onChange={(value) =>
                          setConfig((prev) => ({ ...prev, beforeMinutes: Number(value) || 0 }))
                        }
                        min={0}
                        max={60}
                        step={1}
                        precision={0}
                      />
                    )}
                  </FormField>

                  <FormField label="Block After (minutes)">
                    {({ id }) => (
                      <NumberInput
                        id={id}
                        value={config.afterMinutes}
                        onChange={(value) =>
                          setConfig((prev) => ({ ...prev, afterMinutes: Number(value) || 0 }))
                        }
                        min={0}
                        max={60}
                        step={1}
                        precision={0}
                      />
                    )}
                  </FormField>
                </div>
              </div>
            ) : null}

            <div className="mt-8 flex justify-end border-t border-slate-200 pt-4">
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

export default NewsFilter;