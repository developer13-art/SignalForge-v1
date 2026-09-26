import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const BrandConfiguration = function BrandConfiguration() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    brandName: '',
    tagline: '',
    supportEmail: '',
    supportPhone: '',
    termsUrl: '',
    privacyUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/brand', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setForm((prev) => ({ ...prev, ...payload.data }));
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/white-label/brand', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [form]);

  const handleBack = useCallback(() => navigate('/white-label'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Palette size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Brand Configuration
            </Heading>
            <Text color="muted" className="text-xs">
              Configure the name, tagline, and support information for your brand
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
              Brand configuration saved.
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
            <FormField label="Brand Name" required>
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.brandName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, brandName: event.target.value }))
                  }
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <FormField label="Tagline">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={form.tagline}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, tagline: event.target.value }))
                  }
                  placeholder="Trading intelligence, powered by your brand"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Support Email">
                {({ id }) => (
                  <input
                    id={id}
                    type="email"
                    value={form.supportEmail}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, supportEmail: event.target.value }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>

              <FormField label="Support Phone">
                {({ id }) => (
                  <input
                    id={id}
                    type="tel"
                    value={form.supportPhone}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, supportPhone: event.target.value }))
                    }
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>
            </div>

            <FormField label="Terms of Service URL">
              {({ id }) => (
                <input
                  id={id}
                  type="url"
                  value={form.termsUrl}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, termsUrl: event.target.value }))
                  }
                  placeholder="https://yourbrand.com/terms"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <FormField label="Privacy Policy URL">
              {({ id }) => (
                <input
                  id={id}
                  type="url"
                  value={form.privacyUrl}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, privacyUrl: event.target.value }))
                  }
                  placeholder="https://yourbrand.com/privacy"
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default BrandConfiguration;