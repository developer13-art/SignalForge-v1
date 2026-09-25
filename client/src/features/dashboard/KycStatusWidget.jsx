import React from 'react';
import PropTypes from 'prop-types';
import { Shield, ArrowRight } from 'lucide-react';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import KycStatusBadge from '../../components/domain/kyc/KycStatusBadge';

const STATUS_MESSAGES = {
  not_started: 'Complete KYC to unlock subscriptions and trading.',
  pending: 'You have an incomplete KYC application.',
  under_review: 'Your verification is being reviewed.',
  verified: 'You have full access to all platform features.',
  rejected: 'Your previous application was not approved.',
  resubmission: 'Some documents need updating.',
  expired: 'Renew your verification to continue using protected features.',
  suspended: 'Contact support to resolve your status.',
};

const KycStatusWidget = function KycStatusWidget({ kyc }) {
  const status = kyc?.status || 'not_started';
  const isVerified = status === 'verified';

  const ctaLabel =
    status === 'verified'
      ? 'View Details'
      : status === 'under_review'
      ? 'View Status'
      : status === 'rejected' || status === 'resubmission'
      ? 'Try Again'
      : 'Start KYC';

  const href =
    status === 'verified' || status === 'rejected' || status === 'resubmission'
      ? '/kyc/result'
      : status === 'under_review'
      ? '/kyc/review-status'
      : '/kyc';

  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={[
              'flex h-10 w-10 items-center justify-center rounded-lg',
              isVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <Shield size={18} aria-hidden="true" />
          </span>
          <div>
            <Heading level={3} size="text-base">
              KYC Status
            </Heading>
            <Text color="muted" className="text-xs">
              Identity verification
            </Text>
          </div>
        </div>

        <KycStatusBadge status={status} size="sm" />
      </div>

      <Text color="muted" className="mt-4 text-xs">
        {STATUS_MESSAGES[status]}
      </Text>

      {!isVerified ? (
        <div className="mt-4">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              window.location.href = href;
            }}
            trailingIcon={ArrowRight}
          >
            {ctaLabel}
          </Button>
        </div>
      ) : null}
    </Card>
  );
};

KycStatusWidget.propTypes = {
  kyc: PropTypes.shape({
    status: PropTypes.string,
  }),
};

export default KycStatusWidget;