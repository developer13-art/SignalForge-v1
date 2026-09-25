import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  Shield,
  BarChart3,
  Globe,
  Zap,
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
    icon: Building2,
    title: 'White Label',
    description:
      'Run the entire platform under your brand with custom domain, theme, and pricing.',
  },
  {
    icon: Users,
    title: 'IB and Affiliate Tracking',
    description:
      'Full introducing broker tracking, commission structures, and revenue dashboards.',
  },
  {
    icon: Shield,
    title: 'Compliance Ready',
    description:
      'Full KYC workflow, audit trails, and configurable compliance controls.',
  },
  {
    icon: BarChart3,
    title: 'Executive BI Console',
    description:
      'Revenue composition, growth, retention, and platform performance dashboards.',
  },
  {
    icon: Globe,
    title: 'Global Scale',
    description:
      'Architected for horizontal scale — thousands of sources and hundreds of thousands of executions.',
  },
  {
    icon: Zap,
    title: 'Dedicated Infrastructure',
    description:
      'Isolated compute, dedicated database, and SLA-backed uptime for enterprise customers.',
  },
];

const Enterprise = function Enterprise() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-900 to-slate-800 py-20 text-white">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Enterprise
            </Badge>
            <Heading level={1} color="white" className="mt-4">
              SignalForge AI for enterprises, brokers, and IBs
            </Heading>
            <Text size="lg" className="mt-4 text-slate-300">
              Deploy the complete trading intelligence platform under your brand, with full
              control over pricing, compliance, and infrastructure.
            </Text>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/contact')}
                trailingIcon={ArrowRight}
              >
                Contact Sales
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/white-label')}
                className="!border-slate-700 !text-slate-200 hover:!bg-slate-800"
              >
                Explore White Label
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
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

      <section className="bg-slate-50 py-20">
        <Container size="xl">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <Heading level={2}>Why enterprises choose SignalForge AI</Heading>
              <div className="mt-6 space-y-3">
                {[
                  'Fully branded experience for your customers',
                  'Complete IB and affiliate tracking',
                  'Executive dashboards for revenue and growth',
                  'Dedicated infrastructure and SLA guarantees',
                  'Configurable compliance and KYC workflows',
                  'Full API access for integrations',
                  'Onboarding, migration, and ongoing support',
                  'Custom pricing and revenue models',
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
                  onClick={() => navigate('/contact')}
                  trailingIcon={ArrowRight}
                >
                  Talk to Sales
                </Button>
              </div>
            </div>

            <Card padding="lg" variant="elevated">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Enterprise Features at a Glance
              </p>
              <ul className="mt-4 space-y-3">
                {[
                  { label: 'White Label', value: 'Full customization' },
                  { label: 'Dedicated Infrastructure', value: 'Isolated compute' },
                  { label: 'Executive BI', value: 'Revenue and growth analytics' },
                  { label: 'IB Tracking', value: 'Multi-tier commission models' },
                  { label: 'SLA', value: '99.9% uptime target' },
                  { label: 'Support', value: 'Dedicated account manager' },
                ].map((row) => (
                  <li
                    key={row.label}
                    className="flex items-center justify-between gap-3 border-b border-slate-100 pb-2.5 last:border-b-0 last:pb-0"
                  >
                    <span className="text-sm text-slate-600">{row.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{row.value}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Ready to discuss your requirements?
            </Heading>
            <Text size="lg" className="mt-4 text-slate-300">
              Our enterprise team will help you plan, deploy, and scale the platform.
            </Text>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/contact')}
                trailingIcon={ArrowRight}
              >
                Contact Enterprise Sales
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Enterprise;