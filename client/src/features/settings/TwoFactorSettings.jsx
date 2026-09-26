import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, Loader2, RefreshCw, CheckCircle2, AlertTriangle, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Badge from '../../components/common/Badge';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const TwoFactorSettings = function TwoFactorSettings() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disabling, setDisabling] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/2fa', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDisable = useCallback(async () => {
    setDisabling(true);
    try {
      await fetch('/api/users/2fa', { method: 'DELETE', credentials: 'include' });
      setConfirmOpen(false);
      fetchData();
    } catch (_err) {
      // silent
    } finally {
      setDisabling(false);
    }
  }, [fetchData]);

  const handleBack = useCallback(() => navigate('/settings/security'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <KeyRound size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Two-Factor Authentication
            </Heading>
            <Text color="muted" className="text-xs">
              Add an extra layer of security to your account
            </Text>
          </div>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : data?.enabled ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2
                  size={24}
                  className="shrink-0 text-emerald-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-emerald-900">
                    Two-factor authentication is enabled
                  </p>
                  <p className="mt-0.5 text-xs text-emerald-800">
                    Your account is protected by an additional verification step.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Enabled since</span>
                <span className="font-semibold text-slate-900">{data.enabledAt}</span>
              </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Backup codes remaining</span>
                <span className="font-semibold text-slate-900">
                  {data.backupCodesRemaining || 0}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <Button variant="outline" onClick={() => navigate('/settings/security/2fa/setup')}>
                Regenerate Backup Codes
              </Button>
              <Button
                variant="danger"
                onClick={() => setConfirmOpen(true)}
                leadingIcon={Trash2}
              >
                Disable 2FA
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle
                  size={24}
                  className="shrink-0 text-amber-600"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-amber-900">
                    Two-factor authentication is not enabled
                  </p>
                  <p className="mt-0.5 text-xs text-amber-800">
                    We strongly recommend enabling 2FA to protect your account.
                  </p>
                </div>
              </div>
            </div>

            <Button variant="primary" onClick={() => navigate('/settings/security/2fa/setup')}>
              Enable Two-Factor Authentication
            </Button>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDisable}
        variant="danger"
        title="Disable two-factor authentication"
        description="Disabling 2FA will make your account less secure. Are you sure you want to proceed?"
        confirmLabel="Disable 2FA"
        confirmLoading={disabling}
      />
    </Container>
  );
};

export default TwoFactorSettings;