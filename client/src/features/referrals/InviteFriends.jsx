import React, { useCallback, useState } from 'react';
import { Mail, Send, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const InviteFriends = function InviteFriends() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSend = useCallback(async () => {
    setError(null);

    const list = emails
      .split(/[,\n;]+/)
      .map((email) => email.trim())
      .filter(Boolean);

    if (list.length === 0) {
      setError('Please enter at least one email address');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/referrals/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ emails: list, message }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to send invites');
        return;
      }

      setSuccess(true);
      setEmails('');
      setMessage('');
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSending(false);
    }
  }, [emails, message]);

  const handleBack = useCallback(() => navigate('/referrals'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
            <Mail size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Invite Friends
            </Heading>
            <Text color="muted" className="text-xs">
              Send personalized invitations with your referral link
            </Text>
          </div>
        </div>

        {success ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600">
              <CheckCircle2 size={26} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-semibold text-emerald-900">Invitations sent</p>
            <p className="mt-1 text-xs text-emerald-800">
              Your friends will receive an email with your referral link.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Send More
              </Button>
              <Button variant="primary" onClick={handleBack}>
                Back to Referrals
              </Button>
            </div>
          </div>
        ) : (
          <>
            {error ? (
              <div className="mt-4">
                <Alert variant="danger" size="sm">
                  {error}
                </Alert>
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              <FormField
                label="Email Addresses"
                description="Separate multiple addresses with commas, new lines, or semicolons"
                required
              >
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={4}
                    value={emails}
                    onChange={(event) => setEmails(event.target.value)}
                    placeholder="friend1@example.com, friend2@example.com"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </FormField>

              <FormField label="Personal Message" description="Optional message to include in the invitation">
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={4}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Hey, I thought you'd be interested in SignalForge..."
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </FormField>
            </div>

            <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
              <Button
                variant="primary"
                onClick={handleSend}
                disabled={sending}
                leadingIcon={sending ? Loader2 : Send}
              >
                {sending ? 'Sending...' : 'Send Invitations'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default InviteFriends;