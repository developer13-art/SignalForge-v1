import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield, RefreshCw, ArrowLeft } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import OtpInput from '../../components/forms/OtpInput';
import Checkbox from '../../components/common/Checkbox';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const TwoFactorVerify = function TwoFactorVerify() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionToken = location.state?.sessionToken;
  const redirectTo = location.state?.redirect || '/dashboard';
  const [code, setCode] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState('');
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cooldownRef = useRef(null);

  useEffect(() => {
    if (!sessionToken) {
      navigate('/login', { replace: true });
    }
  }, [sessionToken, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => {
      if (cooldownRef.current) {
        clearTimeout(cooldownRef.current);
      }
    };
  }, [cooldown]);

  const verify = useCallback(
    async (verificationCode) => {
      if (!verificationCode || verificationCode.length !== CODE_LENGTH) {
        return;
      }

      setError(null);
      setVerifying(true);

      try {
        const response = await fetch('/api/auth/2fa/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            sessionToken,
            code: verificationCode,
            rememberDevice,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Invalid code. Please try again.');
          setCode('');
          return;
        }

        navigate(redirectTo, { replace: true });
      } catch (_err) {
        setError('Unable to reach the server. Please try again.');
      } finally {
        setVerifying(false);
      }
    },
    [sessionToken, rememberDevice, navigate, redirectTo],
  );

  const handleBackupSubmit = useCallback(async () => {
    if (!backupCode.trim()) {
      setError('Please enter a backup code');
      return;
    }
    await verify(backupCode.trim());
  }, [backupCode, verify]);

  const handleResend = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('/api/auth/2fa/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionToken }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to resend.');
        return;
      }

      setCooldown(RESEND_COOLDOWN);
    } catch (_err) {
      setError('Unable to reach the server. Please try again.');
    }
  }, [sessionToken]);

  return (
    <Container size="sm" className="py-12">
      <Card padding="lg" variant="elevated">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Shield size={24} aria-hidden="true" />
          </div>
          <Heading level={1} size="text-2xl" align="center" className="mt-4">
            Two-factor authentication
          </Heading>
          <Text color="muted" align="center" className="mt-2">
            {useBackupCode
              ? 'Enter one of your backup codes to continue.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </Text>
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {!useBackupCode ? (
          <>
            <div className="flex justify-center">
              <OtpInput
                length={CODE_LENGTH}
                value={code}
                onChange={setCode}
                onComplete={verify}
                disabled={verifying}
                autoFocus
              />
            </div>

            <div className="mt-4">
              <Checkbox
                label="Remember this device for 30 days"
                checked={rememberDevice}
                onChange={setRememberDevice}
              />
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              value={backupCode}
              onChange={(event) => setBackupCode(event.target.value.toUpperCase())}
              placeholder="Enter backup code"
              autoComplete="off"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-center font-mono text-base text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <Button
              variant="primary"
              onClick={handleBackupSubmit}
              disabled={verifying || !backupCode.trim()}
              className="w-full"
            >
              {verifying ? 'Verifying...' : 'Verify backup code'}
            </Button>
          </div>
        )}

        <div className="mt-6 space-y-3 text-center">
          <button
            type="button"
            onClick={() => {
              setUseBackupCode(!useBackupCode);
              setError(null);
              setCode('');
              setBackupCode('');
            }}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            {useBackupCode ? 'Use authenticator code instead' : 'Use backup code instead'}
          </button>

          {!useBackupCode ? (
            <div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResend}
                disabled={cooldown > 0}
                leadingIcon={RefreshCw}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
              </Button>
            </div>
          ) : null}

          <div className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:underline"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default TwoFactorVerify;