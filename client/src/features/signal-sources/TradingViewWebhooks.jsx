import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Webhook, ArrowLeft, Copy, Check, Loader2, Trash2, RefreshCw, Plus } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import CodeBlock from '../../components/data-display/CodeBlock';

const TradingViewWebhooks = function TradingViewWebhooks() {
  const navigate = useNavigate();
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const fetchWebhooks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sources/tradingview/webhooks', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setWebhooks(payload.data || []);
      } else {
        setError(payload?.error?.message || 'Failed to load webhooks');
      }
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWebhooks();
  }, [fetchWebhooks]);

  const handleCreate = useCallback(async () => {
    try {
      const response = await fetch('/api/sources/tradingview/webhooks', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        fetchWebhooks();
      }
    } catch (_err) {
      // silent
    }
  }, [fetchWebhooks]);

  const handleDelete = useCallback(
    async (webhookId) => {
      try {
        await fetch(`/api/sources/tradingview/webhooks/${webhookId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchWebhooks();
      } catch (_err) {
        // silent
      }
    },
    [fetchWebhooks],
  );

  const handleCopy = useCallback(async (id, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (_err) {
      // silent
    }
  }, []);

  const handleBack = useCallback(() => navigate('/sources/add'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <Webhook size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                TradingView Webhooks
              </Heading>
              <Text color="muted" className="text-xs">
                Receive alerts from TradingView strategies via webhook
              </Text>
            </div>
          </div>

          <Button variant="primary" onClick={handleCreate} leadingIcon={Plus}>
            Create Webhook
          </Button>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        <Alert variant="info" size="sm" className="mt-4">
          <p className="text-xs">
            In TradingView, create an alert and set the webhook URL to the one below. Payload must
            include the JSON structure documented in the API reference.
          </p>
        </Alert>

        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
            </div>
          ) : webhooks.length === 0 ? (
            <EmptyState
              icon={Webhook}
              title="No webhooks yet"
              description="Create your first TradingView webhook to receive alerts."
              action={
                <Button variant="primary" onClick={handleCreate} leadingIcon={Plus}>
                  Create Webhook
                </Button>
              }
            />
          ) : (
            webhooks.map((webhook) => (
              <Card key={webhook.id} padding="md" variant="subtle">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {webhook.name || 'TradingView Webhook'}
                      </p>
                      <Badge variant={webhook.active ? 'success' : 'neutral'} size="xs">
                        {webhook.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Created {webhook.createdAt}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={fetchWebhooks}
                      aria-label="Refresh"
                      className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      <RefreshCw size={14} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(webhook.id)}
                      aria-label="Delete"
                      className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Webhook URL
                  </p>
                  <div className="mt-1 flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2">
                    <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-700">
                      {webhook.url}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(webhook.id, webhook.url)}
                      aria-label="Copy URL"
                      className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    >
                      {copied === webhook.id ? (
                        <Check size={14} className="text-emerald-600" aria-hidden="true" />
                      ) : (
                        <Copy size={14} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Example payload
                  </p>
                  <CodeBlock
                    code={`{
  "symbol": "EURUSD",
  "action": "BUY",
  "entry": "{{close}}",
  "stop_loss": 1.1020,
  "take_profits": [1.1110]
}`}
                    language="json"
                    size="sm"
                    showCopy
                  />
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </Container>
  );
};

export default TradingViewWebhooks;