import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import CryptoPairBadge from '../../components/domain/crypto/CryptoPairBadge';
import {
  SUPPORTED_SPOT_PAIRS,
  SUPPORTED_PERP_PAIRS,
} from '../../../../shared/src/constants/crypto-pairs/supported-pairs';

const TABS = [
  { key: 'spot', label: 'Spot' },
  { key: 'perp', label: 'Perpetual' },
];

export default function CryptoPairSelector({ value, onChange, disabled = false }) {
  const [tab, setTab] = useState('spot');
  const [query, setQuery] = useState('');

  const pairs = useMemo(() => {
    const base = tab === 'perp' ? SUPPORTED_PERP_PAIRS : SUPPORTED_SPOT_PAIRS;
    if (!query) {
      return base;
    }
    const normalized = query.toUpperCase();
    return base.filter((pair) => pair.includes(normalized));
  }, [tab, query]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-md bg-slate-100 p-1">
          {TABS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => setTab(entry.key)}
              className={[
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                tab === entry.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {entry.label}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search pairs"
          className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      <div className="max-h-72 overflow-y-auto rounded-md border border-slate-200 bg-white">
        {pairs.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-slate-400">No pairs found</p>
        ) : (
          pairs.map((pair) => {
            const selected = pair === value;
            return (
              <button
                key={pair}
                type="button"
                disabled={disabled}
                onClick={() => onChange(pair)}
                className={[
                  'flex w-full items-center justify-between px-3 py-2 text-left transition-colors',
                  selected ? 'bg-indigo-50' : 'hover:bg-slate-50',
                  disabled ? 'cursor-not-allowed opacity-60' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <CryptoPairBadge canonicalSymbol={pair} size="sm" />
                {selected ? (
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                    Selected
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}