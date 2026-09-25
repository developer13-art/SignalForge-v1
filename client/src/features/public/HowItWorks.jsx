import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radio,
  Brain,
  Shield,
  Zap,
  BarChart3,
  ArrowRight,
  CheckCircle2,
  Users,
  Award,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const PIPELINE = [
  {
    icon: Radio,
    title: 'Signal Collection',
    description:
      'Raw messages from Telegram, Discord, WhatsApp, email, TradingView, and REST APIs are collected and persisted unmodified before any processing begins.',
    details: [
      'Idempotency keys prevent duplicate processing',
      'Raw messages stored for replay and retraining',
      'Message bursts absorbed by queue workers',
    ],
  },
  {
    icon: Brain,
    title: 'Signal Classification',
    description:
      'Each message is classified as a new trade, trade management instruction, commentary, news, or noise. Only relevant messages continue into the trading pipeline.',
    details: [
      'Reduces AI cost on irrelevant messages',
      'Prevents commentary from being executed',
      'Keeps Provider DNA training data clean',
    ],
  },
  {
    icon: Award,
    title: 'Provider DNA',
    description:
      'The platform studies 300 to 1,000 historical signals per provider to learn language, abbreviations, symbol conventions, and trade management habits.',
    details: [
      'Fast path via regex and learned rules',
      'Learning path via full AI inference',
      'Every learned pattern improves future accuracy',
    ],
  },
  {
    icon: Shield,
    title: 'Risk Validation',
    description:
      'Every signal runs through per-user risk checks — daily loss, drawdown, sessions, correlation, news, margin, spread, and slippage — before execution.',
    details: [
      'Fail-closed design prevents unwanted execution',
      'Explicit approved or rejected outcome per signal',
      'User-disabled providers and symbols respected',
    ],
  },
  {
    icon: Zap,
    title: 'Execution',
    description:
      'Approved signals are sent through MetaApi to the user MT4 or MT5 account. No expert advisor or VPS is required — the platform runs entirely in the cloud.',
    details: [
      'Only the Execution Service talks to MetaApi',
      'Retries with dead letter queue on failure',
      'Idempotent operations prevent duplicates',
    ],
  },
  {
    icon: BarChart3,
    title: 'Analytics and Audit',
    description:
      'Every execution feeds analytics — equity curves, Sharpe and Sortino ratios, drawdown, behavior analysis — with full lifecycle replay for audit.',
    details: [
      'Real-time analytics via WebSocket',
      'Signal to close timeline for every trade',
      'Provider and trader performance metrics',
    ],
  },
];

const ROLES = [
  {
    title: 'For Traders',
    items: [
      'Follow verified providers from the marketplace',
      'Automate execution with your own risk rules',
      'Track performance across every account',
      'Trade on demo or live with clear environment badges',
    ],
  },
  {
    title: 'For Providers',
    items: [
      'Monetize your signals through subscriptions',
      'Build verifiable reputation on-chain',
      'Receive detailed performance analytics',
      'Manage subscribers, revenue, and marketing tools',
    ],
  },
  {
    title: 'For Enterprises',
    items: [
      'White label the platform with your brand',
      'Dedicated IB and affiliate tracking',
      'Executive BI console with revenue insights',
      'Full API access for custom integrations',
    ],
  },
];

const HowItWorks = function HowItWorks() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              How SignalForge Works
            </Badge>
            <Heading level={1} className="mt-4">
              A complete pipeline from raw signal to executed trade
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              SignalForge AI is not a bot, a scraper, or a copy script. It is an intelligence and
              control layer that ingests, understands, validates, personalizes, and executes
              trading signals with full auditability.
            </Text>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="xl">
          <div className="space-y-8">
            {PIPELINE.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[auto_1fr]"
                >
                  <div className="flex flex-col items-center gap-3 lg:items-start">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                      <Icon size={26} aria-hidden="true" />
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      STEP {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <Card padding="lg">
                    <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">
                      {step.description}
                    </p>
                    <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {step.details.map((detail) => (
                        <li
                          key={detail}
                          className="flex items-start gap-2 text-xs text-slate-600"
                        >
                          <CheckCircle2
                            size={14}
                            className="mt-0.5 shrink-0 text-emerald-600"
                            aria-hidden="true"
                          />
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-slate-50 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2}>Built for every participant in the ecosystem</Heading>
            <Text size="lg" color="muted" className="mt-4">
              One platform, three audiences, one shared intelligence layer.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {ROLES.map((role) => (
              <Card key={role.title} padding="lg">
                <h3 className="text-base font-semibold text-slate-900">{role.title}</h3>
                <ul className="mt-4 space-y-3">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2
                        size={14}
                        className="mt-0.5 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
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
                Architecture Guarantee
              </Badge>
              <Heading level={2} className="mt-4">
                Nothing executes until it is understood, approved, and authorized
              </Heading>
              <Text size="lg" color="muted" className="mt-4">
                Every signal passes through classification, AI parsing, Provider DNA, validation,
                risk, and authorization before a single order is sent. KYC status gates every
                financial action.
              </Text>

              <div className="mt-6">
                <Button
                  variant="primary"
                  onClick={() => navigate('/register')}
                  trailingIcon={ArrowRight}
                >
                  Create Your Account
                </Button>
              </div>
            </div>

            <Card padding="lg" variant="elevated">
              <ol className="space-y-3">
                {[
                  'Message received and stored',
                  'Classification: is this a trade?',
                  'AI parsing and Provider DNA lookup',
                  'Validation: complete and tradable?',
                  'Consensus: do providers agree?',
                  'Risk: does this fit the user profile?',
                  'Execution: only then send the order',
                  'Audit: full lifecycle written to the ledger',
                ].map((item, index) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700">{item}</span>
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
            <Users size={32} className="mx-auto text-indigo-400" aria-hidden="true" />
            <Heading level={2} color="white" className="mt-4">
              Ready to see the pipeline in action?
            </Heading>
            <Text size="lg" className="mt-4 text-slate-300">
              Create your account, connect a source and a broker, and watch the platform operate in
              real time.
            </Text>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                trailingIcon={ArrowRight}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default HowItWorks;