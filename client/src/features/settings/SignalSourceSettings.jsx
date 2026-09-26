import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Radio, ArrowLeft, Loader2, RefreshCw, Plus, Trash2, Settings2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const SignalSourceSettings = function SignalSourceSettings() {
  const navigate = useNavigate();
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState(null);

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

  const handleRemove = useCallback(async () => {
    if (!removing) {
      return;
    }
    try {
      await fetch(`/api/sources/${removing.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setRemoving(null);
      fetchSources();
    } catch (_err) {
      // silent
    }
  }, [removing, fetchSources]);

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
            onClick={fetchSources}
            disabled={loading}
            leadingIcon={loading ? Loader2 : RefreshCw}
          >
            Refresh
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/sources/add')} leadingIcon={Plus}>
            Add Source
          </Button>
        </div>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Radio size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signal Source Settings
            </Heading>
            <Text color="muted" className="text-xs">
              Manage your connected signal sources
            </Text>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : sources.length === 0 ? (
            <EmptyState
              icon={Radio}
              title="No signal sources"
              description="Add your first source to start receiving signals."
              action={
                <Button variant="primary" onClick={() => navigate('/sources/add')}>
                  Add Source
                </Button>
              }
            />
          ) : (
            sources.map((source) => (
              <div
                key={source.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                    <Radio size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">{source.name}</p>
                      <Badge variant={source.status === 'connected' ? 'success' : 'neutral'} size="xs">
                        {source.status}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-500 capitalize">
                      {source.type}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/sources/${source.id}`)}
                    leadingIcon={Settings2}
                  >
                    Manage
                  </Button>
                  <button
                    type="button"
                    onClick={() => setRemoving(source)}
                    aria-label="Remove"
                    className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
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
        title="Remove signal source"
        description={
          removing
            ? `Are you sure you want to remove ${removing.name}? You will stop receiving signals from this source.`
            : ''
        }
        confirmLabel="Remove Source"
      />
    </Container>
  );
};

export default SignalSourceSettings;