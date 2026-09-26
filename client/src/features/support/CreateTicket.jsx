import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';
import KycDocumentUploader from '../../components/domain/kyc/KycDocumentUploader';

const CATEGORIES = [
  { value: 'trading', label: 'Trading' },
  { value: 'broker', label: 'Broker Connection' },
  { value: 'signal', label: 'Signal Sources' },
  { value: 'kyc', label: 'KYC / Verification' },
  { value: 'billing', label: 'Billing / Payments' },
  { value: 'referral', label: 'Referrals' },
  { value: 'api', label: 'API / Integration' },
  { value: 'other', label: 'Other' },
];

const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

const CreateTicket = function CreateTicket() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    subject: '',
    category: 'trading',
    priority: 'medium',
    description: '',
  });
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!form.subject.trim()) {
      setError('Please provide a subject');
      return;
    }
    if (!form.description.trim()) {
      setError('Please describe your issue');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('subject', form.subject);
      formData.append('category', form.category);
      formData.append('priority', form.priority);
      formData.append('description', form.description);
      attachments.forEach((file) => formData.append('attachments', file));

      const response = await fetch('/api/support/tickets', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to create ticket');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate(`/support/tickets/${payload.data.id}`);
      }, 1500);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSubmitting(false);
    }
  }, [form, attachments, navigate]);

  const handleBack = useCallback(() => navigate('/support'), [navigate]);

  const update = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  if (success) {
    return (
      <Container size="sm" className="py-16">
        <Card padding="lg" variant="elevated" className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} aria-hidden="true" />
          </div>
          <Heading level={2} className="mt-6">
            Ticket created
          </Heading>
          <Text color="muted" className="mt-2">
            Redirecting you to your ticket...
          </Text>
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Plus size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Create Support Ticket
            </Heading>
            <Text color="muted" className="text-xs">
              Describe your issue and our team will respond as soon as possible
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

        <Separator spacing="md" />

        <div className="space-y-4">
          <FormField label="Subject" required>
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={form.subject}
                onChange={(event) => update('subject')(event.target.value)}
                placeholder="Brief description of your issue"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </FormField>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Category" required>
              {({ id }) => (
                <select
                  id={id}
                  value={form.category}
                  onChange={(event) => update('category')(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>

            <FormField label="Priority" required>
              {({ id }) => (
                <select
                  id={id}
                  value={form.priority}
                  onChange={(event) => update('priority')(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              )}
            </FormField>
          </div>

          <FormField label="Description" required>
            {({ id }) => (
              <textarea
                id={id}
                rows={6}
                value={form.description}
                onChange={(event) => update('description')(event.target.value)}
                placeholder="Please describe your issue in detail, including any steps to reproduce"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            )}
          </FormField>

          <KycDocumentUploader
            label="Attachments (optional)"
            description="Screenshots, logs, or other supporting files"
            value={attachments}
            onChange={setAttachments}
            multiple
            accept="image/jpeg,image/png,image/webp,text/plain,application/pdf"
            maxSize={10 * 1024 * 1024}
          />
        </div>

        <div className="mt-8 flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
          <Button variant="outline" onClick={handleBack}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={submitting}
            leadingIcon={submitting ? Loader2 : Plus}
          >
            {submitting ? 'Creating...' : 'Create Ticket'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default CreateTicket;