import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dna, ArrowLeft, Loader2, Zap, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import Badge from '../../components/common/Badge';
import CodeBlock from '../../components/data-display/CodeBlock';
import SignalConfidenceBadge from '../../components/domain/signal/SignalConfidenceBadge';

const ProviderDnaTest = function ProviderDnaTest() {
  const navigate = useNavigate();
  const [providerId, setProviderId] = useState('');
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleTest = useCallback(async () => {
    setError(null);
    setResult(null);

    if (!providerId.trim()) {
      setError('Please enter a provider ID or name');
      return;
    }
    if (!message.trim()) {
      setError('Please enter a message to test');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ providerId, message }),
      });

      const payload = await response.json();

      if (!response.ok) {
        setError(payload?.error?.message || 'Test failed');
        return;
      }

      setResult(payload.data);
    } catch (_err) {
      setError('Unable to reach the server');
    } finally {
      setLoading(false);
    }
  }, [providerId, message]);

  const handleBack = useCallback(() => navigate('/ai/provider-dna'), [navigate]);

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Dna size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Provider DNA Test
            </Heading>
            <Text color="muted" className="text-xs">
              Test how the platform will parse a message using a provider's learned DNA
            </Text>
          </div>
        </div>

        <Separator spacing="md" />

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-slate-600">
              Provider ID or Name
            </label>
            <input
              type="text"
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              placeholder="e.g. 123 or Trader X"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600">Test Message</label>
            <textarea
              rows={4}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Paste a message to test how Provider DNA would parse it"
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-md border border-rose-200 bg-rose-50 p-3">
              <AlertCircle size={16} className="mt-0.5 shrink-0 text-rose-600" aria-hidden="true" />
              <p className="text-xs text-rose-800">{error}</p>
            </div>
          ) : null}

          <div className="flex justify-end border-t border-slate-200 pt-4">
            <Button
              variant="primary"
              onClick={handleTest}
              disabled={loading}
              leadingIcon={loading ? Loader2 : Zap}
            >
              {loading ? 'Testing...' : 'Run Test'}
            </Button>
          </div>
        </div>
      </Card>

      {result ? (
        <Card padding="lg" className="mt-6">
          <div className="flex items-center justify-between gap-3">
            <Heading level={3} size="text-base">
              Test Result
            </Heading>
            {result.confidence !== undefined ? (
              <SignalConfidenceBadge confidence={result.confidence} size="sm" showLabel />
            ) : null}
          </div>

          <Separator spacing="sm" />

          <div className="flex flex-wrap items-center gap-2">
            {result.fastPathUsed ? (
              <Badge variant="success" size="sm">
                <CheckCircle2 size={10} className="mr-1" aria-hidden="true" />
                Fast Path (DNA)
              </Badge>
            ) : (
              <Badge variant="warning" size="sm">
                <Sparkles size={10} className="mr-1" aria-hidden="true" />
                Learning Path (AI)
              </Badge>
            )}
            {result.classification ? (
              <Badge variant="info" size="sm">
                {result.classification}
              </Badge>
            ) : null}
          </div>

          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Parsed Output
            </p>
            <CodeBlock
              code={JSON.stringify(result.parsed || {}, null, 2)}
              language="json"
              size="sm"
              showCopy
              className="mt-2"
            />
          </div>

          {result.rulesApplied && result.rulesApplied.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Rules Applied
              </p>
              <ul className="mt-2 space-y-1.5">
                {result.rulesApplied.map((rule, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5"
                  >
                    <CheckCircle2
                      size={12}
                      className="mt-0.5 shrink-0 text-emerald-600"
                      aria-hidden="true"
                    />
                    <span className="text-xs text-slate-700">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {result.explanation ? (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-600">{result.explanation}</p>
            </div>
          ) : null}
        </Card>
      ) : null}
    </Container>
  );
};

export default ProviderDnaTest;