import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, Save, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';

const UserRestrictions = function UserRestrictions() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [restrictions, setRestrictions] = useState({
    tradingDisabled: false,
    withdrawalsDisabled: false,
    subscriptionsDisabled: false,
    referralsDisabled: false,
    loginDisabled: false,
    reason: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/restrictions`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok && payload.data) {
        setRestrictions((prev) => ({ ...prev, ...payload.data }));
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch(`/api/admin/users/${userId}/restrictions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(restrictions),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save restrictions');
        return;
      }

      setSuccess(true);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [userId, restrictions]);

  const handleBack = useCallback(() => navigate(`/admin/users/${userId}`), [navigate, userId]);

  const toggle = (key) => (value) => {
    setRestrictions((prev) => ({ ...prev, [key]: value }));
  };

  const rows = [
    { key: 'tradingDisabled', label: 'Trading Disabled', description: 'Prevent the user from placing trades.' },
    { key: 'withdrawalsDisabled', label: 'Withdrawals Disabled', description: 'Prevent the user from withdrawing funds.' },
    { key: 'subscriptionsDisabled', label: 'Subscriptions Disabled', description: 'Prevent the user from subscribing to providers.' },
    { key: 'referralsDisabled', label: 'Referrals Disabled', description: 'Prevent the user from earning referral rewards.' },
    { key: 'loginDisabled', label: 'Login Disabled', description: 'Lock the user out of their account entirely.' },
  ];

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
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              User Restrictions
            </Heading>
            <Text color="muted" className="text-xs">
              Apply granular restrictions on this user's account
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
              Restrictions updated.
            </Alert>
          </div>
        ) : null}

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <label
                key={row.key}
                className="flex items-start gap-3 rounded-md border border-slate-200 bg-white p-3"
              >
                <input
                  type="checkbox"
                  checked={restrictions[row.key]}
                  onChange={(event) => toggle(row.key)(event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{row.label}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{row.description}</p>
                </div>
              </label>
            ))}

            <div className="pt-3">
              <label className="text-sm font-medium text-slate-700">
                Reason for restrictions
              </label>
              <textarea
                rows={3}
                value={restrictions.reason}
                onChange={(event) => toggle('reason')(event.target.value)}
                placeholder="Document the reason for these restrictions"
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 pt-4">
          <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
            {saving ? 'Saving...' : 'Save Restrictions'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default UserRestrictions;