import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Layers,
  Zap,
  Activity,
  RefreshCw,
  Target,
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
    icon: Users,
    title: 'Subscriber Fan-Out',
    description:
      'One provider signal processed once, then fanned out to every subscribed user in parallel batches.',
  },
  {
    icon: Target,
    title: 'Per-User Personalization',
    description:
      'Every subscriber order is personalized — same signal, different lot size, risk, and account.',
  },
  {
    icon: Layers,
    title: 'Multiple Accounts Per User',
    description:
      'Follow five providers using five different accounts and risk profiles simultaneously.',
  },
  {
    icon: Activity,
    title: 'Execution Monitoring',
    description:
      'Real-time latency monitoring, retry queues, and per-subscriber execution state.',
  },
  {
    icon: RefreshCw,
    title: 'Sync on Provider Exit',
    description:
      'When the provider closes, your subscribers close too — unless you have configured otherwise.',
  },
  {
    icon: Zap,
    title: 'Partial Copy Support',
    description:
      'Copy portions of a provider signal, or close subscribers partially in response to management instructions.',
  },
];

const FeaturesCopyTrading = function FeaturesCopyTrading() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-sky-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="info" size="sm">
              Copy Trading Infrastructure
            </Badge>
            <Heading level={1} className="mt-4">
              One signal, thousands of personalized orders
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              SignalForge AI is not a simple copier. It is distributed copy trading infrastructure
              with per-user personalization, independent risk, and full auditability.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
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
              <Heading level={2}>Fan-out architecture built for scale</Heading>
              <Text size="lg" color="muted" className="mt-4">
                A provider signal is processed exactly once. The copy trading engine then
                personalizes and distributes it to every subscriber through parallel workers.
              </Text>

              <div className="mt-6 space-y-3">
                {[
                  'One signal processed once at provider level',
                  'Batched fan-out to subscriber workers',
                  'Per-subscriber risk and lot sizing',
                  'Idempotency keys prevent duplicate trades',
                  'Retry chain and dead letter queue for failures',
                  'Full audit trail for every subscriber order',
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
                  Start Copy Trading
                </Button>
              </div>
            </div>

            <Card padding="lg" variant="elevated">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Fan-Out Example
              </p>
              <div className="mt-4 space-y-2">
                <div className="rounded-md border border-sky-200 bg-sky-50 p-3">
                  <p className="text-xs font-bold text-sky-900">ONE PROVIDER SIGNAL</p>
                  <p className="mt-1 text-xs text-sky-800">EURUSD BUY · Entry 1.1050 · SL 1.1020</p>
                </div>

                {[
                  { name: 'User A', risk: '1% risk · Demo', size: '0.25 lots' },
                  { name: 'User B', risk: '0.5% risk · Live', size: '0.10 lots' },
                  { name: 'User C', risk: 'Fixed · Live', size: '0.05 lots' },
                  { name: 'User D', risk: '2% risk · Live', size: '0.50 lots' },
                ].map((user) => (
                  <div
                    key={user.name}
                    className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{user.name}</p>
                      <p className="text-[10px] text-slate-500">{user.risk}</p>
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      {user.size}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Follow providers on your terms
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

export default FeaturesCopyTrading;