import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Loader2, Search, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Avatar from '../../components/common/Avatar';
import Alert from '../../components/feedback/Alert';

const TelegramChannels = function TelegramChannels() {
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchChannels = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sources/telegram/dialogs', {
        credentials: 'include',
      });
      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load channels');
        return;
      }

      setChannels(payload.data || []);
      setSelected(payload.data?.filter((c) => c.selected).map((c) => c.id) || []);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleBack = useCallback(() => navigate('/sources/telegram'), [navigate]);

  const toggleChannel = useCallback((channelId) => {
    setSelected((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId],
    );
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/sources/telegram/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ channelIds: selected }),
      });

      if (!response.ok) {
        const payload = await response.json();
        setError(payload?.error?.message || 'Failed to save channels');
        return;
      }

      navigate('/sources');
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setSaving(false);
    }
  }, [selected, navigate]);

  const filteredChannels = channels.filter((channel) =>
    channel.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
            <Send size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Select Telegram Channels
            </Heading>
            <Text color="muted" className="text-xs">
              Choose which channels and groups SignalForge should monitor
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

        <div className="mt-4">
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search channels and groups"
              className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-4 max-h-96 overflow-y-auto rounded-lg border border-slate-200">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
            </div>
          ) : filteredChannels.length === 0 ? (
            <EmptyState
              title="No channels found"
              description={search ? 'Try a different search term.' : 'Your Telegram account has no channels.'}
              size="sm"
            />
          ) : (
            <ul className="divide-y divide-slate-200">
              {filteredChannels.map((channel) => {
                const isSelected = selected.includes(channel.id);
                return (
                  <li key={channel.id}>
                    <button
                      type="button"
                      onClick={() => toggleChannel(channel.id)}
                      className={[
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                        isSelected ? 'bg-indigo-50' : 'bg-white hover:bg-slate-50',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    >
                      <Avatar size="sm" src={channel.avatar} name={channel.name} alt={channel.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {channel.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {channel.type === 'channel' ? 'Channel' : 'Group'} ·{' '}
                          {channel.membersCount || 0} members
                        </p>
                      </div>
                      <span
                        className={[
                          'flex h-5 w-5 items-center justify-center rounded border-2',
                          isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      >
                        {isSelected ? (
                          <Check size={12} className="text-white" aria-hidden="true" />
                        ) : null}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-xs text-slate-500">
            {selected.length} channel{selected.length !== 1 ? 's' : ''} selected
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

export default TelegramChannels;