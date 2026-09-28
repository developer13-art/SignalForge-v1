import React, { useCallback, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

const RULE_TYPES = [
  { value: 'profit_target', label: 'Profit Target' },
  { value: 'stop_loss', label: 'Stop Loss' },
  { value: 'trailing_stop', label: 'Trailing Stop' },
  { value: 'time_based', label: 'Time-based' },
];

export default function CryptoAutomation({ rules = [], onChange }) {
  const [items, setItems] = useState(rules);

  const persist = useCallback(
    (next) => {
      setItems(next);
      if (onChange) {
        onChange(next);
      }
    },
    [onChange],
  );

  const addRule = useCallback(() => {
    const next = [
      ...items,
      {
        id: `rule_${Date.now()}`,
        type: 'profit_target',
        value: 2,
        action: 'close',
      },
    ];
    persist(next);
  }, [items, persist]);

  const removeRule = useCallback(
    (id) => {
      persist(items.filter((rule) => rule.id !== id));
    },
    [items, persist],
  );

  const updateRule = useCallback(
    (id, changes) => {
      persist(items.map((rule) => (rule.id === id ? { ...rule, ...changes } : rule)));
    },
    [items, persist],
  );

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-5">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Crypto Automation</h2>
          <p className="text-xs text-slate-500">
            Rules are evaluated after each price update and can close, reduce, or protect positions.
          </p>
        </div>

        <button
          type="button"
          onClick={addRule}
          className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={12} />
          Add rule
        </button>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No rules yet. Add a rule to automate your positions.</p>
      ) : (
        <div className="space-y-3">
          {items.map((rule) => (
            <div
              key={rule.id}
              className="flex flex-wrap items-end gap-3 rounded-md border border-slate-200 bg-slate-50 p-3"
            >
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Type
                </label>
                <select
                  value={rule.type}
                  onChange={(event) => updateRule(rule.id, { type: event.target.value })}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
                >
                  {RULE_TYPES.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Threshold
                </label>
                <input
                  type="number"
                  value={rule.value}
                  step={0.1}
                  onChange={(event) => updateRule(rule.id, { value: Number(event.target.value) })}
                  className="w-28 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium uppercase tracking-wide text-slate-500">
                  Action
                </label>
                <select
                  value={rule.action}
                  onChange={(event) => updateRule(rule.id, { action: event.target.value })}
                  className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-800"
                >
                  <option value="close">Close position</option>
                  <option value="reduce">Reduce position</option>
                  <option value="notify">Notify only</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => removeRule(rule.id)}
                className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-md text-rose-500 transition-colors hover:bg-rose-50"
                aria-label="Remove rule"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}