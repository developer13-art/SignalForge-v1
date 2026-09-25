import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';
import KycStatusBadge from '../../components/domain/kyc/KycStatusBadge';

const CHECK_ITEMS = [
  'Document authenticity check',
  'Image quality verification',
  'Liveness detection',
  'Name match with personal information',
  'Date of birth match',
  'Duplicate account detection',
];

const KycReviewStatus = function KycReviewStatus() {
  const navigate = useNavigate();

  const [status, setStatus] = useState('under_review');
  const [checks, setChecks] = useState([]);
  const [submittedAt, setSubmittedAt] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/kyc/status', {
        credentials: 'include',
      });
      const payload = await response.json();

      if (response.ok) {
        setStatus(payload.data?.status || 'under_review');
        setChecks(payload.data?.checks || []);
        setSubmittedAt(payload.data?.submittedAt || null);

        if (payload.data?.status === 'verified') {
          setTimeout(() => navigate('/kyc/result'), 1000);
        } else if (payload.data?.status === 'rejected') {
          setTimeout(() => navigate('/kyc/result'), 1000);
        }
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    fetchStatus();
  }, [fetchStatus]);

  return (
    <Container size="lg" className="py-8">
      <KycProgressStepper currentStep={4} />

      <Card padding="lg" variant="elevated" className="mt-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <Clock size={26} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Heading level={1} size="text-2xl">
                Verification in progress
              </Heading>
              <KycStatusBadge status={status} size="md" />
            </div>
            <Text color="muted" className="mt-2">
              Your submission is being reviewed. Most applications complete within minutes, but
              some may require manual review which can take up to 1 business day.
            </Text>
          </div>
        </div>

        {submittedAt ? (
          <p className="mt-4 text-xs text-slate-500">Submitted at {submittedAt}</p>
        ) : null}

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Verification Progress
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              leadingIcon={loading ? Loader2 : RefreshCw}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <ul className="mt-3 space-y-2">
            {CHECK_ITEMS.map((item, index) => {
              const check = checks.find((c) => c.label === item);
              const checkStatus = check?.status || (index < 2 ? 'passed' : 'pending');

              return (
                <li
                  key={item}
                  className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={[
                        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                        checkStatus === 'passed'
                          ? 'bg-emerald-100 text-emerald-600'
                          : checkStatus === 'failed'
                          ? 'bg-rose-100 text-rose-600'
                          : checkStatus === 'warning'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-slate-100 text-slate-400',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      {checkStatus === 'passed' ? (
                        <CheckCircle2 size={14} aria-hidden="true" />
                      ) : checkStatus === 'failed' ? (
                        <AlertCircle size={14} aria-hidden="true" />
                      ) : checkStatus === 'warning' ? (
                        <AlertCircle size={14} aria-hidden="true" />
                      ) : (
                        <Clock size={14} aria-hidden="true" />
                      )}
                    </span>
                    <span className="text-sm text-slate-700">{item}</span>
                  </div>

                  <span
                    className={[
                      'text-xs font-semibold capitalize',
                      checkStatus === 'passed'
                        ? 'text-emerald-600'
                        : checkStatus === 'failed'
                        ? 'text-rose-600'
                        : checkStatus === 'warning'
                        ? 'text-amber-600'
                        : 'text-slate-400',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {checkStatus}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-8 rounded-md border border-sky-200 bg-sky-50 p-4">
          <p className="text-sm font-semibold text-sky-900">While you wait</p>
          <p className="mt-1 text-xs text-sky-800">
            You can continue exploring the platform. Automated trading and subscription features
            will be unlocked automatically once verification completes.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/kyc/help')}
            >
              Need help?
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default KycReviewStatus;