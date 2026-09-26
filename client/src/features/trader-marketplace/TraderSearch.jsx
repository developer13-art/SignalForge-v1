import React, { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, Loader2, Filter } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import TraderCard from '../../components/domain/trader/TraderCard';
import EmptyState from '../../components/common/EmptyState';

const TRADING_STYLES = [
  { value: '', label: 'Any Style' },
  { value: 'scalper', label: 'Scalper' },
  { value: 'day_trader', label: 'Day Trader' },
  { value: 'swing', label: 'Swing Trader' },
  { value: 'position', label: 'Position Trader' },
  { value: 'grid', label: 'Grid Trader' },
  { value: 'news', label: 'News Trader' },
];

const TraderSearch = function TraderSearch() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [style, setStyle] = useState('');
  const [minWinRate, setMinWinRate] = useState(0);
  const [minFollowers, setMinFollowers] = useState(0);
  const [verified, setVerified] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const performSearch = useCallback(async () => {
    setLoading(true);
    setSearched(true);

    try {
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (style) params.append('style', style);
      if (minWinRate > 0) params.append('minWinRate', String(minWinRate));
      if (minFollowers > 0) params.append('minFollowers', String(minFollowers));
      if (verified) params.append('verified', 'true');

      const response = await fetch(`/api/marketplace/traders/search?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setResults(payload.data?.items || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [query, style, minWinRate, minFollowers, verified]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <SearchIcon size={20} aria-hidden="true" />
        </span>
        <div>
          <Heading level={1} size="text-2xl">
            Trader Search
          </Heading>
          <Text color="muted" className="text-xs">
            Advanced search across the trader marketplace
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
            <div>
              <label className="text-xs font-medium text-slate-600">Trading Style</label>
              <select
                value={style}
                onChange={(event) => setStyle(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {TRADING_STYLES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Min Win Rate (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                step={5}
                value={minWinRate}
                onChange={(event) => setMinWinRate(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600">Min Followers</label>
              <input
                type="number"
                min={0}
                step={10}
                value={minFollowers}
                onChange={(event) => setMinFollowers(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={verified}
                onChange={(event) => setVerified(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-slate-700">Verified Only</span>
            </label>

            <div className="pt-2">
              <Button variant="primary" onClick={performSearch} className="w-full">
                Search
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
                placeholder="Search traders by name, style, or symbol"
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
              {results.map((trader) => (
                <TraderCard
                  key={trader.id}
                  trader={trader}
                  onClick={() => navigate(`/traders/${trader.id}`)}
                  onFollow={() => navigate(`/traders/${trader.id}/follow`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default TraderSearch;