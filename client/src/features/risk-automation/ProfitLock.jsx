import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import NumberInput from '../../components/forms/NumberInput';

const ProfitLock = function ProfitLock() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [levels, setLevels] = useState([]);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/profit-lock', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setEnabled(payload.data.enabled !== false);
        setLevels(payload.data.levels || []);
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

  const handleAdd = useCallback(() => {
    setLevels((prev) => [...prev, { id: `new-${Date.now()}`, profitPercent: 1, lockPercent: 50 }]);
  }, []);

  const handleRemove = useCallback((id) => {
    setLevels((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleUpdate = useCallback((id, field, value) => {
    setLevels((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: Number(value) || 0 } : l)),
    );
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/risk/profit-lock', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled, levels }),
      });
      navigate('/risk');
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [enabled, levels, navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Lock size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Profit Lock
              </Heading>
              <Text color="muted" className="text-xs">
                Progressively lock in profit as your trades move into the money
              </Text>
            </div>
          </div>

          <Button variant="primary" size="sm" onClick={handleAdd} leadingIcon={Plus}>
            Add Level
          </Button>
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
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">Enable profit lock</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Lock a percentage of gains at defined profit thresholds.
                </p>
              </div>
            </label>

            {enabled ? (
              <div className="mt-6 space-y-3">
                {levels.length === 0 ? (
                  <p className="text-sm text-slate-400">No levels configured yet.</p>
                ) : (
                  levels.map((level) => (
                    <div
                      key={level.id}
                      className="grid grid-cols-1 items-end gap-3 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <FormField label="At Profit (%)">
                        {({ id }) => (
                          <NumberInput
                            id={id}
                            value={level.profitPercent}
                            onChange={(value) => handleUpdate(level.id, 'profitPercent', value)}
                            min={0.1}
                            max={100}
                            step={0.1}
                            precision={2}
                          />
                        )}
                      </FormField>

                      <FormField label="Lock (%)">
                        {({ id }) => (
                          <NumberInput
                            id={id}
                            value={level.lockPercent}
                            onChange={(value) => handleUpdate(level.id, 'lockPercent', value)}
                            min={1}
                            max={100}
                            step={1}
                            precision={0}
                          />
                        )}
                      </FormField>

                      <button
                        type="button"
                        onClick={() => handleRemove(level.id)}
                        aria-label="Remove level"
                        className="mb-1 rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))
                )}
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

export default ProfitLock;