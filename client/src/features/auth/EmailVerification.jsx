import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import OtpInput from '../../components/forms/OtpInput';

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const EmailVerification = function EmailVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = searchParams.get('email') || '';
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cooldownRef = useRef(null);

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

  const handleComplete = useCallback(
    async (fullCode) => {
      setError(null);
      setVerifying(true);

      try {
        const response = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ email, code: fullCode }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Verification failed. Please check the code.');
          setCode('');
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          navigate('/onboarding', { replace: true });
        }, 1500);
      } catch (_err) {
        setError('Unable to reach the server. Please try again.');
      } finally {
        setVerifying(false);
      }
    },
    [email, navigate],
  );

  const handleResend = useCallback(async () => {
    setError(null);
    setResending(true);
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to resend code.');
        return;
      }

      setCooldown(RESEND_COOLDOWN);
    } catch (_err) {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setResending(false);
    }
  }, [email]);

  if (success) {
    return (
      <Container size="sm" className="py-12">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            Email verified successfully
          </Heading>
          <Text color="muted" className="mt-2">
            Redirecting you to complete your profile...
          </Text>
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
            <RefreshCw size={12} className="animate-spin" aria-hidden="true" />
            <span>Redirecting</span>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-12">
      <Card padding="lg" variant="elevated">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Mail size={24} aria-hidden="true" />
          </div>
          <Heading level={1} size="text-2xl" align="center" className="mt-4">
            Check your email
          </Heading>
          <Text color="muted" align="center" className="mt-2">
            We sent a 6-digit verification code to
          </Text>
          <p className="mt-1 text-sm font-semibold text-slate-900">{email}</p>
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <div className="flex justify-center">
          <OtpInput
            length={CODE_LENGTH}
            value={code}
            onChange={setCode}
            onComplete={handleComplete}
            disabled={verifying}
            autoFocus
          />
        </div>

        <div className="mt-6 space-y-3 text-center">
          <p className="text-xs text-slate-500">
            Didn&apos;t receive the code? Check your spam folder, or
          </p>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={resending || cooldown > 0}
            leadingIcon={RefreshCw}
          >
            {cooldown > 0
              ? `Resend in ${cooldown}s`
              : resending
              ? 'Sending...'
              : 'Resend code'}
          </Button>

          <p className="text-xs text-slate-400">
            Wrong email?{' '}
            <Link to="/register" className="font-medium text-indigo-600 hover:underline">
              Sign up again
            </Link>
          </p>
        </div>
      </Card>
    </Container>
  );
};

export default EmailVerification;