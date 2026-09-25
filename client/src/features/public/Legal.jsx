import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Shield, Scroll, ArrowRight } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const DOCUMENTS = [
  {
    icon: FileText,
    title: 'Terms of Service',
    description: 'The rules and conditions that govern your use of SignalForge AI.',
    href: '/terms',
  },
  {
    icon: Shield,
    title: 'Privacy Policy',
    description: 'How we collect, use, and protect your personal data.',
    href: '/privacy',
  },
  {
    icon: Scroll,
    title: 'Compliance',
    description: 'How we comply with KYC, AML, and financial regulations.',
    href: '/compliance',
  },
];

const Legal = function Legal() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Legal
            </Badge>
            <Heading level={1} className="mt-4">
              Legal documents and policies
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              Transparency is a core principle at SignalForge AI. Below are the legal documents
              that govern our platform.
            </Text>
          </div>
        </Container>
      </section>

      <section className="bg-white py-16">
        <Container size="lg">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {DOCUMENTS.map((doc) => {
              const Icon = doc.icon;
              return (
                <Card
                  key={doc.title}
                  padding="lg"
                  hoverable
                  clickable
                  onClick={() => navigate(doc.href)}
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 text-base font-semibold text-slate-900">{doc.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {doc.description}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600">
                    Read document
                    <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </Card>
              );
            })}
          </div>

          <div className="mt-12">
            <Card padding="lg">
              <Heading level={3}>Disclaimers</Heading>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600">
                <p>
                  SignalForge AI is a technology platform that automates the execution of trading
                  signals on broker accounts. It does not provide investment advice, portfolio
                  management, or brokerage services.
                </p>
                <p>
                  Trading foreign exchange, commodities, indices, and other financial instruments
                  carries significant risk and may not be suitable for all investors. Past
                  performance is not indicative of future results.
                </p>
                <p>
                  Users are solely responsible for their trading decisions, risk management, and
                  compliance with applicable laws and regulations in their jurisdiction.
                </p>
                <p>
                  SignalForge AI does not guarantee any specific trading results. All automated
                  trading activity is executed based on the configuration and rules set by the
                  user.
                </p>
              </div>
            </Card>
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

export default Legal;