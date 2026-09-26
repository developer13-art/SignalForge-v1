import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import TagInput from '../../components/forms/TagInput';
import Alert from '../../components/feedback/Alert';

const ProviderProfileManagement = function ProviderProfileManagement() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    description: '',
    bio: '',
    website: '',
    location: '',
    languages: [],
    tags: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/provider-business/profile', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setForm((prev) => ({ ...prev, ...payload.data }));
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/provider-business/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save profile');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [form]);

  const handleBack = useCallback(() => navigate('/provider'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchProfile}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Award size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Profile Management
            </Heading>
            <Text color="muted" className="text-xs">
              How subscribers see your provider profile
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

        {success ? (
          <div className="mt-4">
            <Alert variant="success" size="sm">
              Profile updated successfully.
            </Alert>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-4">
            <FormField label="Provider Name" required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.name}
                  onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <FormField label="Short Description" required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <FormField label="About" description="Longer description of your strategy and background">
              {({ id }) => (
                <textarea
                  id={id}
                  rows={5}
                  value={form.bio}
                  onChange={(event) => setForm((prev) => ({ ...prev, bio: event.target.value }))}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Website">
                {({ id }) => (
                  <input
                    id={id}
                    type="url"
                    value={form.website}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, website: event.target.value }))
                    }
                    placeholder="https://"
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>

              <FormField label="Location">
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={form.location}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, location: event.target.value }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>
            </div>

            <FormField label="Languages">
              {() => (
                <TagInput
                  value={form.languages}
                  onChange={(value) => setForm((prev) => ({ ...prev, languages: value }))}
                  placeholder="e.g. English, Portuguese, Spanish"
                />
              )}
            </FormField>

            <FormField label="Tags" description="Keywords describing your style">
              {() => (
                <TagInput
                  value={form.tags}
                  onChange={(value) => setForm((prev) => ({ ...prev, tags: value }))}
                  placeholder="e.g. Gold, Scalping, News"
                />
              )}
            </FormField>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default ProviderProfileManagement;