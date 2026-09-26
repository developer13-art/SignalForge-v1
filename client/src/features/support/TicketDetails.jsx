import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Send, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';

const TicketDetails = function TicketDetails() {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);

  const fetchTicket = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load ticket');
        return;
      }
      setTicket(payload.data?.ticket);
      setMessages(payload.data?.messages || []);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchTicket();
  }, [fetchTicket]);

  const handleReply = useCallback(async () => {
    if (!reply.trim()) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch(`/api/support/tickets/${ticketId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message: reply }),
      });

      if (response.ok) {
        setReply('');
        fetchTicket();
      }
    } catch (_err) {
      // silent
    } finally {
      setSending(false);
    }
  }, [ticketId, reply, fetchTicket]);

  const handleBack = useCallback(() => navigate('/support/tickets'), [navigate]);

  if (loading && !ticket) {
    return (
      <Container size="lg" className="py-16">
        <div className="flex items-center justify-center text-slate-400">
          <Loader2 size={32} className="animate-spin" aria-hidden="true" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="lg" className="py-8">
        <Card padding="lg">
          <ErrorState title="Failed to load ticket" description={error} onRetry={fetchTicket} />
        </Card>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchTicket}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Heading level={1} size="text-2xl">
              {ticket?.subject}
            </Heading>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge variant="neutral" size="xs">
                {ticket?.category}
              </Badge>
              <Badge
                variant={
                  ticket?.status === 'resolved'
                    ? 'success'
                    : ticket?.status === 'open'
                    ? 'info'
                    : 'warning'
                }
                size="xs"
              >
                {ticket?.status}
              </Badge>
              <Badge
                variant={
                  ticket?.priority === 'critical' || ticket?.priority === 'high'
                    ? 'danger'
                    : 'neutral'
                }
                size="xs"
              >
                {ticket?.priority}
              </Badge>
              <span className="text-xs text-slate-500">Ticket #{ticket?.id}</span>
            </div>
          </div>
          <span className="text-xs text-slate-500">Opened {ticket?.createdAt}</span>
        </div>

        <Separator spacing="md" />

        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id || index}
              className={[
                'flex items-start gap-3',
                message.author === 'support' ? 'flex-row-reverse text-right' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <Avatar
                size="sm"
                src={message.avatarUrl}
                name={message.authorName}
                alt={message.authorName}
              />
              <div
                className={[
                  'max-w-[80%] rounded-lg border p-3',
                  message.author === 'support'
                    ? 'border-indigo-200 bg-indigo-50'
                    : 'border-slate-200 bg-white',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div
                  className={[
                    'flex items-center gap-2',
                    message.author === 'support' ? 'justify-end' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <p className="text-xs font-semibold text-slate-900">
                    {message.authorName}
                  </p>
                  <span className="text-[10px] text-slate-400">{message.time}</span>
                </div>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700">
                  {message.content}
                </p>
              </div>
            </div>
          ))}
        </div>

        {ticket?.status !== 'resolved' ? (
          <>
            <Separator spacing="md" />

            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Your reply
              </label>
              <textarea
                rows={3}
                value={reply}
                onChange={(event) => setReply(event.target.value)}
                placeholder="Type your response..."
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  variant="primary"
                  onClick={handleReply}
                  disabled={sending || !reply.trim()}
                  leadingIcon={sending ? Loader2 : Send}
                >
                  {sending ? 'Sending...' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold text-emerald-900">
              This ticket has been resolved
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              Open a new ticket if you need further assistance.
            </p>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default TicketDetails;