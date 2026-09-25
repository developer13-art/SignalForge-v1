import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Brain,
  Shield,
  Zap,
  BarChart3,
  Users,
  Award,
  CheckCircle2,
  Play,
  TrendingUp,
  Layers,
  Globe,
} from 'lucide-react';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Badge from '../../components/common/Badge';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI Signal Intelligence',
    description:
      'Understands any provider format — free-form language, abbreviations, and multi-language signals — and produces a standardized trade object.',
  },
  {
    icon: Zap,
    title: 'Cloud Execution',
    description:
      'No expert advisor, no VPS, no local terminal. Trades execute on your connected MT4/MT5 account through a cloud execution layer.',
  },
  {
    icon: Shield,
    title: 'Enterprise Risk Engine',
    description:
      'Per-user risk profiles with daily loss limits, drawdown protection, correlation checks, news filters, and emergency stop.',
  },
  {
    icon: Layers,
    title: 'Multi-Provider Consensus',
    description:
      'Compare signals from multiple independent providers and act only when consensus is reached according to your strategy.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Equity curves, Sharpe and Sortino ratios, execution latency, behavior analysis, and full trade replay for every position.',
  },
  {
    icon: Users,
    title: 'Provider Marketplace',
    description:
      'Discover verified signal providers with on-chain reputation, performance history, reviews, and transparent subscription plans.',
  },
];

const STATS = [
  { value: '99.6%', label: 'Signal parsing accuracy' },
  { value: '200ms', label: 'Median execution latency' },
  { value: '35+', label: 'Enterprise modules' },
  { value: '24/7', label: 'Platform availability' },
];

const STEPS = [
  {
    number: '01',
    title: 'Connect Signal Sources',
    description:
      'Link Telegram channels, Discord servers, WhatsApp groups, email inboxes, TradingView webhooks, or REST API sources.',
  },
  {
    number: '02',
    title: 'Connect Broker Account',
    description:
      'Securely connect your MT4 or MT5 trading account. No expert advisor or VPS required — SignalForge owns the data.',
  },
  {
    number: '03',
    title: 'Configure Risk and Automation',
    description:
      'Define your risk profile, lot sizing, trading sessions, and IF/THEN automation rules in minutes.',
  },
  {
    number: '04',
    title: 'Execute and Monitor',
    description:
      'Signals are classified, parsed, validated, and executed automatically. Track everything in real time with full audit trails.',
  },
];

