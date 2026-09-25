import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Brain, ArrowLeft, Loader2, TrendingUp } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import SignalConfidenceBadge from '../../components/domain/signal/SignalConfidenceBadge';
import CircularProgress from '../../components/common/CircularProgress';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';

const SignalConfidence = function SignalConfidence() {
  const { signalId } = useParams();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchConfidence = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/signals/${signalId}/confidence`, {
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
  }, [signalId]);

  useEffect(() => {
    fetchConfidence();
  }, [fetchConfidence]);

  const handleBack = useCallback(() => navigate(-1), [navigate]);

  return (
    <Container size="md" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Brain size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Signal Confidence
            </Heading>
            <Text color="muted" className="text-xs">
              Breakdown of the AI confidence score
            </Text>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <div className="mt-6 flex items-center justify-between gap-6">
              <CircularProgress
                value={data?.overallConfidence || 0}
                max={100}
                size="xl"
                color="primary"
                showValue
                thickness={8}
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <SignalConfidenceBadge confidence={data?.overallConfidence} size="md" />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {data?.summary || 'Confidence is computed from multiple signals of quality.'}
                </p>
              </div>
            </div>

            <Separator spacing="md" />

            <Heading level={3} size="text-base">
              Confidence Factors
            </Heading>

            <div className="mt-3 space-y-3">
              {(data?.factors || []).map((factor) => (
                <div key={factor.key}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600">{factor.label}</span>
                    <span className="font-semibold text-slate-900">
                      {Math.round(factor.score)}%
                    </span>
                  </div>
                  <ProgressBar
                    value={factor.score}
                    max={100}
                    size="sm"
                    variant={
                      factor.score >= 80
                        ? 'success'
                        : factor.score >= 60
                        ? 'primary'
                        : factor.score >= 40
                        ? 'warning'
                        : 'danger'
                    }
                    className="mt-1.5"
                  />
                  {factor.description ? (
                    <p className="mt-1 text-[11px] text-slate-500">{factor.description}</p>
                  ) : null}
                </div>
              ))}
            </div>

            <Separator spacing="md" />

            <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
              <TrendingUp size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
              <p className="text-xs text-slate-600">
                A confidence score is a decision input, not a guarantee of profitability. It
                reflects how reliably the platform understood the signal, not how successful the
                trade will be.
              </p>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default SignalConfidence;