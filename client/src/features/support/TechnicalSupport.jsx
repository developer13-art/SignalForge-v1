import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const ISSUE_TYPES = [
  { value: 'broker_connection', label: 'Broker connection failure' },
  { value: 'signal_source', label: 'Signal source not receiving messages' },
  { value: 'execution_error', label: 'Trade execution error' },
  { value: 'api_access', label: 'API access issue' },
  { value: 'performance', label: 'Platform performance issue' },
  { value: 'other', label: 'Other technical issue' },
];

const TechnicalSupport = function TechnicalSupport() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    issueType: 'broker_connection',
    subject: '',
    description: '',
    urgency: 'medium',
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = useCallback(async () => {
    setError(null);

    if (!form.subject.trim() || !form.description.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/support/technical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to submit');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSubmitting(false);
    }
  }, [form]);

  const handleBack = useCallback(() => navigate('/support'), [navigate]);

  const update = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Server size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Technical Support
            </Heading>
            <Text color="muted" className="text-xs">
              Report a technical issue that requires engineering attention
            </Text>
          </div>
        </div>

        {success ? (
          <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-emerald-600">
              <CheckCircle2 size={26} aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm font-semibold text-emerald-900">
              Your report has been submitted
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              Our engineering team will review your report and follow up if needed.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="outline" onClick={() => setSuccess(false)}>
                Report Another
              </Button>
              <Button variant="primary" onClick={handleBack}>
                Back to Help Center
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

            <Separator spacing="md" />

            <div className="space-y-4">
              <FormField label="Issue Type" required>
                {({ id }) => (
                  <select
                    id={id}
                    value={form.issueType}
                    onChange={(event) => update('issueType')(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    {ISSUE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                )}
              </FormField>

              <FormField label="Urgency">
                {({ id }) => (
                  <select
                    id={id}
                    value={form.urgency}
                    onChange={(event) => update('urgency')(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="low">Low — non-blocking</option>
                    <option value="medium">Medium — partially blocking</option>
                    <option value="high">High — blocking my work</option>
                    <option value="critical">Critical — full outage</option>
                  </select>
                )}
              </FormField>

              <FormField label="Subject" required>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={form.subject}
                    onChange={(event) => update('subject')(event.target.value)}
                    placeholder="Brief summary of the issue"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>

              <FormField
                label="Description"
                required
                description="Include steps to reproduce, error messages, and any relevant details"
              >
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={8}
                    value={form.description}
                    onChange={(event) => update('description')(event.target.value)}
                    placeholder="Describe what happened, when it occurred, and what you were doing when it happened"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>
            </div>

            <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
                leadingIcon={submitting ? Loader2 : Server}
              >
                {submitting ? 'Submitting...' : 'Submit Technical Report'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default TechnicalSupport;