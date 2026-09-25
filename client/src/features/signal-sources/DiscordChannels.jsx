import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Loader2, ChevronDown, ChevronRight, Check } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Alert from '../../components/feedback/Alert';
import EmptyState from '../../components/common/EmptyState';

const DiscordChannels = function DiscordChannels() {
  const navigate = useNavigate();
  const [guilds, setGuilds] = useState([]);
  const [selected, setSelected] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchGuilds = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sources/discord/guilds', {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setGuilds(payload.data || []);
        const initialSelected = [];
        payload.data?.forEach((guild) =>
          guild.channels?.forEach((channel) => {
            if (channel.selected) {
              initialSelected.push(channel.id);
            }
          }),
        );
        setSelected(initialSelected);
      } else {
        setError(payload?.error?.message || 'Failed to load servers');
      }
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  const handleBack = useCallback(() => navigate('/sources/discord'), [navigate]);

  const toggleChannel = useCallback((channelId) => {
    setSelected((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId],
    );
  }, []);

  const toggleExpanded = useCallback((guildId) => {
    setExpanded((prev) => ({ ...prev, [guildId]: !prev[guildId] }));
  }, []);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch('/api/sources/discord/channels', {
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
              Select Discord Channels
            </Heading>
            <Text color="muted" className="text-xs">
              Choose servers and channels SignalForge should monitor
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

        <div className="mt-4 space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
            </div>
          ) : guilds.length === 0 ? (
            <EmptyState
              title="No Discord servers"
              description="No servers are available for this Discord account."
            />
          ) : (
            guilds.map((guild) => {
              const isExpanded = expanded[guild.id] !== false;
              const channels = guild.channels || [];
              const selectedCount = channels.filter((c) => selected.includes(c.id)).length;

              return (
                <div
                  key={guild.id}
                  className="overflow-hidden rounded-lg border border-slate-200"
                >
                  <button
                    type="button"
                    onClick={() => toggleExpanded(guild.id)}
                    className="flex w-full items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-left"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-slate-400" aria-hidden="true" />
                      ) : (
                        <ChevronRight size={16} className="text-slate-400" aria-hidden="true" />
                      )}
                      <span className="text-sm font-semibold text-slate-900">{guild.name}</span>
                    </div>
                    <span className="text-xs text-slate-500">
                      {selectedCount}/{channels.length} selected
                    </span>
                  </button>

                  {isExpanded ? (
                    <ul className="divide-y divide-slate-200 bg-white">
                      {channels.map((channel) => {
                        const isSelected = selected.includes(channel.id);
                        return (
                          <li key={channel.id}>
                            <button
                              type="button"
                              onClick={() => toggleChannel(channel.id)}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-slate-50"
                            >
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
                              <span className="text-sm text-slate-700"># {channel.name}</span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                </div>
              );
            })
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

export default DiscordChannels;