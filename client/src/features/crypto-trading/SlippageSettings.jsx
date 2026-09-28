import React from 'react';
import { SLIPPAGE_PRESETS } from '../../../../shared/src/constants/crypto-pairs/slippage-defaults';

export default function SlippageSettings({ value, onChange, disabled = false }) {
  const presets = Object.entries(SLIPPAGE_PRESETS);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-900">Slippage tolerance</p>
        <span className="text-xs text-slate-500">
          {Number.isFinite(Number(value)) ? `${(Number(value) / 100).toFixed(2)}%` : '—'}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {presets.map(([key, bps]) => {
          const selected = Number(value) === bps;
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(bps)}
              className={[
                'rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                selected
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                disabled ? 'cursor-not-allowed opacity-60' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {(bps / 100).toFixed(2)}%
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="number"
          min="1"
          max="5000"
          step="1"
          value={value ?? ''}
          onChange={(event) => onChange(Number(event.target.value) || 0)}
          disabled={disabled}
          className="w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <span className="text-xs text-slate-500">basis points</span>
      </div>
    </div>
  );
}