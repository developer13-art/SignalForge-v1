import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2, RefreshCw, Filter, Star, TrendingUp, Users } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ProviderCard from '../../components/domain/provider/ProviderCard';
import EmptyState from '../../components/common/EmptyState';

const FILTERS = [
  { key: 'verified', label: 'Verified Only', type: 'boolean' },
  { key: 'hasSolana', label: 'On-Chain Verified', type: 'boolean' },
  { key: 'minRating', label: 'Minimum Rating', type: 'number', min: 1, max: 5, step: 0.5 },
  { key: 'minWinRate', label: 'Min Win Rate (%)', type: 'number', min: 0, max: 100, step: 5 },
];

const ProviderSearch = function ProviderSearch() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    verified: false,
    hasSolana: false,
    minRating: 0,
    minWinRate: 0,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (query) {
        params.append('q', query);
      }
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.append(key, String(value));
        }
      });

      const response = await fetch(`/api/marketplace/providers/search?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setResults(payload.data?.items || []);
        setSearchParams({ q: query });
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [query, filters, setSearchParams]);

  useEffect(() => {
    performSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <SearchIcon size={20} aria-hidden="true" />
        </span>
        <div>
          <Heading level={1} size="text-2xl">
            Provider Search
          </Heading>
          <Text color="muted" className="text-xs">
            Advanced search across the provider marketplace
          </Text>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Card padding="lg" className="h-fit">
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-slate-400" aria-hidden="true" />
            <Heading level={3} size="text-base">
              Filters
            </Heading>
          </div>

          <div className="mt-4 space-y-4">
            {FILTERS.map((filter) => (
              <div key={filter.key}>
                {filter.type === 'boolean' ? (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters[filter.key]}
                      onChange={(event) => handleFilterChange(filter.key, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-slate-700">{filter.label}</span>
                  </label>
                ) : (
                  <div>
                    <label className="text-xs font-medium text-slate-600">{filter.label}</label>
                    <input
                      type="number"
                      value={filters[filter.key]}
                      min={filter.min}
                      max={filter.max}
                      step={filter.step}
                      onChange={(event) =>
                        handleFilterChange(filter.key, Number(event.target.value))
                      }
                      className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                )}
              </div>
            ))}

            <div className="pt-2">
              <Button variant="primary" onClick={performSearch} className="w-full">
                Apply Filters
              </Button>
            </div>
          </div>
        </Card>

        <div>
          <Card padding="lg" className="mb-4">
            <div className="relative">
              <SearchIcon
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    performSearch();
                  }
                }}
                placeholder="Search providers by name, symbol, or strategy"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </Card>

          {loading ? (
            <Card padding="lg">
              <div className="flex items-center justify-center py-12 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              </div>
            </Card>
          ) : searched && results.length === 0 ? (
            <Card padding="lg">
              <EmptyState
                icon={SearchIcon}
                title="No results"
                description="Try adjusting your search or filters."
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {results.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onClick={() => navigate(`/providers/${provider.id}`)}
                  onSubscribe={() => navigate(`/providers/${provider.id}/subscribe`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default ProviderSearch;