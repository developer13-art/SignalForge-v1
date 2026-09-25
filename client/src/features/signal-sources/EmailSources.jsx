import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Plus, Loader2, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import FormField from '../../components/forms/FormField';
import PasswordInput from '../../components/forms/PasswordInput';

const EmailSources = function EmailSources() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    email: '',
    host: '',
    port: 993,
    password: '',
  });

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sources/email', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setAccounts(payload.data || []);
      } else {
        setError(payload?.error?.message || 'Failed to load email accounts');
      }
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleCreate = useCallback(async () => {
    setError(null);
    if (!form.email || !form.host || !form.password) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/sources/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to add email account');
        return;
      }

      setAdding(false);
      setForm({ email: '', host: '', port: 993, password: '' });
      fetchAccounts();
    } catch (_err) {
      setError('Unable to reach the server');
    }
  }, [form, fetchAccounts]);

  const handleDelete = useCallback(
    async (id) => {
      try {
        await fetch(`/api/sources/email/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchAccounts();
      } catch (_err) {
        // silent
      }
    },
    [fetchAccounts],
  );

  const handleBack = useCallback(() => navigate('/sources/add'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Mail size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Email Sources
              </Heading>
              <Text color="muted" className="text-xs">
                Forward signals from any IMAP email inbox
              </Text>
            </div>
          </div>

          {!adding ? (
            <Button variant="primary" onClick={() => setAdding(true)} leadingIcon={Plus}>
              Add Email
            </Button>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {adding ? (
          <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <FormField label="Email Address" required>
              {({ id }) => (
                <input
                  id={id}
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="signals@example.com"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              )}
            </FormField>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <FormField label="IMAP Host" required>
                  {({ id }) => (
                    <input
                      id={id}
                      type="text"
                      value={form.host}
                      onChange={(event) =>
                        setForm((prev) => ({ ...prev, host: event.target.value }))
                      }
                      placeholder="imap.example.com"
                      className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  )}
                </FormField>
              </div>
              <FormField label="Port" required>
                {({ id }) => (
                  <input
                    id={id}
                    type="number"
                    value={form.port}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, port: Number(event.target.value) }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                )}
              </FormField>
            </div>

            <FormField label="Password" required>
              {({ id }) => (
                <PasswordInput
                  id={id}
                  value={form.password}
                  onChange={(value) => setForm((prev) => ({ ...prev, password: value }))}
                  placeholder="Your email password or app password"
                  showStrength={false}
                />
              )}
            </FormField>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleCreate}>
                Add Account
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
            </div>
          ) : accounts.length === 0 ? (
            <EmptyState
              icon={Mail}
              title="No email accounts yet"
              description="Add an email account to start receiving signals via email."
            />
          ) : (
            accounts.map((account) => (
              <Card key={account.id} padding="md" variant="subtle">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{account.email}</p>
                      <Badge variant={account.connected ? 'success' : 'danger'} size="xs">
                        {account.connected ? 'Connected' : 'Error'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {account.host}:{account.port}
                    </p>
                    {account.lastError ? (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-rose-600">
                        <XCircle size={10} aria-hidden="true" />
                        {account.lastError}
                      </p>
                    ) : account.lastSync ? (
                      <p className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600">
                        <CheckCircle2 size={10} aria-hidden="true" />
                        Last sync {account.lastSync}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(account.id)}
                    aria-label="Remove"
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </Container>
  );
};

export default EmailSources;