import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HelpCircle,
  FileText,
  Camera,
  Clock,
  Shield,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';

const TOPICS = [
  {
    icon: FileText,
    title: 'Document was rejected',
    description: 'Make sure the document is clear, unexpired, and all corners are visible.',
  },
  {
    icon: Camera,
    title: 'Selfie failed',
    description: 'Use good lighting, remove sunglasses or hats, and look directly at the camera.',
  },
  {
    icon: Clock,
    title: 'Verification taking too long',
    description: 'Most verifications complete in minutes. Manual reviews may take up to 1 business day.',
  },
  {
    icon: Shield,
    title: 'How is my data protected?',
    description: 'All documents are encrypted at rest and in transit, stored in private object storage, and accessed only by compliance officers.',
  },
];

const KycHelp = function KycHelp() {
  const navigate = useNavigate();

  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleSupport = useCallback(() => {
    navigate('/support');
  }, [navigate]);

  return (
    <Container size="lg" className="py-8">
      <Card padding="lg" variant="elevated">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <HelpCircle size={26} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              KYC help and troubleshooting
            </Heading>
            <Text color="muted" className="mt-2">
              Find answers to common questions about identity verification.
            </Text>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.title}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{topic.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{topic.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <p className="flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <MessageCircle size={14} aria-hidden="true" />
            Still need help?
          </p>
          <p className="mt-1 text-xs text-indigo-800">
            Our compliance support team can assist with any verification issue.
          </p>
          <div className="mt-3">
            <Button variant="primary" size="sm" onClick={handleSupport} trailingIcon={ArrowRight}>
              Contact Support
            </Button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={handleBack} leadingIcon={ArrowLeft}>
            Back
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default KycHelp;