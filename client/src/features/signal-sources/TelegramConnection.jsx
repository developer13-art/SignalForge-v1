import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Send,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Shield,
  LogOut,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import PhoneInput from '../../components/forms/PhoneInput';
import OtpInput from '../../components/forms/OtpInput';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';

const TelegramConnection = function TelegramConnection() {
  const navigate = useNavigate();
  const [state, setState] = useState('initial');
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('NG');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/sources/telegram/status', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok && payload.data?.connected) {
        setSession(payload.data);
        setState('connected');
      }
    } catch (_err) {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleBack = useCallback(() => navigate('/sources/add'), [navigate]);

  const handleSendCode = useCallback(async () => {
    setError(null);

    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sources/telegram/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, countryCode }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to send verification code');
        return;
      }

      setState('otp');
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [phone, countryCode]);

  const handleVerifyOtp = useCallback(
    async (code) => {
      setError(null);
      setLoading(true);

      try {
        const response = await fetch('/api/sources/telegram/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ phone, code }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Invalid verification code');
          setOtp('');
          return;
        }

        if (payload.data?.requiresPassword) {
          setState('password');
          return;
        }

        setSession(payload.data);
        setState('connected');
      } catch (_err) {
        setError('Unable to reach the server');
      } finally {
        setLoading(false);
      }
    },
    [phone],
  );

  const handleVerifyPassword = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/sources/telegram/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone, password }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Invalid two-step password');
        return;
      }

      setSession(payload.data);
      setState('connected');
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [phone, password]);

  const handleDisconnect = useCallback(async () => {
    try {
      await fetch('/api/sources/telegram/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      setSession(null);
      setState('initial');
      setPhone('');
      setOtp('');
      setPassword('');
    } catch (_err) {
      // silent
    }
  }, []);

  const handleContinue = useCallback(() => {
    navigate('/sources/telegram/channels');
  }, [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Send size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Connect Telegram
            </Heading>
            <Text color="muted" className="text-xs">
              Use your Telegram account — no bot required
            </Text>
          </div>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {state === 'initial' ? (
          <div className="mt-6 space-y-4">
            <Alert variant="info" size="sm">
              <p className="text-xs">
                SignalForge monitors only the channels you explicitly select. Your login session
                is encrypted and stored securely.
              </p>
            </Alert>

            <FormField label="Phone Number" required description="The phone number linked to your Telegram account.">
              {() => (
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                  onCountryChange={(code) => setCountryCode(code)}
                  defaultCountry={countryCode}
                  placeholder="Your phone number"
                />
              )}
            </FormField>

            <div className="flex justify-end border-t border-slate-200 pt-4">
              <Button
                variant="primary"
                onClick={handleSendCode}
                disabled={loading || !phone.trim()}
                leadingIcon={loading ? Loader2 : Phone}
              >
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </div>
          </div>
        ) : null}

        {state === 'otp' ? (
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <p className="text-sm text-slate-600">
                Telegram sent a code to your Telegram app
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{phone}</p>
            </div>

            <div className="flex justify-center">
              <OtpInput
                length={5}
                value={otp}
                onChange={setOtp}
                onComplete={handleVerifyOtp}
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="flex justify-between border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={() => setState('initial')}>
                Change Number
              </Button>
              <Button variant="ghost" onClick={fetchStatus}>
                Resend Code
              </Button>
            </div>
          </div>
        ) : null}

        {state === 'password' ? (
          <div className="mt-6 space-y-4">
            <Alert variant="warning" size="sm">
              <p className="text-xs">
                Your Telegram account has two-step verification enabled. Enter your password to
                continue.
              </p>
            </Alert>

            <FormField label="Two-Step Password" required>
              {({ id }) => (
                <input
                  id={id}
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your Telegram password"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </FormField>

            <div className="flex justify-end border-t border-slate-200 pt-4">
              <Button
                variant="primary"
                onClick={handleVerifyPassword}
                disabled={loading || !password}
              >
                {loading ? 'Verifying...' : 'Verify Password'}
              </Button>
            </div>
          </div>
        ) : null}

        {state === 'connected' ? (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600">
                  <CheckCircle2 size={22} aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-emerald-900">Connected</p>
                    <Badge variant="success" size="xs">
                      Active
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-emerald-800">
                    Account: {session?.accountName || phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <Button
                variant="outline"
                onClick={handleDisconnect}
                leadingIcon={LogOut}
              >
                Disconnect
              </Button>
              <Button
                variant="primary"
                onClick={handleContinue}
              >
                Select Channels
              </Button>
            </div>
          </div>
        ) : null}
      </Card>
    </Container>
  );
};

export default TelegramConnection;