const Home = function Home() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(0);

  const handleGetStarted = useCallback(() => {
    navigate('/register');
  }, [navigate]);

  const handleWatchDemo = useCallback(() => {
    navigate('/how-it-works');
  }, [navigate]);

  const handleViewFeatures = useCallback(() => {
    navigate('/features');
  }, [navigate]);

  const handleProviderMarketplace = useCallback(() => {
    navigate('/providers');
  }, [navigate]);

  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
        <Container size="xl" className="relative py-20 lg:py-28">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="flex flex-col items-start gap-6">
              <Badge variant="primary" size="md" className="inline-flex items-center gap-1.5">
                <Award size={12} aria-hidden="true" />
                Enterprise Trading Intelligence Platform
              </Badge>

              <Heading level={1} className="max-w-2xl">
                Turn any trading signal into structured, explainable intelligence
              </Heading>

              <Text size="lg" color="muted" className="max-w-xl">
                SignalForge AI ingests signals from Telegram, Discord, WhatsApp, TradingView, email,
                and REST APIs. It understands them regardless of writing style, applies your risk
                rules, and executes on your MT4/MT5 accounts through a cloud execution layer.
              </Text>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleGetStarted}
                  trailingIcon={ArrowRight}
                >
                  Get Started
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleWatchDemo}
                  leadingIcon={Play}
                >
                  See How It Works
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                  No expert advisor
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                  No VPS required
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                  Full audit trail
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-indigo-100 via-violet-100 to-purple-100 blur-2xl opacity-60" />
              <Card padding="lg" variant="elevated" className="relative">
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400">
                    signalforge.ai/dashboard
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={16} className="text-emerald-600" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-900">XAUUSD BUY</p>
                        <p className="text-[10px] text-emerald-700">
                          Executed · Confidence 96%
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-emerald-700">+$248.50</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Brain size={16} className="text-indigo-600" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Provider DNA learned</p>
                        <p className="text-[10px] text-slate-500">
                          Trader X · Portuguese · 8 rules
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600">v3</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Shield size={16} className="text-emerald-600" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">Risk check passed</p>
                        <p className="text-[10px] text-slate-500">
                          12 of 12 checks · within limits
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-emerald-600">OK</span>
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-violet-600" aria-hidden="true" />
                      <div>
                        <p className="text-xs font-semibold text-slate-900">
                          On-chain attestation
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Solana · verified provider
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-violet-600">Anchored</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <Container size="xl">
          <div className="grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold text-slate-900 sm:text-4xl">{stat.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="neutral" size="sm">
              Platform Capabilities
            </Badge>
            <Heading level={2} className="mt-4">
              Everything you need to run intelligent trading automation
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              From signal ingestion to execution, analytics, marketplace, and compliance — one
              integrated platform.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.title}
                  padding="lg"
                  variant="default"
                  onMouseEnter={() => setActiveFeature(index)}
                  className={[
                    'transition-all duration-200',
                    activeFeature === index ? 'ring-2 ring-indigo-500 shadow-lg' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Button variant="outline" onClick={handleViewFeatures} trailingIcon={ArrowRight}>
              Explore All Features
            </Button>
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              How It Works
            </Badge>
            <Heading level={2} className="mt-4">
              From raw signal to executed trade in four steps
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              A fully automated pipeline that never bypasses risk, KYC, or validation.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <Card key={step.number} padding="lg" variant="default">
                <span className="text-3xl font-bold text-indigo-600">{step.number}</span>
                <h3 className="mt-3 text-base font-semibold text-slate-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {step.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="primary" size="sm">
                Provider Marketplace
              </Badge>
              <Heading level={2} className="mt-4">
                Discover verified providers with on-chain reputation
              </Heading>
              <Text size="lg" color="muted" className="mt-4">
                Every certification, DNA confidence score, and reputation record can be attested
                on Solana — making provider claims independently verifiable.
              </Text>

              <ul className="mt-6 space-y-3">
                {[
                  'Verifiable on-chain provider reputation',
                  'Signal provenance recorded on Solana',
                  'Transparent performance history',
                  'Independent reviews and ratings',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-slate-700">
                    <CheckCircle2
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button
                  variant="primary"
                  onClick={handleProviderMarketplace}
                  trailingIcon={ArrowRight}
                >
                  Browse Providers
                </Button>
              </div>
            </div>

            <Card padding="lg" variant="elevated">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-base font-bold">
                    TX
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Trader X</p>
                    <p className="text-xs text-slate-500">Gold and FX specialist</p>
                  </div>
                </div>
                <Badge variant="success" size="xs">
                  Verified
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">69.7%</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    Win Rate
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-slate-900">1,240</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    Signals
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-indigo-600">91%</p>
                  <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                    DNA
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-violet-900">
                  <Award size={12} aria-hidden="true" />
                  Solana Attested
                </p>
                <p className="mt-1 font-mono text-[10px] text-violet-700">
                  SF-2841...9a8f · Slot 245,891,240
                </p>
              </div>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Ready to automate your trading intelligence?
            </Heading>
            <Text size="lg" className="mt-4 text-slate-300">
              Join SignalForge AI and transform fragmented signals into structured, explainable,
              executable intelligence.
            </Text>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleGetStarted}
                trailingIcon={ArrowRight}
              >
                Create Free Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/contact')}
                className="!border-slate-700 !text-slate-200 hover:!bg-slate-800"
              >
                Contact Sales
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;