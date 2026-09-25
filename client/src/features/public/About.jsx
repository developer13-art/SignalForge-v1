import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Target,
  Zap,
  Shield,
  Globe,
  Heart,
  ArrowRight,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const VALUES = [
  {
    icon: Target,
    title: 'Clarity over Complexity',
    description:
      'Trading intelligence should be explainable. Every decision is auditable and every parse is transparent.',
  },
  {
    icon: Shield,
    title: 'Trust Through Design',
    description:
      'Security, compliance, and auditability are architectural guarantees, not features.',
  },
  {
    icon: Zap,
    title: 'Engineering Excellence',
    description:
      'Production-grade systems, meticulous architecture, and no shortcuts in critical paths.',
  },
  {
    icon: Globe,
    title: 'Global by Default',
    description:
      'Multi-language, multi-region, multi-currency, multi-broker. Built for a global market.',
  },
  {
    icon: Heart,
    title: 'Traders First',
    description:
      'Every feature is designed to help real traders make better decisions and execute more reliably.',
  },
  {
    icon: Users,
    title: 'Ecosystem Thinking',
    description:
      'Providers, traders, brokers, and enterprises all benefit from one shared intelligence layer.',
  },
];

const About = function About() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              About SignalForge AI
            </Badge>
            <Heading level={1} className="mt-4">
              Building the intelligence layer for global trading
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              SignalForge AI transforms fragmented trading signals into structured, explainable,
              executable intelligence — with security, compliance, and auditability built in.
            </Text>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="lg">
          <Card padding="lg" variant="elevated">
            <Heading level={3}>Our Mission</Heading>
            <Text size="lg" color="muted" className="mt-4">
              The signal provider ecosystem is fragmented, unstandardized, and hard to trust. Most
              platforms are simple copiers or bots. We built SignalForge AI to be fundamentally
              different: a platform where every signal is understood, every decision is
              explainable, every trade is auditable, and every participant — trader, provider,
              broker, enterprise — benefits from one shared intelligence layer.
            </Text>
            <Text size="lg" color="muted" className="mt-4">
              We combine AI signal understanding with enterprise-grade risk, cloud execution,
              marketplace economics, and on-chain verification to deliver a trading platform that
              is trustworthy at every layer.
            </Text>
          </Card>
        </Container>
      </section>

      <section className="bg-slate-50 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2}>Our values</Heading>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {VALUES.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{value.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {value.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              { value: '35+', label: 'Enterprise Modules' },
              { value: '6', label: 'Signal Source Types' },
              { value: '3', label: 'Payment Providers' },
              { value: '1', label: 'Unified Intelligence Layer' },
            ].map((stat) => (
              <Card key={stat.label} padding="lg" className="text-center">
                <p className="text-3xl font-bold text-indigo-600">{stat.value}</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                  {stat.label}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Join us in building the future of trading intelligence
            </Heading>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/register')}
                trailingIcon={ArrowRight}
              >
                Create Account
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/contact')}
                className="!border-slate-700 !text-slate-200 hover:!bg-slate-800"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default About;