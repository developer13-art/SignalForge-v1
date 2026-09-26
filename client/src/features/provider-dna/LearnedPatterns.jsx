import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ArrowLeft, Loader2, RefreshCw, CheckCircle2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import EmptyState from '../../components/common/EmptyState';
import Badge from '../../components/common/Badge';

const LearnedPatterns = function LearnedPatterns() {
  const navigate = useNavigate();
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatterns = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/patterns', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setPatterns(payload.data || []);
      }
    } catch (_err) {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatterns();
  }, [fetchPatterns]);

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
              <Brain size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                Learned Patterns
              </Heading>
              <Text color="muted" className="text-xs">
                All patterns and rules learned across every provider
              </Text>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={fetchPatterns}
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
        ) : patterns.length === 0 ? (
          <EmptyState
            icon={Brain}
            title="No patterns learned yet"
            description="Patterns are learned automatically as messages are processed."
          />
        ) : (
          <ul className="space-y-3">
            {patterns.map((pattern) => (
              <li
                key={pattern.id}
                className="rounded-lg border border-slate-200 bg-white p-3.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                        {pattern.pattern}
                      </span>
                      <Badge variant="info" size="xs">
                        {pattern.type}
                      </Badge>
                      {pattern.confidence !== undefined ? (
                        <span className="text-[10px] font-medium text-slate-500">
                          {Math.round(pattern.confidence * 100)}% confidence
                        </span>
                      ) : null}
                    </div>
                    {pattern.description ? (
                      <p className="mt-2 text-xs text-slate-500">{pattern.description}</p>
                    ) : null}
                  </div>

                  <CheckCircle2
                    size={14}
                    className="shrink-0 text-emerald-500"
                    aria-hidden="true"
                  />
                </div>

                {pattern.examples && pattern.examples.length > 0 ? (
                  <div className="mt-2.5 border-t border-slate-100 pt-2.5">
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Examples
                    </p>
                    <ul className="mt-1 space-y-0.5">
                      {pattern.examples.slice(0, 3).map((example, index) => (
                        <li key={index} className="truncate text-[11px] text-slate-600">
                          · {example}
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

export default LearnedPatterns;