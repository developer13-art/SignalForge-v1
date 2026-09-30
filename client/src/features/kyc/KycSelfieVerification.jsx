import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Shield, CheckCircle2, SkipForward } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';
import KycSelfieCapture from '../../components/domain/kyc/KycSelfieCapture';
import Checkbox from '../../components/common/Checkbox';
import { kycApi } from '../../api/kyc.api.js';

const KycSelfieVerification = function KycSelfieVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const documentType = location.state?.documentType || 'NATIONAL_ID';
  const uploadId = location.state?.uploadId;
  const resumeWithSavedSelfie = location.state?.resumeWithSavedSelfie === true;

  const [selfie, setSelfie] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
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
    if (!resumeWithSavedSelfie && !selfie?.blob) {
      setError('Please capture a selfie to continue');
      return;
    }
    if (!confirmed) {
      setError('Please confirm your information is accurate and accept the verification terms.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (!resumeWithSavedSelfie) {
        const formData = new FormData();
        formData.append('selfie', selfie.blob, 'selfie.jpg');
        await kycApi.uploadSelfie(formData);
      }
      await kycApi.submitApplication({ confirmAccuracy: true, acceptTerms: true });

      navigate('/kyc/review-status');
    } catch (_err) {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selfie, navigate, resumeWithSavedSelfie, confirmed]);

  const handleSkipLiveness = useCallback(() => {
    navigate('/kyc/review-status');
  }, [navigate]);

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

        {resumeWithSavedSelfie ? (
          <Alert variant="info" size="sm" className="mt-6">
            Your selfie is saved. Confirm the information below to submit your verification.
          </Alert>
        ) : (
          <div className="mt-6">
            <KycSelfieCapture
              onCapture={handleCapture}
              onRetake={handleRetake}
              error={null}
            />
          </div>
        )}

        <div className="mt-5">
          <Checkbox
            label="I confirm my information is accurate and agree to identity verification."
            checked={confirmed}
            onChange={setConfirmed}
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

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={handleBack} leadingIcon={ArrowLeft}>
            Back
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleSkipLiveness}
              disabled={submitting}
              leadingIcon={SkipForward}
            >
              Skip for now
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={(!resumeWithSavedSelfie && !selfie) || !confirmed || submitting}
              trailingIcon={ArrowRight}
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default KycSelfieVerification;