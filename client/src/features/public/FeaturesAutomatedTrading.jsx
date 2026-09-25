import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Server,
  Layers,
  Globe,
  Shield,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const CAPABILITIES = [
  {
    icon: Zap,
    title: 'Cloud Execution',
    description:
      'MetaApi maintains a persistent cloud connection to your MT4 or MT5 account. No expert advisor, no VPS, no local terminal required.',
  },
  {
    icon: Globe,
    title: 'Multi-Account Support',
    description:
      'Connect multiple broker accounts and choose which to use per provider subscription. Demo and live environments are clearly distinguished.',
  },
  {
    icon: Layers,
    title: 'Copy Trading Fan-Out',
    description:
      'One provider signal is processed once and fanned out to thousands of subscribers with independent risk and lot sizing.',
  },
  {
    icon: Shield,
    title: 'Risk Gating',
    description:
      'Every execution passes risk checks first — daily loss, drawdown, sessions, margin, spread, and slippage.',
  },
  {
    icon: RefreshCw,
    title: 'Idempotent Retries',
    description:
      'Failed executions are retried with exponential backoff and routed to a dead letter queue for inspection.',
  },
  {
    icon: Server,
    title: 'Broker Agnostic',
    description:
      'Architected with an abstraction layer for future adapters: MT5 native bridge, cTrader, DXTrade, Interactive Brokers, and OANDA.',
  },
];

const FeaturesAutomatedTrading = function FeaturesAutomatedTrading() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-emerald-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="success" size="sm">
              Automated Trading
            </Badge>
            <Heading level={1} className="mt-4">
              Cloud execution for MT4 and MT5 — no EA, no VPS
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              SignalForge AI executes approved signals on your broker accounts through a cloud
              execution layer. Positions, history, and analytics live in the platform — the broker
              gateway can be replaced without rebuilding your workflow.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{cap.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {cap.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Heading level={2}>From signal to broker in milliseconds</Heading>
              <Text size="lg" color="muted" className="mt-4">
                The execution service is the only component permitted to communicate with MetaApi.
                Every execution request is fully audited, retried on failure, and synchronized
                back into the platform in real time.
              </Text>

              <div className="mt-6 space-y-3">
                {[
                  'Only Execution Service talks to MetaApi',
                  'Broker rejections recorded with full context',
                  'Retry chain and dead letter queue for failures',
                  'Live account state synchronized via WebSocket',
                  'Manual interventions fully attributed',
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                  trailingIcon={ArrowRight}
                >
                  Connect Your Account
                </Button>
              </div>
            </div>

            <Card padding="lg" variant="elevated">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Execution Flow
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  'Risk approved signal',
                  'Personalized per user',
                  'Final pre-flight checks',
                  'Order submitted to MetaApi',
                  'Broker confirms fill',
                  'Trade state engine updated',
                  'Analytics recalculated',
                  'Event bus broadcasts to subscribers',
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Start trading on autopilot
            </Heading>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                trailingIcon={ArrowRight}
              >
                Get Started
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default FeaturesAutomatedTrading;