import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, CheckCircle2, AlertCircle, FileText, ArrowLeft } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';

const KycDocumentVerification = function KycDocumentVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const documentType = location.state?.documentType || 'national_id';
  const uploadId = location.state?.uploadId;

  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!uploadId) {
        setVerifying(false);
        setError('Upload reference missing. Please upload your document again.');
        return;
      }

      try {
        const response = await fetch('/api/kyc/verify-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ uploadId, documentType }),
        });

        const payload = await response.json();

        if (!response.ok) {
          if (!cancelled) {
            setError(payload?.error?.message || 'Verification failed.');
          }
          return;
        }

        if (!cancelled) {
          setResult(payload.data);
        }
      } catch (_err) {
        if (!cancelled) {
          setError('Unable to reach the server. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setVerifying(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [uploadId, documentType]);

  const handleContinue = useCallback(() => {
    navigate('/kyc/selfie-verification', { state: { documentType, uploadId } });
  }, [navigate, documentType, uploadId]);

  const handleRetry = useCallback(() => {
    navigate('/kyc/document-upload', { state: { documentType } });
  }, [navigate, documentType]);

  return (
    <Container size="lg" className="py-8">
      <KycProgressStepper currentStep={2} />

      <Card padding="lg" variant="elevated" className="mt-8">
        {verifying ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Loader2 size={40} className="animate-spin text-indigo-600" aria-hidden="true" />
            <Heading level={2} size="text-xl" className="mt-6">
              Verifying your document
            </Heading>
            <Text color="muted" className="mt-2 max-w-md">
              We are running automated quality checks. This usually takes a few seconds.
            </Text>
            <div className="mt-6 space-y-1.5 text-xs text-slate-500">
              <p>· File integrity check</p>
              <p>· Image quality analysis</p>
              <p>· Document type detection</p>
              <p>· Required fields extraction</p>
              <p>· Duplicate detection</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <AlertCircle size={32} aria-hidden="true" />
            </div>
            <Heading level={2} size="text-xl" className="mt-6">
              Verification failed
            </Heading>
            <Text color="muted" className="mt-2">
              {error}
            </Text>
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button variant="outline" onClick={handleRetry} leadingIcon={ArrowLeft}>
                Upload again
              </Button>
              <Button variant="primary" onClick={() => navigate('/kyc/help')}>
                Get help
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 size={26} aria-hidden="true" />
              </span>
              <div>
                <Heading level={1} size="text-2xl">
                  Document accepted
                </Heading>
                <Text color="muted" className="mt-1">
                  Your identity document passed the automated quality checks.
                </Text>
              </div>
            </div>

            {result ? (
              <div className="mt-6 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Detection Results
                </p>
                <ul className="space-y-1.5 text-sm text-slate-700">
                  {result.documentType ? (
                    <li className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" aria-hidden="true" />
                      Detected type: <strong className="font-medium">{result.documentType}</strong>
                    </li>
                  ) : null}
                  {result.nameDetected ? (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                      Name detected
                    </li>
                  ) : null}
                  {result.dobDetected ? (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                      Date of birth detected
                    </li>
                  ) : null}
                  {result.readable ? (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                      Document readable
                    </li>
                  ) : null}
                </ul>
              </div>
            ) : null}

            <Alert variant="info" size="sm" className="mt-4">
              <p className="text-xs">
                Next, we will confirm that you are the person shown in the document using a quick
                selfie check.
              </p>
            </Alert>

            <div className="mt-8 flex justify-end border-t border-slate-200 pt-4">
              <Button variant="primary" onClick={handleContinue}>
                Continue to Selfie
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default KycDocumentVerification;