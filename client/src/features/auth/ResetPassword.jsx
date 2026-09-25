import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowLeft } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import Alert from '../../components/feedback/Alert';
import { validators } from '../../components/forms/validators';

const ResetPassword = function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validatePassword = useMemo(
    () =>
      validators.compose(
        validators.required(),
        validators.password({ min: 8, requireUppercase: true, requireLowercase: true, requireNumber: true }),
      ),
    [],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError(null);

      const passwordError = validatePassword(password);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      if (!token) {
        setError('Invalid or expired reset link');
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, password }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Unable to reset password.');
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      } catch (_err) {
        setError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [password, confirmPassword, token, validatePassword, navigate],
  );

  if (success) {
    return (
      <Container size="sm" className="py-12">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            Password updated
          </Heading>
          <Text color="muted" className="mt-2">
            Your password has been reset. Redirecting you to sign in...
          </Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="sm" className="py-12">
      <Card padding="lg" variant="elevated">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Lock size={24} aria-hidden="true" />
          </div>
          <Heading level={1} size="text-2xl" align="center" className="mt-4">
            Set a new password
          </Heading>
          {email ? (
            <Text color="muted" align="center" className="mt-2">
              Resetting password for <strong>{email}</strong>
            </Text>
          ) : (
            <Text color="muted" align="center" className="mt-2">
              Enter a new password for your account.
            </Text>
          )}
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="New Password" required>
            {({ id }) => (
              <PasswordInput
                id={id}
                value={password}
                onChange={setPassword}
                placeholder="Enter new password"
                autoComplete="new-password"
                showStrength
                showRequirements
              />
            )}
          </FormField>

          <FormField label="Confirm Password" required>
            {({ id }) => (
              <PasswordInput
                id={id}
                value={confirmPassword}
                onChange={setConfirmPassword}
                placeholder="Re-enter new password"
                autoComplete="new-password"
                showStrength={false}
              />
            )}
          </FormField>

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? 'Updating...' : 'Update password'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:underline"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Back to sign in
          </Link>
        </div>
      </Card>
    </Container>
  );
};

export default ResetPassword;