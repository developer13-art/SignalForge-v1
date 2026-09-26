import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ArrowLeft, Loader2, RefreshCw, Plus, Copy, Check, Trash2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Alert from '../../components/feedback/Alert';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const ApiKeys = function ApiKeys() {
  const navigate = useNavigate();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState(null);
  const [copied, setCopied] = useState(null);
  const [removing, setRemoving] = useState(null);

  const fetchKeys = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/users/api-keys', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setKeys(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = useCallback(async () => {
    try {
      const response = await fetch('/api/users/api-keys', {
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

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/users/api-keys/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchKeys();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchKeys]);

  const handleCopy = useCallback(async (id, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
      setTimeout(() => setCopied(null), 2000);
    } catch (_err) {
      // silent
    }
  }, []);

  const handleBack = useCallback(() => navigate('/settings'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchKeys}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={handleCreate} leadingIcon={Plus}>
            Create Key
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <KeyRound size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              API Keys
            </Heading>
            <Text color="muted" className="text-xs">
              Manage API keys for programmatic access
            </Text>
          </div>
        </div>

        {newKey ? (
          <Alert variant="success" size="sm" className="mt-4">
            <p className="text-xs font-semibold">Save this API key now</p>
            <p className="mt-1 text-xs">
              You will not see it again. Store it in a secure location.
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 py-2">
              <code className="min-w-0 flex-1 truncate font-mono text-xs text-slate-800">
                {newKey.key}
              </code>
              <button
                type="button"
                onClick={() => handleCopy('new', newKey.key)}
                aria-label="Copy"
                className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                {copied === 'new' ? (
                  <Check size={14} className="text-emerald-600" aria-hidden="true" />
                ) : (
                  <Copy size={14} aria-hidden="true" />
                )}
              </button>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNewKey(null)}
              className="mt-3"
            >
              Dismiss
            </Button>
          </Alert>
        ) : null}

        <Separator spacing="md" />

        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : keys.length === 0 ? (
            <EmptyState
              icon={KeyRound}
              title="No API keys yet"
              description="Create an API key to access the platform programmatically."
              action={
                <Button variant="primary" onClick={handleCreate} leadingIcon={Plus}>
                  Create Key
                </Button>
              }
            />
          ) : (
            keys.map((key) => (
              <div
                key={key.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{key.label}</p>
                    <Badge variant={key.active ? 'success' : 'neutral'} size="xs">
                      {key.active ? 'Active' : 'Revoked'}
                    </Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-slate-600">
                    {key.prefix}••••••••••••
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Created {key.createdAt} · Last used {key.lastUsedAt || 'never'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setRemoving(key)}
                  aria-label="Revoke"
                  className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            ))
          )}
        </div>
      </Card>

      <ConfirmDialog
        open={Boolean(removing)}
        onClose={() => setRemoving(null)}
        onConfirm={handleRemove}
        variant="danger"
        title="Revoke API key"
        description={
          removing
            ? `Are you sure you want to revoke "${removing.label}"? Any integration using this key will stop working.`
            : ''
        }
        confirmLabel="Revoke Key"
      />
    </Container>
  );
};

export default ApiKeys;