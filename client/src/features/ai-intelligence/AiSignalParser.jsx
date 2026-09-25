import React, { useCallback, useState } from 'react';
import { Brain, Loader2, Zap, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import CodeBlock from '../../components/data-display/CodeBlock';
import SignalConfidenceBadge from '../../components/domain/signal/SignalConfidenceBadge';
import Badge from '../../components/common/Badge';

const SAMPLE_MESSAGES = [
  'Buy Gold now, SL 3350, TP 3360 and 3375',
  'EURUSD LONG @ 1.1050 Stop 1.1020 Target 1.1110',
  'Vender ouro agora',
  'Secure profit on gold',
  'Close half of the EURUSD trade',
];

const AiSignalParser = function AiSignalParser() {
  const [input, setInput] = useState(SAMPLE_MESSAGES[0]);
  const [parsing, setParsing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleParse = useCallback(async () => {
    setParsing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/ai/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text: input }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Failed to parse message');
        return;
      }

      setResult(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setParsing(false);
    }
  }, [input]);

  const handleSelectSample = useCallback((sample) => {
    setInput(sample);
    setResult(null);
    setError(null);
  }, []);

  return (
    <Container size="xl" className="py-6">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
          <Brain size={20} aria-hidden="true" />
        </span>
        <div>
          <Heading level={1} size="text-2xl">
            AI Signal Parser
          </Heading>
          <Text color="muted" className="text-xs">
            Test how the AI engine interprets any provider message
          </Text>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padding="lg">
          <Heading level={3} size="text-base">
            Input Message
          </Heading>
          <Text color="muted" className="mt-1 text-xs">
            Paste any signal or management message to test the parser.
          </Text>

          <Separator spacing="sm" />

          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            rows={6}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 font-mono text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            {SAMPLE_MESSAGES.map((sample, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSelectSample(sample)}
                className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700"
              >
                {sample.length > 30 ? `${sample.slice(0, 30)}...` : sample}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-end border-t border-slate-200 pt-4">
            <Button
              variant="primary"
              onClick={handleParse}
              disabled={parsing || !input.trim()}
              leadingIcon={parsing ? Loader2 : Zap}
            >
              {parsing ? 'Parsing...' : 'Parse Message'}
            </Button>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-center justify-between gap-3">
            <Heading level={3} size="text-base">
              Parse Result
            </Heading>
            {result?.confidence !== undefined ? (
              <SignalConfidenceBadge confidence={result.confidence} size="sm" showLabel />
            ) : null}
          </div>

          <Separator spacing="sm" />

          {parsing ? (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <Loader2 size={28} className="animate-spin" aria-hidden="true" />
              <p className="mt-3 text-xs">Running AI inference...</p>
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
              <p className="text-xs text-rose-800">{error}</p>
            </div>
          ) : result ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="info" size="sm">
                  Classification: {result.classification}
                </Badge>
                {result.providerDnaMatched ? (
                  <Badge variant="success" size="sm">
                    Provider DNA matched
                  </Badge>
                ) : (
                  <Badge variant="neutral" size="sm">
                    Full AI inference
                  </Badge>
                )}
              </div>

              <CodeBlock
                code={JSON.stringify(result.parsed || {}, null, 2)}
                language="json"
                size="sm"
                showCopy
              />

              {result.explanation ? (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-600">{result.explanation}</p>
                </div>
              ) : null}

              {result.rulesApplied && result.rulesApplied.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rules Applied
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {result.rulesApplied.map((rule, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2"
                      >
                        <CheckCircle2 size={12} className="text-emerald-600" aria-hidden="true" />
                        <span className="text-xs text-slate-700">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="flex flex-col items-center py-12 text-slate-400">
              <Sparkles size={28} aria-hidden="true" />
              <p className="mt-3 text-xs">Parse a message to see the result here</p>
            </div>
          )}
        </Card>
      </div>
    </Container>
  );
};

export default AiSignalParser;