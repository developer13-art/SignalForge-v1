import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, RefreshCw, ArrowRight, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Alert from '../../components/feedback/Alert';

const KycExpired = function KycExpired() {
  const navigate = useNavigate();

  const handleRenew = useCallback(() => {
    navigate('/kyc/personal-info');
  }, [navigate]);

  return (
    <Container size="lg" className="py-16">
      <Card padding="lg" variant="elevated" className="text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <Clock size={40} aria-hidden="true" />
        </div>

        <Badge variant="neutral" size="sm" className="mt-6">
          Verification Expired
        </Badge>

        <Heading level={1} className="mt-3">
          Your verification has expired
        </Heading>

        <Text size="lg" color="muted" className="mt-2 mx-auto max-w-lg">
          To continue using protected features — subscriptions, live trading, referral rewards,
          and withdrawals — you must renew your identity verification.
        </Text>

        <Alert variant="warning" size="sm" className="mt-6 text-left">
          <p className="flex items-start gap-2 text-xs">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              Your existing data remains secure. You only need to re-verify to continue using
              protected features. Automation on existing positions is unaffected.
            </span>
          </p>
        </Alert>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
          <Button
            variant="primary"
            size="lg"
            onClick={handleRenew}
            leadingIcon={RefreshCw}
            trailingIcon={ArrowRight}
          >
            Renew Verification
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default KycExpired;