import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';
import Alert from '../../components/feedback/Alert';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const DeleteAccount = function DeleteAccount() {
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDelete = useCallback(async () => {
    setError(null);

    if (!password) {
      setError('Please enter your password to confirm.');
      return;
    }

    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm.');
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch('/api/users/account', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ password, reason, confirm: 'DELETE' }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to delete account');
        return;
      }

      window.location.href = '/';
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setDeleting(false);
    }
  }, [password, reason, confirmText]);

  const handleBack = useCallback(() => navigate('/settings/data-privacy'), [navigate]);

  const handleSubmit = () => {
    setError(null);

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm.');
      return;
    }

    setConfirmOpen(true);
  };

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4 border-rose-200">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <Trash2 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Delete Account
            </Heading>
            <Text color="muted" className="text-xs">
              Permanently delete your account and all associated data
            </Text>
          </div>
        </div>

        <Separator spacing="md" />

        <Alert variant="danger" size="sm">
          <p className="flex items-start gap-2 text-xs">
            <AlertTriangle size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              <strong>This action cannot be undone.</strong> Deleting your account will
              permanently remove:
            </span>
          </p>
          <ul className="mt-2 space-y-1 pl-5 text-xs">
            <li>· Your profile and personal information</li>
            <li>· All connected broker accounts and signal sources</li>
            <li>· Your trade history, analytics, and performance data</li>
            <li>· Your referral network and pending rewards</li>
            <li>· Any active subscriptions (no refunds)</li>
          </ul>
        </Alert>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <div className="mt-6 space-y-4">
          <FormField label="Reason for leaving" description="Optional — helps us improve">
            {({ id }) => (
              <textarea
                id={id}
                rows={4}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder="Why are you leaving?"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            )}
          </FormField>

          <FormField label="Password" required description="Confirm your identity">
            {({ id }) => (
              <PasswordInput
                id={id}
                value={password}
                onChange={setPassword}
                placeholder="Enter your password"
                autoComplete="current-password"
                showStrength={false}
                error={false}
              />
            )}
          </FormField>

          <FormField
            label="Confirmation"
            required
            description='Type "DELETE" in the field below to confirm'
          >
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={confirmText}
                onChange={(event) => setConfirmText(event.target.value.toUpperCase())}
                placeholder="DELETE"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-center font-mono text-sm uppercase focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            )}
          </FormField>
        </div>

        <div className="mt-8 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleSubmit}
            disabled={deleting || !password || confirmText !== 'DELETE'}
            leadingIcon={Trash2}
          >
            Delete My Account
          </Button>
        </div>
      </Card>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        variant="danger"
        title="Final confirmation"
        description="Your account will be permanently deleted. This action cannot be undone. Are you absolutely sure?"
        confirmLabel="Yes, Delete Permanently"
        confirmLoading={deleting}
      />
    </Container>
  );
};

export default DeleteAccount;