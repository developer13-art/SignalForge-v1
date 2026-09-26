import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, ArrowLeft, Loader2, Save, RefreshCw, Upload } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Alert from '../../components/feedback/Alert';

const LogoBranding = function LogoBranding() {
  const navigate = useNavigate();
  const [branding, setBranding] = useState({
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#4f46e5',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/white-label/branding', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setBranding((prev) => ({ ...prev, ...payload.data }));
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
      const response = await fetch('/api/white-label/branding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(branding),
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
  }, [branding]);

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
              Logo & Branding
            </Heading>
            <Text color="muted" className="text-xs">
              Upload your logo and customize colors
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
              Branding saved.
            </Alert>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold text-slate-800">Logo</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex h-20 w-40 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                  {branding.logoUrl ? (
                    <img
                      src={branding.logoUrl}
                      alt="Logo"
                      className="max-h-16 max-w-32 object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">No logo</span>
                  )}
                </div>
                <Button variant="outline" leadingIcon={Upload}>
                  Upload Logo
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-800">Favicon</p>
              <div className="mt-3 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
                  {branding.faviconUrl ? (
                    <img src={branding.faviconUrl} alt="Favicon" className="h-8 w-8" />
                  ) : (
                    <span className="text-[10px] text-slate-400">None</span>
                  )}
                </div>
                <Button variant="outline" leadingIcon={Upload}>
                  Upload Favicon
                </Button>
              </div>
            </div>

            <Separator spacing="sm" />

            <div className="space-y-4">
              <FormField label="Primary Color">
                {({ id }) => (
                  <div className="flex items-center gap-3">
                    <input
                      id={id}
                      type="color"
                      value={branding.primaryColor}
                      onChange={(event) =>
                        setBranding((prev) => ({ ...prev, primaryColor: event.target.value }))
                      }
                      className="h-10 w-16 cursor-pointer rounded-md border border-slate-300"
                    />
                    <input
                      type="text"
                      value={branding.primaryColor}
                      onChange={(event) =>
                        setBranding((prev) => ({ ...prev, primaryColor: event.target.value }))
                      }
                      className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                    />
                  </div>
                )}
              </FormField>

              <FormField label="Secondary Color">
                {({ id }) => (
                  <div className="flex items-center gap-3">
                    <input
                      id={id}
                      type="color"
                      value={branding.secondaryColor}
                      onChange={(event) =>
                        setBranding((prev) => ({ ...prev, secondaryColor: event.target.value }))
                      }
                      className="h-10 w-16 cursor-pointer rounded-md border border-slate-300"
                    />
                    <input
                      type="text"
                      value={branding.secondaryColor}
                      onChange={(event) =>
                        setBranding((prev) => ({ ...prev, secondaryColor: event.target.value }))
                      }
                      className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                    />
                  </div>
                )}
              </FormField>

              <FormField label="Accent Color">
                {({ id }) => (
                  <div className="flex items-center gap-3">
                    <input
                      id={id}
                      type="color"
                      value={branding.accentColor}
                      onChange={(event) =>
                        setBranding((prev) => ({ ...prev, accentColor: event.target.value }))
                      }
                      className="h-10 w-16 cursor-pointer rounded-md border border-slate-300"
                    />
                    <input
                      type="text"
                      value={branding.accentColor}
                      onChange={(event) =>
                        setBranding((prev) => ({ ...prev, accentColor: event.target.value }))
                      }
                      className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                    />
                  </div>
                )}
              </FormField>
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Branding'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default LogoBranding;