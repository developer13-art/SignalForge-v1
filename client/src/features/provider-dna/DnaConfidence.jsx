import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import ProgressBar from '../../components/common/ProgressBar';
import EmptyState from '../../components/common/EmptyState';

const DnaConfidence = function DnaConfidence() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/provider-dna/confidence', { credentials: 'include' });
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
              <Shield size={20} aria-hidden="true" />
            </span>
            <div>
              <Heading level={1} size="text-2xl">
                DNA Confidence
              </Heading>
              <Text color="muted" className="text-xs">
                How confident the platform is in each provider's learned rules
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

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (data?.providers || []).length === 0 ? (
          <EmptyState
            icon={Shield}
            title="No confidence data yet"
            description="DNA confidence grows as more signals are processed."
          />
        ) : (
          <ul className="space-y-4">
            {data.providers.map((provider) => (
              <li
                key={provider.providerId}
                className="rounded-lg border border-slate-200 bg-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{provider.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      {provider.rulesCount || 0} rules · Version {provider.version || 'v1'}
                    </p>
                  </div>
                  <span
                    className={[
                      'text-lg font-bold',
                      provider.confidence >= 85
                        ? 'text-emerald-600'
                        : provider.confidence >= 65
                        ? 'text-amber-600'
                        : 'text-rose-600',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {Math.round(provider.confidence)}%
                  </span>
                </div>

                <ProgressBar
                  value={provider.confidence}
                  max={100}
                  size="sm"
                  variant={
                    provider.confidence >= 85
                      ? 'success'
                      : provider.confidence >= 65
                      ? 'warning'
                      : 'danger'
                  }
                  className="mt-3"
                />

                <div className="mt-4 grid grid-cols-3 gap-3 border-t border-slate-100 pt-3 text-xs">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Fast Path
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {provider.fastPathRate || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      AI Fallback
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {provider.aiFallbackRate || 0}%
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Accuracy
                    </p>
                    <p className="mt-1 font-semibold text-slate-800">
                      {provider.accuracy || 0}%
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </Container>
  );
};

export default DnaConfidence;