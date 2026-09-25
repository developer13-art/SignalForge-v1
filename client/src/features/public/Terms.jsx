import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, UserCheck, ShieldAlert, CreditCard, Ban, Gavel } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const SECTIONS = [
  {
    icon: FileText,
    title: '1. Acceptance of Terms',
    content:
      'By accessing or using SignalForge AI, you agree to be bound by these Terms of Service. If you do not agree, you must not use the platform. These terms apply to all users, providers, traders, and enterprises.',
  },
  {
    icon: UserCheck,
    title: '2. Account Registration',
    content:
      'You must provide accurate information during registration and keep your credentials secure. You are responsible for all activity under your account. Accounts are individual and cannot be transferred without our consent.',
  },
  {
    icon: ShieldAlert,
    title: '3. KYC and Compliance',
    content:
      'You must complete KYC verification before accessing protected features such as subscribing, connecting broker accounts, activating automation, or earning referral rewards. We may request additional information to comply with applicable laws.',
  },
  {
    icon: CreditCard,
    title: '4. Subscriptions and Payments',
    content:
      'Subscriptions are billed in advance on a recurring basis. Payments are processed by third-party providers (Stripe, Paystack, Flutterwave, or Solana). Renewal status is driven exclusively by provider webhook notifications.',
  },
  {
    icon: Ban,
    title: '5. Prohibited Conduct',
    content:
      'You may not use the platform for fraud, money laundering, market manipulation, or any illegal activity. You may not attempt to reverse-engineer the platform, abuse APIs, or interfere with other users.',
  },
  {
    icon: Gavel,
    title: '6. Limitation of Liability',
    content:
      'SignalForge AI is a technology platform. Trading involves significant risk. We are not liable for trading losses, broker outages, market conditions, or any indirect, consequential, or incidental damages arising from your use of the platform.',
  },
];

const Terms = function Terms() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Terms of Service
            </Badge>
            <Heading level={1} className="mt-4">
              The rules that govern your use of SignalForge AI
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Please read these terms carefully before using the platform.
            </Text>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="lg">
          <div className="space-y-6">
            {SECTIONS.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} padding="lg">
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-600">
                        {section.content}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 rounded-md border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Trading Risk Warning</p>
            <p className="mt-2 text-xs leading-relaxed text-amber-800">
              Trading foreign exchange, commodities, indices, and other financial instruments
              carries significant risk. SignalForge AI does not provide investment advice. You are
              solely responsible for your trading decisions and risk management. Never trade with
              money you cannot afford to lose.
            </p>
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Contact Legal Team
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Terms;