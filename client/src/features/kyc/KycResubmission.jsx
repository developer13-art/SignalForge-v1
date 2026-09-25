import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowRight, ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import KycDocumentUploader from '../../components/domain/kyc/KycDocumentUploader';

const KycResubmission = function KycResubmission() {
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    if (!document) {
      setError('Please upload an updated identity document');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('document', document);
      if (selfie) {
        formData.append('selfie', selfie);
      }

      const response = await fetch('/api/kyc/resubmit', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Resubmission failed. Please try again.');
        return;
      }

      navigate('/kyc/review-status');
    } catch (_err) {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [document, selfie, navigate]);

  const handleBack = useCallback(() => {
    navigate('/kyc/result');
  }, [navigate]);

  return (
    <Container size="lg" className="py-8">
      <Card padding="lg" variant="elevated">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <RefreshCw size={26} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Resubmit your verification
            </Heading>
            <Text color="muted" className="mt-2">
              Please review and resubmit the required documents. Make sure everything is clear,
              well-lit, and matches your personal information.
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

        <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
            <AlertTriangle size={12} aria-hidden="true" />
            Common reasons for resubmission
          </p>
          <ul className="mt-2 space-y-1 text-xs text-amber-800">
            <li>· Document was blurry, cut off, or unreadable</li>
            <li>· Name or date of birth did not match your personal information</li>
            <li>· Liveness check could not be verified</li>
            <li>· Document has expired or is not accepted</li>
          </ul>
        </div>

        <div className="mt-6 space-y-6">
          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Updated Identity Document
            </p>
            <KycDocumentUploader
              label=""
              description="JPG, JPEG, PNG, or PDF. Maximum 10 MB."
              value={document}
              onChange={setDocument}
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              maxSize={10 * 1024 * 1024}
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-800">
              Updated Selfie (optional)
            </p>
            <KycDocumentUploader
              label=""
              description="Upload a new selfie if the previous one was rejected."
              value={selfie}
              onChange={setSelfie}
              accept="image/jpeg,image/jpg,image/png"
              maxSize={5 * 1024 * 1024}
            />
          </div>
        </div>

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">Before you submit</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              All corners of the document are visible.
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              Text, photo, and dates are readable.
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              Document is not expired.
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
            disabled={submitting}
            trailingIcon={ArrowRight}
          >
            {submitting ? 'Submitting...' : 'Resubmit for Review'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default KycResubmission;