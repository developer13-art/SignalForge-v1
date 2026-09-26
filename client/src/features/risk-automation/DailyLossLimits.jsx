import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingDown, ArrowLeft, Loader2, Save } from 'lucide-react';
import Container from '../../components/ui/primitives/Container';
import Card from '../../components/common/Card';
import Heading from '../../components/ui/primitives/Heading';
import Text from '../../components/ui/primitives/Text';
import Button from '../../components/common/Button';
import Separator from '../../components/common/Separator';
import FormField from '../../components/forms/FormField';
import CurrencyInput from '../../components/forms/CurrencyInput';
import ProgressBar from '../../components/common/ProgressBar';

const DailyLossLimits = function DailyLossLimits() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [maxDailyLoss, setMaxDailyLoss] = useState('');
  const [stopAtPercent, setStopAtPercent] = useState(100);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/risk/daily-loss', { credentials: 'include' });
      const payload = await response.json();
      if (response.ok) {
        setData(payload.data);
        setMaxDailyLoss(payload.data?.maxDailyLoss || 500);
        setStopAtPercent(payload.data?.stopAtPercent || 100);
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

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      await fetch('/api/risk/daily-loss', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ maxDailyLoss, stopAtPercent }),
      });
      navigate('/risk');
    } catch (_err) {
      // silent
    } finally {
      setSaving(false);
    }
  }, [maxDailyLoss, stopAtPercent, navigate]);

  const handleBack = useCallback(() => navigate('/risk'), [navigate]);

  const usagePercent = data?.maxDailyLoss
    ? Math.min(100, (data.dailyLossUsed / data.maxDailyLoss) * 100)
    : 0;

  return (
    <Container size="lg" className="py-6">
      <Button variant="ghost" size="sm" onClick={handleBack} leadingIcon={ArrowLeft}>
        Back
      </Button>

      <Card padding="lg" className="mt-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
            <TrendingDown size={20} aria-hidden="true" />
          </span>
          <div>
            <Heading level={1} size="text-2xl">
              Daily Loss Limits
            </Heading>
            <Text color="muted" className="text-xs">
              Maximum daily loss allowed before automated trading stops
            </Text>
          </div>
        </div>

        <Separator spacing="md" />

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-400">
            <Loader2 size={28} className="animate-spin" aria-hidden="true" />
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600">Today's usage</span>
                <span className="font-semibold text-slate-900">
                  ${data?.dailyLossUsed || 0} / ${data?.maxDailyLoss || 0}
                </span>
              </div>
              <ProgressBar
                value={usagePercent}
                max={100}
                size="md"
                variant={usagePercent > 70 ? 'danger' : usagePercent > 40 ? 'warning' : 'success'}
                className="mt-2"
              />
            </div>

            <div className="mt-6 space-y-4">
              <FormField
                label="Maximum Daily Loss"
                description="Automated trading stops when daily loss exceeds this amount"
              >
                {() => (
                  <CurrencyInput
                    value={maxDailyLoss}
                    onChange={(value) => setMaxDailyLoss(value)}
                    currency="USD"
                  />
                )}
              </FormField>

              <FormField
                label="Stop At (%)"
                description="Percentage of the limit at which trading is paused"
              >
                {({ id }) => (
                  <input
                    id={id}
                    type="range"
                    min={50}
                    max={100}
                    value={stopAtPercent}
                    onChange={(event) => setStopAtPercent(Number(event.target.value))}
                    className="w-full"
                  />
                )}
              </FormField>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>50%</span>
                <span className="font-semibold text-slate-900">{stopAtPercent}%</span>
                <span>100%</span>
              </div>
            </div>

            <div className="mt-8 flex justify-end border-t border-slate-200 pt-4">
              <Button variant="primary" onClick={handleSave} disabled={saving} leadingIcon={Save}>
                {saving ? 'Saving...' : 'Save Limits'}
              </Button>
            </div>
          </>
        )}
      </Card>
    </Container>
  );
};

export default DailyLossLimits;