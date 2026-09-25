import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MessageCircle,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  LogOut,
  ExternalLink,
  Shield,
} from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';

const WhatsAppConnection = function WhatsAppConnection() {
  const navigate = useNavigate();
  const [state, setState] = useState('initial');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/sources/whatsapp/status', {
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
  }, [fetchStatus]);

  const handleConnect = useCallback(() => {
    window.location.href = '/api/sources/whatsapp/oauth/start';
  }, []);

  const handleDisconnect = useCallback(async () => {
    try {
      await fetch('/api/sources/whatsapp/disconnect', {
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
    navigate('/sources/whatsapp/sources');
  }, [navigate]);

  const handleBack = useCallback(() => navigate('/sources/add'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <MessageCircle size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Connect WhatsApp
            </Heading>
            <Text color="muted" className="text-xs">
              Use the WhatsApp Business Cloud API to monitor groups and chats
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
              <p className="flex items-start gap-2 text-xs">
                <Shield size={12} className="mt-0.5 shrink-0" aria-hidden="true" />
                <span>
                  SignalForge connects using the official WhatsApp Business Cloud API. You can
                  revoke access at any time.
                </span>
              </p>
            </Alert>

            <Button
              variant="primary"
              size="lg"
              onClick={handleConnect}
              leadingIcon={ExternalLink}
            >
              Authorize WhatsApp Access
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
                    Business: {session?.businessName || 'WhatsApp Business'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <Button variant="outline" onClick={handleDisconnect} leadingIcon={LogOut}>
                Disconnect
              </Button>
              <Button variant="primary" onClick={handleContinue}>
                Select Sources
              </Button>
            </div>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default WhatsAppConnection;