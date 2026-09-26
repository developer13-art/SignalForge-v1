import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RotateCcw,
  RefreshCw,
  Loader2,
  ArrowRight,
  Radio,
  TrendingUp,
  Brain,
  Shield,
  Zap,
  FileText,
  Activity,
  Search,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import StatCard from '../../components/data-display/StatCard';

const ReplayCenter = function ReplayCenter() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [signalId, setSignalId] = useState('');
  const [tradeId, setTradeId] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/replay/overview', { credentials: 'include' });
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
    { title: 'Signal Replay', icon: Radio, href: '/replay/signal' },
    { title: 'Trade Replay', icon: TrendingUp, href: '/replay/trade' },
    { title: 'AI Processing Replay', icon: Brain, href: '/replay/ai' },
    { title: 'Risk Decision Replay', icon: Shield, href: '/replay/risk' },
    { title: 'Execution Replay', icon: Zap, href: '/replay/execution' },
    { title: 'Provider Message Replay', icon: FileText, href: '/replay/provider-message' },
    { title: 'System Event Timeline', icon: Activity, href: '/replay/system' },
  ];

  const handleSignalReplay = useCallback(() => {
    if (!signalId.trim()) {
      return;
    }
    navigate(`/replay/signal?signalId=${signalId}`);
  }, [signalId, navigate]);

  const handleTradeReplay = useCallback(() => {
    if (!tradeId.trim()) {
      return;
    }
    navigate(`/replay/trade?tradeId=${tradeId}`);
  }, [tradeId, navigate]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <RotateCcw size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Replay Center
            </Heading>
            <Text color="muted" className="text-xs">
              Reconstruct signal processing, trade lifecycles, and system events
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
          label="Signals Replayed"
          value={data?.signalsReplayed || 0}
          icon={Radio}
          variant="primary"
          loading={loading}
        />
        <StatCard
          label="Trades Replayed"
          value={data?.tradesReplayed || 0}
          icon={TrendingUp}
          variant="success"
          loading={loading}
        />
        <StatCard
          label="AI Replays"
          value={data?.aiReplays || 0}
          icon={Brain}
          variant="info"
          loading={loading}
        />
        <StatCard
          label="System Events"
          value={data?.systemEvents || 0}
          icon={Activity}
          variant="default"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card padding="lg">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-indigo-600" aria-hidden="true" />
            <Heading level={3} size="text-base">
              Replay a Signal
            </Heading>
          </div>
          <Text color="muted" className="mt-1 text-xs">
            Enter a signal ID to reconstruct its full processing pipeline
          </Text>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={signalId}
                onChange={(event) => setSignalId(event.target.value)}
                placeholder="Signal ID"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleSignalReplay}
              disabled={!signalId.trim()}
            >
              Replay
            </Button>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-600" aria-hidden="true" />
            <Heading level={3} size="text-base">
              Replay a Trade
            </Heading>
          </div>
          <Text color="muted" className="mt-1 text-xs">
            Enter a trade ID to replay its full lifecycle from execution to close
          </Text>

          <div className="mt-4 flex items-center gap-2">
            <div className="relative flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                value={tradeId}
                onChange={(event) => setTradeId(event.target.value)}
                placeholder="Trade ID"
                className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleTradeReplay}
              disabled={!tradeId.trim()}
            >
              Replay
            </Button>
          </div>
        </Card>
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Replay Modules
        </Heading>
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
                  <Icon size={16} className="shrink-0 text-indigo-600" aria-hidden="true" />
                  <span className="text-xs font-medium text-slate-700">{link.title}</span>
                </div>
                <ArrowRight size={12} className="text-slate-300" aria-hidden="true" />
              </button>
            );
          })}
        </div>
      </Card>
    </Container>
  );
};

export default ReplayCenter;