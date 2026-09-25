import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Palette,
  Globe,
  Shield,
  Layers,
  BarChart3,
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

const STEPS = [
  {
    number: '01',
    title: 'Brand Configuration',
    description: 'Upload your logo, set your colors, and configure your branding across every page.',
  },
  {
    number: '02',
    title: 'Domain Setup',
    description: 'Point your custom domain to SignalForge AI. SSL and DNS are handled automatically.',
  },
  {
    number: '03',
    title: 'Theme and Copy',
    description: 'Customize email templates, page copy, and marketing materials.',
  },
  {
    number: '04',
    title: 'Pricing and Plans',
    description: 'Set your own subscription plans, marketplace fees, and revenue model.',
  },
  {
    number: '05',
    title: 'Launch',
    description: 'Go live with your branded experience, backed by the full SignalForge infrastructure.',
  },
];

const WhiteLabel = function WhiteLabel() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-violet-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              White Label
            </Badge>
            <Heading level={1} className="mt-4">
              Launch your own branded trading intelligence platform
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Run the entire SignalForge AI platform under your own brand, domain, and pricing.
              Ideal for brokers, IBs, and trading communities.
            </Text>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/contact')}
                trailingIcon={ArrowRight}
              >
                Request Access
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/enterprise')}
              >
                Compare with Enterprise
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2}>Everything you need to launch your brand</Heading>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Palette,
                title: 'Full Branding',
                description: 'Logo, colors, fonts, and copy across every page and email.',
              },
              {
                icon: Globe,
                title: 'Custom Domain',
                description: 'Serve the platform on your own domain with SSL and DNS handled for you.',
              },
              {
                icon: Shield,
                title: 'Compliance Control',
                description: 'Configure KYC requirements and compliance workflows per region.',
              },
              {
                icon: Layers,
                title: 'Full Feature Set',
                description: 'All SignalForge features — signals, execution, analytics, marketplace.',
              },
              {
                icon: BarChart3,
                title: 'Your Own Analytics',
                description: 'Track users, revenue, provider performance, and marketplace activity.',
              },
              {
                icon: Zap,
                title: 'Dedicated Support',
                description: 'A dedicated account manager and priority technical support.',
              },
            ].map((cap) => {
              const Icon = cap.icon;
              return (
                <Card key={cap.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
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
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2}>Launch in five steps</Heading>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-5">
            {STEPS.map((step) => (
              <Card key={step.number} padding="lg" className="flex flex-col">
                <span className="text-3xl font-bold text-violet-600">{step.number}</span>
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
            <Card padding="lg" variant="elevated">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-1.5">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                </div>
                <span className="ml-auto text-[11px] font-medium text-slate-400">
                  yourbrand.com
                </span>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white font-bold">
                  YB
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Your Brand</p>
                  <p className="text-[11px] text-slate-500">Powered by SignalForge AI</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {['Dashboard', 'Signals', 'Trading', 'Marketplace'].map((nav) => (
                  <div
                    key={nav}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700"
                  >
                    {nav}
                  </div>
                ))}
              </div>
            </Card>

            <div>
              <Heading level={2}>Under the hood, it is SignalForge AI</Heading>
              <Text size="lg" color="muted" className="mt-4">
                Every feature is fully available to your users. Every improvement to SignalForge
                AI is available to your platform automatically.
              </Text>

              <div className="mt-6 space-y-3">
                {[
                  'Continuous platform updates',
                  'Full provider marketplace',
                  'Signal intelligence with Provider DNA',
                  'Cloud execution for MT4 and MT5',
                  'Complete analytics and replay',
                  'Solana attestations and reputation',
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
                  Request White Label Access
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default WhiteLabel;