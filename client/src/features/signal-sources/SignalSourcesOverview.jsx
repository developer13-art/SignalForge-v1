import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, Plus, RefreshCw, Loader2, MessageSquare, Send, Mail, Webhook, Code2, MessageCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';

const SOURCE_ICONS = {
  telegram: Send,
  discord: MessageSquare,
  whatsapp: MessageCircle,
  tradingview: Webhook,
  rest_api: Code2,
  email: Mail,
};

const SOURCE_LABELS = {
  telegram: 'Telegram',
  discord: 'Discord',
  whatsapp: 'WhatsApp',
  tradingview: 'TradingView',
  rest_api: 'REST API',
  email: 'Email',
};

const STATUS_VARIANTS = {
  connected: 'success',
  error: 'danger',
  disconnected: 'neutral',
  pending: 'warning',
};

const SignalSourcesOverview = function SignalSourcesOverview() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sources', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setSources(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleDisconnect = useCallback(
    async (source) => {
      try {
        await fetch(`/api/sources/${source.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchSources();
      } catch (_err) {
        // silent
      }
    },
    [fetchSources],
  );

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signal Sources
            </Heading>
            <Text color="muted" className="text-xs">
              Connect channels, servers, inboxes, and webhooks to receive signals
            </Text>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchSources}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/sources/add')}
            leadingIcon={Plus}
          >
            Add Source
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {sources.length === 0 && !loading ? (
          <Card padding="lg">
            <EmptyState
              icon={Radio}
              title="No signal sources yet"
              description="Connect your first source to start receiving signals."
              action={
                <Button variant="primary" onClick={() => navigate('/sources/add')} leadingIcon={Plus}>
                  Add Signal Source
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sources.map((source) => {
              const Icon = SOURCE_ICONS[source.type] || Radio;
              return (
                <Card key={source.id} padding="lg">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <Icon size={20} aria-hidden="true" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{source.name}</p>
                        <p className="text-[11px] text-slate-500">
                          {SOURCE_LABELS[source.type] || source.type}
                        </p>
                      </div>
                    </div>
                    <Badge variant={STATUS_VARIANTS[source.status] || 'neutral'} size="xs">
                      {source.status}
                    </Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 text-xs">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Channels
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {source.channelsCount || 0}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Messages
                      </p>
                      <p className="mt-1 font-semibold text-slate-800">
                        {source.messagesCount || 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/sources/${source.id}`)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      Manage
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDisconnect(source)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-800"
                    >
                      Disconnect
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
};

export default SignalSourcesOverview;