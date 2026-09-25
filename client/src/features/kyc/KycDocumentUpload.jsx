import React, { useCallback, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import KycProgressStepper from '../../components/domain/kyc/KycProgressStepper';
import KycDocumentUploader from '../../components/domain/kyc/KycDocumentUploader';

const DOCUMENT_LABELS = {
  national_id: 'National Identity Card',
  voters_card: "Voter's Card",
  drivers_license: "Driver's Licence",
  passport: 'International Passport',
  other: 'Government ID',
};

const KycDocumentUpload = function KycDocumentUpload() {
  const navigate = useNavigate();
  const location = useLocation();

  const documentType = location.state?.documentType || 'national_id';
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = useCallback(
    async () => {
      if (!file) {
        setError('Please select a document to upload');
        return;
      }

      setUploading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('documentType', documentType);

        const response = await fetch('/api/kyc/upload-document', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Failed to upload document');
          return;
        }

        navigate('/kyc/document-verification', {
          state: { documentType, uploadId: payload.data?.uploadId },
        });
      } catch (_err) {
        setError('Unable to reach the server. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [file, documentType, navigate],
  );

  const handleBack = useCallback(() => {
    navigate('/kyc/document-selection');
  }, [navigate]);

  return (
    <Container size="lg" className="py-8">
      <KycProgressStepper currentStep={2} />

      <Card padding="lg" variant="elevated" className="mt-8">
        <Heading level={1} size="text-2xl">
          Upload {DOCUMENT_LABELS[documentType] || 'identity document'}
        </Heading>
        <Text color="muted" className="mt-2">
          Make sure the document is clearly visible, well-lit, and all corners are within the
          frame. Avoid glare, shadows, and blurry images.
        </Text>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <div className="mt-6">
          <KycDocumentUploader
            label="Identity Document"
            description="JPG, JPEG, PNG, or PDF. Maximum 10 MB."
            value={file}
            onChange={setFile}
            accept="image/jpeg,image/jpg,image/png,application/pdf"
            maxSize={10 * 1024 * 1024}
          />
        </div>

        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-700">Document quality tips</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600">
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              Photograph on a flat, dark surface for best contrast.
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              Ensure all four corners of the document are visible.
            </li>
            <li className="flex items-start gap-1.5">
              <CheckCircle2 size={11} className="mt-0.5 shrink-0 text-emerald-600" aria-hidden="true" />
              Text, photo, and dates should be clearly readable.
            </li>
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={handleBack} leadingIcon={ArrowLeft}>
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleUpload}
            disabled={!file || uploading}
            trailingIcon={ArrowRight}
          >
            {uploading ? 'Uploading...' : 'Upload and Continue'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default KycDocumentUpload;