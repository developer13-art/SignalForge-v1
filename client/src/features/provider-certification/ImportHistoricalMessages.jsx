import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, ArrowLeft, Loader2, CheckCircle2, FileText } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';
import KycDocumentUploader from '../../components/domain/kyc/KycDocumentUploader';

const IMPORT_METHODS = [
  {
    id: 'csv',
    label: 'CSV File',
    description: 'Upload a CSV containing historical messages',
  },
  {
    id: 'json',
    label: 'JSON File',
    description: 'Upload a JSON array of message objects',
  },
];

const ImportHistoricalMessages = function ImportHistoricalMessages() {
  const navigate = useNavigate();
  const [method, setMethod] = useState('csv');
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleImport = useCallback(async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError(null);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', method);

      const progressTimer = setInterval(() => {
        setProgress((prev) => Math.min(90, prev + 10));
      }, 500);

      const response = await fetch('/api/provider-certification/import', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      clearInterval(progressTimer);
      setProgress(100);

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Import failed');
        setProgress(0);
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
      setProgress(0);
    } finally {
      setImporting(false);
    }
  }, [file, method]);

  const handleBack = useCallback(() => navigate('/provider/certification'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Upload size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Import Historical Messages
            </Heading>
            <Text color="muted" className="text-xs">
              Upload past messages to train and evaluate your provider profile
            </Text>
          </div>
        </div>

        {success ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600">
              <CheckCircle2 size={26} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-semibold text-emerald-900">Import complete</p>
            <p className="mt-1 text-xs text-emerald-800">
              Your messages have been imported and are being analyzed.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" onClick={() => navigate('/provider/certification/training')}>
                View Dataset
              </Button>
              <Button variant="primary" onClick={handleBack}>
                Back
              </Button>
            </div>
          </div>
        ) : (
          <>
            {error ? (
              <div className="mt-4">
                <Alert variant="danger" size="sm">
                  {error}
                </Alert>
              </div>
            ) : null}

            <Separator spacing="md" />

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-800">Import Format</p>
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
                  {IMPORT_METHODS.map((m) => {
                    const isActive = method === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMethod(m.id)}
                        className={[
                          'rounded-lg border-2 p-4 text-left transition-colors',
                          isActive
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-slate-200 bg-white hover:border-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        <div className="flex items-center gap-2">
                          <FileText
                            size={16}
                            className={isActive ? 'text-indigo-600' : 'text-slate-400'}
                            aria-hidden="true"
                          />
                          <p className="text-sm font-semibold text-slate-900">{m.label}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-500">{m.description}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <KycDocumentUploader
                label="Select File"
                description={`Upload a ${method.toUpperCase()} file containing your historical messages`}
                value={file}
                onChange={setFile}
                accept={method === 'csv' ? '.csv' : '.json'}
                maxSize={50 * 1024 * 1024}
              />

              {importing || progress > 0 ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">Progress</span>
                    <span className="font-semibold text-slate-900">{progress}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={importing || !file}
                leadingIcon={importing ? Loader2 : Upload}
              >
                {importing ? 'Importing...' : 'Start Import'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default ImportHistoricalMessages;