import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  RefreshCw,
  Loader2,
  ArrowRight,
  Activity,
  Target,
  Clock,
  Shield,
  Repeat,
  Wind,
  Zap,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const IntelligenceOverview = function IntelligenceOverview() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader-intelligence/overview', {
        credentials: 'include',
      });
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
    { title: 'Consistency & Discipline', icon: Activity, href: '/intelligence/consistency' },
    { title: 'Average Risk/Reward', icon: Target, href: '/intelligence/risk-reward' },
    { title: 'Holding Time', icon: Clock, href: '/intelligence/holding-time' },
    { title: 'Risk Behavior', icon: Shield, href: '/intelligence/risk-behavior' },
    { title: 'Martingale/Grid Detection', icon: Repeat, href: '/intelligence/martingale-grid' },
    { title: 'News Exposure', icon: Wind, href: '/intelligence/news-exposure' },
    { title: 'Recovery Trading', icon: Zap, href: '/intelligence/recovery' },
    { title: 'Trading Style', icon: Brain, href: '/intelligence/trading-style' },
    { title: 'Behavior Timeline', icon: Activity, href: '/intelligence/timeline' },
  ];

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Brain size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trader Intelligence
            </Heading>
            <Text color="muted" className="text-xs">
              AI-computed behavioral and style metrics for your trading
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
          Refresh
        </Button>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Consistency"
          value={data?.consistency !== undefined ? `${data.consistency}%` : '—'}
          icon={Activity}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Discipline"
          value={data?.discipline !== undefined ? `${data.discipline}%` : '—'}
          icon={Shield}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="Avg Holding Time"
          value={data?.avgHoldingTime || '—'}
          icon={Clock}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="Style"
          value={data?.styleClassification || '—'}
          icon={Brain}
          variant="default"
          loading={loading}
        />
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Intelligence Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => navigate(link.href)}
                className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-left transition-colors hover:border-indigo-400 hover:bg-indigo-50"
              >
                <div className="flex items-center gap-2">
                  <Icon size={16} className="shrink-0 text-violet-600" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-700">{link.title}</span>
                </div>
                <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Card>

      {data?.summary ? (
        <Card padding="lg" className="mt-6">
          <Heading level={3} size="text-base">
            AI Summary
          </Heading>
          <Text color="muted" className="mt-2">
            {data.summary}
          </Text>
        </Card>
      ) : null}
    </Container>
  );
};

export default IntelligenceOverview;