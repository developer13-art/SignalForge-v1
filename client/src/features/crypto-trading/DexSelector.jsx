import React from 'react';
import { Check } from 'lucide-react';
import { DEX_REGISTRY } from '../../../../shared/src/constants/crypto-pairs/dex-registry';

export default function DexSelector({ value, onChange, filter, disabled = false }) {
  const gateways = Object.values(DEX_REGISTRY).filter((gateway) => {
    if (!filter) {
      return true;
    }
    if (filter === 'dex') {
      return gateway.type === 'dex';
    }
    if (filter === 'perp') {
      return gateway.type === 'perp';
    }
    return true;
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {gateways.map((gateway) => {
        const selected = gateway.key === value;
        return (
          <button
            key={gateway.key}
            type="button"
            disabled={disabled}
            onClick={() => onChange(gateway.key)}
            className={[
              'flex flex-col gap-2 rounded-lg border p-4 text-left transition-colors',
              selected
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
              disabled ? 'cursor-not-allowed opacity-60' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-pressed={selected}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <img
                  src={gateway.logo}
                  alt=""
                  className="h-5 w-5"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none';
                  }}
                />
                <span className="text-sm font-semibold text-slate-900">
                  {gateway.displayName}
                </span>
              </div>
              {selected ? <Check size={14} className="text-indigo-600" /> : null}
            </div>

            <p className="text-xs leading-relaxed text-slate-500">{gateway.description}</p>

            <div className="flex flex-wrap gap-1">
              {gateway.supportsSpot ? <Tag label="Spot" /> : null}
              {gateway.supportsPerps ? <Tag label="Perps" /> : null}
              {gateway.supportsLimitOrders ? <Tag label="Limit" /> : null}
            </div>
          </button>
        );
      })}
    </div>
  );
}

function Tag({ label }) {
  return (
    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
      {label}
    </span>
  );
}