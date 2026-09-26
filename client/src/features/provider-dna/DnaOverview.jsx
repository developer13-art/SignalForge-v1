import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dna,
  RefreshCw,
  Loader2,
  ArrowRight,
  Languages,
  TrendingUp,
  BookOpen,
  Shield,
  Activity,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';

const DnaOverview = function DnaOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/overview', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const quickLinks = [
    { title: 'Language Profile', icon: Languages, href: '/ai/provider-dna/language' },
    { title: 'Symbol Mapping', icon: TrendingUp, href: '/ai/provider-dna/symbols' },
    { title: 'Abbreviations', icon: BookOpen, href: '/ai/provider-dna/abbreviations' },
    { title: 'Trade Management', icon: Shield, href: '/ai/provider-dna/management' },
    { title: 'Risk Behavior', icon: Activity, href: '/ai/provider-dna/risk' },
    { title: 'Learned Patterns', icon: Dna, href: '/ai/provider-dna/patterns' },
    { title: 'DNA Confidence', icon: Shield, href: '/ai/provider-dna/confidence' },
    { title: 'Version History', icon: Activity, href: '/ai/provider-dna/versions' },
    { title: 'Training Messages', icon: BookOpen, href: '/ai/provider-dna/training' },
    { title: 'DNA Test', icon: Dna, href: '/ai/provider-dna/test' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Dna size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider DNA
            </Heading>
            <Text color="muted" className="text-xs">
              Learned understanding of how your providers write signals
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Providers Profiled"
          value={data?.providersProfiled || 0}
          icon={Dna}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Total Rules Learned"
          value={data?.totalRules || 0}
          icon={BookOpen}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Average DNA Confidence"
          value={data?.avgConfidence !== undefined ? `${data.avgConfidence}%` : '—'}
          icon={Shield}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Fast Path Hit Rate"
          value={data?.fastPathHitRate !== undefined ? `${data.fastPathHitRate}%` : '—'}
          icon={Activity}
          variant="default"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Quick Links
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                <span className="text-xs font-medium text-slate-700">{link.title}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Providers by DNA Confidence
        </Heading>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={24} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (data?.providers || []).length === 0 ? (
          <EmptyState
            icon={Dna}
            title="No provider DNA yet"
            description="Provider DNA is built automatically as signals flow through your sources."
          />
        ) : (
          <ul className="mt-4 space-y-3">
            {data.providers.slice(0, 10).map((provider) => (
              <li
                key={provider.providerId}
                className="flex items-center justify-between gap-4 rounded-md border border-slate-200 bg-white p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {provider.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {provider.signalsProcessed || 0} signals · {provider.rulesCount || 0} rules
                  </p>
                </div>
                <div className="w-32 shrink-0">
                  <ProgressBar
                    value={provider.confidence || 0}
                    max={100}
                    size="sm"
                    variant="primary"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/ai/provider-dna/${provider.providerId}/rules`)}
                  className="shrink-0 rounded p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-indigo-600"
                  aria-label="View rules"
                >
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default DnaOverview;