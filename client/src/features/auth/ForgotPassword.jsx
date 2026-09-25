import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';
import { validators } from '../../components/forms/validators';

const ForgotPassword = function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = useMemo(() => validators.compose(validators.required(), validators.email()), []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError(null);

      const emailError = validateEmail(email);
      if (emailError) {
        setError(emailError);
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        });

        if (!response.ok) {
          const payload = await response.json();
          setError(payload?.error?.message || 'Unable to process request.');
          return;
        }

        setSuccess(true);
      } catch (_err) {
        setError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [email, validateEmail],
  );

  if (success) {
    return (
      <Container size="sm" className="py-12">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            Check your email
          </Heading>
          <Text color="muted" className="mt-2">
            If an account exists for <strong>{email}</strong>, we sent a password reset link.
            Check your inbox and spam folder.
          </Text>
          <div className="mt-6">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:underline"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Back to sign in
            </Link>
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
            Forgot your password?
          </Heading>
          <Text color="muted" align="center" className="mt-2">
            Enter your email and we&apos;ll send you a link to reset your password.
          </Text>
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <FormField label="Email" error={null} required>
            {({ id }) => (
              <div className="relative">
                <Mail                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  id={id}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (error) {
                      setError(null);
                    }
                  }}
                  placeholder="you@example.com"
                  className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            )}
          </FormField>

          <Button type="submit" variant="primary" disabled={submitting} className="w-full">
            {submitting ? 'Sending link...' : 'Send reset link'}
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

export default ForgotPassword;