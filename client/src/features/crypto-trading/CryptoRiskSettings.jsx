import React, { useCallback, useState } from 'react';

const DEFAULTS = {
  maxPositionPercent: 5,
  maxLeverage: 10,
  maxOpenPositions: 10,
  maxDailyLoss: 500,
  dailyLossAction: 'pause',
  stopLossRequired: true,
  reduceOnlyOnProviderExit: true,
};

export default function CryptoRiskSettings({ value, onChange }) {
  const [form, setForm] = useState({ ...DEFAULTS, ...(value || {}) });

  const update = useCallback(
    (key, nextValue) => {
      const next = { ...form, [key]: nextValue };
      setForm(next);
      if (onChange) {
        onChange(next);
      }
    },
    [form, onChange],
  );

  return (
    <div className="space-y-5 rounded-lg border border-slate-200 bg-white p-5">
      <header className="space-y-1">
        <h2 className="text-sm font-semibold text-slate-900">Crypto Risk Settings</h2>
        <p className="text-xs text-slate-500">
          These settings apply to every crypto trade executed through SignalForge.
        </p>
      </header>

      <Field
        label="Maximum position size (% of equity)"
        value={form.maxPositionPercent}
        onChange={(value) => update('maxPositionPercent', value)}
        min={0.5}
        max={100}
        step={0.5}
        suffix="%"
      />

      <Field
        label="Maximum leverage"
        value={form.maxLeverage}
        onChange={(value) => update('maxLeverage', value)}
        min={1}
        max={100}
        step={1}
        suffix="x"
      />

      <Field
        label="Maximum open positions"
        value={form.maxOpenPositions}
        onChange={(value) => update('maxOpenPositions', value)}
        min={1}
        max={200}
        step={1}
      />

      <Field
        label="Maximum daily loss"
        value={form.maxDailyLoss}
        onChange={(value) => update('maxDailyLoss', value)}
        min={0}
        max={1000000}
        step={50}
        prefix="$"
      />

      <SelectField
        label="Action on daily loss breach"
        value={form.dailyLossAction}
        onChange={(value) => update('dailyLossAction', value)}
        options={[
          { value: 'pause', label: 'Pause new trades' },
          { value: 'close_all', label: 'Close all positions' },
          { value: 'notify_only', label: 'Notify only' },
        ]}
      />

      <Toggle
        label="Require stop loss on every entry"
        checked={form.stopLossRequired}
        onChange={(value) => update('stopLossRequired', value)}
      />

      <Toggle
        label="Close positions when provider exits"
        checked={form.reduceOnlyOnProviderExit}
        onChange={(value) => update('reduceOnlyOnProviderExit', value)}
      />
    </div>
  );
}

function Field({ label, value, onChange, min, max, step, prefix, suffix }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        {prefix ? <span className="text-sm text-slate-500">{prefix}</span> : null}
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {suffix ? <span className="text-sm text-slate-500">{suffix}</span> : null}
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-700">{label}</label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-64 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 text-sm text-slate-700">
      <span>{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          'relative inline-flex h-5 w-10 items-center rounded-full transition-colors',
          checked ? 'bg-indigo-600' : 'bg-slate-300',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <span
          className={[
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            checked ? 'translate-x-5' : 'translate-x-0.5',
          ]
            .filter(Boolean)
            .join(' ')}
        />
      </button>
    </label>
  );
}