import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, RefreshCw, Loader2, Search, SlidersHorizontal } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import DataGrid from '../../components/data-display/DataGrid';
import ProviderCard from '../../components/domain/provider/ProviderCard';
import EmptyState from '../../components/common/EmptyState';

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'performance', label: 'Best Performance' },
  { value: 'winRate', label: 'Highest Win Rate' },
  { value: 'newest', label: 'Newest' },
  { value: 'rating', label: 'Top Rated' },
];

const BrowseProviders = function BrowseProviders() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('popular');

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) {
        params.append('q', search);
      }
      params.append('sort', sort);

      const response = await fetch(`/api/marketplace/providers?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setProviders(payload.data?.items || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [search, sort]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Users size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Marketplace
            </Heading>
            <Text color="muted" className="text-xs">
              Discover verified signal providers with on-chain reputation
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchProviders}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search providers by name, symbol, or strategy"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-400" aria-hidden="true" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <div className="mt-6">
        <DataGrid
          items={providers}
          loading={loading}
          columns="lg"
          keyExtractor={(item) => item.id}
          renderItem={(provider) => (
            <ProviderCard
              provider={provider}
              onClick={() => navigate(`/providers/${provider.id}`)}
              onSubscribe={() => navigate(`/providers/${provider.id}/subscribe`)}
            />
          )}
          emptyState={
            <EmptyState
              icon={Users}
              title="No providers found"
              description={search ? 'Try a different search term.' : 'No providers are available.'}
            />
          }
        />
      </div>
    </Container>
  );
};

export default BrowseProviders;