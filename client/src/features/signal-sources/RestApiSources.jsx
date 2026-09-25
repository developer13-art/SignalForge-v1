import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Code2, ArrowLeft, Plus, Copy, Check, Loader2, Trash2, KeyRound } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import CodeBlock from '../../components/data-display/CodeBlock';

const RestApiSources = function RestApiSources() {
  const navigate = useNavigate();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(null);
  const [error, setError] = useState(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sources/rest-api/keys', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setKeys(payload.data || []);
      } else {
        setError(payload?.error?.message || 'Failed to load API keys');
      }
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = useCallback(async () => {
    try {
      const response = await fetch('/api/sources/rest-api/keys', {
        method: 'POST',
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setNewKey(payload.data);
        fetchKeys();
      }
    } catch (_err) {
      // silent
    }
  }, [fetchKeys]);

  const handleDelete = useCallback(
    async (keyId) => {
      try {
        await fetch(`/api/sources/rest-api/keys/${keyId}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        fetchKeys();
      } catch (_err) {
        // silent
      }
    },
    [fetchKeys],
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
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
              <Code2 size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                REST API Sources
              </Heading>
              <Text color="muted" className="text-xs">
                Submit signals directly through the SignalForge API
              </Text>
            </div>
          </div>

          <Button variant="primary" onClick={handleCreate} leadingIcon={Plus}>
            Create API Key
          </Button>
        </div>

        {error ? (
          <div className="mt-4">
            <Alert variant="danger" size="sm">
              {error}
            </Alert>
          </div>
        ) : null}

        {newKey ? (
          <Alert variant="success" size="sm" className="mt-4">
            <p className="text-xs font-semibold">Save this API key now</p>
            <p className="mt-1 text-xs">
              You will not be able to see it again. Copy it before closing this page.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-2">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-800">
                {newKey.apiKey}
              </code>
              <button
                type="button"
                onClick={() => handleCopy('new', newKey.apiKey)}
                aria-label="Copy API key"
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {copied === 'new' ? (
                  <Check size={14} className="text-emerald-600" aria-hidden="true" />
                ) : (
                  <Copy size={14} aria-hidden="true" />
                )}
              </button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setNewKey(null)} className="mt-3">
              Dismiss
            </Button>
          </Alert>
        ) : null}

        <Alert variant="info" size="sm" className="mt-4">
          <p className="text-xs">
            Use the API key as a Bearer token in the Authorization header. See the API reference
            for the full submission format.
          </p>
        </Alert>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
            </div>
          ) : keys.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No API keys yet"
              description="Create an API key to submit signals through the REST API."
              action={
                <Button variant="primary" onClick={handleCreate} leadingIcon={Plus}>
                  Create API Key
                </Button>
              }
            />
          ) : (
            keys.map((key) => (
              <Card key={key.id} padding="md" variant="subtle">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{key.label}</p>
                      <Badge variant={key.active ? 'success' : 'neutral'} size="xs">
                        {key.active ? 'Active' : 'Revoked'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Created {key.createdAt} · Last used {key.lastUsedAt || 'never'}
                    </p>
                    <p className="mt-1 font-mono text-xs text-slate-700">{key.prefix}...</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(key.id)}
                    aria-label="Revoke"
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Example request
          </p>
          <CodeBlock
            code={`curl -X POST https://api.signalforge.ai/v1/provider/signal \\
  -H "Authorization: Bearer sf_live_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "symbol": "EURUSD",
    "action": "BUY",
    "entry_type": "MARKET",
    "stop_loss": 1.1020,
    "take_profits": [1.1110]
  }'`}
            language="bash"
            size="sm"
            showCopy
            className="mt-2"
          />
        </div>
      </Card>
    </Container>
  );
};

export default RestApiSources;