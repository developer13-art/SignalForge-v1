import React from 'react';
import { Zap } from 'lucide-react';
import { PRIORITY_FEE_PRESETS } from '../../../../shared/src/constants/crypto-pairs/priority-fee-presets';

export default function PriorityFeeSettings({ value, onChange, disabled = false }) {
  const presets = Object.values(PRIORITY_FEE_PRESETS);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-amber-500" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-900">Priority fee</p>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-5">
        {presets.map((preset) => {
          const selected = preset.key === value;
          return (
            <button
              key={preset.key}
              type="button"
              disabled={disabled}
              onClick={() => onChange(preset.key)}
              className={[
                'rounded-md border px-3 py-2 text-xs font-medium transition-colors',
                selected
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
                disabled ? 'cursor-not-allowed opacity-60' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              title={preset.description}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      <p className="text-xs text-slate-500">
        Higher priority fees improve the chance of fast inclusion during network congestion.
      </p>
    </div>
  );
}