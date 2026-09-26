import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GitCompare, Loader2, RefreshCw, X } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import ProviderCertificationBadge from '../../components/domain/provider/ProviderCertificationBadge';

const METRICS = [
  { key: 'winRate', label: 'Win Rate', format: (v) => `${v}%` },
  { key: 'monthlyReturn', label: 'Monthly Return', format: (v) => `${v}%` },
  { key: 'maxDrawdown', label: 'Max Drawdown', format: (v) => `${v}%` },
  { key: 'avgRR', label: 'Avg R:R', format: (v) => v },
  { key: 'subscribers', label: 'Subscribers', format: (v) => v },
  { key: 'rating', label: 'Rating', format: (v) => v },
  { key: 'signalsCount', label: 'Signals', format: (v) => v },
  { key: 'priceFrom', label: 'Starting Price', format: (v) => `$${v}/mo` },
];

const ProviderComparison = function ProviderComparison() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [availableProviders, setAvailableProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAvailable = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/marketplace/providers?limit=50', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setAvailableProviders(payload.data?.items || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailable();
  }, [fetchAvailable]);

  const addProvider = useCallback((provider) => {
    setProviders((prev) => {
      if (prev.some((p) => p.id === provider.id) || prev.length >= 4) {
        return prev;
      }
      return [...prev, provider];
    });
  }, []);

  const removeProvider = useCallback((id) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <GitCompare size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Comparison
            </Heading>
            <Text color="muted" className="text-xs">
              Compare up to 4 providers side by side
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAvailable}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Add providers to compare
        </Heading>
        <div className="mt-3 flex flex-wrap gap-2">
          {availableProviders.map((provider) => {
            const isSelected = providers.some((p) => p.id === provider.id);
            return (
              <button
                key={provider.id}
                type="button"
                disabled={isSelected || providers.length >= 4}
                onClick={() => addProvider(provider)}
                className={[
                  'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                  isSelected
                    ? 'cursor-not-allowed border-indigo-200 bg-indigo-100 text-indigo-700'
                    : providers.length >= 4
                    ? 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:bg-indigo-50',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {provider.name}
              </button>
            );
          })}
        </div>
      </Card>

      {providers.length > 0 ? (
        <Card padding="none" className="mt-6 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="sticky left-0 z-10 bg-slate-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Metric
                  </th>
                  {providers.map((provider) => (
                    <th key={provider.id} className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => removeProvider(provider.id)}
                          className="self-end rounded p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                          aria-label="Remove"
                        >
                          <X size={12} aria-hidden="true" />
                        </button>
                        <span className="text-sm font-semibold text-slate-900">
                          {provider.name}
                        </span>
                        {provider.certification ? (
                          <ProviderCertificationBadge
                            level={provider.certification}
                            size="xs"
                          />
                        ) : null}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {METRICS.map((metric) => (
                  <tr key={metric.key} className="bg-white">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 text-xs font-medium text-slate-600">
                      {metric.label}
                    </td>
                    {providers.map((provider) => (
                      <td
                        key={`${provider.id}-${metric.key}`}
                        className="px-4 py-3 text-center text-sm font-semibold text-slate-900"
                      >
                        {provider[metric.key] !== undefined
                          ? metric.format(provider[metric.key])
                          : '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : null}
    </Container>
  );
};

export default ProviderComparison;