import React, { useCallback, useEffect, useState } from 'react';
import { Brain, RefreshCw, Loader2 } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';
import TraderStyleBadge from '../../components/domain/trader/TraderStyleBadge';

const TradingStyleClassification = function TradingStyleClassification() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trader-intelligence/trading-style', {
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <Container size="lg" className="py-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Brain size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Trading Style Classification
            </Heading>
            <Text color="muted" className="text-xs">
              AI-classified trading style based on your behavior
            </Text>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          leadingIcon={loading ? Loader2 : RefreshCw}
        >
          Refresh
        </Button>
      </div>

      <Card padding="lg" className="mt-6">
        <Heading level={3} size="text-base">
          Primary Style
        </Heading>

        <div className="mt-4">
          {data?.primaryStyle ? (
            <TraderStyleBadge style={data.primaryStyle} size="lg" />
          ) : (
            <p className="text-sm text-slate-400">Not enough data yet.</p>
          )}
        </div>

        {data?.confidence !== undefined ? (
          <>
            <Separator spacing="md" />
            <div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Classification Confidence</span>
                <span className="font-semibold text-slate-900">{data.confidence}%</span>
              </div>
              <ProgressBar
                value={data.confidence}
                max={100}
                size="sm"
                variant="primary"
                className="mt-1.5"
              />
            </div>
          </>
        ) : null}

        {data?.styleBreakdown ? (
          <>
            <Separator spacing="md" />
            <Heading level={3} size="text-base">
              Style Breakdown
            </Heading>
            <div className="mt-3 space-y-3">
              {Object.entries(data.styleBreakdown).map(([key, value]) => (
                <div key={key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium capitalize text-slate-600">{key.replace(/_/g, ' ')}</span>
                    <span className="font-semibold text-slate-900">{value}%</span>
                  </div>
                  <ProgressBar
                    value={value}
                    max={100}
                    size="sm"
                    variant="primary"
                    className="mt-1.5"
                  />
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Card>
    </Container>
  );
};

export default TradingStyleClassification;