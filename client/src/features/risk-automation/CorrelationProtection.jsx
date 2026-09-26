import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';

const CorrelationProtection = function CorrelationProtection() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [pairs, setPairs] = useState([]);
  const [form, setForm] = useState({ symbolA: '', symbolB: '' });

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/correlation', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setEnabled(payload.data.enabled !== false);
        setPairs(payload.data.pairs || []);
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
    if (!form.symbolA || !form.symbolB) {
      return;
    }
    setPairs((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, symbolA: form.symbolA.toUpperCase(), symbolB: form.symbolB.toUpperCase() },
    ]);
    setForm({ symbolA: '', symbolB: '' });
  }, [form]);

  const handleRemove = useCallback((id) => {
    setPairs((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/risk/correlation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ enabled, pairs }),
      });
      navigate('/risk');
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [enabled, pairs, navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Correlation Protection
            </Heading>
            <Text color="muted" className="text-xs">
              Prevent opening highly correlated positions simultaneously
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
                checked={enabled}
                onChange={(event) => setEnabled(event.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  Enable correlation protection
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Blocks new positions when they correlate with existing exposure.
                </p>
              </div>
            </label>

            {enabled ? (
              <>
                <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Add correlated pair
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <input
                      type="text"
                      value={form.symbolA}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, symbolA: event.target.value }))
                      }
                      placeholder="e.g. EURUSD"
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input
                      type="text"
                      value={form.symbolB}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, symbolB: event.target.value }))
                      }
                      placeholder="e.g. GBPUSD"
                      className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Button variant="primary" size="sm" onClick={handleAdd} leadingIcon={Plus}>
                      Add
                    </Button>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {pairs.map((pair) => (
                    <div
                      key={pair.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        {pair.symbolA} <span className="text-slate-400">↔</span> {pair.symbolB}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemove(pair.id)}
                        aria-label="Remove"
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
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

export default CorrelationProtection;