import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Brain,
  Zap,
  Shield,
  BarChart3,
  Users,
  Award,
  Layers,
  Globe,
  Code2,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const FEATURE_GROUPS = [
  {
    title: 'Signal Intelligence',
    description:
      'Ingest, classify, parse, and standardize any trading signal from any source.',
    items: [
      {
        icon: Brain,
        title: 'AI Signal Parser',
        description:
          'Understands free-form language, abbreviations, and multi-language signals — output is a standardized trade object.',
        href: '/features/ai',
      },
      {
        icon: Award,
        title: 'Provider DNA Engine',
        description:
          'Fast path via regex and learned rules; learning path via full AI inference. Improves accuracy with every signal.',
        href: '/features/ai',
      },
      {
        icon: Layers,
        title: 'Multi-Provider Consensus',
        description:
          'Compare signals from independent providers on the same symbol and act only when consensus meets your threshold.',
        href: '/features/ai',
      },
    ],
  },
  {
    title: 'Execution and Trading',
    description:
      'Automate trades on your broker accounts through a cloud execution layer.',
    items: [
      {
        icon: Zap,
        title: 'Cloud Execution',
        description:
          'No expert advisor, no VPS, no local terminal. MetaApi maintains a persistent cloud connection to MT4 or MT5.',
        href: '/features/automated-trading',
      },
      {
        icon: Layers,
        title: 'Copy Trading Fan-Out',
        description:
          'One provider signal fans out to thousands of subscribers, each with independent risk and lot sizing.',
        href: '/features/copy-trading',
      },
      {
        icon: Globe,
        title: 'Demo and Live Accounts',
        description:
          'Connect multiple MT4 and MT5 accounts, choose which to use per subscription, and see the environment clearly at all times.',
        href: '/features/automated-trading',
      },
    ],
  },
  {
    title: 'Risk and Compliance',
    description:
      'Server-side risk, KYC, and auditability enforced on every financial action.',
    items: [
      {
        icon: Shield,
        title: 'Risk Decision Engine',
        description:
          'Per-user profiles with daily loss, drawdown, sessions, correlation, news, margin, spread, and slippage checks.',
        href: '/features/risk',
      },
      {
        icon: Shield,
        title: 'KYC and Identity',
        description:
          'Liveness checks, document verification, and server-side gating on every protected feature.',
        href: '/security',
      },
      {
        icon: CheckCircle2,
        title: 'Full Audit Trail',
        description:
          'Every signal, trade, KYC decision, and referral reward backed by an explicit event and ledger trail.',
        href: '/security',
      },
    ],
  },
  {
    title: 'Analytics and Marketplace',
    description:
      'Real-time analytics, verifiable reputation, and a full marketplace of providers and traders.',
    items: [
      {
        icon: BarChart3,
        title: 'Analytics and Replay',
        description:
          'Equity curves, Sharpe and Sortino ratios, execution latency, behavior analysis, and full trade replay.',
        href: '/features/analytics',
      },
      {
        icon: Users,
        title: 'Provider Marketplace',
        description:
          'Verified profiles, performance history, reviews, and subscription plans — with on-chain reputation.',
        href: '/features/marketplace',
      },
      {
        icon: Code2,
        title: 'Developer Platform',
        description:
          'REST API integration for direct provider signal submission, webhooks, and full platform access.',
        href: '/api-platform',
      },
    ],
  },
];

const Features = function Features() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Platform Features
            </Badge>
            <Heading level={1} className="mt-4">
              Every layer of the trading intelligence stack
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              From signal ingestion to execution, analytics, and marketplace — one integrated,
              event-driven platform.
            </Text>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="xl">
          <div className="space-y-16">
            {FEATURE_GROUPS.map((group) => (
              <div key={group.title}>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">{group.title}</h2>
                  <p className="mt-1 text-sm text-slate-500">{group.description}</p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Card
                        key={item.title}
                        padding="lg"
                        hoverable
                        clickable
                        onClick={() => navigate(item.href)}
                      >
                        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Icon size={20} aria-hidden="true" />
                        </span>
                        <h3 className="mt-4 text-base font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-slate-600">
                          {item.description}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                          Learn more
                          <ArrowRight size={12} aria-hidden="true" />
                        </span>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Explore the platform in depth
            </Heading>
            <Text size="lg" className="mt-4 text-slate-300">
              Each subsystem has its own detailed page with examples, architecture, and getting
              started guidance.
            </Text>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                trailingIcon={ArrowRight}
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/pricing')}
                className="!border-slate-700 !text-slate-200 hover:!bg-slate-800"
              >
                View Pricing
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Features;