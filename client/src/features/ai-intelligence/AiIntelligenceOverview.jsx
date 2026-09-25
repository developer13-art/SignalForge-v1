import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  RefreshCw,
  Loader2,
  ArrowRight,
  Sparkles,
  Award,
  Languages,
  ShieldCheck,
  Layers,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const QUICK_LINKS = [
  {
    title: 'AI Signal Parser',
    description: 'See how AI interprets messages in real time',
    icon: Brain,
    href: '/ai/parser',
  },
  {
    title: 'Provider DNA',
    description: 'Inspect learned patterns per provider',
    icon: Award,
    href: '/ai/provider-dna',
  },
  {
    title: 'Multilingual Processing',
    description: 'See language support and detected languages',
    icon: Languages,
    href: '/ai/multilingual',
  },
  {
    title: 'Confidence Engine',
    description: 'Understand how confidence is calculated',
    icon: ShieldCheck,
    href: '/ai/confidence',
  },
  {
    title: 'Consensus Engine',
    description: 'Multi-provider agreement analysis',
    icon: Layers,
    href: '/ai/consensus',
  },
  {
    title: 'Model Performance',
    description: 'Parsing accuracy and latency metrics',
    icon: Sparkles,
    href: '/ai/performance',
  },
];

const AiIntelligenceOverview = function AiIntelligenceOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/overview', { credentials: 'include' });
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
    fetchOverview();
  }, [fetchOverview]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Brain size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              AI Signal Intelligence
            </Heading>
            <Text color="muted" className="text-xs">
              Explore how SignalForge understands and standardizes your signals
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchOverview}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Messages Processed"
          value={data?.messagesProcessed || 0}
          icon={Brain}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Avg Confidence"
          value={data?.avgConfidence !== undefined ? `${data.avgConfidence}%` : '—'}
          icon={ShieldCheck}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Providers Learned"
          value={data?.providersLearned || 0}
          icon={Award}
          variant="default"
          loading={loading}
        />
        <StatCard
          label="Languages Detected"
          value={data?.languagesDetected || 0}
          icon={Languages}
          variant="info"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {QUICK_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <Card
              key={link.title}
              padding="lg"
              hoverable
              clickable
              onClick={() => navigate(link.href)}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{link.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{link.description}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-300" aria-hidden="true" />
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  );
};

export default AiIntelligenceOverview;