import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, Loader2, Shield, FileText, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';

const DataPrivacy = function DataPrivacy() {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/users/data-export', {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to request export');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Data & Privacy
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your data and privacy controls
            </Text>
          </div>
        </div>

        <Separator spacing="md" />

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <Download size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">Export Your Data</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Request a copy of all data associated with your account. The export will be
                  delivered as a downloadable archive within 24 hours.
                </p>
                {success ? (
                  <Alert variant="success" size="sm" className="mt-3">
                    Your export request has been submitted. You will receive an email when it is
                    ready.
                  </Alert>
                ) : null}
                {error ? (
                  <Alert variant="danger" size="sm" className="mt-3">
                    {error}
                  </Alert>
                ) : null}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleExport}
                  disabled={exporting}
                  leadingIcon={exporting ? Loader2 : Download}
                  className="mt-3"
                >
                  {exporting ? 'Requesting...' : 'Request Export'}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <FileText size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">Data Retention</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  We retain your account data while your account is active and for a reasonable
                  period afterward to comply with legal obligations. KYC records are retained as
                  required by regulation.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/privacy')}
                >
                  View Privacy Policy
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-rose-600">
                <Trash2 size={16} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-rose-900">Delete Account</p>
                <p className="mt-0.5 text-xs text-rose-800">
                  Permanently delete your account and all associated data. This action cannot be
                  undone.
                </p>
                <Button
                  variant="danger"
                  size="sm"
                  className="mt-3"
                  onClick={() => navigate('/settings/delete-account')}
                  leadingIcon={Trash2}
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default DataPrivacy;