import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Lock,
  Activity,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const CHECKS = [
  { icon: Activity, label: 'Max Daily Loss', description: 'Blocks execution when daily loss exceeds configured amount.' },
  { icon: ShieldAlert, label: 'Max Drawdown', description: 'Emergency stop when account drawdown exceeds threshold.' },
  { icon: Clock, label: 'Trading Sessions', description: 'Restrict trading to specific time windows per account.' },
  { icon: AlertTriangle, label: 'News Filter', description: 'Pause trades during high-impact news events.' },
  { icon: Lock, label: 'Margin and Spread', description: 'Reject trades when margin or spread conditions are unfavorable.' },
  { icon: Shield, label: 'Correlation Exposure', description: 'Prevent opening highly correlated positions.' },
];

const FeaturesRisk = function FeaturesRisk() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-amber-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="warning" size="sm">
              Risk Management
            </Badge>
            <Heading level={1} className="mt-4">
              Enterprise-grade risk on every signal
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Every signal runs through a configurable risk engine before execution. Fail-closed by
              design — if a critical check cannot be completed reliably, the trade is not executed
              automatically.
            </Text>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CHECKS.map((check) => {
              const Icon = check.icon;
              return (
                <Card key={check.label} padding="lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{check.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {check.description}
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
            <Card padding="lg" variant="elevated">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Risk Decision Flow
              </p>
              <ol className="mt-4 space-y-3">
                {[
                  'Signal validated',
                  'User risk profile loaded',
                  'Daily loss check',
                  'Drawdown check',
                  'Session check',
                  'News filter check',
                  'Correlation check',
                  'Margin and spread check',
                  'Approved or rejected',
                ].map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500 text-[11px] font-bold text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <div>
              <Heading level={2}>Automatic protection, configurable rules</Heading>
              <Text size="lg" color="muted" className="mt-4">
                Risk profiles apply per user and per account. Configure once, and every future
                signal is validated against your settings automatically.
              </Text>

              <div className="mt-6 space-y-3">
                {[
                  'Per-account risk configuration',
                  'Emergency stop available at any time',
                  'All risk events logged and replayable',
                  'Correlation protection with configurable pairs',
                  'News filter with global economic calendar',
                  'Custom IF/THEN automation rules',
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
                  Configure Risk
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-slate-900 py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Heading level={2} color="white">
              Trade with confidence, not with hope
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

export default FeaturesRisk;