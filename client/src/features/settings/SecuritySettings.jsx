import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw, KeyRound, ArrowRight, Lock } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Badge from '../../components/common/Badge';

const SecuritySettings = function SecuritySettings() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/security', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
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

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

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
            <Shield size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Security Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your account security and authentication
            </Text>
          </div>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => navigate('/settings/security/password')}
              className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Lock size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Change Password</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Last changed{' '}
                    {data?.passwordLastChanged ? data.passwordLastChanged : 'never'}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/settings/security/2fa')}
              className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <KeyRound size={16} aria-hidden="true" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      Two-Factor Authentication
                    </p>
                    <Badge
                      variant={data?.twoFactorEnabled ? 'success' : 'neutral'}
                      size="xs"
                    >
                      {data?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/settings/security/devices')}
              className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Shield size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Connected Devices</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {data?.activeSessions || 0} active session
                    {data?.activeSessions !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/settings/security/activity')}
              className="flex w-full items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Shield size={16} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Security Activity</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    View sign-in history and security events
                  </p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-400" aria-hidden="true" />
            </button>

            {data?.accountStatus ? (
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Account Status</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Current status of your account
                    </p>
                  </div>
                  <Badge variant="success" size="sm">
                    {data.accountStatus}
                  </Badge>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </Container>
  );
};

export default SecuritySettings;