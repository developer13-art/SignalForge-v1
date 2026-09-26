import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw, Plus, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const ACTION_OPTIONS = [
  { value: 'MOVE_SL_TO_BREAK_EVEN', label: 'Move SL to Break Even' },
  { value: 'MOVE_SL_TO_PRICE', label: 'Move SL to Price' },
  { value: 'PARTIAL_CLOSE', label: 'Partial Close' },
  { value: 'CLOSE_ALL', label: 'Close All' },
  { value: 'TRAILING_STOP', label: 'Activate Trailing Stop' },
  { value: 'TAKE_PROFIT', label: 'Take Profit' },
  { value: 'IGNORE', label: 'Ignore' },
];

const TradeManagementRules = function TradeManagementRules() {
  const navigate = useNavigate();
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ phrase: '', action: 'MOVE_SL_TO_BREAK_EVEN', value: '' });

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/management', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setRules(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleAdd = useCallback(async () => {
    if (!form.phrase || !form.action) {
      return;
    }

    try {
      const response = await fetch('/api/ai/provider-dna/management', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setForm({ phrase: '', action: 'MOVE_SL_TO_BREAK_EVEN', value: '' });
        setAdding(false);
        fetchRules();
      }
    } catch (_err) {
      // silent
    }
  }, [form, fetchRules]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await fetch(`/api/ai/provider-dna/management/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchRules();
      } catch (_err) {
        // silent
      }
    },
    [fetchRules],
  );

  const handleBack = useCallback(() => navigate('/ai/provider-dna'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Shield size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Trade Management Rules
              </Heading>
              <Text color="muted" className="text-xs">
                Phrases providers use to manage open positions
              </Text>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchRules}
              disabled={loading}
              leadingIcon={loading ? Loader2 : RefreshCw}
            >
              Refresh
            </Button>
            {!adding ? (
              <Button variant="primary" size="sm" onClick={() => setAdding(true)} leadingIcon={Plus}>
                Add Rule
              </Button>
            ) : null}
          </div>
        </div>

        {adding ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium text-slate-600">Phrase</label>
                <input
                  type="text"
                  value={form.phrase}
                  onChange={(event) => setForm((prev) => ({ ...prev, phrase: event.target.value }))}
                  placeholder="e.g. Close some"
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600">Action</label>
                <select
                  value={form.action}
                  onChange={(event) => setForm((prev) => ({ ...prev, action: event.target.value }))}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {ACTION_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-slate-600">Value (optional)</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(event) => setForm((prev) => ({ ...prev, value: event.target.value }))}
                  placeholder="e.g. 50 for partial close"
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleAdd}>
                Save Rule
              </Button>
            </div>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : rules.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No management rules yet"
            description="Rules are learned automatically from provider messages."
          />
        ) : (
          <ul className="space-y-2">
            {rules.map((rule) => (
              <li
                key={rule.id}
                className="flex items-start justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                      &quot;{rule.phrase}&quot;
                    </span>
                    <span className="text-xs text-slate-400">→</span>
                    <Badge variant="primary" size="xs">
                      {rule.action}
                    </Badge>
                    {rule.value ? (
                      <span className="text-xs font-medium text-slate-700">
                        ({rule.value})
                      </span>
                    ) : null}
                  </div>
                  {rule.providerName ? (
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Provider: <strong className="font-medium">{rule.providerName}</strong>
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(rule.id)}
                  aria-label="Delete rule"
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default TradeManagementRules;