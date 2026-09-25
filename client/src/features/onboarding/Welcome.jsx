import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shield, Zap, Layers, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: 'AI Understands Any Provider',
    description: 'No format required — SignalForge learns each provider automatically.',
  },
  {
    icon: Zap,
    title: 'Cloud Execution, No VPS',
    description: 'Execute directly on MT4/MT5 through MetaApi. No EA, no local terminal.',
  },
  {
    icon: Shield,
    title: 'Enterprise Risk Built-In',
    description: 'Daily loss, drawdown, sessions, news, correlation, margin, spread.',
  },
  {
    icon: Layers,
    title: 'Real-Time Analytics',
    description: 'Equity curves, Sharpe, Sortino, execution latency, and full replay.',
  },
];

const Welcome = function Welcome() {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    navigate('/onboarding/flow');
  }, [navigate]);

  const handleSkip = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <Container size="lg" className="py-12">
      <Card padding="lg" variant="elevated">
        <div className="text-center">
          <Badge variant="primary" size="sm">
            Welcome to SignalForge AI
          </Badge>
          <Heading level={1} className="mt-4">
            Let&apos;s set up your trading intelligence platform
          </Heading>
          <Text size="lg" color="muted" className="mt-4 mx-auto max-w-2xl">
            In the next few steps, you will connect a signal source, link a broker account, and
            configure your risk profile. This takes about 3 minutes.
          </Text>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handleStart}
              trailingIcon={ArrowRight}
            >
              Start Setup
            </Button>
            <Button variant="outline" size="lg" onClick={handleSkip}>
              Skip for now
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 size={12} className="text-emerald-600" aria-hidden="true" />
            You can configure everything later from your dashboard.
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default Welcome;