import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, ArrowLeft, Loader2, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import EmptyState from '../../components/common/EmptyState';

const WhatsAppSources = function WhatsAppSources() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sources/whatsapp/sources', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setSources(payload.data || []);
        setSelected((payload.data || []).filter((s) => s.selected).map((s) => s.id));
      } else {
        setError(payload?.error?.message || 'Failed to load WhatsApp sources');
      }
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handleBack = useCallback(() => navigate('/sources/whatsapp'), [navigate]);

  const toggleSource = useCallback((id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/sources/whatsapp/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sourceIds: selected }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save selection');
        return;
      }

      navigate('/sources');
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [selected, navigate]);

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
              Select WhatsApp Sources
            </Heading>
            <Text color="muted" className="text-xs">
              Choose which groups and chats SignalForge should monitor
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

        <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-slate-200">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
            </div>
          ) : sources.length === 0 ? (
            <EmptyState
              title="No WhatsApp sources"
              description="No groups or chats are available for this account."
            />
          ) : (
            <ul className="divide-y divide-slate-200">
              {sources.map((source) => {
                const isSelected = selected.includes(source.id);
                return (
                  <li key={source.id}>
                    <button
                      type="button"
                      onClick={() => toggleSource(source.id)}
                      className={[
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                        isSelected ? 'bg-emerald-50' : 'bg-white hover:bg-slate-50',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <span
                        className={[
                          'flex h-5 w-5 items-center justify-center rounded border-2',
                          isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {isSelected ? (
                          <Check size={12} className="text-white" aria-hidden="true" />
                        ) : null}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {source.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {source.type} · {source.membersCount || 0} members
                        </p>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            {selected.length} source{selected.length !== 1 ? 's' : ''} selected
          </p>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving || selected.length === 0}
          >
            {saving ? 'Saving...' : 'Save & Continue'}
          </Button>
        </div>
      </Card>
    </Container>
  );
};

export default WhatsAppSources;