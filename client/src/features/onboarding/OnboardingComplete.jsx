import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ArrowRight,
  Radio,
  Server,
  Shield,
  BarChart3,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const NEXT_STEPS = [
  {
    icon: Radio,
    title: 'Connect a signal source',
    description: 'Link Telegram, Discord, WhatsApp, TradingView, or your email inbox.',
    href: '/sources',
  },
  {
    icon: Server,
    title: 'Connect a broker account',
    description: 'Attach your MT4 or MT5 account and verify the connection.',
    href: '/brokers',
  },
  {
    icon: Shield,
    title: 'Complete KYC verification',
    description: 'Required before activating live trading and subscriptions.',
    href: '/kyc',
  },
  {
    icon: BarChart3,
    title: 'Explore analytics',
    description: 'See your performance dashboard in real time.',
    href: '/analytics',
  },
];

const OnboardingComplete = function OnboardingComplete() {
  const navigate = useNavigate();

  const handleDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  return (
    <Container size="lg" className="py-12">
      <Card padding="lg" variant="elevated" className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg">
          <CheckCircle2 size={40} aria-hidden="true" />
        </div>

        <Badge variant="success" size="sm" className="mt-6">
          Setup Complete
        </Badge>

        <Heading level={1} className="mt-4">
          Welcome to SignalForge AI
        </Heading>
        <Text size="lg" color="muted" className="mt-4 mx-auto max-w-2xl">
          Your account is ready. Start by connecting the sources and accounts you need — the
          platform takes care of everything else.
        </Text>
      </Card>

      <div className="mt-8">
        <Heading level={2} size="text-lg">
          Suggested next steps
        </Heading>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          {NEXT_STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.title}
                padding="lg"
                hoverable
                clickable
                onClick={() => navigate(item.href)}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{item.description}</p>
                  </div>
                  <ArrowRight size={16} className="shrink-0 text-slate-300" aria-hidden="true" />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="mt-8 text-center">
        <Button
          variant="primary"
          size="lg"
          onClick={handleDashboard}
          trailingIcon={ArrowRight}
        >
          Go to Dashboard
        </Button>
      </div>
    </Container>
  );
};

export default OnboardingComplete;