import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  FileText,
  UserCheck,
  Camera,
  Clock,
  Lock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';

const REQUIREMENTS = [
  {
    icon: UserCheck,
    title: 'Personal Information',
    description: 'Your name, date of birth, nationality, and address.',
  },
  {
    icon: FileText,
    title: 'Identity Document',
    description: 'National ID, Voter\'s Card, Driver\'s Licence, or Passport.',
  },
  {
    icon: Camera,
    title: 'Selfie / Liveness Check',
    description: 'A quick photo to confirm you are the document owner.',
  },
  {
    icon: Clock,
    title: 'Fast Review',
    description: 'Most verifications complete in minutes.',
  },
];

const KycIntro = function KycIntro() {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    navigate('/kyc/personal-info');
  }, [navigate]);

  const handleHelp = useCallback(() => {
    navigate('/kyc/help');
  }, [navigate]);

  return (
    <Container size="lg" className="py-8">
      <KycProgressStepper currentStep={0} />

      <Card padding="lg" variant="elevated" className="mt-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <Shield size={26} aria-hidden="true" />
          </span>
          <div>
            <Badge variant="primary" size="sm">
              Identity Verification
            </Badge>
            <Heading level={1} className="mt-3">
              Verify your identity
            </Heading>
            <Text color="muted" className="mt-2">
              SignalForge AI requires successful identity verification before you can subscribe,
              connect trading accounts, activate automation, or withdraw funds. This protects both
              you and the platform.
            </Text>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {REQUIREMENTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-sky-900">
            <Lock size={14} aria-hidden="true" />
            Your data is protected
          </p>
          <ul className="mt-2 space-y-1 text-xs text-sky-800">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
              All identity documents are encrypted at rest and in transit.
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
              Stored in private object storage, never publicly accessible.
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0" aria-hidden="true" />
              Accessed only by compliance officers with full audit logging.
            </li>
          </ul>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
          <Button variant="outline" onClick={handleHelp}>
            Need help?
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleStart}
            trailingIcon={ArrowRight}
          >
            Start Verification
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default KycIntro;