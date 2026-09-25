import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Sparkles, Loader2, ArrowLeft, Brain, Tag, Flag, Hash } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Badge from '../../components/common/Badge';
import ErrorState from '../../components/common/ErrorState';
import SignalConfidenceBadge from '../../components/domain/signal/SignalConfidenceBadge';

const SignalInterpretation = function SignalInterpretation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const signalId = searchParams.get('signalId');

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInterpretation = useCallback(async () => {
    if (!signalId) {
      setLoading(false);
      setError('No signal specified');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/signals/${signalId}/interpretation`, {
        credentials: 'include',
      });
      const payload = await response.json();
      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to load interpretation');
        return;
      }
      setData(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [signalId]);

  useEffect(() => {
    fetchInterpretation();
  }, [fetchInterpretation]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signal Interpretation
            </Heading>
            <Text color="muted" className="text-xs">
              Detailed breakdown of how the AI understood this signal
            </Text>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : error ? (
          <div className="mt-6">
            <ErrorState title="Failed to load" description={error} onRetry={fetchInterpretation} />
          </div>
        ) : (
          <>
            <Separator spacing="md" />

            <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Original Message
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{data?.originalText}</p>
            </div>

            <Separator spacing="md" />

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Detected Intent
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{data?.intent || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Language
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{data?.language || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Provider
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {data?.providerName || '—'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                  Confidence
                </p>
                <div className="mt-1">
                  <SignalConfidenceBadge confidence={data?.confidence} size="sm" />
                </div>
              </div>
            </div>

            {data?.extractedEntities && data.extractedEntities.length > 0 ? (
              <>
                <Separator spacing="md" />
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Tag size={12} aria-hidden="true" />
                    Extracted Entities
                  </p>
                  <ul className="mt-3 space-y-2">
                    {data.extractedEntities.map((entity, index) => (
                      <li
                        key={index}
                        className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-white px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                            {entity.type}
                          </span>
                          <span className="text-sm text-slate-700">{entity.text}</span>
                        </div>
                        <span className="font-mono text-xs text-slate-500">{entity.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}

            {data?.reasoning ? (
              <>
                <Separator spacing="md" />
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <Brain size={12} aria-hidden="true" />
                    Reasoning
                  </p>
                  <div className="mt-2 rounded-md border border-slate-200 bg-slate-50 p-3">
                    <p className="text-sm text-slate-700">{data.reasoning}</p>
                  </div>
                </div>
              </>
            ) : null}

            {data?.ambiguities && data.ambiguities.length > 0 ? (
              <>
                <Separator spacing="md" />
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-600">
                    <Flag size={12} aria-hidden="true" />
                    Detected Ambiguities
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {data.ambiguities.map((item, index) => (
                      <li key={index} className="text-xs text-amber-800">
                        · {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </>
        )}
      </Card>
    </Container>
  );
};

export default SignalInterpretation;