import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Smartphone, Shield, Monitor, AlertTriangle, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';

const SessionVerification = function SessionVerification() {
  const navigate = useNavigate();
  const location = useLocation();

  const sessionToken = location.state?.sessionToken;
  const redirectTo = location.state?.redirect || '/dashboard';
  const currentDevice = location.state?.currentDevice || {};
  const priorDevices = location.state?.priorDevices || [];

  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    if (!sessionToken) {
      navigate('/login', { replace: true });
    }
  }, [sessionToken, navigate]);

  const handleApprove = useCallback(async () => {
    setError(null);
    setVerifying(true);
    try {
      const response = await fetch('/api/auth/session/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionToken, approve: true }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Verification failed.');
        return;
      }

      setApproved(true);
      setTimeout(() => {
        navigate(redirectTo, { replace: true });
      }, 1200);
    } catch (_err) {
      setError('Unable to reach the server. Please try again.');
    } finally {
      setVerifying(false);
    }
  }, [sessionToken, navigate, redirectTo]);

  const handleDeny = useCallback(async () => {
    setError(null);
    setVerifying(true);
    try {
      await fetch('/api/auth/session/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionToken, approve: false }),
      });
    } catch (_err) {
      // silent
    } finally {
      setVerifying(false);
      navigate('/login', { replace: true });
    }
  }, [sessionToken, navigate]);

  if (approved) {
    return (
      <Container size="sm" className="py-12">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            Session verified
          </Heading>
          <Text color="muted" className="mt-2">
            Redirecting you now...
          </Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" className="py-12">
      <Card padding="lg" variant="elevated">
        <div className="mb-6 flex items-start gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-xl">
              Verify this sign-in
            </Heading>
            <Text color="muted" className="mt-1">
              We detected a new sign-in attempt on your account.
            </Text>
          </div>
        </div>

        <Alert variant="warning" size="sm" className="mb-4">
          <p className="flex items-start gap-2 text-xs">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              If this was not you, deny the request and change your password immediately.
            </span>
          </p>
        </Alert>

        {error ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <div className="mb-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            This Session
          </p>
          <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-indigo-600">
                <Monitor size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {currentDevice.name || 'Unknown Device'}
                  </p>
                  <Badge variant="primary" size="xs">
                    New
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {currentDevice.browser || 'Unknown browser'} · {currentDevice.os || 'Unknown OS'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  IP: {currentDevice.ip || 'Unknown'} · {currentDevice.location || 'Unknown'}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {currentDevice.time || new Date().toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {priorDevices.length > 0 ? (
          <div className="mb-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Previously Seen Devices
            </p>
            <div className="space-y-2">
              {priorDevices.slice(0, 3).map((device, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                    <Smartphone size={14} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-800">{device.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {device.browser} · {device.ip} · {device.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            onClick={handleDeny}
            disabled={verifying}
            className="flex-1"
          >
            This wasn&apos;t me
          </Button>
          <Button
            variant="primary"
            onClick={handleApprove}
            disabled={verifying}
            className="flex-1"
          >
            {verifying ? 'Verifying...' : 'Yes, it was me'}
          </Button>
        </div>

        <div className="mt-6 text-center">
          <Link
            to="/account-recovery"
            className="text-xs font-medium text-slate-500 hover:text-indigo-600 hover:underline"
          >
            Need help securing your account?
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default SessionVerification;