import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowRight,
  RefreshCw,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import KycStatusBadge from '../../components/domain/kyc/KycStatusBadge';

const STATUS_ACTIONS = {
  not_started: {
    title: 'Start identity verification',
    description: 'Complete KYC to unlock subscriptions, trading, and withdrawals.',
    action: 'Start',
    href: '/kyc',
  },
  pending: {
    title: 'Continue verification',
    description: 'You have an incomplete verification application.',
    action: 'Continue',
    href: '/kyc/personal-info',
  },
  under_review: {
    title: 'Verification in progress',
    description: 'Your application is being reviewed. This usually completes within minutes.',
    action: 'View Status',
    href: '/kyc/review-status',
  },
  verified: {
    title: 'Verified',
    description: 'You have full access to all platform features.',
    action: 'View Details',
    href: '/kyc/result',
  },
  rejected: {
    title: 'Verification rejected',
    description: 'Your previous submission could not be verified. You can try again.',
    action: 'Try Again',
    href: '/kyc/result',
  },
  resubmission: {
    title: 'Resubmission required',
    description: 'Some documents need updating. Please resubmit to continue.',
    action: 'Resubmit',
    href: '/kyc/resubmission',
  },
  expired: {
    title: 'Verification expired',
    description: 'Renew your verification to continue using protected features.',
    action: 'Renew',
    href: '/kyc/personal-info',
  },
  suspended: {
    title: 'Verification suspended',
    description: 'Contact support to resolve your verification status.',
    action: 'Contact Support',
    href: '/support',
  },
};

const KycStatusDashboard = function KycStatusDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/kyc/status', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const status = data?.status || 'not_started';
  const config = STATUS_ACTIONS[status] || STATUS_ACTIONS.not_started;

  return (
    <Container size="lg" className="py-8">
      <Card padding="lg" variant="elevated">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span
              className={[
                'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl',
                status === 'verified'
                  ? 'bg-emerald-100 text-emerald-600'
                  : status === 'rejected' || status === 'suspended'
                  ? 'bg-rose-100 text-rose-600'
                  : 'bg-indigo-100 text-indigo-600',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Shield size={26} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                KYC Status
              </Heading>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <KycStatusBadge status={status} size="md" />
                {data?.verifiedAt ? (
                  <span className="text-xs text-slate-500">Verified {data.verifiedAt}</span>
                ) : null}
              </div>
              <Text color="muted" className="mt-2">
                {config.description}
              </Text>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStatus}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card padding="md" variant="subtle">
            <div className="flex items-start gap-3">
              <FileText size={18} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Documents
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {data?.documents?.length || 0} uploaded
                </p>
              </div>
            </div>
          </Card>

          <Card padding="md" variant="subtle">
            <div className="flex items-start gap-3">
              <Clock size={18} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Last Updated
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">
                  {data?.lastUpdated || '—'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-6">
          <Button variant="primary" onClick={() => navigate(config.href)} trailingIcon={ArrowRight}>
            {config.action}
          </Button>
        </div>

        {status === 'verified' ? (
          <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-900">
              <CheckCircle2 size={14} aria-hidden="true" />
              Full access unlocked
            </p>
            <ul className="mt-2 grid grid-cols-1 gap-1 text-xs text-emerald-800 sm:grid-cols-2">
              <li>· Subscribe to providers</li>
              <li>· Connect broker accounts</li>
              <li>· Activate automated trading</li>
              <li>· Earn referral rewards</li>
              <li>· Withdraw funds</li>
              <li>· Access the marketplace</li>
            </ul>
          </div>
        ) : null}

        {(status === 'rejected' || status === 'resubmission' || status === 'expired') ? (
          <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <AlertCircle size={14} aria-hidden="true" />
              Restricted access
            </p>
            <p className="mt-1 text-xs text-amber-800">
              Certain financial features are currently restricted until your verification is
              renewed.
            </p>
          </div>
        ) : null}
      </Card>
    </Container>
  );
};

export default KycStatusDashboard;