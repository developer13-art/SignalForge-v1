import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Loader2, CheckCircle2, LogOut, ExternalLink } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';

const DiscordConnection = function DiscordConnection() {
  const navigate = useNavigate();
  const [state, setState] = useState('initial');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/sources/discord/status', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok && payload.data?.connected) {
        setSession(payload.data);
        setState('connected');
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('connected') === 'true') {
      fetchStatus();
    }
  }, [fetchStatus]);

  const handleConnect = useCallback(() => {
    window.location.href = '/api/sources/discord/oauth/start';
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      await fetch('/api/sources/discord/disconnect', {
        method: 'POST',
        credentials: 'include',
      });
      setSession(null);
      setState('initial');
    } catch (_err) {
      // silent
    }
  }, []);

  const handleContinue = useCallback(() => {
    navigate('/sources/discord/channels');
  }, [navigate]);

  const handleBack = useCallback(() => navigate('/sources/add'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <MessageSquare size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Connect Discord
            </Heading>
            <Text color="muted" className="text-xs">
              Authorize SignalForge to read messages from servers you select
            </Text>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={24} className="animate-spin" aria-hidden="true" />
          </div>
        ) : state === 'initial' ? (
          <div className="mt-6 space-y-4">
            <Alert variant="info" size="sm">
              <p className="text-xs">
                SignalForge will only read channels you explicitly enable. You can revoke access
                at any time from your Discord settings.
              </p>
            </Alert>

            <Button
              variant="primary"
              size="lg"
              onClick={handleConnect}
              leadingIcon={ExternalLink}
            >
              Authorize Discord Access
            </Button>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-600">
                  <CheckCircle2 size={22} aria-hidden="true" />
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-emerald-900">Connected</p>
                    <Badge variant="success" size="xs">
                      Active
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-emerald-800">
                    Account: {session?.username || 'Discord user'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={handleDisconnect} leadingIcon={LogOut}>
                Disconnect
              </Button>
              <Button variant="primary" onClick={handleContinue}>
                Select Servers
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default DiscordConnection;