import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const TrainingMessages = function TrainingMessages() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/training-messages', {
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
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleBack = useCallback(() => navigate('/ai/provider-dna'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Training Messages
              </Heading>
              <Text color="muted" className="text-xs">
                Historical messages used to learn Provider DNA
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
            Refresh
          </Button>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No training messages yet"
            description="Training messages are stored automatically as providers post signals."
          />
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <li
                key={message.id}
                className="rounded-lg border border-slate-200 bg-white p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {message.providerName}
                      </p>
                      <Badge variant="neutral" size="xs">
                        {message.messageType}
                      </Badge>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap rounded-md border border-slate-200 bg-slate-50 p-2.5 font-mono text-xs text-slate-700">
                      {message.text}
                    </p>
                  </div>
                </div>

                {message.extractedRules && message.extractedRules.length > 0 ? (
                  <div className="mt-2.5 border-t border-slate-100 pt-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Rules learned
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {message.extractedRules.map((rule, index) => (
                        <li key={index} className="text-[11px] text-slate-600">
                          · {rule}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default TrainingMessages;