import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Inbox, Loader2, RefreshCw, Search } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';

const SourceMessageInbox = function SourceMessageInbox() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sourceId = searchParams.get('sourceId');
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sourceId) {
        params.append('sourceId', sourceId);
      }
      if (search) {
        params.append('q', search);
      }

      const response = await fetch(`/api/sources/messages?${params.toString()}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setMessages(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [sourceId, search]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return (
    <Container size="xl" className="py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Inbox size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Source Message Inbox
            </Heading>
            <Text color="muted" className="text-xs">
              Raw messages received from your connected sources
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchMessages}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
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
            placeholder="Search messages"
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={24} className="animate-spin" aria-hidden="true" />
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={Inbox}
              title="No messages"
              description="Raw messages will appear here as your sources post them."
            />
          ) : (
            <ul className="space-y-2">
              {messages.map((message) => (
                <li key={message.id}>
                  <button
                    type="button"
                    onClick={() => navigate(`/sources/messages/${message.id}`)}
                    className="flex w-full flex-col items-start gap-1 rounded-lg border border-slate-200 bg-white p-3 text-left transition-colors hover:bg-slate-50"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-slate-900">
                        {message.sourceName}
                      </span>
                      <span className="shrink-0 text-[11px] text-slate-400">
                        {message.receivedAt}
                      </span>
                    </div>
                    <p className="line-clamp-2 text-xs text-slate-600">{message.text}</p>
                    <span className="mt-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
                      {message.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default SourceMessageInbox;