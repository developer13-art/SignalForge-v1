import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Lock,
  KeyRound,
  FileText,
  Eye,
  Server,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const PILLARS = [
  {
    icon: Lock,
    title: 'Encryption',
    description:
      'All sensitive data encrypted at rest and in transit. Broker credentials and session tokens stored in a secrets vault.',
  },
  {
    icon: KeyRound,
    title: 'Authentication',
    description:
      'JWT access tokens, refresh token rotation, session monitoring, device management, and optional 2FA.',
  },
  {
    icon: Shield,
    title: 'Authorization',
    description:
      'Role-based access control across all administrative and compliance functions.',
  },
  {
    icon: FileText,
    title: 'Audit Logging',
    description:
      'Every administrative action, KYC decision, trade, payment, and referral reward is written to an immutable audit log.',
  },
  {
    icon: Eye,
    title: 'KYC Enforcement',
    description:
      'KYC is enforced server-side on every protected endpoint. Frontend hiding is never sufficient.',
  },
  {
    icon: Server,
    title: 'Infrastructure',
    description:
      'Private object storage, isolated compute, WAF protection, DDoS mitigation, and continuous monitoring.',
  },
];

const GUARANTEES = [
  'MetaApi tokens never appear in the frontend',
  'Broker credentials never stored as plain data',
  'Payment status driven exclusively by webhooks',
  'Every monetary change backed by a ledger entry',
  'KYC enforced server-side on every protected endpoint',
  'Balance changes never mutate directly',
  'Solana integration stores only hashes, not sensitive data',
  'Comprehensive security logging and alerting',
];

const Security = function Security() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Security and Compliance
            </Badge>
            <Heading level={1} className="mt-4">
              Security is a first-class feature, not an afterthought
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Every architectural decision at SignalForge AI is made with security, auditability,
              and compliance in mind.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <Card key={pillar.title} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {pillar.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-white py-20">
        <Container size="xl">
          <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
            <div>
              <Heading level={2}>Non-negotiable guarantees</Heading>
              <Text size="lg" color="muted" className="mt-4">
                These architectural guarantees apply to every deployment of SignalForge AI — no
                exceptions.
              </Text>

              <ul className="mt-6 space-y-3">
                {GUARANTEES.map((item) => (
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
            </div>

            <Card padding="lg" variant="elevated">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Request Security Chain
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  'Authentication',
                  'Authorization',
                  'Account Status Check',
                  'KYC Verification',
                  'Risk and Compliance',
                  'Feature Access',
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>

              <p className="mt-6 text-xs text-slate-500">
                Every request passes through this chain before any business logic executes.
              </p>
            </Card>
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Report a security issue
            </Heading>
            <Text size="lg" className="mt-4 text-slate-300">
              We take security reports seriously and respond within 48 hours.
            </Text>
            <div className="mt-8">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/contact')}
                trailingIcon={ArrowRight}
              >
                Contact Security Team
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Security;