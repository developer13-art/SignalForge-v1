import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/feedback/Alert';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';

const KycResult = function KycResult() {
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await fetch('/api/kyc/result', { credentials: 'include' });
        const payload = await response.json();
        if (response.ok) {
          setResult(payload.data);
        }
      } catch (_err) {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, []);

  const handleRetry = useCallback(() => {
    navigate('/kyc/resubmission');
  }, [navigate]);

  const handleDashboard = useCallback(() => {
    navigate('/dashboard');
  }, [navigate]);

  const handleSupport = useCallback(() => {
    navigate('/support');
  }, [navigate]);

  if (loading) {
    return (
      <Container size="lg" className="py-16">
        <Card padding="lg" variant="elevated" className="text-center">
          <Loader2 size={40} className="mx-auto animate-spin text-indigo-600" aria-hidden="true" />
          <Heading level={2} size="text-xl" className="mt-6">
            Loading verification result
          </Heading>
        </Card>
      </Container>
    );
  }

  const isVerified = result?.status === 'verified';
  const isRejected = result?.status === 'rejected';
  const needsResubmission = result?.status === 'resubmission';

  return (
    <Container size="lg" className="py-8">
      <KycProgressStepper currentStep={5} error={isRejected} />

      <Card padding="lg" variant="elevated" className="mt-8">
        {isVerified ? (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg">
              <CheckCircle2 size={40} aria-hidden="true" />
            </div>
            <Badge variant="success" size="sm" className="mt-6">
              Verified
            </Badge>
            <Heading level={1} className="mt-3">
              Identity verified successfully
            </Heading>
            <Text size="lg" color="muted" className="mt-2 mx-auto max-w-lg">
              You now have full access to subscriptions, broker connections, automated trading,
              referral rewards, and withdrawals.
            </Text>
            <div className="mt-8">
              <Button variant="primary" size="lg" onClick={handleDashboard} trailingIcon={ArrowRight}>
                Continue to Dashboard
              </Button>
            </div>
          </div>
        ) : null}

        {isRejected ? (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <XCircle size={40} aria-hidden="true" />
            </div>
            <Badge variant="danger" size="sm" className="mt-6">
              Rejected
            </Badge>
            <Heading level={1} className="mt-3">
              Verification was not successful
            </Heading>
            <Text size="lg" color="muted" className="mt-2 mx-auto max-w-lg">
              {result?.reason || 'The submitted information could not be verified. You can try again with a different document.'}
            </Text>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button variant="primary" onClick={handleRetry} leadingIcon={RefreshCw}>
                Try Again
              </Button>
              <Button variant="outline" onClick={handleSupport}>
                Contact Support
              </Button>
            </div>
          </div>
        ) : null}

        {needsResubmission ? (
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <AlertTriangle size={40} aria-hidden="true" />
            </div>
            <Badge variant="warning" size="sm" className="mt-6">
              Resubmission Required
            </Badge>
            <Heading level={1} className="mt-3">
              We need you to resubmit
            </Heading>
            <Text size="lg" color="muted" className="mt-2 mx-auto max-w-lg">
              {result?.reason || 'Some documents require updating. Please resubmit with the corrections noted.'}
            </Text>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button variant="primary" onClick={handleRetry} trailingIcon={ArrowRight}>
                Resubmit Now
              </Button>
              <Button variant="outline" onClick={handleSupport}>
                Get Help
              </Button>
            </div>
          </div>
        ) : null}

        {result?.notes ? (
          <Alert variant="info" size="sm" className="mt-6">
            <p className="text-xs">{result.notes}</p>
          </Alert>
        ) : null}
      </Card>
    </Container>
  );
};

export default KycResult;