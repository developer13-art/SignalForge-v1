import React, { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, CheckCircle2, Mail, Shield } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';
import { validators } from '../../components/forms/validators';

const RECOVERY_OPTIONS = [
  {
    id: 'email',
    title: 'Reset via email',
    description: 'We will send a recovery link to your registered email address.',
    icon: Mail,
  },
  {
    id: 'backup',
    title: 'Use a backup code',
    description: 'Enter one of the backup codes you saved when enabling 2FA.',
    icon: KeyRound,
  },
  {
    id: 'support',
    title: 'Contact support',
    description: 'Request assisted recovery with identity verification.',
    icon: Shield,
  },
];

const AccountRecovery = function AccountRecovery() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);
  const [email, setEmail] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const validateEmail = useMemo(
    () => validators.compose(validators.required(), validators.email()),
    [],
  );

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      setError(null);

      if (selectedOption === 'email') {
        const emailError = validateEmail(email);
        if (emailError) {
          setError(emailError);
          return;
        }
      }

      if (selectedOption === 'backup' && !backupCode.trim()) {
        setError('Please enter a backup code');
        return;
      }

      if (selectedOption === 'support' && !message.trim()) {
        setError('Please describe your issue');
        return;
      }

      setSubmitting(true);
      try {
        const response = await fetch('/api/auth/account-recovery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method: selectedOption,
            email: email.trim().toLowerCase(),
            backupCode: backupCode.trim(),
            message: message.trim(),
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error?.message || 'Recovery request failed.');
          return;
        }

        setSuccess(true);
      } catch (_err) {
        setError('Unable to reach the server. Please try again.');
      } finally {
        setSubmitting(false);
      }
    },
    [selectedOption, email, backupCode, message, validateEmail],
  );

  if (success) {
    return (
      <Container size="sm" className="py-12">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            Recovery request received
          </Heading>
          <Text color="muted" className="mt-2">
            {selectedOption === 'email'
              ? 'Check your email for the recovery link.'
              : selectedOption === 'backup'
              ? 'Your backup code has been verified. You can now reset your password.'
              : 'Our support team will reach out within 24 hours.'}
          </Text>
          <div className="mt-6">
            <Button variant="primary" onClick={() => navigate('/login')}>
              Back to sign in
            </Button>
          </div>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="md" className="py-12">
      <Card padding="lg" variant="elevated">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <KeyRound size={24} aria-hidden="true" />
          </div>
          <Heading level={1} size="text-2xl" align="center" className="mt-4">
            Account recovery
          </Heading>
          <Text color="muted" align="center" className="mt-2">
            Choose how you would like to recover access to your account.
          </Text>
        </div>

        {error ? (
          <div className="mb-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {!selectedOption ? (
          <div className="space-y-3">
            {RECOVERY_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOption(option.id)}
                  className="flex w-full items-start gap-3 rounded-lg border-2 border-slate-200 bg-white p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                    <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setSelectedOption(null);
                setError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft size={12} aria-hidden="true" />
              Choose different option
            </button>

            {selectedOption === 'email' ? (
              <FormField label="Registered Email" required>
                {({ id }) => (
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
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </FormField>
            ) : null}

            {selectedOption === 'backup' ? (
              <FormField label="Backup Code" required>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={backupCode}
                    onChange={(event) => {
                      setBackupCode(event.target.value.toUpperCase());
                      if (error) {
                        setError(null);
                      }
                    }}
                    placeholder="ABCD-EFGH-IJKL"
                    autoComplete="off"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-center font-mono text-sm text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </FormField>
            ) : null}

            {selectedOption === 'support' ? (
              <FormField label="Describe your issue" required>
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={5}
                    value={message}
                    onChange={(event) => {
                      setMessage(event.target.value);
                      if (error) {
                        setError(null);
                      }
                    }}
                    placeholder="Tell us what happened and how we can help..."
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </FormField>
            ) : null}

            <Button type="submit" variant="primary" disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Continue'}
            </Button>
          </form>
        )}

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

export default AccountRecovery;