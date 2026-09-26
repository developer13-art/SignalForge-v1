import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, ArrowLeft, Loader2, RefreshCw, Check, Plus } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const PROVIDERS = [
  { id: 'google', name: 'Google', description: 'Sign in with your Google account' },
  { id: 'discord', name: 'Discord', description: 'Connect your Discord account' },
  { id: 'telegram', name: 'Telegram', description: 'Connect your Telegram account' },
  { id: 'twitter', name: 'X (Twitter)', description: 'Connect your X account' },
];

const ConnectedAccounts = function ConnectedAccounts() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/connected-accounts', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setAccounts(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleConnect = useCallback((provider) => {
    window.location.href = `/api/auth/oauth/${provider}?link=true`;
  }, []);

  const handleDisconnect = useCallback(
    async (provider) => {
      try {
        await fetch(`/api/users/connected-accounts/${provider}`, {
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

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  const isConnected = (providerId) => accounts.some((a) => a.provider === providerId);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchAccounts}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Link2 size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Connected Accounts
            </Heading>
            <Text color="muted" className="text-xs">
              Link social accounts for faster sign-in
            </Text>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : (
            PROVIDERS.map((provider) => {
              const connected = isConnected(provider.id);
              return (
                <div
                  key={provider.id}
                  className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{provider.name}</p>
                      {connected ? (
                        <Badge variant="success" size="xs">
                          Connected
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">{provider.description}</p>
                  </div>

                  {connected ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(provider.id)}
                    >
                      Disconnect
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleConnect(provider.id)}
                      leadingIcon={Plus}
                    >
                      Connect
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Card>
    </Container>
  );
};

export default ConnectedAccounts;