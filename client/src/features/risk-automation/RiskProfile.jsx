import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import RiskProfileForm from '../../components/domain/risk/RiskProfileForm';

const RiskProfile = function RiskProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/profile', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setProfile(payload.data);
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

  const handleSave = useCallback(async (values) => {
    setSaving(true);
    try {
      const response = await fetch('/api/risk/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(values),
      });

      if (response.ok) {
        navigate('/risk');
      }
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Shield size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Risk Profile
              </Heading>
              <Text color="muted" className="text-xs">
                Configure your per-trade risk, limits, and automatic protections
              </Text>
            </div>
          </div>

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

        <div className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : (
            <RiskProfileForm
              defaultValues={profile}
              onSubmit={handleSave}
              onCancel={handleBack}
              submitting={saving}
            />
          )}
        </div>
      </Card>
    </Container>
  );
};

export default RiskProfile;