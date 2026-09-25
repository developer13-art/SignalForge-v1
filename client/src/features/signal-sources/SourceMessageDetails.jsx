import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, RefreshCw, Radio, Brain, Shield, Zap } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import SignalStatusBadge from '../../components/domain/signal/SignalStatusBadge';

const SourceMessageDetails = function SourceMessageDetails() {
  const { messageId } = useParams();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMessage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sources/messages/${messageId}`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load message');
        return;
      }
      setMessage(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [messageId]);

  useEffect(() => {
    fetchMessage();
  }, [fetchMessage]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  if (loading) {
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
          <ErrorState title="Failed to load message" description={error} onRetry={fetchMessage} />
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
          onClick={fetchMessage}
          disabled={loading}
          leadingIcon={RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Radio size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Message Details
              </Heading>
              <Text color="muted" className="text-xs">
                {message?.sourceName} · {message?.receivedAt}
              </Text>
            </div>
          </div>
          {message?.status ? <SignalStatusBadge status={message.status} size="md" /> : null}
        </div>

        <Separator spacing="md" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Original Message
          </p>
          <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
              {message?.text || 'No text content'}
            </p>
          </div>
        </div>

        <Separator spacing="md" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Classified As
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {message?.classification || '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Provider
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {message?.providerName || '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Confidence
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {message?.confidence !== undefined ? `${Math.round(message.confidence * 100)}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
              Processed
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {message?.processedAt || '—'}
            </p>
          </div>
        </div>

        {message?.parsedSignal ? (
          <>
            <Separator spacing="md" />
            <div>
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <Brain size={12} aria-hidden="true" />
                Parsed Signal
              </p>
              <pre className="mt-2 overflow-auto rounded-md bg-slate-900 p-3 text-xs text-slate-100">
                {JSON.stringify(message.parsedSignal, null, 2)}
              </pre>
            </div>
          </>
        ) : null}

        {message?.signalId ? (
          <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-indigo-600" aria-hidden="true" />
              <p className="text-xs text-slate-600">
                This message produced a signal that was processed by the pipeline.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/signals/${message.signalId}`)}
            >
              View Signal
            </Button>
          </div>
        ) : null}
      </Card>
    </Container>
  );
};

export default SourceMessageDetails;