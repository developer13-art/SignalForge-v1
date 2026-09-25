import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle2, Copy, Check, Loader2, Smartphone, KeyRound } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import OtpInput from '../../components/forms/OtpInput';

const TwoFactorSetup = function TwoFactorSetup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [secret, setSecret] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const [code, setCode] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/auth/2fa/setup', {
          method: 'POST',
          credentials: 'include',
        });
        const payload = await response.json();

        if (!response.ok) {
          if (!cancelled) {
            setError(payload?.error?.message || 'Failed to initialize 2FA.');
          }
          return;
        }

        if (!cancelled) {
          setSecret(payload.data.secret);
          setQrCode(payload.data.qrCode);
        }
      } catch (_err) {
        if (!cancelled) {
          setError('Unable to reach the server. Please try again.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    init();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleCopySecret = useCallback(async () => {
    if (!secret) {
      return;
    }
    try {
      await navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    } catch (_err) {
      // silent
    }
  }, [secret]);

  const handleVerify = useCallback(
    async (fullCode) => {
      setError(null);
      setLoading(true);
      try {
        const response = await fetch('/api/auth/2fa/verify-setup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code: fullCode }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Invalid code. Please try again.');
          setCode('');
          return;
        }

        setBackupCodes(payload.data.backupCodes || []);
        setStep(3);
      } catch (_err) {
        setError('Unable to reach the server. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleCopyCodes = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(backupCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    } catch (_err) {
      // silent
    }
  }, [backupCodes]);

  const steps = useMemo(
    () => [
      { number: 1, label: 'Scan QR Code', icon: Smartphone },
      { number: 2, label: 'Verify Code', icon: Shield },
      { number: 3, label: 'Save Backup Codes', icon: KeyRound },
    ],
    [],
  );

  return (
    <Container size="md" className="py-12">
      <Card padding="lg" variant="elevated">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-xl">
              Set up two-factor authentication
            </Heading>
            <Text color="muted" className="mt-1">
              Add an extra layer of security to your account.
            </Text>
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between gap-2">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.number;
            const isComplete = step > s.number;

            return (
              <React.Fragment key={s.number}>
                <div className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className={[
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                      isComplete
                        ? 'bg-emerald-600 text-white'
                        : isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-500',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {isComplete ? (
                      <CheckCircle2 size={16} aria-hidden="true" />
                    ) : (
                      <Icon size={16} aria-hidden="true" />
                    )}
                  </div>
                  <span
                    className={[
                      'text-[11px] font-medium text-center',
                      isActive ? 'text-slate-900' : 'text-slate-500',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {s.label}
                  </span>
                </div>

                {index < steps.length - 1 ? (
                  <div
                    className={[
                      'mt-4 h-0.5 flex-1',
                      step > s.number ? 'bg-emerald-600' : 'bg-slate-200',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    aria-hidden="true"
                  />
                ) : null}
              </React.Fragment>
            );
          })}
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                1. Scan this QR code with your authenticator app
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use Google Authenticator, Authy, Microsoft Authenticator, or 1Password.
              </p>
            </div>

            <div className="flex flex-col items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
              {loading ? (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-white">
                  <Loader2 size={24} className="animate-spin text-indigo-600" aria-hidden="true" />
                </div>
              ) : qrCode ? (
                <img
                  src={qrCode}
                  alt="Two-factor authentication QR code"
                  className="h-48 w-48 rounded-lg bg-white p-2"
                />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-lg bg-white text-xs text-slate-400">
                  QR code unavailable
                </div>
              )}

              <div className="w-full">
                <p className="mb-2 text-center text-xs font-medium text-slate-500">
                  Or enter this code manually
                </p>
                <div className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
                  <code className="min-w-0 flex-1 truncate font-mono text-sm text-slate-800">
                    {secret || '—'}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopySecret}
                    disabled={!secret}
                    aria-label="Copy secret"
                    className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                  >
                    {copiedSecret ? (
                      <Check size={14} className="text-emerald-600" aria-hidden="true" />
                    ) : (
                      <Copy size={14} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/settings/security')}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => setStep(2)}
                disabled={!secret || loading}
              >
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                2. Enter the 6-digit code from your authenticator app
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Enter the code to verify that your authenticator is correctly configured.
              </p>
            </div>

            <div className="flex justify-center">
              <OtpInput
                length={6}
                value={code}
                onChange={setCode}
                onComplete={handleVerify}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-6">
            <Alert variant="warning" size="sm">
              <p className="text-xs font-semibold">Save these backup codes now</p>
              <p className="mt-1 text-xs">
                These codes allow you to access your account if you lose your authenticator. Each
                code can be used once. Store them in a safe place.
              </p>
            </Alert>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {backupCodes.map((backupCode, index) => (
                  <div
                    key={index}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-center text-slate-800"
                  >
                    {backupCode}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-2">
              <Button
                variant="outline"
                onClick={handleCopyCodes}
                leadingIcon={copiedCodes ? Check : Copy}
              >
                {copiedCodes ? 'Copied' : 'Copy Codes'}
              </Button>

              <Button
                variant="primary"
                onClick={() => navigate('/settings/security')}
                trailingIcon={CheckCircle2}
              >
                Done
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </Container>
  );
};

export default TwoFactorSetup;