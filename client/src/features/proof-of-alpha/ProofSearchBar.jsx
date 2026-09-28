import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { Search, X } from 'lucide-react';

export default function ProofSearchBar({ onSearch, placeholder = 'Search by signature, provider, or trade' }) {
  const [value, setValue] = useState('');

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      const trimmed = value.trim();
      if (!trimmed) {
        return;
      }
      if (onSearch) {
        onSearch(trimmed);
      }
    },
    [value, onSearch],
  );

  const handleClear = useCallback(() => {
    setValue('');
    if (onSearch) {
      onSearch('');
    }
  }, [onSearch]);

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-md border border-slate-300 bg-white pl-9 pr-9 py-2 text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        {value ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Clear search"
          >
            <X size={12} />
          </button>
        ) : null}
      </div>
      <button
        type="submit"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Search
      </button>
    </form>
  );
}

ProofSearchBar.propTypes = {
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
};