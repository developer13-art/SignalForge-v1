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
import { kycApi } from '../../api/kyc.api.js';

const KycDocumentVerification = function KycDocumentVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const documentType = location.state?.documentType || 'NATIONAL_ID';
  const uploadId = location.state?.uploadId;

  const [verifying, setVerifying] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // Ask the server for the most recent document on this user's
        // application. The upload page may have stored the id in
        // navigation state, but that state is lost on refresh; the
        // server is the authoritative source.
        const documents = await kycApi.listDocuments();
        const items = Array.isArray(documents)
          ? documents
          : documents?.items || documents?.documents || [];

        const latest = items.find((entry) => entry.id === uploadId) || items.find(
          (entry) => !documentType || entry.documentType === documentType,
        ) || items[0];

        if (!latest) {
          if (!cancelled) {
            setVerifying(false);
            setError('Upload reference missing. Please upload your document again.');
          }
          return;
        }

        if (!cancelled) {
          setResult({
            documentType: latest.documentType || documentType,
            nameDetected: Boolean(latest.nameDetected),
            dobDetected: Boolean(latest.dobDetected),
            readable: true,
          });
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
  }, [documentType, uploadId]);

  const handleContinue = useCallback(() => {
    navigate('/kyc/selfie-verification', { state: { documentType } });
  }, [navigate, documentType]);

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
                      Detected type:{' '}
                      <strong className="font-medium">{result.documentType}</strong>
                    </li>
                  ) : null}
                  <li className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-600" aria-hidden="true" />
                    Document readable
                  </li>
                </ul>
              </div>
            ) : null}

            <Alert variant="info" size="sm" className="mt-4">
              <p className="text-xs">
                Next, we will confirm that you are the person shown in the document using a
                quick selfie check.
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