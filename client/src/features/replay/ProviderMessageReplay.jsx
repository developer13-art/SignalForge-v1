import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MessageSquare, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import CodeBlock from '../../components/data-display/CodeBlock';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const ProviderMessageReplay = function ProviderMessageReplay() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const messageId = searchParams.get('messageId');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReplay = useCallback(async () => {
    if (!messageId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/replay/provider-message/${messageId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    fetchReplay();
  }, [fetchReplay]);

  const handleBack = useCallback(() => navigate('/replay'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
          Back
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchReplay}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <MessageSquare size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider Message Replay
            </Heading>
            <Text color="muted" className="text-xs">
              {messageId ? `Message #${messageId}` : 'No message selected'}
            </Text>
          </div>
        </div>

        <div className="mt-6">
          {!messageId ? (
            <EmptyState
              icon={MessageSquare}
              title="No message selected"
              description="Return to the Replay Center and select a message to replay."
            />
          ) : loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
          ) : !data ? (
            <EmptyState
              icon={MessageSquare}
              title="No message found"
              description="The message does not exist or was not stored."
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Provider
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {data.providerName}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Source
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.source}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Received
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{data.receivedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    Classification
                  </p>
                  <div className="mt-1">
                    <Badge variant="info" size="xs">
                      {data.classification}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator spacing="md" />

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Original Message
                </p>
                <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="whitespace-pre-wrap text-sm text-slate-700">
                    {data.text}
                  </p>
                </div>
              </div>

              {data.parsed ? (
                <>
                  <Separator spacing="md" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Parsed Result
                    </p>
                    <CodeBlock
                      code={JSON.stringify(data.parsed, null, 2)}
                      language="json"
                      size="sm"
                      showCopy
                      className="mt-2"
                    />
                  </div>
                </>
              ) : null}
            </div>
          )}
        </div>
      </Card>
    </Container>
  );
};

export default ProviderMessageReplay;