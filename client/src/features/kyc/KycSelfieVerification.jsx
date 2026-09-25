import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';
import KycSelfieCapture from '../../components/domain/kyc/KycSelfieCapture';

const KycSelfieVerification = function KycSelfieVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const documentType = location.state?.documentType || 'national_id';
  const uploadId = location.state?.uploadId;

  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCapture = useCallback((result) => {
    setSelfie(result);
    setError(null);
  }, []);

  const handleRetake = useCallback(() => {
    setSelfie(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!selfie?.blob) {
      setError('Please capture a selfie to continue');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('selfie', selfie.blob, 'selfie.jpg');
      formData.append('uploadId', uploadId);

      const response = await fetch('/api/kyc/submit', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Submission failed. Please try again.');
        return;
      }

      navigate('/kyc/review-status');
    } catch (_err) {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selfie, uploadId, navigate]);

  const handleBack = useCallback(() => {
    navigate('/kyc/document-verification', { state: { documentType, uploadId } });
  }, [navigate, documentType, uploadId]);

  return (
    <Container size="lg" className="py-8">
      <KycProgressStepper currentStep={3} />

      <Card padding="lg" variant="elevated" className="mt-8">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <Shield size={26} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Selfie / Liveness check
            </Heading>
            <Text color="muted" className="mt-2">
              We will capture a quick photo to confirm you are the person on the identity document.
            </Text>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <div className="mt-6">
          <KycSelfieCapture
            onCapture={handleCapture}
            onRetake={handleRetake}
            error={null}
          />
        </div>

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">Tips for a good selfie</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              Use good lighting and look directly at the camera.
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              Remove sunglasses, hats, or anything covering your face.
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              Keep a neutral expression.
            </li>
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={handleBack} leadingIcon={ArrowLeft}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!selfie || submitting}
            trailingIcon={ArrowRight}
          >
            {submitting ? 'Submitting...' : 'Submit for Review'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default KycSelfieVerification;