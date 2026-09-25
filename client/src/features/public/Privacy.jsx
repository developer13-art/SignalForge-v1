import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Database, Lock, UserCheck, Globe, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const SECTIONS = [
  {
    icon: Database,
    title: 'Information We Collect',
    items: [
      'Account information (name, email, phone)',
      'Identity verification data (KYC documents)',
      'Broker account connection details (encrypted)',
      'Signal source connection details',
      'Trading activity and platform usage',
      'Device and session information',
    ],
  },
  {
    icon: Lock,
    title: 'How We Protect Your Data',
    items: [
      'Encryption at rest and in transit',
      'Secrets vault for credentials and tokens',
      'Role-based access control',
      'Comprehensive audit logging',
      'Minimal data exposure principle',
      'Secure, private object storage for documents',
    ],
  },
  {
    icon: UserCheck,
    title: 'How We Use Your Data',
    items: [
      'Provide the platform services you request',
      'Verify your identity where required by law',
      'Execute trades based on your configuration',
      'Improve signal parsing and platform quality',
      'Send transactional and security notifications',
      'Comply with legal and regulatory obligations',
    ],
  },
  {
    icon: Globe,
    title: 'Data Sharing',
    items: [
      'We never sell your personal data',
      'Broker credentials are shared only with MetaApi',
      'KYC data is shared only with the selected KYC provider',
      'Payment data is handled by Stripe, Paystack, or Flutterwave',
      'Aggregated, anonymized analytics may be shared',
    ],
  },
  {
    icon: Shield,
    title: 'Your Rights',
    items: [
      'Access your personal data',
      'Correct inaccurate information',
      'Request deletion of your account',
      'Export your data',
      'Opt out of marketing communications',
      'Withdraw consent where applicable',
    ],
  },
  {
    icon: Trash2,
    title: 'Data Retention',
    items: [
      'Active account data is retained while you use the platform',
      'KYC records retained for regulatory compliance periods',
      'Trade and audit logs retained for legal and audit purposes',
      'Deleted accounts are purged from active systems within 30 days',
    ],
  },
];

const Privacy = function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-b from-slate-50 to-white py-20">
        <Container size="xl">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="primary" size="sm">
              Privacy Policy
            </Badge>
            <Heading level={1} className="mt-4">
              Your data, protected
            </Heading>
            <Text size="lg" color="muted" className="mt-4">
              We collect only what we need, protect it rigorously, and never sell it.
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
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-slate-900">{section.title}</h3>
                      <ul className="mt-3 space-y-1.5">
                        {section.items.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-slate-600">
                            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-slate-400" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Contact Privacy Team
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Privacy;