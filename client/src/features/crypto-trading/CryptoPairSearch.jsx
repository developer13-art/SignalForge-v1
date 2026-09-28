import React, { useCallback, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { SUPPORTED_PAIRS } from '../../../../shared/src/constants/crypto-pairs/supported-pairs';

export default function CryptoPairSearch({ value, onChange, placeholder = 'Search crypto pairs' }) {
  const [query, setQuery] = useState('');

  const suggestions = useMemo(() => {
    if (!query) {
      return [];
    }
    const normalized = query.toUpperCase();
    return SUPPORTED_PAIRS.filter((pair) => pair.includes(normalized)).slice(0, 8);
  }, [query]);

  const handleSelect = useCallback(
    (pair) => {
      setQuery('');
      if (onChange) {
        onChange(pair);
      }
    },
    [onChange],
  );

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {value ? (
        <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-800">
          Selected: <span className="font-semibold">{value}</span>
        </div>
      ) : null}

      {suggestions.length > 0 ? (
        <div className="max-h-56 overflow-y-auto rounded-md border border-slate-200 bg-white">
          {suggestions.map((pair) => (
            <button
              key={pair}
              type="button"
              onClick={() => handleSelect(pair)}
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-50"
            >
              {pair}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}