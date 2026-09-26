import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  MessageCircle,
  CreditCard,
  Shield,
  TrendingUp,
  Server,
  ArrowRight,
  Search,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';

const SECTIONS = [
  {
    icon: TrendingUp,
    title: 'Trading Support',
    description: 'Execution, positions, and trade lifecycle questions',
    href: '/support/faq/trading',
  },
  {
    icon: Shield,
    title: 'KYC Support',
    description: 'Identity verification and compliance help',
    href: '/support/faq/kyc',
  },
  {
    icon: CreditCard,
    title: 'Billing Support',
    description: 'Subscriptions, payments, invoices, and refunds',
    href: '/support/faq/billing',
  },
  {
    icon: Server,
    title: 'Technical Support',
    description: 'Broker connection, signals, and API issues',
    href: '/support/technical',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Base',
    description: 'In-depth guides and documentation',
    href: '/support/knowledge-base',
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    description: 'Open a ticket and speak with our team',
    href: '/support/tickets/new',
  },
];

const HelpCenter = function HelpCenter() {
  const navigate = useNavigate();

  return (
    <Container size="lg" className="py-6">
      <Card padding="lg" variant="elevated">
        <div className="text-center">
          <Heading level={1} size="text-2xl">
            Help Center
          </Heading>
          <Text color="muted" className="mt-2">
            Find answers, browse guides, or contact our support team.
          </Text>
        </div>

        <div className="mx-auto mt-6 max-w-lg">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              placeholder="Search for help articles"
              className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.title}
              padding="lg"
              hoverable
              clickable
              onClick={() => navigate(section.href)}
            >
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-semibold text-slate-900">{section.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{section.description}</p>
                </div>
                <ArrowRight size={16} className="shrink-0 text-slate-300" aria-hidden="true" />
              </div>
            </Card>
          );
        })}
      </div>

      <Card padding="lg" className="mt-6">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <Heading level={3} size="text-base">
              Still need help?
            </Heading>
            <Text color="muted" className="mt-1 text-xs">
              Our support team responds within 1 business day.
            </Text>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate('/support/tickets/new')}
            leadingIcon={MessageCircle}
          >
            Contact Support
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default HelpCenter;