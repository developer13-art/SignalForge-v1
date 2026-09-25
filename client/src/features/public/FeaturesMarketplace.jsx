import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  Star,
  TrendingUp,
  Shield,
  BadgeCheck,
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
    title: 'Provider Discovery',
    description:
      'Browse verified providers by category, performance, drawdown, win rate, and reviews.',
  },
  {
    icon: Award,
    title: 'On-Chain Reputation',
    description:
      'Certification, DNA confidence, and reputation records are attested on Solana — independently verifiable.',
  },
  {
    icon: Star,
    title: 'Reviews and Ratings',
    description:
      'Verified subscriber reviews with rating breakdowns and moderation to prevent manipulation.',
  },
  {
    icon: TrendingUp,
    title: 'Transparent Performance',
    description:
      'Monthly returns, drawdown, win rate, and execution latency for every provider, publicly visible.',
  },
  {
    icon: Shield,
    title: 'Certification System',
    description:
      'Providers can be certified against historical accuracy, backtesting, consistency, and risk metrics.',
  },
  {
    icon: BadgeCheck,
    title: 'On-Chain Attestations',
    description:
      'Every certification and reputation update is anchored on Solana with a verifiable transaction signature.',
  },
];

const FeaturesMarketplace = function FeaturesMarketplace() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-emerald-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="success" size="sm">
              Provider Marketplace
            </Badge>
            <Heading level={1} className="mt-4">
              Discover verified providers, with on-chain reputation
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Browse providers by category and performance. Every certification, DNA confidence,
              and reputation record can be attested on Solana — making claims independently
              verifiable.
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
              <Heading level={2}>Verified reputation, not marketing claims</Heading>
              <Text size="lg" color="muted" className="mt-4">
                SignalForge AI stores only hashes, attestations, and public reputation on-chain.
                Sensitive data remains private. Anyone can verify claims independently.
              </Text>

              <div className="mt-6 space-y-3">
                {[
                  'Certification status attested on Solana',
                  'Provider DNA confidence anchored on-chain',
                  'Performance consistency scores verifiable',
                  'Public verification page for every attestation',
                  'Reviews and ratings moderated for integrity',
                  'Provider profiles enriched with analytics',
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
                  onClick={() => navigate('/providers')}
                  trailingIcon={ArrowRight}
                >
                  Browse Marketplace
                </Button>
              </div>
            </div>

            <Card padding="lg" variant="elevated">
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-base font-bold">
                    FX
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Forex Kings</p>
                    <p className="text-xs text-slate-500">Majors and crosses specialist</p>
                  </div>
                </div>
                <Badge variant="success" size="xs">
                  Gold
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-3">
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-600">72.4%</p>
                  <p className="mt-0.5 text-[10px] uppercase text-slate-500">Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">845</p>
                  <p className="mt-0.5 text-[10px] uppercase text-slate-500">Signals</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-indigo-600">88%</p>
                  <p className="mt-0.5 text-[10px] uppercase text-slate-500">DNA</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-slate-900">4.8</p>
                  <p className="mt-0.5 text-[10px] uppercase text-slate-500">Rating</p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-3">
                <p className="text-xs font-semibold text-violet-900">Solana Verified</p>
                <p className="mt-1 font-mono text-[10px] text-violet-700">
                  Attestation: 4b2c...8a91 · Slot 246,331,589
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
              Find the right providers for your strategy
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

export default FeaturesMarketplace;