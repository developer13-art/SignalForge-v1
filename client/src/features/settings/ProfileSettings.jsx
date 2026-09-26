import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Loader2, Save, RefreshCw, Camera } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import Avatar from '../../components/common/Avatar';
import Alert from '../../components/feedback/Alert';

const ProfileSettings = function ProfileSettings() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    country: '',
    avatarUrl: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/profile', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setProfile((prev) => ({ ...prev, ...payload.data }));
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
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profile),
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
  }, [profile]);

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  const update = (field) => (value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

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
            <User size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Profile Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your personal information
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
              Profile updated.
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
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar
                size="2xl"
                src={profile.avatarUrl}
                name={`${profile.firstName} ${profile.lastName}`.trim()}
                alt="Profile"
              />
              <Button variant="outline" leadingIcon={Camera}>
                Change Avatar
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="First Name" required>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={profile.firstName}
                    onChange={(event) => update('firstName')(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>

              <FormField label="Last Name" required>
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={profile.lastName}
                    onChange={(event) => update('lastName')(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>
            </div>

            <FormField label="Middle Name">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={profile.middleName}
                  onChange={(event) => update('middleName')(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <FormField
              label="Username"
              description="Your public username on the platform"
            >
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={profile.username}
                  onChange={(event) => update('username')(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                />
              )}
            </FormField>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Email" description="Contact support to change your email">
                {({ id }) => (
                  <input
                    id={id}
                    type="email"
                    value={profile.email}
                    readOnly
                    className="w-full cursor-not-allowed rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500"
                  />
                )}
              </FormField>

              <FormField label="Phone">
                {({ id }) => (
                  <input
                    id={id}
                    type="tel"
                    value={profile.phone}
                    onChange={(event) => update('phone')(event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
                  />
                )}
              </FormField>
            </div>

            <FormField label="Country">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={profile.country}
                  onChange={(event) => update('country')(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
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

export default ProfileSettings;